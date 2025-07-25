import { Request, Response } from "express";
import User from "../models/user";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

class AuthController {
  async register(req: Request, res: Response) {
    const { name, email, password, phone } = req.body;

    try {
      console.log("Registering user:", { name, email, password, phone });
      const newUser = new User({
        name,
        email,
        phone,
        password,
        role: "user",
      });
      await newUser.save();
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error registering user", error });
    }
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      console.log("Login attempt:", { email, password });
      const user = await User.findOne({ email });
      console.log("User found:", user ? user.email : null);
      if (!user) {
        console.log("No user found for email:", email);
        return res.status(401).json({ message: "Invalid credentials**email" });
      }

      console.log("Comparing passwords:", password, user.password);
      const isMatch = await bcrypt.compare(password, user.password);
      console.log("Password match:", isMatch);
      if (!isMatch) {
        console.log("Password mismatch for email:", email);
        return res
          .status(401)
          .json({ message: "Invalid credentials**password" });
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );
      console.log("JWT generated for:", email);
      res.status(200).json({ token });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Error logging in", error });
    }
  }

  async logout(req: Request, res: Response) {
    // Invalidate the token on the client-side, no server-side action needed
    res.status(200).json({ message: "Logged out successfully" });
  }
}

export default new AuthController();
