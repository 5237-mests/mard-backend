import { Request, Response } from "express";
import { SalesService } from "../services/salesService";
import { SaleRequestBody, SaleQueryParams } from "../types/database";

export class SalesController {
  static async createSale(req: Request, res: Response) {
    const user = req.user!;
    // const body = plainToClass(SaleRequestBody, req.body);
    const body = req.body;

    try {
      const saleId = await SalesService.processSale(
        body.shopId,
        user.id,
        body.customerName ?? null,
        body.customerContact ?? null,
        body.items,
        body.status ?? "completed",
        body.tx_ref,
        body.totalDiscount ?? 0,
        body.totalTax ?? 0,
      );
      return res.status(201).json({
        success: true,
        saleId,
        message: "Sale created successfully",
      });
    } catch (err: any) {
      const status = err.message.includes("Insufficient")
        ? 409
        : err.message.includes("not a member")
          ? 403
          : 500;
      return res.status(status).json({
        success: false,
        error: err.message,
      });
    }
  }

  static async getSales(req: Request, res: Response) {
    const user = req.user!;
    const {
      shopId,
      startDate,
      endDate,
      page = "1",
      limit = "20",
      status,
      search,
      sortBy = "created_at",
      sortOrder = "desc",
    } = req.query;

    if (
      shopId &&
      !(await SalesService.userBelongsToShop(user.id, shopId as string)) &&
      !user.roles.includes("ADMIN")
    ) {
      return res
        .status(403)
        .json({ success: false, error: "Not authorized for this shop." });
    }

    const params: SaleQueryParams = {
      shopId: shopId as string | undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
      page: parseInt(page as string, 10) || 1,
      limit: Math.min(parseInt(limit as string, 10) || 20, 100),
      status: status as string | undefined,
      search: search as string | undefined,
      sortBy: sortBy as string,
      sortOrder: sortOrder as "asc" | "desc",
    };

    try {
      const result = await SalesService.getSalesPaginated(params);
      return res.json({
        success: true,
        data: result.sales,
        pagination: result.pagination,
        summary: result.summary,
      });
    } catch (err: any) {
      console.log("err: ", err);
      return res
        .status(500)
        .json({ success: false, error: "Failed to fetch sales *" });
    }
  }

  // static async getAllSales(req: Request, res: Response) {
  //   // if (!req.user?.roles.includes("ADMIN")) {
  //   //   return res
  //   //     .status(403)
  //   //     .json({ success: false, error: "Admin access required" });
  //   // }
  //   return getSales(req, res); // Reuse with shopId undefined
  // }.

  static async getSaleById(req: Request, res: Response) {
    // const user = req.user!;
    const { id } = req.params;
    try {
      const sale = await SalesService.getSaleById(Number(id));
      if (!sale)
        return res
          .status(404)
          .json({ success: false, error: "Sale not found" });

      // if (
      //   !user.roles.includes("ADMIN") &&
      //   !(await SalesService.userBelongsToShop(
      //     user.id,
      //     sale.shop_id.toString(),
      //   ))
      // ) {
      //   return res
      //     .status(403)
      //     .json({ success: false, error: "Not authorized to view this sale" });
      // }

      return res.json({ success: true, data: sale });
    } catch (err: any) {
      console.log("err: ", err);
      return res
        .status(500)
        .json({ success: false, error: "Failed to fetch sale" });
    }
  }

  // New: Refund (including partial)
  static async refundSale(req: Request, res: Response) {
    const { saleId, tx_ref, partialItems } = req.body; // partialItems: array of {itemId: number, quantity: number}

    try {
      // await SalesService.refundSale({ saleId, tx_ref }, partialItems);
      return res.json({ success: true, message: "Refund processed" });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }
}
