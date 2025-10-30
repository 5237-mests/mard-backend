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
exports.storestorekeeperController = void 0;
// import { storestorekeeperService } from "../services/storestorekeeperService";
const StoreStorekeeperService_1 = require("../services/StoreStorekeeperService");
class storestorekeeperController {
    static addstorekeeperTostore(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { storeId, userId } = req.params;
            try {
                const newLink = yield StoreStorekeeperService_1.StoreStorekeeperService.addStorekeeperTostore(parseInt(storeId, 10), parseInt(userId, 10));
                res.status(201).json(newLink);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    static removestorekeeperFromstore(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { storeId, userId } = req.params;
            try {
                const success = yield StoreStorekeeperService_1.StoreStorekeeperService.removeStorekeeperFromstore(parseInt(storeId, 10), parseInt(userId, 10));
                if (!success) {
                    res.status(404).json({
                        message: "Link not found. storekeeper is not assigned to this store.",
                    });
                    return;
                }
                res.status(204).send(); // No content
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    static getstorekeepersBystoreId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { storeId } = req.params;
            try {
                const storekeepers = yield StoreStorekeeperService_1.StoreStorekeeperService.getStorekeepersByStoreId(parseInt(storeId, 10));
                res.status(200).json(storekeepers);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    static getstoresBystorekeeperId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            try {
                const stores = yield StoreStorekeeperService_1.StoreStorekeeperService.getStoresByStorekeeperId(parseInt(userId, 10));
                res.status(200).json(stores);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
}
exports.storestorekeeperController = storestorekeeperController;
