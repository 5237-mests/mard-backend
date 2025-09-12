import { query, transaction } from "../config/db";
import { SaleItemInput, ShopItem, Sale } from "../types/database";
import mysql from "mysql2/promise";
export class SalesService {
  static async processSale2(
    shopId: string,
    soldById: number,
    customerName: string | null,
    customerContact: string | null,
    items: SaleItemInput[]
  ): Promise<number> {
    return await transaction(async (connection) => {
      // Validate stock availability and serial number uniqueness
      const serialNumbers = new Set<string>();
      for (const item of items) {
        // Check stock
        const stockRows = await query<ShopItem[]>(
          "SELECT quantity FROM shop_items WHERE shop_id = ? AND item_id = ?",
          [shopId, item.itemId]
        );
        const shopItem = stockRows[0];
        if (!shopItem || shopItem.quantity < item.quantitySold) {
          throw new Error(`Insufficient stock for item ID ${item.itemId}`);
        }

        // Validate serial number uniqueness in sale_items
        if (item.serialNumber) {
          if (serialNumbers.has(item.serialNumber)) {
            throw new Error(
              `Duplicate serial number ${item.serialNumber} in this sale`
            );
          }
          serialNumbers.add(item.serialNumber);
          const serialRows = await query<{ id: number }[]>(
            "SELECT id FROM sale_items WHERE item_serial_number = ?",
            [item.serialNumber]
          );
          if (serialRows.length > 0) {
            throw new Error(
              `Serial number ${item.serialNumber} already used in a previous sale`
            );
          }
        }
      }

      // Calculate total amount (in cents)
      const totalAmount = items.reduce(
        (sum, item) => sum + item.quantitySold * item.price,
        0
      );

      // Insert sale record
      const saleResult = await query<{ insertId: number }>(
        "INSERT INTO sales (shop_id, sold_by_id, total_amount, customer_name, customer_contact, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
        [
          shopId,
          soldById,
          totalAmount,
          customerName || null,
          customerContact || null,
        ]
      );
      const saleId = saleResult.insertId;

      // Insert sale items
      for (const item of items) {
        await query(
          "INSERT INTO sale_items (sale_id, item_id, quantity, price, item_serial_number) VALUES (?, ?, ?, ?, ?)",
          [
            saleId,
            item.itemId,
            item.quantitySold,
            item.price,
            item.serialNumber || null,
          ]
        );
        // Update shop inventory
        await query(
          "UPDATE shop_items SET quantity = quantity - ? WHERE shop_id = ? AND item_id = ?",
          [item.quantitySold, shopId, item.itemId]
        );
      }

      return saleId;
    });
  }
  static async processSale(
    shopId: string,
    soldById: number,
    customerName: string | null,
    customerContact: string | null,
    items: SaleItemInput[]
  ): Promise<number> {
    return await transaction(async (connection) => {
      // Validate stock availability and serial number uniqueness
      const serialNumbers = new Set<string>();

      for (const item of items) {
        // Check stock
        const [stockRows] = await connection.query<
          ShopItem[] & mysql.RowDataPacket[]
        >("SELECT quantity FROM shop_items WHERE shop_id = ? AND item_id = ?", [
          shopId,
          item.itemId,
        ]);
        const shopItem = stockRows[0];
        if (!shopItem || shopItem.quantity < item.quantitySold) {
          throw new Error(`Insufficient stock for item ID ${item.itemId}`);
        }

        // Validate serial number uniqueness in sale_items
        if (item.serialNumber) {
          if (serialNumbers.has(item.serialNumber)) {
            throw new Error(
              `Duplicate serial number ${item.serialNumber} in this sale`
            );
          }
          serialNumbers.add(item.serialNumber);

          const [serialRows] = await connection.query<
            { id: number }[] & mysql.RowDataPacket[]
          >("SELECT id FROM sale_items WHERE item_serial_number = ?", [
            item.serialNumber,
          ]);
          if (serialRows.length > 0) {
            throw new Error(
              `Serial number ${item.serialNumber} already used in a previous sale`
            );
          }
        }
      }

      // Calculate total amount (in cents)
      const totalAmount = items.reduce(
        (sum, item) => sum + item.quantitySold * item.price,
        0
      );

      // Insert sale record
      const [saleResult] = await connection.query<mysql.ResultSetHeader>(
        "INSERT INTO sales (shop_id, sold_by_id, total_amount, customer_name, customer_contact, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
        [
          shopId,
          soldById,
          totalAmount,
          customerName || null,
          customerContact || null,
        ]
      );
      const saleId = (saleResult as any).insertId;

      // Insert sale items + update stock
      for (const item of items) {
        await connection.query(
          "INSERT INTO sale_items (sale_id, item_id, quantity, price, item_serial_number) VALUES (?, ?, ?, ?, ?)",
          [
            saleId,
            item.itemId,
            item.quantitySold,
            item.price,
            item.serialNumber || null,
          ]
        );

        await connection.query(
          "UPDATE shop_items SET quantity = quantity - ? WHERE shop_id = ? AND item_id = ?",
          [item.quantitySold, shopId, item.itemId]
        );
      }

      return saleId;
    });
  }

  static async getSales(
    shopId: string,
    startDate?: string,
    endDate?: string
  ): Promise<Sale[]> {
    let queryStr = `
      SELECT 
        s.id, 
        s.shop_id, 
        sh.name AS shop,
        s.sold_by_id, 
        u.name AS seller,
        s.total_amount, 
        s.customer_name, 
        s.customer_contact, 
        s.created_at,
        GROUP_CONCAT(
          JSON_OBJECT(
            'item_id', si.item_id,
            'name', i.name,
            'model', i.model,
            'quantity', si.quantity,
            'price', si.price,
            'item_serial_number', si.item_serial_number
          )
        ) AS items
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      LEFT JOIN items i ON si.item_id = i.id
      LEFT JOIN shops sh ON s.shop_id = sh.id
      LEFT JOIN users u ON s.sold_by_id = u.id
      WHERE s.shop_id = ?
    `;
    const params: (string | number)[] = [shopId];

    if (startDate && endDate) {
      queryStr += ` AND s.created_at BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }

    queryStr += ` GROUP BY s.id ORDER BY s.created_at DESC`;

    const salesRows = await query<Sale[]>(queryStr, params);

    return salesRows.map((sale) => ({
      ...sale,
      items: sale.items ? JSON.parse(`[${sale.items}]`) : [],
    }));
  }

  // get all sales
  static async getAllSales(): Promise<Sale[]> {
    // const salesRows = await query<Sale[]>(
    //   "SELECT * FROM sales ORDER BY soldAt DESC"
    // );
    const sql = `
      SELECT 
        s.id, 
        s.shop_id, 
        sh.name AS shop,
        s.sold_by_id, 
        u.name AS seller,
        s.total_amount, 
        s.customer_name, 
        s.customer_contact, 
        s.created_at,
        GROUP_CONCAT(
          JSON_OBJECT(
            'item_id', si.item_id,
            'name', i.name,
            'model', i.model,
            'quantity', si.quantity,
            'price', si.price,
            'item_serial_number', si.item_serial_number
          )
        ) AS items
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      LEFT JOIN items i ON si.item_id = i.id
      LEFT JOIN shops sh ON s.shop_id = sh.id
      LEFT JOIN users u ON s.sold_by_id = u.id
      GROUP BY s.id ORDER BY s.created_at DESC`;

    const salesRows = await query<Sale[]>(sql);
    return salesRows.map((sale) => ({
      ...sale,
      items: sale.items ? JSON.parse(`[${sale.items}]`) : [],
    }));
  }
}
