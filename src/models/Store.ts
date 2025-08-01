import { Store as PrismaStore } from "../types/prisma";
import User from "./user";

export interface IStore {
  id: number;
  name: string;
  location: string;
  storekeeper?: User;
}

// Export Prisma Store type as default
export type Store = PrismaStore;
export default Store;
