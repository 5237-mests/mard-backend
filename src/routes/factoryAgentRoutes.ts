// routes/factoryAgentRoutes.ts
import { Router } from "express";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware";
import factoryAgentController from "../controllers/factoryAgentController";

const router = Router();

router.get("/shop_items/:shop_id/items", factoryAgentController.getShopStock);
router.post(
  "/requests/new-product",
  factoryAgentController.createNewProductRequest
);
router.post(
  "/requests/repurchase",
  factoryAgentController.createRepurchaseRequest
);
router.get("/requests", factoryAgentController.getRequests);

export default router;
