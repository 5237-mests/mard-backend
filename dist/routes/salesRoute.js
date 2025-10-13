"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const salesController_1 = require("../controllers/salesController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const salesPaymentController_1 = require("../controllers/salesPaymentController");
const router = express_1.default.Router();
// POST /api/sales - Process a sale with multiple items
router.post("/sales", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN", "SHOPKEEPER"]), salesController_1.SalesController.createSale);
router.post("/sales/pay", authMiddleware_1.authenticateToken, salesPaymentController_1.SalesPaymentController.paySale);
// GET /api/sales?shopId= - Retrieve sales for a specific shop
router.get("/sales", authMiddleware_1.authenticateToken, salesController_1.SalesController.getSales);
// GET all sales for admin
router.get("/sales/all", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), salesController_1.SalesController.getAllSales);
exports.default = router;
