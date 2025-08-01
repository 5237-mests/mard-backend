import { prisma } from "../config/db";
import { TransferRequest, ITransferItem } from "../types/prisma";

export class TransferService {
  async listTransferRequests(filter: any = {}) {
    return await prisma.transferRequest.findMany({
      include: {
        requestedBy: true,
        approvedBy: true,
      },
      orderBy: { id: "desc" }
    });
  }

  async adminTransfer(
    fromId: number,
    toId: number,
    items: ITransferItem[],
    adminId: number
  ) {
    return await prisma.$transaction(async (tx) => {
      // Get admin user
      const admin = await tx.user.findUnique({ where: { id: adminId } });
      if (!admin) throw new Error("Admin user not found");

      // Create and immediately approve the transfer
      const transfer = await tx.transferRequest.create({
        data: {
          from: fromId,
          to: toId,
          items: items as any, // Cast to any to handle JSON type
          status: "APPROVED",
          requestedById: admin.id,
          approvedById: admin.id,
        },
      });

      // Update stock: decrement from sender, increment to receiver
      for (const item of items) {
        // Check if it's a shop item first
        const fromShopItem = await tx.shopItem.findFirst({
          where: { shopId: fromId, itemId: item.itemId }
        });

        if (fromShopItem) {
          // Update shop item quantity
          await tx.shopItem.update({
            where: { id: fromShopItem.id },
            data: { quantity: fromShopItem.quantity - item.quantity }
          });
        } else {
          // Check store item
          const fromStoreItem = await tx.storeItem.findFirst({
            where: { storeId: fromId, itemId: item.itemId }
          });
          if (fromStoreItem) {
            await tx.storeItem.update({
              where: { id: fromStoreItem.id },
              data: { quantity: fromStoreItem.quantity - item.quantity }
            });
          }
        }

        // Add to receiver
        const toShopItem = await tx.shopItem.findFirst({
          where: { shopId: toId, itemId: item.itemId }
        });

        if (toShopItem) {
          await tx.shopItem.update({
            where: { id: toShopItem.id },
            data: { quantity: toShopItem.quantity + item.quantity }
          });
        } else {
          const toStoreItem = await tx.storeItem.findFirst({
            where: { storeId: toId, itemId: item.itemId }
          });
          if (toStoreItem) {
            await tx.storeItem.update({
              where: { id: toStoreItem.id },
              data: { quantity: toStoreItem.quantity + item.quantity }
            });
          }
        }
      }

      return transfer;
    });
  }

  async createTransferRequest(fromId: number, toId: number, items: ITransferItem[], requesterId: number) {
    const requester = await prisma.user.findUnique({ where: { id: requesterId } });
    if (!requester) throw new Error("Requester user not found");

    return await prisma.transferRequest.create({
      data: {
        from: fromId,
        to: toId,
        items: items as any, // Cast to any to handle JSON type
        status: "PENDING",
        requestedById: requester.id,
      },
    });
  }

  async approveTransferRequest(requestId: number, approverId: number) {
    return await prisma.$transaction(async (tx) => {
      const transfer = await tx.transferRequest.findUnique({
        where: { id: requestId },
        include: {
          requestedBy: true,
          approvedBy: true,
        },
      });
      
      if (!transfer) throw new Error("Transfer request not found");
      if (transfer.status !== "PENDING") throw new Error("Transfer request is not pending");

      const approver = await tx.user.findUnique({ where: { id: approverId } });
      if (!approver) throw new Error("Approver user not found");

      // Update stock: decrement from sender, increment to receiver
      const transferItems = transfer.items as unknown as ITransferItem[];
      for (const item of transferItems) {
        // Decrement from sender
        const fromShopItem = await tx.shopItem.findFirst({
          where: { shopId: transfer.from, itemId: item.itemId }
        });

        if (fromShopItem) {
          await tx.shopItem.update({
            where: { id: fromShopItem.id },
            data: { quantity: fromShopItem.quantity - item.quantity }
          });
        } else {
          const fromStoreItem = await tx.storeItem.findFirst({
            where: { storeId: transfer.from, itemId: item.itemId }
          });
          if (fromStoreItem) {
            await tx.storeItem.update({
              where: { id: fromStoreItem.id },
              data: { quantity: fromStoreItem.quantity - item.quantity }
            });
          }
        }

        // Increment to receiver
        const toShopItem = await tx.shopItem.findFirst({
          where: { shopId: transfer.to, itemId: item.itemId }
        });

        if (toShopItem) {
          await tx.shopItem.update({
            where: { id: toShopItem.id },
            data: { quantity: toShopItem.quantity + item.quantity }
          });
        } else {
          const toStoreItem = await tx.storeItem.findFirst({
            where: { storeId: transfer.to, itemId: item.itemId }
          });
          if (toStoreItem) {
            await tx.storeItem.update({
              where: { id: toStoreItem.id },
              data: { quantity: toStoreItem.quantity + item.quantity }
            });
          }
        }
      }

      // Mark transfer as approved
      const updatedTransfer = await tx.transferRequest.update({
        where: { id: requestId },
        data: {
          status: "APPROVED",
          approvedById: approver.id,
        },
        include: {
          requestedBy: true,
          approvedBy: true,
        },
      });

      return updatedTransfer;
    });
  }

  async rejectTransferRequest(requestId: number, rejectorId: number) {
    return await prisma.$transaction(async (tx) => {
      const transfer = await tx.transferRequest.findUnique({
        where: { id: requestId },
        include: {
          requestedBy: true,
          approvedBy: true,
        },
      });
      
      if (!transfer) throw new Error("Transfer request not found");
      if (transfer.status !== "PENDING") throw new Error("Transfer request is not pending");

      const rejector = await tx.user.findUnique({ where: { id: rejectorId } });
      if (!rejector) throw new Error("Rejector user not found");

      const updatedTransfer = await tx.transferRequest.update({
        where: { id: requestId },
        data: {
          status: "REJECTED",
          approvedById: rejector.id,
        },
        include: {
          requestedBy: true,
          approvedBy: true,
        },
      });

      return updatedTransfer;
    });
  }
}
