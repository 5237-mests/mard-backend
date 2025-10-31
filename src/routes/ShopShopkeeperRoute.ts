import { Router } from "express";
import { ShopShopkeeperController } from "../controllers/ShopShopkeeperController";

import { authenticateToken, authorizeRole } from "../middleware/authMiddleware";

const router = Router();

// Route to add a shopkeeper to a shop
router.post(
  "/shops/:shopId/shopkeepers/:userId",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  ShopShopkeeperController.addShopkeeperToShop
);

// Route to get all shopkeepers for a specific shop
router.get(
  "/shops/:shopId/shopkeepers",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  ShopShopkeeperController.getShopkeepersByShopId
);

// Route to get all shops for a specific shopkeeper
router.get(
  "/shopkeepers/:userId/shops",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  ShopShopkeeperController.getShopsByShopkeeperId
);

// Route to remove a shopkeeper from a shop
router.delete(
  "/shops/:shopId/shopkeepers/:userId",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  ShopShopkeeperController.removeShopkeeperFromShop
);

export default router;
