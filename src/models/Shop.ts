import { Shop as DatabaseShop } from "../types/database";

export interface IShop {
  id: number;
  name: string;
  location: string;
  shopkeeperId?: number;
}

// Export database Shop type as default
export type Shop = DatabaseShop;
export default Shop;
