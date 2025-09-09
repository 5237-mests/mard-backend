import { Router } from "express";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware";
import adminService from "../services/adminService";

const router = Router();

router.post(
  "/approve-order",
  authenticateToken,
  //   checkRole(["admin", "storekeeper"]),
  async (req, res) => {
    const { order_id, status } = req.body;
    try {
      const result = await adminService.updateOrderStatus(order_id, status);
      res.json(result);
    } catch (error: any) {
      res
        .status(400)
        .json({ error: error.message || "Failed to update order" });
    }
  }
);

export default router;
