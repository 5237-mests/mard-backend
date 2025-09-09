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
exports.searchSales = exports.deleteSale = exports.updateSale = exports.getSaleById = exports.getAllSalesByUser = exports.getAllSales = void 0;
const db_1 = require("../config/db");
// Get all sales with items[]
const getAllSales = () => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `
    SELECT 
      s.id,
      s.shop_id,
      s.sold_by_id,
      s.total_amount,
      s.customer_name,
      s.customer_contact,
      s.created_at,
      u.name AS seller,
      sh.name AS shop,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'item_id', si.item_id,
          'quantity', si.quantity,
          'price', si.price,
          'ITEM_serial_number', si.item_serial_number,
          'name', i.name,
          'model', i.model
        )
      ) AS items
    FROM sales s
    JOIN sale_items si ON s.id = si.sale_id
    JOIN items i ON si.item_id = i.id
    JOIN users u ON s.sold_by_id = u.id
    JOIN shops sh ON s.shop_id = sh.id
    GROUP BY s.id
    ORDER BY s.created_at DESC
  `;
    return yield (0, db_1.query)(sql);
});
exports.getAllSales = getAllSales;
// Get all sales with items[]
const getAllSalesByUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `
    SELECT 
      s.id,
      s.shop_id,
      s.sold_by_id,
      s.total_amount,
      s.customer_name,
      s.customer_contact,
      s.created_at,
      u.name AS seller,
      sh.name AS shop,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'item_id', si.item_id,
          'quantity', si.quantity,
          'price', si.price,
          'ITEM_serial_number', si.item_serial_number,
          'name', i.name,
          'model', i.model
        )
      ) AS items
    FROM sales s
    JOIN sale_items si ON s.id = si.sale_id
    JOIN items i ON si.item_id = i.id
    JOIN users u ON s.sold_by_id = u.id
    JOIN shops sh ON s.shop_id = sh.id
    GROUP BY s.id
    ORDER BY s.created_at DESC
  `;
    return yield (0, db_1.query)(sql);
});
exports.getAllSalesByUser = getAllSalesByUser;
// Get a single sale by ID with items[]
const getSaleById = (saleId) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `
    SELECT 
      s.id,
      s.shop_id,
      s.sold_by_id,
      s.total_amount,
      s.customer_name,
      s.customer_contact,
      s.created_at,
      u.name AS seller,
      sh.name AS shop,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'item_id', si.item_id,
          'quantity', si.quantity,
          'price', si.price,
          'item_serial_number', si.item_serial_number,
          'name', i.name,
          'model', i.model
        )
      ) AS items
    FROM sales s
    JOIN sale_items si ON s.id = si.sale_id
    JOIN items i ON si.item_id = i.id
    JOIN users u ON s.sold_by_id = u.id
    JOIN shops sh ON s.shop_id = sh.id
    WHERE s.id = ?
    GROUP BY s.id
  `;
    const rows = yield (0, db_1.query)(sql, [saleId]);
    return rows[0] || null;
});
exports.getSaleById = getSaleById;
// Update sale details (walk-in customers only)
const updateSale = (saleId, updates) => __awaiter(void 0, void 0, void 0, function* () {
    const fields = [];
    const values = [];
    if (updates.customer_name) {
        fields.push("customer_name = ?");
        values.push(updates.customer_name);
    }
    if (updates.customer_contact) {
        fields.push("customer_contact = ?");
        values.push(updates.customer_contact);
    }
    if (fields.length === 0) {
        throw new Error("No valid fields to update");
    }
    values.push(saleId);
    const sql = `UPDATE sales SET ${fields.join(", ")} WHERE id = ?`;
    return yield (0, db_1.query)(sql, values);
});
exports.updateSale = updateSale;
// Delete a sale (cascade removes items)
const deleteSale = (saleId) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `DELETE FROM sales WHERE id = ?`;
    return yield (0, db_1.query)(sql, [saleId]);
});
exports.deleteSale = deleteSale;
const searchSales = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    let sql = `
    SELECT s.id, s.customer_name, s.customer_contact, s.total_amount, s.created_at,
           si.item_id, si.quantity, si.price_at_sale, i.name AS item_name
    FROM sales s
    JOIN sale_items si ON s.id = si.sale_id
    JOIN items i ON si.item_id = i.id
    WHERE 1=1
  `;
    const params = [];
    if (filters.customer_name) {
        sql += " AND s.customer_name LIKE ?";
        params.push(`%${filters.customer_name}%`);
    }
    if (filters.customer_contact) {
        sql += " AND s.customer_contact LIKE ?";
        params.push(`%${filters.customer_contact}%`);
    }
    if (filters.date_from) {
        sql += " AND DATE(s.created_at) >= ?";
        params.push(filters.date_from);
    }
    if (filters.date_to) {
        sql += " AND DATE(s.created_at) <= ?";
        params.push(filters.date_to);
    }
    sql += " ORDER BY s.created_at DESC";
    const [rows] = yield (0, db_1.query)(sql, params);
    return rows;
});
exports.searchSales = searchSales;
