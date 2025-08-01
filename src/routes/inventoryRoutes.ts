import { Router } from "express";
import {
  getShopInventory,
  getStoreInventory,
  getAnyInventory,
} from "../controllers/inventoryController";
import { hasRole } from "../middleware/authMiddleware";

const router = Router();

// Shopkeeper: view items in their own shop
router.get("/shop", hasRole("shopkeeper"), getShopInventory);

// Storekeeper: view items in their assigned store
router.get("/store", hasRole("storekeeper"), getStoreInventory);

// Admin: view any shop/store's inventory
router.get("/any", hasRole("admin"), getAnyInventory);

export default router;
