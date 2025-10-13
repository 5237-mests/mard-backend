"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentController_1 = require("../controllers/paymentController");
const router = express_1.default.Router();
router.post("/initiate", paymentController_1.initiatePayment);
router.get("/verify/:tx_ref", paymentController_1.verifyPayment);
// 🆕 webhook endpoint
router.post("/webhook", paymentController_1.handleWebhook);
exports.default = router;
