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
// Expect authenticated req.user to exist; use your auth middleware
exports.itemRequestController = {
    // POST /api/item-requests
    createRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const user_id = Number((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user.id) !== null && _b !== void 0 ? _b : 0);
                if (!user_id)
                    return res.status(401).json({ message: "Auth required" });
                // payload expected:
                // { items: [{ item_id, quantity }...], notes, source_type, source_id, destination_type, destination_id }
                const { items, notes, source_type, source_id, destination_type, destination_id, } = req.body;
                if (!Array.isArray(items) || items.length === 0)
                    return res.status(400).json({ message: "items required" });
                if (!source_type || !destination_type)
                    return res
                        .status(400)
                        .json({ message: "source and destination required" });
                const result = yield itemRequestService_1.itemRequestService.createRequest({
                    source_type,
                    source_id: Number(source_id),
                    destination_type,
                    destination_id: Number(destination_id),
                    notes: notes !== null && notes !== void 0 ? notes : null,
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
    // GET /api/item-requests?status=...&source_type=...&source_id=...&page=...
    listRequests(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { status, source_type, source_id, destination_type, destination_id, page = "1", pageSize = "25", search, } = req.query;
                const opts = {
                    status: typeof status === "string" && status ? status : undefined,
                    source_type: typeof source_type === "string" && source_type
                        ? source_type
                        : undefined,
                    source_id: source_id ? Number(source_id) : undefined,
                    destination_type: typeof destination_type === "string" && destination_type
                        ? destination_type
                        : undefined,
                    destination_id: destination_id ? Number(destination_id) : undefined,
                    page: Math.max(1, Number(page) || 1),
                    pageSize: Math.max(1, Number(pageSize) || 25),
                    search: typeof search === "string" && search ? search.trim() : undefined,
                };
                const data = yield itemRequestService_1.itemRequestService.getRequests(opts);
                res.json(data);
            }
            catch (err) {
                res.status(500).json({ message: err.message || "Server error" });
            }
        });
    },
    // GET /api/item-requests/:id
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
    // PATCH /api/item-requests/:id  -- update top-level fields (notes, status, destination)
    updateRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const user_id = Number((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user.id) !== null && _b !== void 0 ? _b : 0);
                if (!user_id)
                    return res.status(401).json({ message: "Auth required" });
                const id = Number(req.params.id);
                const patch = req.body; // allow notes, destination_type/id, status (but service validates)
                const out = yield itemRequestService_1.itemRequestService.updateRequest(id, user_id, patch);
                res.json(out);
            }
            catch (err) {
                res.status(400).json({ message: err.message || "Cannot update" });
            }
        });
    },
    // PATCH /api/item-requests/:id/items  -- update only provided items (quantity/note). body: { items: [{ item_id, quantity, note? }] }
    updateItems(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const user_id = Number((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user.id) !== null && _b !== void 0 ? _b : 0);
                if (!user_id)
                    return res.status(401).json({ message: "Auth required" });
                const id = Number(req.params.id);
                const items = (_c = req.body) === null || _c === void 0 ? void 0 : _c.items;
                if (!Array.isArray(items) || items.length === 0)
                    return res.status(400).json({ message: "No items provided" });
                const updated = yield itemRequestService_1.itemRequestService.updateRequestItems(id, user_id, items);
                res.json({ message: "Items updated", updatedCount: updated });
            }
            catch (err) {
                res
                    .status(400)
                    .json({ message: err.message || "Could not update items" });
            }
        });
    },
    // POST /api/item-requests/:id/approve  -- only ADMIN/STOREKEEPER; will create transfer and mark request approved
    approveRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const user_id = Number((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user.id) !== null && _b !== void 0 ? _b : 0);
                if (!user_id)
                    return res.status(401).json({ message: "Auth required" });
                const id = Number(req.params.id);
                const out = yield itemRequestService_1.itemRequestService.approveRequest(id, user_id);
                res.json({ message: "Approved", transferId: (_c = out.transferId) !== null && _c !== void 0 ? _c : null });
            }
            catch (err) {
                res.status(400).json({ message: err.message || "Cannot approve" });
            }
        });
    },
    // DELETE /api/item-requests/:id/items/:item_id
    removeItemFromRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const user_id = Number((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user.id) !== null && _b !== void 0 ? _b : 0);
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
    // POST /api/item-requests/:id/reject
    rejectRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const user_id = Number((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user.id) !== null && _b !== void 0 ? _b : 0);
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
