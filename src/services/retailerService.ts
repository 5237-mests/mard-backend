// services/retailerService.ts
import { query, transaction } from "../config/db";
import { Item, Order, CreateOrderInput } from "../types/database";

class RetailerService {
  async getItems(): Promise<Item[]> {
    const sql = `
            SELECT
                si.quantity,
                i.id AS id,
                i.name AS name,
                i.model AS model,
                b.name AS brand,
                c.name AS category,
                i.price AS price
            FROM shop_items si
            JOIN items i ON si.item_id = i.id
            JOIN brands b ON i.brand_id = b.id
            JOIN categories c ON i.category_id = c.id
            WHERE si.shop_id = 2
        `;
    const rows = await query(sql);
    return rows;
  }

  async createOrder(
    userId: number,
    input: CreateOrderInput
  ): Promise<{ order_id: number; message: string }> {
    const { items, delivery_details } = input;

    // Input validation

    if (!items || items.length === 0) {
      throw new Error("Items array cannot be empty");
    }
    for (const item of items) {
      if (
        !item ||
        typeof item.item_id !== "number" ||
        typeof item.quantity !== "number"
      ) {
        throw new Error(`Invalid item: ${JSON.stringify(item)}`);
      }
      if (item.quantity <= 0) {
        throw new Error(`Invalid quantity for item ${item.item_id}`);
      }
    }

    return transaction(async (connection) => {
      const [orderResult] = (await connection.query(
        'INSERT INTO orders (retailer_id, status, delivery_details) VALUES (?, "pending", ?)',
        [userId, delivery_details || ""]
      )) as any;
      const orderId = orderResult.insertId;

      for (const item of items) {
        // const [stock] = await connection.query(
        //   "SELECT quantity FROM shop_items WHERE item_id = ? AND shop_id = ?",
        //   [item.item_id, 2]
        // );
        const stock = await query(
          "SELECT quantity FROM shop_items WHERE item_id = ? AND shop_id = ?",
          [item.item_id, 2]
        );
        if (!stock || stock[0].quantity < item.quantity) {
          throw new Error(`Insufficient stock for item ${item.item_id}`);
        }
        await connection.query(
          "INSERT INTO order_items (order_id, item_id, quantity, price_at_order) VALUES (?, ?, ?, (SELECT price FROM items WHERE id = ?))",
          [orderId, item.item_id, item.quantity, item.item_id]
        );

        await connection.query(
          "UPDATE shop_items SET quantity = quantity - ? WHERE shop_id = ? AND item_id = ?",
          [item.quantity, 2, item.item_id]
        );
      }
      return { order_id: orderId, message: "Order placed" };
    });
  }

  async getOrders(userId: number): Promise<Order[]> {
    const sql = `
      SELECT o.id,
             o.status,
             o.delivery_details,
             o.created_at,
             o.updated_at,
             oi.quantity,
             oi.price_at_order,
             i.name AS item_name
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN items i ON oi.item_id = i.id
      WHERE o.retailer_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;

    const rows = await query(sql, [userId]);
    return rows;
  }
}

export default new RetailerService();
