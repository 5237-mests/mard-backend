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
                userData.role || 'USER',
                userData.isVerified || false,
                userData.verificationToken || null
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
    getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Fetching all users from the database");
            const sql = "SELECT * FROM users";
            const users = yield (0, db_1.query)(sql);
            console.log("Total users in database:", users.length);
            console.log("Returning all users:", users);
            if (users.length === 0) {
                console.log("No users found in the database");
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
}
exports.UserService = UserService;
