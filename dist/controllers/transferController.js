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
exports.approveTransferRequest = exports.rejectTransferRequest = exports.requestStockTransfer = exports.adminTransfer = exports.listTransferRequests = void 0;
const db_1 = require("../config/db");
const transferService_1 = require("../services/transferService");
const user_1 = __importDefault(require("../models/user"));
const emailService_1 = require("../services/emailService");
const notificationService_1 = require("../services/notificationService");
const listTransferRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transferService = new transferService_1.TransferService();
    const filter = {};
    // Filtering by status, from, to, requestedBy, etc. via query params
    if (req.query.status)
        filter.status = req.query.status;
    if (req.query.from)
        filter.from = req.query.from;
    if (req.query.to)
        filter.to = req.query.to;
    if (req.query.requestedBy)
        filter.requestedBy = req.query.requestedBy;
    try {
        const transfers = yield transferService.listTransferRequests(filter);
        res.status(200).json(transfers);
    }
    catch (error) {
        res.status(500).json({ message: "Error listing transfer requests", error });
    }
});
exports.listTransferRequests = listTransferRequests;
const adminTransfer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const adminId = req.user.id;
    const { fromId, toId, items } = req.body;
    const transferService = new transferService_1.TransferService();
    try {
        const transfer = yield transferService.adminTransfer(parseInt(fromId), parseInt(toId), items, adminId);
        // Email and in-app notification to receiver
        const userRepository = db_1.AppDataSource.getRepository(user_1.default);
        const receiver = yield userRepository.findOne({ where: { id: parseInt(toId) } });
        const message = `Transfer from ${fromId} to you has been completed. Items: ${JSON.stringify(items)}`;
        if (receiver && receiver.email) {
            yield (0, emailService_1.sendEmail)(receiver.email, "You have received a stock transfer", message);
        }
        if (receiver) {
            yield (0, notificationService_1.sendNotification)(receiver.id.toString(), message);
        }
        res
            .status(201)
            .json({ message: "Transfer completed and approved", transfer });
    }
    catch (error) {
        res.status(500).json({ message: "Error performing transfer", error });
    }
});
exports.adminTransfer = adminTransfer;
const requestStockTransfer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const shopId = req.user.id;
    const { toId, items } = req.body; // toId can be a store or shop
    const transferService = new transferService_1.TransferService();
    try {
        const transfer = yield transferService.createTransferRequest(shopId, parseInt(toId), items, shopId);
        res.status(201).json({ message: "Transfer request created", transfer });
    }
    catch (error) {
        res.status(500).json({ message: "Error creating transfer request", error });
    }
});
exports.requestStockTransfer = requestStockTransfer;
const rejectTransferRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const rejectorId = req.user.id;
    const { requestId } = req.body;
    const transferService = new transferService_1.TransferService();
    try {
        const transfer = yield transferService.rejectTransferRequest(parseInt(requestId), rejectorId);
        if (!transfer) {
            return res.status(404).json({ message: "Transfer request not found" });
        }
        res.status(200).json({ message: "Transfer request rejected", transfer });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error rejecting transfer request", error });
    }
});
exports.rejectTransferRequest = rejectTransferRequest;
const approveTransferRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const approverId = req.user.id;
    const { requestId } = req.body;
    const transferService = new transferService_1.TransferService();
    try {
        const transfer = yield transferService.approveTransferRequest(parseInt(requestId), approverId);
        if (!transfer) {
            return res.status(404).json({ message: "Transfer request not found" });
        }
        res.status(200).json({ message: "Transfer request approved", transfer });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error approving transfer request", error });
    }
});
exports.approveTransferRequest = approveTransferRequest;
