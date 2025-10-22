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
    createTransfer(_a) {
        return __awaiter(this, arguments, void 0, function* ({ fromType, fromId, toType, toId, items, }) {
            return yield (0, db_1.transaction)((connection) => __awaiter(this, void 0, void 0, function* () {
                const [insertResult] = yield connection.execute(`INSERT INTO item_transfers (from_type, from_id, to_type, to_id)
         VALUES (?, ?, ?, ?)`, [fromType, fromId, toType, toId]);
                const transferId = insertResult.insertId;
                for (const item of items) {
                    yield connection.execute(`INSERT INTO transfer_items (transfer_id, product_id, quantity)
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
      FROM item_transfers t
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
      FROM item_transfers t
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
