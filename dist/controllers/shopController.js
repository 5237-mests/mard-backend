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
exports.getSales = exports.processSale = void 0;
const shopService_1 = require("../services/shopService");
const processSale = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { items } = req.body;
    const shopId = req.user.id;
    const soldBy = req.user.id;
    const shopService = new shopService_1.ShopService();
    try {
        yield shopService.processSale(shopId, items, soldBy);
        res
            .status(200)
            .json({
            message: "Sale processed, inventory updated, and sale recorded.",
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error updating inventory or recording sale", error });
    }
});
exports.processSale = processSale;
const getSales = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const shopId = req.user.id;
    const { date, week, month, year, itemId, allProducts } = req.query;
    let filter = {};
    if (!allProducts) {
        filter.shopId = shopId;
    }
    if (date) {
        const start = new Date(date);
        const end = new Date(start);
        end.setDate(start.getDate() + 1);
        filter.soldAt = { $gte: start, $lt: end };
    }
    else if (week && year) {
        const firstDayOfYear = new Date(Number(year), 0, 1);
        const start = new Date(firstDayOfYear);
        start.setDate(firstDayOfYear.getDate() + (Number(week) - 1) * 7);
        const end = new Date(start);
        end.setDate(start.getDate() + 7);
        filter.soldAt = { $gte: start, $lt: end };
    }
    else if (month && year) {
        const start = new Date(Number(year), Number(month) - 1, 1);
        const end = new Date(Number(year), Number(month), 1);
        filter.soldAt = { $gte: start, $lt: end };
    }
    else if (year) {
        const start = new Date(Number(year), 0, 1);
        const end = new Date(Number(year) + 1, 0, 1);
        filter.soldAt = { $gte: start, $lt: end };
    }
    const shopService = new shopService_1.ShopService();
    try {
        const sales = yield shopService.getSales(filter, itemId);
        res.status(200).json(sales);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching sales records", error });
    }
});
exports.getSales = getSales;
