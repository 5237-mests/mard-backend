import { Request, Response } from "express";
import { inventoryAuditService } from "../services/inventoryAuditService";

export const inventoryAuditController = {
  async createAudit(req: Request, res: Response) {
    try {
      const result = await inventoryAuditService.createAudit(req.body);
      res.status(201).json(result);
    } catch (err: any) {
      res
        .status(400)
        .json({ message: err.message || "Failed to create audit" });
    }
  },

  async listAudits(req: Request, res: Response) {
    try {
      const audits = await inventoryAuditService.getAudits(req.query);
      res.json(audits);
    } catch (err: any) {
      res
        .status(500)
        .json({ message: err.message || "Failed to fetch audits" });
    }
  },

  async getAudit(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const audit = await inventoryAuditService.getAuditById(id);
      res.json(audit);
    } catch (err: any) {
      res.status(404).json({ message: err.message || "Audit not found" });
    }
  },
};
