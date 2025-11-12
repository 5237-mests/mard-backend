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
exports.deadstockService = void 0;
const db_1 = require("../config/db");
exports.deadstockService = {
    reportDeadstock(input) {
        return __awaiter(this, void 0, void 0, function* () {
            // validate positive qty
            const qty = Number(input.quantity);
            if (!Number.isInteger(qty) || qty <= 0)
                throw new Error("Invalid quantity");
            return yield (0, db_1.transaction)((conn) => __awaiter(this, void 0, void 0, function* () {
                // validate item exists
                const [itemRows] = yield conn.execute("SELECT id FROM items WHERE id = ?", [input.item_id]);
                if (!itemRows || itemRows.length === 0)
                    throw new Error("Item not found");
                // check & decrement source inventory
                if (input.sourceType === "store") {
                    const [rows] = yield conn.execute("SELECT quantity FROM store_items WHERE store_id = ? AND item_id = ? FOR UPDATE", [input.sourceId, input.item_id]);
                    const avail = (rows === null || rows === void 0 ? void 0 : rows.length) ? Number(rows[0].quantity) : 0;
                    if (avail < qty)
                        throw new Error("Insufficient stock in source store");
                    yield conn.execute("UPDATE store_items SET quantity = quantity - ? WHERE store_id = ? AND item_id = ?", [qty, input.sourceId, input.item_id]);
                }
                else {
                    const [rows] = yield conn.execute("SELECT quantity FROM shop_items WHERE shop_id = ? AND item_id = ? FOR UPDATE", [input.sourceId, input.item_id]);
                    const avail = (rows === null || rows === void 0 ? void 0 : rows.length) ? Number(rows[0].quantity) : 0;
                    if (avail < qty)
                        throw new Error("Insufficient stock in source shop");
                    yield conn.execute("UPDATE shop_items SET quantity = quantity - ? WHERE shop_id = ? AND item_id = ?", [qty, input.sourceId, input.item_id]);
                }
                // insert deadstock record
                const fromStoreCol = input.sourceType === "store" ? "source_store_id" : "source_shop_id";
                const fromStoreVal = input.sourceType === "store" ? input.sourceId : null;
                const fromShopVal = input.sourceType === "shop" ? input.sourceId : null;
                const [ins] = yield conn.execute(`INSERT INTO deadstock
         (item_id, source_type, source_store_id, source_shop_id, quantity, reason, notes, created_by_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
                    input.item_id,
                    input.sourceType,
                    fromStoreVal,
                    fromShopVal,
                    qty,
                    input.reason || null,
                    input.notes || null,
                    input.user_id || null,
                ]);
                return ins.insertId;
            }));
        });
    },
    getAllDeadstock(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const where = [];
            const params = [];
            if (opts === null || opts === void 0 ? void 0 : opts.status) {
                where.push("d.status = ?");
                params.push(opts.status);
            }
            if (opts === null || opts === void 0 ? void 0 : opts.sourceType) {
                where.push("d.source_type = ?");
                params.push(opts.sourceType);
            }
            if (opts === null || opts === void 0 ? void 0 : opts.fromDate) {
                where.push("d.created_at >= ?");
                params.push(`${opts.fromDate} 00:00:00`);
            }
            if (opts === null || opts === void 0 ? void 0 : opts.toDate) {
                where.push("d.created_at <= ?");
                params.push(`${opts.toDate} 23:59:59`);
            }
            if (opts === null || opts === void 0 ? void 0 : opts.search) {
                const s = `%${opts.search}%`;
                where.push("(i.name LIKE ? OR i.code LIKE ? OR d.reason LIKE ? OR d.notes LIKE ? OR CAST(d.id AS CHAR) LIKE ?)");
                params.push(s, s, s, s, s);
            }
            const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
            const countSql = `
      SELECT COUNT(*) AS total
      FROM deadstock d
      JOIN items i ON d.item_id = i.id
      ${whereSql}
    `;
            const countRows = yield (0, db_1.query)(countSql, params);
            const total = Number((_b = (_a = countRows === null || countRows === void 0 ? void 0 : countRows[0]) === null || _a === void 0 ? void 0 : _a.total) !== null && _b !== void 0 ? _b : 0);
            const page = (opts === null || opts === void 0 ? void 0 : opts.page) && opts.page > 0 ? opts.page : 1;
            const pageSize = (opts === null || opts === void 0 ? void 0 : opts.pageSize) && opts.pageSize > 0 ? opts.pageSize : 25;
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
            const rows = yield (0, db_1.query)(mainSql, params.concat([pageSize, offset]));
            return { items: rows, total, page, pageSize };
        });
    },
    getDeadstockById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const rows = yield (0, db_1.query)(`SELECT d.*,
              i.name AS item_name, i.code AS item_code, i.model AS item_model, i.price AS item_price,
              COALESCE(s.name, sh.name) AS source_name,
              u.id AS created_by_id, u.name AS created_by_name
       FROM deadstock d
       JOIN items i ON d.item_id = i.id
       LEFT JOIN stores s ON d.source_type = 'store' AND d.source_store_id = s.id
       LEFT JOIN shops sh ON d.source_type = 'shop' AND d.source_shop_id = sh.id
       LEFT JOIN users u ON d.created_by_id = u.id
       WHERE d.id = ?`, [id]);
            if (!rows.length)
                throw new Error("Deadstock not found");
            return rows[0];
        });
    },
    resolveDeadstock(id, action, notes, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, db_1.transaction)((conn) => __awaiter(this, void 0, void 0, function* () {
                const [row] = yield conn.execute("SELECT * FROM deadstock WHERE id = ? FOR UPDATE", [id]);
                if (!row.length)
                    throw new Error("Deadstock not found");
                const rec = row[0];
                if (action === "resolved") {
                    if (rec.source_type === "store") {
                        yield conn.execute("UPDATE store_items SET quantity = quantity + ? WHERE store_id = ? AND item_id = ?", [rec.quantity, rec.source_store_id, rec.item_id]);
                    }
                    else {
                        yield conn.execute("UPDATE shop_items SET quantity = quantity + ? WHERE shop_id = ? AND item_id = ?", [rec.quantity, rec.source_shop_id, rec.item_id]);
                    }
                }
                yield conn.execute(`UPDATE deadstock 
       SET status = ?, resolved_at = NOW(), notes = COALESCE(notes, ?)
       WHERE id = ?`, [action, notes || null, id]);
                return true;
            }));
        });
    },
    deleteDeadstock(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, db_1.query)("DELETE FROM deadstock WHERE id = ?", [id]);
            return true;
        });
    },
};
