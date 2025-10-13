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
exports.SalesService = void 0;
const db_1 = require("../config/db");
class SalesService {
    static processSale(shopId_1, soldById_1, customerName_1, customerContact_1, items_1) {
        return __awaiter(this, arguments, void 0, function* (shopId, soldById, customerName, customerContact, items, status = "completed", tx_ref) {
            return yield (0, db_1.transaction)((connection) => __awaiter(this, void 0, void 0, function* () {
                const serialNumbers = new Set();
                // 1️⃣ Validate stock and serial numbers
                for (const item of items) {
                    const [stockRows] = yield connection.query("SELECT quantity FROM shop_items WHERE shop_id = ? AND item_id = ?", [
                        shopId,
                        item.itemId,
                    ]);
                    const shopItem = stockRows[0];
                    if (!shopItem) {
                        throw new Error(`Item ID ${item.itemId} not found in shop`);
                    }
                    if (shopItem.quantity < item.quantitySold && status === "completed") {
                        throw new Error(`Insufficient stock for item ID ${item.itemId}`);
                    }
                    if (item.serialNumber) {
                        if (serialNumbers.has(item.serialNumber)) {
                            throw new Error(`Duplicate serial number ${item.serialNumber}`);
                        }
                        serialNumbers.add(item.serialNumber);
                        const [serialRows] = yield connection.query("SELECT id FROM sale_items WHERE item_serial_number = ?", [
                            item.serialNumber,
                        ]);
                        if (serialRows.length > 0) {
                            throw new Error(`Serial number ${item.serialNumber} already used in a previous sale`);
                        }
                    }
                }
                // 2️⃣ Calculate total amount
                const totalAmount = items.reduce((sum, item) => sum + item.quantitySold * item.price, 0);
                // 3️⃣ Insert sale record
                const [saleResult] = yield connection.query(`INSERT INTO sales 
        (shop_id, sold_by_id, total_amount, customer_name, customer_contact, status, tx_ref, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`, [
                    shopId,
                    soldById,
                    totalAmount,
                    customerName || null,
                    customerContact || null,
                    status,
                    tx_ref || null,
                ]);
                const saleId = saleResult.insertId;
                // 4️⃣ Always insert sale_items (so we know what was sold)
                for (const item of items) {
                    yield connection.query("INSERT INTO sale_items (sale_id, item_id, quantity, price, item_serial_number) VALUES (?, ?, ?, ?, ?)", [
                        saleId,
                        item.itemId,
                        item.quantitySold,
                        item.price,
                        item.serialNumber || null,
                    ]);
                }
                // 5️⃣ Only update stock when status is 'completed'
                if (status === "completed") {
                    for (const item of items) {
                        yield connection.query("UPDATE shop_items SET quantity = quantity - ? WHERE shop_id = ? AND item_id = ?", [item.quantitySold, shopId, item.itemId]);
                    }
                }
                return saleId;
            }));
        });
    }
    static getSales(shopId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            let queryStr = `
    SELECT 
      s.id, 
      s.shop_id, 
      sh.name AS shop,
      s.sold_by_id, 
      u.name AS seller,
      s.total_amount, 
      s.customer_name, 
      s.customer_contact, 
      s.created_at,
      COUNT(DISTINCT si.item_id) AS total_distinct_items,
      GROUP_CONCAT(
        JSON_OBJECT(
          'item_id', si.item_id,
          'name', i.name,
          'model', i.model,
          'quantity', si.quantity,
          'price', si.price,
          'item_serial_number', si.item_serial_number
        )
      ) AS items
    FROM sales s
    LEFT JOIN sale_items si ON s.id = si.sale_id
    LEFT JOIN items i ON si.item_id = i.id
    LEFT JOIN shops sh ON s.shop_id = sh.id
    LEFT JOIN users u ON s.sold_by_id = u.id
    WHERE s.shop_id = ?
  `;
            const params = [shopId];
            if (startDate && endDate) {
                queryStr += ` AND s.created_at BETWEEN ? AND ?`;
                params.push(startDate, endDate);
            }
            queryStr += ` GROUP BY s.id ORDER BY s.created_at DESC`;
            const salesRows = yield (0, db_1.query)(queryStr, params);
            return salesRows.map((sale) => (Object.assign(Object.assign({}, sale), { items: sale.items ? JSON.parse(`[${sale.items}]`) : [], total_distinct_items: Number(sale.total_distinct_items) || 0 })));
        });
    }
    // get all sales
    static getAllSales() {
        return __awaiter(this, void 0, void 0, function* () {
            // const salesRows = await query<Sale[]>(
            //   "SELECT * FROM sales ORDER BY soldAt DESC"
            // );
            const sql = `
      SELECT 
        s.id, 
        s.shop_id, 
        sh.name AS shop,
        s.sold_by_id, 
        u.name AS seller,
        s.total_amount, 
        s.customer_name, 
        s.customer_contact, 
        s.created_at,
        GROUP_CONCAT(
          JSON_OBJECT(
            'item_id', si.item_id,
            'name', i.name,
            'model', i.model,
            'quantity', si.quantity,
            'price', si.price,
            'item_serial_number', si.item_serial_number
          )
        ) AS items
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      LEFT JOIN items i ON si.item_id = i.id
      LEFT JOIN shops sh ON s.shop_id = sh.id
      LEFT JOIN users u ON s.sold_by_id = u.id
      GROUP BY s.id ORDER BY s.created_at DESC`;
            const salesRows = yield (0, db_1.query)(sql);
            return salesRows.map((sale) => (Object.assign(Object.assign({}, sale), { items: sale.items ? JSON.parse(`[${sale.items}]`) : [] })));
        });
    }
    // update sales status to completed
    static updateSaleStatus(tx_ref, status) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, db_1.transaction)((connection) => __awaiter(this, void 0, void 0, function* () {
                // 1️⃣ Find the sale by tx_ref
                const [saleRows] = yield connection.query("SELECT id, shop_id, status FROM sales WHERE tx_ref = ?", [tx_ref]);
                if (saleRows.length === 0) {
                    throw new Error(`Sale with tx_ref ${tx_ref} not found`);
                }
                const sale = saleRows[0];
                if (sale.status === "completed") {
                    // already completed → avoid double stock reduction
                    return;
                }
                // 2️⃣ Update sale status
                yield connection.query("UPDATE sales SET status = ? WHERE id = ?", [
                    status,
                    sale.id,
                ]);
                // 3️⃣ Only update stock when payment completes
                if (status === "completed") {
                    // Get all sale items
                    const [items] = yield connection.query("SELECT item_id, quantity FROM sale_items WHERE sale_id = ?", [
                        sale.id,
                    ]);
                    for (const item of items) {
                        yield connection.query("UPDATE shop_items SET quantity = quantity - ? WHERE shop_id = ? AND item_id = ?", [item.quantity, sale.shop_id, item.item_id]);
                    }
                }
            }));
        });
    }
    // refund sale
    static refundSale(identifier) {
        return __awaiter(this, void 0, void 0, function* () {
            const { saleId, tx_ref } = identifier;
            if (!saleId && !tx_ref) {
                throw new Error("Either saleId or tx_ref must be provided for refund");
            }
            yield (0, db_1.transaction)((connection) => __awaiter(this, void 0, void 0, function* () {
                // 1️⃣ Find the sale by either saleId or tx_ref
                const [sales] = yield connection.query(`SELECT id, shop_id, status 
       FROM sales 
       WHERE ${saleId ? "id = ?" : "tx_ref = ?"} 
       LIMIT 1`, [saleId || tx_ref]);
                if (sales.length === 0) {
                    throw new Error(`Sale ${saleId || tx_ref} not found`);
                }
                const sale = sales[0];
                // 2️⃣ Prevent multiple refunds
                if (sale.status === "refunded") {
                    throw new Error(`Sale ${saleId || tx_ref} is already refunded`);
                }
                // 3️⃣ Fetch sale items
                const [items] = yield connection.query("SELECT item_id, quantity FROM sale_items WHERE sale_id = ?", [
                    sale.id,
                ]);
                // 4️⃣ Restore quantities to stock
                for (const item of items) {
                    yield connection.query("UPDATE shop_items SET quantity = quantity + ? WHERE shop_id = ? AND item_id = ?", [item.quantity, sale.shop_id, item.item_id]);
                }
                // 5️⃣ Update sale status
                yield connection.query("UPDATE sales SET status = ? WHERE id = ?", [
                    "refunded",
                    sale.id,
                ]);
            }));
        });
    }
}
exports.SalesService = SalesService;
