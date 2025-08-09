// Manual type definitions for database entities
// These replace the previous Prisma-generated types

// Enums
export enum Role {
  ADMIN = "ADMIN",
  SHOPKEEPER = "SHOPKEEPER",
  STOREKEEPER = "STOREKEEPER",
  USER = "USER",
}

export enum TransferRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

// Base interfaces matching database tables
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  isVerified: boolean;
  verificationToken: string | null;
  created_at?: Date;
  updated_at?: Date;
}

// Brand interface
export interface Brand {
  id: number;
  name: string;
  slug: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Item {
  id: number;
  name: string;
  code: string;
  unit: string;
  description: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface Shop {
  id: number;
  name: string;
  location: string;
  shopkeeperId: number | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface Store {
  id: number;
  name: string;
  location: string;
  storekeeperId: number | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface ShopItem {
  id: number;
  shopId: number;
  itemId: number;
  quantity: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface StoreItem {
  id: number;
  storeId: number;
  itemId: number;
  quantity: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface Sale {
  id: number;
  shopId: number;
  items: any; // JSON field
  soldById: number;
  soldAt: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface TransferRequest {
  id: number;
  from: number;
  to: number;
  items: any; // JSON field
  status: TransferRequestStatus;
  requestedById: number;
  approvedById: number | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface Notification {
  id: number;
  userId: number;
  message: string;
  read: boolean;
  createdAt: Date;
  created_at?: Date;
  updated_at?: Date;
}

// Types with relations for complex queries
export interface UserWithRelations extends User {
  managedShops?: Shop[];
  managedStores?: Store[];
  sales?: Sale[];
  transferRequests?: TransferRequest[];
  approvedTransfers?: TransferRequest[];
  notifications?: Notification[];
}

export interface ItemWithRelations extends Item {
  shopItems?: ShopItemWithRelations[];
  storeItems?: StoreItemWithRelations[];
}

export interface ShopWithRelations extends Shop {
  shopkeeper?: User;
  items?: ShopItemWithRelations[];
  sales?: Sale[];
}

export interface StoreWithRelations extends Store {
  storekeeper?: User;
  items?: StoreItemWithRelations[];
}

export interface ShopItemWithRelations extends ShopItem {
  shop?: Shop;
  item?: Item;
}

export interface StoreItemWithRelations extends StoreItem {
  store?: Store;
  item?: Item;
}

export interface SaleWithRelations extends Sale {
  shop?: Shop;
  soldBy?: User;
}

export interface TransferRequestWithRelations extends TransferRequest {
  requestedBy?: User;
  approvedBy?: User | null;
}

export interface NotificationWithRelations extends Notification {
  user?: User;
}

// Additional interfaces for compatibility
export interface ISaleItem {
  itemId: number;
  quantitySold: number;
}

export interface ITransferItem {
  itemId: number;
  quantity: number;
}
