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
exports.getLiveBalancePivot = void 0;
const db_1 = require("../config/db");
const getLiveBalancePivot = (search) => __awaiter(void 0, void 0, void 0, function* () {
    const searchQuery = search ? `%${search}%` : null;
    // 1. Get all shops and stores
    const shops = yield (0, db_1.query)(`SELECT id, name FROM shops ORDER BY id ASC`);
    const stores = yield (0, db_1.query)(`SELECT id, name FROM stores ORDER BY id ASC`);
    // 2. Build dynamic SQL for pivot
    const shopColumns = shops
        .map((shop) => `SUM(CASE WHEN ish.shop_id = ${shop.id} THEN ish.quantity ELSE 0 END) AS \`${shop.name}(shop)\``)
        .join(", ");
    const storeColumns = stores
        .map((store) => `SUM(CASE WHEN isr.store_id = ${store.id} THEN isr.quantity ELSE 0 END) AS \`${store.name}(store)\``)
        .join(", ");
    const totalExpr = [
        ...shops.map((s) => `SUM(CASE WHEN ish.shop_id = ${s.id} THEN ish.quantity ELSE 0 END)`),
        ...stores.map((s) => `SUM(CASE WHEN isr.store_id = ${s.id} THEN isr.quantity ELSE 0 END)`),
    ].join(" + ");
    // 3. Main SQL query
    const sql = `
    SELECT 
      i.id AS item_id,
      i.name,
      i.code,
      i.model,
      i.price,
      ${shopColumns},
      ${storeColumns},
      (${totalExpr}) AS total_quantity
    FROM items i
    LEFT JOIN shop_items ish ON ish.item_id = i.id
    LEFT JOIN store_items isr ON isr.item_id = i.id
    WHERE ? IS NULL OR i.name LIKE ? OR i.code LIKE ? OR i.model LIKE ?
    GROUP BY i.id, i.name, i.code, i.model, i.price
    ORDER BY i.name ASC
  `;
    // 4. Execute query
    const items = yield (0, db_1.query)(sql, [
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
    ]);
    return { shops, stores, data: items };
});
exports.getLiveBalancePivot = getLiveBalancePivot;
// // Get live balance pivot-style
// export const getLiveBalancePivot = async () => {
//   // 1. Get all shops and stores
//   const shops: any = await query(`SELECT id, name FROM shops ORDER BY id ASC`);
//   const stores: any = await query(
//     `SELECT id, name FROM stores ORDER BY id ASC`
//   );
//   // 2. Get all items
//   const items: any = await query(
//     `SELECT id AS item_id, name, code, model, price FROM items ORDER BY name ASC`
//   );
//   // 3. Get all stock per item per shop
//   const itemShops: any = await query(
//     `SELECT item_id, shop_id, quantity FROM shop_items`
//   );
//   const itemStores: any = await query(
//     `SELECT item_id, store_id, quantity FROM store_items`
//   );
//   // 4. Map stock to pivot format
//   const data = items.map((item: any) => {
//     const row: any = {
//       item_id: item.item_id,
//       name: item.name,
//       code: item.code,
//       model: item.model,
//       price: item.price,
//     };
//     // Add shop quantities dynamically
//     shops.forEach((shop: any) => {
//       const stock = itemShops.find(
//         (s: any) => s.item_id === item.item_id && s.shop_id === shop.id
//       );
//       row[`${shop.name}`] = stock ? stock.quantity : 0;
//     });
//     // Add store quantities dynamically
//     stores.forEach((store: any) => {
//       const stock = itemStores.find(
//         (s: any) => s.item_id === item.item_id && s.store_id === store.id
//       );
//       row[`${store.name}`] = stock ? stock.quantity : 0;
//     });
//     // Add total quantity
//     row.total_quantity = Object.values(row)
//       .filter((v) => typeof v === "number")
//       .reduce((sum, val) => sum + val, 0);
//     return row;
//   });
//   return { shops, stores, data };
// };
