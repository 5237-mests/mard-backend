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
exports.deleteFixedAssetService = exports.updateFixedAssetService = exports.getFixedAssetsService = exports.createFixedAssetService = void 0;
const db_1 = require("../config/db");
/* ================= CREATE ================= */
const createFixedAssetService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    let { asset_code, asset_name, location_id, location_type, status, cost } = data;
    if (!asset_name || !location_id || !location_type) {
        throw new Error("Missing required fields");
    }
    if (!["shop", "store"].includes(location_type)) {
        throw new Error("Invalid location type");
    }
    const table = location_type === "shop" ? "shops" : "stores";
    const location = yield (0, db_1.query)(`SELECT id FROM ${table} WHERE id = ? LIMIT 1`, [
        location_id,
    ]);
    if (!location || location.length === 0) {
        throw new Error("Invalid location");
    }
    const result = yield (0, db_1.query)(`INSERT INTO fixed_assets
    (asset_code, asset_name, location_id, location_type, status, cost)
    VALUES (?, ?, ?, ?, ?, ?)`, [
        asset_code || null,
        asset_name,
        location_id,
        location_type,
        status || "new",
        cost,
    ]);
    const insertedId = result.insertId;
    if (!asset_code) {
        asset_code = `MARD-${insertedId.toString().padStart(4, "0")}`;
        yield (0, db_1.query)(`UPDATE fixed_assets SET asset_code = ? WHERE id = ?`, [
            asset_code,
            insertedId,
        ]);
    }
    return { asset_code };
});
exports.createFixedAssetService = createFixedAssetService;
/* ================= GET FIXED ASSETS WITH FILTERS ================= */
const getFixedAssetsService = (search, locationType, // 'shop' or 'store'
locationId) => __awaiter(void 0, void 0, void 0, function* () {
    const searchQuery = search ? `%${search}%` : null;
    let sql = `
    SELECT
      fa.id,
      fa.asset_code,
      fa.asset_name,
      fa.location_id,
      fa.location_type,
      fa.status,
      fa.cost,
      fa.created_at,
      fa.updated_at,

      CASE 
        WHEN fa.location_type = 'shop' THEN sh.name
        WHEN fa.location_type = 'store' THEN st.name
      END AS location_name,

      -- Extra fields for frontend clarity
      sh.name AS shop_name,
      st.name AS store_name

    FROM fixed_assets fa

    LEFT JOIN shops sh 
      ON fa.location_id = sh.id AND fa.location_type = 'shop'

    LEFT JOIN stores st 
      ON fa.location_id = st.id AND fa.location_type = 'store'
  `;
    const params = [];
    // Build WHERE conditions dynamically
    const whereConditions = [];
    if (searchQuery) {
        whereConditions.push(`(
      fa.asset_name LIKE ? 
      OR fa.asset_code LIKE ?
    )`);
        params.push(searchQuery, searchQuery);
    }
    if (locationType && locationId !== undefined) {
        whereConditions.push(`fa.location_type = ? AND fa.location_id = ?`);
        params.push(locationType, locationId);
    }
    else if (locationType) {
        whereConditions.push(`fa.location_type = ?`);
        params.push(locationType);
    }
    // Add WHERE clause if any conditions exist
    if (whereConditions.length > 0) {
        sql += " WHERE " + whereConditions.join(" AND ");
    }
    sql += " ORDER BY fa.id DESC";
    const rows = yield (0, db_1.query)(sql, params);
    return rows.map((r) => (Object.assign(Object.assign({}, r), { id: Number(r.id), location_id: r.location_id ? Number(r.location_id) : null, cost: r.cost ? Number(r.cost) : null })));
});
exports.getFixedAssetsService = getFixedAssetsService;
/* ================= UPDATE ================= */
const updateFixedAssetService = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const { asset_name, location_id, location_type, status, cost } = data;
    const existing = yield (0, db_1.query)(`SELECT id FROM fixed_assets WHERE id = ?`, [
        id,
    ]);
    if (!existing || existing.length === 0) {
        throw new Error("Asset not found");
    }
    if (location_id && location_type) {
        const table = location_type === "shop" ? "shops" : "stores";
        const location = yield (0, db_1.query)(`SELECT id FROM ${table} WHERE id = ? LIMIT 1`, [location_id]);
        if (!location || location.length === 0) {
            throw new Error("Invalid location");
        }
    }
    yield (0, db_1.query)(`UPDATE fixed_assets
     SET asset_name = COALESCE(?, asset_name),
         location_id = COALESCE(?, location_id),
         location_type = COALESCE(?, location_type),
         status = COALESCE(?, status), 
         cost = COALESCE(?, cost)
     WHERE id = ?`, [asset_name, location_id, location_type, status, cost, id]);
});
exports.updateFixedAssetService = updateFixedAssetService;
/* ================= DELETE ================= */
const deleteFixedAssetService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield (0, db_1.query)(`SELECT id FROM fixed_assets WHERE id = ?`, [
        id,
    ]);
    if (!existing || existing.length === 0) {
        throw new Error("Asset not found");
    }
    yield (0, db_1.query)(`DELETE FROM fixed_assets WHERE id = ?`, [id]);
});
exports.deleteFixedAssetService = deleteFixedAssetService;
