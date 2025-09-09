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
Object.defineProperty(exports, "__esModule", { value: true });
// services/adminService.ts
const db_1 = require("../config/db");
class AdminService {
    updateOrderStatus(orderId, newStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, db_1.transaction)((connection) => __awaiter(this, void 0, void 0, function* () {
                // Fetch order items for stock adjustment
                const orderItems = (yield connection.query("SELECT item_id, quantity FROM order_items WHERE order_id = ?", [orderId]));
                // If rejecting, restore stock
                if (newStatus === "rejected") {
                    // check if order is rejected already
                    const [order] = (yield connection.query("SELECT status FROM orders WHERE id = ?", [orderId]));
                    if (order[0].status === "rejected") {
                        return { message: "Order has already been rejected" };
                    }
                    for (const item of orderItems[0]) {
                        yield connection.query("UPDATE shop_items SET quantity = quantity + ? WHERE item_id = ? AND shop_id = 2", [item.quantity, item.item_id]);
                    }
                }
                // Update order status
                yield connection.query("UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [newStatus, orderId]);
                return { message: "Order status updated" };
            }));
        });
    }
}
exports.default = new AdminService();
