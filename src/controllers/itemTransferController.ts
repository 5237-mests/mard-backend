import { Request, Response } from "express";
import { itemTransferService } from "../services/itemTransferService";

export const itemTransferController = {
  async createTransfer(req: Request, res: Response): Promise<void> {
    try {
      const { fromType, fromId, toType, toId, items } = req.body;

      if (!fromType || !fromId || !toType || !toId || !items?.length) {
        res.status(400).json({ message: "Invalid transfer data" });
        return;
      }

      const transferId = await itemTransferService.createTransfer({
        fromType,
        fromId: Number(fromId),
        toType,
        toId: Number(toId),
        items,
      });

      res
        .status(201)
        .json({ message: "Transfer created successfully", id: transferId });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  async getAllTransfers(req: Request, res: Response): Promise<void> {
    try {
      const transfers = await itemTransferService.getAllTransfers();
      res.json(transfers);
    } catch (error: any) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  async getTransferById(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const transfer = await itemTransferService.getTransferById(id);
      res.json(transfer);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  },

  // transfer all item from shop to store
  async transferAllShopItemToStore(req: Request, res: Response): Promise<void> {
    try {
      const user_id = Number(req?.user?.user.id);
      // Accept either params or body for ids to be flexible with routes
      const shopId = Number(req.params.shopId ?? req.body.shopId);
      const storeId = Number(req.params.storeId ?? req.body.storeId);

      if (!Number.isInteger(shopId) || !Number.isInteger(storeId)) {
        res.status(400).json({
          message: "shopId and storeId are required and must be integers.",
        });
        return;
      }

      const transferId = await itemTransferService.transferAllShopItemToStore(
        shopId,
        storeId,
        user_id
      );

      if (transferId === 0) {
        // Nothing to transfer
        res.status(200).json({ message: "No items to transfer." });
        return;
      }

      res
        .status(201)
        .json({ message: "Transfer created successfully", id: transferId });
    } catch (error: any) {
      console.error("transferAllShopItemToStore error:", error);
      // Propagate not-found errors as 404
      if (error.message && /not found/i.test(error.message)) {
        res.status(404).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
};
