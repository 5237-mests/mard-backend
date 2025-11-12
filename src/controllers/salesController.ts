import { Request, Response } from "express";
import { SalesService } from "../services/salesService";
import { SaleRequestBody } from "../types/database";

export class SalesController {
  static async createSale(req: Request, res: Response) {
    const { shopId, customerName, customerContact, items } =
      req.body as SaleRequestBody;

    // user_id from request
    const soldById = req?.user?.user.id;

    const token = req.headers.authorization?.split(" ")[1];

    if (
      !token ||
      !shopId ||
      !soldById ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const saleId = await SalesService.processSale(
        shopId,
        soldById,
        customerName || null,
        customerContact || null,
        items
      );
      res.status(201).json({ saleId, message: "Sale processed successfully" });
    } catch (error) {
      res.status(500).json({ error: `Failed to process sale: ${error}` });
    }
  }

  // static async getSales(req: Request, res: Response) {
  //   const { shopId } = req.query;

  //   if (!shopId || typeof shopId !== "string") {
  //     return res.status(400).json({ error: "Missing or invalid shopId" });
  //   }

  //   try {
  //     const sales = await SalesService.getSales(shopId);
  //     res.status(200).json(sales);
  //   } catch (error) {
  //     console.error("Error fetching sales:", error);
  //     res.status(500).json({ error: `Failed to fetch sales: ${error}` });
  //   }
  // }

  static async getSales(req: Request, res: Response) {
    const { shopId, startDate, endDate } = req.query;

    if (!shopId) {
      return res.status(400).json({ error: "Missing shopId" });
    }

    try {
      const salesHistory = await SalesService.getSales(
        shopId as string,
        startDate as string | undefined,
        endDate as string | undefined
      );
      res.json(salesHistory);
    } catch (error) {
      console.error("Error fetching sales history:", error);
      res
        .status(500)
        .json({ error: `Failed to fetch sales history: ${error}` });
    }
  }

  // get all sales for admin
  static async getAllSales(req: Request, res: Response) {
    try {
      const sales = await SalesService.getAllSales();
      res.status(200).json(sales);
    } catch (error) {
      console.error("Error fetching sales:", error);
      res.status(500).json({ error: `Failed to fetch sales: ${error}` });
    }
  }
}
