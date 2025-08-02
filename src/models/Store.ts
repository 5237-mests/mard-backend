import { Store as DatabaseStore } from "../types/database";

export interface IStore {
  id: number;
  name: string;
  location: string;
  storekeeperId?: number;
}

// Export database Store type as default
export type Store = DatabaseStore;
export default Store;
