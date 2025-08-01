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
            const newUser = yield db_1.prisma.user.create({
                data: Object.assign(Object.assign({}, data), { password: hashedPassword, role: data.role || 'USER', isVerified: false }),
            });
            return newUser;
        });
    }
    verifyEmail(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const jwtSecret = process.env.JWT_SECRET || "default_secret";
            const payload = jsonwebtoken_1.default.verify(token, jwtSecret);
            const user = yield db_1.prisma.user.findFirst({
                where: {
                    email: payload.email,
                    verificationToken: token,
                }
            });
            if (!user)
                throw new Error("Invalid or expired verification token");
            const updatedUser = yield db_1.prisma.user.update({
                where: { id: user.id },
                data: {
                    isVerified: true,
                    verificationToken: null,
                },
            });
            return updatedUser;
        });
    }
    loginUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield db_1.prisma.user.findUnique({ where: { email } });
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
