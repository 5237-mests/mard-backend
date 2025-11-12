import { query, transaction } from "../config/db";
import { itemTransferService } from "./itemTransferService";

export interface RequestItemInput {
  item_id: number;
  quantity: number;
  note?: string;
}
export interface CreateRequestInput {
  shop_id: number;
  store_id: number;
  items: RequestItemInput[];
  created_by: number;
}

export const itemRequestService = {
  async createRequest({
    shop_id,
    store_id,
    items,
    created_by,
  }: CreateRequestInput) {
    if (!Array.isArray(items) || items.length === 0)
      throw new Error("Items required");
    return await transaction(async (conn) => {
      const reference = `REQ-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
      const [res]: any = await conn.execute(
        `INSERT INTO item_requests (reference, shop_id, store_id, created_by_id, status) VALUES (?, ?, ?, ?, ?)`,
        [reference, shop_id, store_id, created_by, "pending"]
      );
      const requestId = res.insertId;
      const vals: string[] = [];
      const params: any[] = [];
      for (const it of items) {
        vals.push("(?, ?, ?, ?)");
        params.push(requestId, it.item_id, it.quantity, it.note || null);
      }
      await conn.execute(
        `INSERT INTO item_request_items (request_id, item_id, quantity, note) VALUES ${vals.join(
          ","
        )}`,
        params
      );
      return { id: requestId, reference };
    });
  },

  async getRequests(opts?: {
    status?: string;
    shop_id?: number;
    store_id?: number;
    page?: number;
    pageSize?: number;
    search?: string;
  }) {
    const where: string[] = [];
    const params: any[] = [];
    if (opts?.status) {
      where.push("r.status = ?");
      params.push(opts.status);
    }
    if (opts?.shop_id) {
      where.push("r.shop_id = ?");
      params.push(opts.shop_id);
    }
    if (opts?.store_id) {
      where.push("r.store_id = ?");
      params.push(opts.store_id);
    }
    if (opts?.search) {
      where.push("(r.reference LIKE ? OR s.name LIKE ?)");
      params.push(`%${opts.search}%`, `%${opts.search}%`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const page = opts?.page && opts.page > 0 ? opts.page : 1;
    const pageSize = opts?.pageSize && opts.pageSize > 0 ? opts.pageSize : 25;
    const offset = (page - 1) * pageSize;

    const rows: any = await query(
      `SELECT r.*, s.name AS shop_name, st.name AS store_name, u.name AS created_by, a.name AS approved_by
       FROM item_requests r
       LEFT JOIN shops s ON r.shop_id = s.id
       LEFT JOIN stores st ON r.store_id = st.id
       LEFT JOIN users u ON r.created_by_id = u.id
       LEFT JOIN users a ON r.approved_by_id = a.id
       ${whereSql}
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      params.concat([pageSize, offset])
    );
    // fetch items for these .
    const ids = (rows as any[]).map((r) => r.id);
    let itemsMap: Record<number, any[]> = {};
    if (ids.length) {
      const ritems: any = await query(
        `SELECT iri.request_id, iri.item_id, iri.quantity, iri.note, i.name, i.code, i.model
         FROM item_request_items iri
         JOIN items i ON iri.item_id = i.id
         WHERE iri.request_id IN (${ids.map(() => "?").join(",")})
         ORDER BY iri.id ASC`,
        ids
      );

      for (const it of ritems) {
        itemsMap[it.request_id] ??= [];
        itemsMap[it.request_id].push(it);
      }
    }
    return {
      data: (rows as any[]).map((r) => ({
        ...r,
        request_items: itemsMap[r.id] ?? [],
      })),
      page,
      pageSize,
      total: rows.length < pageSize ? offset + rows.length : undefined,
    };
  },

  async getRequestById(id: number) {
    const [rows]: any = await query(
      `SELECT r.*, s.name AS shop_name, st.name AS store_name, u.name AS created_by, a.name AS approved_by
       FROM item_requests r
       LEFT JOIN shops s ON r.shop_id = s.id
       LEFT JOIN stores st ON r.store_id = st.id
       LEFT JOIN users u ON r.created_by_id = u.id
       LEFT JOIN users a ON r.approved_by_id = a.id
       WHERE r.id = ?`,
      [id]
    );
    if (!rows || rows.length === 0) throw new Error("Request not found");
    const request = rows;
    const items = await query(
      `SELECT iri.item_id, iri.quantity, iri.note, i.name, i.code, i.model
       FROM item_request_items iri JOIN items i ON iri.item_id = i.id
       WHERE iri.request_id = ? ORDER BY iri.id ASC`,
      [id]
    );
    return { ...request, request_items: items };
  },

  // approve: create transfer using itemTransferService and update request
  async approveRequest(requestId: number, approverId: number) {
    return await transaction(async (conn) => {
      // load request + items
      const [rrows]: any = await conn.execute(
        `SELECT * FROM item_requests WHERE id = ? FOR UPDATE`,
        [requestId]
      );
      if (!rrows || rrows.length === 0) throw new Error("Request not found");
      const r = rrows[0];
      if (r.status !== "pending")
        throw new Error("Only pending requests can be approved");

      const items: any[] = (
        await conn.execute(
          `SELECT item_id, quantity FROM item_request_items WHERE request_id = ?`,
          [requestId]
        )
      )[0] as any[];

      if (!items || items.length === 0) throw new Error("Request has no items");

      // call transfer service to move items from shop -> store
      const transferId = await itemTransferService.createTransfer({
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
      await conn.execute(
        `UPDATE item_requests SET status = ?, approved_by_id = ?, transfer_id = ? WHERE id = ?`,
        ["approved", approverId, transferId, requestId]
      );

      return { transferId };
    });
  },

  // Edit request items (only pending)
  async updateRequest(
    requestId: number,
    updaterId: number,
    patch: { items?: RequestItemInput[]; status?: string }
  ) {
    return await transaction(async (conn) => {
      // 1. Verify the request exists
      const [rrows]: any = await conn.execute(
        `SELECT * FROM item_requests WHERE id = ?`,
        [requestId]
      );
      if (!rrows || rrows.length === 0) throw new Error("Request not found");
      const r = rrows[0];
      // 2. Only allow edits on pending requests
      if (r.status !== "pending")
        throw new Error("Only pending requests can be edited");
      // 3. Update individual item fields if provided
      if (patch.items && patch.items.length > 0) {
        for (const it of patch.items) {
          const updates: string[] = [];
          const params: any[] = [];

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
            await conn.execute(
              `UPDATE item_request_items 
             SET ${updates.join(", ")} 
             WHERE request_id = ? AND item_id = ?`,
              params
            );
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
    });
  },

  // remove item from item request
  async removeRequestItem(requestId: number, itemId: number) {
    return await transaction(async (conn) => {
      const [rrows]: any = await conn.execute(
        `SELECT * FROM item_requests WHERE id = ? FOR UPDATE`,
        [requestId]
      );
      if (!rrows || rrows.length === 0) throw new Error("Request not found");
      const r = rrows[0];
      if (r.status !== "pending")
        throw new Error("Only pending requests can be edited");
      await conn.execute(
        `DELETE FROM item_request_items WHERE request_id = ? AND item_id = ?`,
        [requestId, itemId]
      );
      return true;
    });
  },

  // Reject request
  async rejectRequest(requestId: number, approverId: number) {
    return await transaction(async (conn) => {
      const [rrows]: any = await conn.execute(
        `SELECT * FROM item_requests WHERE id = ? FOR UPDATE`,
        [requestId]
      );
      if (!rrows || rrows.length === 0) throw new Error("Request not found");
      const r = rrows[0];
      if (r.status !== "pending")
        throw new Error("Only pending requests can be rejected");
      await conn.execute(
        `UPDATE item_requests SET status = ?, approved_by_id = ? WHERE id = ?`,
        ["rejected", approverId, requestId]
      );
      return true;
    });
  },
};
