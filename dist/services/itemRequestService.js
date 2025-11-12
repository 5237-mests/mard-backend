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
    createRequest(_a) {
        return __awaiter(this, arguments, void 0, function* ({ shop_id, store_id, items, created_by, }) {
            if (!Array.isArray(items) || items.length === 0)
                throw new Error("Items required");
            return yield (0, db_1.transaction)((conn) => __awaiter(this, void 0, void 0, function* () {
                const reference = `REQ-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 8)}`;
                const [res] = yield conn.execute(`INSERT INTO item_requests (reference, shop_id, store_id, created_by_id, status) VALUES (?, ?, ?, ?, ?)`, [reference, shop_id, store_id, created_by, "pending"]);
                const requestId = res.insertId;
                const vals = [];
                const params = [];
                for (const it of items) {
                    vals.push("(?, ?, ?, ?)");
                    params.push(requestId, it.item_id, it.quantity, it.note || null);
                }
                yield conn.execute(`INSERT INTO item_request_items (request_id, item_id, quantity, note) VALUES ${vals.join(",")}`, params);
                return { id: requestId, reference };
            }));
        });
    },
    getRequests(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            var _b;
            const where = [];
            const params = [];
            if (opts === null || opts === void 0 ? void 0 : opts.status) {
                where.push("r.status = ?");
                params.push(opts.status);
            }
            if (opts === null || opts === void 0 ? void 0 : opts.shop_id) {
                where.push("r.shop_id = ?");
                params.push(opts.shop_id);
            }
            if (opts === null || opts === void 0 ? void 0 : opts.store_id) {
                where.push("r.store_id = ?");
                params.push(opts.store_id);
            }
            if (opts === null || opts === void 0 ? void 0 : opts.search) {
                where.push("(r.reference LIKE ? OR s.name LIKE ?)");
                params.push(`%${opts.search}%`, `%${opts.search}%`);
            }
            const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
            const page = (opts === null || opts === void 0 ? void 0 : opts.page) && opts.page > 0 ? opts.page : 1;
            const pageSize = (opts === null || opts === void 0 ? void 0 : opts.pageSize) && opts.pageSize > 0 ? opts.pageSize : 25;
            const offset = (page - 1) * pageSize;
            const rows = yield (0, db_1.query)(`SELECT r.*, s.name AS shop_name, st.name AS store_name, u.name AS created_by, a.name AS approved_by
       FROM item_requests r
       LEFT JOIN shops s ON r.shop_id = s.id
       LEFT JOIN stores st ON r.store_id = st.id
       LEFT JOIN users u ON r.created_by_id = u.id
       LEFT JOIN users a ON r.approved_by_id = a.id
       ${whereSql}
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`, params.concat([pageSize, offset]));
            // fetch items for these .
            const ids = rows.map((r) => r.id);
            let itemsMap = {};
            if (ids.length) {
                const ritems = yield (0, db_1.query)(`SELECT iri.request_id, iri.item_id, iri.quantity, iri.note, i.name, i.code, i.model
         FROM item_request_items iri
         JOIN items i ON iri.item_id = i.id
         WHERE iri.request_id IN (${ids.map(() => "?").join(",")})
         ORDER BY iri.id ASC`, ids);
                for (const it of ritems) {
                    (_a = itemsMap[_b = it.request_id]) !== null && _a !== void 0 ? _a : (itemsMap[_b] = []);
                    itemsMap[it.request_id].push(it);
                }
            }
            return {
                data: rows.map((r) => {
                    var _a;
                    return (Object.assign(Object.assign({}, r), { request_items: (_a = itemsMap[r.id]) !== null && _a !== void 0 ? _a : [] }));
                }),
                page,
                pageSize,
                total: rows.length < pageSize ? offset + rows.length : undefined,
            };
        });
    },
    getRequestById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield (0, db_1.query)(`SELECT r.*, s.name AS shop_name, st.name AS store_name, u.name AS created_by, a.name AS approved_by
       FROM item_requests r
       LEFT JOIN shops s ON r.shop_id = s.id
       LEFT JOIN stores st ON r.store_id = st.id
       LEFT JOIN users u ON r.created_by_id = u.id
       LEFT JOIN users a ON r.approved_by_id = a.id
       WHERE r.id = ?`, [id]);
            if (!rows || rows.length === 0)
                throw new Error("Request not found");
            const request = rows;
            const items = yield (0, db_1.query)(`SELECT iri.item_id, iri.quantity, iri.note, i.name, i.code, i.model
       FROM item_request_items iri JOIN items i ON iri.item_id = i.id
       WHERE iri.request_id = ? ORDER BY iri.id ASC`, [id]);
            return Object.assign(Object.assign({}, request), { request_items: items });
        });
    },
    // approve: create transfer using itemTransferService and update request
    approveRequest(requestId, approverId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, db_1.transaction)((conn) => __awaiter(this, void 0, void 0, function* () {
                // load request + items
                const [rrows] = yield conn.execute(`SELECT * FROM item_requests WHERE id = ? FOR UPDATE`, [requestId]);
                if (!rrows || rrows.length === 0)
                    throw new Error("Request not found");
                const r = rrows[0];
                if (r.status !== "pending")
                    throw new Error("Only pending requests can be approved");
                const items = (yield conn.execute(`SELECT item_id, quantity FROM item_request_items WHERE request_id = ?`, [requestId]))[0];
                if (!items || items.length === 0)
                    throw new Error("Request has no items");
                // call transfer service to move items from shop -> store
                const transferId = yield itemTransferService_1.itemTransferService.createTransfer({
                    fromType: "store",
                    fromId: Number(r.store_id),
                    toType: "shop",
                    toId: Number(r.shop_id),
                    items: items.map((it) => ({
                        item_id: Number(it.item_id),
                        quantity: Number(it.quantity),
                    })),
                    user_id: approverId,
                });
                // update request
                yield conn.execute(`UPDATE item_requests SET status = ?, approved_by_id = ?, transfer_id = ? WHERE id = ?`, ["approved", approverId, transferId, requestId]);
                return { transferId };
            }));
        });
    },
    // Edit request items (only pending)
    updateRequest(requestId, updaterId, patch) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, db_1.transaction)((conn) => __awaiter(this, void 0, void 0, function* () {
                // 1. Verify the request exists
                const [rrows] = yield conn.execute(`SELECT * FROM item_requests WHERE id = ?`, [requestId]);
                if (!rrows || rrows.length === 0)
                    throw new Error("Request not found");
                const r = rrows[0];
                // 2. Only allow edits on pending requests
                if (r.status !== "pending")
                    throw new Error("Only pending requests can be edited");
                // 3. Update individual item fields if provided
                if (patch.items && patch.items.length > 0) {
                    for (const it of patch.items) {
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
                }
                // 4. Optional: Update status if provided
                // if (patch.status) {
                //   await conn.execute(
                //     `UPDATE item_requests
                //    SET status = ?, updated_by_id = ?, updated_at = NOW()
                //    WHERE id = ?`,
                //     [patch.status, updaterId, requestId]
                //   );
                // } else {
                //   // Always update metadata on
                //   await conn.execute(
                //     `UPDATE item_requests
                //    SET approved_by_id = ?
                //    WHERE id = ?`,
                //     [updaterId, requestId]
                //   );
                // }
                return true;
            }));
        });
    },
    // remove item from item request
    removeRequestItem(requestId, itemId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, db_1.transaction)((conn) => __awaiter(this, void 0, void 0, function* () {
                const [rrows] = yield conn.execute(`SELECT * FROM item_requests WHERE id = ? FOR UPDATE`, [requestId]);
                if (!rrows || rrows.length === 0)
                    throw new Error("Request not found");
                const r = rrows[0];
                if (r.status !== "pending")
                    throw new Error("Only pending requests can be edited");
                yield conn.execute(`DELETE FROM item_request_items WHERE request_id = ? AND item_id = ?`, [requestId, itemId]);
                return true;
            }));
        });
    },
    // Reject request
    rejectRequest(requestId, approverId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, db_1.transaction)((conn) => __awaiter(this, void 0, void 0, function* () {
                const [rrows] = yield conn.execute(`SELECT * FROM item_requests WHERE id = ? FOR UPDATE`, [requestId]);
                if (!rrows || rrows.length === 0)
                    throw new Error("Request not found");
                const r = rrows[0];
                if (r.status !== "pending")
                    throw new Error("Only pending requests can be rejected");
                yield conn.execute(`UPDATE item_requests SET status = ?, approved_by_id = ? WHERE id = ?`, ["rejected", approverId, requestId]);
                return true;
            }));
        });
    },
};
