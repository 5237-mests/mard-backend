import { Request, Response } from "express";
import { deadstockService } from "../services/deadstockService";

export const deadstockController = {
  async report(req: Request, res: Response) {
    try {
      const input = req.body;
      // optionally extract user id from req.user if auth middleware attaches it
      // const user_id = (req as any).user?.id ?? null;
      const user_id = req.user.user.id;
      const id = await deadstockService.reportDeadstock({ ...input, user_id });
      res.status(201).json({ id });
    } catch (err: any) {
      res
        .status(400)
        .json({ message: err.message || "Failed to report deadstock" });
    }
  },

  async list(req: Request, res: Response) {
    try {
      const opts = {
        status: req.query.status as string | undefined,
        sourceType: req.query.sourceType as string | undefined,
        fromDate: req.query.fromDate as string | undefined,
        toDate: req.query.toDate as string | undefined,
        search: req.query.search as string | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      };
      const result = await deadstockService.getAllDeadstock(opts);
      res.json(result);
    } catch (err: any) {
      res
        .status(500)
        .json({ message: err.message || "Failed to list deadstock" });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const row = await deadstockService.getDeadstockById(id);
      res.json(row);
    } catch (err: any) {
      res.status(404).json({ message: err.message || "Not found" });
    }
  },

  async resolve(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const action =
        (req.body.action as "resolved" | "discarded") || "resolved";
      const notes = req.body.notes as string | undefined;
      await deadstockService.resolveDeadstock(
        id,
        action,
        notes,
        (req as any).user?.id
      );
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Failed to update" });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await deadstockService.deleteDeadstock(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Failed to delete" });
    }
  },
};
