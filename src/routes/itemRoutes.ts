import express from "express";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware";
import itemController from "../controllers/itemController";

const router = express.Router();

router.get(
  "/all",
  authenticateToken,
  itemController.getAllItems.bind(itemController)
);

router.get(
  "/:id",
  authenticateToken,
  itemController.getItemById.bind(itemController)
);

router.post(
  "/create",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  itemController.createItem.bind(itemController)
);

router.put(
  "/update/:id",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  itemController.updateItem.bind(itemController)
);

router.delete(
  "/delete/:id",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  itemController.deleteItem.bind(itemController)
);
export default router;
