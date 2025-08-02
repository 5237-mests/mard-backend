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
      INSERT INTO users (name, email, phone, password, role, isVerified, verificationToken)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
            const params = [
                data.name,
                data.email,
                data.phone,
                hashedPassword,
                data.role || 'USER',
                false,
                data.verificationToken
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
      WHERE email = ? AND verificationToken = ?
    `;
            const users = yield (0, db_1.query)(findUserSql, [payload.email, token]);
            const user = users[0];
            if (!user)
                throw new Error("Invalid or expired verification token");
            const updateSql = `
      UPDATE users 
      SET isVerified = ?, verificationToken = ? 
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
            const sql = "SELECT * FROM users WHERE email = ?";
            const users = yield (0, db_1.query)(sql, [email]);
            const user = users[0];
            if (!user)
                throw new Error("Invalid credentials");
            const isMatch = yield bcrypt_1.default.compare(password, user.password);
            if (!isMatch)
                throw new Error("Invalid credentials");
            if (!user.isVerified)
                throw new Error("Email not verified");
            return user;
        });
    }
}
exports.AuthService = AuthService;
