// services/factoryAgentService.ts
import { query, transaction } from "../config/db";
import {
  Item,
  ItemQuery,
  Request,
  NewProductRequest,
  RepurchaseRequest,
  RequestQuery,
} from "../types/database";

class FactoryAgentService {
  async getShopStock(shopId: string): Promise<Item[]> {
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
    const rows = await query(sql);
    return rows;
  }

  async createNewProductRequest(
    userId: number,
    input: NewProductRequest
  ): Promise<{ request_id: number; message: string }> {
    const { name, category, brand, description, supplier } = input;
    return transaction(async (connection) => {
      const [requestResult] = (await connection.query(
        'INSERT INTO requests (factory_agent_id, type, status) VALUES (?, "new_product", "pending")',
        [userId]
      )) as any;
      const requestId = requestResult.insertId;
      await connection.query(
        "INSERT INTO new_product_requests (request_id, name, category, brand, description, supplier) VALUES (?, ?, ?, ?, ?, ?)",
        [requestId, name, category, brand, description, supplier]
      );
      return { request_id: requestId, message: "Recommendation submitted" };
    });
  }

  async createRepurchaseRequest(
    userId: number,
    input: RepurchaseRequest
  ): Promise<{ request_id: number; message: string }> {
    const { item_id, recommended_quantity, reason } = input;
    return transaction(async (connection) => {
      const [requestResult] = (await connection.query(
        'INSERT INTO requests (factory_agent_id, type, status) VALUES (?, "repurchase", "pending")',
        [userId]
      )) as any;
      const requestId = requestResult.insertId;
      await connection.query(
        "INSERT INTO repurchase_requests (request_id, item_id, recommended_quantity, reason) VALUES (?, ?, ?, ?)",
        [requestId, item_id, recommended_quantity, reason]
      );
      return { request_id: requestId, message: "Repurchase requested" };
    });
  }

  async getRequests(
    userId: number,
    queryParams: RequestQuery
  ): Promise<Request[]> {
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
    const rows = await query<Request[]>(sql, [
      userId,
      type || null,
      type,
      status || null,
      status,
    ]);
    return rows;
  }
}

export default new FactoryAgentService();
