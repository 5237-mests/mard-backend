import { Sale as DatabaseSale, ISaleItem } from "../types/database";
import Shop from "./Shop";
import User from "./user";
import Item from "./Item";

export { ISaleItem };

export interface ISale {
  id: number;
  shopId: number;
  items: ISaleItem[];
  soldById: number;
  soldAt: Date;
}

// Export database Sale type as default
export type Sale = DatabaseSale;
export default Sale;
