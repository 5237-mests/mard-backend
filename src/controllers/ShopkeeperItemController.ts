// File: src/controllers/ShopkeeperItemController.ts
// This controller handles HTTP requests related to shopkeeper items.
import { Request, Response } from "express";
import { ShopkeeperItemService } from "../services/ShopkeeperItemService";

export class ShopkeeperItemController {
  /**
   * Handles the request to get all items for a specific shopkeeper.
   * @param req The Express request object.
   * @param res The Express response object.
   */
  public static async getItemsByShopkeeperId(
    req: Request,
    res: Response
  ): Promise<void> {
    const { userId } = req.params;

    // Simple validation to ensure the ID is a number.
    if (isNaN(parseInt(userId, 10))) {
      res.status(400).json({ message: "User ID must be a valid number." });
      return;
    }

    try {
      const items = await ShopkeeperItemService.getItemsByShopkeeperId(
        parseInt(userId, 10)
      );
      res.status(200).json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
