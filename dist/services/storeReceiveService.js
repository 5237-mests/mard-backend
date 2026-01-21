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
exports.storeReceiveService = void 0;
const db_1 = require("../config/db");
const inventoryAuditService_1 = require("./inventoryAuditService");
/**
 * Service to manage store receives (receiving shipments into a store).
 *
 * Notes:
 * - create/edit operations allowed only while receive.status = 'pending'
 * - approve operation is transactional and will increment store_items quantities
 *   within the same DB transaction to ensure atomicity.
 */
exports.storeReceiveService = {
    /**
     * Create a new receive (status = 'pending').
     * returns insert id
     */
    createReceive(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { store_id, created_by_id, reference_no = null } = params;
            // ensure caller is authenticated (created_by_id must be present)
            if (!created_by_id)
                throw new Error("Authenticated user required to create receive");
            // validate store exists
            const storeRows = yield (0, db_1.query)("SELECT id FROM stores WHERE id = ?", [
                store_id,
            ]);
            if (!storeRows.length)
                throw new Error("Store not found");
            const res = yield (0, db_1.query)(`INSERT INTO store_receives (store_id, reference_no, status, created_by_id, created_at)
       VALUES (?, ?, 'pending', ?, NOW())`, [store_id, reference_no, created_by_id]);
            return Number(res.insertId);
        });
    },
    /**
     * Add multiple items to an existing pending receive.
     * items: [{ item_id, quantity, cost_price?, note? }, ...]
     */
    addItemsToReceive(receiveId, items) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!items || items.length === 0)
                return;
            return yield (0, db_1.transaction)((conn) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                // check receive exists and pending
                const [recvRows] = yield conn.execute("SELECT id, store_id, status FROM store_receives WHERE id = ? FOR UPDATE", [receiveId]);
                if (!(recvRows === null || recvRows === void 0 ? void 0 : recvRows.length))
                    throw new Error("Receive not found");
                const receive = recvRows[0];
                if (receive.status !== "pending")
                    throw new Error("Can only add items to pending receive");
                // validate items exist
                const itemIds = Array.from(new Set(items.map((i) => i.item_id)));
                if (itemIds.length) {
                    const placeholders = itemIds.map(() => "?").join(",");
                    const [existing] = yield conn.execute(`SELECT id FROM items WHERE id IN (${placeholders})`, itemIds);
                    const existingIds = new Set((existing || []).map((r) => r.id));
                    const missing = itemIds.filter((id) => !existingIds.has(id));
                    if (missing.length)
                        throw new Error(`Items not found: ${missing.join(", ")}`);
                }
                // validate quantities and insert items
                const valuePlaceholders = [];
                const params = [];
                for (const it of items) {
                    const qty = Number(it.quantity);
                    if (!Number.isInteger(qty) || qty <= 0)
                        throw new Error("Quantity must be positive integer");
                    // coerce cost_price to integer cents if provided (DB currently uses INT). Adjust if DB uses DECIMAL.
                    const costPriceValue = it.cost_price != null ? Math.round(Number(it.cost_price)) : null;
                    valuePlaceholders.push("(?, ?, ?, ?, ?)");
                    params.push(receiveId, it.item_id, qty, costPriceValue, (_a = it.note) !== null && _a !== void 0 ? _a : null);
                }
                const sql = `
        INSERT INTO store_receive_items (receive_id, item_id, quantity, cost_price, note)
        VALUES ${valuePlaceholders.join(", ")}
      `;
                yield conn.execute(sql, params);
                return true;
            }));
        });
    },
    /**
     * Update receive metadata (only if pending).
     */
    updateReceive(receiveId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, db_1.transaction)((conn) => __awaiter(this, void 0, void 0, function* () {
                const [rows] = yield conn.execute("SELECT id, status FROM store_receives WHERE id = ? FOR UPDATE", [receiveId]);
                if (!(rows === null || rows === void 0 ? void 0 : rows.length))
                    throw new Error("Receive not found");
                if (rows[0].status !== "pending")
                    throw new Error("Only pending receives can be edited");
                const sets = [];
                const params = [];
                if (updates.store_id !== undefined) {
                    // validate store
                    const srows = yield conn.execute("SELECT id FROM stores WHERE id = ?", [updates.store_id]);
                    if (!(srows === null || srows === void 0 ? void 0 : srows.length))
                        throw new Error("Store not found");
                    sets.push("store_id = ?");
                    params.push(updates.store_id);
                }
                if (updates.reference_no !== undefined) {
                    sets.push("reference_no = ?");
                    params.push(updates.reference_no);
                }
                if (!sets.length)
                    return true;
                params.push(receiveId);
                yield conn.execute(`UPDATE store_receives SET ${sets.join(", ")} WHERE id = ?`, params);
                return true;
            }));
        });
    },
    /**
     * Update a single receive item (only if parent receive is pending).
     */
    updateReceiveItem(itemRowId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, db_1.transaction)((conn) => __awaiter(this, void 0, void 0, function* () {
                const [rows] = yield conn.execute(`SELECT ri.*, r.status FROM store_receive_items ri
         JOIN store_receives r ON ri.receive_id = r.id
         WHERE ri.id = ? FOR UPDATE`, [itemRowId]);
                if (!(rows === null || rows === void 0 ? void 0 : rows.length))
                    throw new Error("Receive item not found");
                if (rows[0].status !== "pending")
                    throw new Error("Only items of pending receives can be edited");
                const sets = [];
                const params = [];
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
                if (!sets.length)
                    return true;
                params.push(itemRowId);
                yield conn.execute(`UPDATE store_receive_items SET ${sets.join(", ")} WHERE id = ?`, params);
                return true;
            }));
        });
    },
    // update list of item in receive
    // not implemented: bulk update of multiple items at once
    // if the item not in the receive add it to the receive
    updateReceiveItems(receiveId, items) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!items || items.length === 0)
                return;
            return yield (0, db_1.transaction)((conn) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const [rows] = yield conn.execute("SELECT id, status FROM store_receives WHERE id = ? FOR UPDATE", [receiveId]);
                if (!(rows === null || rows === void 0 ? void 0 : rows.length))
                    throw new Error("Receive not found");
                if (rows[0].status !== "pending")
                    throw new Error("Only pending receives can be edited");
                // validate item ids exist in the items table
                const itemIds = Array.from(new Set(items.map((i) => Number(i.item_id)).filter(Boolean)));
                if (itemIds.length) {
                    const placeholders = itemIds.map(() => "?").join(",");
                    const [existing] = yield conn.execute(`SELECT id FROM items WHERE id IN (${placeholders})`, itemIds);
                    const existingIds = new Set((existing || []).map((r) => r.id));
                    const missing = itemIds.filter((id) => !existingIds.has(id));
                    if (missing.length)
                        throw new Error(`Items not found: ${missing.join(", ")}`);
                }
                for (const it of items) {
                    if (it.item_id === undefined || it.item_id === null)
                        throw new Error("item_id is required");
                    // check if the item already exists in this receive
                    const [existingRows] = yield conn.execute("SELECT id, quantity, cost_price, note FROM store_receive_items WHERE receive_id = ? AND item_id = ? FOR UPDATE", [receiveId, it.item_id]);
                    const existingRow = existingRows === null || existingRows === void 0 ? void 0 : existingRows[0];
                    // If row exists -> perform partial update based on provided keys
                    if (existingRow) {
                        const sets = [];
                        const params = [];
                        if (it.quantity !== undefined) {
                            const qty = Number(it.quantity);
                            if (!Number.isInteger(qty) || qty <= 0)
                                throw new Error("Quantity must be a positive integer");
                            sets.push("quantity = ?");
                            params.push(qty);
                        }
                        if (it.cost_price !== undefined) {
                            const cp = it.cost_price != null ? Math.round(Number(it.cost_price)) : null;
                            sets.push("cost_price = ?");
                            params.push(cp);
                        }
                        if (it.note !== undefined) {
                            sets.push("note = ?");
                            params.push((_a = it.note) !== null && _a !== void 0 ? _a : null);
                        }
                        if (sets.length) {
                            params.push(existingRow.id); // WHERE id = ?
                            yield conn.execute(`UPDATE store_receive_items SET ${sets.join(", ")} WHERE id = ?`, params);
                        }
                        // nothing to update if no sets - skip
                        continue;
                    }
                    // Row doesn't exist -> insert it (require quantity)
                    if (it.quantity === undefined || it.quantity === null)
                        throw new Error(`Cannot insert item ${it.item_id} into receive without quantity`);
                    const qty = Number(it.quantity);
                    if (!Number.isInteger(qty) || qty <= 0)
                        throw new Error("Quantity must be a positive integer");
                    const costPriceValue = it.cost_price != null ? Math.round(Number(it.cost_price)) : null;
                    const noteValue = (_b = it.note) !== null && _b !== void 0 ? _b : null;
                    yield conn.execute(`INSERT INTO store_receive_items (receive_id, item_id, quantity, cost_price, note)
           VALUES (?, ?, ?, ?, ?)`, [receiveId, it.item_id, qty, costPriceValue, noteValue]);
                }
                return true;
            }));
        });
    },
    /**
     * Delete a receive item (only if parent receive is pending).
     */
    // async deleteReceiveItem(itemRowId: number) {
    //   return await transaction(async (conn: any) => {
    //     const [rows]: any = await conn.execute(
    //       `SELECT ri.*, r.status FROM store_receive_items ri
    //        JOIN store_receives r ON ri.receive_id = r.id
    //        WHERE ri.id = ? FOR UPDATE`,
    //       [itemRowId]
    //     );
    //     if (!rows?.length) throw new Error("Receive item not found");
    //     if (rows[0].status !== "pending")
    //       throw new Error("Only items of pending receives can be deleted");
    //     await conn.execute("DELETE FROM store_receive_items WHERE id = ?", [
    //       itemRowId,
    //     ]);
    //     return true;
    //   });
    // },
    // delete/remove item from receive item list
    deleteReceiveItem(receiveId, itemId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, db_1.transaction)((conn) => __awaiter(this, void 0, void 0, function* () {
                const [rows] = yield conn.execute(`SELECT ri.*, r.status FROM store_receive_items ri
         JOIN store_receives r ON ri.receive_id = r.id
         WHERE ri.receive_id = ? AND ri.item_id = ? FOR UPDATE`, [receiveId, itemId]);
                if (!(rows === null || rows === void 0 ? void 0 : rows.length))
                    throw new Error("Receive item not found");
                if (rows[0].status !== "pending")
                    throw new Error("Only items of pending receives can be deleted");
                yield conn.execute("DELETE FROM store_receive_items WHERE receive_id = ? AND item_id = ?", [receiveId, itemId]);
                return true;
            }));
        });
    },
    /**
     * Get receive by id (includes items and user info).
     */
    getReceiveById(receiveId) {
        return __awaiter(this, void 0, void 0, function* () {
            const rows = yield (0, db_1.query)(`SELECT r.*,
              u.id AS created_by_id, u.name AS created_by_name,
              ua.id AS approved_by_id, ua.name AS approved_by_name,
              s.name AS store_name
       FROM store_receives r
       LEFT JOIN users u ON r.created_by_id = u.id
       LEFT JOIN users ua ON r.approved_by_id = ua.id
       LEFT JOIN stores s ON r.store_id = s.id
       WHERE r.id = ?`, [receiveId]);
            if (!rows.length)
                throw new Error("Receive not found");
            const receive = rows[0];
            const items = yield (0, db_1.query)(`SELECT ri.id, ri.item_id, ri.quantity, ri.cost_price, ri.note,
              i.name AS item_name, i.code AS item_code, i.model AS item_model, i.price AS item_price
       FROM store_receive_items ri
       JOIN items i ON ri.item_id = i.id
       WHERE ri.receive_id = ?
       ORDER BY ri.id ASC`, [receiveId]);
            return Object.assign(Object.assign({}, receive), { items });
        });
    },
    /**
     * List receives with filters and pagination.
     * returns { items: [...], total, page, pageSize }
     */
    listReceives(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const where = [];
            const params = [];
            if (opts === null || opts === void 0 ? void 0 : opts.status) {
                where.push("r.status = ?");
                params.push(opts.status);
            }
            if (opts === null || opts === void 0 ? void 0 : opts.store_id) {
                where.push("r.store_id = ?");
                params.push(opts.store_id);
            }
            if (opts === null || opts === void 0 ? void 0 : opts.fromDate) {
                where.push("r.created_at >= ?");
                params.push(`${opts.fromDate} 00:00:00`);
            }
            if (opts === null || opts === void 0 ? void 0 : opts.toDate) {
                where.push("r.created_at <= ?");
                params.push(`${opts.toDate} 23:59:59`);
            }
            if (opts === null || opts === void 0 ? void 0 : opts.search) {
                const s = `%${opts.search}%`;
                where.push("(r.reference_no LIKE ? OR u.name LIKE ? OR s.name LIKE ? OR CAST(r.id AS CHAR) LIKE ?)");
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
            const countRows = yield (0, db_1.query)(countSql, params);
            const total = Number((_b = (_a = countRows === null || countRows === void 0 ? void 0 : countRows[0]) === null || _a === void 0 ? void 0 : _a.total) !== null && _b !== void 0 ? _b : 0);
            const page = (opts === null || opts === void 0 ? void 0 : opts.page) && opts.page > 0 ? opts.page : 1;
            const pageSize = (opts === null || opts === void 0 ? void 0 : opts.pageSize) && opts.pageSize > 0 ? opts.pageSize : 25;
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
            const rows = yield (0, db_1.query)(mainSql, params.concat([pageSize, offset]));
            return { items: rows, total, page, pageSize };
        });
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
    approveReceive(receiveId, approvedById) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, db_1.transaction)((conn) => __awaiter(this, void 0, void 0, function* () {
                // lock receive
                const [rrows] = yield conn.execute("SELECT id, store_id, status FROM store_receives WHERE id = ? FOR UPDATE", [receiveId]);
                if (!(rrows === null || rrows === void 0 ? void 0 : rrows.length))
                    throw new Error("Receive not found");
                const receive = rrows[0];
                if (receive.status !== "pending")
                    throw new Error("Only pending receives can be approved");
                // fetch items
                const [itemsRows] = yield conn.execute(`SELECT id, item_id, quantity FROM store_receive_items WHERE receive_id = ? FOR UPDATE`, [receiveId]);
                const items = itemsRows || [];
                if (!items.length)
                    throw new Error("Cannot approve empty receive");
                // prepare bulk upsert to store_items within the transaction
                const valuePlaceholders = [];
                const params = [];
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
                yield conn.execute(insertSql, params);
                // mark receive approved
                yield conn.execute(`UPDATE store_receives SET status = 'approved', approved_by_id = ?, approved_at = NOW() WHERE id = ?`, [approvedById, receiveId]);
                // --- AUDIT: create audit records for each item received ---
                for (const it of items) {
                    yield inventoryAuditService_1.inventoryAuditService.createAudit({
                        location_type: "store",
                        location_id: receive.store_id,
                        item_id: it.item_id,
                        txn_type: "receive",
                        quantity_in: it.quantity,
                        reference_id: receiveId,
                        reference_table: "store_receives",
                        note: "Store receive approved",
                    });
                }
                return true;
            }));
        });
    },
    /**
     * Reject a pending receive. Inventory unchanged.
     */
    rejectReceive(receiveId, rejectedById, note) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, db_1.transaction)((conn) => __awaiter(this, void 0, void 0, function* () {
                const [rrows] = yield conn.execute("SELECT id, status FROM store_receives WHERE id = ? FOR UPDATE", [receiveId]);
                if (!(rrows === null || rrows === void 0 ? void 0 : rrows.length))
                    throw new Error("Receive not found");
                if (rrows[0].status !== "pending")
                    throw new Error("Only pending receives can be rejected");
                yield conn.execute(`UPDATE store_receives SET status = 'rejected', approved_by_id = ?, approved_at = NOW(), reference_no = reference_no WHERE id = ?`, [rejectedById, receiveId]);
                // optionally append a note into each receive item or into a dedicated column - here we skip that.
                return true;
            }));
        });
    },
    /**
     * Delete a pending receive (and its items)
     */
    deleteReceive(receiveId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, db_1.transaction)((conn) => __awaiter(this, void 0, void 0, function* () {
                const [rrows] = yield conn.execute("SELECT id, status FROM store_receives WHERE id = ? FOR UPDATE", [receiveId]);
                if (!(rrows === null || rrows === void 0 ? void 0 : rrows.length))
                    throw new Error("Receive not found");
                if (rrows[0].status !== "pending")
                    throw new Error("Only pending receives can be deleted");
                yield conn.execute("DELETE FROM store_receive_items WHERE receive_id = ?", [receiveId]);
                yield conn.execute("DELETE FROM store_receives WHERE id = ?", [
                    receiveId,
                ]);
                return true;
            }));
        });
    },
    /**
     * Delete approved receive and deduct the item quantity from store
     *
     */
    deleteApprovedReceive(receiveId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, db_1.transaction)((conn) => __awaiter(this, void 0, void 0, function* () {
                const [rrows] = yield conn.execute("SELECT id, store_id, status FROM store_receives WHERE id = ? FOR UPDATE", [receiveId]);
                if (!(rrows === null || rrows === void 0 ? void 0 : rrows.length))
                    throw new Error("Receive not found");
                if (rrows[0].status !== "approved")
                    throw new Error("Only approved receives can be deleted");
                // fetch items
                const [itemsRows] = yield conn.execute(`SELECT id, item_id, quantity FROM store_receive_items WHERE receive_id = ? FOR UPDATE`, [receiveId]);
                const items = itemsRows || [];
                if (!items.length)
                    throw new Error("Cannot delete empty receive");
                // prepare bulk upsert to store_items within the transaction
                const valuePlaceholders = [];
                const params = [];
                for (const it of items) {
                    valuePlaceholders.push("(?, ?, ?)");
                    params.push(rrows[0].store_id, it.item_id, it.quantity * -1);
                }
                // Use INSERT ... ON DUPLICATE KEY UPDATE to increment quantity atomically
                const insertSql = `
        INSERT INTO store_items (store_id, item_id, quantity)
        VALUES ${valuePlaceholders.join(", ")}
        ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
      `;
                yield conn.execute(insertSql, params);
                // delete RESPECTIVE audit records
                yield conn.execute("DELETE FROM inventory_audit WHERE reference_id = ? AND reference_table = 'store_receives'", [receiveId]);
                // delete receive
                yield conn.execute("DELETE FROM store_receives WHERE id = ?", [
                    receiveId,
                ]);
                return true;
            }));
        });
    },
};
