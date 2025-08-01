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
exports.markAsRead = exports.listNotifications = exports.deleteNotificationById = exports.unreadCount = void 0;
const notificationService_1 = require("../services/notificationService");
const unreadCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    try {
        const count = yield (0, notificationService_1.getUnreadCount)(userId);
        res.status(200).json({ unread: count });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching unread count", error });
    }
});
exports.unreadCount = unreadCount;
const deleteNotificationById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { notificationId } = req.body;
    try {
        yield (0, notificationService_1.deleteNotification)(notificationId);
        res.status(200).json({ message: "Notification deleted" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting notification", error });
    }
});
exports.deleteNotificationById = deleteNotificationById;
const listNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    try {
        const notifications = yield (0, notificationService_1.getNotifications)(userId);
        res.status(200).json(notifications);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching notifications", error });
    }
});
exports.listNotifications = listNotifications;
const markAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { notificationId } = req.body;
    try {
        yield (0, notificationService_1.markNotificationRead)(notificationId);
        res.status(200).json({ message: "Notification marked as read" });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error marking notification as read", error });
    }
});
exports.markAsRead = markAsRead;
