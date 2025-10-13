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
exports.SalesPaymentController = void 0;
const axios_1 = __importDefault(require("axios"));
const salesService_1 = require("../services/salesService");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const VITE_BASE_URL = process.env.VITE_BASE_URL;
class SalesPaymentController {
    static paySale(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { shopId, soldById, customerName, customerContact, email, items } = req.body;
            if (!shopId || !soldById || !items || items.length === 0) {
                return res.status(400).json({ error: "Missing required fields" });
            }
            try {
                // Step 1️⃣: Create pending sale
                const tx_ref = `mard-${Date.now()}`;
                const sale = yield salesService_1.SalesService.processSale(shopId, soldById, customerName || null, customerContact || null, items, "pending", tx_ref);
                // Step 2️⃣: Compute total amount
                const totalAmount = items.reduce((sum, item) => sum + Number(item.price) * item.quantitySold, 0);
                // split first_name and last_name from customerName
                const [first_name, last_name] = (customerName || "").split(" ");
                // Step 3️⃣: Call your /api/payment/initiate endpoint
                const paymentInit = yield axios_1.default.post(`${VITE_BASE_URL}/api/payment/initiate`, {
                    amount: totalAmount,
                    email: email || "msfnw@gmail.com",
                    phone_number: customerContact,
                    first_name: first_name || "",
                    last_name: last_name || "",
                    tx_ref,
                });
                const checkoutUrl = paymentInit.data.data;
                // Step 5️⃣: Return checkout URL
                res.status(201).json({
                    saleId: sale,
                    checkoutUrl,
                    message: "Payment initiated. Awaiting user authorization.",
                });
            }
            catch (error) {
                console.error("Error initiating online sale:", error);
                res.status(500).json({
                    error: ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                        "Failed to initiate payment for sale",
                });
            }
        });
    }
}
exports.SalesPaymentController = SalesPaymentController;
