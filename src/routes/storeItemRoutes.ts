// File: src/routes/storeItemRoute.ts
// This file defines the API routes for store_items.
import { Router } from "express";
// import { storeItemController } from "../controllers/storeItemController";
import { storeItemController } from "../controllers/storeItemController";

const router = Router();

// Route to get all store items
router.get("/", storeItemController.getAllstoreItems);

// Route to get all items for a specific store
router.get("/:storeId/items", storeItemController.getItemsBystoreId);

// Route to get a specific item by store ID and item ID
router.get(
  "/:storeId/items/:itemId",
  storeItemController.getItemsBystoreIdAndItemId
);

// Route to get all items for a specific item
router.get("/items/:itemId", storeItemController.getItemsByItemId);

// Route to add a new item to a store or update its quantity
router.post("/:storeId/items/:itemId", storeItemController.addstoreItem);

// Route to update the quantity of a specific item in a specific store
router.put(
  "/:storeId/items/:itemId",
  storeItemController.updatestoreItemQuantity
);

// Route to delete a specific item from a specific store
router.delete("/:storeId/items/:itemId", storeItemController.deletestoreItem);

// Route to add multiple items to a store
router.post("/:storeId/items", storeItemController.addMultiplestoreItems);

export default router;
