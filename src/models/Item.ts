import { Item as PrismaItem } from "../types/prisma";

export interface IItem {
  id: number;
  name: string;
  code: string;
  unit: string;
  description: string;
}

// Export Prisma Item type as default
export type Item = PrismaItem;
export default Item;
