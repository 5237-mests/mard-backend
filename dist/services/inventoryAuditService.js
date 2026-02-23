"use strict";
// import { query, transaction } from "../config/db";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryAuditService = void 0;
// export interface AuditInput {
//   location_type: "store" | "shop";
//   location_id: number;
//   item_id: number;
//   txn_type: "receive" | "transfer_out" | "transfer_in" | "sale" | "wastage";
//   quantity_in?: number;
//   quantity_out?: number;
//   reference_id?: number;
//   reference_table?: string;
//   note?: string;
// }
// export const inventoryAuditService = {
//   async createAudit(input: AuditInput) {
//     const {
//       location_type,
//       location_id,
//       item_id,
//       txn_type,
//       quantity_in = 0,
//       quantity_out = 0,
//       reference_id = null,
//       reference_table = null,
//       note = null,
//     } = input;
//     const sql = `
//       INSERT INTO inventory_audit
//       (location_type, location_id, item_id, txn_type, quantity_in, quantity_out, reference_id, reference_table, note)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;
//     const params = [
//       location_type,
//       location_id,
//       item_id,
//       txn_type,
//       quantity_in,
//       quantity_out,
//       reference_id,
//       reference_table,
//       note,
//     ];
//     const result: any = await query(sql, params);
//     return { id: result.insertId };
//   },
//   async getAudits(opts: any = {}) {
//     const where: string[] = [];
//     const params: any[] = [];
//     if (opts.location_type) {
//       where.push("a.location_type = ?");
//       params.push(opts.location_type);
//     }
//     if (opts.location_id) {
//       where.push("a.location_id = ?");
//       params.push(opts.location_id);
//     }
//     if (opts.item_id) {
//       where.push("a.item_id = ?");
//       params.push(opts.item_id);
//     }
//     if (opts.txn_type) {
//       where.push("a.txn_type = ?");
//       params.push(opts.txn_type);
//     }
//     const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
//     // Join items, shops, stores for details
//     const sql = `
//       SELECT
//         a.*,
//         i.name AS item_name, i.code AS item_code, i.model AS item_model,
//         s.name AS store_name,
//         sh.name AS shop_name
//       FROM inventory_audit a
//       LEFT JOIN items i ON a.item_id = i.id
//       LEFT JOIN stores s ON a.location_type = 'store' AND a.location_id = s.id
//       LEFT JOIN shops sh ON a.location_type = 'shop' AND a.location_id = sh.id
//       ${whereSql}
//       ORDER BY a.created_at DESC
//       LIMIT 100
//     `;
//     return await query(sql, params);
//   },
//   async getAuditById(id: number) {
//     const sql = `
//       SELECT
//         a.*,
//         i.name AS item_name, i.code AS item_code, i.model AS item_model,
//         s.name AS store_name,
//         sh.name AS shop_name
//       FROM inventory_audit a
//       LEFT JOIN items i ON a.item_id = i.id
//       LEFT JOIN stores s ON a.location_type = 'store' AND a.location_id = s.id
//       LEFT JOIN shops sh ON a.location_type = 'shop' AND a.location_id = sh.id
//       WHERE a.id = ?
//       LIMIT 1
//     `;
//     const rows: any = await query(sql, [id]);
//     if (!rows || rows.length === 0) throw new Error("Audit not found");
//     return rows[0];
//   },
//   // delete audit record
//   async deleteAudit(id: number) {
//     const sql = `DELETE FROM inventory_audit WHERE id = ?`;
//     return await query(sql, [id]);
//   },
// };
const db_1 = require("../config/db");
exports.inventoryAuditService = {
    createAudit(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { location_type, location_id, item_id, txn_type, quantity_in = 0, quantity_out = 0, reference_id = null, reference_table = null, note = null, created_by = null, } = input;
            if (quantity_in < 0 || quantity_out < 0) {
                throw new Error("Quantities cannot be negative");
            }
            if (quantity_in > 0 && quantity_out > 0) {
                throw new Error("Cannot specify both quantity_in and quantity_out");
            }
            const sql = `
      INSERT INTO inventory_audit (
        location_type, location_id, item_id, txn_type,
        quantity_in, quantity_out, reference_id, reference_table, note,
        created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
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
                created_by,
            ];
            const result = yield (0, db_1.query)(sql, params);
            return { id: result.insertId };
        });
    },
    getAudits() {
        return __awaiter(this, arguments, void 0, function* (filter = {}) {
            var _a, _b;
            const where = [];
            const params = [];
            if (filter.location_type) {
                where.push("a.location_type = ?");
                params.push(filter.location_type);
            }
            if (filter.location_id) {
                where.push("a.location_id = ?");
                params.push(filter.location_id);
            }
            if (filter.item_id) {
                where.push("a.item_id = ?");
                params.push(filter.item_id);
            }
            if (filter.txn_type) {
                where.push("a.txn_type = ?");
                params.push(filter.txn_type);
            }
            if (filter.start_date) {
                where.push("DATE(a.created_at) >= ?");
                params.push(filter.start_date);
            }
            if (filter.end_date) {
                where.push("DATE(a.created_at) <= ?");
                params.push(filter.end_date);
            }
            const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
            // Pagination
            const page = Math.max(1, Number(filter.page) || 1);
            const limit = Math.min(100, Math.max(10, Number(filter.limit) || 20));
            const offset = (page - 1) * limit;
            const sql = `
      SELECT
        a.*,
        i.name AS item_name,
        i.code AS item_code,
        i.model AS item_model,
        s.name AS store_name,
        sh.name AS shop_name
      FROM inventory_audit a
      LEFT JOIN items i ON a.item_id = i.id
      LEFT JOIN stores s ON a.location_type = 'store' AND a.location_id = s.id
      LEFT JOIN shops sh ON a.location_type = 'shop' AND a.location_id = sh.id
      ${whereSql}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `;
            params.push(limit, offset);
            const rows = yield (0, db_1.query)(sql, params);
            // Total count
            const countSql = `SELECT COUNT(*) as total FROM inventory_audit a ${whereSql}`;
            const countParams = params.slice(0, -2); // remove LIMIT and OFFSET
            const countResult = yield (0, db_1.query)(countSql, countParams);
            const total = Number((_b = (_a = countResult[0]) === null || _a === void 0 ? void 0 : _a.total) !== null && _b !== void 0 ? _b : 0);
            return {
                data: rows,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: total > 0 ? Math.ceil(total / limit) : 1,
                    hasNext: page * limit < total,
                    hasPrev: page > 1,
                },
            };
        });
    },
    getAuditById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Number.isInteger(id) || id <= 0) {
                throw new Error("Invalid audit ID");
            }
            const sql = `
      SELECT
        a.*,
        i.name AS item_name,
        i.code AS item_code,
        i.model AS item_model,
        s.name AS store_name,
        sh.name AS shop_name
      FROM inventory_audit a
      LEFT JOIN items i ON a.item_id = i.id
      LEFT JOIN stores s ON a.location_type = 'store' AND a.location_id = s.id
      LEFT JOIN shops sh ON a.location_type = 'shop' AND a.location_id = sh.id
      WHERE a.id = ?
      LIMIT 1
    `;
            const rows = yield (0, db_1.query)(sql, [id]);
            if (rows.length === 0) {
                throw new Error("Audit not found");
            }
            return rows[0];
        });
    },
    // Optional / admin-only — usually audit records should NOT be deletable.
    deleteAudit(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // In production: throw new Error("Audit deletion is not allowed");
            const sql = `DELETE FROM inventory_audit WHERE id = ?`;
            return yield (0, db_1.query)(sql, [id]);
        });
    },
};
