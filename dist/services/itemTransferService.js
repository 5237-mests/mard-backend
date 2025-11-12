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
exports.itemTransferService = void 0;
const db_1 = require("../config/db");
exports.itemTransferService = {
    // Transfer all items from shop back to store
    // remove everything in shop and add to store
    transferAllShopItemToStore(shopId, storeId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, db_1.transaction)((connection) => __awaiter(this, void 0, void 0, function* () {
                // validate shop
                const [shopRows] = yield connection.execute("SELECT 1 FROM shops WHERE id = ?", [shopId]);
                if (!shopRows || shopRows.length === 0) {
                    throw new Error("Shop not found");
                }
                // validate store
                const [storeRows] = yield connection.execute("SELECT 1 FROM stores WHERE id = ?", [storeId]);
                if (!storeRows || storeRows.length === 0) {
                    throw new Error("Store not found");
                }
                // get all items in the shop filter only if quantity > 0
                const [shopItems] = yield connection.execute(
                // "SELECT item_id, quantity FROM shop_items WHERE shop_id = ?",
                "SELECT item_id, quantity FROM shop_items WHERE shop_id = ? AND quantity > 0", [shopId]);
                if (!shopItems || shopItems.length === 0) {
                    // nothing to transfer; return 0 to indicate no transfer created
                    return 0;
                }
                // create transfer record
                const [insertResult] = yield connection.execute(`INSERT INTO transfers (from_type, from_shop_id, to_type, to_store_id, created_by_id)
         VALUES (?, ?, ?, ?, ?)`, ["shop", shopId, "store", storeId, userId]);
                const transferId = insertResult.insertId;
                // insert transfer_items rows
                for (const it of shopItems) {
                    yield connection.execute(`INSERT INTO transfer_items (transfer_id, item_id, quantity)
           VALUES (?, ?, ?)`, [transferId, it.item_id, it.quantity]);
                }
                // upsert into store_items (add quantities)
                const valuePlaceholders = shopItems.map(() => "(?, ?, ?)").join(", ");
                const upsertSql = `
        INSERT INTO store_items (store_id, item_id, quantity)
        VALUES ${valuePlaceholders}
        ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
      `;
                const upsertParams = [];
                for (const it of shopItems) {
                    upsertParams.push(storeId, it.item_id, it.quantity);
                }
                yield connection.execute(upsertSql, upsertParams);
                // remove all items from shop
                yield connection.execute("DELETE FROM shop_items WHERE shop_id = ?", [
                    shopId,
                ]);
                return transferId;
            }));
        });
    },
    // Create a new item transfer.
    createTransfer(_a) {
        return __awaiter(this, arguments, void 0, function* ({ fromType, fromId, toType, toId, items, user_id, }) {
            // check user linked with store/shop?
            const [userRows] = yield (0, db_1.query)(fromType === "store"
                ? "SELECT 1 FROM store_storekeepers WHERE store_id = ? AND user_id = ?"
                : "SELECT 1 FROM shop_shopkeepers WHERE shop_id = ? AND user_id = ?", [fromId, user_id]);
            if (!userRows || userRows.length === 0) {
                throw new Error("User not authorized for the source branch");
            }
            if (!Array.isArray(items) || items.length === 0) {
                throw new Error("Transfer must include at least one item");
            }
            return yield (0, db_1.transaction)((connection) => __awaiter(this, void 0, void 0, function* () {
                // validate branches
                const [fromRows] = yield connection.execute(fromType === "store"
                    ? "SELECT 1 FROM stores WHERE id = ?"
                    : "SELECT 1 FROM shops WHERE id = ?", [fromId]);
                if (!fromRows || fromRows.length === 0) {
                    throw new Error(`${fromType} (from) not found`);
                }
                const [toRows] = yield connection.execute(toType === "store"
                    ? "SELECT 1 FROM stores WHERE id = ?"
                    : "SELECT 1 FROM shops WHERE id = ?", [toId]);
                if (!toRows || toRows.length === 0) {
                    throw new Error(`${toType} (to) not found`);
                }
                // validate items exist in items table
                const itemIds = Array.from(new Set(items.map((it) => Number(it.item_id))));
                const placeholders = itemIds.map(() => "?").join(",");
                const [existingItems] = yield connection.execute(`SELECT id FROM items WHERE id IN (${placeholders})`, itemIds);
                const existingSet = new Set(existingItems.map((r) => r.id));
                const missing = itemIds.filter((id) => !existingSet.has(id));
                if (missing.length > 0) {
                    throw new Error(`Missing items: ${missing.join(", ")}`);
                }
                // validate quantities
                for (const it of items) {
                    const qty = Number(it.quantity);
                    if (!Number.isFinite(qty) || !Number.isInteger(qty) || qty <= 0) {
                        throw new Error(`Invalid quantity for product ${it.item_id}`);
                    }
                }
                // generate reference and insert transfer
                const reference = `TRF-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 8)}`;
                const [insertResult] = yield connection.execute(`INSERT INTO transfers (reference, from_type, from_${fromType}_id, to_type, to_${toType}_id, created_by_id, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`, [reference, fromType, fromId, toType, toId, user_id, "completed"]);
                const transferId = insertResult.insertId;
                // insert transfer_items and update inventories
                for (const it of items) {
                    const itemId = Number(it.item_id);
                    const qty = Number(it.quantity);
                    // insert transfer_items row
                    yield connection.execute(`INSERT INTO transfer_items (transfer_id, item_id, quantity)
           VALUES (?, ?, ?)`, [transferId, itemId, qty]);
                    // decrement source inventory
                    if (fromType === "store") {
                        // check available
                        const [rows] = yield connection.execute("SELECT quantity FROM store_items WHERE store_id = ? AND item_id = ?", [fromId, itemId]);
                        const avail = rows && rows.length ? Number(rows[0].quantity) : 0;
                        if (avail < qty) {
                            throw new Error(`Insufficient stock for item ${itemId} in source store`);
                        }
                        yield connection.execute("UPDATE store_items SET quantity = quantity - ? WHERE store_id = ? AND item_id = ?", [qty, fromId, itemId]);
                    }
                    else {
                        const [rows] = yield connection.execute("SELECT quantity FROM shop_items WHERE shop_id = ? AND item_id = ?", [fromId, itemId]);
                        const avail = rows && rows.length ? Number(rows[0].quantity) : 0;
                        if (avail < qty) {
                            throw new Error(`Insufficient stock for item ${itemId} in source shop`);
                        }
                        yield connection.execute("UPDATE shop_items SET quantity = quantity - ? WHERE shop_id = ? AND item_id = ?", [qty, fromId, itemId]);
                    }
                    // upsert destination inventory (add quantities)
                    if (toType === "store") {
                        yield connection.execute(`INSERT INTO store_items (store_id, item_id, quantity)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`, [toId, itemId, qty]);
                    }
                    else {
                        yield connection.execute(`INSERT INTO shop_items (shop_id, item_id, quantity)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`, [toId, itemId, qty]);
                    }
                }
                return transferId;
            }));
        });
    },
    getAllTransfers(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            // build where clauses dynamically
            const where = [];
            const params = [];
            if (opts === null || opts === void 0 ? void 0 : opts.status) {
                where.push("t.status = ?");
                params.push(opts.status);
            }
            if (opts === null || opts === void 0 ? void 0 : opts.fromType) {
                where.push("t.from_type = ?");
                params.push(opts.fromType);
            }
            if (opts === null || opts === void 0 ? void 0 : opts.fromDate) {
                where.push("t.created_at >= ?");
                params.push(`${opts.fromDate} 00:00:00`);
            }
            if (opts === null || opts === void 0 ? void 0 : opts.toDate) {
                where.push("t.created_at <= ?");
                params.push(`${opts.toDate} 23:59:59`);
            }
            if ((opts === null || opts === void 0 ? void 0 : opts.shop_id) !== undefined && (opts === null || opts === void 0 ? void 0 : opts.shop_id) !== null) {
                where.push("(t.from_shop_id = ? OR t.to_shop_id = ?)");
                params.push(opts.shop_id, opts.shop_id);
            }
            if ((opts === null || opts === void 0 ? void 0 : opts.store_id) !== undefined && (opts === null || opts === void 0 ? void 0 : opts.store_id) !== null) {
                where.push("(t.from_store_id = ? OR t.to_store_id = ?)");
                params.push(opts.store_id, opts.store_id);
            }
            // item-level search: include transfers that contain matching items
            if (opts === null || opts === void 0 ? void 0 : opts.itemSearch) {
                const s = `%${opts.itemSearch}%`;
                where.push(`EXISTS (
           SELECT 1 FROM transfer_items ti
           JOIN items i ON ti.item_id = i.id
           WHERE ti.transfer_id = t.id
             AND (i.name LIKE ? OR i.code LIKE ? OR i.model LIKE ?)
         )`);
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
            const countRows = yield (0, db_1.query)(countSql, params);
            const total = Number((_b = (_a = countRows === null || countRows === void 0 ? void 0 : countRows[0]) === null || _a === void 0 ? void 0 : _a.total) !== null && _b !== void 0 ? _b : 0);
            // pagination
            const page = (opts === null || opts === void 0 ? void 0 : opts.page) && opts.page > 0 ? opts.page : 1;
            const pageSize = (opts === null || opts === void 0 ? void 0 : opts.pageSize) && opts.pageSize > 0 ? opts.pageSize : 25;
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
              'item_id', ti.item_id,
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
            const rows = yield (0, db_1.query)(mainSql, mainParams);
            // parse JSON column if returned as string
            const items = rows.map((r) => {
                try {
                    if (typeof r.items === "string")
                        r.items = JSON.parse(r.items);
                }
                catch (_a) {
                    r.items = r.items || [];
                }
                return r;
            });
            return { items, total, page, pageSize };
        });
    },
    getAllTransfers2(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            // build where clauses dynamically
            const where = [];
            const params = [];
            if (opts === null || opts === void 0 ? void 0 : opts.status) {
                where.push("t.status = ?");
                params.push(opts.status);
            }
            if (opts === null || opts === void 0 ? void 0 : opts.fromType) {
                where.push("t.from_type = ?");
                params.push(opts.fromType);
            }
            if (opts === null || opts === void 0 ? void 0 : opts.fromDate) {
                where.push("t.created_at >= ?");
                params.push(`${opts.fromDate} 00:00:00`);
            }
            if (opts === null || opts === void 0 ? void 0 : opts.toDate) {
                where.push("t.created_at <= ?");
                params.push(`${opts.toDate} 23:59:59`);
            }
            if (opts === null || opts === void 0 ? void 0 : opts.search) {
                // simple search across reference and branch names
                const s = `%${opts.search}%`;
                where.push("(t.reference LIKE ? OR fs.name LIKE ? OR fsh.name LIKE ? OR ts.name LIKE ? OR tsh.name LIKE ? OR CAST(t.id AS CHAR) LIKE ?)");
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
            const countRows = yield (0, db_1.query)(countSql, params);
            const total = Number((_b = (_a = countRows === null || countRows === void 0 ? void 0 : countRows[0]) === null || _a === void 0 ? void 0 : _a.total) !== null && _b !== void 0 ? _b : 0);
            // pagination
            const page = (opts === null || opts === void 0 ? void 0 : opts.page) && opts.page > 0 ? opts.page : 1;
            const pageSize = (opts === null || opts === void 0 ? void 0 : opts.pageSize) && opts.pageSize > 0 ? opts.pageSize : 25;
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
              'item_id', ti.item_id,
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
            const rows = yield (0, db_1.query)(mainSql, mainParams);
            // parse JSON column if returned as string
            const items = rows.map((r) => {
                try {
                    if (typeof r.items === "string")
                        r.items = JSON.parse(r.items);
                }
                catch (_a) {
                    r.items = r.items || [];
                }
                return r;
            });
            return { items, total, page, pageSize };
        });
    },
    getTransferById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const transfers = yield (0, db_1.query)(`SELECT 
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
      `, [id]);
            if (!transfers.length)
                throw new Error("Transfer not found");
            const items = yield (0, db_1.query)(`SELECT 
         ti.item_id AS item_id,
         ti.quantity,
         i.name AS product_name,
         i.code AS product_code,
         i.model AS product_model,
         i.price AS product_price
       FROM transfer_items ti
       JOIN items i ON ti.item_id = i.id
       WHERE ti.transfer_id = ?
       ORDER BY ti.id ASC`, [id]);
            const item_count = items.length;
            const total_quantity = items.reduce((acc, it) => acc + Number(it.quantity), 0);
            // transfers[0] now includes created_by_id / created_by_name / created_by_email
            return Object.assign(Object.assign({}, transfers[0]), { item_count, total_quantity, items });
        });
    },
};
