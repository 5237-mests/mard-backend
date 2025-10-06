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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController = __importStar(require("../controllers/orderController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post("/me", authMiddleware_1.authenticateToken, authMiddleware_1.authorizeUser, orderController.create);
// get order by userid
router.get("/me", authMiddleware_1.authenticateToken, authMiddleware_1.authorizeUser, orderController.getByUser);
// get all orders for admin
router.get("/all", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), orderController.getAllOrders);
// router.get("/", authenticateToken, authorizeUser, orderController.getByUser);
router.put("/:orderId", orderController.updateDelivery);
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
router.patch("/:orderId/:status", authMiddleware_1.authenticateToken, authMiddleware_1.authorizeUser, orderController.updateOrderStatus2);
exports.default = router;
