import { Router } from "express";
import { itemRequestController } from "../controllers/itemRequestController";
import {
  authenticateToken,
  authorizeRole,
  authorizeUser,
} from "../middleware/authMiddleware";

const router = Router();

// shopkeeper creates a request
router.post(
  "/",
  authenticateToken,
  authorizeUser,
  itemRequestController.createRequest
);

// list / query requests (admin/storekeeper/shopkeeper)
router.get("/", authenticateToken, itemRequestController.listRequests);
router.get("/:id", authenticateToken, itemRequestController.getRequest);

// edit request (only pending)
router.patch("/:id", authenticateToken, itemRequestController.updateRequest);

// approve (only ADMIN/STOREKEEPER) -> creates transfer
router.post(
  "/:id/approve",
  authenticateToken,
  authorizeRole(["ADMIN", "STOREKEEPER"]),
  itemRequestController.approveRequest
);

export default router;
