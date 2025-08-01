import { Shop as PrismaShop } from "../types/prisma";
import User from "./user";

export interface IShop {
  id: number;
  name: string;
  location: string;
  shopkeeper?: User;
}

// Export Prisma Shop type as default
export type Shop = PrismaShop;
export default Shop;
