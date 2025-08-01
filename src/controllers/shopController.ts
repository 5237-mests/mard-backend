import { Request, Response } from "express";
import { ShopService } from "../services/shopService";

export const processSale = async (req: Request, res: Response) => {
  const { items } = req.body;
  const shopId = req.user.id;
  const soldBy = req.user.id;
  const shopService = new ShopService();
  try {
    await shopService.processSale(shopId, items, soldBy);
    res
      .status(200)
      .json({
        message: "Sale processed, inventory updated, and sale recorded.",
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating inventory or recording sale", error });
  }
};

export const getSales = async (req: Request, res: Response) => {
  const shopId = req.user.id;
  const { date, week, month, year, itemId, allProducts } = req.query;
  let filter: any = {};
  if (!allProducts) {
    filter.shopId = shopId;
  }

  if (date) {
    const start = new Date(date as string);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    filter.soldAt = { $gte: start, $lt: end };
  } else if (week && year) {
    const firstDayOfYear = new Date(Number(year), 0, 1);
    const start = new Date(firstDayOfYear);
    start.setDate(firstDayOfYear.getDate() + (Number(week) - 1) * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    filter.soldAt = { $gte: start, $lt: end };
  } else if (month && year) {
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 1);
    filter.soldAt = { $gte: start, $lt: end };
  } else if (year) {
    const start = new Date(Number(year), 0, 1);
    const end = new Date(Number(year) + 1, 0, 1);
    filter.soldAt = { $gte: start, $lt: end };
  }

  const shopService = new ShopService();
  try {
    const sales = await shopService.getSales(
      filter,
      itemId as string | undefined
    );
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sales records", error });
  }
};
