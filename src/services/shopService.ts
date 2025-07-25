import ShopItem from "../models/ShopItem";
import Sale from "../models/Sale";

export class ShopService {
  async processSale(
    shopId: string,
    items: { itemId: string; quantitySold: number }[],
    soldBy: string
  ) {
    for (const { itemId, quantitySold } of items) {
      await ShopItem.updateOne(
        { shopId, itemId },
        { $inc: { quantity: -quantitySold } }
      );
    }
    return await Sale.create({ shopId, items, soldBy });
  }

  async getSales(filter: any, itemId?: string) {
    let sales = await Sale.find(filter);
    if (itemId) {
      sales = sales.filter((sale) =>
        sale.items.some((item) => item.itemId.toString() === itemId)
      );
    }
    return sales;
  }
}
