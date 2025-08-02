import { StoreItem as DatabaseStoreItem } from "../types/database";

export interface IStoreItem {
  id: number;
  storeId: number;
  itemId: number;
  quantity: number;
}

// Export database StoreItem type as default
export type StoreItem = DatabaseStoreItem;
export default StoreItem;
