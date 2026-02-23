// import { Request, Response } from "express";
// import { inventoryAuditService } from "../services/inventoryAuditService";

// export const inventoryAuditController = {
//   async createAudit(req: Request, res: Response) {
//     try {
//       const result = await inventoryAuditService.createAudit(req.body);
//       res.status(201).json(result);
//     } catch (err: any) {
//       res
//         .status(400)
//         .json({ message: err.message || "Failed to create audit" });
//     }
//   },

//   async listAudits(req: Request, res: Response) {
//     try {
//       const audits = await inventoryAuditService.getAudits(req.query);
//       res.json(audits);
//     } catch (err: any) {
//       res
//         .status(500)
//         .json({ message: err.message || "Failed to fetch audits" });
//     }
//   },

//   async getAudit(req: Request, res: Response) {
//     try {
//       const id = Number(req.params.id);
//       const audit = await inventoryAuditService.getAuditById(id);
//       res.json(audit);
//     } catch (err: any) {
//       res.status(404).json({ message: err.message || "Audit not found" });
//     }
//   },
// };

import { Request, Response } from "express";
import { inventoryAuditService } from "../services/inventoryAuditService";

export const inventoryAuditController = {
  async createAudit(req: Request, res: Response) {
    try {
      const result = await inventoryAuditService.createAudit(req.body);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      console.error("[createAudit] Error:", err);
      res.status(400).json({
        success: false,
        message: err.message || "Failed to create audit",
      });
    }
  },

  async listAudits(req: Request, res: Response) {
    try {
      const filters: any = {
        location_type: req.query.location_type as string | undefined,
        location_id: req.query.location_id
          ? Number(req.query.location_id)
          : undefined,
        item_id: req.query.item_id ? Number(req.query.item_id) : undefined,
        txn_type: req.query.txn_type as string | undefined,
        start_date: req.query.date_from as string | undefined, // ← match frontend naming
        end_date: req.query.date_to as string | undefined, // ← match frontend naming
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
      };

      // Clean up undefined values
      Object.keys(filters).forEach(
        (key) => filters[key] === undefined && delete filters[key],
      );

      const result = await inventoryAuditService.getAudits(filters);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (err: any) {
      console.error("[listAudits] Error:", err);
      res.status(500).json({
        success: false,
        message: err.message || "Failed to fetch audits",
      });
    }
  },

  async getAudit(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid audit ID",
        });
      }

      const audit = await inventoryAuditService.getAuditById(id);

      res.json({
        success: true,
        data: audit,
      });
    } catch (err: any) {
      console.error("[getAudit] Error:", err);
      const status = err.message?.includes("not found") ? 404 : 500;
      res.status(status).json({
        success: false,
        message: err.message || "Failed to fetch audit",
      });
    }
  },

  // You can keep deleteAudit if needed for admin/testing, but it's commented by default
  // async deleteAudit(req: Request, res: Response) { ... }
};
