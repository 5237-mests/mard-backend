// File: src/routes/ShopItemRoute.ts
// This file defines the API routes for shop_items.
import { Router } from "express";
import { ShopItemController } from "../controllers/shopItemController";

const router = Router();

// Route to get all shop items
router.get("/", ShopItemController.getAllShopItems);

// Route to get all items for a specific shop
router.get("/:shopId/items", ShopItemController.getItemsByShopId);

// Route to get a specific item by shop ID and item ID
router.get(
  "/:shopId/items/:itemId",
  ShopItemController.getItemsByShopIdAndItemId
);

// Route to get all items for a specific item
router.get("/items/:itemId", ShopItemController.getItemsByItemId);

// Route to add a new item to a shop or update its quantity
router.post("/:shopId/items/:itemId", ShopItemController.addShopItem);

// Route to update the quantity of a specific item in a specific shop
router.put("/:shopId/items/:itemId", ShopItemController.updateShopItemQuantity);

// Route to delete a specific item from a specific shop
router.delete("/:shopId/items/:itemId", ShopItemController.deleteShopItem);

// Route to add multiple items to a shop
router.post("/:shopId/items", ShopItemController.addMultipleShopItems);

export default router;
