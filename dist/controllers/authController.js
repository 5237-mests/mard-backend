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
const emailService_1 = require("../services/emailService");
const authService_1 = require("../services/authService");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class AuthController {
    verifyEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = typeof req.query.token === "string" ? req.query.token : "";
            const authService = new authService_1.AuthService();
            try {
                yield authService.verifyEmail(token);
                res.status(200).json({ message: "Email verified successfully" });
            }
            catch (error) {
                res.status(400).json({
                    message: error.message || "Invalid or expired verification token",
                });
            }
        });
    }
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, password, phone, role } = req.body;
            const authService = new authService_1.AuthService();
            try {
                const jwtSecret = process.env.JWT_SECRET || "default_secret";
                const verificationToken = require("jsonwebtoken").sign({ email }, jwtSecret, { expiresIn: "1d" });
                const newUser = yield authService.registerUser({
                    name,
                    email,
                    password,
                    phone,
                    role: role, // Cast role to allow string conversion
                    verificationToken,
                });
                // Send verification email
                // const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
                const verifyUrl = `http://localhost:5000/api/auth/verify-email?token=${verificationToken}`;
                yield (0, emailService_1.sendEmail)(email, "Verify your email", `Please verify your email by clicking the following link: ${verifyUrl}`);
                res.status(201).json({
                    message: "User registered. Please check your email to verify your account.",
                });
            }
            catch (error) {
                console.log("Error in register:-", error);
                res
                    .status(500)
                    .json({ message: error.message || "Error registering user" });
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            const authService = new authService_1.AuthService();
            try {
                const user = yield authService.loginUser(email, password);
                // Generate JWT
                const token = require("jsonwebtoken").sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || "default_secret", { expiresIn: "7d" });
                res.status(200).json({
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    },
                });
            }
            catch (error) {
                res.status(401).json({ message: error.message || "Error logging in" });
            }
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // Invalidate the token on the client-side, no server-side action needed
            res.status(200).json({ message: "Logged out successfully" });
        });
    }
}
exports.default = new AuthController();
