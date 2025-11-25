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
exports.refundController = void 0;
const refundService_1 = require("../services/refundService");
exports.refundController = {
    createRefund(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const user_id = Number((_b = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id);
                const payload = req.body;
                const result = yield refundService_1.refundService.createRefund(Object.assign(Object.assign({}, payload), { refunded_by: user_id }));
                res.status(201).json(result);
            }
            catch (err) {
                res
                    .status(400)
                    .json({ message: err.message || "Failed to create refund" });
            }
        });
    },
    // create refund using sale_id and make sale status refunded
    createRefundFromSaleId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const user_id = Number((_b = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id);
                const { sale_id, shop_id, payment_method, status, reason } = req.body;
                const result = yield refundService_1.refundService.createRefundFromSaleId(sale_id, shop_id, user_id, payment_method, status === undefined ? "completed" : status, reason);
                res.status(201).json(result);
            }
            catch (err) {
                res
                    .status(400)
                    .json({ message: err.message || "Failed to create refund" });
            }
        });
    },
    listRefunds(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const refunds = yield refundService_1.refundService.getRefunds(req.query);
                res.json(refunds);
            }
            catch (err) {
                res
                    .status(500)
                    .json({ message: err.message || "Failed to fetch refunds" });
            }
        });
    },
    getRefund(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(req.params.id);
                const refund = yield refundService_1.refundService.getRefundById(id);
                res.json(refund);
            }
            catch (err) {
                res.status(404).json({ message: err.message || "Refund not found" });
            }
        });
    },
};
