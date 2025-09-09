// controllers/retailerController.ts
import { Request, Response } from "express";
import retailerService from "../services/retailerService";
import { ItemQuery, CreateOrderInput } from "../types/database";

class RetailerController {
  async getItems(req: Request, res: Response) {
    try {
      const items = await retailerService.getItems();
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Server error" });
    }
  }

  async createOrder(req: Request, res: Response) {
    if (!req.body.items || !Array.isArray(req.body.items)) {
      return res.status(400).json({ error: "Items must be a non-empty array" });
    }

    try {
      const result = await retailerService.createOrder(
        req.user.user!.id,
        req.body
      );
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to place order" });
    }
  }

  async getOrders(req: Request, res: Response) {
    try {
      const userId = req.user.user.id;
      const orders = await retailerService.getOrders(userId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Server error" });
    }
  }
}

export default new RetailerController();
