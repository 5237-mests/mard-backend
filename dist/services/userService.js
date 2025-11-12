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
exports.UserService = void 0;
const db_1 = require("../config/db");
const user_1 = require("../models/user");
class UserService {
    createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPassword = yield user_1.UserService.hashPassword(userData.password);
            const sql = `
      INSERT INTO users (name, email, phone, password, role, isVerified, verificationToken)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
            const params = [
                userData.name,
                userData.email,
                userData.phone,
                hashedPassword,
                userData.role || "USER",
                userData.isVerified || false,
                userData.verificationToken || null,
            ];
            const result = yield (0, db_1.query)(sql, params);
            // Fetch the newly created user
            const newUserSql = "SELECT * FROM users WHERE id = ?";
            const newUsers = yield (0, db_1.query)(newUserSql, [result.insertId]);
            return newUsers[0];
        });
    }
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "SELECT * FROM users WHERE email = ?";
            const users = yield (0, db_1.query)(sql, [email]);
            return users[0];
        });
    }
    updateUserRole(userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateSql = `
      UPDATE users 
      SET role = ? 
      WHERE id = ?
    `;
            yield (0, db_1.query)(updateSql, [role, parseInt(userId)]);
            const getUserSql = "SELECT * FROM users WHERE id = ?";
            const users = yield (0, db_1.query)(getUserSql, [parseInt(userId)]);
            return users[0];
        });
    }
    updateUserPassword(userId, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPassword = yield user_1.UserService.hashPassword(newPassword);
            const updateSql = `
      UPDATE users 
      SET password = ? 
      WHERE id = ?
    `;
            yield (0, db_1.query)(updateSql, [hashedPassword, parseInt(userId)]);
            const getUserSql = "SELECT * FROM users WHERE id = ?";
            const users = yield (0, db_1.query)(getUserSql, [parseInt(userId)]);
            return users[0];
        });
    }
    updateUserProfile(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, { name, email, phone } = {}) {
            const setValues = Object.entries({ name, email, phone })
                .filter(([_, value]) => value !== undefined)
                .map(([key, value]) => `${key} = ?`)
                .join(", ");
            const updateSql = `
      UPDATE users 
      SET ${setValues} 
      WHERE id = ?
    `;
            yield (0, db_1.query)(updateSql, [
                ...Object.values({ name, email, phone }).filter((v) => v !== undefined),
                parseInt(userId),
            ]);
        });
    }
    getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "SELECT * FROM users";
            const users = yield (0, db_1.query)(sql);
            if (users.length === 0) {
                return [];
            }
            return users;
        });
    }
    getUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "SELECT * FROM users WHERE id = ?";
            const users = yield (0, db_1.query)(sql, [parseInt(userId)]);
            return users[0];
        });
    }
    // get getShopkeepers
    getShopkeepers() {
        return __awaiter(this, void 0, void 0, function* () {
            // get only users with role SHOPKEEPER and ADMIN
            const sql = "SELECT * FROM users WHERE role = 'SHOPKEEPER' OR role = 'ADMIN'";
            const users = yield (0, db_1.query)(sql);
            return users;
        });
    }
    // get getStorekeepers
    getStorekeepers() {
        return __awaiter(this, void 0, void 0, function* () {
            // get only users with role STOREKEEPER and ADMIN
            const sql = "SELECT * FROM users WHERE role = 'STOREKEEPER' OR role = 'ADMIN'";
            const users = yield (0, db_1.query)(sql);
            return users;
        });
    }
    // get users by role
    getUsersByRole(role) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "SELECT * FROM users WHERE role = ?";
            const users = yield (0, db_1.query)(sql, [role]);
            return users;
        });
    }
    // delete user
    deleteUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "DELETE FROM users WHERE id = ?";
            yield (0, db_1.query)(sql, [parseInt(userId)]);
            return true;
        });
    }
}
exports.UserService = UserService;
