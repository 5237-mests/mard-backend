import { query } from "../config/db";

/* ================= CREATE ================= */

export const createFixedAssetService = async (data: any) => {
  let {
    asset_code,
    asset_name,
    location_id,
    location_type,
    status,
  } = data;

  if (!asset_name || !location_id || !location_type) {
    throw new Error("Missing required fields");
  }

  if (!["shop", "store"].includes(location_type)) {
    throw new Error("Invalid location type");
  }

  const table = location_type === "shop" ? "shops" : "stores";

  const location = await query(
    `SELECT id FROM ${table} WHERE id = ? LIMIT 1`,
    [location_id]
  );

  if (!location || location.length === 0) {
    throw new Error("Invalid location");
  }

  const result: any = await query(
    `INSERT INTO fixed_assets
    (asset_code, asset_name, location_id, location_type, status)
    VALUES (?, ?, ?, ?, ?)`,
    [
      asset_code || null,
      asset_name,
      location_id,
      location_type,
      status || "new",
    ]
  );

  const insertedId = result.insertId;

  if (!asset_code) {
    asset_code = `FA-${insertedId.toString().padStart(4, "0")}`;

    await query(
      `UPDATE fixed_assets SET asset_code = ? WHERE id = ?`,
      [asset_code, insertedId]
    );
  }

  return { asset_code };
};

/* ================= GET ================= */

export const getFixedAssetsService = async (search?: string) => {
  const searchQuery = search ? `%${search}%` : null;

  const sql = `
    SELECT
      fa.id,
      fa.asset_code,
      fa.asset_name,
      fa.location_id,
      fa.location_type,
      fa.status,
      fa.created_at,
      fa.updated_at,

      CASE 
        WHEN fa.location_type = 'shop' THEN sh.name
        WHEN fa.location_type = 'store' THEN st.name
      END AS location_name

    FROM fixed_assets fa

    LEFT JOIN shops sh 
      ON fa.location_id = sh.id AND fa.location_type = 'shop'

    LEFT JOIN stores st 
      ON fa.location_id = st.id AND fa.location_type = 'store'

    WHERE ? IS NULL
      OR fa.asset_name LIKE ?
      OR fa.asset_code LIKE ?

    ORDER BY fa.id DESC
  `;

  const rows: any[] = await query(sql, [
    searchQuery,
    searchQuery,
    searchQuery,
  ]);

  return rows.map((r) => ({
    ...r,
    id: Number(r.id),
    location_id: Number(r.location_id),
  }));
};

/* ================= UPDATE ================= */

export const updateFixedAssetService = async (id: number, data: any) => {
  const {
    asset_name,
    location_id,
    location_type,
    status,
  } = data;

  const existing = await query(
    `SELECT id FROM fixed_assets WHERE id = ?`,
    [id]
  );

  if (!existing || existing.length === 0) {
    throw new Error("Asset not found");
  }

  if (location_id && location_type) {
    const table = location_type === "shop" ? "shops" : "stores";

    const location = await query(
      `SELECT id FROM ${table} WHERE id = ? LIMIT 1`,
      [location_id]
    );

    if (!location || location.length === 0) {
      throw new Error("Invalid location");
    }
  }

  await query(
    `UPDATE fixed_assets
     SET asset_name = COALESCE(?, asset_name),
         location_id = COALESCE(?, location_id),
         location_type = COALESCE(?, location_type),
         status = COALESCE(?, status)
     WHERE id = ?`,
    [asset_name, location_id, location_type, status, id]
  );
};

/* ================= DELETE ================= */

export const deleteFixedAssetService = async (id: number) => {
  const existing = await query(
    `SELECT id FROM fixed_assets WHERE id = ?`,
    [id]
  );

  if (!existing || existing.length === 0) {
    throw new Error("Asset not found");
  }

  await query(`DELETE FROM fixed_assets WHERE id = ?`, [id]);
};
