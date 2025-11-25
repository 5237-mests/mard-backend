import { Router } from "express";
import { refundController } from "../controllers/refundController";
import { authenticateToken, authorizeUser } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authenticateToken, refundController.createRefund);
router.post(
  "/from-sale",
  authenticateToken,
  authorizeUser,
  refundController.createRefundFromSaleId
);
router.get("/", authenticateToken, authorizeUser, refundController.listRefunds);
router.get("/:id", authenticateToken, refundController.getRefund);

export default router;
