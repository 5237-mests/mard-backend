// File: src/routes/ShopkeeperItemRoute.ts
// This file defines the API routes for shopkeeper items.
import { Router } from "express";
import { ShopkeeperItemController } from "../controllers/ShopkeeperItemController";

const router = Router();

// Route to get all items for a specific shopkeeper by their user ID.
router.get("/:userId/items", ShopkeeperItemController.getItemsByShopkeeperId);

export default router;
