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
exports.liveBalancePivot2 = exports.liveBalancePivot = void 0;
const liveBalance_1 = require("../services/liveBalance");
/**
 * GET /balance/live
 */
const liveBalancePivot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { search } = req.query;
        // Basic sanitization
        const searchStr = typeof search === "string" ? search.trim().slice(0, 100) : undefined;
        const result = yield (0, liveBalance_1.getLiveBalancePivot)(searchStr);
        if (!result || !Array.isArray(result.data) || result.data.length === 0) {
            return res.status(200).json({
                success: true,
                total_distinct_items: 0,
                total_number_of_items: 0,
                total_asset_valuation: 0,
                locations: (_a = result === null || result === void 0 ? void 0 : result.locations) !== null && _a !== void 0 ? _a : [],
                data: [],
                message: "No data available",
            });
        }
        const response = {
            success: true,
            total_distinct_items: result.total_distinct_items,
            total_number_of_items: result.total_number_of_items,
            total_asset_valuation: Number(result.total_asset_valuation.toFixed(2)),
            locations: result.locations,
            data: result.data,
        };
        return res.status(200).json(response);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch live balance",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
});
exports.liveBalancePivot = liveBalancePivot;
const liveBalancePivot2 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, category_id } = req.query;
        // Basic sanitization
        const categoryIdNum = typeof category_id === "string" && !isNaN(Number(category_id))
            ? Number(category_id)
            : undefined;
        const searchStr = typeof search === "string" ? search.trim().slice(0, 100) : undefined;
        const result = yield (0, liveBalance_1.getLiveBalancePivot2)(searchStr, categoryIdNum);
        if (!result || !Array.isArray(result.data) || result.data.length === 0) {
            return res.status(200).json({
                success: true,
                total_distinct_items: 0,
                total_number_of_items: 0,
                data: [],
                message: "No data available",
            });
        }
        const response = {
            success: true,
            total_distinct_items: result.total_distinct_items,
            total_number_of_items: result.total_number_of_items,
            data: result.data,
        };
        return res.status(200).json(response);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch live balance",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
});
exports.liveBalancePivot2 = liveBalancePivot2;
