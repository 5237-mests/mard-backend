import { query, transaction } from "../config/db";
import { Store } from "../types/database";

export class StoreService {
  /**
   * Creates a new store in the database.
   * @param name The name of the store.
   * @param location The location of the store.
   * @returns The newly created store object.
   */
  public static async createStore(
    name: string,
    location: string
  ): Promise<Store[]> {
    const sql = "INSERT INTO stores (name, location) VALUES (?, ?)";
    const params = [name, location];
    try {
      const result = await query(sql, params);
      return result;
    } catch (error) {
      console.error("Error creating store:", error);
      throw new Error("Could not create store.");
    }
  }

  /**
   * Retrieves all stores from the database.
   * @returns A list of all stores.
   */
  public static async getStores(): Promise<Store[]> {
    const sql = "SELECT * FROM stores";
    try {
      const rows = await query(sql);
      return rows;
    } catch (error) {
      console.error("Error fetching stores:", error);
      throw new Error("Could not fetch stores.");
    }
  }

  /**
   * Retrieves a single store by its ID.
   * @param id The ID of the store to retrieve.
   * @returns The store object or null if not found.
   */
  public static async getStoreById(id: number): Promise<Store[]> {
    const sql = "SELECT * FROM stores WHERE id = ?";
    try {
      const rows = await query(sql, [id]);
      if (rows.length === 0) {
        return [];
      }
      return rows;
    } catch (error) {
      console.error("Error fetching store by ID:", error);
      throw new Error("Could not fetch store.");
    }
  }

  /**
   * Updates an existing store.
   * @param id The ID of the store to update.
   * @param name The new name of the store (optional).
   * @param location The new location of the store (optional).
   * @returns The updated store object or null if the store was not found.
   */
  public static async updateStore(
    id: number,
    name?: string,
    location?: string
  ): Promise<Store[]> {
    const updates = [];
    const params = [];
    if (name !== undefined) {
      updates.push("name = ?");
      params.push(name);
    }
    if (location !== undefined) {
      updates.push("location = ?");
      params.push(location);
    }

    if (updates.length === 0) {
      throw new Error("No fields provided to update.");
    }

    const sql = `UPDATE stores SET ${updates.join(", ")} WHERE id = ?`;
    params.push(id);

    try {
      const result = await query(sql, params);
      if (result.affectedRows === 0) {
        return [];
      }
      return this.getStoreById(id);
    } catch (error) {
      console.error("Error updating store:", error);
      throw new Error("Could not update store.");
    }
  }

  /**
   * Deletes a store by its ID.
   * @param id The ID of the store to delete.
   * @returns A boolean indicating if the deletion was successful.
   */
  public static async deleteStore(id: number): Promise<boolean> {
    const sql = "DELETE FROM stores WHERE id = ?";
    try {
      const result = await query(sql, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error deleting store:", error);
      throw new Error("Could not delete store.");
    }
  }
}
