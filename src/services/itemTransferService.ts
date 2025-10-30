import { query, transaction } from "../config/db";

export interface TransferItem {
  product_id: number;
  quantity: number;
}

export interface CreateTransferInput {
  fromType: "store" | "shop";
  fromId: number;
  toType: "store" | "shop";
  toId: number;
  items: TransferItem[];
}

export const itemTransferService = {
  // Transfer all items from shop back to store
  // remove everything in shop and add to store
  async transferAllShopItemToStore(
    shopId: number,
    storeId: number,
    userId: number
  ): Promise<number> {
    return await transaction(async (connection) => {
      // validate shop
      const [shopRows]: any = await connection.execute(
        "SELECT 1 FROM shops WHERE id = ?",
        [shopId]
      );
      if (!shopRows || shopRows.length === 0) {
        throw new Error("Shop not found");
      }

      // validate store
      const [storeRows]: any = await connection.execute(
        "SELECT 1 FROM stores WHERE id = ?",
        [storeId]
      );
      if (!storeRows || storeRows.length === 0) {
        throw new Error("Store not found");
      }

      // get all items in the shop filter only if quantity > 0
      const [shopItems]: any = await connection.execute(
        // "SELECT item_id, quantity FROM shop_items WHERE shop_id = ?",
        "SELECT item_id, quantity FROM shop_items WHERE shop_id = ? AND quantity > 0",
        [shopId]
      );

      if (!shopItems || shopItems.length === 0) {
        // nothing to transfer; return 0 to indicate no transfer created
        return 0;
      }

      // create transfer record
      const [insertResult]: any = await connection.execute(
        `INSERT INTO transfers (from_type, from_shop_id, to_type, to_store_id, created_by_id)
         VALUES (?, ?, ?, ?, ?)`,
        ["shop", shopId, "store", storeId, userId]
      );
      const transferId = insertResult.insertId;

      // insert transfer_items rows
      for (const it of shopItems) {
        await connection.execute(
          `INSERT INTO transfer_items (transfer_id, item_id, quantity)
           VALUES (?, ?, ?)`,
          [transferId, it.item_id, it.quantity]
        );
      }

      // upsert into store_items (add quantities)
      const valuePlaceholders = shopItems.map(() => "(?, ?, ?)").join(", ");
      const upsertSql = `
        INSERT INTO store_items (store_id, item_id, quantity)
        VALUES ${valuePlaceholders}
        ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
      `;
      const upsertParams: any[] = [];
      for (const it of shopItems) {
        upsertParams.push(storeId, it.item_id, it.quantity);
      }
      await connection.execute(upsertSql, upsertParams);

      // remove all items from shop
      await connection.execute("DELETE FROM shop_items WHERE shop_id = ?", [
        shopId,
      ]);

      return transferId;
    });
  },

  // Create a new item transfer.
  async createTransfer({
    fromType,
    fromId,
    toType,
    toId,
    items,
  }: CreateTransferInput): Promise<number> {
    return await transaction(async (connection) => {
      const [insertResult]: any = await connection.execute(
        `INSERT INTO transfers (from_type, from_id, to_type, to_id)
         VALUES (?, ?, ?, ?)`,
        [fromType, fromId, toType, toId]
      );

      const transferId = insertResult.insertId;

      for (const item of items) {
        await connection.execute(
          `INSERT INTO transfer_items (transfer_id, item_id, quantity)
           VALUES (?, ?, ?)`,
          [transferId, item.product_id, item.quantity]
        );
      }

      return transferId;
    });
  },

  async getAllTransfers() {
    return await query(
      `
      SELECT
        t.id,
        t.reference,
        t.from_type,
        COALESCE(fs.name, fsh.name) AS from_name,
        t.to_type,
        COALESCE(ts.name, tsh.name) AS to_name,
        t.status,
        t.created_at
      FROM transfers t
      LEFT JOIN stores fs ON t.from_type = 'store' AND t.from_shop_id = fs.id
      LEFT JOIN shops fsh ON t.from_type = 'shop' AND t.from_store_id = fsh.id
      LEFT JOIN stores ts ON t.to_type = 'store' AND t.to_store_id = ts.id
      LEFT JOIN shops tsh ON t.to_type = 'shop' AND t.to_shop_id = tsh.id
      ORDER BY t.created_at DESC
      `
    );
  },

  async getTransferById(id: number) {
    const transfers = await query(
      `SELECT 
        t.*, 
        COALESCE(fs.name, fsh.name) AS from_name,
        COALESCE(ts.name, tsh.name) AS to_name
      FROM transfers t
      LEFT JOIN stores fs ON t.from_type = 'store' AND t.from_id = fs.id
      LEFT JOIN shops fsh ON t.from_type = 'shop' AND t.from_id = fsh.id
      LEFT JOIN stores ts ON t.to_type = 'store' AND t.to_id = ts.id
      LEFT JOIN shops tsh ON t.to_type = 'shop' AND t.to_id = tsh.id
      WHERE t.id = ?
      `,
      [id]
    );

    if (!transfers.length) throw new Error("Transfer not found");

    const items = await query(
      `SELECT ti.*, p.name AS product_name
       FROM transfer_items ti
       JOIN products p ON ti.product_id = p.id
       WHERE ti.transfer_id = ?`,
      [id]
    );

    return { ...transfers[0], items };
  },
};
