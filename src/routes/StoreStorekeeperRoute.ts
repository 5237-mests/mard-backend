import { Router } from "express";
// import { storestorekeeperController } from "../controllers/storestorekeeperController";
import { storestorekeeperController } from "../controllers/StoreStorekeeperController";

import { authenticateToken, authorizeRole } from "../middleware/authMiddleware";

const router = Router();

// Route to add a storekeeper to a store
router.post(
  "/stores/:storeId/storekeepers/:userId",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  storestorekeeperController.addstorekeeperTostore
);

// Route to get all storekeepers for a specific store
router.get(
  "/stores/:storeId/storekeepers",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  storestorekeeperController.getstorekeepersBystoreId
);

// Route to get all stores for a specific storekeeper
router.get(
  "/storekeepers/:userId/stores",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  storestorekeeperController.getstoresBystorekeeperId
);

// Route to remove a storekeeper from a store
router.delete(
  "/stores/:storeId/storekeepers/:userId",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  storestorekeeperController.removestorekeeperFromstore
);

export default router;
