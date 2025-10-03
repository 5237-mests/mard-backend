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
  id?: number;
  name: string;
  code?: string;
  description?: string;
  model: string;
  price: number;
  brand_id: number;
  category_id: number | null;
  minimum_stock: number;
  image?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface Category {
  id: number;
  name: string;
  parent_id: number | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface Shop {
  id: number;
  name: string;
  location: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Store {
  id: number;
  name: string;
  location: string;
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
  total_distinct_items: number;
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

export interface SaleItemInput {
  itemId: number;
  quantitySold: number;
  price: number;
  serialNumber?: string;
}

export interface SaleRequestBody {
  shopId: string;
  soldById: number;
  customerName?: string;
  customerContact?: string;
  items: SaleItemInput[];
}

export interface ShopItem {
  item_id: number;
  quantity: number;
}

export interface SaleItemInput {
  itemId: number;
  quantitySold: number;
  price: number;
  serialNumber?: string;
}

export interface SaleRequestBody {
  shopId: string;
  soldById: number;
  customerName?: string;
  customerContact?: string;
  items: SaleItemInput[];
}

export interface ShopItem {
  item_id: number;
  quantity: number;
}

export interface SaleItem {
  item_id: number;
  name: string;
  model: string;
  quantity: number;
  price: number;
  item_serial_number: string | null;
}

// export interface Sale {
//   id: number;
//   shop_id: string;
//   sold_by_id: number;
//   total_amount: number;
//   customer_name: string | null;
//   customer_contact: string | null;
//   created_at: string;
//   items: SaleItem[];
// }

export interface OrderItem {
  item_id: number;
  quantity: number;
}

export interface Order {
  id: number;
  status: "pending" | "approved" | "shipped" | "delivered" | "rejected";
  delivery_details?: string;
  created_at: string;
  updated_at: string;
  items: { item_id: number; name: string; quantity: number; price: number }[];
}

export interface CreateOrderInput {
  items: OrderItem[];
  delivery_details?: string;
}

export interface NewProductRequest {
  name: string;
  category?: string;
  brand?: string;
  description?: string;
  supplier?: string;
}

export interface RepurchaseRequest {
  item_id: number;
  recommended_quantity: number;
  reason?: string;
}

export interface Request {
  id: number;
  type: "new_product" | "repurchase";
  status: "pending" | "reviewed" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  details:
    | NewProductRequest
    | {
        item_id: number;
        name: string;
        recommended_quantity: number;
        reason?: string;
      };
}

export interface RequestQuery {
  type?: "new_product" | "repurchase";
  status?: "pending" | "reviewed" | "approved" | "rejected";
}

export interface ItemQuery {
  search?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  available_only?: boolean;
  low_stock?: number;
}
