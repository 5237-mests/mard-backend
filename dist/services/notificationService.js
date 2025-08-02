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
    const userSql = "SELECT * FROM users WHERE id = ?";
    const users = yield (0, db_1.query)(userSql, [parseInt(userId)]);
    const user = users[0];
    if (!user)
        throw new Error("User not found");
    const createSql = `
    INSERT INTO notifications (userId, message, \`read\`)
    VALUES (?, ?, ?)
  `;
    yield (0, db_1.query)(createSql, [user.id, message, false]);
});
exports.createNotification = createNotification;
const getUserNotifications = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `
    SELECT 
      n.*,
      u.name as user_name, u.email as user_email
    FROM notifications n
    JOIN users u ON n.userId = u.id
    WHERE n.userId = ?
    ORDER BY n.createdAt DESC
  `;
    const notificationsData = yield (0, db_1.query)(sql, [parseInt(userId)]);
    return notificationsData.map((notification) => (Object.assign(Object.assign({}, notification), { user: {
            id: notification.userId,
            name: notification.user_name,
            email: notification.user_email
        } })));
});
exports.getUserNotifications = getUserNotifications;
const markNotificationAsRead = (notificationId) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `
    UPDATE notifications 
    SET \`read\` = ? 
    WHERE id = ?
  `;
    yield (0, db_1.query)(sql, [true, parseInt(notificationId)]);
});
exports.markNotificationAsRead = markNotificationAsRead;
const getUnreadNotificationCount = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `
    SELECT COUNT(*) as count 
    FROM notifications 
    WHERE userId = ? AND \`read\` = ?
  `;
    const result = yield (0, db_1.query)(sql, [parseInt(userId), false]);
    return result[0].count;
});
exports.getUnreadNotificationCount = getUnreadNotificationCount;
const deleteNotification = (notificationId) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = "DELETE FROM notifications WHERE id = ?";
    yield (0, db_1.query)(sql, [parseInt(notificationId)]);
});
exports.deleteNotification = deleteNotification;
