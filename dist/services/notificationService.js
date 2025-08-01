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
exports.deleteNotification = exports.getUnreadCount = exports.markNotificationRead = exports.getNotifications = exports.sendNotification = void 0;
const db_1 = require("../config/db");
const Notification_1 = __importDefault(require("../models/Notification"));
const user_1 = __importDefault(require("../models/user"));
function sendNotification(userId, message) {
    return __awaiter(this, void 0, void 0, function* () {
        const notificationRepository = db_1.AppDataSource.getRepository(Notification_1.default);
        const userRepository = db_1.AppDataSource.getRepository(user_1.default);
        const user = yield userRepository.findOne({ where: { id: parseInt(userId) } });
        if (!user)
            throw new Error("User not found");
        yield notificationRepository.save({ user, message, read: false });
    });
}
exports.sendNotification = sendNotification;
function getNotifications(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const notificationRepository = db_1.AppDataSource.getRepository(Notification_1.default);
        return yield notificationRepository.find({
            where: { user: { id: parseInt(userId) } },
            relations: ["user"],
            order: { createdAt: "DESC" }
        });
    });
}
exports.getNotifications = getNotifications;
function markNotificationRead(notificationId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Mark a specific notification as read
        const notificationRepository = db_1.AppDataSource.getRepository(Notification_1.default);
        yield notificationRepository.update({ id: parseInt(notificationId) }, { read: true });
    });
}
exports.markNotificationRead = markNotificationRead;
function getUnreadCount(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const notificationRepository = db_1.AppDataSource.getRepository(Notification_1.default);
        return yield notificationRepository.count({
            where: { user: { id: parseInt(userId) }, read: false }
        });
    });
}
exports.getUnreadCount = getUnreadCount;
function deleteNotification(notificationId) {
    return __awaiter(this, void 0, void 0, function* () {
        const notificationRepository = db_1.AppDataSource.getRepository(Notification_1.default);
        yield notificationRepository.delete({ id: parseInt(notificationId) });
    });
}
exports.deleteNotification = deleteNotification;
