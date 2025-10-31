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
            var _a;
            try {
                const user_id = Number((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.user.id);
                console.log("c. body", req.body);
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
                    user_id,
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
    getAllTransfers1(req, res) {
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
    getAllTransfers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // parse & validate query params
                const { status, fromType, fromDate, toDate, page = "1", pageSize = "25", search = "", } = req.query;
                const opts = {
                    status: typeof status === "string" && status ? status : undefined,
                    fromType: typeof fromType === "string" && fromType ? fromType : undefined,
                    fromDate: typeof fromDate === "string" && fromDate ? fromDate : undefined,
                    toDate: typeof toDate === "string" && toDate ? toDate : undefined,
                    search: typeof search === "string" && search ? search.trim() : undefined,
                    page: Math.max(1, Number(page) || 1),
                    pageSize: Math.max(1, Math.min(500, Number(pageSize) || 25)),
                };
                const result = yield itemTransferService_1.itemTransferService.getAllTransfers(opts);
                // result: { items, total }
                res.json(result);
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
    // transfer all item from shop to store
    transferAllShopItemToStore(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const user_id = Number((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.user.id);
                // Accept either params or body for ids to be flexible with routes
                const shopId = Number((_b = req.params.shopId) !== null && _b !== void 0 ? _b : req.body.shopId);
                const storeId = Number((_c = req.params.storeId) !== null && _c !== void 0 ? _c : req.body.storeId);
                if (!Number.isInteger(shopId) || !Number.isInteger(storeId)) {
                    res.status(400).json({
                        message: "shopId and storeId are required and must be integers.",
                    });
                    return;
                }
                const transferId = yield itemTransferService_1.itemTransferService.transferAllShopItemToStore(shopId, storeId, user_id);
                if (transferId === 0) {
                    // Nothing to transfer
                    res.status(200).json({ message: "No items to transfer." });
                    return;
                }
                res
                    .status(201)
                    .json({ message: "Transfer created successfully", id: transferId });
            }
            catch (error) {
                console.error("transferAllShopItemToStore error:", error);
                // Propagate not-found errors as 404
                if (error.message && /not found/i.test(error.message)) {
                    res.status(404).json({ message: error.message });
                    return;
                }
                res.status(500).json({ message: "Server error", error: error.message });
            }
        });
    },
};
