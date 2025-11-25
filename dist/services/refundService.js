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
exports.refundService = void 0;
const db_1 = require("../config/db");
const inventoryAuditService_1 = require("./inventoryAuditService");
exports.refundService = {
    /**
     * Create a refund record with associated items.
     *
     * @param {CreateRefundInput} input - refund details
     * @param {number} input.sale_id - sale ID
     * @param {number} input.shop_id - shop ID
     * @param {number} input.refunded_by - user ID who refunded
     * @param {RefundItemInput[]} input.items - sale items to refund
     * @param {"cash" | "card" | "mobile"} [input.payment_method="cash"] - payment method
     * @param {"completed" | "pending" | "cancelled"} [input.status="completed"] - refund status
     * @param {string} [input.reason=null] - refund reason
     * @returns {Promise<{id: number, total_amount: number}>}
     */
    createRefund(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { sale_id, shop_id, refunded_by, items, payment_method = "cash", status = "completed", reason = null, } = input;
            // Use DB transaction
            return yield (0, db_1.transaction)((conn) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                // Validate sale exists and belongs to the shop
                const [saleRows] = yield conn.query("SELECT id, shop_id, status FROM sales WHERE id = ? FOR UPDATE", [sale_id]);
                if (!saleRows.length)
                    throw new Error("Sale not found");
                const sale = saleRows[0];
                if (sale.shop_id !== Number(shop_id)) {
                    throw new Error("Sale does not belong to the specified shop");
                }
                // Validate items and refundable quantities
                for (const it of items) {
                    const [saleItemRows] = yield conn.query("SELECT id, sale_id, item_id, quantity, price FROM sale_items WHERE id = ? FOR UPDATE", [it.sale_item_id]);
                    if (!saleItemRows.length)
                        throw new Error(`Sale item not found (id=${it.sale_item_id})`);
                    const saleItem = saleItemRows[0];
                    if (saleItem.sale_id !== sale_id)
                        throw new Error(`Sale item ${it.sale_item_id} does not belong to sale ${sale_id}`);
                    if (Number(it.quantity) <= 0)
                        throw new Error("Quantity must be positive");
                    const [refSumRows] = yield conn.query("SELECT COALESCE(SUM(quantity),0) AS refunded_qty FROM refund_items WHERE sale_item_id = ?", [it.sale_item_id]);
                    const alreadyRefunded = Number((_b = (_a = refSumRows[0]) === null || _a === void 0 ? void 0 : _a.refunded_qty) !== null && _b !== void 0 ? _b : 0);
                    const refundable = Number(saleItem.quantity) - alreadyRefunded;
                    // Check if requested quantity exceeds refundable quantity
                    if (it.quantity > refundable) {
                        throw new Error(`Refund quantity for sale_item ${it.sale_item_id} exceeds refundable quantity (${refundable})`);
                    }
                    // check unit price matches or less than sold price
                    if (Number(it.unit_price) > Number(saleItem.price)) {
                        throw new Error(`Unit price for sale_item ${it.sale_item_id} exceeds original sale price`);
                    }
                }
                // Calculate total amount
                const totalAmount = items.reduce((sum, it) => sum + Number(it.quantity) * Number(it.unit_price), 0);
                // Insert refund record
                const [res] = yield conn.query(`INSERT INTO refunds (sale_id, shop_id, refunded_by, total_amount, payment_method, status, reason, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`, [
                    sale_id,
                    shop_id,
                    refunded_by,
                    totalAmount,
                    payment_method,
                    status,
                    reason,
                ]);
                const refundId = res.insertId;
                // Insert refund_items, update shop inventory and create audit for each item
                for (const it of items) {
                    const lineAmount = Number(it.quantity) * Number(it.unit_price);
                    yield conn.query(`INSERT INTO refund_items (refund_id, sale_item_id, item_id, quantity, unit_price, line_amount, reason)
             VALUES (?, ?, ?, ?, ?, ?, ?)`, [
                        refundId,
                        it.sale_item_id,
                        it.item_id,
                        it.quantity,
                        it.unit_price,
                        lineAmount,
                        (_c = it.reason) !== null && _c !== void 0 ? _c : null,
                    ]);
                    // Upsert into shop_items (increment quantity)
                    yield conn.query(`INSERT INTO shop_items (shop_id, item_id, quantity)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`, [shop_id, it.item_id, it.quantity]);
                    // Update refunded quantity in sale_items and unit price
                    yield conn.query(`UPDATE sale_items
             SET refunded_quantity = refunded_quantity + ?,
                 refunded_price = ?
             WHERE id = ?`, [it.quantity, it.unit_price, it.sale_item_id]);
                    // Create inventory audit (inbound to shop)
                    yield inventoryAuditService_1.inventoryAuditService.createAudit({
                        location_type: "shop",
                        location_id: Number(shop_id),
                        item_id: it.item_id,
                        txn_type: "receive",
                        quantity_in: Number(it.quantity),
                        quantity_out: 0,
                        reference_id: refundId,
                        reference_table: "refunds",
                        note: `Refund return for sale ${sale_id}`,
                    });
                }
                // update sale status based on refunded quantities
                const [saleItemRows] = yield conn.query("SELECT id, quantity, COALESCE(refunded_quantity, 0) AS refunded_quantity FROM sale_items WHERE sale_id = ?", [sale_id]);
                const totalRemaining = (saleItemRows || []).reduce((sum, it) => sum + (Number(it.quantity) - Number(it.refunded_quantity || 0)), 0);
                const totalSold = (saleItemRows || []).reduce((sum, it) => sum + Number(it.quantity), 0);
                // Determine new status:
                // - fully refunded when nothing remaining
                // - partially_refunded if some remaining are refunded (i.e., not fully refunded)
                let newStatus = null;
                if (totalRemaining === 0 && totalSold > 0) {
                    newStatus = "refunded";
                }
                else if (totalRemaining < totalSold) {
                    newStatus = "partially_refunded";
                }
                if (newStatus && sale.status !== newStatus) {
                    yield conn.query("UPDATE sales SET status = ? WHERE id = ?", [
                        newStatus,
                        sale_id,
                    ]);
                }
                return { id: refundId, total_amount: totalAmount };
            }));
        });
    },
    // create refund using sale_id and make sale status refunded
    createRefundFromSaleId(sale_id_1, shop_id_1, refunded_by_1) {
        return __awaiter(this, arguments, void 0, function* (sale_id, shop_id, refunded_by, payment_method = "cash", status = "completed", reason) {
            return yield (0, db_1.transaction)((conn) => __awaiter(this, void 0, void 0, function* () {
                // Validate sale and shop
                const [saleRows] = yield conn.query("SELECT id, shop_id, status FROM sales WHERE id = ? FOR UPDATE", [sale_id]);
                if (!saleRows.length)
                    throw new Error("Sale not found");
                const sale = saleRows[0];
                if (sale.shop_id !== Number(shop_id)) {
                    throw new Error("Sale does not belong to the specified shop");
                }
                if (sale.status !== "completed") {
                    throw new Error("Only completed sales can be refunded");
                }
                // if refund already exists for this sale, prevent duplicate refunds
                const [existingRefunds] = yield conn.query("SELECT id FROM refunds WHERE sale_id = ?", [sale_id]);
                if (existingRefunds.length) {
                    throw new Error("Refund already exists for this sale");
                }
                // Load sale items and determine refundable qty for each
                const [saleItemRows] = yield conn.query("SELECT id, item_id, quantity, price, COALESCE(refunded_quantity,0) AS refunded_quantity FROM sale_items WHERE sale_id = ? FOR UPDATE", [sale_id]);
                if (!saleItemRows.length)
                    throw new Error("Sale has no items");
                const refundableItems = saleItemRows
                    .map((si) => {
                    const qty = Number(si.quantity || 0);
                    const refundedQty = Number(si.refunded_quantity || 0);
                    const refundable = Math.max(0, qty - refundedQty);
                    return {
                        sale_item_id: si.id,
                        item_id: si.item_id,
                        refundable_quantity: refundable,
                        unit_price: Number(si.price || 0),
                    };
                })
                    .filter((r) => r.refundable_quantity > 0);
                if (refundableItems.length === 0) {
                    throw new Error("Sale already fully refunded");
                }
                // Calculate total amount
                const totalAmount = refundableItems.reduce((sum, it) => sum + it.refundable_quantity * it.unit_price, 0);
                // Insert refund record
                const [res] = yield conn.query(`INSERT INTO refunds (sale_id, shop_id, refunded_by, total_amount, payment_method, status, reason, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`, [
                    sale_id,
                    shop_id,
                    refunded_by,
                    totalAmount,
                    payment_method,
                    status,
                    reason || null,
                ]);
                const refundId = res.insertId;
                // For each refundable item, create refund_items, update inventory and sale_items, and create audit
                for (const it of refundableItems) {
                    const lineAmount = it.refundable_quantity * it.unit_price;
                    yield conn.query(`INSERT INTO refund_items (refund_id, sale_item_id, item_id, quantity, unit_price, line_amount, reason)
           VALUES (?, ?, ?, ?, ?, ?, ?)`, [
                        refundId,
                        it.sale_item_id,
                        it.item_id,
                        it.refundable_quantity,
                        it.unit_price,
                        lineAmount,
                        reason || null,
                    ]);
                    // Upsert into shop_items (increment stock)
                    yield conn.query(`INSERT INTO shop_items (shop_id, item_id, quantity)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`, [shop_id, it.item_id, it.refundable_quantity]);
                    // Update refunded quantity and set refunded_price to the unit price (consistent with createRefund)
                    yield conn.query(`UPDATE sale_items
             SET refunded_quantity = COALESCE(refunded_quantity, 0) + ?,
                 refunded_price = ?
             WHERE id = ?`, [it.refundable_quantity, it.unit_price, it.sale_item_id]);
                    // Create inventory audit (inbound to shop)
                    yield inventoryAuditService_1.inventoryAuditService.createAudit({
                        location_type: "shop",
                        location_id: Number(shop_id),
                        item_id: it.item_id,
                        txn_type: "receive",
                        quantity_in: Number(it.refundable_quantity),
                        quantity_out: 0,
                        reference_id: refundId,
                        reference_table: "refunds",
                        note: `Refund return for sale ${sale_id}`,
                    });
                }
                // Update sale status to refunded if fully refunded; partially_refunded if some remain (rare here)
                const [updatedSaleItems] = yield conn.query("SELECT id, quantity, COALESCE(refunded_quantity,0) AS refunded_quantity FROM sale_items WHERE sale_id = ?", [sale_id]);
                const totalRemaining = (updatedSaleItems || []).reduce((sum, si) => sum + (Number(si.quantity) - Number(si.refunded_quantity || 0)), 0);
                const totalSold = (updatedSaleItems || []).reduce((sum, si) => sum + Number(si.quantity), 0);
                let newStatus = null;
                if (totalRemaining === 0 && totalSold > 0) {
                    newStatus = "refunded";
                }
                else if (totalRemaining < totalSold) {
                    newStatus = "partially_refunded";
                }
                if (newStatus && sale.status !== newStatus) {
                    yield conn.query("UPDATE sales SET status = ? WHERE id = ?", [
                        newStatus,
                        sale_id,
                    ]);
                }
                return { id: refundId, total_amount: totalAmount };
            }));
        });
    },
    /**
     * Retrieves refunds with optional filters and pagination.
     * Filters can be applied based on sale_id, shop_id, refunded_by, date_from and date_to.
     * Only the first 200 results are returned.
     * @param opts - An object containing optional filters and pagination.
     * @return A promise resolving an array of refund objects.
     */
    getRefunds() {
        return __awaiter(this, arguments, void 0, function* (opts = {}) {
            const where = [];
            const params = [];
            if (opts.shop_id) {
                where.push("r.shop_id = ?");
                params.push(opts.shop_id);
            }
            if (opts.sale_id) {
                where.push("r.sale_id = ?");
                params.push(opts.sale_id);
            }
            if (opts.refunded_by) {
                where.push("r.refunded_by = ?");
                params.push(opts.refunded_by);
            }
            if (opts.date_from) {
                where.push("r.created_at >= ?");
                params.push(opts.date_from);
            }
            if (opts.date_to) {
                where.push("r.created_at <= ?");
                params.push(opts.date_to);
            }
            const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
            const sql = `
      SELECT r.*,
             u.id as refunded_by_id, u.name as refunded_by_name,
             s.name as shop_name
      FROM refunds r
      LEFT JOIN users u ON r.refunded_by = u.id
      LEFT JOIN shops s ON r.shop_id = s.id
      
      ${whereSql}
      ORDER BY r.created_at DESC
      LIMIT 200
    `;
            const refunds = yield (0, db_1.query)(sql, params);
            // include refund_items details for returned refunds
            if (refunds.length > 0) {
                const ids = refunds.map((r) => r.id);
                const placeholders = ids.map(() => "?").join(",");
                const itemSql = `
        SELECT ri.*, si.quantity AS original_quantity, si.price AS original_unit_price,
               i.name AS item_name, i.code AS item_code, i.model AS item_model
        FROM refund_items ri
        LEFT JOIN sale_items si ON ri.sale_item_id = si.id
        LEFT JOIN items i ON ri.item_id = i.id
        WHERE ri.refund_id IN (${placeholders})
        ORDER BY ri.id ASC
      `;
                const items = yield (0, db_1.query)(itemSql, ids);
                const itemsByRefund = {};
                for (const item of items) {
                    if (!itemsByRefund[item.refund_id])
                        itemsByRefund[item.refund_id] = [];
                    itemsByRefund[item.refund_id].push(item);
                }
                // attach items to refunds
                for (const r of refunds) {
                    r.items = itemsByRefund[r.id] || [];
                }
            }
            return refunds;
        });
    },
    /**
     * Get a refund by its id.
     * @param id The id of the refund.
     * @return A promise resolving an object containing the refund details.
     * The object contains the refund details and an array of items.
     * Each item contains the item details and the original quantity from the sale.
     * @throws {Error} If the refund is not found.
     */
    getRefundById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
      SELECT r.*, u.id AS refunded_by_id, u.name AS refunded_by_name, s.name AS shop_name
      FROM refunds r
      LEFT JOIN users u ON r.refunded_by = u.id
      LEFT JOIN shops s ON r.shop_id = s.id
      WHERE r.id = ?
      LIMIT 1
    `;
            const rows = yield (0, db_1.query)(sql, [id]);
            if (!rows.length)
                throw new Error("Refund not found");
            const refund = rows[0];
            // load items
            const items = yield (0, db_1.query)(`SELECT ri.*, si.quantity AS original_quantity, i.name AS item_name, i.code AS item_code, i.model AS item_model
       FROM refund_items ri
       LEFT JOIN sale_items si ON ri.sale_item_id = si.id
       LEFT JOIN items i ON ri.item_id = i.id
       WHERE ri.refund_id = ?`, [id]);
            refund.items = items;
            return refund;
        });
    },
};
