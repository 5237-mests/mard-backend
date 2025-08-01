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
exports.deleteNotification = exports.getUnreadNotificationCount = exports.markNotificationAsRead = exports.getUserNotifications = exports.createNotification = void 0;
const db_1 = require("../config/db");
const createNotification = (userId, message) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield db_1.prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!user)
        throw new Error("User not found");
    yield db_1.prisma.notification.create({
        data: { userId: user.id, message, read: false }
    });
});
exports.createNotification = createNotification;
const getUserNotifications = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield db_1.prisma.notification.findMany({
        where: { userId: parseInt(userId) },
        include: { user: true },
        orderBy: { createdAt: 'desc' }
    });
});
exports.getUserNotifications = getUserNotifications;
const markNotificationAsRead = (notificationId) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.prisma.notification.update({
        where: { id: parseInt(notificationId) },
        data: { read: true }
    });
});
exports.markNotificationAsRead = markNotificationAsRead;
const getUnreadNotificationCount = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield db_1.prisma.notification.count({
        where: {
            userId: parseInt(userId),
            read: false
        }
    });
});
exports.getUnreadNotificationCount = getUnreadNotificationCount;
const deleteNotification = (notificationId) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.prisma.notification.delete({ where: { id: parseInt(notificationId) } });
});
exports.deleteNotification = deleteNotification;
