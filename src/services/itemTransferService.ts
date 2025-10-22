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
  async createTransfer({
    fromType,
    fromId,
    toType,
    toId,
    items,
  }: CreateTransferInput): Promise<number> {
    return await transaction(async (connection) => {
      const [insertResult]: any = await connection.execute(
        `INSERT INTO item_transfers (from_type, from_id, to_type, to_id)
         VALUES (?, ?, ?, ?)`,
        [fromType, fromId, toType, toId]
      );

      const transferId = insertResult.insertId;

      for (const item of items) {
        await connection.execute(
          `INSERT INTO transfer_items (transfer_id, product_id, quantity)
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
      FROM item_transfers t
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
      FROM item_transfers t
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
