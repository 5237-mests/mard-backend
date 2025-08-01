"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventoryController_1 = require("../controllers/inventoryController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Shopkeeper: view items in their own shop
router.get("/shop", (0, authMiddleware_1.hasRole)("shopkeeper"), inventoryController_1.getShopInventory);
// Storekeeper: view items in their assigned store
router.get("/store", (0, authMiddleware_1.hasRole)("storekeeper"), inventoryController_1.getStoreInventory);
// Admin: view any shop/store's inventory
router.get("/any", (0, authMiddleware_1.hasRole)("admin"), inventoryController_1.getAnyInventory);
exports.default = router;
