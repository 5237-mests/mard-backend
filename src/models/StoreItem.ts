import { StoreItem as PrismaStoreItem } from "../types/prisma";
import Store from "./Store";
import Item from "./Item";

export interface IStoreItem {
  id: number;
  store: Store;
  item: Item;
  quantity: number;
}

// Export Prisma StoreItem type as default
export type StoreItem = PrismaStoreItem;
export default StoreItem;
