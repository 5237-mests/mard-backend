import { AppDataSource } from "../config/db";
import TransferRequest from "../models/TransferRequest";
import ShopItem from "../models/ShopItem";
import StoreItem from "../models/StoreItem";
import User from "../models/user";

export class TransferService {
  async listTransferRequests(filter: any = {}) {
    const transferRepository = AppDataSource.getRepository(TransferRequest);
    return await transferRepository.find({
      relations: ["requestedBy", "approvedBy"],
      order: { id: "DESC" }
    });
  }

  async adminTransfer(
    fromId: number,
    toId: number,
    items: any[],
    adminId: number
  ) {
    return await AppDataSource.transaction(async manager => {
      const transferRepository = manager.getRepository(TransferRequest);
      const shopItemRepository = manager.getRepository(ShopItem);
      const storeItemRepository = manager.getRepository(StoreItem);
      const userRepository = manager.getRepository(User);

      // Get admin user
      const admin = await userRepository.findOne({ where: { id: adminId } });
      if (!admin) throw new Error("Admin user not found");

      // Create and immediately approve the transfer
      const transfer = await transferRepository.save({
        from: fromId,
        to: toId,
        items,
        status: "approved",
        requestedBy: admin,
        approvedBy: admin,
      });

      // Update stock: decrement from sender, increment to receiver
      for (const item of items) {
        // Check if it's a shop item first
        const fromShopItem = await shopItemRepository.findOne({
          where: { shop: { id: fromId }, item: { id: item.itemId } }
        });

        if (fromShopItem) {
          // Update shop item quantity
          await shopItemRepository.update(
            { shop: { id: fromId }, item: { id: item.itemId } },
            { quantity: fromShopItem.quantity - item.quantity }
          );
        } else {
          // Check store item
          const fromStoreItem = await storeItemRepository.findOne({
            where: { store: { id: fromId }, item: { id: item.itemId } }
          });
          if (fromStoreItem) {
            await storeItemRepository.update(
              { store: { id: fromId }, item: { id: item.itemId } },
              { quantity: fromStoreItem.quantity - item.quantity }
            );
          }
        }

        // Add to receiver
        const toShopItem = await shopItemRepository.findOne({
          where: { shop: { id: toId }, item: { id: item.itemId } }
        });

        if (toShopItem) {
          await shopItemRepository.update(
            { shop: { id: toId }, item: { id: item.itemId } },
            { quantity: toShopItem.quantity + item.quantity }
          );
        } else {
          const toStoreItem = await storeItemRepository.findOne({
            where: { store: { id: toId }, item: { id: item.itemId } }
          });
          if (toStoreItem) {
            await storeItemRepository.update(
              { store: { id: toId }, item: { id: item.itemId } },
              { quantity: toStoreItem.quantity + item.quantity }
            );
          }
        }
      }

      return transfer;
    });
  }

  async createTransferRequest(fromId: number, toId: number, items: any[], requesterId: number) {
    const transferRepository = AppDataSource.getRepository(TransferRequest);
    const userRepository = AppDataSource.getRepository(User);

    const requester = await userRepository.findOne({ where: { id: requesterId } });
    if (!requester) throw new Error("Requester user not found");

    return await transferRepository.save({
      from: fromId,
      to: toId,
      items,
      status: "pending",
      requestedBy: requester,
    });
  }

  async approveTransferRequest(requestId: number, approverId: number) {
    return await AppDataSource.transaction(async manager => {
      const transferRepository = manager.getRepository(TransferRequest);
      const shopItemRepository = manager.getRepository(ShopItem);
      const storeItemRepository = manager.getRepository(StoreItem);
      const userRepository = manager.getRepository(User);

      const transfer = await transferRepository.findOne({
        where: { id: requestId },
        relations: ["requestedBy", "approvedBy"]
      });
      
      if (!transfer) throw new Error("Transfer request not found");
      if (transfer.status !== "pending") throw new Error("Transfer request is not pending");

      const approver = await userRepository.findOne({ where: { id: approverId } });
      if (!approver) throw new Error("Approver user not found");

      // Update stock: decrement from sender, increment to receiver
      for (const item of transfer.items) {
        // Decrement from sender
        const fromShopItem = await shopItemRepository.findOne({
          where: { shop: { id: transfer.from }, item: { id: item.itemId } }
        });

        if (fromShopItem) {
          await shopItemRepository.update(
            { shop: { id: transfer.from }, item: { id: item.itemId } },
            { quantity: fromShopItem.quantity - item.quantity }
          );
        } else {
          const fromStoreItem = await storeItemRepository.findOne({
            where: { store: { id: transfer.from }, item: { id: item.itemId } }
          });
          if (fromStoreItem) {
            await storeItemRepository.update(
              { store: { id: transfer.from }, item: { id: item.itemId } },
              { quantity: fromStoreItem.quantity - item.quantity }
            );
          }
        }

        // Increment to receiver
        const toShopItem = await shopItemRepository.findOne({
          where: { shop: { id: transfer.to }, item: { id: item.itemId } }
        });

        if (toShopItem) {
          await shopItemRepository.update(
            { shop: { id: transfer.to }, item: { id: item.itemId } },
            { quantity: toShopItem.quantity + item.quantity }
          );
        } else {
          const toStoreItem = await storeItemRepository.findOne({
            where: { store: { id: transfer.to }, item: { id: item.itemId } }
          });
          if (toStoreItem) {
            await storeItemRepository.update(
              { store: { id: transfer.to }, item: { id: item.itemId } },
              { quantity: toStoreItem.quantity + item.quantity }
            );
          }
        }
      }

      // Mark transfer as approved
      transfer.status = "approved";
      transfer.approvedBy = approver;
      await transferRepository.save(transfer);

      return transfer;
    });
  }

  async rejectTransferRequest(requestId: number, rejectorId: number) {
    return await AppDataSource.transaction(async manager => {
      const transferRepository = manager.getRepository(TransferRequest);
      const userRepository = manager.getRepository(User);

      const transfer = await transferRepository.findOne({
        where: { id: requestId },
        relations: ["requestedBy", "approvedBy"]
      });
      
      if (!transfer) throw new Error("Transfer request not found");
      if (transfer.status !== "pending") throw new Error("Transfer request is not pending");

      const rejector = await userRepository.findOne({ where: { id: rejectorId } });
      if (!rejector) throw new Error("Rejector user not found");

      transfer.status = "rejected";
      transfer.approvedBy = rejector;
      await transferRepository.save(transfer);

      return transfer;
    });
  }
}
