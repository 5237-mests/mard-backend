import { Request, Response } from "express";
import { itemRequestService } from "../services/itemRequestService";

// Expect authenticated req.user to exist; use your auth middleware
export const itemRequestController = {
  // POST /api/item-requests
  async createRequest(req: Request, res: Response) {
    try {
      const user_id = Number((req as any).user?.user.id ?? 0);
      if (!user_id) return res.status(401).json({ message: "Auth required" });

      // payload expected:
      // { items: [{ item_id, quantity }...], notes, source_type, source_id, destination_type, destination_id }
      const {
        items,
        notes,
        source_type,
        source_id,
        destination_type,
        destination_id,
      } = req.body;
      if (!Array.isArray(items) || items.length === 0)
        return res.status(400).json({ message: "items required" });
      if (!source_type || !destination_type)
        return res
          .status(400)
          .json({ message: "source and destination required" });

      const result = await itemRequestService.createRequest({
        source_type,
        source_id: Number(source_id),
        destination_type,
        destination_id: Number(destination_id),
        notes: notes ?? null,
        items,
        created_by: user_id,
      });

      res.status(201).json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Server error" });
    }
  },

  // GET /api/item-requests?status=...&source_type=...&source_id=...&page=...
  async listRequests(req: Request, res: Response) {
    try {
      const {
        status,
        source_type,
        source_id,
        destination_type,
        destination_id,
        page = "1",
        pageSize = "25",
        search,
      } = req.query;
      const opts = {
        status: typeof status === "string" && status ? status : undefined,
        source_type:
          typeof source_type === "string" && source_type
            ? source_type
            : undefined,
        source_id: source_id ? Number(source_id) : undefined,
        destination_type:
          typeof destination_type === "string" && destination_type
            ? destination_type
            : undefined,
        destination_id: destination_id ? Number(destination_id) : undefined,
        page: Math.max(1, Number(page) || 1),
        pageSize: Math.max(1, Number(pageSize) || 25),
        search:
          typeof search === "string" && search ? search.trim() : undefined,
      };
      const data = await itemRequestService.getRequests(opts);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Server error" });
    }
  },

  // GET /api/item-requests/:id
  async getRequest(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const data = await itemRequestService.getRequestById(id);
      res.json(data);
    } catch (err: any) {
      res.status(404).json({ message: err.message || "Not found" });
    }
  },

  // PATCH /api/item-requests/:id  -- update top-level fields (notes, status, destination)
  async updateRequest(req: Request, res: Response) {
    try {
      const user_id = Number((req as any).user?.user.id ?? 0);
      if (!user_id) return res.status(401).json({ message: "Auth required" });
      const id = Number(req.params.id);
      const patch = req.body; // allow notes, destination_type/id, status (but service validates)
      const out = await itemRequestService.updateRequest(id, user_id, patch);
      res.json(out);
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Cannot update" });
    }
  },

  // PATCH /api/item-requests/:id/items  -- update only provided items (quantity/note). body: { items: [{ item_id, quantity, note? }] }
  async updateItems(req: Request, res: Response) {
    try {
      const user_id = Number((req as any).user?.user.id ?? 0);
      if (!user_id) return res.status(401).json({ message: "Auth required" });
      const id = Number(req.params.id);
      const items = req.body?.items;
      if (!Array.isArray(items) || items.length === 0)
        return res.status(400).json({ message: "No items provided" });
      const updated = await itemRequestService.updateRequestItems(
        id,
        user_id,
        items
      );
      res.json({ message: "Items updated", updatedCount: updated });
    } catch (err: any) {
      res
        .status(400)
        .json({ message: err.message || "Could not update items" });
    }
  },

  // POST /api/item-requests/:id/approve  -- only ADMIN/STOREKEEPER; will create transfer and mark request approved
  async approveRequest(req: Request, res: Response) {
    try {
      const user_id = Number((req as any).user?.user.id ?? 0);
      if (!user_id) return res.status(401).json({ message: "Auth required" });
      const id = Number(req.params.id);
      const out = await itemRequestService.approveRequest(id, user_id);
      res.json({ message: "Approved", transferId: out.transferId ?? null });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Cannot approve" });
    }
  },

  // DELETE /api/item-requests/:id/items/:item_id
  async removeItemFromRequest(req: Request, res: Response) {
    try {
      const user_id = Number((req as any).user?.user.id ?? 0);
      if (!user_id) return res.status(401).json({ message: "Auth required" });
      const id = Number(req.params.id);
      const item_id = Number(req.params.item_id);
      await itemRequestService.removeRequestItem(id, item_id);
      res.json({ message: "Removed" });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Cannot remove" });
    }
  },

  // POST /api/item-requests/:id/reject
  async rejectRequest(req: Request, res: Response) {
    try {
      const user_id = Number((req as any).user?.user.id ?? 0);
      if (!user_id) return res.status(401).json({ message: "Auth required" });
      const id = Number(req.params.id);
      await itemRequestService.rejectRequest(id, user_id);
      res.json({ message: "Rejected" });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Cannot reject" });
    }
  },
};
