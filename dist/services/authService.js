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
exports.AuthService = void 0;
const db_1 = require("../config/db");
const user_1 = require("../models/user");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
class AuthService {
    registerUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPassword = yield user_1.UserService.hashPassword(data.password);
            const sql = `
      INSERT INTO users (name, email, phone, password, role, verification_token)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
            const params = [
                data.name,
                data.email,
                data.phone,
                hashedPassword,
                data.role || "USER",
                data.verificationToken,
            ];
            const result = yield (0, db_1.query)(sql, params);
            // Fetch the newly created user
            const newUserSql = "SELECT * FROM users WHERE id = ?";
            const newUsers = yield (0, db_1.query)(newUserSql, [result.insertId]);
            return newUsers[0];
        });
    }
    verifyEmail(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const jwtSecret = process.env.JWT_SECRET || "default_secret";
            const payload = jsonwebtoken_1.default.verify(token, jwtSecret);
            const findUserSql = `
      SELECT * FROM users 
      WHERE email = ? AND verification_token = ?
    `;
            const users = yield (0, db_1.query)(findUserSql, [payload.email, token]);
            const user = users[0];
            if (!user)
                throw new Error("Invalid or expired verification token");
            const updateSql = `
      UPDATE users 
      SET is_verified = ?, verification_token = ? 
      WHERE id = ?
    `;
            yield (0, db_1.query)(updateSql, [true, null, user.id]);
            // Fetch the updated user
            const updatedUserSql = "SELECT * FROM users WHERE id = ?";
            const updatedUsers = yield (0, db_1.query)(updatedUserSql, [user.id]);
            return updatedUsers[0];
        });
    }
    loginUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
    SELECT u.*, ss.shop_id, sst.store_id
    FROM users u
    LEFT JOIN shop_shopkeepers ss ON u.id = ss.user_id
    LEFT JOIN store_storekeepers sst ON u.id = sst.user_id
    WHERE u.email = ?
  `;
            const users = yield (0, db_1.query)(sql, [email]);
            const user = users[0];
            if (!user)
                throw new Error("Invalid credentials");
            const isMatch = yield bcrypt_1.default.compare(password, user.password);
            if (!isMatch)
                throw new Error("Invalid credentials");
            if (!user.is_verified)
                throw new Error("Email not verified");
            // if (!user.shop_id) throw new Error("User not assigned to a shop");
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                is_verified: user.is_verified,
                shopId: user.shop_id,
                storeId: user.store_id,
            };
        });
    }
    /**
     * Find user by email - returns null if not found (important for security)
     */
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
    SELECT id, name, email, password, role, is_verified, verification_token
    FROM users 
    WHERE email = ?
  `;
            const users = yield (0, db_1.query)(sql, [email.trim().toLowerCase()]);
            if (users.length === 0)
                return null;
            return users[0];
        });
    }
    /**
     * Find user by ID
     */
    findUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
    SELECT id, name, email, password, role, is_verified
    FROM users 
    WHERE id = ?
  `;
            const users = yield (0, db_1.query)(sql, [id]);
            if (users.length === 0)
                return null;
            return users[0];
        });
    }
    /**
     * Update user's password (hashes automatically via UserService)
     */
    updatePassword(userId, newPlainPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPassword = yield user_1.UserService.hashPassword(newPlainPassword);
            const sql = `
    UPDATE users 
    SET password = ?
    WHERE id = ?
  `;
            yield (0, db_1.query)(sql, [hashedPassword, userId]);
        });
    }
}
exports.AuthService = AuthService;
