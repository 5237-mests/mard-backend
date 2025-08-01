import { prisma } from "../config/db";
import { ISaleItem } from "../types/prisma";

export class ShopService {
  async processSale(
    shopId: string,
    items: { itemId: string; quantitySold: number }[],
    soldBy: string
  ) {
    return await prisma.$transaction(async (tx) => {
      // Update shop item quantities
      for (const { itemId, quantitySold } of items) {
        const shopItem = await tx.shopItem.findFirst({
          where: { shopId: parseInt(shopId), itemId: parseInt(itemId) }
        });
        if (shopItem) {
          await tx.shopItem.update({
            where: { id: shopItem.id },
            data: { quantity: shopItem.quantity - quantitySold }
          });
        }
      }

      // Create sale record
      const shop = await tx.shop.findUnique({ where: { id: parseInt(shopId) } });
      const seller = await tx.user.findUnique({ where: { id: parseInt(soldBy) } });
      
      if (!shop || !seller) {
        throw new Error("Shop or seller not found");
      }

      const saleItems: ISaleItem[] = items.map(item => ({
        itemId: parseInt(item.itemId),
        quantitySold: item.quantitySold
      }));

      return await tx.sale.create({
        data: {
          shopId: shop.id,
          items: saleItems as any, // Cast to any to handle JSON type
          soldById: seller.id,
        },
        include: {
          shop: true,
          soldBy: true,
        },
      });
    });
  }

  async getSales(filter: any, itemId?: string) {
    let sales = await prisma.sale.findMany({
      include: {
        shop: true,
        soldBy: true,
      }
    });
    
    if (itemId) {
      sales = sales.filter((sale) => {
        const saleItems = sale.items as unknown as ISaleItem[];
        return saleItems.some((item) => item.itemId.toString() === itemId);
      });
    }
    return sales;
  }
}
