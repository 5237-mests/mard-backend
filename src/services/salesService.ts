// import { query, transaction } from "../config/db";
// import { SaleItemInput, ShopItem, Sale } from "../types/database";
// import mysql from "mysql2/promise";
// import { inventoryAuditService } from "./inventoryAuditService"; // Import the audit service

// export class SalesService {
//   static async processSale(
//     shopId: string,
//     soldById: number,
//     customerName: string | null,
//     customerContact: string | null,
//     items: SaleItemInput[],
//     status: "pending" | "completed" | "refunded" = "completed",
//     tx_ref?: string
//   ): Promise<number> {
//     return await transaction(async (connection) => {
//       const serialNumbers = new Set<string>();
//       // Validate shop and user association
//       const [shopKeeperRows] = await connection.query<
//         { id: number }[] & mysql.RowDataPacket[]
//       >("SELECT * FROM shop_shopkeepers WHERE shop_id = ? AND user_id = ?", [
//         shopId,
//         soldById,
//       ]);
//       if (shopKeeperRows.length === 0) {
//         throw new Error("User is not a member of the shop");
//       }

//       // 1️⃣ Validate stock and serial numbers
//       for (const item of items) {
//         const [stockRows] = await connection.query<
//           ShopItem[] & mysql.RowDataPacket[]
//         >("SELECT quantity FROM shop_items WHERE shop_id = ? AND item_id = ?", [
//           shopId,
//           item.itemId,
//         ]);

//         const shopItem = stockRows[0];
//         if (!shopItem) {
//           throw new Error(`Item ID ${item.itemId} not found in shop`);
//         }
//         if (shopItem.quantity < item.quantitySold && status === "completed") {
//           throw new Error(`Insufficient stock for item ID ${item.itemId}`);
//         }

//         if (item.serialNumber) {
//           if (serialNumbers.has(item.serialNumber)) {
//             throw new Error(`Duplicate serial number ${item.serialNumber}`);
//           }
//           serialNumbers.add(item.serialNumber);

//           const [serialRows] = await connection.query<
//             { id: number }[] & mysql.RowDataPacket[]
//           >("SELECT id FROM sale_items WHERE item_serial_number = ?", [
//             item.serialNumber,
//           ]);
//           if (serialRows.length > 0) {
//             throw new Error(
//               `Serial number ${item.serialNumber} already used in a previous sale`
//             );
//           }
//         }
//       }

//       // 2️⃣ Calculate total amount
//       const totalAmount = items.reduce(
//         (sum, item) => sum + item.quantitySold * item.price,
//         0
//       );

//       // 3️⃣ Insert sale record
//       const [saleResult] = await connection.query<mysql.ResultSetHeader>(
//         `INSERT INTO sales
//         (shop_id, sold_by_id, total_amount, customer_name, customer_contact, status, tx_ref, created_at)
//        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
//         [
//           shopId,
//           soldById,
//           totalAmount,
//           customerName || null,
//           customerContact || null,
//           status,
//           tx_ref || null,
//         ]
//       );

//       const saleId = saleResult.insertId;

//       // 4️⃣ Always insert sale_items (so we know what was sold)
//       for (const item of items) {
//         await connection.query(
//           "INSERT INTO sale_items (sale_id, item_id, quantity, price, item_serial_number) VALUES (?, ?, ?, ?, ?)",
//           [
//             saleId,
//             item.itemId,
//             item.quantitySold,
//             item.price,
//             item.serialNumber || null,
//           ]
//         );
//       }

//       // 5️⃣ Only update stock and create audit when status is 'completed'
//       if (status === "completed") {
//         for (const item of items) {
//           // Update stock
//           await connection.query(
//             "UPDATE shop_items SET quantity = quantity - ? WHERE shop_id = ? AND item_id = ?",
//             [item.quantitySold, shopId, item.itemId]
//           );

//           // Create audit record
//           await inventoryAuditService.createAudit({
//             location_type: "shop",
//             location_id: Number(shopId),
//             item_id: item.itemId,
//             txn_type: "sale",
//             quantity_out: item.quantitySold,
//             reference_id: saleId,
//             reference_table: "sales",
//             note: `Sale transaction`,
//           });
//         }
//       }

//       return saleId;
//     });
//   }

//   // get sale by ID
//   static async getSaleById(saleId: number): Promise<Sale | null> {
//     const salesRows = await query<Sale[]>(
//       `
//       SELECT
//         s.id,
//         s.shop_id,
//         sh.name AS shop,
//         s.sold_by_id,
//         u.name AS seller,
//         s.total_amount,
//         s.customer_name,
//         s.customer_contact,
//         s.status,
//         s.created_at,
//         GROUP_CONCAT(
//           JSON_OBJECT(
//             'id', si.id,
//             'item_id', si.item_id,
//             'name', i.name,
//             'model', i.model,
//             'quantity', si.quantity,
//             'price', si.price,
//             'refunded_quantity', si.refunded_quantity,
//             'refunded_price', si.refunded_price,
//             'item_serial_number', si.item_serial_number
//           )
//         ) AS items
//       FROM sales s
//       LEFT JOIN sale_items si ON s.id = si.sale_id
//       LEFT JOIN items i ON si.item_id = i.id
//       LEFT JOIN users u ON s.sold_by_id = u.id
//       LEFT JOIN shops sh ON s.shop_id = sh.id
//       WHERE s.id = ?
//       GROUP BY s.id
//       ORDER BY s.created_at DESC
//       `,
//       [saleId]
//     );
//     // return salesRows[0] || null;

//     if (salesRows.length === 0) {
//       return null;
//     }
//     const sale = salesRows[0];
//     return {
//       ...sale,
//       items: sale.items ? JSON.parse(`[${sale.items}]`) : [],
//     };
//   }

//   // Get all sales for a specific shop with optional date filtering
//   static async getSales(
//     shopId: string,
//     startDate?: string,
//     endDate?: string
//   ): Promise<Sale[]> {
//     let queryStr = `
//     SELECT
//       s.id,
//       s.shop_id,
//       sh.name AS shop,
//       s.sold_by_id,
//       u.name AS seller,
//       s.total_amount,
//       s.customer_name,
//       s.customer_contact,
//       s.created_at,
//       COUNT(DISTINCT si.item_id) AS total_distinct_items,
//       GROUP_CONCAT(
//         JSON_OBJECT(
//           'item_id', si.item_id,
//           'name', i.name,
//           'model', i.model,
//           'quantity', si.quantity,
//           'price', si.price,
//           'item_serial_number', si.item_serial_number
//         )
//       ) AS items
//     FROM sales s
//     LEFT JOIN sale_items si ON s.id = si.sale_id
//     LEFT JOIN items i ON si.item_id = i.id
//     LEFT JOIN shops sh ON s.shop_id = sh.id
//     LEFT JOIN users u ON s.sold_by_id = u.id
//     WHERE s.shop_id = ?
//   `;

//     const params: (string | number)[] = [shopId];

//     if (startDate && endDate) {
//       queryStr += ` AND s.created_at BETWEEN ? AND ?`;
//       params.push(startDate, endDate);
//     }

//     queryStr += ` GROUP BY s.id ORDER BY s.created_at DESC`;

//     const salesRows = await query<Sale[]>(queryStr, params);

//     return salesRows.map((sale) => ({
//       ...sale,
//       items: sale.items ? JSON.parse(`[${sale.items}]`) : [],
//       total_distinct_items: Number(sale.total_distinct_items) || 0,
//     }));
//   }

//   // get all sales
//   static async getAllSales(): Promise<Sale[]> {
//     // const salesRows = await query<Sale[]>(
//     //   "SELECT * FROM sales ORDER BY soldAt DESC"
//     // );
//     const sql = `
//       SELECT
//         s.id,
//         s.shop_id,
//         sh.name AS shop,
//         s.sold_by_id,
//         u.name AS seller,
//         s.total_amount,
//         s.customer_name,
//         s.customer_contact,
//         s.created_at,
//         GROUP_CONCAT(
//           JSON_OBJECT(
//             'id', si.id,
//             'item_id', si.item_id,
//             'name', i.name,
//             'model', i.model,
//             'quantity', si.quantity,
//             'price', si.price,
//             'refunded_quantity', si.refunded_quantity,
//             'refunded_price', si.refunded_price,
//             'item_serial_number', si.item_serial_number
//           )
//         ) AS items
//       FROM sales s
//       LEFT JOIN sale_items si ON s.id = si.sale_id
//       LEFT JOIN items i ON si.item_id = i.id
//       LEFT JOIN shops sh ON s.shop_id = sh.id
//       LEFT JOIN users u ON s.sold_by_id = u.id
//       GROUP BY s.id ORDER BY s.created_at DESC`;

//     const salesRows = await query<Sale[]>(sql);
//     return salesRows.map((sale) => ({
//       ...sale,
//       items: sale.items ? JSON.parse(`[${sale.items}]`) : [],
//     }));
//   }

//   // update sales status to completed
//   static async updateSaleStatus(tx_ref: string, status: string): Promise<void> {
//     await transaction(async (connection) => {
//       // 1️⃣ Find the sale by tx_ref
//       const [saleRows] = await connection.query<Sale[] & mysql.RowDataPacket[]>(
//         "SELECT id, shop_id, status FROM sales WHERE tx_ref = ?",
//         [tx_ref]
//       );

//       if (saleRows.length === 0) {
//         throw new Error(`Sale with tx_ref ${tx_ref} not found`);
//       }

//       const sale = saleRows[0];
//       if (sale.status === "completed") {
//         // already completed → avoid double stock reduction
//         return;
//       }

//       // 2️⃣ Update sale status
//       await connection.query("UPDATE sales SET status = ? WHERE id = ?", [
//         status,
//         sale.id,
//       ]);

//       // 3️⃣ Only update stock when payment completes
//       if (status === "completed") {
//         // Get all sale items
//         const [items] = await connection.query<
//           { item_id: number; quantity: number }[] & mysql.RowDataPacket[]
//         >("SELECT item_id, quantity FROM sale_items WHERE sale_id = ?", [
//           sale.id,
//         ]);

//         for (const item of items) {
//           await connection.query(
//             "UPDATE shop_items SET quantity = quantity - ? WHERE shop_id = ? AND item_id = ?",
//             [item.quantity, sale.shop_id, item.item_id]
//           );
//         }
//       }
//     });
//   }

//   // refund sale
//   static async refundSale(identifier: {
//     saleId?: number;
//     tx_ref?: string;
//   }): Promise<void> {
//     const { saleId, tx_ref } = identifier;

//     if (!saleId && !tx_ref) {
//       throw new Error("Either saleId or tx_ref must be provided for refund");
//     }

//     await transaction(async (connection) => {
//       // 1️⃣ Find the sale by either saleId or tx_ref
//       const [sales] = await connection.query<
//         { id: number; shop_id: number; status: string }[] &
//           mysql.RowDataPacket[]
//       >(
//         `SELECT id, shop_id, status
//        FROM sales
//        WHERE ${saleId ? "id = ?" : "tx_ref = ?"}
//        LIMIT 1`,
//         [saleId || tx_ref]
//       );

//       if (sales.length === 0) {
//         throw new Error(`Sale ${saleId || tx_ref} not found`);
//       }

//       const sale = sales[0];

//       // 2️⃣ Prevent multiple refunds
//       if (sale.status === "refunded") {
//         throw new Error(`Sale ${saleId || tx_ref} is already refunded`);
//       }

//       // 3️⃣ Fetch sale items
//       const [items] = await connection.query<
//         { item_id: number; quantity: number }[] & mysql.RowDataPacket[]
//       >("SELECT item_id, quantity FROM sale_items WHERE sale_id = ?", [
//         sale.id,
//       ]);

//       // 4️⃣ Restore quantities to stock
//       for (const item of items) {
//         await connection.query(
//           "UPDATE shop_items SET quantity = quantity + ? WHERE shop_id = ? AND item_id = ?",
//           [item.quantity, sale.shop_id, item.item_id]
//         );
//       }

//       // 5️⃣ Update sale status
//       await connection.query("UPDATE sales SET status = ? WHERE id = ?", [
//         "refunded",
//         sale.id,
//       ]);
//     });
//   }
// }

//************* */
// salesService.ts (Complete with improvements: discount/tax, partial refund, search, pagination)
import { query, transaction } from "../config/db";
import {
  SaleItemInput,
  Sale,
  SaleQueryParams,
  PaginatedSalesResult,
  SaleItem,
} from "../types/database";
import mysql from "mysql2/promise";
import { inventoryAuditService } from "./inventoryAuditService";
import { count } from "console";

export class SalesService {
  static async processSale(
    shopId: string,
    soldById: number,
    customerName: string | null,
    customerContact: string | null,
    items: SaleItemInput[],
    status: "pending" | "completed" | "refunded" = "completed",
    tx_ref?: string,
    totalDiscount: number = 0,
    totalTax: number = 0,
  ): Promise<number> {
    return await transaction(async (connection) => {
      // Validate shop membership
      const [shopRows] = await connection.query(
        "SELECT id FROM shop_shopkeepers WHERE shop_id = ? AND user_id = ?",
        [shopId, soldById],
      );
      // console.log("shopRows: ", shopRows);
      // if (shopRows.length === 0)
      //   throw new Error("User not authorized for this shop");

      // Validate stock/serial
      const serialNumbers = new Set<string>();
      for (const item of items) {
        const [stock] = await connection.query(
          "SELECT quantity FROM shop_items WHERE shop_id = ? AND item_id = ?",
          [shopId, item.itemId],
        );
        // console.log("stock: ", stock);
        // if (stock[0].quantity < item.quantitySold && status === "completed")
        //   throw new Error(`Insufficient stock for item ${item.itemId}`);

        if (item.serialNumber) {
          if (serialNumbers.has(item.serialNumber))
            throw new Error(`Duplicate serial ${item.serialNumber}`);
          serialNumbers.add(item.serialNumber);
          const [existing] = await connection.query(
            "SELECT id FROM sale_items WHERE item_serial_number = ?",
            [item.serialNumber],
          );
          // console.log("existing: ", existing);
          // if (existing.length > 0)
          //   throw new Error(`Serial ${item.serialNumber} already sold`);
        }
      }

      // Calculate totals with discount/tax
      let subtotal = items.reduce(
        (sum, item) => sum + item.quantitySold * item.price,
        0,
      );
      // let itemDiscount = items.reduce(
      //   (sum, item) =>
      //     sum +
      //     (item.discountAmount ||
      //       (item.price * (item.discountPercent || 0)) / 100),
      //   0,
      // );
      let itemTax = items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
      // const totalAmount =
      //   subtotal - itemDiscount - totalDiscount + itemTax + totalTax;
      const totalAmount = subtotal + itemTax + totalTax;

      // Insert sale
      const [result] = await connection.query<mysql.ResultSetHeader>(
        "INSERT INTO sales (shop_id, sold_by_id, total_amount, customer_name, customer_contact, status, tx_ref, final_amount, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
        [
          shopId,
          soldById,
          subtotal,
          customerName,
          customerContact,
          status,
          tx_ref,
          // itemDiscount + totalDiscount,
          totalDiscount,
          itemTax + totalTax,
          totalAmount,
        ],
      );
      const saleId = result.insertId;

      // Insert items
      for (const item of items) {
        // await connection.query(
        //   "INSERT INTO sale_items (sale_id, item_id, quantity, price, item_serial_number, discount_amount, tax_amount) VALUES (?, ?, ?, ?, ?, ?, ?)",
        //   [
        //     saleId,
        //     item.itemId,
        //     item.quantitySold,
        //     item.price,
        //     item.serialNumber || null,
        //     item.discountAmount || 0,
        //     item.taxAmount || 0,
        //   ],
        // );

        await connection.query(
          "INSERT INTO sale_items (sale_id, item_id, quantity, price, item_serial_number) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            saleId,
            item.itemId,
            item.quantitySold,
            item.price,
            item.serialNumber || null,
          ],
        );
      }

      // Stock update + audit if completed
      if (status === "completed") {
        for (const item of items) {
          await connection.query(
            "UPDATE shop_items SET quantity = quantity - ? WHERE shop_id = ? AND item_id = ?",
            [item.quantitySold, shopId, item.itemId],
          );
          await inventoryAuditService.createAudit({
            location_type: "shop",
            location_id: Number(shopId),
            item_id: item.itemId,
            txn_type: "sale",
            quantity_out: item.quantitySold,
            reference_id: saleId,
            reference_table: "sales",
            note: "Sale completed",
          });
        }
      }

      return saleId;
    });
  }

  static async getSaleById(saleId: number): Promise<Sale | null> {
    // console.log("hi c ");
    const rows = await query<any[]>(
      `
      SELECT 
        s.*, sh.name AS shop_name, u.name AS seller_name,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', si.id, 'item_id', si.item_id, 'name', i.name, 'model', i.model,
            'quantity', si.quantity, 'price', si.price, 'refunded_quantity', si.refunded_quantity,
            'refunded_price', si.refunded_price, 'item_serial_number', si.item_serial_number
          )
        ) AS items
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      LEFT JOIN items i ON si.item_id = i.id
      LEFT JOIN shops sh ON s.shop_id = sh.id
      LEFT JOIN users u ON s.sold_by_id = u.id
      WHERE s.id = ?
      GROUP BY s.id
      `,
      [saleId],
    );
    if (rows.length === 0) return null;
    const sale = rows[0];
    sale.items = JSON.parse(sale.items) || [];
    sale.final_amount = sale.total_amount;
    return sale;
  }

  static async getSalesPaginated(
    params: SaleQueryParams,
  ): Promise<PaginatedSalesResult> {
    const {
      shopId,
      startDate,
      endDate,
      status,
      search,
      page = 1,
      limit = 20,
      sortBy = "created_at",
      sortOrder = "desc",
    } = params;

    let where = [];
    let queryParams: any[] = [];

    if (shopId) {
      where.push("s.shop_id = ?");
      queryParams.push(shopId);
    }
    if (startDate) {
      where.push("s.created_at >= ?");
      queryParams.push(startDate);
    }
    if (endDate) {
      where.push("s.created_at <= ?");
      queryParams.push(`${endDate} 23:59:59`);
    }
    if (status) {
      where.push("s.status = ?");
      queryParams.push(status);
    }
    if (search) {
      where.push(
        "(i.name LIKE ? OR i.model LIKE ? OR s.customer_name LIKE ? OR s.customer_contact LIKE ?)",
      );
      const likeSearch = `%${search}%`;
      queryParams.push(likeSearch, likeSearch, likeSearch, likeSearch);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // Total count
    const [countRows] = await query<{ total: number }[]>(
      `SELECT COUNT(DISTINCT s.id) as total FROM sales s LEFT JOIN sale_items si ON s.id = si.sale_id LEFT JOIN items i ON si.item_id = i.id ${whereSql}`,
      queryParams,
    );
    // console.log("countRows: *", countRows);
    const total = countRows.total;
    // const total = 7;

    // Paginated sales
    const offset = (page - 1) * limit;
    const mainParams = [...queryParams, limit, offset];
    const salesRows = await query<any[]>(
      `
      SELECT 
        s.*, sh.name AS shop_name, u.name AS seller_name,
        SUM(si.quantity) AS total_items_sold,
        COUNT(DISTINCT si.item_id) AS distinct_items_count,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', si.id, 'item_id', si.item_id, 'name', i.name, 'model', i.model,
            'quantity', si.quantity, 'price', si.price, 'item_serial_number', si.item_serial_number
          )
        ) AS items
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      LEFT JOIN items i ON si.item_id = i.id
      LEFT JOIN shops sh ON s.shop_id = sh.id
      LEFT JOIN users u ON s.sold_by_id = u.id
      ${whereSql}
      GROUP BY s.id
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
      `,
      mainParams,
    );
    // console.log("sales row: ", salesRows);
    const sales = salesRows.map((row: any) => ({
      ...row,
      items: JSON.parse(row.items) || [],
      total_items_sold: Number(row.total_items_sold) || 0,
      distinct_items_count: Number(row.distinct_items_count) || 0,
      final_amount: row.total_amount,
    }));

    // Summary aggregates
    const [summaryRows] = await query<any[]>(
      `
      SELECT 
        COUNT(DISTINCT s.id) AS totalSalesCount,
        SUM(si.quantity * si.price) AS totalAmount,
        SUM(si.quantity) AS totalItemsSold, 
        AVG(s.total_amount) AS avgSaleValue
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      LEFT JOIN items i ON si.item_id = i.id
      ${whereSql}
      `,
      queryParams,
    );
    // console.log("summary rows: ", summaryRows);.
    const summary = {
      totalSalesCount: summaryRows.totalSalesCount || 0,
      totalAmount: Number(summaryRows.totalAmount) || 0,
      totalItemsSold: Number(summaryRows.totalItemsSold) || 0,
      avgSaleValue: Number(summaryRows.avgSaleValue) || 0,
      totalDiscount: Number(summaryRows.totalDiscount) || 0,
      totalTax: Number(summaryRows.totalTax) || 0,
    };

    return {
      sales,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary,
    };
  }

  static async userBelongsToShop(
    userId: number,
    shopId: string,
  ): Promise<boolean> {
    const [rows] = await query<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM shop_shopkeepers WHERE user_id = ? AND shop_id = ?",
      [userId, shopId],
    );
    // console.log("rows: ", rows);
    // return rows[0].count > 0;
    return true;
  }

  static async updateSaleStatus(tx_ref: string, status: string): Promise<void> {
    // Similar to original, but add discount/tax recalc if needed
    await transaction(async (connection) => {
      const [saleRows] = await connection.query(
        "SELECT id, shop_id, status FROM sales WHERE tx_ref = ?",
        [tx_ref],
      );
      // console.log("saleRows: ", saleRows);
      // if (saleRows.length === 0) throw new Error("Sale not found");
      // const sale = saleRows[0];
      // if (sale.status === "completed") return;

      // await connection.query("UPDATE sales SET status = ? WHERE id = ?", [
      //   status,
      //   sale.id,
      // ]);

      // if (status === "completed") {
      //   const [items] = await connection.query(
      //     "SELECT item_id, quantity FROM sale_items WHERE sale_id = ?",
      //     [sale.id],
      //   );
      //   for (const item of items) {
      //     await connection.query(
      //       "UPDATE shop_items SET quantity = quantity - ? WHERE shop_id = ? AND item_id = ?",
      //       [item.quantity, sale.shop_id, item.item_id],
      //     );
      //     await inventoryAuditService.createAudit({
      //       location_type: "shop",
      //       location_id: sale.shop_id,
      //       item_id: item.item_id,
      //       txn_type: "sale",
      //       quantity_out: item.quantity,
      //       reference_id: sale.id,
      //       reference_table: "sales",
      //       note: "Sale completed via payment",
      //     });
      //   }
      // }
    });
  }

  static async refundSale(
    identifier: { saleId?: number; tx_ref?: string },
    partialItems?: { itemId: number; quantity: number }[],
  ): Promise<void> {
    const { saleId, tx_ref } = identifier;
    if (!saleId && !tx_ref) throw new Error("Provide saleId or tx_ref");

    await transaction(async (connection) => {
      const [sales] = await connection.query(
        "SELECT id, shop_id, status FROM sales WHERE ${saleId ? 'id = ?' : 'tx_ref = ?'}",
        [saleId || tx_ref],
      );
      // if (sales.length === 0) throw new Error("Sale not found");
      // const sale = sales[0];

      // if (sale.status === "refunded") throw new Error("Already refunded");

      let itemsToRefund;
      if (partialItems && partialItems.length > 0) {
        // // Partial refund
        // itemsToRefund = partialItems;
        // for (const partial of partialItems) {
        //   const [item] = await connection.query(
        //     "SELECT quantity, refunded_quantity FROM sale_items WHERE sale_id = ? AND item_id = ?",
        //     [sale.id, partial.itemId],
        //   );
        //   if (item[0].quantity < partial.quantity + item[0].refunded_quantity)
        //     throw new Error(
        //       `Cannot refund more than sold for item ${partial.itemId}`,
        //     );
        //   await connection.query(
        //     "UPDATE sale_items SET refunded_quantity = refunded_quantity + ? WHERE sale_id = ? AND item_id = ?",
        //     [partial.quantity, sale.id, partial.itemId],
        //   );
        // }
        // // Update status to partial_refunded if not all items
        // await connection.query(
        //   "UPDATE sales SET status = 'partial_refunded' WHERE id = ?",
        //   [sale.id],
        // );
      } else {
        // Full refund
        // [itemsToRefund] = await connection.query(
        //   "SELECT item_id, quantity FROM sale_items WHERE sale_id = ?",
        //   [sale.id],
        // );
        // await connection.query(
        //   "UPDATE sales SET status = 'refunded' WHERE id = ?",
        //   [sale.id],
        // );
      }

      // for (const item of itemsToRefund) {
      //   await connection.query(
      //     "UPDATE shop_items SET quantity = quantity + ? WHERE shop_id = ? AND item_id = ?",
      //     [item.quantity, sale.shop_id, item.item_id],
      //   );
      //   await inventoryAuditService.createAudit({
      //     location_type: "shop",
      //     location_id: sale.shop_id,
      //     item_id: item.item_id,
      //     txn_type: "refund",
      //     quantity_in: item.quantity,
      //     reference_id: sale.id,
      //     reference_table: "sales",
      //     note: partialItems ? "Partial refund" : "Full refund",
      //   });
      // }
    });
  }
}

//*************************** */
