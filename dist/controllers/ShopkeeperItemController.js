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
exports.ShopkeeperItemController = void 0;
const ShopkeeperItemService_1 = require("../services/ShopkeeperItemService");
class ShopkeeperItemController {
    /**
     * Handles the request to get all items for a specific shopkeeper.
     * @param req The Express request object.
     * @param res The Express response object.
     */
    static getItemsByShopkeeperId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            // Simple validation to ensure the ID is a number.
            if (isNaN(parseInt(userId, 10))) {
                res.status(400).json({ message: "User ID must be a valid number." });
                return;
            }
            try {
                const items = yield ShopkeeperItemService_1.ShopkeeperItemService.getItemsByShopkeeperId(parseInt(userId, 10));
                res.status(200).json(items);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
}
exports.ShopkeeperItemController = ShopkeeperItemController;
