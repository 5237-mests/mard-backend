"use strict";
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
const authMiddleware_1 = require("../middleware/authMiddleware");
const adminService_1 = __importDefault(require("../services/adminService"));
const router = (0, express_1.Router)();
router.post("/approve-order", authMiddleware_1.authenticateToken, 
//   checkRole(["admin", "storekeeper"]),
(req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { order_id, status } = req.body;
    try {
        const result = yield adminService_1.default.updateOrderStatus(order_id, status);
        res.json(result);
    }
    catch (error) {
        res
            .status(400)
            .json({ error: error.message || "Failed to update order" });
    }
}));
exports.default = router;
