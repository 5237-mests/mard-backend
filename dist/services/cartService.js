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
exports.decrementCartItem = exports.incrementCartItem = exports.clearCart = exports.removeCartItem = exports.updateCartItem = exports.getCartByUser = exports.getCartByUser0 = exports.addToCart = exports.addToCart0 = void 0;
const db_1 = require("../config/db");
const AppError_1 = __importDefault(require("../utils/AppError"));
// Add item to cart (create cart if not exists)
const addToCart0 = (item, user_id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, db_1.transaction)((conn) => __awaiter(void 0, void 0, void 0, function* () {
        // 1. Check if user already has a cart
        const [cartRows] = yield conn.query("SELECT id FROM carts WHERE user_id = ?", [user_id]);
        let cartId;
        if (cartRows.length === 0) {
            // 2. Create new cart for user
            const [result] = yield conn.query("INSERT INTO carts (user_id, created_at) VALUES (?, NOW())", [user_id]);
            cartId = result.insertId;
        }
        else {
            cartId = cartRows[0].id;
        }
        // 3. Insert or update item in cart_items
        yield conn.query(`
        INSERT INTO cart_items (cart_id, item_id, quantity)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
      `, [cartId, item.item_id, item.quantity]);
        return { cartId, message: "Item added to cart" };
    }));
});
exports.addToCart0 = addToCart0;
const addToCart = (item, user_id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, db_1.transaction)((conn) => __awaiter(void 0, void 0, void 0, function* () {
        // 1. Check stock availability in shop_items
        const [stockRows] = yield conn.query("SELECT quantity FROM shop_items WHERE shop_id = ? AND item_id = ?", [2, item.item_id]);
        if (stockRows.length === 0) {
            throw new AppError_1.default(`Item ${item.item_id} not found in shop`, 404);
        }
        if (stockRows[0].quantity < item.quantity) {
            throw new AppError_1.default(`Insufficient stock for item ${item.item_id}. Available: ${stockRows[0].quantity}, Requested: ${item.quantity}`, 400);
        }
        // 2. Check if user already has a cart
        const [cartRows] = yield conn.query("SELECT id FROM carts WHERE user_id = ?", [user_id]);
        let cartId;
        if (cartRows.length === 0) {
            // Create new cart for user
            const [result] = yield conn.query("INSERT INTO carts (user_id, created_at) VALUES (?, NOW())", [user_id]);
            cartId = result.insertId;
        }
        else {
            cartId = cartRows[0].id;
        }
        // 3. Insert or update item in cart_items
        yield conn.query(`
        INSERT INTO cart_items (cart_id, item_id, quantity)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
      `, [cartId, item.item_id, item.quantity]);
        return { cartId, message: "Item added to cart" };
    }));
});
exports.addToCart = addToCart;
const getCartByUser0 = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `
    SELECT c.id AS cart_id, c.user_id, 
           ci.item_id, ci.quantity, 
           p.name, p.price
    FROM carts c
    JOIN cart_items ci ON c.id = ci.cart_id
    JOIN items p ON ci.item_id = p.id
    WHERE c.user_id = ?
  `;
    const rows = yield (0, db_1.query)(sql, [userId]);
    if (rows.length === 0) {
        return []; // no cart found
    }
    // Build nested object
    return {
        id: rows[0].cart_id,
        user_id: rows[0].user_id,
        items: rows.map((row) => ({
            item_id: row.item_id,
            name: row.name,
            price: row.price,
            quantity: row.quantity,
        })),
    };
});
exports.getCartByUser0 = getCartByUser0;
const getCartByUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `
    SELECT 
      c.id AS cart_id,
      ci.item_id,
      ci.quantity,
      i.name AS item_name,
      i.price
    FROM carts c
    LEFT JOIN cart_items ci ON c.id = ci.cart_id
    LEFT JOIN items i ON ci.item_id = i.id
    WHERE c.user_id = ?
  `;
    const rows = yield (0, db_1.query)(sql, [userId]);
    if (rows.length === 0)
        return { cart_id: null, items: [], total_quantity: 0, total_price: 0 };
    // Group items into nested structure
    const items = rows.map((row) => ({
        item_id: row.item_id,
        name: row.item_name,
        price: row.price,
        quantity: row.quantity,
        sub_total_price: row.price * row.quantity,
    }));
    // Compute totals
    const total_quantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const total_price = items.reduce((sum, item) => sum + item.sub_total_price, 0);
    // return empty array if cart is empty
    if (total_quantity === 0) {
        return {
            cart_id: rows[0].cart_id,
            items: [],
            total_quantity: 0,
            total_price: 0,
        };
    }
    return {
        cart_id: rows[0].cart_id,
        items,
        total_quantity,
        total_price,
    };
});
exports.getCartByUser = getCartByUser;
// Update quantity of an item in a user's cart
const updateCartItem = (userId, item_id, quantity) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, db_1.transaction)((conn) => __awaiter(void 0, void 0, void 0, function* () {
        // 1. check stock availability
        const [stockRows] = yield conn.query("SELECT quantity FROM shop_items WHERE shop_id = ? AND item_id = ?", [2, item_id]);
        if (stockRows.length === 0) {
            throw new AppError_1.default("Item not found", 404);
        }
        if (stockRows[0].quantity < quantity) {
            throw new AppError_1.default(`Insufficient stock for item ${item_id}. Available: ${stockRows[0].quantity}, Requested: ${quantity}`, 400);
        }
        // Update quantity
        const sql = `
    UPDATE cart_items ci
    JOIN carts c ON ci.cart_id = c.id
    SET ci.quantity = ?
    WHERE c.user_id = ? AND ci.item_id = ?
  `;
        yield conn.query(sql, [quantity, userId, item_id]);
        return (0, exports.getCartByUser)(userId);
    }));
});
exports.updateCartItem = updateCartItem;
// Remove an item from a user's cart
const removeCartItem = (userId, itemId) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `
    DELETE ci FROM cart_items ci
    JOIN carts c ON ci.cart_id = c.id
    WHERE c.user_id = ? AND ci.item_id = ?
  `;
    yield (0, db_1.query)(sql, [userId, itemId]);
    return { message: "Cart item removed" };
});
exports.removeCartItem = removeCartItem;
// clear cart
const clearCart = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `
    DELETE ci FROM cart_items ci
    JOIN carts c ON ci.cart_id = c.id
    WHERE c.user_id = ?
  `;
    yield (0, db_1.query)(sql, [userId]);
    return { message: "Cart cleared" };
});
exports.clearCart = clearCart;
// Increment item by +1
const incrementCartItem = (userId, itemId) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Check stock availability
    const [stockRows] = yield (0, db_1.query)("SELECT quantity FROM shop_items WHERE shop_id = ? AND item_id = ?", [2, itemId]);
    if (stockRows.length === 0) {
        throw new AppError_1.default("Item not found", 404);
    }
    const availableStock = stockRows.quantity;
    // 2. Get current cart quantity
    const [cartRows] = yield (0, db_1.query)(`SELECT ci.quantity 
     FROM cart_items ci
     JOIN carts c ON ci.cart_id = c.id
     WHERE c.user_id = ? AND ci.item_id = ?`, [userId, itemId]);
    const currentCartQty = cartRows.quantity;
    // 3. Validate stock
    if (currentCartQty + 1 > availableStock) {
        throw new AppError_1.default(`Insufficient stock for item ${itemId}. Available: ${availableStock}, Requested: ${currentCartQty + 1}`, 400);
    }
    // 4. Update quantity
    const sql = `
    UPDATE cart_items ci
    JOIN carts c ON ci.cart_id = c.id
    SET ci.quantity = ci.quantity + 1
    WHERE c.user_id = ? AND ci.item_id = ?
  `;
    yield (0, db_1.query)(sql, [userId, itemId]);
    return (0, exports.getCartByUser)(userId); // return updated cart
});
exports.incrementCartItem = incrementCartItem;
// Decrement item by -1 (remove if reaches 0)
const decrementCartItem = (userId, itemId) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `
    UPDATE cart_items ci
    JOIN carts c ON ci.cart_id = c.id
    SET ci.quantity = ci.quantity - 1
    WHERE c.user_id = ? AND ci.item_id = ? AND ci.quantity > 0
  `;
    yield (0, db_1.query)(sql, [userId, itemId]);
    // Remove if quantity is 0
    const cleanupSql = `
    DELETE ci FROM cart_items ci
    JOIN carts c ON ci.cart_id = c.id
    WHERE c.user_id = ? AND ci.item_id = ? AND ci.quantity <= 0
  `;
    yield (0, db_1.query)(cleanupSql, [userId, itemId]);
    return (0, exports.getCartByUser)(userId); // return updated cart
});
exports.decrementCartItem = decrementCartItem;
