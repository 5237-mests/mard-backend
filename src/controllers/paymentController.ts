import { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";
import { SalesService } from "../services/salesService";

dotenv.config();

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY as string;
const CHAPA_API = "https://api.chapa.co/v1";

export const initiatePayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { amount, email, first_name, last_name, tx_ref, phone_number } =
      req.body;

    if (!amount || !email || !tx_ref) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const response = await axios.post(
      `${CHAPA_API}/transaction/initialize`,
      {
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
      },
      {
        headers: {
          Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
        },
      }
    );

    res.json(response.data);
  } catch (err: any) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Payment initiation failed" });
  }
};

export const verifyPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { tx_ref } = req.params;

  try {
    const response = await axios.get(
      `${CHAPA_API}/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
        },
      }
    );

    const data = response.data;

    if (data.status === "success" && data.data.status === "success") {
      // TODO: Update order in DB
      await SalesService.updateSaleStatus(tx_ref, "completed");
    } else {
      console.log("❌ Payment failed or not completed:", data.data);
    }
    res.json(data);
  } catch (err: any) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Payment verification failed" });
  }
};

// ------------------- WEBHOOK HANDLER -------------------
export const handleWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const webhookData = req.body;

    const { tx_ref } = webhookData;

    // Step 1: Confirm with Chapa
    const verifyRes = await axios.get(
      `${CHAPA_API}/transaction/verify/${tx_ref}`,
      {
        headers: { Authorization: `Bearer ${CHAPA_SECRET_KEY}` },
      }
    );

    const verification = verifyRes.data;

    if (
      verification.status === "success" &&
      verification.data.status === "success"
    ) {
      // Step 2: Update your order record in DB here
      // Example:
      // await prisma.order.update({
      //   where: { tx_ref },
      //   data: { status: "paid" },
      // });

      res.status(200).json({ message: "Payment verified and recorded" });
    } else {
      res.status(400).json({ message: "Payment verification failed" });
    }
  } catch (err: any) {
    console.error("Webhook error:", err.response?.data || err.message);
    res.status(500).json({ error: "Error processing webhook" });
  }
};
