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
exports.ShopController = void 0;
const shopService_1 = require("../services/shopService");
class ShopController {
    /**
     * Creates a new shop.
     * @param req The HTTP request object.
     * @param res The HTTP response object.
     * @returns A Promise that resolves when the shop is created.
     * @throws Will return a 400 error if name or location is missing from the request body.
     * @throws Will return a 500 error if there is an error creating the shop.
     */
    static createShop(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, location } = req.body;
            if (!name || !location) {
                res.status(400).json({ message: "Name and location are required." });
                return;
            }
            try {
                const newShop = yield shopService_1.ShopService.createShop(name, location);
                res.status(201).json(newShop);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    static getShops(_req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const shops = yield shopService_1.ShopService.getShops();
                res.status(200).json(shops);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    static getShopById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const shop = yield shopService_1.ShopService.getShopById(parseInt(id, 10));
                if (!shop) {
                    res.status(404).json({ message: "Shop not found." });
                    return;
                }
                res.status(200).json(shop);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    static updateShop(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { name, location } = req.body;
            try {
                const updatedShop = yield shopService_1.ShopService.updateShop(parseInt(id, 10), name, location);
                if (!updatedShop) {
                    res.status(404).json({ message: "Shop not found." });
                    return;
                }
                res.status(200).json(updatedShop);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    static deleteShop(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const success = yield shopService_1.ShopService.deleteShop(parseInt(id, 10));
                if (!success) {
                    res.status(404).json({ message: "Shop not found." });
                    return;
                }
                res.status(200).json({ message: "Shop deleted successfully." });
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
}
exports.ShopController = ShopController;
// export const processSale = async (req: Request, res: Response) => {
//   const { items } = req.body;
//   const shopId = req.user.id;
//   const soldBy = req.user.id;
//   const shopService = new ShopService();
//   try {
//     await shopService.processSale(shopId, items, soldBy);
//     res
//       .status(200)
//       .json({
//         message: "Sale processed, inventory updated, and sale recorded.",
//       });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error updating inventory or recording sale", error });
//   }
// };
// export const getSales = async (req: Request, res: Response) => {
//   const shopId = req.user.id;
//   const { date, week, month, year, itemId, allProducts } = req.query;
//   let filter: any = {};
//   if (!allProducts) {
//     filter.shopId = shopId;
//   }
//   if (date) {
//     const start = new Date(date as string);
//     const end = new Date(start);
//     end.setDate(start.getDate() + 1);
//     filter.soldAt = { $gte: start, $lt: end };
//   } else if (week && year) {
//     const firstDayOfYear = new Date(Number(year), 0, 1);
//     const start = new Date(firstDayOfYear);
//     start.setDate(firstDayOfYear.getDate() + (Number(week) - 1) * 7);
//     const end = new Date(start);
//     end.setDate(start.getDate() + 7);
//     filter.soldAt = { $gte: start, $lt: end };
//   } else if (month && year) {
//     const start = new Date(Number(year), Number(month) - 1, 1);
//     const end = new Date(Number(year), Number(month), 1);
//     filter.soldAt = { $gte: start, $lt: end };
//   } else if (year) {
//     const start = new Date(Number(year), 0, 1);
//     const end = new Date(Number(year) + 1, 0, 1);
//     filter.soldAt = { $gte: start, $lt: end };
//   }
//   const shopService = new ShopService();
//   try {
//     const sales = await shopService.getSales(
//       filter,
//       itemId as string | undefined
//     );
//     res.status(200).json(sales);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching sales records", error });
//   }
// };
