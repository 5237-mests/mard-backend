import { query, transaction } from "../config/db";
import { TransferRequest, ITransferItem, TransferRequestWithRelations } from "../types/database";

export class TransferService {
  async listTransferRequests(filter: any = {}) {
    const sql = `
      SELECT 
        tr.*,
        req.name as requested_by_name, req.email as requested_by_email,
        app.name as approved_by_name, app.email as approved_by_email
      FROM transfer_requests tr
      JOIN users req ON tr.requestedById = req.id
      LEFT JOIN users app ON tr.approvedById = app.id
      ORDER BY tr.id DESC
    `;
    
    const transfersData = await query(sql);
    return transfersData.map((transfer: any) => ({
      ...transfer,
      requestedBy: {
        id: transfer.requestedById,
        name: transfer.requested_by_name,
        email: transfer.requested_by_email
      },
      approvedBy: transfer.approvedById ? {
        id: transfer.approvedById,
        name: transfer.approved_by_name,
        email: transfer.approved_by_email
      } : null,
      items: JSON.parse(transfer.items)
    })) as TransferRequestWithRelations[];
  }

  async adminTransfer(
    fromId: number,
    toId: number,
    items: ITransferItem[],
    adminId: number
  ) {
    return await transaction(async (connection) => {
      // Get admin user
      const adminSql = "SELECT * FROM users WHERE id = ?";
      const [admins] = await connection.execute(adminSql, [adminId]);
      const admin = (admins as any[])[0];
      if (!admin) throw new Error("Admin user not found");

      // Create and immediately approve the transfer
      const createTransferSql = `
        INSERT INTO transfer_requests (\`from\`, \`to\`, items, status, requestedById, approvedById)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [transferResult] = await connection.execute(createTransferSql, [
        fromId,
        toId,
        JSON.stringify(items),
        "APPROVED",
        admin.id,
        admin.id
      ]);

      // Update stock: decrement from sender, increment to receiver
      for (const item of items) {
        // Check if it's a shop item first
        const fromShopItemSql = `
          SELECT * FROM shop_items 
          WHERE shopId = ? AND itemId = ?
        `;
        const [fromShopItems] = await connection.execute(fromShopItemSql, [fromId, item.itemId]);
        const fromShopItem = (fromShopItems as any[])[0];

        if (fromShopItem) {
          // Update shop item quantity
          const updateShopSql = `
            UPDATE shop_items 
            SET quantity = quantity - ? 
            WHERE id = ?
          `;
          await connection.execute(updateShopSql, [item.quantity, fromShopItem.id]);
        } else {
          // Check store item
          const fromStoreItemSql = `
            SELECT * FROM store_items 
            WHERE storeId = ? AND itemId = ?
          `;
          const [fromStoreItems] = await connection.execute(fromStoreItemSql, [fromId, item.itemId]);
          const fromStoreItem = (fromStoreItems as any[])[0];
          
          if (fromStoreItem) {
            const updateStoreSql = `
              UPDATE store_items 
              SET quantity = quantity - ? 
              WHERE id = ?
            `;
            await connection.execute(updateStoreSql, [item.quantity, fromStoreItem.id]);
          }
        }

        // Add to receiver
        const toShopItemSql = `
          SELECT * FROM shop_items 
          WHERE shopId = ? AND itemId = ?
        `;
        const [toShopItems] = await connection.execute(toShopItemSql, [toId, item.itemId]);
        const toShopItem = (toShopItems as any[])[0];

        if (toShopItem) {
          const updateToShopSql = `
            UPDATE shop_items 
            SET quantity = quantity + ? 
            WHERE id = ?
          `;
          await connection.execute(updateToShopSql, [item.quantity, toShopItem.id]);
        } else {
          const toStoreItemSql = `
            SELECT * FROM store_items 
            WHERE storeId = ? AND itemId = ?
          `;
          const [toStoreItems] = await connection.execute(toStoreItemSql, [toId, item.itemId]);
          const toStoreItem = (toStoreItems as any[])[0];
          
          if (toStoreItem) {
            const updateToStoreSql = `
              UPDATE store_items 
              SET quantity = quantity + ? 
              WHERE id = ?
            `;
            await connection.execute(updateToStoreSql, [item.quantity, toStoreItem.id]);
          }
        }
      }

      // Fetch the created transfer
      const getTransferSql = "SELECT * FROM transfer_requests WHERE id = ?";
      const [transfers] = await connection.execute(getTransferSql, [(transferResult as any).insertId]);
      const transfer = (transfers as any[])[0];
      
      return {
        ...transfer,
        items: JSON.parse(transfer.items)
      } as TransferRequest;
    });
  }

  async createTransferRequest(fromId: number, toId: number, items: ITransferItem[], requesterId: number) {
    const requesterSql = "SELECT * FROM users WHERE id = ?";
    const users = await query(requesterSql, [requesterId]);
    const requester = users[0];
    
    if (!requester) throw new Error("Requester user not found");

    const createSql = `
      INSERT INTO transfer_requests (\`from\`, \`to\`, items, status, requestedById)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result: any = await query(createSql, [
      fromId,
      toId,
      JSON.stringify(items),
      "PENDING",
      requester.id
    ]);

    // Fetch the created transfer
    const getTransferSql = "SELECT * FROM transfer_requests WHERE id = ?";
    const transfers = await query(getTransferSql, [result.insertId]);
    const transfer = transfers[0];
    
    return {
      ...transfer,
      items: JSON.parse(transfer.items)
    } as TransferRequest;
  }

  async approveTransferRequest(requestId: number, approverId: number) {
    return await transaction(async (connection) => {
      const transferSql = `
        SELECT 
          tr.*,
          req.name as requested_by_name, req.email as requested_by_email,
          app.name as approved_by_name, app.email as approved_by_email
        FROM transfer_requests tr
        JOIN users req ON tr.requestedById = req.id
        LEFT JOIN users app ON tr.approvedById = app.id
        WHERE tr.id = ?
      `;
      const [transfers] = await connection.execute(transferSql, [requestId]);
      const transferData = (transfers as any[])[0];
      
      if (!transferData) throw new Error("Transfer request not found");
      if (transferData.status !== "PENDING") throw new Error("Transfer request is not pending");

      const approverSql = "SELECT * FROM users WHERE id = ?";
      const [approvers] = await connection.execute(approverSql, [approverId]);
      const approver = (approvers as any[])[0];
      if (!approver) throw new Error("Approver user not found");

      // Update stock: decrement from sender, increment to receiver
      const transferItems = JSON.parse(transferData.items) as ITransferItem[];
      for (const item of transferItems) {
        // Decrement from sender
        const fromShopItemSql = `
          SELECT * FROM shop_items 
          WHERE shopId = ? AND itemId = ?
        `;
        const [fromShopItems] = await connection.execute(fromShopItemSql, [transferData.from, item.itemId]);
        const fromShopItem = (fromShopItems as any[])[0];

        if (fromShopItem) {
          const updateShopSql = `
            UPDATE shop_items 
            SET quantity = quantity - ? 
            WHERE id = ?
          `;
          await connection.execute(updateShopSql, [item.quantity, fromShopItem.id]);
        } else {
          const fromStoreItemSql = `
            SELECT * FROM store_items 
            WHERE storeId = ? AND itemId = ?
          `;
          const [fromStoreItems] = await connection.execute(fromStoreItemSql, [transferData.from, item.itemId]);
          const fromStoreItem = (fromStoreItems as any[])[0];
          
          if (fromStoreItem) {
            const updateStoreSql = `
              UPDATE store_items 
              SET quantity = quantity - ? 
              WHERE id = ?
            `;
            await connection.execute(updateStoreSql, [item.quantity, fromStoreItem.id]);
          }
        }

        // Increment to receiver
        const toShopItemSql = `
          SELECT * FROM shop_items 
          WHERE shopId = ? AND itemId = ?
        `;
        const [toShopItems] = await connection.execute(toShopItemSql, [transferData.to, item.itemId]);
        const toShopItem = (toShopItems as any[])[0];

        if (toShopItem) {
          const updateToShopSql = `
            UPDATE shop_items 
            SET quantity = quantity + ? 
            WHERE id = ?
          `;
          await connection.execute(updateToShopSql, [item.quantity, toShopItem.id]);
        } else {
          const toStoreItemSql = `
            SELECT * FROM store_items 
            WHERE storeId = ? AND itemId = ?
          `;
          const [toStoreItems] = await connection.execute(toStoreItemSql, [transferData.to, item.itemId]);
          const toStoreItem = (toStoreItems as any[])[0];
          
          if (toStoreItem) {
            const updateToStoreSql = `
              UPDATE store_items 
              SET quantity = quantity + ? 
              WHERE id = ?
            `;
            await connection.execute(updateToStoreSql, [item.quantity, toStoreItem.id]);
          }
        }
      }

      // Mark transfer as approved
      const updateTransferSql = `
        UPDATE transfer_requests 
        SET status = ?, approvedById = ? 
        WHERE id = ?
      `;
      await connection.execute(updateTransferSql, ["APPROVED", approver.id, requestId]);

      // Fetch the updated transfer with relations
      const [updatedTransfers] = await connection.execute(transferSql, [requestId]);
      const updatedTransferData = (updatedTransfers as any[])[0];

      return {
        ...updatedTransferData,
        requestedBy: {
          id: updatedTransferData.requestedById,
          name: updatedTransferData.requested_by_name,
          email: updatedTransferData.requested_by_email
        },
        approvedBy: {
          id: updatedTransferData.approvedById,
          name: updatedTransferData.approved_by_name,
          email: updatedTransferData.approved_by_email
        },
        items: JSON.parse(updatedTransferData.items)
      } as TransferRequestWithRelations;
    });
  }

  async rejectTransferRequest(requestId: number, rejectorId: number) {
    return await transaction(async (connection) => {
      const transferSql = `
        SELECT 
          tr.*,
          req.name as requested_by_name, req.email as requested_by_email,
          app.name as approved_by_name, app.email as approved_by_email
        FROM transfer_requests tr
        JOIN users req ON tr.requestedById = req.id
        LEFT JOIN users app ON tr.approvedById = app.id
        WHERE tr.id = ?
      `;
      const [transfers] = await connection.execute(transferSql, [requestId]);
      const transferData = (transfers as any[])[0];
      
      if (!transferData) throw new Error("Transfer request not found");
      if (transferData.status !== "PENDING") throw new Error("Transfer request is not pending");

      const rejectorSql = "SELECT * FROM users WHERE id = ?";
      const [rejectors] = await connection.execute(rejectorSql, [rejectorId]);
      const rejector = (rejectors as any[])[0];
      if (!rejector) throw new Error("Rejector user not found");

      const updateTransferSql = `
        UPDATE transfer_requests 
        SET status = ?, approvedById = ? 
        WHERE id = ?
      `;
      await connection.execute(updateTransferSql, ["REJECTED", rejector.id, requestId]);

      // Fetch the updated transfer with relations
      const [updatedTransfers] = await connection.execute(transferSql, [requestId]);
      const updatedTransferData = (updatedTransfers as any[])[0];

      return {
        ...updatedTransferData,
        requestedBy: {
          id: updatedTransferData.requestedById,
          name: updatedTransferData.requested_by_name,
          email: updatedTransferData.requested_by_email
        },
        approvedBy: {
          id: updatedTransferData.approvedById,
          name: updatedTransferData.approved_by_name,
          email: updatedTransferData.approved_by_email
        },
        items: JSON.parse(updatedTransferData.items)
      } as TransferRequestWithRelations;
    });
  }
}
