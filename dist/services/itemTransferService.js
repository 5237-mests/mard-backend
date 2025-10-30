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
exports.itemTransferService = void 0;
const db_1 = require("../config/db");
exports.itemTransferService = {
    // Transfer all items from shop back to store
    // remove everything in shop and add to store
    transferAllShopItemToStore(shopId, storeId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, db_1.transaction)((connection) => __awaiter(this, void 0, void 0, function* () {
                // validate shop
                const [shopRows] = yield connection.execute("SELECT 1 FROM shops WHERE id = ?", [shopId]);
                if (!shopRows || shopRows.length === 0) {
                    throw new Error("Shop not found");
                }
                // validate store
                const [storeRows] = yield connection.execute("SELECT 1 FROM stores WHERE id = ?", [storeId]);
                if (!storeRows || storeRows.length === 0) {
                    throw new Error("Store not found");
                }
                // get all items in the shop filter only if quantity > 0
                const [shopItems] = yield connection.execute(
                // "SELECT item_id, quantity FROM shop_items WHERE shop_id = ?",
                "SELECT item_id, quantity FROM shop_items WHERE shop_id = ? AND quantity > 0", [shopId]);
                if (!shopItems || shopItems.length === 0) {
                    // nothing to transfer; return 0 to indicate no transfer created
                    return 0;
                }
                // create transfer record
                const [insertResult] = yield connection.execute(`INSERT INTO transfers (from_type, from_shop_id, to_type, to_store_id, created_by_id)
         VALUES (?, ?, ?, ?, ?)`, ["shop", shopId, "store", storeId, userId]);
                const transferId = insertResult.insertId;
                // insert transfer_items rows
                for (const it of shopItems) {
                    yield connection.execute(`INSERT INTO transfer_items (transfer_id, item_id, quantity)
           VALUES (?, ?, ?)`, [transferId, it.item_id, it.quantity]);
                }
                // upsert into store_items (add quantities)
                const valuePlaceholders = shopItems.map(() => "(?, ?, ?)").join(", ");
                const upsertSql = `
        INSERT INTO store_items (store_id, item_id, quantity)
        VALUES ${valuePlaceholders}
        ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
      `;
                const upsertParams = [];
                for (const it of shopItems) {
                    upsertParams.push(storeId, it.item_id, it.quantity);
                }
                yield connection.execute(upsertSql, upsertParams);
                // remove all items from shop
                yield connection.execute("DELETE FROM shop_items WHERE shop_id = ?", [
                    shopId,
                ]);
                return transferId;
            }));
        });
    },
    // Create a new item transfer.
    createTransfer(_a) {
        return __awaiter(this, arguments, void 0, function* ({ fromType, fromId, toType, toId, items, }) {
            return yield (0, db_1.transaction)((connection) => __awaiter(this, void 0, void 0, function* () {
                const [insertResult] = yield connection.execute(`INSERT INTO transfers (from_type, from_id, to_type, to_id)
         VALUES (?, ?, ?, ?)`, [fromType, fromId, toType, toId]);
                const transferId = insertResult.insertId;
                for (const item of items) {
                    yield connection.execute(`INSERT INTO transfer_items (transfer_id, item_id, quantity)
           VALUES (?, ?, ?)`, [transferId, item.product_id, item.quantity]);
                }
                return transferId;
            }));
        });
    },
    getAllTransfers() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, db_1.query)(`
      SELECT
        t.id,
        t.reference,
        t.from_type,
        COALESCE(fs.name, fsh.name) AS from_name,
        t.to_type,
        COALESCE(ts.name, tsh.name) AS to_name,
        t.status,
        t.created_at
      FROM transfers t
      LEFT JOIN stores fs ON t.from_type = 'store' AND t.from_shop_id = fs.id
      LEFT JOIN shops fsh ON t.from_type = 'shop' AND t.from_store_id = fsh.id
      LEFT JOIN stores ts ON t.to_type = 'store' AND t.to_store_id = ts.id
      LEFT JOIN shops tsh ON t.to_type = 'shop' AND t.to_shop_id = tsh.id
      ORDER BY t.created_at DESC
      `);
        });
    },
    getTransferById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const transfers = yield (0, db_1.query)(`SELECT 
        t.*, 
        COALESCE(fs.name, fsh.name) AS from_name,
        COALESCE(ts.name, tsh.name) AS to_name
      FROM transfers t
      LEFT JOIN stores fs ON t.from_type = 'store' AND t.from_id = fs.id
      LEFT JOIN shops fsh ON t.from_type = 'shop' AND t.from_id = fsh.id
      LEFT JOIN stores ts ON t.to_type = 'store' AND t.to_id = ts.id
      LEFT JOIN shops tsh ON t.to_type = 'shop' AND t.to_id = tsh.id
      WHERE t.id = ?
      `, [id]);
            if (!transfers.length)
                throw new Error("Transfer not found");
            const items = yield (0, db_1.query)(`SELECT ti.*, p.name AS product_name
       FROM transfer_items ti
       JOIN products p ON ti.product_id = p.id
       WHERE ti.transfer_id = ?`, [id]);
            return Object.assign(Object.assign({}, transfers[0]), { items });
        });
    },
};
