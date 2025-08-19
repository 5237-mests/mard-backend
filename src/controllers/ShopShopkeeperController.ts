// File: src/controllers/ShopShopkeeperController.ts
// This controller handles HTTP requests for the shop_shopkeepers relationship.
import { Request, Response } from "express";
import { ShopShopkeeperService } from "../services/ShopShopkeeperService";

export class ShopShopkeeperController {
  public static async addShopkeeperToShop(req: Request, res: Response) {
    const { shopId, userId } = req.params;
    try {
      const newLink = await ShopShopkeeperService.addShopkeeperToShop(
        parseInt(shopId, 10),
        parseInt(userId, 10)
      );
      res.status(201).json(newLink);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async removeShopkeeperFromShop(
    req: Request,
    res: Response
  ): Promise<void> {
    const { shopId, userId } = req.params;
    try {
      const success = await ShopShopkeeperService.removeShopkeeperFromShop(
        parseInt(shopId, 10),
        parseInt(userId, 10)
      );
      if (!success) {
        res.status(404).json({
          message: "Link not found. Shopkeeper is not assigned to this shop.",
        });
        return;
      }
      res.status(204).send(); // No content
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async getShopkeepersByShopId(req: Request, res: Response) {
    const { shopId } = req.params;
    try {
      const shopkeepers = await ShopShopkeeperService.getShopkeepersByShopId(
        parseInt(shopId, 10)
      );
      res.status(200).json(shopkeepers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async getShopsByShopkeeperId(
    req: Request,
    res: Response
  ): Promise<void> {
    const { userId } = req.params;
    try {
      const shops = await ShopShopkeeperService.getShopsByShopkeeperId(
        parseInt(userId, 10)
      );
      res.status(200).json(shops);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
