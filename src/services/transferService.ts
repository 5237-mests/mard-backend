import mongoose from "mongoose";
import TransferRequest from "../models/TransferRequest";
import ShopItem from "../models/ShopItem";
import StoreItem from "../models/StoreItem";

export class TransferService {
  async listTransferRequests(filter: any = {}) {
    return await TransferRequest.find(filter).sort({ createdAt: -1 });
  }

  async adminTransfer(
    fromId: string,
    toId: string,
    items: any[],
    adminId: string
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // Create and immediately approve the transfer
      const transfer = await TransferRequest.create(
        [
          {
            from: fromId,
            to: toId,
            items,
            status: "approved",
            requestedBy: adminId,
            approvedBy: adminId,
          },
        ],
        { session }
      );

      // Update stock: decrement from sender, increment to receiver
      for (const item of items) {
        if (
          await ShopItem.findOne({
            shopId: fromId,
            itemId: item.itemId,
          }).session(session)
        ) {
          await ShopItem.updateOne(
            { shopId: fromId, itemId: item.itemId },
            { $inc: { quantity: -item.quantity } },
            { session }
          );
        } else if (
          await StoreItem.findOne({
            storeId: fromId,
            itemId: item.itemId,
          }).session(session)
        ) {
          await StoreItem.updateOne(
            { storeId: fromId, itemId: item.itemId },
            { $inc: { quantity: -item.quantity } },
            { session }
          );
        }
        if (
          await ShopItem.findOne({ shopId: toId, itemId: item.itemId }).session(
            session
          )
        ) {
          await ShopItem.updateOne(
            { shopId: toId, itemId: item.itemId },
            { $inc: { quantity: item.quantity } },
            { session }
          );
        } else if (
          await StoreItem.findOne({
            storeId: toId,
            itemId: item.itemId,
          }).session(session)
        ) {
          await StoreItem.updateOne(
            { storeId: toId, itemId: item.itemId },
            { $inc: { quantity: item.quantity } },
            { session }
          );
        }
      }

      await session.commitTransaction();
      session.endSession();
      return transfer[0];
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
  async createTransferRequest(fromId: string, toId: string, items: any[]) {
    return await TransferRequest.create({
      from: fromId,
      to: toId,
      items,
      status: "pending",
      requestedBy: fromId,
    });
  }
  async approveTransferRequest(requestId: string, approverId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const transfer = await TransferRequest.findById(requestId).session(
        session
      );
      if (!transfer) throw new Error("Transfer request not found");
      if (transfer.status !== "pending")
        throw new Error("Transfer request is not pending");

      // Update stock: decrement from sender, increment to receiver
      for (const item of transfer.items) {
        // Decrement from sender
        if (
          await ShopItem.findOne({
            shopId: transfer.from,
            itemId: item.itemId,
          }).session(session)
        ) {
          await ShopItem.updateOne(
            { shopId: transfer.from, itemId: item.itemId },
            { $inc: { quantity: -item.quantity } },
            { session }
          );
        } else if (
          await StoreItem.findOne({
            storeId: transfer.from,
            itemId: item.itemId,
          }).session(session)
        ) {
          await StoreItem.updateOne(
            { storeId: transfer.from, itemId: item.itemId },
            { $inc: { quantity: -item.quantity } },
            { session }
          );
        }
        // Increment to receiver
        if (
          await ShopItem.findOne({
            shopId: transfer.to,
            itemId: item.itemId,
          }).session(session)
        ) {
          await ShopItem.updateOne(
            { shopId: transfer.to, itemId: item.itemId },
            { $inc: { quantity: item.quantity } },
            { session }
          );
        } else if (
          await StoreItem.findOne({
            storeId: transfer.to,
            itemId: item.itemId,
          }).session(session)
        ) {
          await StoreItem.updateOne(
            { storeId: transfer.to, itemId: item.itemId },
            { $inc: { quantity: item.quantity } },
            { session }
          );
        }
      }

      // Mark transfer as approved
      transfer.status = "approved";
      transfer.approvedBy = new mongoose.Types.ObjectId(approverId);
      await transfer.save({ session });

      await session.commitTransaction();
      session.endSession();
      return transfer;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
  async rejectTransferRequest(requestId: string, rejectorId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const transfer = await TransferRequest.findById(requestId).session(
        session
      );
      if (!transfer) throw new Error("Transfer request not found");
      if (transfer.status !== "pending")
        throw new Error("Transfer request is not pending");

      transfer.status = "rejected";
      transfer.approvedBy = new mongoose.Types.ObjectId(rejectorId);
      await transfer.save({ session });

      await session.commitTransaction();
      session.endSession();
      return transfer;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
