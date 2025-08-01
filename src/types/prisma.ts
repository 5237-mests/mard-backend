import { Prisma } from "@prisma/client";

// User types
export type User = Prisma.UserGetPayload<{}>;
export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    managedShops: true;
    managedStores: true;
    sales: true;
    transferRequests: true;
    approvedTransfers: true;
    notifications: true;
  };
}>;

// Item types
export type Item = Prisma.ItemGetPayload<{}>;
export type ItemWithRelations = Prisma.ItemGetPayload<{
  include: {
    shopItems: true;
    storeItems: true;
  };
}>;

// Shop types
export type Shop = Prisma.ShopGetPayload<{}>;
export type ShopWithRelations = Prisma.ShopGetPayload<{
  include: {
    shopkeeper: true;
    items: {
      include: {
        item: true;
      };
    };
    sales: true;
  };
}>;

// Store types
export type Store = Prisma.StoreGetPayload<{}>;
export type StoreWithRelations = Prisma.StoreGetPayload<{
  include: {
    storekeeper: true;
    items: {
      include: {
        item: true;
      };
    };
  };
}>;

// ShopItem types
export type ShopItem = Prisma.ShopItemGetPayload<{}>;
export type ShopItemWithRelations = Prisma.ShopItemGetPayload<{
  include: {
    shop: true;
    item: true;
  };
}>;

// StoreItem types
export type StoreItem = Prisma.StoreItemGetPayload<{}>;
export type StoreItemWithRelations = Prisma.StoreItemGetPayload<{
  include: {
    store: true;
    item: true;
  };
}>;

// Sale types
export type Sale = Prisma.SaleGetPayload<{}>;
export type SaleWithRelations = Prisma.SaleGetPayload<{
  include: {
    shop: true;
    soldBy: true;
  };
}>;

// TransferRequest types
export type TransferRequest = Prisma.TransferRequestGetPayload<{}>;
export type TransferRequestWithRelations = Prisma.TransferRequestGetPayload<{
  include: {
    requestedBy: true;
    approvedBy: true;
  };
}>;

// Notification types
export type Notification = Prisma.NotificationGetPayload<{}>;
export type NotificationWithRelations = Prisma.NotificationGetPayload<{
  include: {
    user: true;
  };
}>;

// Additional interfaces for compatibility
export interface ISaleItem {
  itemId: number;
  quantitySold: number;
}

export interface ITransferItem {
  itemId: number;
  quantity: number;
}

// Enums
export { Role, TransferRequestStatus } from "@prisma/client";