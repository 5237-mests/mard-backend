import { Request, Response } from "express";
import axios from "axios";
import { SalesService } from "../services/salesService";
import { SaleRequestBody } from "../types/database";
import dotenv from "dotenv";

dotenv.config();

const VITE_BASE_URL = process.env.VITE_BASE_URL as string;

export class SalesPaymentController {
  static async paySale(req: Request, res: Response) {
    const { shopId, soldById, customerName, customerContact, email, items } =
      req.body as SaleRequestBody;

    if (!shopId || !soldById || !items || items.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Step 1️⃣: Create pending sale
      const tx_ref = `mard-${Date.now()}`;
      const sale = await SalesService.processSale(
        shopId,
        soldById,
        customerName || null,
        customerContact || null,
        items,
        "pending",
        tx_ref
      );

      // Step 2️⃣: Compute total amount
      const totalAmount = items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantitySold,
        0
      );

      // split first_name and last_name from customerName
      const [first_name, last_name] = (customerName || "").split(" ");

      // Step 3️⃣: Call your /api/payment/initiate endpoint
      const paymentInit = await axios.post(
        `${VITE_BASE_URL}/api/payment/initiate`,
        {
          amount: totalAmount,
          email: email || "msfnw@gmail.com",
          phone_number: customerContact,
          first_name: first_name || "",
          last_name: last_name || "",
          tx_ref,
        }
      );

      const checkoutUrl = paymentInit.data.data;

      // Step 5️⃣: Return checkout URL
      res.status(201).json({
        saleId: sale,
        checkoutUrl,
        message: "Payment initiated. Awaiting user authorization.",
      });
    } catch (error: any) {
      console.error("Error initiating online sale:", error);
      res.status(500).json({
        error:
          error.response?.data?.message ||
          "Failed to initiate payment for sale",
      });
    }
  }
}
