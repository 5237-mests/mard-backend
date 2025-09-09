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
const retailerService_1 = __importDefault(require("../services/retailerService"));
class RetailerController {
    getItems(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const items = yield retailerService_1.default.getItems();
                res.json(items);
            }
            catch (error) {
                res.status(500).json({ error: error.message || "Server error" });
            }
        });
    }
    createOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body.items || !Array.isArray(req.body.items)) {
                return res.status(400).json({ error: "Items must be a non-empty array" });
            }
            try {
                const result = yield retailerService_1.default.createOrder(req.user.user.id, req.body);
                res.json(result);
            }
            catch (error) {
                res.status(400).json({ error: error.message || "Failed to place order" });
            }
        });
    }
    getOrders(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.user.id;
                const orders = yield retailerService_1.default.getOrders(userId);
                res.json(orders);
            }
            catch (error) {
                res.status(500).json({ error: error.message || "Server error" });
            }
        });
    }
}
exports.default = new RetailerController();
