import { Request, Response } from "express";
import { refundService } from "../services/refundService";

export const refundController = {
  async createRefund(req: Request, res: Response) {
    try {
      const user_id = Number(req?.user?.user?.id);
      const payload = req.body;
      const result = await refundService.createRefund({
        ...payload,
        refunded_by: user_id,
      });
      res.status(201).json(result);
    } catch (err: any) {
      res
        .status(400)
        .json({ message: err.message || "Failed to create refund" });
    }
  },

  // create refund using sale_id and make sale status refunded
  async createRefundFromSaleId(req: Request, res: Response) {
    try {
      const user_id = Number(req?.user?.user?.id);
      const { sale_id, shop_id, payment_method, status, reason } = req.body;
      const result = await refundService.createRefundFromSaleId(
        sale_id,
        shop_id,
        user_id,
        payment_method,
        status === undefined ? "completed" : status,
        reason
      );
      res.status(201).json(result);
    } catch (err: any) {
      res
        .status(400)
        .json({ message: err.message || "Failed to create refund" });
    }
  },

  async listRefunds(req: Request, res: Response) {
    try {
      const refunds = await refundService.getRefunds(req.query);
      res.json(refunds);
    } catch (err: any) {
      res
        .status(500)
        .json({ message: err.message || "Failed to fetch refunds" });
    }
  },

  async getRefund(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const refund = await refundService.getRefundById(id);
      res.json(refund);
    } catch (err: any) {
      res.status(404).json({ message: err.message || "Refund not found" });
    }
  },
};
