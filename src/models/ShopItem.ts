import { ShopItem as PrismaShopItem } from "../types/prisma";
import Shop from "./Shop";
import Item from "./Item";

export interface IShopItem {
  id: number;
  shop: Shop;
  item: Item;
  quantity: number;
}

// Export Prisma ShopItem type as default
export type ShopItem = PrismaShopItem;
export default ShopItem;
