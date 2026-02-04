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
            var _a, _b, _c, _d, _e;
            const user = req.user;
            // const body = plainToClass(SaleRequestBody, req.body);
            const body = req.body;
            try {
                const saleId = yield salesService_1.SalesService.processSale(body.shopId, user.id, (_a = body.customerName) !== null && _a !== void 0 ? _a : null, (_b = body.customerContact) !== null && _b !== void 0 ? _b : null, body.items, (_c = body.status) !== null && _c !== void 0 ? _c : "completed", body.tx_ref, (_d = body.totalDiscount) !== null && _d !== void 0 ? _d : 0, (_e = body.totalTax) !== null && _e !== void 0 ? _e : 0);
                return res.status(201).json({
                    success: true,
                    saleId,
                    message: "Sale created successfully",
                });
            }
            catch (err) {
                const status = err.message.includes("Insufficient")
                    ? 409
                    : err.message.includes("not a member")
                        ? 403
                        : 500;
                return res.status(status).json({
                    success: false,
                    error: err.message,
                });
            }
        });
    }
    static getSales(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const { shopId, startDate, endDate, page = "1", limit = "20", status, search, sortBy = "created_at", sortOrder = "desc", } = req.query;
            if (shopId &&
                !(yield salesService_1.SalesService.userBelongsToShop(user.id, shopId)) &&
                !user.roles.includes("ADMIN")) {
                return res
                    .status(403)
                    .json({ success: false, error: "Not authorized for this shop." });
            }
            const params = {
                shopId: shopId,
                startDate: startDate,
                endDate: endDate,
                page: parseInt(page, 10) || 1,
                limit: Math.min(parseInt(limit, 10) || 20, 100),
                status: status,
                search: search,
                sortBy: sortBy,
                sortOrder: sortOrder,
            };
            try {
                const result = yield salesService_1.SalesService.getSalesPaginated(params);
                return res.json({
                    success: true,
                    data: result.sales,
                    pagination: result.pagination,
                    summary: result.summary,
                });
            }
            catch (err) {
                console.log("err: ", err);
                return res
                    .status(500)
                    .json({ success: false, error: "Failed to fetch sales *" });
            }
        });
    }
    // static async getAllSales(req: Request, res: Response) {
    //   // if (!req.user?.roles.includes("ADMIN")) {
    //   //   return res
    //   //     .status(403)
    //   //     .json({ success: false, error: "Admin access required" });
    //   // }
    //   return getSales(req, res); // Reuse with shopId undefined
    // }.
    static getSaleById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // const user = req.user!;
            const { id } = req.params;
            try {
                const sale = yield salesService_1.SalesService.getSaleById(Number(id));
                if (!sale)
                    return res
                        .status(404)
                        .json({ success: false, error: "Sale not found" });
                // if (
                //   !user.roles.includes("ADMIN") &&
                //   !(await SalesService.userBelongsToShop(
                //     user.id,
                //     sale.shop_id.toString(),
                //   ))
                // ) {
                //   return res
                //     .status(403)
                //     .json({ success: false, error: "Not authorized to view this sale" });
                // }
                return res.json({ success: true, data: sale });
            }
            catch (err) {
                console.log("err: ", err);
                return res
                    .status(500)
                    .json({ success: false, error: "Failed to fetch sale" });
            }
        });
    }
    // New: Refund (including partial)
    static refundSale(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { saleId, tx_ref, partialItems } = req.body; // partialItems: array of {itemId: number, quantity: number}
            try {
                // await SalesService.refundSale({ saleId, tx_ref }, partialItems);
                return res.json({ success: true, message: "Refund processed" });
            }
            catch (err) {
                return res.status(400).json({ success: false, error: err.message });
            }
        });
    }
}
exports.SalesController = SalesController;
