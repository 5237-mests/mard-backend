"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// File: src/routes/ShopkeeperItemRoute.ts
// This file defines the API routes for shopkeeper items.
const express_1 = require("express");
const ShopkeeperItemController_1 = require("../controllers/ShopkeeperItemController");
const router = (0, express_1.Router)();
// Route to get all items for a specific shopkeeper by their user ID.
router.get("/:userId/items", ShopkeeperItemController_1.ShopkeeperItemController.getItemsByShopkeeperId);
exports.default = router;
