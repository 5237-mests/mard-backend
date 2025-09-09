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
Object.defineProperty(exports, "__esModule", { value: true });
exports.refundOrder = exports.deleteOrder = exports.removeOrderItem = exports.updateOrderItem = exports.updateOrderStatus2 = exports.updateStatus = exports.updateDelivery = exports.getById = exports.getByUser = exports.getAllOrders = exports.create = void 0;
const orderService = __importStar(require("../services/orderService"));
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const user_id = Number((_b = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id);
        const { delivery_details } = req.body;
        const result = yield orderService.createOrder({
            user_id,
            delivery_details,
        });
        res.status(201).json(Object.assign({ message: "Order created" }, result));
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create order" });
    }
});
exports.create = create;
const getAllOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield orderService.getAllOrders();
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});
exports.getAllOrders = getAllOrders;
const getByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = Number((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id);
        console.log("get o b u>", userId);
        const orders = yield orderService.getOrdersByUser(userId);
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});
exports.getByUser = getByUser;
// get order by id
const getById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderId = Number(req.params.orderId);
        const order = yield orderService.getOrderById(orderId);
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch order" });
    }
});
exports.getById = getById;
const updateDelivery = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        const { delivery_details } = req.body;
        yield orderService.updateOrderDelivery(Number(orderId), delivery_details);
        res.json({ message: "Delivery details updated" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update delivery details" });
    }
});
exports.updateDelivery = updateDelivery;
const updateStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId, status } = req.params;
        yield orderService.updateOrderStatus(Number(orderId), status);
        res.json({ message: "Order status updated" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update order status" });
    }
});
exports.updateStatus = updateStatus;
const updateOrderStatus2 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const sold_by_id = Number((_b = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id);
        const { orderId, status } = req.params;
        const shop_id = 2;
        if (!status || !shop_id || !sold_by_id) {
            return res
                .status(400)
                .json({ message: "status, shop_id and sold_by_id are required" });
        }
        const result = yield orderService.updateOrderStatus2(Number(orderId), status, shop_id, sold_by_id);
        return res.json(result);
    }
    catch (error) {
        console.error("Error updating order status:", error);
        return res
            .status(500)
            .json({ message: error.message || "Failed to update order status" });
    }
});
exports.updateOrderStatus2 = updateOrderStatus2;
// update item quantity
const updateOrderItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId, itemId } = req.params;
        const { quantity } = req.body;
        console.log("q", quantity);
        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: "Quantity must be >= 1" });
        }
        const result = yield orderService.updateOrderItem(Number(orderId), Number(itemId), Number(quantity));
        // if (result.affectedRows === 0) {
        //   return res.status(404).json({ message: "Order item not found" });
        // }
        res.json({ message: "Order item updated successfully" });
    }
    catch (error) {
        console.error("Error updating order item:", error);
        res.status(500).json({ message: "Failed to update order item" });
    }
});
exports.updateOrderItem = updateOrderItem;
const removeOrderItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId, itemId } = req.params;
        const result = yield orderService.removeOrderItem(Number(orderId), Number(itemId));
        // if (result.affectedRows === 0) {
        //   return res.status(404).json({ message: "Order item not found" });
        // }
        res.json({ message: "Order item removed successfully" });
    }
    catch (error) {
        console.error("Error removing order item:", error);
        res.status(500).json({ message: "Failed to remove order item" });
    }
});
exports.removeOrderItem = removeOrderItem;
// delete order
const deleteOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        const result = yield orderService.deleteOrder(Number(orderId));
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.json({ message: "Order deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({ message: "Failed to delete order" });
    }
});
exports.deleteOrder = deleteOrder;
const refundOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Order Id");
        const { orderId } = req.params;
        console.log("Order Id", orderId);
        const result = yield orderService.refundOrder(Number(orderId));
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.refundOrder = refundOrder;
