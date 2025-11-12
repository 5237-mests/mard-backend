"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// File: src/routes/storeItemRoute.ts
// This file defines the API routes for store_items.
const express_1 = require("express");
// import { storeItemController } from "../controllers/storeItemController";
const storeItemController_1 = require("../controllers/storeItemController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Route to get all store items
router.get("/", storeItemController_1.storeItemController.getAllstoreItems);
// Route to get all items for a specific store
router.get("/:storeId/items", storeItemController_1.storeItemController.getItemsBystoreId);
// Route to get a specific item by store ID and item ID
router.get("/:storeId/items/:itemId", storeItemController_1.storeItemController.getItemsBystoreIdAndItemId);
// Route to get all items for a specific item
router.get("/items/:itemId", storeItemController_1.storeItemController.getItemsByItemId);
// Route to add a new item to a store or update its quantity
router.post("/:storeId/items/:itemId", authMiddleware_1.authenticateToken, authMiddleware_1.authorizeUser, (0, authMiddleware_1.authorizeRole)(["ADMIN", "RECEIVER"]), storeItemController_1.storeItemController.addstoreItem);
// Route to update the quantity of a specific item in a specific store
router.put("/:storeId/items/:itemId", authMiddleware_1.authenticateToken, authMiddleware_1.authorizeUser, (0, authMiddleware_1.authorizeRole)(["ADMIN", "RECEIVER"]), storeItemController_1.storeItemController.updatestoreItemQuantity);
// Route to delete a specific item from a specific store
router.delete("/:storeId/items/:itemId", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), storeItemController_1.storeItemController.deletestoreItem);
// Route to add multiple items to a store
router.post("/:storeId/items", authMiddleware_1.authenticateToken, authMiddleware_1.authorizeUser, (0, authMiddleware_1.authorizeRole)(["ADMIN", "RECEIVER"]), storeItemController_1.storeItemController.addMultiplestoreItems);
exports.default = router;
