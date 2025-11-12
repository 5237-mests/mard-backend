import { Request, Response } from "express";
import { itemRequestService } from "../services/itemRequestService";

export const itemRequestController = {
  async createRequest(req: Request, res: Response) {
    try {
      const user_id = req.user?.user?.id;
      if (!user_id) return res.status(401).json({ message: "Auth required" });
      const { shop_id, store_id, items } = req.body;
      if (
        !shop_id ||
        !store_id ||
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return res.status(400).json({ message: "Invalid payload." });
      }
      const result = await itemRequestService.createRequest({
        shop_id: Number(shop_id),
        store_id: Number(store_id),
        items,
        created_by: user_id,
      });
      res.status(201).json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Server error" });
    }
  },

  async listRequests(req: Request, res: Response) {
    try {
      const { status, shop_id, store_id, page, pageSize, search } = req.query;
      const opts = {
        status: typeof status === "string" ? status : undefined,
        shop_id: shop_id ? Number(shop_id) : undefined,
        store_id: store_id ? Number(store_id) : undefined,
        page: page ? Number(page) : 1,
        pageSize: pageSize ? Number(pageSize) : 25,
        search: typeof search === "string" ? search : undefined,
      };
      const data = await itemRequestService.getRequests(opts);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Server error" });
    }
  },

  async getRequest(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const data = await itemRequestService.getRequestById(id);
      res.json(data);
    } catch (err: any) {
      res.status(404).json({ message: err.message || "Not found" });
    }
  },

  async approveRequest(req: Request, res: Response) {
    try {
      const user_id = req.user?.user?.id;
      if (!user_id) return res.status(401).json({ message: "Auth required" });
      const id = Number(req.params.id);
      const result = await itemRequestService.approveRequest(id, user_id);
      res.json({ message: "Approved", transferId: result.transferId });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Cannot approve" });
    }
  },

  async updateRequest(req: Request, res: Response) {
    try {
      const user_id = Number((req as any).user?.user?.id ?? 0);
      if (!user_id) return res.status(401).json({ message: "Auth required" });
      const id = Number(req.params.id);
      const patch = req.body;
      const result = await itemRequestService.updateRequest(id, user_id, {
        items: patch,
        status: "approved",
      });
      // console.log("Result: ", result);
      res.json({ message: "Updated" });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Cannot update" });
    }
  },

  // remove item from item request
  async removeItemFromRequest(req: Request, res: Response) {
    try {
      const user_id = req.user?.user?.id;
      if (!user_id) return res.status(401).json({ message: "Auth required" });
      const id = Number(req.params.id);
      const item_id = Number(req.params.item_id);
      await itemRequestService.removeRequestItem(id, item_id);
      res.json({ message: "Removed" });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Cannot remove" });
    }
  },

  // reject item request
  async rejectRequest(req: Request, res: Response) {
    try {
      const user_id = req.user?.user?.id;
      if (!user_id) return res.status(401).json({ message: "Auth required" });
      const id = Number(req.params.id);
      await itemRequestService.rejectRequest(id, user_id);
      res.json({ message: "Rejected" });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Cannot reject" });
    }
  },
};
