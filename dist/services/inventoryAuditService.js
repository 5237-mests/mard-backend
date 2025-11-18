"use strict";
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
const db_1 = require("../config/db");
exports.inventoryAuditService = {
    createAudit(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { location_type, location_id, item_id, txn_type, quantity_in = 0, quantity_out = 0, reference_id = null, reference_table = null, note = null, } = input;
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
            const result = yield (0, db_1.query)(sql, params);
            return { id: result.insertId };
        });
    },
    getAudits1() {
        return __awaiter(this, arguments, void 0, function* (opts = {}) {
            const where = [];
            const params = [];
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
            return yield (0, db_1.query)(sql, params);
        });
    },
    getAuditById1(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `SELECT * FROM inventory_audit WHERE id = ?`;
            const rows = yield (0, db_1.query)(sql, [id]);
            if (!rows || rows.length === 0)
                throw new Error("Audit not found");
            return rows[0];
        });
    },
    getAudits() {
        return __awaiter(this, arguments, void 0, function* (opts = {}) {
            const where = [];
            const params = [];
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
            return yield (0, db_1.query)(sql, params);
        });
    },
    getAuditById(id) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const rows = yield (0, db_1.query)(sql, [id]);
            if (!rows || rows.length === 0)
                throw new Error("Audit not found");
            return rows[0];
        });
    },
};
