import { Request, Response } from "express";
import { prisma } from "../config/db";

export const getShopInventory = async (req: Request, res: Response) => {
  // Shopkeeper: view items in their own shop
  try {
    const shopkeeperId = req.user.id;
    
    const shop = await prisma.shop.findFirst({ 
      where: { shopkeeperId: shopkeeperId },
      include: { shopkeeper: true }
    });
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    
    const items = await prisma.shopItem.findMany({ 
      where: { shopId: shop.id },
      include: {
        shop: true,
        item: true,
      }
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching shop inventory", error });
  }
};

export const getStoreInventory = async (req: Request, res: Response) => {
  // Storekeeper: view items in their assigned store
  try {
    const storekeeperId = req.user.id;
    
    const store = await prisma.store.findFirst({ 
      where: { storekeeperId: storekeeperId },
      include: { storekeeper: true }
    });
    if (!store) return res.status(404).json({ message: "Store not found" });
    
    const items = await prisma.storeItem.findMany({ 
      where: { storeId: store.id },
      include: {
        store: true,
        item: true,
      }
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching store inventory", error });
  }
};

export const getAnyInventory = async (req: Request, res: Response) => {
  // Admin: view any shop/store's inventory
  try {
    const { shopId, storeId } = req.query;
    
    if (shopId) {
      const items = await prisma.shopItem.findMany({ 
        where: { shopId: parseInt(shopId as string) },
        include: {
          shop: true,
          item: true,
        }
      });
      return res.status(200).json(items);
    }
    if (storeId) {
      const items = await prisma.storeItem.findMany({ 
        where: { storeId: parseInt(storeId as string) },
        include: {
          store: true,
          item: true,
        }
      });
      return res.status(200).json(items);
    }
    return res.status(400).json({ message: "Provide shopId or storeId" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching inventory", error });
  }
};
