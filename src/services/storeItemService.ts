// File: src/services/storeItemService.ts
// This service layer handles the many-to-many relationship between stores and items.
import { query } from "../config/db";
import { ShopItem } from "../types/database";

export class StoreItemService {
  /**
   * Adds an item to a specific store with a given quantity.
   * @param storeId The ID of the store.
   * @param itemId The ID of the item.
   * @param quantity The quantity of the item to add.
   * @returns The created link object.
   */
  public static async addstoreItem(
    storeId: number,
    itemId: number,
    quantity: number
  ) {
    // First, check if the store and item exist to maintain foreign key integrity.
    const storeExists = await query("SELECT 1 FROM stores WHERE id = ?", [
      storeId,
    ]);
    if (storeExists.length === 0) {
      throw new Error("store not found.");
    }

    const itemExists = await query("SELECT 1 FROM items WHERE id = ?", [
      itemId,
    ]);
    if (itemExists.length === 0) {
      throw new Error("Item not found.");
    }

    const sql = `
            INSERT INTO store_items (store_id, item_id, quantity)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
        `;
    const params = [storeId, itemId, quantity];

    try {
      const result = await query(sql, params);
      return result;
    } catch (error: any) {
      console.error("Error adding/updating store item:", error);
      throw new Error("Could not add item to store.");
    }
  }

  /**
   * Updates the quantity of an existing item in a store.
   * @param storeId The ID of the store.
   * @param itemId The ID of the item.
   * @param newQuantity The new quantity of the item.
   * @returns A boolean indicating if the update was successful.
   */
  public static async updatestoreItemQuantity(
    storeId: number,
    itemId: number,
    newQuantity: number
  ) {
    const sql =
      "UPDATE store_items SET quantity = ? WHERE store_id = ? AND item_id = ?";
    const params = [newQuantity, storeId, itemId];

    try {
      const result = await query(sql, params);
      // if (result.affectedRows === 0) {
      //   return false;
      // }
      return true;
    } catch (error) {
      console.error("Error updating store item quantity:", error);
      throw new Error("Could not update item quantity.");
    }
  }

  /**
   * Deletes an item from a specific store.
   * @param storeId The ID of the store.
   * @param itemId The ID of the item to remove.
   * @returns A boolean indicating if the deletion was successful.
   */
  public static async deletestoreItem(
    storeId: number,
    itemId: number
  ): Promise<boolean> {
    const sql = "DELETE FROM store_items WHERE store_id = ? AND item_id = ?";
    const params = [storeId, itemId];

    try {
      const result = await query(sql, params);
      // return result.affectedRows > 0;
      return true;
    } catch (error) {
      console.error("Error deleting store item:", error);
      throw new Error("Could not delete item from store.");
    }
  }

  /**
   * Retrieves all items available in a specific store.
   * @param storeId The ID of the store.
   * @returns A list of items in the store.
   */
  public static async getItemsBystoreId(storeId: number): Promise<ShopItem[]> {
    const sql = `
            SELECT 
                si.quantity,
                i.id AS id,
                i.code AS code,
                i.name AS name,
                i.model AS model,
                c.name AS category,
                b.name AS brand,
                i.image,
                i.price AS price,
                i.minimum_stock
            FROM store_items si
            JOIN items i ON si.item_id = i.id
            JOIN categories c ON i.category_id = c.id
            JOIN brands b ON i.brand_id = b.id
            WHERE si.store_id = ?
            ORDER BY i.name ASC
        `;
    try {
      const rows = await query(sql, [storeId]);
      return rows;
    } catch (error) {
      console.error("Error fetching items for store:", error);
      throw new Error("Could not fetch items for the store.");
    }
  }

  //   list all item in all store
  public static async getAllItems(): Promise<ShopItem[]> {
    const sql = `
            SELECT 
                si.quantity,
                i.id AS item_id,
                i.name AS item_name,
                i.code AS item_code,
                i.model AS item_model,
                i.price AS item_price
            FROM store_items si
            JOIN items i ON si.item_id = i.id
            ORDER BY i.name ASC
        `;
    try {
      const rows = await query(sql);
      return rows;
    } catch (error) {
      console.error("Error fetching items for store:", error);
      throw new Error("Could not fetch items for the store.");
    }
  }

  // get item by id in all store
  public static async getItemByItemId(itemId: number): Promise<ShopItem[]> {
    const sql = `
            SELECT 
                si.quantity,
                i.id AS item_id,
                i.name AS item_name,
                i.code AS item_code,
                i.model AS item_model,
                i.price AS item_price
            FROM store_items si
            JOIN items i ON si.item_id = i.id
            WHERE i.id = ?
        `;
    try {
      const rows = await query(sql, [itemId]);
      return rows;
    } catch (error) {
      console.error("Error fetching items for store:", error);
      throw new Error("Could not fetch items for the store.");
    }
  }

  // getItemsBystoreIdAndItemId
  public static async getItemsBystoreIdAndItemId(
    storeId: number,
    itemId: number
  ): Promise<ShopItem[]> {
    const sql = `
            SELECT 
                si.quantity,
                i.id AS item_id,
                i.name AS item_name,
                i.code AS item_code,
                i.model AS item_model,
                i.price AS item_price
            FROM store_items si
            JOIN items i ON si.item_id = i.id
            WHERE si.store_id = ? AND si.item_id = ?
        `;
    try {
      const rows = await query(sql, [storeId, itemId]);
      return rows;
    } catch (error) {
      console.error("Error fetching items for store:", error);
      throw new Error("Could not fetch items for the store.");
    }
  }

  // Add multiple items to a store
  public static async addMultiplestoreItems(
    storeId: number,
    items: { itemId: number; quantity: number }[]
  ): Promise<void> {
    if (!items || items.length === 0) {
      return;
    }

    // Validate store exists
    const storeExists = await query("SELECT 1 FROM stores WHERE id = ?", [
      storeId,
    ]);
    if (storeExists.length === 0) {
      throw new Error("store not found.");
    }

    // Validate item ids exist
    const itemIds = Array.from(new Set(items.map((it) => it.itemId)));
    const placeholders = itemIds.map(() => "?").join(",");
    const existingRows = await query(
      `SELECT id FROM items WHERE id IN (${placeholders})`,
      itemIds
    );
    const existingIds = new Set(existingRows.map((r: any) => r.id));
    const missing = itemIds.filter((id) => !existingIds.has(id));
    if (missing.length > 0) {
      throw new Error(`Items not found: ${missing.join(", ")}`);
    }

    // Build single bulk insert with ON DUPLICATE KEY UPDATE
    const valuePlaceholders = items.map(() => "(?, ?, ?)").join(", ");
    const sql = `
            INSERT INTO store_items (store_id, item_id, quantity)
            VALUES ${valuePlaceholders}
            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
        `;
    const params: any[] = [];
    for (const it of items) {
      params.push(storeId, it.itemId, it.quantity);
    }

    try {
      await query(sql, params);
    } catch (error: any) {
      console.error("Error adding multiple store items:", error);
      throw new Error("Could not add multiple items to store.");
    }
  }
}
