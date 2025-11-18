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
exports.inventoryAuditController = void 0;
const inventoryAuditService_1 = require("../services/inventoryAuditService");
exports.inventoryAuditController = {
    createAudit(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield inventoryAuditService_1.inventoryAuditService.createAudit(req.body);
                res.status(201).json(result);
            }
            catch (err) {
                res
                    .status(400)
                    .json({ message: err.message || "Failed to create audit" });
            }
        });
    },
    listAudits(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const audits = yield inventoryAuditService_1.inventoryAuditService.getAudits(req.query);
                res.json(audits);
            }
            catch (err) {
                res
                    .status(500)
                    .json({ message: err.message || "Failed to fetch audits" });
            }
        });
    },
    getAudit(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(req.params.id);
                const audit = yield inventoryAuditService_1.inventoryAuditService.getAuditById(id);
                res.json(audit);
            }
            catch (err) {
                res.status(404).json({ message: err.message || "Audit not found" });
            }
        });
    },
};
