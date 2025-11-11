// File: src/controllers/storeItemController.ts
// This controller layer handles HTTP requests and calls the appropriate service methods.
import { Request, Response } from "express";
// import { storeItemService } from "../services/storeItemService";
import { StoreItemService } from "../services/storeItemService";
import { ShopItem } from "../types/database";

export class storeItemController {
  public static async addstoreItem(
    req: Request,
    res: Response
  ): Promise<ShopItem[]> {
    const { storeId, itemId } = req.params;
    const { quantity } = req.body;

    //quantity must be >= 1
    if (quantity < 1) {
      res
        .status(400)
        .json({ message: "Quantity must be greater than or equal to 1." });
      return [];
    }

    if (!quantity || isNaN(parseInt(quantity, 10))) {
      res
        .status(400)
        .json({ message: "Quantity is required and must be a number." });
      return [];
    }

    try {
      const newstoreItem = await StoreItemService.addstoreItem(
        parseInt(storeId, 10),
        parseInt(itemId, 10),
        parseInt(quantity, 10)
      );
      res.status(201).json(newstoreItem);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }

    return [];
  }

  public static async updatestoreItemQuantity(
    req: Request,
    res: Response
  ): Promise<void> {
    const { storeId, itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || isNaN(parseInt(quantity, 10))) {
      res
        .status(400)
        .json({ message: "Quantity is required and must be a number." });
      return;
    }

    try {
      const success = await StoreItemService.updatestoreItemQuantity(
        parseInt(storeId, 10),
        parseInt(itemId, 10),
        parseInt(quantity, 10)
      );
      if (!success) {
        res.status(404).json({ message: "Item not found in this store." });
        return;
      }
      res.status(200).json({ message: "Quantity updated successfully." });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async deletestoreItem(
    req: Request,
    res: Response
  ): Promise<void> {
    const { storeId, itemId } = req.params;

    try {
      const success = await StoreItemService.deletestoreItem(
        parseInt(storeId, 10),
        parseInt(itemId, 10)
      );
      if (!success) {
        res.status(404).json({ message: "Item not found in this store." });
        return;
      }
      res.status(204).send(); // No content
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async getItemsBystoreId(
    req: Request,
    res: Response
  ): Promise<void> {
    const { storeId } = req.params;
    try {
      const items = await StoreItemService.getItemsBystoreId(
        parseInt(storeId, 10)
      );
      res.status(200).json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async getItemsByItemId(req: Request, res: Response) {
    const { itemId } = req.params;
    try {
      const items = await StoreItemService.getItemByItemId(
        parseInt(itemId, 10)
      );
      res.status(200).json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async getItemsBystoreIdAndItemId(
    req: Request,
    res: Response
  ): Promise<void> {
    const { storeId, itemId } = req.params;
    try {
      const items = await StoreItemService.getItemsBystoreIdAndItemId(
        parseInt(storeId, 10),
        parseInt(itemId, 10)
      );
      res.status(200).json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // get all item from all store
  public static async getAllstoreItems(req: Request, res: Response) {
    try {
      const items = await StoreItemService.getAllItems();
      res.status(200).json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Add multiple items to a store
  public static async addMultiplestoreItems(
    req: Request,
    res: Response
  ): Promise<void> {
    const { storeId } = req.params;
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
      const result = await StoreItemService.addMultiplestoreItems(
        parseInt(storeId, 10),
        items
      );
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
