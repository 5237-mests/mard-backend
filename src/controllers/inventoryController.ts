import { Request, Response } from "express";
import { AppDataSource } from "../config/db";
import ShopItem from "../models/ShopItem";
import StoreItem from "../models/StoreItem";
import Shop from "../models/Shop";
import Store from "../models/Store";

export const getShopInventory = async (req: Request, res: Response) => {
  // Shopkeeper: view items in their own shop
  try {
    const shopkeeperId = req.user.id;
    const shopRepository = AppDataSource.getRepository(Shop);
    const shopItemRepository = AppDataSource.getRepository(ShopItem);
    
    const shop = await shopRepository.findOne({ 
      where: { shopkeeper: { id: shopkeeperId } },
      relations: ["shopkeeper"]
    });
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    
    const items = await shopItemRepository.find({ 
      where: { shop: { id: shop.id } },
      relations: ["shop", "item"]
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
    const storeRepository = AppDataSource.getRepository(Store);
    const storeItemRepository = AppDataSource.getRepository(StoreItem);
    
    const store = await storeRepository.findOne({ 
      where: { storekeeper: { id: storekeeperId } },
      relations: ["storekeeper"]
    });
    if (!store) return res.status(404).json({ message: "Store not found" });
    
    const items = await storeItemRepository.find({ 
      where: { store: { id: store.id } },
      relations: ["store", "item"]
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
    const shopItemRepository = AppDataSource.getRepository(ShopItem);
    const storeItemRepository = AppDataSource.getRepository(StoreItem);
    
    if (shopId) {
      const items = await shopItemRepository.find({ 
        where: { shop: { id: parseInt(shopId as string) } },
        relations: ["shop", "item"]
      });
      return res.status(200).json(items);
    }
    if (storeId) {
      const items = await storeItemRepository.find({ 
        where: { store: { id: parseInt(storeId as string) } },
        relations: ["store", "item"]
      });
      return res.status(200).json(items);
    }
    return res.status(400).json({ message: "Provide shopId or storeId" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching inventory", error });
  }
};
