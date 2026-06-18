import { query, transaction } from "../config/db";
import AppError from "../utils/AppError";

interface OrderItem {
  item_id: number;
  quantity: number;
  price_at_order: number;
}

interface OrderPayload {
  user_id: number;
  delivery_details: string;
  items: OrderItem[];
}

export interface CreateOrderInput {
  user_id: number;
  delivery_details: string;
  payment_receipt?: string;
}

export const createOrder = async (orderData: CreateOrderInput) => {
  return await transaction(async (connection) => {
    // 1. Create new order
    const [orderResult]: any = await connection.query(
      `INSERT INTO orders (retailer_id, delivery_details, payment_receipt, status)
       VALUES (?, ?, ?, 'pending')`,
      [
        orderData.user_id,
        orderData.delivery_details || "",
        orderData.payment_receipt || null,
      ]
    );

    const orderId = orderResult.insertId;
    // 2. Move items from cart to order items
    const cartItems: any = await connection.query(
      `SELECT ci.item_id, ci.quantity, i.price
       FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       JOIN items i ON ci.item_id = i.id
       WHERE c.user_id = ?`,
      [orderData.user_id]
    );

    if (cartItems[0].length === 0) {
      throw new Error("Cart is empty");
    }

    for (const item of cartItems[0]) {
      await connection.query(
        `INSERT INTO order_items (order_id, item_id, quantity, price_at_order)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.item_id, item.quantity, item.price]
      );
    }

    // 3. Clear cart after order
    await connection.query(
      `DELETE ci FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       WHERE c.user_id = ?`,
      [orderData.user_id]
    );

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
  });
};

export const getOrdersByUse01r = async (userId: number) => {
  const sql = `
    SELECT o.id as order_id, o.delivery_details, o.payment_receipt, o.status, o.created_at,
           oi.quantity, oi.price_at_order, oi.item_id
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE o.retailer_id = ?
    ORDER BY order_id DESC
  `;

  const rows: any[] = await query(sql, [userId]);

  const orders: Record<number, any> = {};

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
};
export const getOrdersByUser = async (userId: number) => {
  const sql = `
    SELECT o.id as order_id, o.delivery_details, o.payment_receipt, o.status, o.created_at,
           oi.quantity, oi.price_at_order, oi.item_id
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE o.retailer_id = ?
    ORDER BY o.created_at DESC  -- Sort by creation date: newest first
  `;

  const rows: any[] = await query(sql, [userId]);

  const orders: Record<number, any> = {};

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
  return Object.values(orders).sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};

export const getAllOrders = async () => {
  const sql = `
    SELECT o.id as order_id, o.delivery_details, o.payment_receipt, o.status, o.created_at,
           oi.quantity, oi.price_at_order, oi.item_id, u.name AS customer, u.email AS customer_email
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN users u ON o.retailer_id = u.id
    ORDER BY o.created_at DESC
  `;

  const rows: any[] = await query(sql);

  const orders: Record<number, any> = {};

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
};

// get order by id
export const getOrderById0 = async (orderId: number) => {
  const sql = `
    SELECT o.id as order_id, o.delivery_details, o.created_at,
           oi.item_id, oi.quantity, oi.price_at_order
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE o.id = ?
  `;
  return await query(sql, [orderId]);
};
export const getOrderById1 = async (orderId: number) => {
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

  const rows: any[] = await query(sql, [orderId]);

  if (rows.length === 0) return null;

  const order = {
    order_id: rows[0].order_id,
    delivery_details: rows[0].delivery_details,
    payment_receipt: rows[0].payment_receipt,
    created_at: rows[0].created_at,
    status: rows[0].status,
    items: [] as any[],
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
};

export const getOrderById = async (orderId: number) => {
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

  const rows: any[] = await query(sql, [orderId]);

  if (rows.length === 0) return null;

  const firstRow = rows[0];

  const order = {
    id: firstRow.id,                    // ← Fixed
    status: firstRow.status,
    delivery_details: firstRow.delivery_details,
    payment_receipt: firstRow.payment_receipt,
    created_at: firstRow.created_at,
    updated_at: firstRow.updated_at,    // Added
    // updated_by: firstRow.updated_by,
    updated_by: firstRow.updated_by_name,
    total_amount: 0,
    customer: {
      id: firstRow.retailer_id,
      name: firstRow.name,
      email: firstRow.email,
      phone: firstRow.phone,
    },
    items: [] as any[],
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
};

export const getOrderById21 = async (orderId: number) => {
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
  const rows: any[] = await query(sql, [orderId]);

  if (rows.length === 0) return null;

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
    items: [] as any[],
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
};

export const updateOrderDelivery = async (
  orderId: number,
  delivery: string
) => {
  const sql = `UPDATE orders SET delivery_details = ? WHERE id = ?`;
  return await query(sql, [delivery, orderId]);
};

export const updatePaymentReceipt = async (
  orderId: number,
  userId: number,
  paymentReceipt: string,
) => {
  return await transaction(async (conn) => {
    const [orders]: any = await conn.query(
      `SELECT id, status FROM orders WHERE id = ? AND retailer_id = ?`,
      [orderId, userId],
    );

    if (orders.length === 0) {
      throw new AppError("Order not found", 404);
    }

    if (orders[0].status !== "pending") {
      throw new AppError("Receipt can only be changed while order is pending", 400);
    }

    await conn.query(
      `UPDATE orders SET payment_receipt = ? WHERE id = ? AND retailer_id = ?`,
      [paymentReceipt, orderId, userId],
    );

    return { message: "Payment receipt updated", payment_receipt: paymentReceipt };
  });
};

// update order status
export const updateOrderStatus = async (orderId: number, status: string) => {
  return await transaction(async (conn) => {
    // check if order exists
    const [order] = await conn.query<any[]>(
      `SELECT id FROM orders WHERE id = ?`,
      [orderId]
    );
    if (order.length === 0) {
      throw new AppError("Order not found", 404);
    }
    // Step 1: Update order status
    await conn.query(`UPDATE orders SET status = ? WHERE id = ?`, [
      status,
      orderId,
    ]);

    if (status === "approved") {
      // Step 2: Get all items in the order
      const [items] = await conn.query<any[]>(
        `SELECT item_id, quantity FROM order_items WHERE order_id = ?`,
        [orderId]
      );

      // Step 3: Deduct quantities from shop_items
      for (const item of items) {
        const { item_id, quantity } = item;

        // Check stock before deducting
        const [rows] = await conn.query<any[]>(
          `SELECT quantity FROM shop_items WHERE shop_id = ? AND item_id = ?`,
          [2, item_id]
        );

        if (!rows.length || rows[0].quantity < quantity) {
          throw new Error(
            `Insufficient stock for item ${item_id}. Available: ${rows[0]?.quantity || 0
            }, Required: ${quantity}`
          );
        }

        // Deduct stock
        await conn.query(
          `UPDATE shop_items SET quantity = quantity - ? WHERE item_id = ? AND shop_id = ?`,
          [quantity, item_id, 2]
        );
      }
    }

    return { message: `Order ${status} successfully` };
  });
};
export const updateOrderStatus2 = async (
  orderId: number,
  status: string,
  sellerId: number
) => {
  return await transaction(async (conn) => {
    // check if order exists
    const [order] = await conn.query<any[]>(
      `SELECT id, payment_receipt FROM orders WHERE id = ?`,
      [orderId]
    );
    if (order.length === 0) {
      throw new AppError("Order not found", 404);
    }

    // use sellerId to get shopId from shopkeepers table
    const [shopkeepers] = await conn.query<any[]>(
      `SELECT shop_id FROM shop_shopkeepers WHERE user_id = ?`,
      [sellerId]
    );

    const shopId = shopkeepers[0]?.shop_id;

    if ((status === "approved" || status === "paid") && !order[0].payment_receipt) {
      throw new AppError("Payment receipt is required before approving an order", 400);
    }
    // 1. Update order status and updated_by
    await conn.query(`UPDATE orders SET status = ?, updated_by = ? WHERE id = ?`, [
      status,
      sellerId,
      orderId,
    ]);

    if (status === "approved" || status === "paid") {
      // 2. Get order items
      const [items]: any = await conn.query(
        `SELECT oi.item_id, oi.quantity, oi.price_at_order
         FROM order_items oi
         WHERE oi.order_id = ?`,
        [orderId]
      );

      if (items.length === 0) {
        throw new Error("No items found for this order");
      }

      // 3. Deduct stock from shop_items
      for (const item of items) {
        const [stock]: any = await conn.query(
          `SELECT quantity FROM shop_items WHERE item_id = ? AND shop_id = ?`,
          [item.item_id, shopId]
        );

        if (stock.length === 0) {
          throw new Error(`Item ${item.item_id} not found in shop`);
        }
        if (stock[0].quantity < item.quantity) {
          throw new Error(`Insufficient stock for item ${item.item_id}`);
        }

        await conn.query(
          `UPDATE shop_items SET quantity = quantity - ? WHERE item_id = ? AND shop_id = ?`,
          [item.quantity, item.item_id, shopId]
        );
      }

      // 4. Create sales record
      const totalAmount = items.reduce(
        (sum: number, i: any) => sum + i.quantity * i.price_at_order,
        0
      );

      // 👉 Fetch customer name if this was an online order
      const [orderRow]: any = await conn.query(
        `SELECT retailer_id, delivery_details FROM orders WHERE id = ?`,
        [orderId]
      );
      let customerName: string | null = null;
      let customerContact: string | null = null;

      if (orderRow.length > 0) {
        const userId = orderRow[0].retailer_id;

        // If this was placed by a registered user → use their info
        if (userId) {
          const [userRow]: any = await conn.query(
            `SELECT name, phone FROM users WHERE id = ?`,
            [userId]
          );

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
      const [saleResult]: any = await conn.query(
        `INSERT INTO sales (shop_id, sold_by_id, total_amount, customer_name, customer_contact, created_at)
   VALUES (?, ?, ?, ?, ?, NOW())`,
        [shopId, sellerId, totalAmount, customerName, customerContact]
      );

      const saleId = saleResult.insertId;

      // 5. Insert sale_items
      for (const item of items) {
        await conn.query(
          `INSERT INTO sale_items (sale_id, item_id, quantity, price)
           VALUES (?, ?, ?, ?)`,
          [saleId, item.item_id, item.quantity, item.price_at_order]
        );
      }
    }

    return { message: `Order ${status} successfully` };
  });
};

// update order items
export const updateOrderItem = async (
  orderId: number,
  itemId: number,
  quantity: number
) => {
  const sql = `
    UPDATE order_items
    SET quantity = ?
    WHERE order_id = ? AND item_id = ?
  `;

  const result = await query(sql, [quantity, orderId, itemId]);
  return result;
};

export const removeOrderItem = async (orderId: number, itemId: number) => {
  const sql = `
    DELETE FROM order_items
    WHERE order_id = ? AND item_id = ?
  `;

  const result = await query(sql, [orderId, itemId]);
  return result;
};

//delete order
export const deleteOrder = async (orderId: number) => {
  return await transaction(async (conn) => {
    // Delete items first
    await conn.query(`DELETE FROM order_items WHERE order_id = ?`, [orderId]);

    // Delete order
    const [result] = await conn.query(`DELETE FROM orders WHERE id = ?`, [
      orderId,
    ]);

    return result;
  });
};

// Refund an order
export const refundOrder = async (orderId: number) => {
  return await transaction(async (conn) => {
    // 1. Check if order exists & status
    const [orders]: any = await conn.query(
      `SELECT status FROM orders WHERE id = ?`,
      [orderId]
    );

    if (orders.length === 0) {
      throw new AppError("Order not found", 404);
    }

    const order = orders[0];
    if (order.status !== "approved") {
      throw new AppError("Only approved orders can be refunded", 400);
    }

    // 2. Get order items
    const [items]: any = await conn.query(
      `SELECT item_id, quantity FROM order_items WHERE order_id = ?`,
      [orderId]
    );

    // 3. Restore stock to shop_items
    for (const item of items) {
      await conn.query(
        `UPDATE shop_items SET quantity = quantity + ? WHERE shop_id = 2 AND item_id = ?`,
        [item.quantity, item.item_id]
      );
    }

    // 4. Update order status to refunded
    await conn.query(`UPDATE orders SET status = ? WHERE id = ?`, [
      "refunded",
      orderId,
    ]);

    return { message: "Order refunded successfully" };
  });
};
