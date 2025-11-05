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
exports.deadstockController = void 0;
const deadstockService_1 = require("../services/deadstockService");
exports.deadstockController = {
    report(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const input = req.body;
                // optionally extract user id from req.user if auth middleware attaches it
                // const user_id = (req as any).user?.id ?? null;
                const user_id = req.user.user.id;
                const id = yield deadstockService_1.deadstockService.reportDeadstock(Object.assign(Object.assign({}, input), { user_id }));
                res.status(201).json({ id });
            }
            catch (err) {
                res
                    .status(400)
                    .json({ message: err.message || "Failed to report deadstock" });
            }
        });
    },
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const opts = {
                    status: req.query.status,
                    sourceType: req.query.sourceType,
                    fromDate: req.query.fromDate,
                    toDate: req.query.toDate,
                    search: req.query.search,
                    page: req.query.page ? Number(req.query.page) : undefined,
                    pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
                };
                const result = yield deadstockService_1.deadstockService.getAllDeadstock(opts);
                res.json(result);
            }
            catch (err) {
                res
                    .status(500)
                    .json({ message: err.message || "Failed to list deadstock" });
            }
        });
    },
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(req.params.id);
                const row = yield deadstockService_1.deadstockService.getDeadstockById(id);
                res.json(row);
            }
            catch (err) {
                res.status(404).json({ message: err.message || "Not found" });
            }
        });
    },
    resolve(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const id = Number(req.params.id);
                const action = req.body.action || "resolved";
                const notes = req.body.notes;
                yield deadstockService_1.deadstockService.resolveDeadstock(id, action, notes, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
                res.json({ success: true });
            }
            catch (err) {
                res.status(400).json({ message: err.message || "Failed to update" });
            }
        });
    },
    remove(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(req.params.id);
                yield deadstockService_1.deadstockService.deleteDeadstock(id);
                res.json({ success: true });
            }
            catch (err) {
                res.status(400).json({ message: err.message || "Failed to delete" });
            }
        });
    },
};
