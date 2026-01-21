import { query, transaction } from "../config/db";

export interface AuditInput {
  location_type: "store" | "shop";
  location_id: number;
  item_id: number;
  txn_type: "receive" | "transfer_out" | "transfer_in" | "sale" | "wastage";
  quantity_in?: number;
  quantity_out?: number;
  reference_id?: number;
  reference_table?: string;
  note?: string;
}

export const inventoryAuditService = {
  async createAudit(input: AuditInput) {
    const {
      location_type,
      location_id,
      item_id,
      txn_type,
      quantity_in = 0,
      quantity_out = 0,
      reference_id = null,
      reference_table = null,
      note = null,
    } = input;
    const sql = `
      INSERT INTO inventory_audit
      (location_type, location_id, item_id, txn_type, quantity_in, quantity_out, reference_id, reference_table, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      location_type,
      location_id,
      item_id,
      txn_type,
      quantity_in,
      quantity_out,
      reference_id,
      reference_table,
      note,
    ];
    const result: any = await query(sql, params);
    return { id: result.insertId };
  },

  async getAudits1(opts: any = {}) {
    const where: string[] = [];
    const params: any[] = [];
    if (opts.location_type) {
      where.push("location_type = ?");
      params.push(opts.location_type);
    }
    if (opts.location_id) {
      where.push("location_id = ?");
      params.push(opts.location_id);
    }
    if (opts.item_id) {
      where.push("item_id = ?");
      params.push(opts.item_id);
    }
    if (opts.txn_type) {
      where.push("txn_type = ?");
      params.push(opts.txn_type);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const sql = `
      SELECT * FROM inventory_audit
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT 100
    `;
    return await query(sql, params);
  },

  async getAuditById1(id: number) {
    const sql = `SELECT * FROM inventory_audit WHERE id = ?`;
    const rows: any = await query(sql, [id]);
    if (!rows || rows.length === 0) throw new Error("Audit not found");
    return rows[0];
  },

  async getAudits(opts: any = {}) {
    const where: string[] = [];
    const params: any[] = [];
    if (opts.location_type) {
      where.push("a.location_type = ?");
      params.push(opts.location_type);
    }
    if (opts.location_id) {
      where.push("a.location_id = ?");
      params.push(opts.location_id);
    }
    if (opts.item_id) {
      where.push("a.item_id = ?");
      params.push(opts.item_id);
    }
    if (opts.txn_type) {
      where.push("a.txn_type = ?");
      params.push(opts.txn_type);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // Join items, shops, stores for details
    const sql = `
      SELECT
        a.*,
        i.name AS item_name, i.code AS item_code, i.model AS item_model,
        s.name AS store_name,
        sh.name AS shop_name
      FROM inventory_audit a
      LEFT JOIN items i ON a.item_id = i.id
      LEFT JOIN stores s ON a.location_type = 'store' AND a.location_id = s.id
      LEFT JOIN shops sh ON a.location_type = 'shop' AND a.location_id = sh.id
      ${whereSql}
      ORDER BY a.created_at DESC
      LIMIT 100
    `;
    return await query(sql, params);
  },

  async getAuditById(id: number) {
    const sql = `
      SELECT
        a.*,
        i.name AS item_name, i.code AS item_code, i.model AS item_model,
        s.name AS store_name,
        sh.name AS shop_name
      FROM inventory_audit a
      LEFT JOIN items i ON a.item_id = i.id
      LEFT JOIN stores s ON a.location_type = 'store' AND a.location_id = s.id
      LEFT JOIN shops sh ON a.location_type = 'shop' AND a.location_id = sh.id
      WHERE a.id = ?
      LIMIT 1
    `;
    const rows: any = await query(sql, [id]);
    if (!rows || rows.length === 0) throw new Error("Audit not found");
    return rows[0];
  },

  // delete audit record
  async deleteAudit(id: number) {
    const sql = `DELETE FROM inventory_audit WHERE id = ?`;
    return await query(sql, [id]);
  },
};
