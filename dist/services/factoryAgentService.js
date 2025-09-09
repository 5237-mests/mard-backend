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
// services/factoryAgentService.ts
const db_1 = require("../config/db");
class FactoryAgentService {
    getShopStock(shopId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
      SELECT 
        si.quantity,
        i.id AS item_id,
        i.name AS item_name,
        i.model AS item_model,
        i.price AS item_price,
        i.image_url
      FROM shop_items si
      JOIN items i ON si.item_id = i.id
      WHERE si.shop_id = ?
        AND (? IS NULL OR i.name LIKE ? OR i.model LIKE ?)
        AND (? IS NULL OR si.quantity <= ?)
    `;
            const rows = yield (0, db_1.query)(sql);
            return rows;
        });
    }
    createNewProductRequest(userId, input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, category, brand, description, supplier } = input;
            return (0, db_1.transaction)((connection) => __awaiter(this, void 0, void 0, function* () {
                const [requestResult] = (yield connection.query('INSERT INTO requests (factory_agent_id, type, status) VALUES (?, "new_product", "pending")', [userId]));
                const requestId = requestResult.insertId;
                yield connection.query("INSERT INTO new_product_requests (request_id, name, category, brand, description, supplier) VALUES (?, ?, ?, ?, ?, ?)", [requestId, name, category, brand, description, supplier]);
                return { request_id: requestId, message: "Recommendation submitted" };
            }));
        });
    }
    createRepurchaseRequest(userId, input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { item_id, recommended_quantity, reason } = input;
            return (0, db_1.transaction)((connection) => __awaiter(this, void 0, void 0, function* () {
                const [requestResult] = (yield connection.query('INSERT INTO requests (factory_agent_id, type, status) VALUES (?, "repurchase", "pending")', [userId]));
                const requestId = requestResult.insertId;
                yield connection.query("INSERT INTO repurchase_requests (request_id, item_id, recommended_quantity, reason) VALUES (?, ?, ?, ?)", [requestId, item_id, recommended_quantity, reason]);
                return { request_id: requestId, message: "Repurchase requested" };
            }));
        });
    }
    getRequests(userId, queryParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const { type, status } = queryParams;
            const sql = `
      SELECT r.id, r.type, r.status, r.created_at, r.updated_at,
             CASE
               WHEN r.type = 'new_product' THEN
                 JSON_OBJECT('name', npr.name, 'category', npr.category, 'brand', npr.brand, 'description', npr.description, 'supplier', npr.supplier)
               WHEN r.type = 'repurchase' THEN
                 JSON_OBJECT('item_id', rr.item_id, 'name', i.name, 'recommended_quantity', rr.recommended_quantity, 'reason', rr.reason)
             END as details
      FROM requests r
      LEFT JOIN new_product_requests npr ON r.id = npr.request_id
      LEFT JOIN repurchase_requests rr ON r.id = rr.request_id
      LEFT JOIN items i ON rr.item_id = i.id
      WHERE r.factory_agent_id = ?
        AND (? IS NULL OR r.type = ?)
        AND (? IS NULL OR r.status = ?)
    `;
            const rows = yield (0, db_1.query)(sql, [
                userId,
                type || null,
                type,
                status || null,
                status,
            ]);
            return rows;
        });
    }
}
exports.default = new FactoryAgentService();
