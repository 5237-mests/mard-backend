"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/retailerRoutes.ts
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const retailerController_1 = __importDefault(require("../controllers/retailerController"));
const router = (0, express_1.Router)();
// Route to get all items available to the retailer
router.get("/items", 
// authenticateToken,
// authorizeRole(["ADMIN","RETAILER"]),
retailerController_1.default.getItems);
// Route to create a new order
router.post("/orders", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN", "RETAILER"]), authMiddleware_1.authorizeUser, retailerController_1.default.createOrder);
// Route to get all orders for the authenticated retailer
router.get("/orders", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN", "RETAILER"]), authMiddleware_1.authorizeUser, retailerController_1.default.getOrders);
exports.default = router;
