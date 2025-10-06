// File: src/services/ShopItemService.ts
// This service layer handles the many-to-many relationship between shops and items.
import { query } from "../config/db";
import { ShopItem } from "../types/database";

export class ShopItemService {
  /**
   * Adds an item to a specific shop with a given quantity.
   * @param shopId The ID of the shop.
   * @param itemId The ID of the item.
   * @param quantity The quantity of the item to add.
   * @returns The created link object.
   */
  public static async addShopItem(
    shopId: number,
    itemId: number,
    quantity: number
  ) {
    // First, check if the shop and item exist to maintain foreign key integrity.
    const shopExists = await query("SELECT 1 FROM shops WHERE id = ?", [
      shopId,
    ]);
    if (shopExists.length === 0) {
      throw new Error("Shop not found.");
    }

    const itemExists = await query("SELECT 1 FROM items WHERE id = ?", [
      itemId,
    ]);
    if (itemExists.length === 0) {
      throw new Error("Item not found.");
    }

    const sql = `
            INSERT INTO shop_items (shop_id, item_id, quantity)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
        `;
    const params = [shopId, itemId, quantity];

    try {
      const result = await query(sql, params);
      return result;
    } catch (error: any) {
      console.error("Error adding/updating shop item:", error);
      throw new Error("Could not add item to shop.");
    }
  }

  /**
   * Updates the quantity of an existing item in a shop.
   * @param shopId The ID of the shop.
   * @param itemId The ID of the item.
   * @param newQuantity The new quantity of the item.
   * @returns A boolean indicating if the update was successful.
   */
  public static async updateShopItemQuantity(
    shopId: number,
    itemId: number,
    newQuantity: number
  ) {
    const sql =
      "UPDATE shop_items SET quantity = ? WHERE shop_id = ? AND item_id = ?";
    const params = [newQuantity, shopId, itemId];

    try {
      const result = await query(sql, params);
      // if (result.affectedRows === 0) {
      //   return false;
      // }
      return true;
    } catch (error) {
      console.error("Error updating shop item quantity:", error);
      throw new Error("Could not update item quantity.");
    }
  }

  /**
   * Deletes an item from a specific shop.
   * @param shopId The ID of the shop.
   * @param itemId The ID of the item to remove.
   * @returns A boolean indicating if the deletion was successful.
   */
  public static async deleteShopItem(
    shopId: number,
    itemId: number
  ): Promise<boolean> {
    const sql = "DELETE FROM shop_items WHERE shop_id = ? AND item_id = ?";
    const params = [shopId, itemId];

    try {
      const result = await query(sql, params);
      // return result.affectedRows > 0;
      return true;
    } catch (error) {
      console.error("Error deleting shop item:", error);
      throw new Error("Could not delete item from shop.");
    }
  }

  /**
   * Retrieves all items available in a specific shop.
   * @param shopId The ID of the shop.
   * @returns A list of items in the shop.
   */
  public static async getItemsByShopId(shopId: number): Promise<ShopItem[]> {
    const sql = `
            SELECT 
                si.quantity,
                i.id AS id,
                i.name AS name,
                i.model AS model,
                c.name AS category,
                b.name AS brand,
                i.image,
                i.price AS price,
                i.minimum_stock
            FROM shop_items si
            JOIN items i ON si.item_id = i.id
            JOIN categories c ON i.category_id = c.id
            JOIN brands b ON i.brand_id = b.id
            WHERE si.shop_id = ?
            ORDER BY i.name ASC
        `;
    try {
      const rows = await query(sql, [shopId]);
      return rows;
    } catch (error) {
      console.error("Error fetching items for shop:", error);
      throw new Error("Could not fetch items for the shop.");
    }
  }

  //   list all item in all shop
  public static async getAllItems(): Promise<ShopItem[]> {
    const sql = `
            SELECT 
                si.quantity,
                i.id AS item_id,
                i.name AS item_name,
                i.model AS item_model,
                i.price AS item_price
            FROM shop_items si
            JOIN items i ON si.item_id = i.id
            ORDER BY i.name ASC
        `;
    try {
      const rows = await query(sql);
      return rows;
    } catch (error) {
      console.error("Error fetching items for shop:", error);
      throw new Error("Could not fetch items for the shop.");
    }
  }

  // get item by id in all shop
  public static async getItemByItemId(itemId: number): Promise<ShopItem[]> {
    const sql = `
            SELECT 
                si.quantity,
                i.id AS item_id,
                i.name AS item_name,
                i.model AS item_model,
                i.price AS item_price
            FROM shop_items si
            JOIN items i ON si.item_id = i.id
            WHERE i.id = ?
        `;
    try {
      const rows = await query(sql, [itemId]);
      return rows;
    } catch (error) {
      console.error("Error fetching items for shop:", error);
      throw new Error("Could not fetch items for the shop.");
    }
  }

  // getItemsByShopIdAndItemId
  public static async getItemsByShopIdAndItemId(
    shopId: number,
    itemId: number
  ): Promise<ShopItem[]> {
    const sql = `
            SELECT 
                si.quantity,
                i.id AS item_id,
                i.name AS item_name,
                i.model AS item_model,
                i.price AS item_price
            FROM shop_items si
            JOIN items i ON si.item_id = i.id
            WHERE si.shop_id = ? AND si.item_id = ?
        `;
    try {
      const rows = await query(sql, [shopId, itemId]);
      return rows;
    } catch (error) {
      console.error("Error fetching items for shop:", error);
      throw new Error("Could not fetch items for the shop.");
    }
  }
}
