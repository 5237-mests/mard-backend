import { Request, Response } from "express";
import { storeReceiveService } from "../services/storeReceiveService";

/**
 * Controller for store receives.
 * Assumes auth middleware attaches user to req as (req as any).user
 */
export class storeReceiveController {
  public static async createReceive(req: Request, res: Response) {
    try {
      const { store_id, reference_no } = req.body;
      const userId = req.user?.user.id ?? null;
      if (!store_id)
        return res.status(400).json({ message: "store_id is required" });

      const id = await storeReceiveService.createReceive({
        store_id: Number(store_id),
        created_by_id: userId,
        reference_no: reference_no ?? null,
      });
      res.status(201).json({ id });
    } catch (error: any) {
      res
        .status(400)
        .json({ message: error.message || "Failed to create receive" });
    }
  }

  public static async addItems(req: Request, res: Response) {
    try {
      const receiveId = Number(req.params.id);
      const items = req.body.items;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "items array is required" });
      }
      await storeReceiveService.addItemsToReceive(receiveId, items);
      res.status(201).json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to add items" });
    }
  }

  public static async updateReceive(req: Request, res: Response) {
    try {
      const receiveId = Number(req.params.id);
      const updates = {
        store_id:
          req.body.store_id !== undefined
            ? Number(req.body.store_id)
            : undefined,
        reference_no:
          req.body.reference_no !== undefined
            ? req.body.reference_no
            : undefined,
      };
      await storeReceiveService.updateReceive(receiveId, updates);
      res.json({ success: true });
    } catch (error: any) {
      res
        .status(400)
        .json({ message: error.message || "Failed to update receive" });
    }
  }

  public static async updateReceiveItem(req: Request, res: Response) {
    try {
      const itemRowId = Number(req.params.itemId);
      const updates = {
        quantity:
          req.body.quantity !== undefined
            ? Number(req.body.quantity)
            : undefined,
        cost_price:
          req.body.cost_price !== undefined ? req.body.cost_price : undefined,
        note: req.body.note !== undefined ? req.body.note : undefined,
      };
      await storeReceiveService.updateReceiveItem(itemRowId, updates);
      res.json({ success: true });
    } catch (error: any) {
      res
        .status(400)
        .json({ message: error.message || "Failed to update receive item" });
    }
  }

  public static async deleteReceiveItem(req: Request, res: Response) {
    try {
      const itemRowId = Number(req.params.itemId);
      await storeReceiveService.deleteReceiveItem(itemRowId);
      res.status(204).send();
    } catch (error: any) {
      res
        .status(400)
        .json({ message: error.message || "Failed to delete receive item" });
    }
  }

  public static async getReceiveById(req: Request, res: Response) {
    try {
      const receiveId = Number(req.params.id);
      const row = await storeReceiveService.getReceiveById(receiveId);
      res.json(row);
    } catch (error: any) {
      res.status(404).json({ message: error.message || "Receive not found" });
    }
  }

  public static async listReceives(req: Request, res: Response) {
    try {
      const opts = {
        status: req.query.status as string | undefined,
        store_id: req.query.store_id ? Number(req.query.store_id) : undefined,
        fromDate: req.query.fromDate as string | undefined,
        toDate: req.query.toDate as string | undefined,
        search: req.query.search as string | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      };
      const result = await storeReceiveService.listReceives(opts);
      res.json(result);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: error.message || "Failed to list receives" });
    }
  }

  public static async approveReceive(req: Request, res: Response) {
    try {
      const receiveId = Number(req.params.id);
      const userId = req.user?.user.id ?? null;
      const ok = await storeReceiveService.approveReceive(receiveId, userId);
      res.json({ success: !!ok });
    } catch (error: any) {
      res
        .status(400)
        .json({ message: error.message || "Failed to approve receive" });
    }
  }

  public static async rejectReceive(req: Request, res: Response) {
    try {
      const receiveId = Number(req.params.id);
      const userId = req.user?.user.id ?? null;
      const note = req.body.note ?? null;
      const ok = await storeReceiveService.rejectReceive(
        receiveId,
        userId,
        note
      );
      res.json({ success: !!ok });
    } catch (error: any) {
      res
        .status(400)
        .json({ message: error.message || "Failed to reject receive" });
    }
  }

  public static async deleteReceive(req: Request, res: Response) {
    try {
      const receiveId = Number(req.params.id);
      await storeReceiveService.deleteReceive(receiveId);
      res.status(204).send();
    } catch (error: any) {
      res
        .status(400)
        .json({ message: error.message || "Failed to delete receive" });
    }
  }
}
