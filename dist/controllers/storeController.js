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
exports.StoreController = void 0;
const storeService_1 = require("../services/storeService");
class StoreController {
    /**
     * Creates a new store.
     * @param req The HTTP request object.
     * @param res The HTTP response object.
     * @returns A Promise that resolves when the store is created.
     * @throws Will return a 400 error if name or location is missing from the request body.
     * @throws Will return a 500 error if there is an error creating the store.
     */
    static createStore(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, location } = req.body;
            if (!name || !location) {
                res.status(400).json({ message: "Name and location are required." });
                return;
            }
            try {
                const newstore = yield storeService_1.StoreService.createStore(name, location);
                res.status(201).json(newstore);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    static getStores(_req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stores = yield storeService_1.StoreService.getStores();
                res.status(200).json(stores);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    static getStoreById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const store = yield storeService_1.StoreService.getStoreById(parseInt(id, 10));
                if (!store) {
                    res.status(404).json({ message: "store not found." });
                    return;
                }
                res.status(200).json(store);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    static updateStore(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { name, location } = req.body;
            try {
                const updatedstore = yield storeService_1.StoreService.updateStore(parseInt(id, 10), name, location);
                if (!updatedstore) {
                    res.status(404).json({ message: "store not found." });
                    return;
                }
                res.status(200).json(updatedstore);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    static deleteStore(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const success = yield storeService_1.StoreService.deleteStore(parseInt(id, 10));
                if (!success) {
                    res.status(404).json({ message: "store not found." });
                    return;
                }
                res.status(200).json({ message: "store deleted successfully." });
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
}
exports.StoreController = StoreController;
