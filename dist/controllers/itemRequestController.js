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
exports.itemRequestController = void 0;
const itemRequestService_1 = require("../services/itemRequestService");
exports.itemRequestController = {
    createRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const user_id = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id;
                if (!user_id)
                    return res.status(401).json({ message: "Auth required" });
                const { shop_id, store_id, items } = req.body;
                if (!shop_id ||
                    !store_id ||
                    !Array.isArray(items) ||
                    items.length === 0) {
                    return res.status(400).json({ message: "Invalid payload." });
                }
                const result = yield itemRequestService_1.itemRequestService.createRequest({
                    shop_id: Number(shop_id),
                    store_id: Number(store_id),
                    items,
                    created_by: user_id,
                });
                res.status(201).json(result);
            }
            catch (err) {
                res.status(500).json({ message: err.message || "Server error" });
            }
        });
    },
    listRequests(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { status, shop_id, store_id, page, pageSize, search } = req.query;
                const opts = {
                    status: typeof status === "string" ? status : undefined,
                    shop_id: shop_id ? Number(shop_id) : undefined,
                    store_id: store_id ? Number(store_id) : undefined,
                    page: page ? Number(page) : 1,
                    pageSize: pageSize ? Number(pageSize) : 25,
                    search: typeof search === "string" ? search : undefined,
                };
                const data = yield itemRequestService_1.itemRequestService.getRequests(opts);
                res.json(data);
            }
            catch (err) {
                res.status(500).json({ message: err.message || "Server error" });
            }
        });
    },
    getRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(req.params.id);
                const data = yield itemRequestService_1.itemRequestService.getRequestById(id);
                res.json(data);
            }
            catch (err) {
                res.status(404).json({ message: err.message || "Not found" });
            }
        });
    },
    approveRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const user_id = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id;
                if (!user_id)
                    return res.status(401).json({ message: "Auth required" });
                const id = Number(req.params.id);
                const result = yield itemRequestService_1.itemRequestService.approveRequest(id, user_id);
                res.json({ message: "Approved", transferId: result.transferId });
            }
            catch (err) {
                res.status(400).json({ message: err.message || "Cannot approve" });
            }
        });
    },
    updateRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const user_id = Number((_c = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : 0);
                if (!user_id)
                    return res.status(401).json({ message: "Auth required" });
                const id = Number(req.params.id);
                const patch = req.body;
                const result = yield itemRequestService_1.itemRequestService.updateRequest(id, user_id, {
                    items: patch,
                    status: "approved",
                });
                // console.log("Result: ", result);
                res.json({ message: "Updated" });
            }
            catch (err) {
                res.status(400).json({ message: err.message || "Cannot update" });
            }
        });
    },
    // remove item from item request
    removeItemFromRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const user_id = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id;
                if (!user_id)
                    return res.status(401).json({ message: "Auth required" });
                const id = Number(req.params.id);
                const item_id = Number(req.params.item_id);
                yield itemRequestService_1.itemRequestService.removeRequestItem(id, item_id);
                res.json({ message: "Removed" });
            }
            catch (err) {
                res.status(400).json({ message: err.message || "Cannot remove" });
            }
        });
    },
    // reject item request
    rejectRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const user_id = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id;
                if (!user_id)
                    return res.status(401).json({ message: "Auth required" });
                const id = Number(req.params.id);
                yield itemRequestService_1.itemRequestService.rejectRequest(id, user_id);
                res.json({ message: "Rejected" });
            }
            catch (err) {
                res.status(400).json({ message: err.message || "Cannot reject" });
            }
        });
    },
};
