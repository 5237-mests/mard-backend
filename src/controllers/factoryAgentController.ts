// controllers/factoryAgentController.ts
import { Request, Response } from "express";
import factoryAgentService from "../services/factoryAgentService";
import {
  ItemQuery,
  NewProductRequest,
  RepurchaseRequest,
  RequestQuery,
} from "../types/database";

class FactoryAgentController {
  async getShopStock(
    req: Request<{ shop_id: string }, {}, {}, ItemQuery>,
    res: Response
  ) {
    try {
      const stock = await factoryAgentService.getShopStock(req.params.shop_id);
      res.json(stock);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Server error" });
    }
  }

  async createNewProductRequest(
    req: Request<{}, {}, NewProductRequest>,
    res: Response
  ) {
    try {
      const result = await factoryAgentService.createNewProductRequest(
        req.user!.id,
        req.body
      );
      res.json(result);
    } catch (error: any) {
      res
        .status(400)
        .json({ error: error.message || "Failed to submit recommendation" });
    }
  }

  async createRepurchaseRequest(
    req: Request<{}, {}, RepurchaseRequest>,
    res: Response
  ) {
    try {
      const result = await factoryAgentService.createRepurchaseRequest(
        req.user!.id,
        req.body
      );
      res.json(result);
    } catch (error: any) {
      res.status(400).json({
        error: error.message || "Failed to submit repurchase request",
      });
    }
  }

  async getRequests(req: Request<{}, {}, {}, RequestQuery>, res: Response) {
    try {
      const requests = await factoryAgentService.getRequests(
        req.user!.id,
        req.query
      );
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Server error" });
    }
  }
}

export default new FactoryAgentController();
