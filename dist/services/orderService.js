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
exports.refundOrder = exports.deleteOrder = exports.removeOrderItem = exports.updateOrderItem = exports.updateOrderStatus2 = exports.updateOrderStatus = exports.updatePaymentReceipt = exports.updateOrderDelivery = exports.getOrderById21 = exports.getOrderById = exports.getOrderById1 = exports.getOrderById0 = exports.getAllOrders = exports.getOrdersByUser = exports.getOrdersByUse01r = exports.createOrder = void 0;
const db_1 = require("../config/db");
const AppError_1 = __importDefault(require("../utils/AppError"));
const createOrder = (orderData) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, db_1.transaction)((connection) => __awaiter(void 0, void 0, void 0, function* () {
        // 1. Create new order
        const [orderResult] = yield connection.query(`INSERT INTO orders (retailer_id, delivery_details, payment_receipt, status)
       VALUES (?, ?, ?, 'pending')`, [
            orderData.user_id,
            orderData.delivery_details || "",
            orderData.payment_receipt || null,
        ]);
        const orderId = orderResult.insertId;
        // 2. Move items from cart to order items
        const cartItems = yield connection.query(`SELECT ci.item_id, ci.quantity, i.price
       FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       JOIN items i ON ci.item_id = i.id
       WHERE c.user_id = ?`, [orderData.user_id]);
        if (cartItems[0].length === 0) {
            throw new Error("Cart is empty");
        }
        for (const item of cartItems[0]) {
            yield connection.query(`INSERT INTO order_items (order_id, item_id, quantity, price_at_order)
         VALUES (?, ?, ?, ?)`, [orderId, item.item_id, item.quantity, item.price]);
        }
        // 3. Clear cart after order
        yield connection.query(`DELETE ci FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       WHERE c.user_id = ?`, [orderData.user_id]);
        // 4. Update stock in shop_items
        // for (const item of cartItems) {
        //   await connection.query(
        //     `UPDATE shop_items
        //      SET stock = stock - ?
        //      WHERE item_id = ?`,
        //     [item.quantity, item.item_id]
        //   );
        // }
        return { order_id: orderId };
    }));
});
exports.createOrder = createOrder;
const getOrdersByUse01r = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `
    SELECT o.id as order_id, o.delivery_details, o.payment_receipt, o.status, o.created_at,
           oi.quantity, oi.price_at_order, oi.item_id
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE o.retailer_id = ?
    ORDER BY order_id DESC
  `;
    const rows = yield (0, db_1.query)(sql, [userId]);
    const orders = {};
    rows.forEach((row) => {
        if (!orders[row.order_id]) {
            orders[row.order_id] = {
                order_id: row.order_id,
                status: row.status,
                delivery_details: row.delivery_details,
                payment_receipt: row.payment_receipt,
                created_at: row.created_at,
                total_quantity: 0,
                total_price: 0,
                items: [],
            };
        }
        const item_sub_total_price = row.quantity * row.price_at_order;
        orders[row.order_id].items.push({
            item_id: row.item_id,
            quantity: row.quantity,
            price_at_order: row.price_at_order,
            sub_total_price: item_sub_total_price,
        });
        // Compute totals
        orders[row.order_id].total_quantity += row.quantity;
        orders[row.order_id].total_price += item_sub_total_price;
    });
    return Object.values(orders);
});
exports.getOrdersByUse01r = getOrdersByUse01r;
const getOrdersByUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `
    SELECT o.id as order_id, o.delivery_details, o.payment_receipt, o.status, o.created_at,
           oi.quantity, oi.price_at_order, oi.item_id
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE o.retailer_id = ?
    ORDER BY o.created_at DESC  -- Sort by creation date: newest first
  `;
    const rows = yield (0, db_1.query)(sql, [userId]);
    const orders = {};
    rows.forEach((row) => {
        if (!orders[row.order_id]) {
            orders[row.order_id] = {
                id: row.order_id, // Remap to match frontend
                status: row.status,
                delivery_details: row.delivery_details,
                payment_receipt: row.payment_receipt,
                created_at: row.created_at,
                total_amount: 0, // Remap and rename for frontend
                items: [], // Keep if useful elsewhere
            };
        }
        const itemSubTotalPrice = row.quantity * row.price_at_order;
        orders[row.order_id].items.push({
            item_id: row.item_id,
            quantity: row.quantity,
            price_at_order: row.price_at_order,
            sub_total_price: itemSubTotalPrice,
        });
        // Compute totals (now on remapped field)
        orders[row.order_id].total_amount += itemSubTotalPrice;
    });
    // Safety net sort by created_at (newest first; redundant with SQL but ensures consistency)
    return Object.values(orders).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
});
exports.getOrdersByUser = getOrdersByUser;
const getAllOrders = () => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `
    SELECT o.id as order_id, o.delivery_details, o.payment_receipt, o.status, o.created_at,
           oi.quantity, oi.price_at_order, oi.item_id, u.name AS customer, u.email AS customer_email
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN users u ON o.retailer_id = u.id
    ORDER BY o.created_at DESC
  `;
    const rows = yield (0, db_1.query)(sql);
    const orders = {};
    rows.forEach((row) => {
        if (!orders[row.order_id]) {
            orders[row.order_id] = {
                order_id: row.order_id,
                id: row.order_id,
                customer: row.customer,
                customer_email: row.customer_email,
                status: row.status,
                delivery_details: row.delivery_details,
                payment_receipt: row.payment_receipt,
                created_at: row.created_at,
                total_quantity: 0,
                total_price: 0,
                items: [],
            };
        }
        const item_sub_total_price = row.quantity * row.price_at_order;
        orders[row.order_id].items.push({
            item_id: row.item_id,
            quantity: row.quantity,
            price_at_order: row.price_at_order,
            sub_total_price: item_sub_total_price,
        });
        // Compute totals
        orders[row.order_id].total_quantity += row.quantity;
        orders[row.order_id].total_price += item_sub_total_price;
    });
    return Object.values(orders);
});
exports.getAllOrders = getAllOrders;
// get order by id
const getOrderById0 = (orderId) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `
    SELECT o.id as order_id, o.delivery_details, o.created_at,
           oi.item_id, oi.quantity, oi.price_at_order
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE o.id = ?
  `;
    return yield (0, db_1.query)(sql, [orderId]);
});
exports.getOrderById0 = getOrderById0;
const getOrderById1 = (orderId) => __awaiter(void 0, void 0, void 0, function* () {
    // ADD ITEMS NAME & PRICE
    const sql = `
    SELECT o.id as order_id, o.delivery_details, o.payment_receipt, o.created_at, o.status,
           i.name as item_name, i.price as current_price,
           oi.item_id, oi.quantity, oi.price_at_order
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN items i ON oi.item_id = i.id
    WHERE o.id = ?
  `;
    const rows = yield (0, db_1.query)(sql, [orderId]);
    if (rows.length === 0)
        return null;
    const order = {
        order_id: rows[0].order_id,
        delivery_details: rows[0].delivery_details,
        payment_receipt: rows[0].payment_receipt,
        created_at: rows[0].created_at,
        status: rows[0].status,
        items: [],
        total_quantity: 0,
        total_price: 0,
    };
    rows.forEach((row) => {
        const itemTotal = row.quantity * row.price_at_order;
        order.items.push({
            item_id: row.item_id,
            quantity: row.quantity,
            price_at_order: row.price_at_order,
            item_total: itemTotal,
        });
        order.total_quantity += row.quantity;
        order.total_price += itemTotal;
    });
    return order;
});
exports.getOrderById1 = getOrderById1;
const getOrderById = (orderId) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `
    SELECT 
      o.id,
      o.retailer_id,
      o.status,
      o.delivery_details,
      o.payment_receipt,
      o.created_at,
      o.updated_at,
      o.updated_by,
      u.name,
      u.email,
      u.phone,
      i.name as item_name,
      i.price as current_price,
      oi.item_id,
      oi.quantity,
      oi.price_at_order,
      updater.name as updated_by_name
    FROM orders o 
    JOIN order_items oi ON o.id = oi.order_id 
    JOIN items i ON oi.item_id = i.id 
    JOIN users u ON o.retailer_id = u.id
    LEFT JOIN users updater ON o.updated_by = updater.id
    WHERE o.id = ?
  `;
    const rows = yield (0, db_1.query)(sql, [orderId]);
    if (rows.length === 0)
        return null;
    const firstRow = rows[0];
    const order = {
        id: firstRow.id, // ← Fixed
        status: firstRow.status,
        delivery_details: firstRow.delivery_details,
        payment_receipt: firstRow.payment_receipt,
        created_at: firstRow.created_at,
        updated_at: firstRow.updated_at, // Added
        // updated_by: firstRow.updated_by,
        updated_by: firstRow.updated_by_name,
        total_amount: 0,
        customer: {
            id: firstRow.retailer_id,
            name: firstRow.name,
            email: firstRow.email,
            phone: firstRow.phone,
        },
        items: [],
    };
    rows.forEach((row) => {
        const itemTotal = row.quantity * row.price_at_order;
        order.items.push({
            item_id: row.item_id,
            name: row.item_name,
            quantity: row.quantity,
            price_at_order: row.price_at_order,
            current_price: row.current_price,
            item_total: itemTotal,
        });
        order.total_amount += itemTotal;
    });
    return order;
});
exports.getOrderById = getOrderById;
const getOrderById21 = (orderId) => __awaiter(void 0, void 0, void 0, function* () {
    // Fetch order details with item names and current prices
    // include user details
    // include updated by
    const sql = `
    SELECT o.*, u.name, u.email, u.phone,
           i.name as item_name, i.price as current_price,
           oi.item_id, oi.quantity, oi.price_at_order
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN items i ON oi.item_id = i.id
    JOIN users u ON o.retailer_id = u.id
    WHERE o.id = ?
  `;
    const rows = yield (0, db_1.query)(sql, [orderId]);
    if (rows.length === 0)
        return null;
    const order = {
        id: rows[0].order_id, // Remap to match frontend expectations
        delivery_details: rows[0].delivery_details,
        payment_receipt: rows[0].payment_receipt,
        created_at: rows[0].created_at,
        status: rows[0].status,
        updated_by: rows[0].updated_by,
        updated_by_name: rows[0].updated_by_name,
        total_amount: 0,
        customer: {
            id: rows[0].retailer_id,
            name: rows[0].name,
            email: rows[0].email,
            phone: rows[0].phone,
        },
        items: [],
    };
    rows.forEach((row) => {
        const itemTotal = row.quantity * row.price_at_order;
        order.items.push({
            item_id: row.item_id,
            name: row.item_name, // Include item name
            quantity: row.quantity,
            price_at_order: row.price_at_order,
            current_price: row.current_price, // Include current price
            item_total: itemTotal,
        });
        order.total_amount += itemTotal;
    });
    return order;
});
exports.getOrderById21 = getOrderById21;
const updateOrderDelivery = (orderId, delivery) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `UPDATE orders SET delivery_details = ? WHERE id = ?`;
    return yield (0, db_1.query)(sql, [delivery, orderId]);
});
exports.updateOrderDelivery = updateOrderDelivery;
const updatePaymentReceipt = (orderId, userId, paymentReceipt) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, db_1.transaction)((conn) => __awaiter(void 0, void 0, void 0, function* () {
        const [orders] = yield conn.query(`SELECT id, status FROM orders WHERE id = ? AND retailer_id = ?`, [orderId, userId]);
        if (orders.length === 0) {
            throw new AppError_1.default("Order not found", 404);
        }
        if (orders[0].status !== "pending") {
            throw new AppError_1.default("Receipt can only be changed while order is pending", 400);
        }
        yield conn.query(`UPDATE orders SET payment_receipt = ? WHERE id = ? AND retailer_id = ?`, [paymentReceipt, orderId, userId]);
        return { message: "Payment receipt updated", payment_receipt: paymentReceipt };
    }));
});
exports.updatePaymentReceipt = updatePaymentReceipt;
// update order status
const updateOrderStatus = (orderId, status) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, db_1.transaction)((conn) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        // check if order exists
        const [order] = yield conn.query(`SELECT id FROM orders WHERE id = ?`, [orderId]);
        if (order.length === 0) {
            throw new AppError_1.default("Order not found", 404);
        }
        // Step 1: Update order status
        yield conn.query(`UPDATE orders SET status = ? WHERE id = ?`, [
            status,
            orderId,
        ]);
        if (status === "approved") {
            // Step 2: Get all items in the order
            const [items] = yield conn.query(`SELECT item_id, quantity FROM order_items WHERE order_id = ?`, [orderId]);
            // Step 3: Deduct quantities from shop_items
            for (const item of items) {
                const { item_id, quantity } = item;
                // Check stock before deducting
                const [rows] = yield conn.query(`SELECT quantity FROM shop_items WHERE shop_id = ? AND item_id = ?`, [2, item_id]);
                if (!rows.length || rows[0].quantity < quantity) {
                    throw new Error(`Insufficient stock for item ${item_id}. Available: ${((_a = rows[0]) === null || _a === void 0 ? void 0 : _a.quantity) || 0}, Required: ${quantity}`);
                }
                // Deduct stock
                yield conn.query(`UPDATE shop_items SET quantity = quantity - ? WHERE item_id = ? AND shop_id = ?`, [quantity, item_id, 2]);
            }
        }
        return { message: `Order ${status} successfully` };
    }));
});
exports.updateOrderStatus = updateOrderStatus;
const updateOrderStatus2 = (orderId, status, sellerId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, db_1.transaction)((conn) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        // check if order exists
        const [order] = yield conn.query(`SELECT id, payment_receipt FROM orders WHERE id = ?`, [orderId]);
        if (order.length === 0) {
            throw new AppError_1.default("Order not found", 404);
        }
        // use sellerId to get shopId from shopkeepers table
        const [shopkeepers] = yield conn.query(`SELECT shop_id FROM shop_shopkeepers WHERE user_id = ?`, [sellerId]);
        const shopId = (_a = shopkeepers[0]) === null || _a === void 0 ? void 0 : _a.shop_id;
        if ((status === "approved" || status === "paid") && !order[0].payment_receipt) {
            throw new AppError_1.default("Payment receipt is required before approving an order", 400);
        }
        // 1. Update order status and updated_by
        yield conn.query(`UPDATE orders SET status = ?, updated_by = ? WHERE id = ?`, [
            status,
            sellerId,
            orderId,
        ]);
        if (status === "approved" || status === "paid") {
            // 2. Get order items
            const [items] = yield conn.query(`SELECT oi.item_id, oi.quantity, oi.price_at_order
         FROM order_items oi
         WHERE oi.order_id = ?`, [orderId]);
            if (items.length === 0) {
                throw new Error("No items found for this order");
            }
            // 3. Deduct stock from shop_items
            for (const item of items) {
                const [stock] = yield conn.query(`SELECT quantity FROM shop_items WHERE item_id = ? AND shop_id = ?`, [item.item_id, shopId]);
                if (stock.length === 0) {
                    throw new Error(`Item ${item.item_id} not found in shop`);
                }
                if (stock[0].quantity < item.quantity) {
                    throw new Error(`Insufficient stock for item ${item.item_id}`);
                }
                yield conn.query(`UPDATE shop_items SET quantity = quantity - ? WHERE item_id = ? AND shop_id = ?`, [item.quantity, item.item_id, shopId]);
            }
            // 4. Create sales record
            const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.price_at_order, 0);
            // 👉 Fetch customer name if this was an online order
            const [orderRow] = yield conn.query(`SELECT retailer_id, delivery_details FROM orders WHERE id = ?`, [orderId]);
            let customerName = null;
            let customerContact = null;
            if (orderRow.length > 0) {
                const userId = orderRow[0].retailer_id;
                // If this was placed by a registered user → use their info
                if (userId) {
                    const [userRow] = yield conn.query(`SELECT name, phone FROM users WHERE id = ?`, [userId]);
                    if (userRow.length > 0) {
                        customerName = userRow[0].name;
                        customerContact = userRow[0].phone;
                    }
                }
            }
            // const [saleResult]: any = await conn.query(
            //   `INSERT INTO sales (shop_id, sold_by_id, total_amount, created_at)
            //    VALUES (?, ?, ?, NOW())`,
            //   [shopId, soldById, totalAmount]
            // );
            const [saleResult] = yield conn.query(`INSERT INTO sales (shop_id, sold_by_id, total_amount, customer_name, customer_contact, created_at)
   VALUES (?, ?, ?, ?, ?, NOW())`, [shopId, sellerId, totalAmount, customerName, customerContact]);
            const saleId = saleResult.insertId;
            // 5. Insert sale_items
            for (const item of items) {
                yield conn.query(`INSERT INTO sale_items (sale_id, item_id, quantity, price)
           VALUES (?, ?, ?, ?)`, [saleId, item.item_id, item.quantity, item.price_at_order]);
            }
        }
        return { message: `Order ${status} successfully` };
    }));
});
exports.updateOrderStatus2 = updateOrderStatus2;
// update order items
const updateOrderItem = (orderId, itemId, quantity) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `
    UPDATE order_items
    SET quantity = ?
    WHERE order_id = ? AND item_id = ?
  `;
    const result = yield (0, db_1.query)(sql, [quantity, orderId, itemId]);
    return result;
});
exports.updateOrderItem = updateOrderItem;
const removeOrderItem = (orderId, itemId) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `
    DELETE FROM order_items
    WHERE order_id = ? AND item_id = ?
  `;
    const result = yield (0, db_1.query)(sql, [orderId, itemId]);
    return result;
});
exports.removeOrderItem = removeOrderItem;
//delete order
const deleteOrder = (orderId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, db_1.transaction)((conn) => __awaiter(void 0, void 0, void 0, function* () {
        // Delete items first
        yield conn.query(`DELETE FROM order_items WHERE order_id = ?`, [orderId]);
        // Delete order
        const [result] = yield conn.query(`DELETE FROM orders WHERE id = ?`, [
            orderId,
        ]);
        return result;
    }));
});
exports.deleteOrder = deleteOrder;
// Refund an order
const refundOrder = (orderId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, db_1.transaction)((conn) => __awaiter(void 0, void 0, void 0, function* () {
        // 1. Check if order exists & status
        const [orders] = yield conn.query(`SELECT status FROM orders WHERE id = ?`, [orderId]);
        if (orders.length === 0) {
            throw new AppError_1.default("Order not found", 404);
        }
        const order = orders[0];
        if (order.status !== "approved") {
            throw new AppError_1.default("Only approved orders can be refunded", 400);
        }
        // 2. Get order items
        const [items] = yield conn.query(`SELECT item_id, quantity FROM order_items WHERE order_id = ?`, [orderId]);
        // 3. Restore stock to shop_items
        for (const item of items) {
            yield conn.query(`UPDATE shop_items SET quantity = quantity + ? WHERE shop_id = 2 AND item_id = ?`, [item.quantity, item.item_id]);
        }
        // 4. Update order status to refunded
        yield conn.query(`UPDATE orders SET status = ? WHERE id = ?`, [
            "refunded",
            orderId,
        ]);
        return { message: "Order refunded successfully" };
    }));
});
exports.refundOrder = refundOrder;
