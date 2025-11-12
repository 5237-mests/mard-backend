"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// File: src/routes/ShopItemRoute.ts
// This file defines the API routes for shop_items.
const express_1 = require("express");
const shopItemController_1 = require("../controllers/shopItemController");
const router = (0, express_1.Router)();
// Route to get all shop items
router.get("/", shopItemController_1.ShopItemController.getAllShopItems);
// Route to get all items for a specific shop
router.get("/:shopId/items", shopItemController_1.ShopItemController.getItemsByShopId);
// Route to get a specific item by shop ID and item ID
router.get("/:shopId/items/:itemId", shopItemController_1.ShopItemController.getItemsByShopIdAndItemId);
// Route to get all items for a specific item
router.get("/items/:itemId", shopItemController_1.ShopItemController.getItemsByItemId);
// Route to add a new item to a shop or update its quantity
router.post("/:shopId/items/:itemId", shopItemController_1.ShopItemController.addShopItem);
// Route to update the quantity of a specific item in a specific shop
router.put("/:shopId/items/:itemId", shopItemController_1.ShopItemController.updateShopItemQuantity);
// Route to delete a specific item from a specific shop
router.delete("/:shopId/items/:itemId", shopItemController_1.ShopItemController.deleteShopItem);
// Route to add multiple items to a shop
router.post("/:shopId/items", shopItemController_1.ShopItemController.addMultipleShopItems);
exports.default = router;
