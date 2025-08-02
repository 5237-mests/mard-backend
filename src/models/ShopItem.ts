import { ShopItem as DatabaseShopItem } from "../types/database";

export interface IShopItem {
  id: number;
  shopId: number;
  itemId: number;
  quantity: number;
}

// Export database ShopItem type as default
export type ShopItem = DatabaseShopItem;
export default ShopItem;
