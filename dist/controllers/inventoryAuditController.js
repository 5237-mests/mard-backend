"use strict";
// import { Request, Response } from "express";
// import { inventoryAuditService } from "../services/inventoryAuditService";
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
exports.inventoryAuditController = void 0;
const inventoryAuditService_1 = require("../services/inventoryAuditService");
exports.inventoryAuditController = {
    createAudit(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield inventoryAuditService_1.inventoryAuditService.createAudit(req.body);
                res.status(201).json({
                    success: true,
                    data: result,
                });
            }
            catch (err) {
                console.error("[createAudit] Error:", err);
                res.status(400).json({
                    success: false,
                    message: err.message || "Failed to create audit",
                });
            }
        });
    },
    listAudits(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const filters = {
                    location_type: req.query.location_type,
                    location_id: req.query.location_id
                        ? Number(req.query.location_id)
                        : undefined,
                    item_id: req.query.item_id ? Number(req.query.item_id) : undefined,
                    txn_type: req.query.txn_type,
                    start_date: req.query.date_from, // ← match frontend naming
                    end_date: req.query.date_to, // ← match frontend naming
                    page: req.query.page ? Number(req.query.page) : undefined,
                    limit: req.query.limit ? Number(req.query.limit) : undefined,
                };
                // Clean up undefined values
                Object.keys(filters).forEach((key) => filters[key] === undefined && delete filters[key]);
                const result = yield inventoryAuditService_1.inventoryAuditService.getAudits(filters);
                res.json({
                    success: true,
                    data: result.data,
                    pagination: result.pagination,
                });
            }
            catch (err) {
                console.error("[listAudits] Error:", err);
                res.status(500).json({
                    success: false,
                    message: err.message || "Failed to fetch audits",
                });
            }
        });
    },
    getAudit(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const id = Number(req.params.id);
                if (!Number.isInteger(id) || id <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid audit ID",
                    });
                }
                const audit = yield inventoryAuditService_1.inventoryAuditService.getAuditById(id);
                res.json({
                    success: true,
                    data: audit,
                });
            }
            catch (err) {
                console.error("[getAudit] Error:", err);
                const status = ((_a = err.message) === null || _a === void 0 ? void 0 : _a.includes("not found")) ? 404 : 500;
                res.status(status).json({
                    success: false,
                    message: err.message || "Failed to fetch audit",
                });
            }
        });
    },
    // You can keep deleteAudit if needed for admin/testing, but it's commented by default
    // async deleteAudit(req: Request, res: Response) { ... }
};
