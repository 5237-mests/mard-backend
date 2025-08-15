import { Request, Response } from "express";
import { ShopService } from "../services/shopService";

export class ShopController {
  /**
   * Creates a new shop.
   * @param req The HTTP request object.
   * @param res The HTTP response object.
   * @returns A Promise that resolves when the shop is created.
   * @throws Will return a 400 error if name or location is missing from the request body.
   * @throws Will return a 500 error if there is an error creating the shop.
   */
  public static async createShop(req: Request, res: Response) {
    const { name, location } = req.body;
    if (!name || !location) {
      res.status(400).json({ message: "Name and location are required." });
      return;
    }

    try {
      const newShop = await ShopService.createShop(name, location);
      res.status(201).json(newShop);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async getShops(_req: Request, res: Response) {
    try {
      const shops = await ShopService.getShops();
      res.status(200).json(shops);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async getShopById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const shop = await ShopService.getShopById(parseInt(id, 10));
      if (!shop) {
        res.status(404).json({ message: "Shop not found." });
        return;
      }
      res.status(200).json(shop);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async updateShop(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { name, location } = req.body;
    try {
      const updatedShop = await ShopService.updateShop(
        parseInt(id, 10),
        name,
        location
      );
      if (!updatedShop) {
        res.status(404).json({ message: "Shop not found." });
        return;
      }
      res.status(200).json(updatedShop);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async deleteShop(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const success = await ShopService.deleteShop(parseInt(id, 10));
      if (!success) {
        res.status(404).json({ message: "Shop not found." });
        return;
      }
      res.status(200).json({ message: "Shop deleted successfully." });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

// export const processSale = async (req: Request, res: Response) => {
//   const { items } = req.body;
//   const shopId = req.user.id;
//   const soldBy = req.user.id;
//   const shopService = new ShopService();
//   try {
//     await shopService.processSale(shopId, items, soldBy);
//     res
//       .status(200)
//       .json({
//         message: "Sale processed, inventory updated, and sale recorded.",
//       });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error updating inventory or recording sale", error });
//   }
// };

// export const getSales = async (req: Request, res: Response) => {
//   const shopId = req.user.id;
//   const { date, week, month, year, itemId, allProducts } = req.query;
//   let filter: any = {};
//   if (!allProducts) {
//     filter.shopId = shopId;
//   }

//   if (date) {
//     const start = new Date(date as string);
//     const end = new Date(start);
//     end.setDate(start.getDate() + 1);
//     filter.soldAt = { $gte: start, $lt: end };
//   } else if (week && year) {
//     const firstDayOfYear = new Date(Number(year), 0, 1);
//     const start = new Date(firstDayOfYear);
//     start.setDate(firstDayOfYear.getDate() + (Number(week) - 1) * 7);
//     const end = new Date(start);
//     end.setDate(start.getDate() + 7);
//     filter.soldAt = { $gte: start, $lt: end };
//   } else if (month && year) {
//     const start = new Date(Number(year), Number(month) - 1, 1);
//     const end = new Date(Number(year), Number(month), 1);
//     filter.soldAt = { $gte: start, $lt: end };
//   } else if (year) {
//     const start = new Date(Number(year), 0, 1);
//     const end = new Date(Number(year) + 1, 0, 1);
//     filter.soldAt = { $gte: start, $lt: end };
//   }

//   const shopService = new ShopService();
//   try {
//     const sales = await shopService.getSales(
//       filter,
//       itemId as string | undefined
//     );
//     res.status(200).json(sales);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching sales records", error });
//   }
// };
