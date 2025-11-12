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
exports.storeReceiveController = void 0;
const storeReceiveService_1 = require("../services/storeReceiveService");
/**
 * Controller for store receives.
 * Assumes auth middleware attaches user to req as (req as any).user
 */
class storeReceiveController {
    static createReceive(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { store_id, reference_no } = req.body;
                const userId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user.id) !== null && _b !== void 0 ? _b : null;
                if (!store_id)
                    return res.status(400).json({ message: "store_id is required" });
                const id = yield storeReceiveService_1.storeReceiveService.createReceive({
                    store_id: Number(store_id),
                    created_by_id: userId,
                    reference_no: reference_no !== null && reference_no !== void 0 ? reference_no : null,
                });
                res.status(201).json({ id });
            }
            catch (error) {
                res
                    .status(400)
                    .json({ message: error.message || "Failed to create receive" });
            }
        });
    }
    static addItems(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const receiveId = Number(req.params.id);
                const items = req.body.items;
                if (!Array.isArray(items) || items.length === 0) {
                    return res.status(400).json({ message: "items array is required" });
                }
                yield storeReceiveService_1.storeReceiveService.addItemsToReceive(receiveId, items);
                res.status(201).json({ success: true });
            }
            catch (error) {
                res.status(400).json({ message: error.message || "Failed to add items" });
            }
        });
    }
    static updateReceive(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const receiveId = Number(req.params.id);
                const updates = {
                    store_id: req.body.store_id !== undefined
                        ? Number(req.body.store_id)
                        : undefined,
                    reference_no: req.body.reference_no !== undefined
                        ? req.body.reference_no
                        : undefined,
                };
                yield storeReceiveService_1.storeReceiveService.updateReceive(receiveId, updates);
                res.json({ success: true });
            }
            catch (error) {
                res
                    .status(400)
                    .json({ message: error.message || "Failed to update receive" });
            }
        });
    }
    static updateReceiveItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const itemRowId = Number(req.params.itemId);
                const updates = {
                    quantity: req.body.quantity !== undefined
                        ? Number(req.body.quantity)
                        : undefined,
                    cost_price: req.body.cost_price !== undefined ? req.body.cost_price : undefined,
                    note: req.body.note !== undefined ? req.body.note : undefined,
                };
                yield storeReceiveService_1.storeReceiveService.updateReceiveItem(itemRowId, updates);
                res.json({ success: true });
            }
            catch (error) {
                res
                    .status(400)
                    .json({ message: error.message || "Failed to update receive item" });
            }
        });
    }
    static deleteReceiveItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const itemRowId = Number(req.params.itemId);
                yield storeReceiveService_1.storeReceiveService.deleteReceiveItem(itemRowId);
                res.status(204).send();
            }
            catch (error) {
                res
                    .status(400)
                    .json({ message: error.message || "Failed to delete receive item" });
            }
        });
    }
    static getReceiveById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const receiveId = Number(req.params.id);
                const row = yield storeReceiveService_1.storeReceiveService.getReceiveById(receiveId);
                res.json(row);
            }
            catch (error) {
                res.status(404).json({ message: error.message || "Receive not found" });
            }
        });
    }
    static listReceives(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const opts = {
                    status: req.query.status,
                    store_id: req.query.store_id ? Number(req.query.store_id) : undefined,
                    fromDate: req.query.fromDate,
                    toDate: req.query.toDate,
                    search: req.query.search,
                    page: req.query.page ? Number(req.query.page) : undefined,
                    pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
                };
                const result = yield storeReceiveService_1.storeReceiveService.listReceives(opts);
                res.json(result);
            }
            catch (error) {
                res
                    .status(500)
                    .json({ message: error.message || "Failed to list receives" });
            }
        });
    }
    static approveReceive(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const receiveId = Number(req.params.id);
                const userId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user.id) !== null && _b !== void 0 ? _b : null;
                const ok = yield storeReceiveService_1.storeReceiveService.approveReceive(receiveId, userId);
                res.json({ success: !!ok });
            }
            catch (error) {
                res
                    .status(400)
                    .json({ message: error.message || "Failed to approve receive" });
            }
        });
    }
    static rejectReceive(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const receiveId = Number(req.params.id);
                const userId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user.id) !== null && _b !== void 0 ? _b : null;
                const note = (_c = req.body.note) !== null && _c !== void 0 ? _c : null;
                const ok = yield storeReceiveService_1.storeReceiveService.rejectReceive(receiveId, userId, note);
                res.json({ success: !!ok });
            }
            catch (error) {
                res
                    .status(400)
                    .json({ message: error.message || "Failed to reject receive" });
            }
        });
    }
    static deleteReceive(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const receiveId = Number(req.params.id);
                yield storeReceiveService_1.storeReceiveService.deleteReceive(receiveId);
                res.status(204).send();
            }
            catch (error) {
                res
                    .status(400)
                    .json({ message: error.message || "Failed to delete receive" });
            }
        });
    }
}
exports.storeReceiveController = storeReceiveController;
