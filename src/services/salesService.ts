import { query, transaction } from "../config/db";
import { SaleItemInput, ShopItem, Sale } from "../types/database";
import mysql from "mysql2/promise";
export class SalesService {
  static async processSale(
    shopId: string,
    soldById: number,
    customerName: string | null,
    customerContact: string | null,
    items: SaleItemInput[],
    status: "pending" | "completed" | "refunded" = "completed",
    tx_ref?: string
  ): Promise<number> {
    return await transaction(async (connection) => {
      const serialNumbers = new Set<string>();

      // 1️⃣ Validate stock and serial numbers
      for (const item of items) {
        const [stockRows] = await connection.query<
          ShopItem[] & mysql.RowDataPacket[]
        >("SELECT quantity FROM shop_items WHERE shop_id = ? AND item_id = ?", [
          shopId,
          item.itemId,
        ]);

        const shopItem = stockRows[0];
        if (!shopItem) {
          throw new Error(`Item ID ${item.itemId} not found in shop`);
        }
        if (shopItem.quantity < item.quantitySold && status === "completed") {
          throw new Error(`Insufficient stock for item ID ${item.itemId}`);
        }

        if (item.serialNumber) {
          if (serialNumbers.has(item.serialNumber)) {
            throw new Error(`Duplicate serial number ${item.serialNumber}`);
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

      // 2️⃣ Calculate total amount
      const totalAmount = items.reduce(
        (sum, item) => sum + item.quantitySold * item.price,
        0
      );

      // 3️⃣ Insert sale record
      const [saleResult] = await connection.query<mysql.ResultSetHeader>(
        `INSERT INTO sales 
        (shop_id, sold_by_id, total_amount, customer_name, customer_contact, status, tx_ref, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          shopId,
          soldById,
          totalAmount,
          customerName || null,
          customerContact || null,
          status,
          tx_ref || null,
        ]
      );

      const saleId = saleResult.insertId;

      // 4️⃣ Always insert sale_items (so we know what was sold)
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
      }

      // 5️⃣ Only update stock when status is 'completed'
      if (status === "completed") {
        for (const item of items) {
          await connection.query(
            "UPDATE shop_items SET quantity = quantity - ? WHERE shop_id = ? AND item_id = ?",
            [item.quantitySold, shopId, item.itemId]
          );
        }
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
      COUNT(DISTINCT si.item_id) AS total_distinct_items,
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
      total_distinct_items: Number(sale.total_distinct_items) || 0,
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

  // update sales status to completed
  static async updateSaleStatus(tx_ref: string, status: string): Promise<void> {
    await transaction(async (connection) => {
      // 1️⃣ Find the sale by tx_ref
      const [saleRows] = await connection.query<Sale[] & mysql.RowDataPacket[]>(
        "SELECT id, shop_id, status FROM sales WHERE tx_ref = ?",
        [tx_ref]
      );

      if (saleRows.length === 0) {
        throw new Error(`Sale with tx_ref ${tx_ref} not found`);
      }

      const sale = saleRows[0];
      if (sale.status === "completed") {
        // already completed → avoid double stock reduction
        return;
      }

      // 2️⃣ Update sale status
      await connection.query("UPDATE sales SET status = ? WHERE id = ?", [
        status,
        sale.id,
      ]);

      // 3️⃣ Only update stock when payment completes
      if (status === "completed") {
        // Get all sale items
        const [items] = await connection.query<
          { item_id: number; quantity: number }[] & mysql.RowDataPacket[]
        >("SELECT item_id, quantity FROM sale_items WHERE sale_id = ?", [
          sale.id,
        ]);

        for (const item of items) {
          await connection.query(
            "UPDATE shop_items SET quantity = quantity - ? WHERE shop_id = ? AND item_id = ?",
            [item.quantity, sale.shop_id, item.item_id]
          );
        }
      }
    });
  }

  // refund sale
  static async refundSale(identifier: {
    saleId?: number;
    tx_ref?: string;
  }): Promise<void> {
    const { saleId, tx_ref } = identifier;

    if (!saleId && !tx_ref) {
      throw new Error("Either saleId or tx_ref must be provided for refund");
    }

    await transaction(async (connection) => {
      // 1️⃣ Find the sale by either saleId or tx_ref
      const [sales] = await connection.query<
        { id: number; shop_id: number; status: string }[] &
          mysql.RowDataPacket[]
      >(
        `SELECT id, shop_id, status 
       FROM sales 
       WHERE ${saleId ? "id = ?" : "tx_ref = ?"} 
       LIMIT 1`,
        [saleId || tx_ref]
      );

      if (sales.length === 0) {
        throw new Error(`Sale ${saleId || tx_ref} not found`);
      }

      const sale = sales[0];

      // 2️⃣ Prevent multiple refunds
      if (sale.status === "refunded") {
        throw new Error(`Sale ${saleId || tx_ref} is already refunded`);
      }

      // 3️⃣ Fetch sale items
      const [items] = await connection.query<
        { item_id: number; quantity: number }[] & mysql.RowDataPacket[]
      >("SELECT item_id, quantity FROM sale_items WHERE sale_id = ?", [
        sale.id,
      ]);

      // 4️⃣ Restore quantities to stock
      for (const item of items) {
        await connection.query(
          "UPDATE shop_items SET quantity = quantity + ? WHERE shop_id = ? AND item_id = ?",
          [item.quantity, sale.shop_id, item.item_id]
        );
      }

      // 5️⃣ Update sale status
      await connection.query("UPDATE sales SET status = ? WHERE id = ?", [
        "refunded",
        sale.id,
      ]);
    });
  }
}
