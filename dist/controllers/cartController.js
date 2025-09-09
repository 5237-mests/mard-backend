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
exports.decrementItem = exports.incrementItem = exports.clearCart = exports.removeItem = exports.updateItem = exports.getCart = exports.getCart0 = exports.addItem = exports.addItem1 = void 0;
const cartService = __importStar(require("../services/cartService"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const addItem1 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = Number((_b = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id);
        const { item_id, quantity } = req.body;
        if (!item_id || !quantity) {
            return res
                .status(400)
                .json({ message: "item_id and quantity are required" });
        }
        const result = yield cartService.addToCart({ item_id, quantity }, userId);
        res.status(201).json(result);
    }
    catch (error) {
        if (error.message.includes("not found")) {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes("Insufficient stock")) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Failed to add item to cart" });
    }
});
exports.addItem1 = addItem1;
const addItem = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = Number((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id);
        const { item_id, quantity } = req.body;
        if (!item_id || !quantity) {
            throw new AppError_1.default("item_id and quantity are required", 400);
        }
        const result = yield cartService.addToCart({ item_id, quantity }, userId);
        res.status(201).json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.addItem = addItem;
const getCart0 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = Number((_b = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id);
        const items = yield cartService.getCartByUser(userId);
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch cart" });
    }
});
exports.getCart0 = getCart0;
const getCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = Number((_b = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id);
        const cart = yield cartService.getCartByUser(Number(userId));
        res.json(cart);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.getCart = getCart;
const updateItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { item_id, quantity } = req.body;
        const userId = Number((_b = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id);
        const data = yield cartService.updateCartItem(userId, Number(item_id), Number(quantity));
        res.json({ message: "Cart item updated", data });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update cart item" });
    }
});
exports.updateItem = updateItem;
const removeItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { itemId } = req.params;
        const userId = Number((_b = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id);
        console.log(userId, Number(itemId));
        yield cartService.removeCartItem(userId, Number(itemId));
        res.json({ message: "Cart item removed" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to remove cart item" });
    }
});
exports.removeItem = removeItem;
// clear cart
const clearCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = Number((_b = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id);
        yield cartService.clearCart(userId);
        res.json({ message: "Cart cleared" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to clear cart" });
    }
});
exports.clearCart = clearCart;
// Increment item by +1
const incrementItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { item_id } = req.params;
        const user_id = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.user.id;
        const result = yield cartService.incrementCartItem(Number(user_id), Number(item_id));
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.incrementItem = incrementItem;
// Decrement item by -1
const decrementItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { item_id } = req.params;
        const user_id = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.user.id;
        const result = yield cartService.decrementCartItem(Number(user_id), Number(item_id));
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.decrementItem = decrementItem;
