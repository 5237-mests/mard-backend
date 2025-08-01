import { Request, Response } from "express";
import { AppDataSource } from "../config/db";
import { TransferService } from "../services/transferService";
import User from "../models/user";
import { sendEmail } from "../services/emailService";
import { sendNotification } from "../services/notificationService";

export const listTransferRequests = async (req: Request, res: Response) => {
  const transferService = new TransferService();
  const filter: any = {};
  // Filtering by status, from, to, requestedBy, etc. via query params
  if (req.query.status) filter.status = req.query.status;
  if (req.query.from) filter.from = req.query.from;
  if (req.query.to) filter.to = req.query.to;
  if (req.query.requestedBy) filter.requestedBy = req.query.requestedBy;
  try {
    const transfers = await transferService.listTransferRequests(filter);
    res.status(200).json(transfers);
  } catch (error) {
    res.status(500).json({ message: "Error listing transfer requests", error });
  }
};

export const adminTransfer = async (req: Request, res: Response) => {
  const adminId = req.user.id;
  const { fromId, toId, items } = req.body;
  const transferService = new TransferService();
  try {
    const transfer = await transferService.adminTransfer(
      parseInt(fromId),
      parseInt(toId),
      items,
      adminId
    );
    // Email and in-app notification to receiver
    const userRepository = AppDataSource.getRepository(User);
    const receiver = await userRepository.findOne({ where: { id: parseInt(toId) } });
    const message = `Transfer from ${fromId} to you has been completed. Items: ${JSON.stringify(
      items
    )}`;
    if (receiver && receiver.email) {
      await sendEmail(
        receiver.email,
        "You have received a stock transfer",
        message
      );
    }
    if (receiver) {
      await sendNotification(receiver.id.toString(), message);
    }
    res
      .status(201)
      .json({ message: "Transfer completed and approved", transfer });
  } catch (error) {
    res.status(500).json({ message: "Error performing transfer", error });
  }
};

export const requestStockTransfer = async (req: Request, res: Response) => {
  const shopId = req.user.id;
  const { toId, items } = req.body; // toId can be a store or shop
  const transferService = new TransferService();
  try {
    const transfer = await transferService.createTransferRequest(
      shopId,
      parseInt(toId),
      items,
      shopId
    );
    res.status(201).json({ message: "Transfer request created", transfer });
  } catch (error) {
    res.status(500).json({ message: "Error creating transfer request", error });
  }
};

export const rejectTransferRequest = async (req: Request, res: Response) => {
  const rejectorId = req.user.id;
  const { requestId } = req.body;
  const transferService = new TransferService();
  try {
    const transfer = await transferService.rejectTransferRequest(
      parseInt(requestId),
      rejectorId
    );
    if (!transfer) {
      return res.status(404).json({ message: "Transfer request not found" });
    }
    res.status(200).json({ message: "Transfer request rejected", transfer });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error rejecting transfer request", error });
  }
};

export const approveTransferRequest = async (req: Request, res: Response) => {
  const approverId = req.user.id;
  const { requestId } = req.body;
  const transferService = new TransferService();
  try {
    const transfer = await transferService.approveTransferRequest(
      parseInt(requestId),
      approverId
    );
    if (!transfer) {
      return res.status(404).json({ message: "Transfer request not found" });
    }
    res.status(200).json({ message: "Transfer request approved", transfer });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error approving transfer request", error });
  }
};
