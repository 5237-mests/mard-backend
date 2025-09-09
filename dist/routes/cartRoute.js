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
const cartController = __importStar(require("../controllers/cartController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post("/", authMiddleware_1.authenticateToken, authMiddleware_1.authorizeUser, cartController.addItem);
router.get("/", authMiddleware_1.authenticateToken, authMiddleware_1.authorizeUser, cartController.getCart);
router.put("/", authMiddleware_1.authenticateToken, authMiddleware_1.authorizeUser, cartController.updateItem);
// remove item from cart
router.delete("/:itemId", authMiddleware_1.authenticateToken, authMiddleware_1.authorizeUser, cartController.removeItem);
// clear carts
router.delete("/", authMiddleware_1.authenticateToken, authMiddleware_1.authorizeUser, cartController.clearCart);
router.post("/increment/:item_id", authMiddleware_1.authenticateToken, authMiddleware_1.authorizeUser, cartController.incrementItem);
router.post("/decrement/:item_id", authMiddleware_1.authenticateToken, authMiddleware_1.authorizeUser, cartController.decrementItem);
exports.default = router;
