import { Request, Response } from "express";
import ShopItem from "../models/ShopItem";
import StoreItem from "../models/StoreItem";
import Shop from "../models/Shop";
import Store from "../models/Store";
const mongoose = require("mongoose");

export const getShopInventory = async (req: Request, res: Response) => {
  // Shopkeeper: view items in their own shop
  try {
    const shopkeeperId = req.user.id;
    const shop = await Shop.findOne({ shopkeeper: shopkeeperId });
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    const items = await ShopItem.find({ shopId: shop._id });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching shop inventory", error });
  }
};

export const getStoreInventory = async (req: Request, res: Response) => {
  // Storekeeper: view items in their assigned store
  try {
    const storekeeperId = req.user.id;
    const store = await Store.findOne({ storekeeper: storekeeperId });
    if (!store) return res.status(404).json({ message: "Store not found" });
    const items = await StoreItem.find({ storeId: store._id });
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
      const shopObjectId = mongoose.Types.ObjectId(shopId as string);
      const items = await ShopItem.find({ shopId: shopObjectId });
      return res.status(200).json(items);
    }
    if (storeId) {
      const storeObjectId = mongoose.Types.ObjectId(storeId as string);
      const items = await StoreItem.find({ storeId: storeObjectId });
      return res.status(200).json(items);
    }
    return res.status(400).json({ message: "Provide shopId or storeId" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching inventory", error });
  }
};
