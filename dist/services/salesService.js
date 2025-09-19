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
    static processSale2(shopId, soldById, customerName, customerContact, items) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, db_1.transaction)((connection) => __awaiter(this, void 0, void 0, function* () {
                // Validate stock availability and serial number uniqueness
                const serialNumbers = new Set();
                for (const item of items) {
                    // Check stock
                    const stockRows = yield (0, db_1.query)("SELECT quantity FROM shop_items WHERE shop_id = ? AND item_id = ?", [shopId, item.itemId]);
                    const shopItem = stockRows[0];
                    if (!shopItem || shopItem.quantity < item.quantitySold) {
                        throw new Error(`Insufficient stock for item ID ${item.itemId}`);
                    }
                    // Validate serial number uniqueness in sale_items
                    if (item.serialNumber) {
                        if (serialNumbers.has(item.serialNumber)) {
                            throw new Error(`Duplicate serial number ${item.serialNumber} in this sale`);
                        }
                        serialNumbers.add(item.serialNumber);
                        const serialRows = yield (0, db_1.query)("SELECT id FROM sale_items WHERE item_serial_number = ?", [item.serialNumber]);
                        if (serialRows.length > 0) {
                            throw new Error(`Serial number ${item.serialNumber} already used in a previous sale`);
                        }
                    }
                }
                // Calculate total amount (in cents)
                const totalAmount = items.reduce((sum, item) => sum + item.quantitySold * item.price, 0);
                // Insert sale record
                const saleResult = yield (0, db_1.query)("INSERT INTO sales (shop_id, sold_by_id, total_amount, customer_name, customer_contact, created_at) VALUES (?, ?, ?, ?, ?, NOW())", [
                    shopId,
                    soldById,
                    totalAmount,
                    customerName || null,
                    customerContact || null,
                ]);
                const saleId = saleResult.insertId;
                // Insert sale items
                for (const item of items) {
                    yield (0, db_1.query)("INSERT INTO sale_items (sale_id, item_id, quantity, price, item_serial_number) VALUES (?, ?, ?, ?, ?)", [
                        saleId,
                        item.itemId,
                        item.quantitySold,
                        item.price,
                        item.serialNumber || null,
                    ]);
                    // Update shop inventory
                    yield (0, db_1.query)("UPDATE shop_items SET quantity = quantity - ? WHERE shop_id = ? AND item_id = ?", [item.quantitySold, shopId, item.itemId]);
                }
                return saleId;
            }));
        });
    }
    static processSale(shopId, soldById, customerName, customerContact, items) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, db_1.transaction)((connection) => __awaiter(this, void 0, void 0, function* () {
                // Validate stock availability and serial number uniqueness
                const serialNumbers = new Set();
                for (const item of items) {
                    // Check stock
                    const [stockRows] = yield connection.query("SELECT quantity FROM shop_items WHERE shop_id = ? AND item_id = ?", [
                        shopId,
                        item.itemId,
                    ]);
                    const shopItem = stockRows[0];
                    if (!shopItem || shopItem.quantity < item.quantitySold) {
                        throw new Error(`Insufficient stock for item ID ${item.itemId}`);
                    }
                    // Validate serial number uniqueness in sale_items
                    if (item.serialNumber) {
                        if (serialNumbers.has(item.serialNumber)) {
                            throw new Error(`Duplicate serial number ${item.serialNumber} in this sale`);
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
                // Calculate total amount (in cents)
                const totalAmount = items.reduce((sum, item) => sum + item.quantitySold * item.price, 0);
                // Insert sale record
                const [saleResult] = yield connection.query("INSERT INTO sales (shop_id, sold_by_id, total_amount, customer_name, customer_contact, created_at) VALUES (?, ?, ?, ?, ?, NOW())", [
                    shopId,
                    soldById,
                    totalAmount,
                    customerName || null,
                    customerContact || null,
                ]);
                const saleId = saleResult.insertId;
                // Insert sale items + update stock
                for (const item of items) {
                    yield connection.query("INSERT INTO sale_items (sale_id, item_id, quantity, price, item_serial_number) VALUES (?, ?, ?, ?, ?)", [
                        saleId,
                        item.itemId,
                        item.quantitySold,
                        item.price,
                        item.serialNumber || null,
                    ]);
                    yield connection.query("UPDATE shop_items SET quantity = quantity - ? WHERE shop_id = ? AND item_id = ?", [item.quantitySold, shopId, item.itemId]);
                }
                return saleId;
            }));
        });
    }
    static getSales2(shopId, startDate, endDate) {
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
            return salesRows.map((sale) => (Object.assign(Object.assign({}, sale), { items: sale.items ? JSON.parse(`[${sale.items}]`) : [] })));
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
}
exports.SalesService = SalesService;
