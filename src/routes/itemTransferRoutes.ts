import { Router } from "express";
import { itemTransferController } from "../controllers/itemTransferController";

const router = Router();

router.post("/", itemTransferController.createTransfer);
router.get("/", itemTransferController.getAllTransfers);
router.get("/:id", itemTransferController.getTransferById);

export default router;
