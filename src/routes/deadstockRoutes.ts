import { Router } from "express";
import { deadstockController } from "../controllers/deadstockController";
import {
  authenticateToken,
  authorizeRole,
  authorizeUser,
} from "../middleware/authMiddleware";

const router = Router();

// report deadstock (authenticated)
router.post("/", authenticateToken, authorizeUser, deadstockController.report);

// list (authenticated+role)
router.get(
  "/",
  authenticateToken,
  authorizeRole(["ADMIN", "STOREKEEPER", "SHOPKEEPER"]),
  deadstockController.list
);

// get one
router.get(
  "/:id",
  authenticateToken,
  authorizeRole(["ADMIN", "STOREKEEPER", "SHOPKEEPER"]),
  deadstockController.getById
);

// resolve / discard
router.patch(
  "/:id/resolve",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  deadstockController.resolve
);

// delete (admin)
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  deadstockController.remove
);

export default router;
