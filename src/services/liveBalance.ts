import { query } from "../config/db";

export const getLiveBalancePivot = async (search?: string) => {
  const searchQuery = search ? `%${search}%` : null;

  // 1. Get all shops and stores
  const shops = await query(`SELECT id, name FROM shops ORDER BY id ASC`);
  const stores = await query(`SELECT id, name FROM stores ORDER BY id ASC`);

  // 2. Build dynamic SQL for pivot
  const shopColumns = shops
    .map(
      (shop) =>
        `SUM(CASE WHEN ish.shop_id = ${shop.id} THEN ish.quantity ELSE 0 END) AS \`${shop.name}(shop)\``,
    )
    .join(", ");

  const storeColumns = stores
    .map(
      (store) =>
        `SUM(CASE WHEN isr.store_id = ${store.id} THEN isr.quantity ELSE 0 END) AS \`${store.name}(store)\``,
    )
    .join(", ");

  const totalExpr = [
    ...shops.map(
      (s) =>
        `SUM(CASE WHEN ish.shop_id = ${s.id} THEN ish.quantity ELSE 0 END)`,
    ),
    ...stores.map(
      (s) =>
        `SUM(CASE WHEN isr.store_id = ${s.id} THEN isr.quantity ELSE 0 END)`,
    ),
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
  const items: any = await query(sql, [
    searchQuery,
    searchQuery,
    searchQuery,
    searchQuery,
  ]);

  return { shops, stores, data: items };
};
