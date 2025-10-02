import { Item } from "../types/database";
import { query } from "../config/db";

export class ItemService {
  /**
   * Retrieves all items from the database.
   * @returns {Promise<Item[]>} A promise that resolves to an array of all items.
   */
  async getAllItems(): Promise<Item[]> {
    // join brands and categories to get more details
    const sql = `SELECT items.*, brands.name AS brand_name, categories.name AS category_name
                 FROM items
                 JOIN brands ON items.brand_id = brands.id
                 JOIN categories ON items.category_id = categories.id
                 ORDER BY items.name ASC`;
    const result = await query(sql);
    return result;
  }

  /**
   * Retrieves an item by its ID from the database.
   * @param id - The ID of the item to retrieve.
   * @returns {Promise<Item | null>} A promise that resolves to the item object if found, otherwise null.
   */
  async getItemById(id: number) {
    const sql = `SELECT * FROM items WHERE id = ?`;
    const result = await query(sql, [id]);
    return result;
  }
  /**
   * Creates a new item in the database.
   * @param item - The item object containing the details to create.
   * @returns {Promise<Item>} A promise that resolves to the newly created item object.
   */
  async createItem01(item: Item) {
    const params = [
      item.name,
      item.description,
      item.model,
      item.price,
      item.brand_id,
      item.category_id,
      // item.stock_quantity,
      item.minimum_stock,
    ];

    // Check product existed by name
    const checkSql = `SELECT * FROM items WHERE name = ?`;
    const existingItems = await query(checkSql, [item.name]);
    if (existingItems.length > 0) {
      return null;
    }
    // const sql = `INSERT INTO items (name, description, model, price, brand_id, category_id, stock_quantity, minimum_stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const sql = `INSERT INTO items (name, description, model, price, brand_id, category_id, minimum_stock) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const result = await query(sql, params);
    return result;
  }

  async createItem(item: Item) {
    // Check if item exists by name.
    const checkSql = `SELECT * FROM items WHERE name = ?`;
    const existingItems = await query(checkSql, [item.name]);
    if (existingItems.length > 0) {
      return null;
    }

    const sql = `
      INSERT INTO items (name, description, model, price, brand_id, category_id, minimum_stock, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      item.name,
      item.description || null,
      item.model,
      item.price,
      item.brand_id,
      item.category_id || null,
      item.minimum_stock || 0,
      item.image || null,
    ];

    const result = await query(sql, params);
    // Return the inserted item (you might want to fetch it fully).
    return result;
  }

  /**
   * Updates an item in the database.
   * @param id - The ID of the item to update.
   * @param itemData - The item object containing the details to update.
   * @returns {Promise<Item | null>} A promise that resolves to the item object if found and updated, otherwise null.
   */
  async updateItem(id: number, itemData: Partial<Item>) {
    const setValues = Object.entries(itemData)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key} = ?`)
      .join(", ");
    const updateSql = `UPDATE items SET ${setValues} WHERE id = ?`;
    const result = await query(updateSql, [...Object.values(itemData), id]);
    return result;
  }

  /**
   * Deletes an item from the database.
   * @param id - The ID of the item to delete.
   * @returns {Promise<void>} A promise that resolves when the item is deleted.
   */
  async deleteItem(id: number): Promise<void> {
    const sql = `DELETE FROM items WHERE id = ?`;
    await query(sql, [id]);
  }
}
