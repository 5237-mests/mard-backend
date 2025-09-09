// services/adminService.ts
import { transaction } from "../config/db";

class AdminService {
  async updateOrderStatus(
    orderId: number,
    newStatus: "approved" | "rejected" | "shipped" | "delivered"
  ): Promise<{ message: string }> {
    return transaction(async (connection) => {
      // Fetch order items for stock adjustment
      const orderItems = (await connection.query(
        "SELECT item_id, quantity FROM order_items WHERE order_id = ?",
        [orderId]
      )) as any[];

      // If rejecting, restore stock
      if (newStatus === "rejected") {
        // check if order is rejected already
        const [order] = (await connection.query(
          "SELECT status FROM orders WHERE id = ?",
          [orderId]
        )) as any[];
        if (order[0].status === "rejected") {
          return { message: "Order has already been rejected" };
        }
        for (const item of orderItems[0]) {
          await connection.query(
            "UPDATE shop_items SET quantity = quantity + ? WHERE item_id = ? AND shop_id = 2",
            [item.quantity, item.item_id]
          );
        }
      }
      // Update order status
      await connection.query(
        "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [newStatus, orderId]
      );

      return { message: "Order status updated" };
    });
  }
}

export default new AdminService();
