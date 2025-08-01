import { Sale as PrismaSale, ISaleItem } from "../types/prisma";
import Shop from "./Shop";
import User from "./user";
import Item from "./Item";

export { ISaleItem };

export interface ISale {
  id: number;
  shop: Shop;
  items: ISaleItem[];
  soldBy: User;
  soldAt: Date;
}

// Export Prisma Sale type as default
export type Sale = PrismaSale;
export default Sale;
