import express from "express";
import {
  getShopInventory,
  getStoreInventory,
  getAnyInventory,
} from "../controllers/inventoryController";
import { authorizeRole } from "../middleware/authMiddleware";

const router = express.Router();

// Route for shopkeeper to view their shop's inventory
router.get("/shop", authorizeRole(["SHOPKEEPER"]), getShopInventory);

// Route for storekeeper to view their store's inventory
router.get("/store", authorizeRole(["STOREKEEPER"]), getStoreInventory);

// Route for admin to view any shop/store's inventory
router.get("/any", authorizeRole(["ADMIN"]), getAnyInventory);

export default router;
