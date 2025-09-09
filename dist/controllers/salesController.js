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
exports.SalesController = void 0;
const salesService_1 = require("../services/salesService");
class SalesController {
    static createSale(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { shopId, soldById, customerName, customerContact, items } = req.body;
            const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
            if (!token ||
                !shopId ||
                !soldById ||
                !items ||
                !Array.isArray(items) ||
                items.length === 0) {
                return res.status(400).json({ error: "Missing required fields" });
            }
            try {
                const saleId = yield salesService_1.SalesService.processSale(shopId, soldById, customerName || null, customerContact || null, items);
                res.status(201).json({ saleId, message: "Sale processed successfully" });
            }
            catch (error) {
                console.error("Error processing sale:", error);
                res.status(500).json({ error: `Failed to process sale: ${error}` });
            }
        });
    }
    // static async getSales(req: Request, res: Response) {
    //   const { shopId } = req.query;
    //   if (!shopId || typeof shopId !== "string") {
    //     return res.status(400).json({ error: "Missing or invalid shopId" });
    //   }
    //   try {
    //     const sales = await SalesService.getSales(shopId);
    //     res.status(200).json(sales);
    //   } catch (error) {
    //     console.error("Error fetching sales:", error);
    //     res.status(500).json({ error: `Failed to fetch sales: ${error}` });
    //   }
    // }
    static getSales(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { shopId, startDate, endDate } = req.query;
            if (!shopId) {
                return res.status(400).json({ error: "Missing shopId" });
            }
            try {
                const salesHistory = yield salesService_1.SalesService.getSales(shopId, startDate, endDate);
                res.json(salesHistory);
            }
            catch (error) {
                console.error("Error fetching sales history:", error);
                res
                    .status(500)
                    .json({ error: `Failed to fetch sales history: ${error}` });
            }
        });
    }
    // get all sales for admin
    static getAllSales(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sales = yield salesService_1.SalesService.getAllSales();
                res.status(200).json(sales);
            }
            catch (error) {
                console.error("Error fetching sales:", error);
                res.status(500).json({ error: `Failed to fetch sales: ${error}` });
            }
        });
    }
}
exports.SalesController = SalesController;
