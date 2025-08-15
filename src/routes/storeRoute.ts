import { authenticateToken, authorizeRole } from "../middleware/authMiddleware";

import { Router } from "express";
import { StoreController } from "../controllers/storeController";

const router = Router();

// Route to create a new Store
router.post(
  "/",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  StoreController.createStore
);

// Route to get all Stores
router.get("/", authenticateToken, StoreController.getStores);

// Route to get a single Store by ID
router.get("/:id", authenticateToken, StoreController.getStoreById);

// Route to update a Store by ID
router.put(
  "/:id",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  StoreController.updateStore
);

// Route to delete a Store by ID
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  StoreController.deleteStore
);

export default router;
