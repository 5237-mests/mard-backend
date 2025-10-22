// File: src/controllers/ShopItemController.ts
// This controller layer handles HTTP requests and calls the appropriate service methods.
import { Request, Response } from "express";
import { ShopItemService } from "../services/shopItemService";
import { ShopItem } from "../types/database";

export class ShopItemController {
  public static async addShopItem(
    req: Request,
    res: Response
  ): Promise<ShopItem[]> {
    const { shopId, itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || isNaN(parseInt(quantity, 10))) {
      res
        .status(400)
        .json({ message: "Quantity is required and must be a number." });
      return [];
    }

    try {
      const newShopItem = await ShopItemService.addShopItem(
        parseInt(shopId, 10),
        parseInt(itemId, 10),
        parseInt(quantity, 10)
      );
      res.status(201).json(newShopItem);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }

    return [];
  }

  public static async updateShopItemQuantity(
    req: Request,
    res: Response
  ): Promise<void> {
    const { shopId, itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || isNaN(parseInt(quantity, 10))) {
      res
        .status(400)
        .json({ message: "Quantity is required and must be a number." });
      return;
    }

    try {
      const success = await ShopItemService.updateShopItemQuantity(
        parseInt(shopId, 10),
        parseInt(itemId, 10),
        parseInt(quantity, 10)
      );
      if (!success) {
        res.status(404).json({ message: "Item not found in this shop." });
        return;
      }
      res.status(200).json({ message: "Quantity updated successfully." });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async deleteShopItem(
    req: Request,
    res: Response
  ): Promise<void> {
    const { shopId, itemId } = req.params;

    try {
      const success = await ShopItemService.deleteShopItem(
        parseInt(shopId, 10),
        parseInt(itemId, 10)
      );
      if (!success) {
        res.status(404).json({ message: "Item not found in this shop." });
        return;
      }
      res.status(204).send(); // No content
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async getItemsByShopId(
    req: Request,
    res: Response
  ): Promise<void> {
    const { shopId } = req.params;
    try {
      const items = await ShopItemService.getItemsByShopId(
        parseInt(shopId, 10)
      );
      res.status(200).json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async getItemsByItemId(req: Request, res: Response) {
    const { itemId } = req.params;
    try {
      const items = await ShopItemService.getItemByItemId(parseInt(itemId, 10));
      res.status(200).json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async getItemsByShopIdAndItemId(
    req: Request,
    res: Response
  ): Promise<void> {
    const { shopId, itemId } = req.params;
    try {
      const items = await ShopItemService.getItemsByShopIdAndItemId(
        parseInt(shopId, 10),
        parseInt(itemId, 10)
      );
      res.status(200).json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // get all item from all shop
  public static async getAllShopItems(req: Request, res: Response) {
    try {
      const items = await ShopItemService.getAllItems();
      res.status(200).json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Add multiple items to a shop
  public static async addMultipleShopItems(
    req: Request,
    res: Response
  ): Promise<void> {
    const { shopId } = req.params;
    const rawItems = (req.body && req.body.items) || [];

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      res
        .status(400)
        .json({ message: "Items array is required and cannot be empty." });
      return;
    }

    // Normalize & validate each item
    const items: { itemId: number; quantity: number }[] = [];
    for (const it of rawItems) {
      const itemId = Number(it?.itemId);
      const quantity = Number(it?.quantity);
      if (
        !Number.isInteger(itemId) ||
        !Number.isFinite(quantity) ||
        quantity <= 0
      ) {
        res.status(400).json({
          message:
            "Each item must include integer itemId and a positive numeric quantity.",
        });
        return;
      }
      items.push({ itemId, quantity });
    }

    try {
      const result = await ShopItemService.addMultipleShopItems(
        parseInt(shopId, 10),
        items
      );
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
