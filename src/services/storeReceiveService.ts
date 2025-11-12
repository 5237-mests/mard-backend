import { query, transaction } from "../config/db";
import { StoreItemService } from "./storeItemService";

/**
 * Service to manage store receives (receiving shipments into a store).
 *
 * Notes:
 * - create/edit operations allowed only while receive.status = 'pending'
 * - approve operation is transactional and will increment store_items quantities
 *   within the same DB transaction to ensure atomicity.
 */
export const storeReceiveService = {
  /**
   * Create a new receive (status = 'pending').
   * returns insert id
   */
  async createReceive(params: {
    store_id: number;
    created_by_id: number | null;
    reference_no?: string | null;
  }): Promise<number> {
    const { store_id, created_by_id, reference_no = null } = params;

    // ensure caller is authenticated (created_by_id must be present)
    if (!created_by_id)
      throw new Error("Authenticated user required to create receive");

    // validate store exists
    const storeRows: any = await query("SELECT id FROM stores WHERE id = ?", [
      store_id,
    ]);
    if (!storeRows.length) throw new Error("Store not found");

    const res: any = await query(
      `INSERT INTO store_receives (store_id, reference_no, status, created_by_id, created_at)
       VALUES (?, ?, 'pending', ?, NOW())`,
      [store_id, reference_no, created_by_id]
    );
    return Number(res.insertId);
  },

  /**
   * Add multiple items to an existing pending receive.
   * items: [{ item_id, quantity, cost_price?, note? }, ...]
   */
  async addItemsToReceive(
    receiveId: number,
    items: Array<{
      item_id: number;
      quantity: number;
      cost_price?: number | null;
      note?: string | null;
    }>
  ) {
    if (!items || items.length === 0) return;

    return await transaction(async (conn: any) => {
      // check receive exists and pending
      const [recvRows]: any = await conn.execute(
        "SELECT id, store_id, status FROM store_receives WHERE id = ? FOR UPDATE",
        [receiveId]
      );
      if (!recvRows?.length) throw new Error("Receive not found");
      const receive = recvRows[0];
      if (receive.status !== "pending")
        throw new Error("Can only add items to pending receive");

      // validate items exist
      const itemIds = Array.from(new Set(items.map((i) => i.item_id)));
      if (itemIds.length) {
        const placeholders = itemIds.map(() => "?").join(",");
        const [existing]: any = await conn.execute(
          `SELECT id FROM items WHERE id IN (${placeholders})`,
          itemIds
        );
        const existingIds = new Set((existing || []).map((r: any) => r.id));
        const missing = itemIds.filter((id) => !existingIds.has(id));
        if (missing.length)
          throw new Error(`Items not found: ${missing.join(", ")}`);
      }

      // validate quantities and insert items
      const valuePlaceholders: string[] = [];
      const params: any[] = [];
      for (const it of items) {
        const qty = Number(it.quantity);
        if (!Number.isInteger(qty) || qty <= 0)
          throw new Error("Quantity must be positive integer");
        // coerce cost_price to integer cents if provided (DB currently uses INT). Adjust if DB uses DECIMAL.
        const costPriceValue =
          it.cost_price != null ? Math.round(Number(it.cost_price)) : null;
        valuePlaceholders.push("(?, ?, ?, ?, ?)");
        params.push(
          receiveId,
          it.item_id,
          qty,
          costPriceValue,
          it.note ?? null
        );
      }

      const sql = `
        INSERT INTO store_receive_items (receive_id, item_id, quantity, cost_price, note)
        VALUES ${valuePlaceholders.join(", ")}
      `;
      await conn.execute(sql, params);

      return true;
    });
  },

  /**
   * Update receive metadata (only if pending).
   */
  async updateReceive(
    receiveId: number,
    updates: { store_id?: number; reference_no?: string | null }
  ) {
    return await transaction(async (conn: any) => {
      const [rows]: any = await conn.execute(
        "SELECT id, status FROM store_receives WHERE id = ? FOR UPDATE",
        [receiveId]
      );
      if (!rows?.length) throw new Error("Receive not found");
      if (rows[0].status !== "pending")
        throw new Error("Only pending receives can be edited");

      const sets: string[] = [];
      const params: any[] = [];
      if (updates.store_id !== undefined) {
        // validate store
        const srows: any = await conn.execute(
          "SELECT id FROM stores WHERE id = ?",
          [updates.store_id]
        );
        if (!srows?.length) throw new Error("Store not found");
        sets.push("store_id = ?");
        params.push(updates.store_id);
      }
      if (updates.reference_no !== undefined) {
        sets.push("reference_no = ?");
        params.push(updates.reference_no);
      }
      if (!sets.length) return true;

      params.push(receiveId);
      await conn.execute(
        `UPDATE store_receives SET ${sets.join(", ")} WHERE id = ?`,
        params
      );
      return true;
    });
  },

  /**
   * Update a single receive item (only if parent receive is pending).
   */
  async updateReceiveItem(
    itemRowId: number,
    updates: {
      quantity?: number;
      cost_price?: number | null;
      note?: string | null;
    }
  ) {
    return await transaction(async (conn: any) => {
      const [rows]: any = await conn.execute(
        `SELECT ri.*, r.status FROM store_receive_items ri
         JOIN store_receives r ON ri.receive_id = r.id
         WHERE ri.id = ? FOR UPDATE`,
        [itemRowId]
      );
      if (!rows?.length) throw new Error("Receive item not found");
      if (rows[0].status !== "pending")
        throw new Error("Only items of pending receives can be edited");

      const sets: string[] = [];
      const params: any[] = [];
      if (updates.quantity !== undefined) {
        const qty = Number(updates.quantity);
        if (!Number.isInteger(qty) || qty <= 0)
          throw new Error("Quantity must be positive integer");
        sets.push("quantity = ?");
        params.push(qty);
      }
      if (updates.cost_price !== undefined) {
        sets.push("cost_price = ?");
        params.push(updates.cost_price);
      }
      if (updates.note !== undefined) {
        sets.push("note = ?");
        params.push(updates.note);
      }
      if (!sets.length) return true;

      params.push(itemRowId);
      await conn.execute(
        `UPDATE store_receive_items SET ${sets.join(", ")} WHERE id = ?`,
        params
      );
      return true;
    });
  },

  /**
   * Delete a receive item (only if parent receive is pending).
   */
  async deleteReceiveItem(itemRowId: number) {
    return await transaction(async (conn: any) => {
      const [rows]: any = await conn.execute(
        `SELECT ri.*, r.status FROM store_receive_items ri
         JOIN store_receives r ON ri.receive_id = r.id
         WHERE ri.id = ? FOR UPDATE`,
        [itemRowId]
      );
      if (!rows?.length) throw new Error("Receive item not found");
      if (rows[0].status !== "pending")
        throw new Error("Only items of pending receives can be deleted");

      await conn.execute("DELETE FROM store_receive_items WHERE id = ?", [
        itemRowId,
      ]);
      return true;
    });
  },

  /**
   * Get receive by id (includes items and user info).
   */
  async getReceiveById(receiveId: number) {
    const rows: any = await query(
      `SELECT r.*,
              u.id AS created_by_id, u.name AS created_by_name,
              ua.id AS approved_by_id, ua.name AS approved_by_name,
              s.name AS store_name
       FROM store_receives r
       LEFT JOIN users u ON r.created_by_id = u.id
       LEFT JOIN users ua ON r.approved_by_id = ua.id
       LEFT JOIN stores s ON r.store_id = s.id
       WHERE r.id = ?`,
      [receiveId]
    );
    if (!rows.length) throw new Error("Receive not found");
    const receive = rows[0];

    const items: any = await query(
      `SELECT ri.id, ri.item_id, ri.quantity, ri.cost_price, ri.note,
              i.name AS item_name, i.code AS item_code, i.model AS item_model, i.price AS item_price
       FROM store_receive_items ri
       JOIN items i ON ri.item_id = i.id
       WHERE ri.receive_id = ?
       ORDER BY ri.id ASC`,
      [receiveId]
    );

    return { ...receive, items };
  },

  /**
   * List receives with filters and pagination.
   * returns { items: [...], total, page, pageSize }
   */
  async listReceives(opts?: {
    status?: string;
    store_id?: number;
    fromDate?: string;
    toDate?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    const where: string[] = [];
    const params: any[] = [];

    if (opts?.status) {
      where.push("r.status = ?");
      params.push(opts.status);
    }
    if (opts?.store_id) {
      where.push("r.store_id = ?");
      params.push(opts.store_id);
    }
    if (opts?.fromDate) {
      where.push("r.created_at >= ?");
      params.push(`${opts.fromDate} 00:00:00`);
    }
    if (opts?.toDate) {
      where.push("r.created_at <= ?");
      params.push(`${opts.toDate} 23:59:59`);
    }
    if (opts?.search) {
      const s = `%${opts.search}%`;
      where.push(
        "(r.reference_no LIKE ? OR u.name LIKE ? OR s.name LIKE ? OR CAST(r.id AS CHAR) LIKE ?)"
      );
      params.push(s, s, s, s);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const countSql = `
      SELECT COUNT(*) AS total
      FROM store_receives r
      LEFT JOIN users u ON r.created_by_id = u.id
      LEFT JOIN stores s ON r.store_id = s.id
      ${whereSql}
    `;
    const countRows: any = await query(countSql, params);
    const total = Number(countRows?.[0]?.total ?? 0);

    const page = opts?.page && opts.page > 0 ? opts.page : 1;
    const pageSize = opts?.pageSize && opts.pageSize > 0 ? opts.pageSize : 25;
    const offset = (page - 1) * pageSize;

    const mainSql = `
      SELECT r.*,
             u.name AS created_by_name,
             ua.name AS approved_by_name,
             s.name AS store_name,
             (SELECT COUNT(*) FROM store_receive_items ri WHERE ri.receive_id = r.id) AS item_count,
             (SELECT COALESCE(SUM(ri.quantity),0) FROM store_receive_items ri WHERE ri.receive_id = r.id) AS total_quantity
      FROM store_receives r
      LEFT JOIN users u ON r.created_by_id = u.id
      LEFT JOIN users ua ON r.approved_by_id = ua.id
      LEFT JOIN stores s ON r.store_id = s.id
      ${whereSql}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const rows: any = await query(mainSql, params.concat([pageSize, offset]));

    return { items: rows, total, page, pageSize };
  },

  /**
   * Approve a pending receive. Transactional:
   * - verify receive exists and pending
   * - ensure receive has items
   * - increment store_items quantities
   * - update receive status/approved_by/approved_at
   *
   * Returns true on success.
   */
  async approveReceive(receiveId: number, approvedById: number | null) {
    return await transaction(async (conn: any) => {
      // lock receive
      const [rrows]: any = await conn.execute(
        "SELECT id, store_id, status FROM store_receives WHERE id = ? FOR UPDATE",
        [receiveId]
      );
      if (!rrows?.length) throw new Error("Receive not found");
      const receive = rrows[0];
      if (receive.status !== "pending")
        throw new Error("Only pending receives can be approved");

      // fetch items
      const [itemsRows]: any = await conn.execute(
        `SELECT id, item_id, quantity FROM store_receive_items WHERE receive_id = ? FOR UPDATE`,
        [receiveId]
      );
      const items = itemsRows || [];
      if (!items.length) throw new Error("Cannot approve empty receive");

      // prepare bulk upsert to store_items within the transaction
      // build queries similar to StoreItemService.addMultiplestoreItems but using conn.execute
      const valuePlaceholders: string[] = [];
      const params: any[] = [];
      for (const it of items) {
        valuePlaceholders.push("(?, ?, ?)");
        params.push(receive.store_id, it.item_id, it.quantity);
      }

      // Use INSERT ... ON DUPLICATE KEY UPDATE to increment quantity atomically
      const insertSql = `
        INSERT INTO store_items (store_id, item_id, quantity)
        VALUES ${valuePlaceholders.join(", ")}
        ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
      `;
      await conn.execute(insertSql, params);

      // mark receive approved
      await conn.execute(
        `UPDATE store_receives SET status = 'approved', approved_by_id = ?, approved_at = NOW() WHERE id = ?`,
        [approvedById, receiveId]
      );

      return true;
    });
  },

  /**
   * Reject a pending receive. Inventory unchanged.
   */
  async rejectReceive(
    receiveId: number,
    rejectedById: number | null,
    note?: string | null
  ) {
    return await transaction(async (conn: any) => {
      const [rrows]: any = await conn.execute(
        "SELECT id, status FROM store_receives WHERE id = ? FOR UPDATE",
        [receiveId]
      );
      if (!rrows?.length) throw new Error("Receive not found");
      if (rrows[0].status !== "pending")
        throw new Error("Only pending receives can be rejected");

      await conn.execute(
        `UPDATE store_receives SET status = 'rejected', approved_by_id = ?, approved_at = NOW(), reference_no = reference_no WHERE id = ?`,
        [rejectedById, receiveId]
      );

      // optionally append a note into each receive item or into a dedicated column - here we skip that.
      return true;
    });
  },

  /**
   * Delete a pending receive (and its items)
   */
  async deleteReceive(receiveId: number) {
    return await transaction(async (conn: any) => {
      const [rrows]: any = await conn.execute(
        "SELECT id, status FROM store_receives WHERE id = ? FOR UPDATE",
        [receiveId]
      );
      if (!rrows?.length) throw new Error("Receive not found");
      if (rrows[0].status !== "pending")
        throw new Error("Only pending receives can be deleted");

      await conn.execute(
        "DELETE FROM store_receive_items WHERE receive_id = ?",
        [receiveId]
      );
      await conn.execute("DELETE FROM store_receives WHERE id = ?", [
        receiveId,
      ]);
      return true;
    });
  },
};
