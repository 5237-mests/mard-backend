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
exports.TransferService = void 0;
const db_1 = require("../config/db");
class TransferService {
    listTransferRequests() {
        return __awaiter(this, arguments, void 0, function* (filter = {}) {
            return yield db_1.prisma.transferRequest.findMany({
                include: {
                    requestedBy: true,
                    approvedBy: true,
                },
                orderBy: { id: "desc" }
            });
        });
    }
    adminTransfer(fromId, toId, items, adminId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // Get admin user
                const admin = yield tx.user.findUnique({ where: { id: adminId } });
                if (!admin)
                    throw new Error("Admin user not found");
                // Create and immediately approve the transfer
                const transfer = yield tx.transferRequest.create({
                    data: {
                        from: fromId,
                        to: toId,
                        items: items, // Cast to any to handle JSON type
                        status: "APPROVED",
                        requestedById: admin.id,
                        approvedById: admin.id,
                    },
                });
                // Update stock: decrement from sender, increment to receiver
                for (const item of items) {
                    // Check if it's a shop item first
                    const fromShopItem = yield tx.shopItem.findFirst({
                        where: { shopId: fromId, itemId: item.itemId }
                    });
                    if (fromShopItem) {
                        // Update shop item quantity
                        yield tx.shopItem.update({
                            where: { id: fromShopItem.id },
                            data: { quantity: fromShopItem.quantity - item.quantity }
                        });
                    }
                    else {
                        // Check store item
                        const fromStoreItem = yield tx.storeItem.findFirst({
                            where: { storeId: fromId, itemId: item.itemId }
                        });
                        if (fromStoreItem) {
                            yield tx.storeItem.update({
                                where: { id: fromStoreItem.id },
                                data: { quantity: fromStoreItem.quantity - item.quantity }
                            });
                        }
                    }
                    // Add to receiver
                    const toShopItem = yield tx.shopItem.findFirst({
                        where: { shopId: toId, itemId: item.itemId }
                    });
                    if (toShopItem) {
                        yield tx.shopItem.update({
                            where: { id: toShopItem.id },
                            data: { quantity: toShopItem.quantity + item.quantity }
                        });
                    }
                    else {
                        const toStoreItem = yield tx.storeItem.findFirst({
                            where: { storeId: toId, itemId: item.itemId }
                        });
                        if (toStoreItem) {
                            yield tx.storeItem.update({
                                where: { id: toStoreItem.id },
                                data: { quantity: toStoreItem.quantity + item.quantity }
                            });
                        }
                    }
                }
                return transfer;
            }));
        });
    }
    createTransferRequest(fromId, toId, items, requesterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const requester = yield db_1.prisma.user.findUnique({ where: { id: requesterId } });
            if (!requester)
                throw new Error("Requester user not found");
            return yield db_1.prisma.transferRequest.create({
                data: {
                    from: fromId,
                    to: toId,
                    items: items, // Cast to any to handle JSON type
                    status: "PENDING",
                    requestedById: requester.id,
                },
            });
        });
    }
    approveTransferRequest(requestId, approverId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const transfer = yield tx.transferRequest.findUnique({
                    where: { id: requestId },
                    include: {
                        requestedBy: true,
                        approvedBy: true,
                    },
                });
                if (!transfer)
                    throw new Error("Transfer request not found");
                if (transfer.status !== "PENDING")
                    throw new Error("Transfer request is not pending");
                const approver = yield tx.user.findUnique({ where: { id: approverId } });
                if (!approver)
                    throw new Error("Approver user not found");
                // Update stock: decrement from sender, increment to receiver
                const transferItems = transfer.items;
                for (const item of transferItems) {
                    // Decrement from sender
                    const fromShopItem = yield tx.shopItem.findFirst({
                        where: { shopId: transfer.from, itemId: item.itemId }
                    });
                    if (fromShopItem) {
                        yield tx.shopItem.update({
                            where: { id: fromShopItem.id },
                            data: { quantity: fromShopItem.quantity - item.quantity }
                        });
                    }
                    else {
                        const fromStoreItem = yield tx.storeItem.findFirst({
                            where: { storeId: transfer.from, itemId: item.itemId }
                        });
                        if (fromStoreItem) {
                            yield tx.storeItem.update({
                                where: { id: fromStoreItem.id },
                                data: { quantity: fromStoreItem.quantity - item.quantity }
                            });
                        }
                    }
                    // Increment to receiver
                    const toShopItem = yield tx.shopItem.findFirst({
                        where: { shopId: transfer.to, itemId: item.itemId }
                    });
                    if (toShopItem) {
                        yield tx.shopItem.update({
                            where: { id: toShopItem.id },
                            data: { quantity: toShopItem.quantity + item.quantity }
                        });
                    }
                    else {
                        const toStoreItem = yield tx.storeItem.findFirst({
                            where: { storeId: transfer.to, itemId: item.itemId }
                        });
                        if (toStoreItem) {
                            yield tx.storeItem.update({
                                where: { id: toStoreItem.id },
                                data: { quantity: toStoreItem.quantity + item.quantity }
                            });
                        }
                    }
                }
                // Mark transfer as approved
                const updatedTransfer = yield tx.transferRequest.update({
                    where: { id: requestId },
                    data: {
                        status: "APPROVED",
                        approvedById: approver.id,
                    },
                    include: {
                        requestedBy: true,
                        approvedBy: true,
                    },
                });
                return updatedTransfer;
            }));
        });
    }
    rejectTransferRequest(requestId, rejectorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const transfer = yield tx.transferRequest.findUnique({
                    where: { id: requestId },
                    include: {
                        requestedBy: true,
                        approvedBy: true,
                    },
                });
                if (!transfer)
                    throw new Error("Transfer request not found");
                if (transfer.status !== "PENDING")
                    throw new Error("Transfer request is not pending");
                const rejector = yield tx.user.findUnique({ where: { id: rejectorId } });
                if (!rejector)
                    throw new Error("Rejector user not found");
                const updatedTransfer = yield tx.transferRequest.update({
                    where: { id: requestId },
                    data: {
                        status: "REJECTED",
                        approvedById: rejector.id,
                    },
                    include: {
                        requestedBy: true,
                        approvedBy: true,
                    },
                });
                return updatedTransfer;
            }));
        });
    }
}
exports.TransferService = TransferService;
