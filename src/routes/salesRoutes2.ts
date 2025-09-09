import { Router } from "express";
import * as salesController from "../controllers/salesController2";

const router = Router();

// GET /sales
router.get("/", salesController.getAllSales);

// GET /sales/:id
router.get("/:id", salesController.getSaleById);

// PATCH /sales/:id
router.patch("/:id", salesController.updateSale);

// DELETE /sales/:id
router.delete("/:id", salesController.deleteSale);

export default router;
