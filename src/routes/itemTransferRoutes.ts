import { Router } from "express";
import { itemTransferController } from "../controllers/itemTransferController";
import {
  authenticateToken,
  authorizeRole,
  authorizeUser,
} from "../middleware/authMiddleware";

const router = Router();

router.post(
  "/create_transfer",
  authenticateToken,
  authorizeUser,
  authorizeRole(["ADMIN", "STOREKEEPER"]),
  itemTransferController.createTransfer
);
router.get(
  "/",
  authenticateToken,
  authorizeRole(["ADMIN", "STOREKEEPER"]),
  itemTransferController.getAllTransfers
);
router.get("/:id", itemTransferController.getTransferById);

// transfer all item from shop to store.
router.post(
  "/shops/:shopId/stores/:storeId",
  authenticateToken,
  authorizeUser,
  authorizeRole(["ADMIN"]),
  itemTransferController.transferAllShopItemToStore
);

export default router;
