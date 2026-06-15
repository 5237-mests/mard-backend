import { query } from "../config/db";

interface Location {
  id: number;
  name: string;
  type: "shop" | "store";
  key: string;
}

export const getLiveBalancePivot = async (search?: string) => {
  const searchQuery = search ? `%${search}%` : null;

  /* ================= FETCH LOCATIONS ================= */

  const shops: { id: number; name: string }[] = await query(
    `SELECT id, name FROM shops ORDER BY id`,
  );

  const stores: { id: number; name: string }[] = await query(
    `SELECT id, name FROM stores ORDER BY id`,
  );

  /* ================= HANDLE EMPTY LOCATIONS ================= */

  const shopPivotCols =
    shops.length > 0
      ? shops
          .map(
            (s) =>
              `SUM(CASE WHEN shop_id = ${s.id} THEN quantity ELSE 0 END) AS shop_${s.id}`,
          )
          .join(",")
      : "0 AS shop_dummy";

  const storePivotCols =
    stores.length > 0
      ? stores
          .map(
            (s) =>
              `SUM(CASE WHEN store_id = ${s.id} THEN quantity ELSE 0 END) AS store_${s.id}`,
          )
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

  const totalExpr =
    [
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

      ${
        shops.length > 0
          ? shops
              .map((s) => `COALESCE(sp.shop_${s.id},0) AS shop_${s.id}`)
              .join(",")
          : ""
      }

      ${
        stores.length > 0
          ? "," +
            stores
              .map((s) => `COALESCE(st.store_${s.id},0) AS store_${s.id}`)
              .join(",")
          : ""
      },

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

  const rawItems: any[] = await query(sql, [
    searchQuery,
    searchQuery,
    searchQuery,
    searchQuery,
  ]);

  /* ================= SAFE NUMERIC CONVERSION ================= */

  const items = rawItems.map((item) => {
    const converted: any = {
      ...item,
      price: Number(item.price),
      total_quantity: Number(item.total_quantity),
    };

    Object.keys(item).forEach((key) => {
      if (key.startsWith("shop_") || key.startsWith("store_")) {
        converted[key] = Number(item[key] ?? 0);
      }
    });

    return converted;
  });

  /* ================= BUILD LOCATIONS ================= */

  const locations: Location[] = [
    ...shops.map((s) => ({
      id: s.id,
      name: s.name,
      type: "shop" as const,
      key: `shop_${s.id}`,
    })),
    ...stores.map((s) => ({
      id: s.id,
      name: s.name,
      type: "store" as const,
      key: `store_${s.id}`,
    })),
  ];

  /* ================= SUMMARY ================= */

  const total_distinct_items = items.length;

  const total_number_of_items = items.reduce(
    (sum, i) => sum + i.total_quantity,
    0,
  );

  const total_asset_valuation = items.reduce(
    (sum, i) => sum + i.total_quantity * i.price,
    0,
  );

  /* ================= RESPONSE ================= */

  return {
    total_distinct_items,
    total_number_of_items,
    total_asset_valuation,
    locations,
    data: items,
  };
};

export const getLiveBalancePivot2 = async (
  search?: string,
  category_id?: number,
) => {
  const searchQuery = search ? `%${search}%` : null;

  /* ================= FETCH LOCATIONS ================= */
  const shops: { id: number; name: string }[] = await query(
    `SELECT id, name FROM shops ORDER BY id`,
  );

  const stores: { id: number; name: string }[] = await query(
    `SELECT id, name FROM stores ORDER BY id`,
  );

  /* ================= DYNAMIC PIVOT COLUMNS ================= */
  const shopPivotCols =
    shops.length > 0
      ? shops
          .map(
            (s) =>
              `SUM(CASE WHEN shop_id = ${s.id} THEN quantity ELSE 0 END) AS shop_${s.id}`,
          )
          .join(",")
      : "0 AS shop_dummy";

  const storePivotCols =
    stores.length > 0
      ? stores
          .map(
            (s) =>
              `SUM(CASE WHEN store_id = ${s.id} THEN quantity ELSE 0 END) AS store_${s.id}`,
          )
          .join(",")
      : "0 AS store_dummy";

  const shopPivotSQL = `SELECT item_id, ${shopPivotCols} FROM shop_items GROUP BY item_id`;
  const storePivotSQL = `SELECT item_id, ${storePivotCols} FROM store_items GROUP BY item_id`;

  /* ================= TOTAL QUANTITY ================= */
  const totalExpr =
    [
      ...shops.map((s) => `COALESCE(sp.shop_${s.id}, 0)`),
      ...stores.map((s) => `COALESCE(st.store_${s.id}, 0)`),
    ].join(" + ") || "0";

  /* ================= BUILD WHERE CLAUSE ================= */
  let whereClause = "";
  const params: any[] = [];

  const hasSearch = !!searchQuery;
  const hasCategory =
    category_id !== undefined && category_id !== 0 && category_id !== null;

  if (hasSearch || hasCategory) {
    whereClause = "WHERE ";

    if (hasSearch) {
      whereClause += `(i.name LIKE ? OR i.code LIKE ? OR i.model LIKE ?)`;
      params.push(searchQuery, searchQuery, searchQuery);
    }

    if (hasSearch && hasCategory) {
      whereClause += " AND ";
    }

    if (hasCategory) {
      whereClause += `i.category_id = ?`;
      params.push(category_id);
    }
  }

  /* ================= MAIN SQL ================= */
  const sql = `
    SELECT
      i.id AS item_id,
      TRIM(i.name) AS name,
      i.code,
      i.model,
      i.image,
      COALESCE(i.price, 0) AS price,
      COALESCE(b.name, '') AS brand_name,
      COALESCE(c.name, '') AS category_name,
      ${
        shops.length > 0
          ? shops
              .map((s) => `COALESCE(sp.shop_${s.id}, 0) AS shop_${s.id}`)
              .join(",")
          : ""
      }
      ${
        stores.length > 0
          ? "," +
            stores
              .map((s) => `COALESCE(st.store_${s.id}, 0) AS store_${s.id}`)
              .join(",")
          : ""
      },
      (${totalExpr}) AS total_quantity

    FROM items i
    LEFT JOIN brands b ON i.brand_id = b.id
    LEFT JOIN categories c ON i.category_id = c.id
    LEFT JOIN (${shopPivotSQL}) sp ON sp.item_id = i.id
    LEFT JOIN (${storePivotSQL}) st ON st.item_id = i.id

    ${whereClause}

    ORDER BY total_quantity DESC, i.name ASC
  `;

  /* ================= EXECUTE ================= */
  const rawItems: any[] = await query(sql, params);

  /* ================= PROCESS RESULTS ================= */
  const items = rawItems.map((item) => {
    const converted: any = {
      ...item,
      price: Number(item.price || 0),
      total_quantity: Number(item.total_quantity || 0),
    };

    Object.keys(item).forEach((key) => {
      if (key.startsWith("shop_") || key.startsWith("store_")) {
        converted[key] = Number(item[key] ?? 0);
      }
    });

    return converted;
  });

  /* ================= FINAL FILTERED RESPONSE ================= */
  const filteredItems = items.map((i) => ({
    item_id: i.item_id,
    name: i.name,
    code: i.code,
    model: i.model,
    image: i.image,
    price: i.price,
    brand_name: i.brand_name, // ✅ Added
    category_name: i.category_name, // ✅ Added
    total_quantity: i.total_quantity,
  }));

  return {
    total_distinct_items: filteredItems.length,
    total_number_of_items: filteredItems.reduce(
      (sum, i) => sum + i.total_quantity,
      0,
    ),
    data: filteredItems,
  };
};

export const getLiveBalancePivot22 = async (
  search?: string,
  category_id?: number,
) => {
  const searchQuery = search ? `%${search}%` : null;

  /* ================= FETCH LOCATIONS ================= */
  const shops: { id: number; name: string }[] = await query(
    `SELECT id, name FROM shops ORDER BY id`,
  );

  const stores: { id: number; name: string }[] = await query(
    `SELECT id, name FROM stores ORDER BY id`,
  );

  /* ================= DYNAMIC PIVOT COLUMNS ================= */
  const shopPivotCols =
    shops.length > 0
      ? shops
          .map(
            (s) =>
              `SUM(CASE WHEN shop_id = ${s.id} THEN quantity ELSE 0 END) AS shop_${s.id}`,
          )
          .join(",")
      : "0 AS shop_dummy";

  const storePivotCols =
    stores.length > 0
      ? stores
          .map(
            (s) =>
              `SUM(CASE WHEN store_id = ${s.id} THEN quantity ELSE 0 END) AS store_${s.id}`,
          )
          .join(",")
      : "0 AS store_dummy";

  const shopPivotSQL = `SELECT item_id, ${shopPivotCols} FROM shop_items GROUP BY item_id`;
  const storePivotSQL = `SELECT item_id, ${storePivotCols} FROM store_items GROUP BY item_id`;

  /* ================= TOTAL QUANTITY ================= */
  const totalExpr =
    [
      ...shops.map((s) => `COALESCE(sp.shop_${s.id}, 0)`),
      ...stores.map((s) => `COALESCE(st.store_${s.id}, 0)`),
    ].join(" + ") || "0";

  /* ================= BUILD WHERE CLAUSE CORRECTLY ================= */
  let whereClause = "";
  const params: any[] = [];

  const hasSearch = !!searchQuery;
  const hasCategory =
    category_id !== undefined && category_id !== 0 && category_id !== null;

  if (hasSearch || hasCategory) {
    whereClause = "WHERE ";

    if (hasSearch) {
      whereClause += `(i.name LIKE ? OR i.code LIKE ? OR i.model LIKE ?)`;
      params.push(searchQuery, searchQuery, searchQuery);
    }

    if (hasSearch && hasCategory) {
      whereClause += " AND ";
    }

    if (hasCategory) {
      whereClause += `i.category_id = ?`;
      params.push(category_id);
    }
  }

  /* ================= MAIN SQL ================= */
  //  JOIN brands ON items.brand_id = brands.id
  //  JOIN categories ON items.category_id = categories.id
  const sql = `
    SELECT
      i.id AS item_id,
      TRIM(i.name) AS name,
      i.code,
      i.model,
      i.image,
      COALESCE(i.price, 0) AS price,
      ${
        shops.length > 0
          ? shops
              .map((s) => `COALESCE(sp.shop_${s.id}, 0) AS shop_${s.id}`)
              .join(",")
          : ""
      }
      ${
        stores.length > 0
          ? "," +
            stores
              .map((s) => `COALESCE(st.store_${s.id}, 0) AS store_${s.id}`)
              .join(",")
          : ""
      },
      (${totalExpr}) AS total_quantity

    FROM items i
    LEFT JOIN (${shopPivotSQL}) sp ON sp.item_id = i.id
    LEFT JOIN (${storePivotSQL}) st ON st.item_id = i.id

    ${whereClause}

    ORDER BY total_quantity DESC, i.name ASC
  `;

  /* ================= EXECUTE ================= */
  const rawItems: any[] = await query(sql, params);

  /* ================= PROCESS RESULTS ================= */
  const items = rawItems.map((item) => {
    const converted: any = {
      ...item,
      price: Number(item.price || 0),
      total_quantity: Number(item.total_quantity || 0),
    };

    Object.keys(item).forEach((key) => {
      if (key.startsWith("shop_") || key.startsWith("store_")) {
        converted[key] = Number(item[key] ?? 0);
      }
    });

    return converted;
  });

  const filteredItems = items.map((i) => ({
    item_id: i.item_id,
    name: i.name,
    code: i.code,
    model: i.model,
    image: i.image,
    price: i.price,
    total_quantity: i.total_quantity,
  }));

  return {
    total_distinct_items: filteredItems.length,
    total_number_of_items: filteredItems.reduce(
      (sum, i) => sum + i.total_quantity,
      0,
    ),
    data: filteredItems,
  };
};
