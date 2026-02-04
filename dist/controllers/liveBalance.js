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
exports.liveBalancePivot = void 0;
const liveBalance_1 = require("../services/liveBalance");
/**
 * GET /balance/live
 * Returns pivoted live inventory balance across shops and stores.
 * Supports optional search query (name, code, model).
 */
const liveBalancePivot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { search } = req.query;
        // Basic sanitization (prevent injection if passed directly to SQL)
        const searchStr = typeof search === "string" ? search.trim().slice(0, 100) : undefined;
        const result = yield (0, liveBalance_1.getLiveBalancePivot)(searchStr);
        if (!result || !Array.isArray(result.data)) {
            return res.status(200).json({
                success: true,
                total_distinct_items: 0,
                total_number_of_items: 0,
                total_asset_valuation: 0,
                data: [],
                shops: (_a = result === null || result === void 0 ? void 0 : result.shops) !== null && _a !== void 0 ? _a : [],
                stores: (_b = result === null || result === void 0 ? void 0 : result.stores) !== null && _b !== void 0 ? _b : [],
                message: "No data available",
            });
        }
        // Safe number conversion helper
        const toNumber = (val) => {
            const num = Number(val);
            return Number.isNaN(num) ? 0 : num;
        };
        // 1. Count of unique item rows
        const total_distinct_items = result.data.length;
        // 2. Sum of all total_quantity
        const total_number_of_items = result.data.reduce((sum, item) => sum + toNumber(item.total_quantity), 0);
        // 3. Total valuation = Σ (price × total_quantity)
        const total_asset_valuation = result.data.reduce((sum, item) => {
            const price = toNumber(item.price);
            const qty = toNumber(item.total_quantity);
            return sum + price * qty;
        }, 0);
        const response = {
            success: true,
            total_distinct_items,
            total_number_of_items,
            // Keep 2 decimal places, but as number (frontend can format nicely)
            total_asset_valuation: Number(total_asset_valuation.toFixed(2)),
            data: result.data,
            shops: result.shops,
            stores: result.stores,
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
