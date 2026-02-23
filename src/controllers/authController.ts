import { Request, Response } from "express";
import { sendEmail } from "../services/emailService";
import { AuthService } from "../services/authService";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

class AuthController {
  async verifyEmail(req: Request, res: Response) {
    const token = typeof req.query.token === "string" ? req.query.token : "";
    const authService = new AuthService();
    try {
      await authService.verifyEmail(token);
      res.status(200).json({ message: "Email verified successfully" });
    } catch (error: any) {
      res.status(400).json({
        message: error.message || "Invalid or expired verification token",
      });
    }
  }

  async register(req: Request, res: Response) {
    const { name, email, password, phone, role } = req.body as {
      name: string;
      email: string;
      password: string;
      phone: string;
      role?: string;
    };
    const authService = new AuthService();
    try {
      const jwtSecret = process.env.JWT_SECRET || "default_secret";
      const verificationToken = require("jsonwebtoken").sign(
        { email },
        jwtSecret,
        { expiresIn: "1d" },
      );
      const newUser = await authService.registerUser({
        name,
        email,
        password,
        phone,
        role: role as any,
        verificationToken,
      });
      // Send verification email
      // const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

      const verifyUrl = `https://mardtrading.com/api/auth/verify-email?token=${verificationToken}`;
      await sendEmail(
        email,
        "Verify your email",
        `Please verify your email by clicking the following link: ${verifyUrl}`,
        `<p>Please verify your email by clicking the following link: <a href="${verifyUrl}">${verifyUrl}</a></p>`,
      );
      res.status(201).json({
        message:
          "User registered. Please check your email to verify your account.",
      });
    } catch (error: any) {
      console.log("Error in register:-", error);
      res
        .status(500)
        .json({ message: error.message || "Error registering user" });
    }
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body as { email: string; password: string };
    const authService = new AuthService();
    try {
      const user = await authService.loginUser(email, password);
      // Generate JWT
      const token = require("jsonwebtoken").sign(
        { user },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "7d" },
      );
      res.status(200).json({
        token,
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error: any) {
      res.status(401).json({ message: error.message || "Error logging in" });
    }
  }

  async logout(req: Request, res: Response) {
    // Invalidate the token on the client-side, no server-side action needed
    res.status(200).json({ message: "Logged out successfully" });
  }

  // ──────────────────────────────────────────────
  // Forgot Password – send reset link
  // ──────────────────────────────────────────────
  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    const authService = new AuthService();

    try {
      const user = await authService.findUserByEmail(email);

      // Always return the same generic message (prevents user enumeration)
      if (!user) {
        return res.status(200).json({
          message:
            "If the email is registered, you will receive a password reset link shortly.",
        });
      }

      const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

      // Short-lived reset token (30 minutes)
      const resetToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          purpose: "password_reset",
        },
        JWT_SECRET,
        { expiresIn: "30m" },
      );

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
      await sendEmail(user.email, subject, text, html);

      return res.status(200).json({
        message:
          "If the email is registered, you will receive a password reset link shortly.",
      });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      // Still return generic success message
      return res.status(200).json({
        message:
          "If the email is registered, you will receive a password reset link shortly.",
      });
    }
  }

  // ──────────────────────────────────────────────
  // Reset Password – validate token & change password
  // ──────────────────────────────────────────────
  async resetPassword(req: Request, res: Response) {
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

    const authService = new AuthService();
    const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

      if (decoded.purpose !== "password_reset") {
        throw new Error("Invalid token");
      }

      const user = await authService.findUserById(decoded.userId);

      if (!user || user.email !== decoded.email) {
        throw new Error("Invalid or expired reset token");
      }

      // Change password
      await authService.updatePassword(user.id, password);

      return res.status(200).json({
        message:
          "Password has been reset successfully. You can now log in with your new password.",
      });
    } catch (error: any) {
      console.error("Reset password error:", error);
      return res.status(400).json({
        message:
          error.message ||
          "Invalid or expired reset token. Please request a new one.",
      });
    }
  }
}

export default new AuthController();
