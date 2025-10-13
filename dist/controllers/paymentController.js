"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWebhook = exports.verifyPayment = exports.initiatePayment = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const salesService_1 = require("../services/salesService");
dotenv_1.default.config();
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;
const CHAPA_API = "https://api.chapa.co/v1";
const initiatePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { amount, email, first_name, last_name, tx_ref, phone_number } = req.body;
        if (!amount || !email || !tx_ref) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }
        const response = yield axios_1.default.post(`${CHAPA_API}/transaction/initialize`, {
            amount,
            currency: "ETB",
            email,
            first_name,
            last_name,
            phone_number,
            tx_ref,
            callback_url: `${process.env.VITE_BASE_URL}/api/payment/verify/${tx_ref}`,
            // return_url: "https://www.google.com/",
            customization: {
                title: "Mard Trading",
                description: "Payment initiated by mard",
            },
        }, {
            headers: {
                Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
            },
        });
        res.json(response.data);
    }
    catch (err) {
        console.error(((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || err.message);
        res.status(500).json({ error: "Payment initiation failed" });
    }
});
exports.initiatePayment = initiatePayment;
const verifyPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { tx_ref } = req.params;
    try {
        const response = yield axios_1.default.get(`${CHAPA_API}/transaction/verify/${tx_ref}`, {
            headers: {
                Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
            },
        });
        const data = response.data;
        if (data.status === "success" && data.data.status === "success") {
            // TODO: Update order in DB
            yield salesService_1.SalesService.updateSaleStatus(tx_ref, "completed");
        }
        else {
            console.log("❌ Payment failed or not completed:", data.data);
        }
        res.json(data);
    }
    catch (err) {
        console.error(((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || err.message);
        res.status(500).json({ error: "Payment verification failed" });
    }
});
exports.verifyPayment = verifyPayment;
// ------------------- WEBHOOK HANDLER -------------------
const handleWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const webhookData = req.body;
        const { tx_ref } = webhookData;
        // Step 1: Confirm with Chapa
        const verifyRes = yield axios_1.default.get(`${CHAPA_API}/transaction/verify/${tx_ref}`, {
            headers: { Authorization: `Bearer ${CHAPA_SECRET_KEY}` },
        });
        const verification = verifyRes.data;
        if (verification.status === "success" &&
            verification.data.status === "success") {
            // Step 2: Update your order record in DB here
            // Example:
            // await prisma.order.update({
            //   where: { tx_ref },
            //   data: { status: "paid" },
            // });
            res.status(200).json({ message: "Payment verified and recorded" });
        }
        else {
            res.status(400).json({ message: "Payment verification failed" });
        }
    }
    catch (err) {
        console.error("Webhook error:", ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || err.message);
        res.status(500).json({ error: "Error processing webhook" });
    }
});
exports.handleWebhook = handleWebhook;
