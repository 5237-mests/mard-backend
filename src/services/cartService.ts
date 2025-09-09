import { query, transaction } from "../config/db";
import AppError from "../utils/AppError";

export interface CartItem {
  //   user_id: number;
  item_id: number;
  quantity: number;
}

// Add item to cart (create cart if not exists)
export const addToCart0 = async (item: CartItem, user_id: number) => {
  return await transaction(async (conn) => {
    // 1. Check if user already has a cart
    const [cartRows]: any = await conn.query(
      "SELECT id FROM carts WHERE user_id = ?",
      [user_id]
    );

    let cartId: number;
    if (cartRows.length === 0) {
      // 2. Create new cart for user
      const [result]: any = await conn.query(
        "INSERT INTO carts (user_id, created_at) VALUES (?, NOW())",
        [user_id]
      );
      cartId = result.insertId;
    } else {
      cartId = cartRows[0].id;
    }

    // 3. Insert or update item in cart_items
    await conn.query(
      `
        INSERT INTO cart_items (cart_id, item_id, quantity)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
      `,
      [cartId, item.item_id, item.quantity]
    );

    return { cartId, message: "Item added to cart" };
  });
};
export const addToCart = async (item: CartItem, user_id: number) => {
  return await transaction(async (conn) => {
    // 1. Check stock availability in shop_items
    const [stockRows]: any = await conn.query(
      "SELECT quantity FROM shop_items WHERE shop_id = ? AND item_id = ?",
      [2, item.item_id]
    );

    if (stockRows.length === 0) {
      throw new AppError(`Item ${item.item_id} not found in shop`, 404);
    }

    if (stockRows[0].quantity < item.quantity) {
      throw new AppError(
        `Insufficient stock for item ${item.item_id}. Available: ${stockRows[0].quantity}, Requested: ${item.quantity}`,
        400
      );
    }

    // 2. Check if user already has a cart
    const [cartRows]: any = await conn.query(
      "SELECT id FROM carts WHERE user_id = ?",
      [user_id]
    );

    let cartId: number;
    if (cartRows.length === 0) {
      // Create new cart for user
      const [result]: any = await conn.query(
        "INSERT INTO carts (user_id, created_at) VALUES (?, NOW())",
        [user_id]
      );
      cartId = result.insertId;
    } else {
      cartId = cartRows[0].id;
    }

    // 3. Insert or update item in cart_items
    await conn.query(
      `
        INSERT INTO cart_items (cart_id, item_id, quantity)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
      `,
      [cartId, item.item_id, item.quantity]
    );

    return { cartId, message: "Item added to cart" };
  });
};

export const getCartByUser0 = async (userId: number) => {
  const sql = `
    SELECT c.id AS cart_id, c.user_id, 
           ci.item_id, ci.quantity, 
           p.name, p.price
    FROM carts c
    JOIN cart_items ci ON c.id = ci.cart_id
    JOIN items p ON ci.item_id = p.id
    WHERE c.user_id = ?
  `;

  const rows: any[] = await query(sql, [userId]);

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
};

export const getCartByUser = async (userId: number) => {
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

  const rows = await query(sql, [userId]);

  if (rows.length === 0)
    return { cart_id: null, items: [], total_quantity: 0, total_price: 0 };

  // Group items into nested structure
  const items = rows.map((row: any) => ({
    item_id: row.item_id,
    name: row.item_name,
    price: row.price,
    quantity: row.quantity,
    sub_total_price: row.price * row.quantity,
  }));

  // Compute totals
  const total_quantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const total_price = items.reduce(
    (sum, item) => sum + item.sub_total_price,
    0
  );

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
};

// Update quantity of an item in a user's cart
export const updateCartItem = async (
  userId: number,
  item_id: number,
  quantity: number
) => {
  return await transaction(async (conn) => {
    // 1. check stock availability
    const [stockRows]: any = await conn.query(
      "SELECT quantity FROM shop_items WHERE shop_id = ? AND item_id = ?",
      [2, item_id]
    );

    if (stockRows.length === 0) {
      throw new AppError("Item not found", 404);
    }

    if (stockRows[0].quantity < quantity) {
      throw new AppError(
        `Insufficient stock for item ${item_id}. Available: ${stockRows[0].quantity}, Requested: ${quantity}`,
        400
      );
    }

    // Update quantity
    const sql = `
    UPDATE cart_items ci
    JOIN carts c ON ci.cart_id = c.id
    SET ci.quantity = ?
    WHERE c.user_id = ? AND ci.item_id = ?
  `;
    await conn.query(sql, [quantity, userId, item_id]);
    return getCartByUser(userId);
  });
};

// Remove an item from a user's cart
export const removeCartItem = async (userId: number, itemId: number) => {
  const sql = `
    DELETE ci FROM cart_items ci
    JOIN carts c ON ci.cart_id = c.id
    WHERE c.user_id = ? AND ci.item_id = ?
  `;
  await query(sql, [userId, itemId]);
  return { message: "Cart item removed" };
};

// clear cart
export const clearCart = async (userId: number) => {
  const sql = `
    DELETE ci FROM cart_items ci
    JOIN carts c ON ci.cart_id = c.id
    WHERE c.user_id = ?
  `;
  await query(sql, [userId]);
  return { message: "Cart cleared" };
};

// Increment item by +1
export const incrementCartItem = async (userId: number, itemId: number) => {
  // 1. Check stock availability
  const [stockRows]: any = await query(
    "SELECT quantity FROM shop_items WHERE shop_id = ? AND item_id = ?",
    [2, itemId]
  );

  if (stockRows.length === 0) {
    throw new AppError("Item not found", 404);
  }
  const availableStock = stockRows.quantity;

  // 2. Get current cart quantity
  const [cartRows]: any = await query(
    `SELECT ci.quantity 
     FROM cart_items ci
     JOIN carts c ON ci.cart_id = c.id
     WHERE c.user_id = ? AND ci.item_id = ?`,
    [userId, itemId]
  );
  const currentCartQty = cartRows.quantity;

  // 3. Validate stock
  if (currentCartQty + 1 > availableStock) {
    throw new AppError(
      `Insufficient stock for item ${itemId}. Available: ${availableStock}, Requested: ${
        currentCartQty + 1
      }`,
      400
    );
  }
  // 4. Update quantity
  const sql = `
    UPDATE cart_items ci
    JOIN carts c ON ci.cart_id = c.id
    SET ci.quantity = ci.quantity + 1
    WHERE c.user_id = ? AND ci.item_id = ?
  `;
  await query(sql, [userId, itemId]);

  return getCartByUser(userId); // return updated cart
};

// Decrement item by -1 (remove if reaches 0)
export const decrementCartItem = async (userId: number, itemId: number) => {
  const sql = `
    UPDATE cart_items ci
    JOIN carts c ON ci.cart_id = c.id
    SET ci.quantity = ci.quantity - 1
    WHERE c.user_id = ? AND ci.item_id = ? AND ci.quantity > 0
  `;
  await query(sql, [userId, itemId]);

  // Remove if quantity is 0
  const cleanupSql = `
    DELETE ci FROM cart_items ci
    JOIN carts c ON ci.cart_id = c.id
    WHERE c.user_id = ? AND ci.item_id = ? AND ci.quantity <= 0
  `;
  await query(cleanupSql, [userId, itemId]);

  return getCartByUser(userId); // return updated cart
};
