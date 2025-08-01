import { AppDataSource } from "../config/db";
import ShopItem from "../models/ShopItem";
import Sale from "../models/Sale";
import Shop from "../models/Shop";
import User from "../models/user";

export class ShopService {
  async processSale(
    shopId: string,
    items: { itemId: string; quantitySold: number }[],
    soldBy: string
  ) {
    const shopItemRepository = AppDataSource.getRepository(ShopItem);
    const saleRepository = AppDataSource.getRepository(Sale);
    const shopRepository = AppDataSource.getRepository(Shop);
    const userRepository = AppDataSource.getRepository(User);

    // Update shop item quantities
    for (const { itemId, quantitySold } of items) {
      const shopItem = await shopItemRepository.findOne({
        where: { shop: { id: parseInt(shopId) }, item: { id: parseInt(itemId) } }
      });
      if (shopItem) {
        await shopItemRepository.update(
          { shop: { id: parseInt(shopId) }, item: { id: parseInt(itemId) } },
          { quantity: shopItem.quantity - quantitySold }
        );
      }
    }

    // Create sale record
    const shop = await shopRepository.findOne({ where: { id: parseInt(shopId) } });
    const seller = await userRepository.findOne({ where: { id: parseInt(soldBy) } });
    
    if (!shop || !seller) {
      throw new Error("Shop or seller not found");
    }

    const saleItems = items.map(item => ({
      itemId: parseInt(item.itemId),
      quantitySold: item.quantitySold
    }));

    return await saleRepository.save({ 
      shop, 
      items: saleItems, 
      soldBy: seller 
    });
  }

  async getSales(filter: any, itemId?: string) {
    const saleRepository = AppDataSource.getRepository(Sale);
    let sales = await saleRepository.find({
      relations: ["shop", "soldBy"]
    });
    
    if (itemId) {
      sales = sales.filter((sale) =>
        sale.items.some((item) => item.itemId.toString() === itemId)
      );
    }
    return sales;
  }
}
