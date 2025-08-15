import { authenticateToken, authorizeRole } from "../middleware/authMiddleware";
// import { processSale, getSales } from "../controllers/shopController";

import { Router } from "express";
import { ShopController } from "../controllers/shopController";

const router = Router();

// Route to create a new shop
router.post(
  "/",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  ShopController.createShop
);

// Route to get all shops
router.get("/", authenticateToken, ShopController.getShops);

// Route to get a single shop by ID
router.get("/:id", authenticateToken, ShopController.getShopById);

// Route to update a shop by ID
router.put(
  "/:id",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  ShopController.updateShop
);

// Route to delete a shop by ID
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  ShopController.deleteShop
);

// Route to process a sale (only shopkeeper or admin can do this)
// router.post(
//   "/sale",
//   authenticateToken,
//   authorizeRole(["SHOPKEEPER", "ADMIN"]),
//   processSale
// );

// Route to get sales data (only admin can do this)
// router.get("/sales", authenticateToken, authorizeRole(["ADMIN"]), getSales);

export default router;
