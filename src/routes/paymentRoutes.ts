import express from "express";
import {
  initiatePayment,
  verifyPayment,
  handleWebhook,
} from "../controllers/paymentController";

const router = express.Router();

router.post("/initiate", initiatePayment);
router.get("/verify/:tx_ref", verifyPayment);
// 🆕 webhook endpoint
router.post("/webhook", handleWebhook);

export default router;
