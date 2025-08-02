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
exports.TransferService = void 0;
const db_1 = require("../config/db");
class TransferService {
    listTransferRequests() {
        return __awaiter(this, arguments, void 0, function* (filter = {}) {
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
            const transfersData = yield (0, db_1.query)(sql);
            return transfersData.map((transfer) => (Object.assign(Object.assign({}, transfer), { requestedBy: {
                    id: transfer.requestedById,
                    name: transfer.requested_by_name,
                    email: transfer.requested_by_email
                }, approvedBy: transfer.approvedById ? {
                    id: transfer.approvedById,
                    name: transfer.approved_by_name,
                    email: transfer.approved_by_email
                } : null, items: JSON.parse(transfer.items) })));
        });
    }
    adminTransfer(fromId, toId, items, adminId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, db_1.transaction)((connection) => __awaiter(this, void 0, void 0, function* () {
                // Get admin user
                const adminSql = "SELECT * FROM users WHERE id = ?";
                const [admins] = yield connection.execute(adminSql, [adminId]);
                const admin = admins[0];
                if (!admin)
                    throw new Error("Admin user not found");
                // Create and immediately approve the transfer
                const createTransferSql = `
        INSERT INTO transfer_requests (\`from\`, \`to\`, items, status, requestedById, approvedById)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
                const [transferResult] = yield connection.execute(createTransferSql, [
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
                    const [fromShopItems] = yield connection.execute(fromShopItemSql, [fromId, item.itemId]);
                    const fromShopItem = fromShopItems[0];
                    if (fromShopItem) {
                        // Update shop item quantity
                        const updateShopSql = `
            UPDATE shop_items 
            SET quantity = quantity - ? 
            WHERE id = ?
          `;
                        yield connection.execute(updateShopSql, [item.quantity, fromShopItem.id]);
                    }
                    else {
                        // Check store item
                        const fromStoreItemSql = `
            SELECT * FROM store_items 
            WHERE storeId = ? AND itemId = ?
          `;
                        const [fromStoreItems] = yield connection.execute(fromStoreItemSql, [fromId, item.itemId]);
                        const fromStoreItem = fromStoreItems[0];
                        if (fromStoreItem) {
                            const updateStoreSql = `
              UPDATE store_items 
              SET quantity = quantity - ? 
              WHERE id = ?
            `;
                            yield connection.execute(updateStoreSql, [item.quantity, fromStoreItem.id]);
                        }
                    }
                    // Add to receiver
                    const toShopItemSql = `
          SELECT * FROM shop_items 
          WHERE shopId = ? AND itemId = ?
        `;
                    const [toShopItems] = yield connection.execute(toShopItemSql, [toId, item.itemId]);
                    const toShopItem = toShopItems[0];
                    if (toShopItem) {
                        const updateToShopSql = `
            UPDATE shop_items 
            SET quantity = quantity + ? 
            WHERE id = ?
          `;
                        yield connection.execute(updateToShopSql, [item.quantity, toShopItem.id]);
                    }
                    else {
                        const toStoreItemSql = `
            SELECT * FROM store_items 
            WHERE storeId = ? AND itemId = ?
          `;
                        const [toStoreItems] = yield connection.execute(toStoreItemSql, [toId, item.itemId]);
                        const toStoreItem = toStoreItems[0];
                        if (toStoreItem) {
                            const updateToStoreSql = `
              UPDATE store_items 
              SET quantity = quantity + ? 
              WHERE id = ?
            `;
                            yield connection.execute(updateToStoreSql, [item.quantity, toStoreItem.id]);
                        }
                    }
                }
                // Fetch the created transfer
                const getTransferSql = "SELECT * FROM transfer_requests WHERE id = ?";
                const [transfers] = yield connection.execute(getTransferSql, [transferResult.insertId]);
                const transfer = transfers[0];
                return Object.assign(Object.assign({}, transfer), { items: JSON.parse(transfer.items) });
            }));
        });
    }
    createTransferRequest(fromId, toId, items, requesterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const requesterSql = "SELECT * FROM users WHERE id = ?";
            const users = yield (0, db_1.query)(requesterSql, [requesterId]);
            const requester = users[0];
            if (!requester)
                throw new Error("Requester user not found");
            const createSql = `
      INSERT INTO transfer_requests (\`from\`, \`to\`, items, status, requestedById)
      VALUES (?, ?, ?, ?, ?)
    `;
            const result = yield (0, db_1.query)(createSql, [
                fromId,
                toId,
                JSON.stringify(items),
                "PENDING",
                requester.id
            ]);
            // Fetch the created transfer
            const getTransferSql = "SELECT * FROM transfer_requests WHERE id = ?";
            const transfers = yield (0, db_1.query)(getTransferSql, [result.insertId]);
            const transfer = transfers[0];
            return Object.assign(Object.assign({}, transfer), { items: JSON.parse(transfer.items) });
        });
    }
    approveTransferRequest(requestId, approverId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, db_1.transaction)((connection) => __awaiter(this, void 0, void 0, function* () {
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
                const [transfers] = yield connection.execute(transferSql, [requestId]);
                const transferData = transfers[0];
                if (!transferData)
                    throw new Error("Transfer request not found");
                if (transferData.status !== "PENDING")
                    throw new Error("Transfer request is not pending");
                const approverSql = "SELECT * FROM users WHERE id = ?";
                const [approvers] = yield connection.execute(approverSql, [approverId]);
                const approver = approvers[0];
                if (!approver)
                    throw new Error("Approver user not found");
                // Update stock: decrement from sender, increment to receiver
                const transferItems = JSON.parse(transferData.items);
                for (const item of transferItems) {
                    // Decrement from sender
                    const fromShopItemSql = `
          SELECT * FROM shop_items 
          WHERE shopId = ? AND itemId = ?
        `;
                    const [fromShopItems] = yield connection.execute(fromShopItemSql, [transferData.from, item.itemId]);
                    const fromShopItem = fromShopItems[0];
                    if (fromShopItem) {
                        const updateShopSql = `
            UPDATE shop_items 
            SET quantity = quantity - ? 
            WHERE id = ?
          `;
                        yield connection.execute(updateShopSql, [item.quantity, fromShopItem.id]);
                    }
                    else {
                        const fromStoreItemSql = `
            SELECT * FROM store_items 
            WHERE storeId = ? AND itemId = ?
          `;
                        const [fromStoreItems] = yield connection.execute(fromStoreItemSql, [transferData.from, item.itemId]);
                        const fromStoreItem = fromStoreItems[0];
                        if (fromStoreItem) {
                            const updateStoreSql = `
              UPDATE store_items 
              SET quantity = quantity - ? 
              WHERE id = ?
            `;
                            yield connection.execute(updateStoreSql, [item.quantity, fromStoreItem.id]);
                        }
                    }
                    // Increment to receiver
                    const toShopItemSql = `
          SELECT * FROM shop_items 
          WHERE shopId = ? AND itemId = ?
        `;
                    const [toShopItems] = yield connection.execute(toShopItemSql, [transferData.to, item.itemId]);
                    const toShopItem = toShopItems[0];
                    if (toShopItem) {
                        const updateToShopSql = `
            UPDATE shop_items 
            SET quantity = quantity + ? 
            WHERE id = ?
          `;
                        yield connection.execute(updateToShopSql, [item.quantity, toShopItem.id]);
                    }
                    else {
                        const toStoreItemSql = `
            SELECT * FROM store_items 
            WHERE storeId = ? AND itemId = ?
          `;
                        const [toStoreItems] = yield connection.execute(toStoreItemSql, [transferData.to, item.itemId]);
                        const toStoreItem = toStoreItems[0];
                        if (toStoreItem) {
                            const updateToStoreSql = `
              UPDATE store_items 
              SET quantity = quantity + ? 
              WHERE id = ?
            `;
                            yield connection.execute(updateToStoreSql, [item.quantity, toStoreItem.id]);
                        }
                    }
                }
                // Mark transfer as approved
                const updateTransferSql = `
        UPDATE transfer_requests 
        SET status = ?, approvedById = ? 
        WHERE id = ?
      `;
                yield connection.execute(updateTransferSql, ["APPROVED", approver.id, requestId]);
                // Fetch the updated transfer with relations
                const [updatedTransfers] = yield connection.execute(transferSql, [requestId]);
                const updatedTransferData = updatedTransfers[0];
                return Object.assign(Object.assign({}, updatedTransferData), { requestedBy: {
                        id: updatedTransferData.requestedById,
                        name: updatedTransferData.requested_by_name,
                        email: updatedTransferData.requested_by_email
                    }, approvedBy: {
                        id: updatedTransferData.approvedById,
                        name: updatedTransferData.approved_by_name,
                        email: updatedTransferData.approved_by_email
                    }, items: JSON.parse(updatedTransferData.items) });
            }));
        });
    }
    rejectTransferRequest(requestId, rejectorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, db_1.transaction)((connection) => __awaiter(this, void 0, void 0, function* () {
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
                const [transfers] = yield connection.execute(transferSql, [requestId]);
                const transferData = transfers[0];
                if (!transferData)
                    throw new Error("Transfer request not found");
                if (transferData.status !== "PENDING")
                    throw new Error("Transfer request is not pending");
                const rejectorSql = "SELECT * FROM users WHERE id = ?";
                const [rejectors] = yield connection.execute(rejectorSql, [rejectorId]);
                const rejector = rejectors[0];
                if (!rejector)
                    throw new Error("Rejector user not found");
                const updateTransferSql = `
        UPDATE transfer_requests 
        SET status = ?, approvedById = ? 
        WHERE id = ?
      `;
                yield connection.execute(updateTransferSql, ["REJECTED", rejector.id, requestId]);
                // Fetch the updated transfer with relations
                const [updatedTransfers] = yield connection.execute(transferSql, [requestId]);
                const updatedTransferData = updatedTransfers[0];
                return Object.assign(Object.assign({}, updatedTransferData), { requestedBy: {
                        id: updatedTransferData.requestedById,
                        name: updatedTransferData.requested_by_name,
                        email: updatedTransferData.requested_by_email
                    }, approvedBy: {
                        id: updatedTransferData.approvedById,
                        name: updatedTransferData.approved_by_name,
                        email: updatedTransferData.approved_by_email
                    }, items: JSON.parse(updatedTransferData.items) });
            }));
        });
    }
}
exports.TransferService = TransferService;
