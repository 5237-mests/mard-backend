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
  user_id: number;
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
    user_id,
  }: CreateTransferInput): Promise<number> {
    // check user linked with store/shop?
    const [userRows]: any = await query(
      fromType === "store"
        ? "SELECT 1 FROM store_storekeepers WHERE store_id = ? AND user_id = ?"
        : "SELECT 1 FROM shop_shopkeepers WHERE shop_id = ? AND user_id = ?",
      [fromId, user_id]
    );
    if (!userRows || userRows.length === 0) {
      throw new Error("User not authorized for the source branch");
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Transfer must include at least one item");
    }

    return await transaction(async (connection) => {
      // validate branches
      const [fromRows]: any = await connection.execute(
        fromType === "store"
          ? "SELECT 1 FROM stores WHERE id = ?"
          : "SELECT 1 FROM shops WHERE id = ?",
        [fromId]
      );
      if (!fromRows || fromRows.length === 0) {
        throw new Error(`${fromType} (from) not found`);
      }

      const [toRows]: any = await connection.execute(
        toType === "store"
          ? "SELECT 1 FROM stores WHERE id = ?"
          : "SELECT 1 FROM shops WHERE id = ?",
        [toId]
      );
      if (!toRows || toRows.length === 0) {
        throw new Error(`${toType} (to) not found`);
      }

      // validate items exist in items table
      const itemIds = Array.from(
        new Set(items.map((it) => Number(it.product_id)))
      );
      const placeholders = itemIds.map(() => "?").join(",");
      const [existingItems]: any = await connection.execute(
        `SELECT id FROM items WHERE id IN (${placeholders})`,
        itemIds
      );
      const existingSet = new Set((existingItems as any[]).map((r) => r.id));
      const missing = itemIds.filter((id) => !existingSet.has(id));
      if (missing.length > 0) {
        throw new Error(`Missing items: ${missing.join(", ")}`);
      }

      // validate quantities
      for (const it of items) {
        const qty = Number(it.quantity);
        if (!Number.isFinite(qty) || !Number.isInteger(qty) || qty <= 0) {
          throw new Error(`Invalid quantity for product ${it.product_id}`);
        }
      }

      // generate reference and insert transfer
      const reference = `TRF-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
      const [insertResult]: any = await connection.execute(
        `INSERT INTO transfers (reference, from_type, from_${fromType}_id, to_type, to_${toType}_id, created_by_id, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [reference, fromType, fromId, toType, toId, user_id, "completed"]
      );
      const transferId = insertResult.insertId;

      // insert transfer_items and update inventories
      for (const it of items) {
        const itemId = Number(it.product_id);
        const qty = Number(it.quantity);

        // insert transfer_items row
        await connection.execute(
          `INSERT INTO transfer_items (transfer_id, item_id, quantity)
           VALUES (?, ?, ?)`,
          [transferId, itemId, qty]
        );

        // decrement source inventory
        if (fromType === "store") {
          // check available
          const [rows]: any = await connection.execute(
            "SELECT quantity FROM store_items WHERE store_id = ? AND item_id = ?",
            [fromId, itemId]
          );
          const avail = rows && rows.length ? Number(rows[0].quantity) : 0;
          if (avail < qty) {
            throw new Error(
              `Insufficient stock for item ${itemId} in source store`
            );
          }
          await connection.execute(
            "UPDATE store_items SET quantity = quantity - ? WHERE store_id = ? AND item_id = ?",
            [qty, fromId, itemId]
          );
        } else {
          const [rows]: any = await connection.execute(
            "SELECT quantity FROM shop_items WHERE shop_id = ? AND item_id = ?",
            [fromId, itemId]
          );
          const avail = rows && rows.length ? Number(rows[0].quantity) : 0;
          if (avail < qty) {
            throw new Error(
              `Insufficient stock for item ${itemId} in source shop`
            );
          }
          await connection.execute(
            "UPDATE shop_items SET quantity = quantity - ? WHERE shop_id = ? AND item_id = ?",
            [qty, fromId, itemId]
          );
        }

        // upsert destination inventory (add quantities)
        if (toType === "store") {
          await connection.execute(
            `INSERT INTO store_items (store_id, item_id, quantity)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
            [toId, itemId, qty]
          );
        } else {
          await connection.execute(
            `INSERT INTO shop_items (shop_id, item_id, quantity)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
            [toId, itemId, qty]
          );
        }
      }

      return transferId;
    });
  },

  async getAllTransfers(opts?: {
    status?: string;
    fromType?: "store" | "shop" | string;
    fromDate?: string;
    toDate?: string;
    search?: string; // existing general search (reference / branch names)
    itemSearch?: string; // NEW: search by item name/code/model
    shop_id?: number; // NEW: filter by shop id (either from or to)
    store_id?: number; // NEW: filter by store id (either from or to)
    page?: number;
    pageSize?: number;
  }) {
    // build where clauses dynamically
    const where: string[] = [];
    const params: any[] = [];

    if (opts?.status) {
      where.push("t.status = ?");
      params.push(opts.status);
    }
    if (opts?.fromType) {
      where.push("t.from_type = ?");
      params.push(opts.fromType);
    }
    if (opts?.fromDate) {
      where.push("t.created_at >= ?");
      params.push(`${opts.fromDate} 00:00:00`);
    }
    if (opts?.toDate) {
      where.push("t.created_at <= ?");
      params.push(`${opts.toDate} 23:59:59`);
    }

    if (opts?.shop_id !== undefined && opts?.shop_id !== null) {
      where.push("(t.from_shop_id = ? OR t.to_shop_id = ?)");
      params.push(opts.shop_id, opts.shop_id);
    }

    if (opts?.store_id !== undefined && opts?.store_id !== null) {
      where.push("(t.from_store_id = ? OR t.to_store_id = ?)");
      params.push(opts.store_id, opts.store_id);
    }

    // item-level search: include transfers that contain matching items
    if (opts?.itemSearch) {
      const s = `%${opts.itemSearch}%`;
      where.push(
        `EXISTS (
           SELECT 1 FROM transfer_items ti
           JOIN items i ON ti.item_id = i.id
           WHERE ti.transfer_id = t.id
             AND (i.name LIKE ? OR i.code LIKE ? OR i.model LIKE ?)
         )`
      );
      params.push(s, s, s);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // count total matching rows (no aggregation)
    const countSql = `
      SELECT COUNT(*) AS total
      FROM transfers t
      LEFT JOIN stores fs ON t.from_type = 'store' AND t.from_store_id = fs.id
      LEFT JOIN shops  fsh ON t.from_type = 'shop'  AND t.from_shop_id  = fsh.id
      LEFT JOIN stores ts ON t.to_type   = 'store' AND t.to_store_id   = ts.id
      LEFT JOIN shops  tsh ON t.to_type   = 'shop'  AND t.to_shop_id    = tsh.id
      ${whereSql}
    `;

    const countRows: any = await query(countSql, params);
    const total = Number(countRows?.[0]?.total ?? 0);

    // pagination
    const page = opts?.page && opts.page > 0 ? opts.page : 1;
    const pageSize = opts?.pageSize && opts.pageSize > 0 ? opts.pageSize : 25;
    const offset = (page - 1) * pageSize;

    // main query with aggregated items JSON
    const mainSql = `
      SELECT
        t.id,
        t.reference,
        t.from_type,
        COALESCE(fs.name, fsh.name) AS from_name,
        t.to_type,
        COALESCE(ts.name, tsh.name) AS to_name,
        t.status,
        (SELECT COUNT(*) FROM transfer_items ti WHERE ti.transfer_id = t.id) AS item_count,
        (SELECT COALESCE(SUM(ti.quantity),0) FROM transfer_items ti WHERE ti.transfer_id = t.id) AS total_quantity,
        IFNULL(items_agg.items, JSON_ARRAY()) AS items,
        t.created_at
      FROM transfers t
      LEFT JOIN stores fs ON t.from_type = 'store' AND t.from_store_id = fs.id
      LEFT JOIN shops  fsh ON t.from_type = 'shop'  AND t.from_shop_id  = fsh.id
      LEFT JOIN stores ts ON t.to_type   = 'store' AND t.to_store_id   = ts.id
      LEFT JOIN shops  tsh ON t.to_type   = 'shop'  AND t.to_shop_id    = tsh.id
      LEFT JOIN (
        SELECT
          ti.transfer_id,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'product_id', ti.item_id,
              'quantity', ti.quantity,
              'name', i.name,
              'code', i.code,
              'model', i.model,
              'price', i.price
            )
          ) AS items
        FROM transfer_items ti
        JOIN items i ON ti.item_id = i.id
        GROUP BY ti.transfer_id
      ) items_agg ON items_agg.transfer_id = t.id
      ${whereSql}
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `;

    // params + pagination values
    const mainParams = params.concat([pageSize, offset]);
    const rows: any = await query(mainSql, mainParams);

    // parse JSON column if returned as string
    const items = (rows as any[]).map((r) => {
      try {
        if (typeof r.items === "string") r.items = JSON.parse(r.items);
      } catch {
        r.items = r.items || [];
      }
      return r;
    });

    return { items, total, page, pageSize };
  },

  async getAllTransfers2(opts?: {
    status?: string;
    fromType?: "store" | "shop" | string;
    fromDate?: string;
    toDate?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    // build where clauses dynamically
    const where: string[] = [];
    const params: any[] = [];

    if (opts?.status) {
      where.push("t.status = ?");
      params.push(opts.status);
    }
    if (opts?.fromType) {
      where.push("t.from_type = ?");
      params.push(opts.fromType);
    }
    if (opts?.fromDate) {
      where.push("t.created_at >= ?");
      params.push(`${opts.fromDate} 00:00:00`);
    }
    if (opts?.toDate) {
      where.push("t.created_at <= ?");
      params.push(`${opts.toDate} 23:59:59`);
    }
    if (opts?.search) {
      // simple search across reference and branch names
      const s = `%${opts.search}%`;
      where.push(
        "(t.reference LIKE ? OR fs.name LIKE ? OR fsh.name LIKE ? OR ts.name LIKE ? OR tsh.name LIKE ? OR CAST(t.id AS CHAR) LIKE ?)"
      );
      params.push(s, s, s, s, s, s);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // count total matching rows (no aggregation)
    const countSql = `
      SELECT COUNT(*) AS total
      FROM transfers t
      LEFT JOIN stores fs ON t.from_type = 'store' AND t.from_store_id = fs.id
      LEFT JOIN shops  fsh ON t.from_type = 'shop'  AND t.from_shop_id  = fsh.id
      LEFT JOIN stores ts ON t.to_type   = 'store' AND t.to_store_id   = ts.id
      LEFT JOIN shops  tsh ON t.to_type   = 'shop'  AND t.to_shop_id    = tsh.id
      ${whereSql}
    `;
    const countRows: any = await query(countSql, params);
    const total = Number(countRows?.[0]?.total ?? 0);

    // pagination
    const page = opts?.page && opts.page > 0 ? opts.page : 1;
    const pageSize = opts?.pageSize && opts.pageSize > 0 ? opts.pageSize : 25;
    const offset = (page - 1) * pageSize;

    // main query with aggregated items JSON
    const mainSql = `
      SELECT
        t.id,
        t.reference,
        t.from_type,
        COALESCE(fs.name, fsh.name) AS from_name,
        t.to_type,
        COALESCE(ts.name, tsh.name) AS to_name,
        t.status,
        (SELECT COUNT(*) FROM transfer_items ti WHERE ti.transfer_id = t.id) AS item_count,
        (SELECT COALESCE(SUM(ti.quantity),0) FROM transfer_items ti WHERE ti.transfer_id = t.id) AS total_quantity,
        IFNULL(items_agg.items, JSON_ARRAY()) AS items,
        t.created_at
      FROM transfers t
      LEFT JOIN stores fs ON t.from_type = 'store' AND t.from_store_id = fs.id
      LEFT JOIN shops  fsh ON t.from_type = 'shop'  AND t.from_shop_id  = fsh.id
      LEFT JOIN stores ts ON t.to_type   = 'store' AND t.to_store_id   = ts.id
      LEFT JOIN shops  tsh ON t.to_type   = 'shop'  AND t.to_shop_id    = tsh.id
      LEFT JOIN (
        SELECT
          ti.transfer_id,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'product_id', ti.item_id,
              'quantity', ti.quantity,
              'name', i.name,
              'code', i.code,
              'model', i.model,
              'price', i.price
            )
          ) AS items
        FROM transfer_items ti
        JOIN items i ON ti.item_id = i.id
        GROUP BY ti.transfer_id
      ) items_agg ON items_agg.transfer_id = t.id
      ${whereSql}
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `;

    // params + pagination values
    const mainParams = params.concat([pageSize, offset]);
    const rows: any = await query(mainSql, mainParams);

    // parse JSON column if returned as string
    const items = (rows as any[]).map((r) => {
      try {
        if (typeof r.items === "string") r.items = JSON.parse(r.items);
      } catch {
        r.items = r.items || [];
      }
      return r;
    });

    return { items, total, page, pageSize };
  },

  async getTransferById(id: number) {
    const transfers = await query(
      `SELECT 
        t.*, 
        COALESCE(fs.name, fsh.name) AS from_name,
        COALESCE(ts.name, tsh.name) AS to_name,
        u.id   AS created_by_id,
        u.name AS created_by_name,
        u.email AS created_by_email
      FROM transfers t
      LEFT JOIN stores fs ON t.from_type = 'store' AND t.from_store_id = fs.id
      LEFT JOIN shops  fsh ON t.from_type = 'shop'  AND t.from_shop_id  = fsh.id
      LEFT JOIN stores ts ON t.to_type   = 'store' AND t.to_store_id   = ts.id
      LEFT JOIN shops  tsh ON t.to_type   = 'shop'  AND t.to_shop_id    = tsh.id
      LEFT JOIN users u ON t.created_by_id = u.id
      WHERE t.id = ?
      `,
      [id]
    );

    if (!transfers.length) throw new Error("Transfer not found");

    const items = await query(
      `SELECT 
         ti.item_id AS product_id,
         ti.quantity,
         i.name AS product_name,
         i.code AS product_code,
         i.model AS product_model,
         i.price AS product_price
       FROM transfer_items ti
       JOIN items i ON ti.item_id = i.id
       WHERE ti.transfer_id = ?
       ORDER BY ti.id ASC`,
      [id]
    );

    const item_count = items.length;
    const total_quantity = items.reduce(
      (acc, it: any) => acc + Number(it.quantity),
      0
    );
    // transfers[0] now includes created_by_id / created_by_name / created_by_email
    return { ...transfers[0], item_count, total_quantity, items };
  },
};
