import { Router } from "express";
import * as cartController from "../controllers/cartController";
import { authenticateToken, authorizeUser } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authenticateToken, authorizeUser, cartController.addItem);
router.get("/", authenticateToken, authorizeUser, cartController.getCart);

router.put("/", authenticateToken, authorizeUser, cartController.updateItem);

// remove item from cart
router.delete(
  "/:itemId",
  authenticateToken,
  authorizeUser,
  cartController.removeItem
);

// clear carts
router.delete("/", authenticateToken, authorizeUser, cartController.clearCart);

router.post(
  "/increment/:item_id",
  authenticateToken,
  authorizeUser,
  cartController.incrementItem
);
router.post(
  "/decrement/:item_id",
  authenticateToken,
  authorizeUser,
  cartController.decrementItem
);

export default router;
