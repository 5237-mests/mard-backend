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
exports.itemRequestService = void 0;
const db_1 = require("../config/db");
const itemTransferService_1 = require("./itemTransferService");
exports.itemRequestService = {
    createRequest(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { source_type, source_id, destination_type, destination_id, notes, items, created_by, } = input;
            if (!Array.isArray(items) || items.length === 0)
                throw new Error("items required");
            return yield (0, db_1.transaction)((conn) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const reference = `REQ-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 8)}`;
                const [ins] = yield conn.execute(`INSERT INTO item_requests (reference, source_type, source_id, destination_type, destination_id, notes, created_by_id) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
                    reference,
                    source_type,
                    source_id,
                    destination_type,
                    destination_id,
                    notes || null,
                    created_by,
                ]);
                const requestId = ins.insertId;
                const vals = [];
                const params = [];
                for (const it of items) {
                    vals.push("(?, ?, ?, ?)");
                    params.push(requestId, it.item_id, it.quantity, (_a = it.note) !== null && _a !== void 0 ? _a : null);
                }
                if (vals.length) {
                    yield conn.execute(`INSERT INTO item_request_items (request_id, item_id, quantity, note) VALUES ${vals.join(",")}`, params);
                }
                return { id: requestId, reference };
            }));
        });
    },
    getRequests(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            var _f;
            const where = [];
            const params = [];
            if (opts === null || opts === void 0 ? void 0 : opts.status) {
                where.push("r.status = ?");
                params.push(opts.status);
            }
            if (opts === null || opts === void 0 ? void 0 : opts.source_type) {
                where.push("r.source_type = ?");
                params.push(opts.source_type);
            }
            if (opts === null || opts === void 0 ? void 0 : opts.source_id) {
                where.push("r.source_id = ?");
                params.push(opts.source_id);
            }
            if (opts === null || opts === void 0 ? void 0 : opts.destination_type) {
                where.push("r.destination_type = ?");
                params.push(opts.destination_type);
            }
            if (opts === null || opts === void 0 ? void 0 : opts.destination_id) {
                where.push("r.destination_id = ?");
                params.push(opts.destination_id);
            }
            if (opts === null || opts === void 0 ? void 0 : opts.search) {
                // search request reference/notes and also item name/code/model on request items
                const s = `%${opts.search}%`;
                where.push(`(
        r.reference LIKE ? OR r.notes LIKE ? OR EXISTS (
          SELECT 1 FROM item_request_items iri
          JOIN items i ON i.id = iri.item_id
          WHERE iri.request_id = r.id
            AND (i.name LIKE ? OR i.code LIKE ? OR i.model LIKE ?)
        )
      )`);
                // order of params: reference, notes, item.name, item.code, item.model
                params.push(s, s, s, s, s);
            }
            const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
            const page = (_a = opts === null || opts === void 0 ? void 0 : opts.page) !== null && _a !== void 0 ? _a : 1;
            const pageSize = (_b = opts === null || opts === void 0 ? void 0 : opts.pageSize) !== null && _b !== void 0 ? _b : 25;
            const offset = (page - 1) * pageSize;
            // count total for pagination
            const countSql = `SELECT COUNT(*) AS total FROM item_requests r ${whereSql}`;
            const countRows = yield (0, db_1.query)(countSql, params);
            const total = Number((_d = (_c = countRows === null || countRows === void 0 ? void 0 : countRows[0]) === null || _c === void 0 ? void 0 : _c.total) !== null && _d !== void 0 ? _d : 0);
            // fetch detailed rows with creator/approver and source/destination names
            const sql = `
      SELECT
        r.*,
        cu.id AS created_by_user_id, cu.name AS created_by_name, cu.email AS created_by_email,
        au.id AS approved_by_user_id, au.name AS approved_by_name, au.email AS approved_by_email,
        ss.id AS source_shop_id, ss.name AS source_shop_name,
        sst.id AS source_store_id, sst.name AS source_store_name,
        ds.id AS dest_shop_id, ds.name AS dest_shop_name,
        dst.id AS dest_store_id, dst.name AS dest_store_name
      FROM item_requests r
      LEFT JOIN users cu ON r.created_by_id = cu.id
      LEFT JOIN users au ON r.approved_by_id = au.id
      LEFT JOIN shops ss ON r.source_type = 'shop' AND r.source_id = ss.id
      LEFT JOIN stores sst ON r.source_type = 'store' AND r.source_id = sst.id
      LEFT JOIN shops ds ON r.destination_type = 'shop' AND r.destination_id = ds.id
      LEFT JOIN stores dst ON r.destination_type = 'store' AND r.destination_id = dst.id
      ${whereSql}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `;
            const rows = yield (0, db_1.query)(sql, params.concat([pageSize, offset]));
            const ids = rows.map((r) => r.id);
            // fetch request items for returned requests.
            let itemsMap = {};
            if (ids.length) {
                const ritems = yield (0, db_1.query)(`SELECT iri.request_id, iri.item_id, iri.quantity, iri.note, i.name, i.code, i.model
         FROM item_request_items iri
         LEFT JOIN items i ON i.id = iri.item_id
         WHERE iri.request_id IN (${ids.map(() => "?").join(",")})
         ORDER BY iri.id ASC`, ids);
                for (const it of ritems) {
                    (_e = itemsMap[_f = it.request_id]) !== null && _e !== void 0 ? _e : (itemsMap[_f] = []);
                    itemsMap[it.request_id].push(it);
                }
            }
            const mapped = rows.map((r) => {
                var _a;
                const created_by = r.created_by_user_id
                    ? {
                        id: r.created_by_user_id,
                        name: r.created_by_name,
                        email: r.created_by_email,
                    }
                    : null;
                const approved_by = r.approved_by_user_id
                    ? {
                        id: r.approved_by_user_id,
                        name: r.approved_by_name,
                        email: r.approved_by_email,
                    }
                    : null;
                const source = {
                    type: r.source_type,
                    id: r.source_id,
                    name: r.source_type === "shop" ? r.source_shop_name : r.source_store_name,
                };
                const destination = {
                    type: r.destination_type,
                    id: r.destination_id,
                    name: r.destination_type === "shop" ? r.dest_shop_name : r.dest_store_name,
                };
                return Object.assign(Object.assign({}, r), { request_items: (_a = itemsMap[r.id]) !== null && _a !== void 0 ? _a : [], created_by,
                    approved_by,
                    source,
                    destination });
            });
            return { items: mapped, total, page, pageSize };
        });
    },
    // get request by id with source/destination names and items
    getRequestById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
      SELECT
        r.*,
        cu.id AS created_by_user_id, cu.name AS created_by_name, cu.email AS created_by_email,
        au.id AS approved_by_user_id, au.name AS approved_by_name, au.email AS approved_by_email,
        ss.id AS source_shop_id, ss.name AS source_shop_name,
        sst.id AS source_store_id, sst.name AS source_store_name,
        ds.id AS dest_shop_id, ds.name AS dest_shop_name,
        dst.id AS dest_store_id, dst.name AS dest_store_name
      FROM item_requests r
      LEFT JOIN users cu ON r.created_by_id = cu.id
      LEFT JOIN users au ON r.approved_by_id = au.id
      LEFT JOIN shops ss ON r.source_type = 'shop' AND r.source_id = ss.id
      LEFT JOIN stores sst ON r.source_type = 'store' AND r.source_id = sst.id
      LEFT JOIN shops ds ON r.destination_type = 'shop' AND r.destination_id = ds.id
      LEFT JOIN stores dst ON r.destination_type = 'store' AND r.destination_id = dst.id
      WHERE r.id = ?
    `;
            const rows = yield (0, db_1.query)(sql, [id]);
            if (!rows || rows.length === 0)
                throw new Error("Request not found");
            const reqRow = rows[0];
            const items = yield (0, db_1.query)(`SELECT iri.*, i.name, i.code, i.model FROM item_request_items iri LEFT JOIN items i ON i.id = iri.item_id WHERE iri.request_id = ? ORDER BY iri.id ASC`, [id]);
            // source and destination info
            const source = {
                type: reqRow.source_type,
                id: reqRow.source_id,
                name: reqRow.source_type === "shop"
                    ? reqRow.source_shop_name
                    : reqRow.source_store_name,
            };
            const destination = {
                type: reqRow.destination_type,
                id: reqRow.destination_id,
                name: reqRow.destination_type === "shop"
                    ? reqRow.dest_shop_name
                    : reqRow.dest_store_name,
            };
            return Object.assign(Object.assign({}, reqRow), { source,
                destination, request_items: items });
            // return { ...reqRow, request_items: items };
        });
    },
    // update top-level request fields (notes, destination_type/id, status) - only pending can be edited except status changes for admins
    updateRequest(requestId, updaterId, patch) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, db_1.transaction)((conn) => __awaiter(this, void 0, void 0, function* () {
                const [rrows] = yield conn.execute(`SELECT * FROM item_requests WHERE id = ? FOR UPDATE`, [requestId]);
                if (!rrows || rrows.length === 0)
                    throw new Error("Request not found");
                const r = rrows[0];
                if (r.status !== "pending" && patch.status === undefined)
                    throw new Error("Only pending requests can be edited");
                const updates = [];
                const params = [];
                if (patch.notes !== undefined) {
                    updates.push("notes = ?");
                    params.push(patch.notes);
                }
                if (patch.destination_type) {
                    updates.push("destination_type = ?");
                    params.push(patch.destination_type);
                }
                if (patch.destination_id !== undefined) {
                    updates.push("destination_id = ?");
                    params.push(Number(patch.destination_id));
                }
                if (patch.status && patch.status !== r.status) {
                    updates.push("status = ?");
                    params.push(patch.status);
                    if (["approved", "rejected"].includes(patch.status)) {
                        updates.push("approved_by_id = ?");
                        params.push(updaterId);
                    }
                }
                if (updates.length) {
                    yield conn.execute(`UPDATE item_requests SET ${updates.join(", ")} WHERE id = ?`, params.concat([requestId]));
                }
                return { ok: true };
            }));
        });
    },
    // update only provided items (quantity/note). if item not present, insert it (change if you want strict).
    updateRequestItems(requestId, updaterId, items) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Array.isArray(items) || items.length === 0)
                return 0;
            return yield (0, db_1.transaction)((conn) => __awaiter(this, void 0, void 0, function* () {
                const [rrows] = yield conn.execute(`SELECT * FROM item_requests WHERE id = ? FOR UPDATE`, [requestId]);
                if (!rrows || rrows.length === 0)
                    throw new Error("Request not found");
                const r = rrows[0];
                if (r.status !== "pending")
                    throw new Error("Only pending requests can be edited");
                for (const it of items) {
                    const updates = [];
                    const params = [];
                    if (it.quantity !== undefined) {
                        updates.push("quantity = ?");
                        params.push(it.quantity);
                    }
                    if (it.note !== undefined) {
                        updates.push("note = ?");
                        params.push(it.note);
                    }
                    // only execute if there are fields to update
                    if (updates.length > 0) {
                        params.push(requestId, it.item_id);
                        yield conn.execute(`UPDATE item_request_items 
             SET ${updates.join(", ")} 
             WHERE request_id = ? AND item_id = ?`, params);
                    }
                }
            }));
        });
    },
    removeRequestItem(requestId, itemId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const res = yield (0, db_1.query)(`DELETE FROM item_request_items WHERE request_id = ? AND item_id = ?`, [requestId, itemId]);
            return (_a = res.affectedRows) !== null && _a !== void 0 ? _a : 0;
        });
    },
    rejectRequest(requestId, approverId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, db_1.transaction)((conn) => __awaiter(this, void 0, void 0, function* () {
                yield conn.execute(`UPDATE item_requests SET status = ?, approved_by_id = ? WHERE id = ?`, ["rejected", approverId, requestId]);
                return true;
            }));
        });
    },
    // approve: create transfer via itemTransferService and persist transfer_id
    approveRequest(requestId, approverId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, db_1.transaction)((conn) => __awaiter(this, void 0, void 0, function* () {
                const [rrows] = yield conn.execute(`SELECT * FROM item_requests WHERE id = ? FOR UPDATE`, [requestId]);
                if (!rrows || rrows.length === 0)
                    throw new Error("Request not found");
                const r = rrows[0];
                if (r.status !== "pending")
                    throw new Error("Only pending requests can be approved");
                const itemsRows = yield conn.execute(`SELECT item_id, quantity FROM item_request_items WHERE request_id = ?`, [requestId]);
                const items = (itemsRows[0] || itemsRows).map((it) => ({
                    item_id: Number(it.item_id),
                    quantity: Number(it.quantity),
                }));
                if (!items || items.length === 0)
                    throw new Error("Request has no items");
                // create transfer using existing service (map source/destination types to transfer payload)
                const transferPayload = {
                    fromType: r.destination_type === "shop" ? "shop" : "store",
                    fromId: Number(r.destination_id), // source is inventory which is to be deducted(destination for request)
                    toType: r.source_type === "shop" ? "shop" : "store",
                    toId: Number(r.source_id),
                    items: items.map((it) => ({
                        item_id: it.item_id,
                        quantity: it.quantity,
                    })),
                    user_id: approverId,
                };
                const transferId = yield itemTransferService_1.itemTransferService.createTransfer(transferPayload);
                yield conn.execute(`UPDATE item_requests SET status = ?, approved_by_id = ?, transfer_id = ? WHERE id = ?`, ["approved", approverId, transferId, requestId]);
                return { transferId };
            }));
        });
    },
};
