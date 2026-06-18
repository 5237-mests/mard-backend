import { Router } from "express";
import * as orderController from "../controllers/orderController";
import {
  authenticateToken,
  authorizeRole,
  authorizeUser,
} from "../middleware/authMiddleware";
import multer from "multer";
import path from "path";
import fs from "fs/promises";

const router = Router();

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(
      process.env.HOME || "/home/mardtryj",
      "uploads/receipts",
    );
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      cb(err as Error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedExt = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/pdf" ||
      allowedExt.includes(ext)
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post(
  "/me",
  authenticateToken,
  authorizeUser,
  upload.single("payment_receipt"),
  orderController.create,
);

// get order by userid.
router.get("/me", authenticateToken, authorizeUser, orderController.getByUser);

// get all orders for admin
router.get(
  "/all",
  authenticateToken,
  authorizeRole(["ADMIN", "SHOPKEEPER"]),
  orderController.getAllOrders
);
// router.get("/", authenticateToken, authorizeUser, orderController.getByUser);
router.put("/:orderId", orderController.updateDelivery);

router.patch(
  "/:orderId/receipt",
  authenticateToken,
  authorizeUser,
  upload.single("payment_receipt"),
  orderController.updatePaymentReceipt,
);

// get order by order id.
router.get(
  "/:orderId",
  authenticateToken,
  authorizeUser,
  orderController.getById
);

// update order status
router.put(
  "/:orderId/:status",
  authenticateToken,
  authorizeRole(["ADMIN", "SHOPKEEPER"]),
  authorizeUser,
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
  authorizeRole(["ADMIN", "SHOPKEEPER"]),
  orderController.removeOrderItem
);

// DELETE /orders/:orderId
router.delete("/:orderId", authenticateToken, orderController.deleteOrder);

// PATCH /orders/:id/status
router.patch(
  "/:orderId/:status",
  authenticateToken,
  authorizeRole(["ADMIN", "SHOPKEEPER"]),
  authorizeUser,
  orderController.updateOrderStatus2
);

export default router;
