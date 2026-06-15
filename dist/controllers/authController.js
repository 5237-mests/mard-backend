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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
                    role: role,
                    verificationToken,
                });
                // Send verification email
                // const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
                const verifyUrl = `https://mardtrading.com/api/auth/verify-email?token=${verificationToken}`;
                yield (0, emailService_1.sendEmail)(email, "Verify your email", `Please verify your email by clicking the following link: ${verifyUrl}`, `<p>Please verify your email by clicking the following link: <a href="${verifyUrl}">${verifyUrl}</a></p>`);
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
                // Generate short-lived access token (15 minutes)
                const accessToken = jsonwebtoken_1.default.sign({
                    userId: user.id,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        shopId: user.shopId,
                        storeId: user.storeId,
                    },
                }, process.env.JWT_SECRET || "default_secret", { expiresIn: "180m" });
                // Generate long-lived refresh token (7 days).
                const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET || "refresh_secret", { expiresIn: "7d" });
                // Set HttpOnly refresh token cookie
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    // secure: process.env.NODE_ENV === "production",
                    secure: true, // For development, set to true for HTTPS
                    // sameSite: "strict",
                    sameSite: "none", // Adjusted for cross-origin requests
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                    path: "/",
                });
                // Return access token in response body
                res.status(200).json({
                    accessToken,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        shopId: user.shopId,
                        storeId: user.storeId,
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
            // Clear the refresh token cookie
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
            });
            res.status(200).json({ message: "Logged out successfully" });
        });
    }
    // Refresh access token using HttpOnly refresh token cookie
    refreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
                if (!refreshToken) {
                    return res.status(401).json({ message: "No refresh token found" });
                }
                const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || "refresh_secret");
                const authService = new authService_1.AuthService();
                const user = yield authService.findUserById(decoded.userId);
                if (!user)
                    return res.status(401).json({ message: "User not found" });
                // Generate new access token
                const newAccessToken = jsonwebtoken_1.default.sign({
                    userId: user.id,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        shopId: user.shopId,
                        storeId: user.storeId,
                    },
                }, process.env.JWT_SECRET || "default_secret", { expiresIn: "15m" });
                // Rotate refresh token (optional but recommended).
                const newRefreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET || "refresh_secret", { expiresIn: "7d" });
                res.cookie("refreshToken", newRefreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                    path: "/",
                });
                return res.json({ accessToken: newAccessToken });
            }
            catch (error) {
                return res
                    .status(401)
                    .json({ message: error.message || "Invalid refresh token" });
            }
        });
    }
    // ──────────────────────────────────────────────
    // Forgot Password – send reset link.
    // ──────────────────────────────────────────────
    forgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            if (!email || typeof email !== "string" || !email.includes("@")) {
                return res.status(400).json({ message: "Valid email is required" });
            }
            const authService = new authService_1.AuthService();
            try {
                const user = yield authService.findUserByEmail(email);
                // Always return the same generic message (prevents user enumeration)
                if (!user) {
                    return res.status(200).json({
                        message: "If the email is registered, you will receive a password reset link shortly.",
                    });
                }
                const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
                // Short-lived reset token (30 minutes)
                const resetToken = jsonwebtoken_1.default.sign({
                    userId: user.id,
                    email: user.email,
                    purpose: "password_reset",
                }, JWT_SECRET, { expiresIn: "30m" });
                const frontendUrl = process.env.FRONTEND_URL || "https://mardtrading.com";
                const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
                // In forgotPassword method, after generating resetUrl
                const subject = "Reset Your MARD Password";
                const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style type="text/css">
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacOSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f9; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 40px 30px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
    .content { padding: 40px 30px; color: #333333; line-height: 1.6; font-size: 16px; }
    .button { display: inline-block; background: #4f46e5; color: white !important; padding: 16px 36px; text-decoration: none; border-radius: 6px; font-size: 18px; font-weight: 500; margin: 24px 0; }
    .button:hover { background: #4338ca; }
    .footer { background: #f8f9fa; padding: 30px; text-align: center; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; }
    .small { font-size: 14px; color: #6b7280; }
    @media only screen and (max-width: 600px) {
      .content { padding: 30px 20px; }
      .button { width: 100%; box-sizing: border-box; text-align: center; }
    }
  </style>
</head>
<body>
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#f4f4f9; padding: 20px 0;">
    <tr>
      <td align="center">
        <table class="container" border="0" cellspacing="0" cellpadding="0">
          <!-- Header -->
          <tr>
            <td class="header">
              <h1>Password Reset Request</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td class="content">
              <p>Hello ${user.name || "there"},</p>
              <p>You (or someone else) requested to reset the password for your MARD Trading account.</p>
              <p>Click the button below to set a new password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button" target="_blank" rel="noopener noreferrer">
                  Reset My Password
                </a>
              </div>
              
              <p class="small">This link expires in <strong>30 minutes</strong> and can only be used once for security reasons.</p>
              <p class="small">If you didn't request this reset, you can safely ignore this email — your password remains unchanged.</p>
              
              <p>Need help? Contact support at <a href="mailto:support@mardtrading.com">support@mardtrading.com</a></p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td class="footer">
              <p>MARD Trading &bull; Mobile Sales & Maintenance System</p>
              <p>&copy; ${new Date().getFullYear()} MARD Trading. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
                const text = `
Hello ${user.name || "there"},

You requested a password reset for your MARD Trading account.

Reset your password here: ${resetUrl}

This link expires in 30 minutes and can only be used once.

If you didn't make this request, ignore this email — your password is still secure.

Need help? Contact support: support@mardtrading.com

Best regards,
MARD Trading Team
`;
                // Then send
                yield (0, emailService_1.sendEmail)(user.email, subject, text, html);
                return res.status(200).json({
                    message: "If the email is registered, you will receive a password reset link shortly.",
                });
            }
            catch (error) {
                console.error("Forgot password error:", error);
                // Still return generic success message
                return res.status(200).json({
                    message: "If the email is registered, you will receive a password reset link shortly.",
                });
            }
        });
    }
    // ──────────────────────────────────────────────
    // Reset Password – validate token & change password
    // ──────────────────────────────────────────────
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { token, password } = req.body;
            if (!token || !password || typeof password !== "string") {
                return res
                    .status(400)
                    .json({ message: "Token and new password are required" });
            }
            if (password.length < 8) {
                return res.status(400).json({
                    message: "Password must be at least 8 characters long",
                });
            }
            const authService = new authService_1.AuthService();
            const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
            try {
                // Verify token
                const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                if (decoded.purpose !== "password_reset") {
                    throw new Error("Invalid token");
                }
                const user = yield authService.findUserById(decoded.userId);
                if (!user || user.email !== decoded.email) {
                    throw new Error("Invalid or expired reset token");
                }
                // Change password
                yield authService.updatePassword(user.id, password);
                return res.status(200).json({
                    message: "Password has been reset successfully. You can now log in with your new password.",
                });
            }
            catch (error) {
                console.error("Reset password error:", error);
                return res.status(400).json({
                    message: error.message ||
                        "Invalid or expired reset token. Please request a new one.",
                });
            }
        });
    }
}
exports.default = new AuthController();
