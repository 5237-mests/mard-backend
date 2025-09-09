import { query } from "../config/db";

// Get all sales with items[]
export const getAllSales = async () => {
  const sql = `
    SELECT 
      s.id,
      s.shop_id,
      s.sold_by_id,
      s.total_amount,
      s.customer_name,
      s.customer_contact,
      s.created_at,
      u.name AS seller,
      sh.name AS shop,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'item_id', si.item_id,
          'quantity', si.quantity,
          'price', si.price,
          'ITEM_serial_number', si.item_serial_number,
          'name', i.name,
          'model', i.model
        )
      ) AS items
    FROM sales s
    JOIN sale_items si ON s.id = si.sale_id
    JOIN items i ON si.item_id = i.id
    JOIN users u ON s.sold_by_id = u.id
    JOIN shops sh ON s.shop_id = sh.id
    GROUP BY s.id
    ORDER BY s.created_at DESC
  `;
  return await query(sql);
};

// Get all sales with items[]
export const getAllSalesByUser = async (userId: number) => {
  const sql = `
    SELECT 
      s.id,
      s.shop_id,
      s.sold_by_id,
      s.total_amount,
      s.customer_name,
      s.customer_contact,
      s.created_at,
      u.name AS seller,
      sh.name AS shop,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'item_id', si.item_id,
          'quantity', si.quantity,
          'price', si.price,
          'ITEM_serial_number', si.item_serial_number,
          'name', i.name,
          'model', i.model
        )
      ) AS items
    FROM sales s
    JOIN sale_items si ON s.id = si.sale_id
    JOIN items i ON si.item_id = i.id
    JOIN users u ON s.sold_by_id = u.id
    JOIN shops sh ON s.shop_id = sh.id
    GROUP BY s.id
    ORDER BY s.created_at DESC
  `;
  return await query(sql);
};

// Get a single sale by ID with items[]
export const getSaleById = async (saleId: number) => {
  const sql = `
    SELECT 
      s.id,
      s.shop_id,
      s.sold_by_id,
      s.total_amount,
      s.customer_name,
      s.customer_contact,
      s.created_at,
      u.name AS seller,
      sh.name AS shop,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'item_id', si.item_id,
          'quantity', si.quantity,
          'price', si.price,
          'item_serial_number', si.item_serial_number,
          'name', i.name,
          'model', i.model
        )
      ) AS items
    FROM sales s
    JOIN sale_items si ON s.id = si.sale_id
    JOIN items i ON si.item_id = i.id
    JOIN users u ON s.sold_by_id = u.id
    JOIN shops sh ON s.shop_id = sh.id
    WHERE s.id = ?
    GROUP BY s.id
  `;
  const rows = await query(sql, [saleId]);
  return rows[0] || null;
};

// Update sale details (walk-in customers only)
export const updateSale = async (
  saleId: number,
  updates: { customer_name?: string; customer_contact?: string }
) => {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.customer_name) {
    fields.push("customer_name = ?");
    values.push(updates.customer_name);
  }
  if (updates.customer_contact) {
    fields.push("customer_contact = ?");
    values.push(updates.customer_contact);
  }

  if (fields.length === 0) {
    throw new Error("No valid fields to update");
  }

  values.push(saleId);

  const sql = `UPDATE sales SET ${fields.join(", ")} WHERE id = ?`;
  return await query(sql, values);
};

// Delete a sale (cascade removes items)
export const deleteSale = async (saleId: number) => {
  const sql = `DELETE FROM sales WHERE id = ?`;
  return await query(sql, [saleId]);
};

export const searchSales = async (filters: {
  customer_name?: string;
  customer_contact?: string;
  date_from?: string;
  date_to?: string;
}) => {
  let sql = `
    SELECT s.id, s.customer_name, s.customer_contact, s.total_amount, s.created_at,
           si.item_id, si.quantity, si.price_at_sale, i.name AS item_name
    FROM sales s
    JOIN sale_items si ON s.id = si.sale_id
    JOIN items i ON si.item_id = i.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (filters.customer_name) {
    sql += " AND s.customer_name LIKE ?";
    params.push(`%${filters.customer_name}%`);
  }

  if (filters.customer_contact) {
    sql += " AND s.customer_contact LIKE ?";
    params.push(`%${filters.customer_contact}%`);
  }

  if (filters.date_from) {
    sql += " AND DATE(s.created_at) >= ?";
    params.push(filters.date_from);
  }

  if (filters.date_to) {
    sql += " AND DATE(s.created_at) <= ?";
    params.push(filters.date_to);
  }

  sql += " ORDER BY s.created_at DESC";

  const [rows] = await query(sql, params);
  return rows as any[];
};
