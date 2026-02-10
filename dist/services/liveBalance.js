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
    /* ================= FETCH LOCATIONS ================= */
    const shops = yield (0, db_1.query)(`SELECT id, name FROM shops ORDER BY id`);
    const stores = yield (0, db_1.query)(`SELECT id, name FROM stores ORDER BY id`);
    /* ================= HANDLE EMPTY LOCATIONS ================= */
    const shopPivotCols = shops.length > 0
        ? shops
            .map((s) => `SUM(CASE WHEN shop_id = ${s.id} THEN quantity ELSE 0 END) AS shop_${s.id}`)
            .join(",")
        : "0 AS shop_dummy";
    const storePivotCols = stores.length > 0
        ? stores
            .map((s) => `SUM(CASE WHEN store_id = ${s.id} THEN quantity ELSE 0 END) AS store_${s.id}`)
            .join(",")
        : "0 AS store_dummy";
    /* ================= SHOP PIVOT ================= */
    const shopPivotSQL = `
    SELECT item_id, ${shopPivotCols}
    FROM shop_items
    GROUP BY item_id
  `;
    /* ================= STORE PIVOT ================= */
    const storePivotSQL = `
    SELECT item_id, ${storePivotCols}
    FROM store_items
    GROUP BY item_id
  `;
    /* ================= TOTAL EXPRESSION ================= */
    const totalExpr = [
        ...shops.map((s) => `COALESCE(sp.shop_${s.id},0)`),
        ...stores.map((s) => `COALESCE(st.store_${s.id},0)`),
    ].join(" + ") || "0";
    /* ================= MAIN QUERY ================= */
    const sql = `
    SELECT
      i.id AS item_id,
      TRIM(i.name) AS name,
      i.code,
      i.model,
      COALESCE(i.price,0) AS price,

      ${shops.length > 0
        ? shops
            .map((s) => `COALESCE(sp.shop_${s.id},0) AS shop_${s.id}`)
            .join(",")
        : ""}

      ${stores.length > 0
        ? "," +
            stores
                .map((s) => `COALESCE(st.store_${s.id},0) AS store_${s.id}`)
                .join(",")
        : ""},

      (${totalExpr}) AS total_quantity

    FROM items i
    LEFT JOIN (${shopPivotSQL}) sp ON sp.item_id = i.id
    LEFT JOIN (${storePivotSQL}) st ON st.item_id = i.id

    WHERE ? IS NULL 
      OR i.name LIKE ? 
      OR i.code LIKE ? 
      OR i.model LIKE ?

    ORDER BY i.name ASC
  `;
    /* ================= EXECUTE ================= */
    const rawItems = yield (0, db_1.query)(sql, [
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
    ]);
    /* ================= SAFE NUMERIC CONVERSION ================= */
    const items = rawItems.map((item) => {
        const converted = Object.assign(Object.assign({}, item), { price: Number(item.price), total_quantity: Number(item.total_quantity) });
        Object.keys(item).forEach((key) => {
            var _a;
            if (key.startsWith("shop_") || key.startsWith("store_")) {
                converted[key] = Number((_a = item[key]) !== null && _a !== void 0 ? _a : 0);
            }
        });
        return converted;
    });
    /* ================= BUILD LOCATIONS ================= */
    const locations = [
        ...shops.map((s) => ({
            id: s.id,
            name: s.name,
            type: "shop",
            key: `shop_${s.id}`,
        })),
        ...stores.map((s) => ({
            id: s.id,
            name: s.name,
            type: "store",
            key: `store_${s.id}`,
        })),
    ];
    /* ================= SUMMARY ================= */
    const total_distinct_items = items.length;
    const total_number_of_items = items.reduce((sum, i) => sum + i.total_quantity, 0);
    const total_asset_valuation = items.reduce((sum, i) => sum + i.total_quantity * i.price, 0);
    /* ================= RESPONSE ================= */
    return {
        total_distinct_items,
        total_number_of_items,
        total_asset_valuation,
        locations,
        data: items,
    };
});
exports.getLiveBalancePivot = getLiveBalancePivot;
