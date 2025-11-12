import { query, transaction } from "../config/db";

/**
 * Minimal types used by service.
 */
export interface DeadstockReportInput {
  item_id: number;
  quantity: number;
  sourceType: "store" | "shop";
  sourceId: number;
  reason?: string;
  notes?: string;
  user_id?: number | null;
}

export const deadstockService = {
  async reportDeadstock(input: DeadstockReportInput): Promise<number> {
    // validate positive qty
    const qty = Number(input.quantity);
    if (!Number.isInteger(qty) || qty <= 0) throw new Error("Invalid quantity");

    return await transaction(async (conn) => {
      // validate item exists
      const [itemRows]: any = await conn.execute(
        "SELECT id FROM items WHERE id = ?",
        [input.item_id]
      );
      if (!itemRows || itemRows.length === 0) throw new Error("Item not found");

      // check & decrement source inventory
      if (input.sourceType === "store") {
        const [rows]: any = await conn.execute(
          "SELECT quantity FROM store_items WHERE store_id = ? AND item_id = ? FOR UPDATE",
          [input.sourceId, input.item_id]
        );
        const avail = rows?.length ? Number(rows[0].quantity) : 0;
        if (avail < qty) throw new Error("Insufficient stock in source store");
        await conn.execute(
          "UPDATE store_items SET quantity = quantity - ? WHERE store_id = ? AND item_id = ?",
          [qty, input.sourceId, input.item_id]
        );
      } else {
        const [rows]: any = await conn.execute(
          "SELECT quantity FROM shop_items WHERE shop_id = ? AND item_id = ? FOR UPDATE",
          [input.sourceId, input.item_id]
        );
        const avail = rows?.length ? Number(rows[0].quantity) : 0;
        if (avail < qty) throw new Error("Insufficient stock in source shop");
        await conn.execute(
          "UPDATE shop_items SET quantity = quantity - ? WHERE shop_id = ? AND item_id = ?",
          [qty, input.sourceId, input.item_id]
        );
      }

      // insert deadstock record
      const fromStoreCol =
        input.sourceType === "store" ? "source_store_id" : "source_shop_id";
      const fromStoreVal = input.sourceType === "store" ? input.sourceId : null;
      const fromShopVal = input.sourceType === "shop" ? input.sourceId : null;

      const [ins]: any = await conn.execute(
        `INSERT INTO deadstock
         (item_id, source_type, source_store_id, source_shop_id, quantity, reason, notes, created_by_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          input.item_id,
          input.sourceType,
          fromStoreVal,
          fromShopVal,
          qty,
          input.reason || null,
          input.notes || null,
          input.user_id || null,
        ]
      );

      return ins.insertId;
    });
  },

  async getAllDeadstock(opts?: {
    status?: string;
    sourceType?: "store" | "shop" | string;
    fromDate?: string;
    toDate?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    const where: string[] = [];
    const params: any[] = [];

    if (opts?.status) {
      where.push("d.status = ?");
      params.push(opts.status);
    }
    if (opts?.sourceType) {
      where.push("d.source_type = ?");
      params.push(opts.sourceType);
    }
    if (opts?.fromDate) {
      where.push("d.created_at >= ?");
      params.push(`${opts.fromDate} 00:00:00`);
    }
    if (opts?.toDate) {
      where.push("d.created_at <= ?");
      params.push(`${opts.toDate} 23:59:59`);
    }
    if (opts?.search) {
      const s = `%${opts.search}%`;
      where.push(
        "(i.name LIKE ? OR i.code LIKE ? OR d.reason LIKE ? OR d.notes LIKE ? OR CAST(d.id AS CHAR) LIKE ?)"
      );
      params.push(s, s, s, s, s);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const countSql = `
      SELECT COUNT(*) AS total
      FROM deadstock d
      JOIN items i ON d.item_id = i.id
      ${whereSql}
    `;
    const countRows: any = await query(countSql, params);
    const total = Number(countRows?.[0]?.total ?? 0);

    const page = opts?.page && opts.page > 0 ? opts.page : 1;
    const pageSize = opts?.pageSize && opts.pageSize > 0 ? opts.pageSize : 25;
    const offset = (page - 1) * pageSize;

    const mainSql = `
      SELECT
        d.*,
        i.name AS item_name,
        i.code AS item_code,
        COALESCE(s.name, sh.name) AS source_name,
        u.id AS created_by_id,
        u.name AS created_by_name
      FROM deadstock d
      JOIN items i ON d.item_id = i.id
      LEFT JOIN stores s ON d.source_type = 'store' AND d.source_store_id = s.id
      LEFT JOIN shops sh ON d.source_type = 'shop' AND d.source_shop_id = sh.id
      LEFT JOIN users u ON d.created_by_id = u.id
      ${whereSql}
      ORDER BY d.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const rows: any = await query(mainSql, params.concat([pageSize, offset]));

    return { items: rows, total, page, pageSize };
  },

  async getDeadstockById(id: number) {
    const rows: any = await query(
      `SELECT d.*,
              i.name AS item_name, i.code AS item_code, i.model AS item_model, i.price AS item_price,
              COALESCE(s.name, sh.name) AS source_name,
              u.id AS created_by_id, u.name AS created_by_name
       FROM deadstock d
       JOIN items i ON d.item_id = i.id
       LEFT JOIN stores s ON d.source_type = 'store' AND d.source_store_id = s.id
       LEFT JOIN shops sh ON d.source_type = 'shop' AND d.source_shop_id = sh.id
       LEFT JOIN users u ON d.created_by_id = u.id
       WHERE d.id = ?`,
      [id]
    );
    if (!rows.length) throw new Error("Deadstock not found");
    return rows[0];
  },

  async resolveDeadstock(
    id: number,
    action: "resolved" | "discarded",
    notes?: string,
    user_id?: number
  ) {
    return await transaction(async (conn) => {
      const [row]: any = await conn.execute(
        "SELECT * FROM deadstock WHERE id = ? FOR UPDATE",
        [id]
      );
      if (!row.length) throw new Error("Deadstock not found");

      const rec = row[0];

      if (action === "resolved") {
        if (rec.source_type === "store") {
          await conn.execute(
            "UPDATE store_items SET quantity = quantity + ? WHERE store_id = ? AND item_id = ?",
            [rec.quantity, rec.source_store_id, rec.item_id]
          );
        } else {
          await conn.execute(
            "UPDATE shop_items SET quantity = quantity + ? WHERE shop_id = ? AND item_id = ?",
            [rec.quantity, rec.source_shop_id, rec.item_id]
          );
        }
      }

      await conn.execute(
        `UPDATE deadstock 
       SET status = ?, resolved_at = NOW(), notes = COALESCE(notes, ?)
       WHERE id = ?`,
        [action, notes || null, id]
      );

      return true;
    });
  },

  async deleteDeadstock(id: number) {
    await query("DELETE FROM deadstock WHERE id = ?", [id]);
    return true;
  },
};
