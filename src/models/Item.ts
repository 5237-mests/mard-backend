import { Item as DatabaseItem } from "../types/database";

export interface IItem {
  id: number;
  name: string;
  code: string;
  unit: string;
  description?: string;
}

// Export database Item type as default
export type Item = DatabaseItem;
export default Item;
