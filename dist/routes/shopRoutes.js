"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authMiddleware_1 = require("../middleware/authMiddleware");
// import { processSale, getSales } from "../controllers/shopController";
const express_1 = require("express");
const shopController_1 = require("../controllers/shopController");
const router = (0, express_1.Router)();
// Route to create a new shop
router.post("/", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), shopController_1.ShopController.createShop);
// Route to get all shops
router.get("/", authMiddleware_1.authenticateToken, shopController_1.ShopController.getShops);
// Route to get a single shop by ID
router.get("/:id", authMiddleware_1.authenticateToken, shopController_1.ShopController.getShopById);
// Route to update a shop by ID
router.put("/:id", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), shopController_1.ShopController.updateShop);
// Route to delete a shop by ID
router.delete("/:id", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), shopController_1.ShopController.deleteShop);
// Route to process a sale (only shopkeeper or admin can do this)
// router.post(
//   "/sale",
//   authenticateToken,
//   authorizeRole(["SHOPKEEPER", "ADMIN"]),
//   processSale
// );
// Route to get sales data (only admin can do this)
// router.get("/sales", authenticateToken, authorizeRole(["ADMIN"]), getSales);
exports.default = router;
