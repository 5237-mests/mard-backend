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
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemTransferController = void 0;
const itemTransferService_1 = require("../services/itemTransferService");
exports.itemTransferController = {
    createTransfer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fromType, fromId, toType, toId, items } = req.body;
                if (!fromType || !fromId || !toType || !toId || !(items === null || items === void 0 ? void 0 : items.length)) {
                    res.status(400).json({ message: "Invalid transfer data" });
                    return;
                }
                const transferId = yield itemTransferService_1.itemTransferService.createTransfer({
                    fromType,
                    fromId: Number(fromId),
                    toType,
                    toId: Number(toId),
                    items,
                });
                res
                    .status(201)
                    .json({ message: "Transfer created successfully", id: transferId });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ message: "Server error", error: error.message });
            }
        });
    },
    getAllTransfers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transfers = yield itemTransferService_1.itemTransferService.getAllTransfers();
                res.json(transfers);
            }
            catch (error) {
                res.status(500).json({ message: "Server error", error: error.message });
            }
        });
    },
    getTransferById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(req.params.id);
                const transfer = yield itemTransferService_1.itemTransferService.getTransferById(id);
                res.json(transfer);
            }
            catch (error) {
                res.status(404).json({ message: error.message });
            }
        });
    },
};
