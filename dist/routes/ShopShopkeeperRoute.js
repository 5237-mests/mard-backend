"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ShopShopkeeperController_1 = require("../controllers/ShopShopkeeperController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Route to add a shopkeeper to a shop
router.post("/shops/:shopId/shopkeepers/:userId", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), ShopShopkeeperController_1.ShopShopkeeperController.addShopkeeperToShop);
// Route to get all shopkeepers for a specific shop
router.get("/shops/:shopId/shopkeepers", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), ShopShopkeeperController_1.ShopShopkeeperController.getShopkeepersByShopId);
// Route to get all shops for a specific shopkeeper
router.get("/shopkeepers/:userId/shops", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), ShopShopkeeperController_1.ShopShopkeeperController.getShopsByShopkeeperId);
// Route to remove a shopkeeper from a shop
router.delete("/shops/:shopId/shopkeepers/:userId", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), ShopShopkeeperController_1.ShopShopkeeperController.removeShopkeeperFromShop);
exports.default = router;
