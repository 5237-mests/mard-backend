import { Request, Response } from "express";
import { sendEmail } from "../services/emailService";
import { AuthService } from "../services/authService";
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
        { expiresIn: "1d" }
      );
      const newUser = await authService.registerUser({
        name,
        email,
        password,
        phone,
        role: role as any, // Cast role to allow string conversion
        verificationToken,
      });
      // Send verification email
      // const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

      const verifyUrl = `https://mardtrading.com/api/auth/verify-email?token=${verificationToken}`;
      await sendEmail(
        email,
        "Verify your email",
        `Please verify your email by clicking the following link: ${verifyUrl}`
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
        { expiresIn: "7d" }
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
}

export default new AuthController();
