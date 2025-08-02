import { query, transaction } from "../config/db";
import { ISaleItem, Sale, SaleWithRelations } from "../types/database";

export class ShopService {
  async processSale(
    shopId: string,
    items: { itemId: string; quantitySold: number }[],
    soldBy: string
  ) {
    return await transaction(async (connection) => {
      // Update shop item quantities
      for (const { itemId, quantitySold } of items) {
        const findShopItemSql = `
          SELECT * FROM shop_items 
          WHERE shopId = ? AND itemId = ?
        `;
        const [shopItems] = await connection.execute(findShopItemSql, [parseInt(shopId), parseInt(itemId)]);
        const shopItem = (shopItems as any[])[0];
        
        if (shopItem) {
          const updateQuantitySql = `
            UPDATE shop_items 
            SET quantity = quantity - ? 
            WHERE id = ?
          `;
          await connection.execute(updateQuantitySql, [quantitySold, shopItem.id]);
        }
      }

      // Verify shop and seller exist
      const shopSql = "SELECT * FROM shops WHERE id = ?";
      const [shops] = await connection.execute(shopSql, [parseInt(shopId)]);
      const shop = (shops as any[])[0];

      const sellerSql = "SELECT * FROM users WHERE id = ?";
      const [sellers] = await connection.execute(sellerSql, [parseInt(soldBy)]);
      const seller = (sellers as any[])[0];
      
      if (!shop || !seller) {
        throw new Error("Shop or seller not found");
      }

      const saleItems: ISaleItem[] = items.map(item => ({
        itemId: parseInt(item.itemId),
        quantitySold: item.quantitySold
      }));

      // Create sale record
      const createSaleSql = `
        INSERT INTO sales (shopId, items, soldById)
        VALUES (?, ?, ?)
      `;
      const [saleResult] = await connection.execute(createSaleSql, [
        shop.id,
        JSON.stringify(saleItems),
        seller.id
      ]);

      // Fetch the created sale with relations
      const saleId = (saleResult as any).insertId;
      const getSaleSql = `
        SELECT 
          s.*,
          sh.name as shop_name, sh.location as shop_location,
          u.name as soldBy_name, u.email as soldBy_email
        FROM sales s
        JOIN shops sh ON s.shopId = sh.id
        JOIN users u ON s.soldById = u.id
        WHERE s.id = ?
      `;
      const [saleData] = await connection.execute(getSaleSql, [saleId]);
      const sale = (saleData as any[])[0];

      return {
        ...sale,
        shop: {
          id: sale.shopId,
          name: sale.shop_name,
          location: sale.shop_location
        },
        soldBy: {
          id: sale.soldById,
          name: sale.soldBy_name,
          email: sale.soldBy_email
        },
        items: JSON.parse(sale.items)
      } as SaleWithRelations;
    });
  }

  async getSales(filter: any, itemId?: string) {
    let sql = `
      SELECT 
        s.*,
        sh.name as shop_name, sh.location as shop_location,
        u.name as soldBy_name, u.email as soldBy_email
      FROM sales s
      JOIN shops sh ON s.shopId = sh.id
      JOIN users u ON s.soldById = u.id
      ORDER BY s.soldAt DESC
    `;
    
    const salesData = await query(sql);
    let sales = salesData.map((sale: any) => ({
      ...sale,
      shop: {
        id: sale.shopId,
        name: sale.shop_name,
        location: sale.shop_location
      },
      soldBy: {
        id: sale.soldById,
        name: sale.soldBy_name,
        email: sale.soldBy_email
      },
      items: JSON.parse(sale.items)
    })) as SaleWithRelations[];
    
    if (itemId) {
      sales = sales.filter((sale) => {
        const saleItems = sale.items as unknown as ISaleItem[];
        return saleItems.some((item) => item.itemId.toString() === itemId);
      });
    }
    return sales;
  }
}
