import { Router } from "express";
import * as orderController from "../controllers/orderController";
import {
  authenticateToken,
  authorizeRole,
  authorizeUser,
} from "../middleware/authMiddleware";

const router = Router();

router.post("/me", authenticateToken, authorizeUser, orderController.create);

// get order by userid
router.get("/me", authenticateToken, authorizeUser, orderController.getByUser);

// get all orders for admin
router.get(
  "/all",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  orderController.getAllOrders
);
// router.get("/", authenticateToken, authorizeUser, orderController.getByUser);
router.put("/:orderId", orderController.updateDelivery);

router.get(
  "/:orderId",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  orderController.getById
);

// update order status
router.put(
  "/:orderId/:status",
  authenticateToken,
  orderController.updateStatus
);

// PUT /orders/:orderId/items/:itemId
router.put(
  "/:orderId/items/:itemId",
  authenticateToken,
  orderController.updateOrderItem
);

// refund order
// POST /orders/:orderId/refund
router.post(
  "/refund/:orderId",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  orderController.refundOrder
);

// DELETE /orders/:orderId/items/:itemId
router.delete(
  "/:orderId/items/:itemId",
  authenticateToken,
  orderController.removeOrderItem
);

// DELETE /orders/:orderId
router.delete("/:orderId", authenticateToken, orderController.deleteOrder);

// PATCH /orders/:id/status
router.patch(
  "/:orderId/:status",
  authenticateToken,
  authorizeUser,
  orderController.updateOrderStatus2
);

export default router;
