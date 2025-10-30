// File: src/services/storestorekeeperService.ts
// This service layer handles the business logic for the store_storekeepers junction table.

import { query } from "../config/db";

export class StoreStorekeeperService {
  /**
   * Links a storekeeper to a specific store.
   * @param storeId The ID of the store.
   * @param userId The ID of the user (storekeeper).
   * @returns An object representing the new link.
   */
  public static async addStorekeeperTostore(
    storeId: number,
    userId: number
  ): Promise<any> {
    // First, check if the store and user exist to maintain foreign key integrity.
    const storeExists = await query("SELECT 1 FROM stores WHERE id = ?", [
      storeId,
    ]);
    if (storeExists.length === 0) {
      throw new Error("store not found.");
    }

    const userExists = await query(
      'SELECT 1 FROM users WHERE id = ? AND role = "storeKEEPER" OR role = "ADMIN"',
      [userId]
    );
    if (userExists.length === 0) {
      throw new Error("User not found or is not a storekeeper.");
    }

    const sql = `
            INSERT INTO store_storekeepers (store_id, user_id)
            VALUES (?, ?);
        `;
    const params = [storeId, userId];

    try {
      await query(sql, params);
      return { store_id: storeId, user_id: userId };
    } catch (error: any) {
      console.error("Error adding storekeeper to store:", error);
      if (error.code === "ER_DUP_ENTRY") {
        throw new Error("This storekeeper is already assigned to this store.");
      }
      throw new Error("Could not add storekeeper to store.");
    }
  }

  /**
   * Unlinks a storekeeper from a specific store.
   * @param storeId The ID of the store.
   * @param userId The ID of the user (storekeeper).
   * @returns A boolean indicating if the deletion was successful.
   */
  public static async removeStorekeeperFromstore(
    storeId: number,
    userId: number
  ): Promise<boolean> {
    const sql =
      "DELETE FROM store_storekeepers WHERE store_id = ? AND user_id = ?";
    const params = [storeId, userId];

    try {
      const result = await query(sql, params);
      // return result.affectedRows > 0;
      return true; // Assume success if no error is thrown
    } catch (error) {
      console.error("Error removing storekeeper from store:", error);
      throw new Error("Could not remove storekeeper.");
    }
  }

  /**
   * Retrieves all storekeepers for a specific store.
   * @param storeId The ID of the store.
   * @returns A list of users (storekeepers) for the store.
   */
  public static async getStorekeepersByStoreId(
    storeId: number
  ): Promise<any[]> {
    const sql = `
            SELECT
                u.id,
                u.name,
                u.email
            FROM users u
            JOIN store_storekeepers ssk ON u.id = ssk.user_id
            WHERE ssk.store_id = ?;
        `;
    try {
      const rows = query(sql, [storeId]);
      return rows;
    } catch (error) {
      console.error("Error fetching storekeepers for store:", error);
      throw new Error("Could not retrieve storekeepers.");
    }
  }

  /**
   * Retrieves all stores for a specific storekeeper.
   * @param userId The ID of the user (storekeeper).
   * @returns A list of stores for the storekeeper.
   */
  public static async getStoresByStorekeeperId(userId: number) {
    const sql = `
            SELECT
                s.id,
                s.name,
                s.location
            FROM stores s
            JOIN store_storekeepers ssk ON s.id = ssk.store_id
            WHERE ssk.user_id = ?;
        `;
    try {
      const rows = await query(sql, [userId]);
      return rows;
    } catch (error) {
      console.error("Error fetching stores for storekeeper:", error);
      throw new Error("Could not retrieve stores.");
    }
  }
}
