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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferService = void 0;
const db_1 = require("../config/db");
const TransferRequest_1 = __importDefault(require("../models/TransferRequest"));
const ShopItem_1 = __importDefault(require("../models/ShopItem"));
const StoreItem_1 = __importDefault(require("../models/StoreItem"));
const user_1 = __importDefault(require("../models/user"));
class TransferService {
    listTransferRequests(filter = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const transferRepository = db_1.AppDataSource.getRepository(TransferRequest_1.default);
            return yield transferRepository.find({
                relations: ["requestedBy", "approvedBy"],
                order: { id: "DESC" }
            });
        });
    }
    adminTransfer(fromId, toId, items, adminId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.AppDataSource.transaction((manager) => __awaiter(this, void 0, void 0, function* () {
                const transferRepository = manager.getRepository(TransferRequest_1.default);
                const shopItemRepository = manager.getRepository(ShopItem_1.default);
                const storeItemRepository = manager.getRepository(StoreItem_1.default);
                const userRepository = manager.getRepository(user_1.default);
                // Get admin user
                const admin = yield userRepository.findOne({ where: { id: adminId } });
                if (!admin)
                    throw new Error("Admin user not found");
                // Create and immediately approve the transfer
                const transfer = yield transferRepository.save({
                    from: fromId,
                    to: toId,
                    items,
                    status: "approved",
                    requestedBy: admin,
                    approvedBy: admin,
                });
                // Update stock: decrement from sender, increment to receiver
                for (const item of items) {
                    // Check if it's a shop item first
                    const fromShopItem = yield shopItemRepository.findOne({
                        where: { shop: { id: fromId }, item: { id: item.itemId } }
                    });
                    if (fromShopItem) {
                        // Update shop item quantity
                        yield shopItemRepository.update({ shop: { id: fromId }, item: { id: item.itemId } }, { quantity: fromShopItem.quantity - item.quantity });
                    }
                    else {
                        // Check store item
                        const fromStoreItem = yield storeItemRepository.findOne({
                            where: { store: { id: fromId }, item: { id: item.itemId } }
                        });
                        if (fromStoreItem) {
                            yield storeItemRepository.update({ store: { id: fromId }, item: { id: item.itemId } }, { quantity: fromStoreItem.quantity - item.quantity });
                        }
                    }
                    // Add to receiver
                    const toShopItem = yield shopItemRepository.findOne({
                        where: { shop: { id: toId }, item: { id: item.itemId } }
                    });
                    if (toShopItem) {
                        yield shopItemRepository.update({ shop: { id: toId }, item: { id: item.itemId } }, { quantity: toShopItem.quantity + item.quantity });
                    }
                    else {
                        const toStoreItem = yield storeItemRepository.findOne({
                            where: { store: { id: toId }, item: { id: item.itemId } }
                        });
                        if (toStoreItem) {
                            yield storeItemRepository.update({ store: { id: toId }, item: { id: item.itemId } }, { quantity: toStoreItem.quantity + item.quantity });
                        }
                    }
                }
                return transfer;
            }));
        });
    }
    createTransferRequest(fromId, toId, items, requesterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const transferRepository = db_1.AppDataSource.getRepository(TransferRequest_1.default);
            const userRepository = db_1.AppDataSource.getRepository(user_1.default);
            const requester = yield userRepository.findOne({ where: { id: requesterId } });
            if (!requester)
                throw new Error("Requester user not found");
            return yield transferRepository.save({
                from: fromId,
                to: toId,
                items,
                status: "pending",
                requestedBy: requester,
            });
        });
    }
    approveTransferRequest(requestId, approverId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.AppDataSource.transaction((manager) => __awaiter(this, void 0, void 0, function* () {
                const transferRepository = manager.getRepository(TransferRequest_1.default);
                const shopItemRepository = manager.getRepository(ShopItem_1.default);
                const storeItemRepository = manager.getRepository(StoreItem_1.default);
                const userRepository = manager.getRepository(user_1.default);
                const transfer = yield transferRepository.findOne({
                    where: { id: requestId },
                    relations: ["requestedBy", "approvedBy"]
                });
                if (!transfer)
                    throw new Error("Transfer request not found");
                if (transfer.status !== "pending")
                    throw new Error("Transfer request is not pending");
                const approver = yield userRepository.findOne({ where: { id: approverId } });
                if (!approver)
                    throw new Error("Approver user not found");
                // Update stock: decrement from sender, increment to receiver
                for (const item of transfer.items) {
                    // Decrement from sender
                    const fromShopItem = yield shopItemRepository.findOne({
                        where: { shop: { id: transfer.from }, item: { id: item.itemId } }
                    });
                    if (fromShopItem) {
                        yield shopItemRepository.update({ shop: { id: transfer.from }, item: { id: item.itemId } }, { quantity: fromShopItem.quantity - item.quantity });
                    }
                    else {
                        const fromStoreItem = yield storeItemRepository.findOne({
                            where: { store: { id: transfer.from }, item: { id: item.itemId } }
                        });
                        if (fromStoreItem) {
                            yield storeItemRepository.update({ store: { id: transfer.from }, item: { id: item.itemId } }, { quantity: fromStoreItem.quantity - item.quantity });
                        }
                    }
                    // Increment to receiver
                    const toShopItem = yield shopItemRepository.findOne({
                        where: { shop: { id: transfer.to }, item: { id: item.itemId } }
                    });
                    if (toShopItem) {
                        yield shopItemRepository.update({ shop: { id: transfer.to }, item: { id: item.itemId } }, { quantity: toShopItem.quantity + item.quantity });
                    }
                    else {
                        const toStoreItem = yield storeItemRepository.findOne({
                            where: { store: { id: transfer.to }, item: { id: item.itemId } }
                        });
                        if (toStoreItem) {
                            yield storeItemRepository.update({ store: { id: transfer.to }, item: { id: item.itemId } }, { quantity: toStoreItem.quantity + item.quantity });
                        }
                    }
                }
                // Mark transfer as approved
                transfer.status = "approved";
                transfer.approvedBy = approver;
                yield transferRepository.save(transfer);
                return transfer;
            }));
        });
    }
    rejectTransferRequest(requestId, rejectorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.AppDataSource.transaction((manager) => __awaiter(this, void 0, void 0, function* () {
                const transferRepository = manager.getRepository(TransferRequest_1.default);
                const userRepository = manager.getRepository(user_1.default);
                const transfer = yield transferRepository.findOne({
                    where: { id: requestId },
                    relations: ["requestedBy", "approvedBy"]
                });
                if (!transfer)
                    throw new Error("Transfer request not found");
                if (transfer.status !== "pending")
                    throw new Error("Transfer request is not pending");
                const rejector = yield userRepository.findOne({ where: { id: rejectorId } });
                if (!rejector)
                    throw new Error("Rejector user not found");
                transfer.status = "rejected";
                transfer.approvedBy = rejector;
                yield transferRepository.save(transfer);
                return transfer;
            }));
        });
    }
}
exports.TransferService = TransferService;
