"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController = __importStar(require("../controllers/orderController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const router = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => __awaiter(void 0, void 0, void 0, function* () {
        const uploadDir = path_1.default.join(process.env.HOME || "/home/mardtryj", "uploads/receipts");
        try {
            yield promises_1.default.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        }
        catch (err) {
            cb(err, uploadDir);
        }
    }),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedExt = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf"];
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (file.mimetype.startsWith("image/") ||
            file.mimetype === "application/pdf" ||
            allowedExt.includes(ext)) {
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 },
});
router.post("/me", authMiddleware_1.authenticateToken, authMiddleware_1.authorizeUser, upload.single("payment_receipt"), orderController.create);
// get order by userid.
router.get("/me", authMiddleware_1.authenticateToken, authMiddleware_1.authorizeUser, orderController.getByUser);
// get all orders for admin
router.get("/all", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), orderController.getAllOrders);
// router.get("/", authenticateToken, authorizeUser, orderController.getByUser);
router.put("/:orderId", orderController.updateDelivery);
router.patch("/:orderId/receipt", authMiddleware_1.authenticateToken, authMiddleware_1.authorizeUser, upload.single("payment_receipt"), orderController.updatePaymentReceipt);
router.get("/:orderId", authMiddleware_1.authenticateToken, authMiddleware_1.authorizeUser, orderController.getById);
// update order status
router.put("/:orderId/:status", authMiddleware_1.authenticateToken, orderController.updateStatus);
// PUT /orders/:orderId/items/:itemId
router.put("/:orderId/items/:itemId", authMiddleware_1.authenticateToken, orderController.updateOrderItem);
// refund order
// POST /orders/:orderId/refund
router.post("/refund/:orderId", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), orderController.refundOrder);
// DELETE /orders/:orderId/items/:itemId
router.delete("/:orderId/items/:itemId", authMiddleware_1.authenticateToken, orderController.removeOrderItem);
// DELETE /orders/:orderId
router.delete("/:orderId", authMiddleware_1.authenticateToken, orderController.deleteOrder);
// PATCH /orders/:id/status
router.patch("/:orderId/:status", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), orderController.updateOrderStatus2);
exports.default = router;
