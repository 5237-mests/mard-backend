// File: src/services/ShopkeeperItemService.ts
// This service handles queries that link a shopkeeper to their items.

import { query } from "../config/db";

// Placeholder for database connection

export class ShopkeeperItemService {
  /**
   * Retrieves all items managed by a specific shopkeeper.
   * @param userId The ID of the shopkeeper.
   * @returns A list of items associated with the shopkeeper's shops.
   */
  public static async getItemsByShopkeeperId(userId: number) {
    const sql = `
            SELECT
                i.id,
                i.name,
                i.model,
                si.quantity,
                s.name AS shop_name
            FROM users u
            JOIN shop_shopkeepers ssk ON u.id = ssk.user_id
            JOIN shops s ON ssk.shop_id = s.id
            JOIN shop_items si ON s.id = si.shop_id
            JOIN items i ON si.item_id = i.id
            WHERE u.id = ?;
        `;
    try {
      const rows = await query(sql, [userId]);
      return rows;
    } catch (error) {
      console.error("Error fetching items for shopkeeper:", error);
      throw new Error("Could not retrieve items for the specified shopkeeper.");
    }
  }
}
