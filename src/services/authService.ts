import { prisma } from "../config/db";
import { User, Role } from "../types/prisma";
import { UserService } from "../models/user";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export class AuthService {
  async registerUser(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: Role;
    verificationToken: string;
  }) {
    const hashedPassword = await UserService.hashPassword(data.password);
    const newUser = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        role: data.role || 'USER',
        isVerified: false,
      },
    });
    return newUser;
  }

  async verifyEmail(token: string) {
    const jwtSecret = process.env.JWT_SECRET || "default_secret";
    const payload = jwt.verify(token, jwtSecret);
    const user = await prisma.user.findFirst({
      where: {
        email: (payload as any).email,
        verificationToken: token,
      }
    });
    if (!user) throw new Error("Invalid or expired verification token");
    
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });
    return updatedUser;
  }

  async loginUser(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid credentials");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");
    if (!user.isVerified) throw new Error("Email not verified");
    return user;
  }
}
