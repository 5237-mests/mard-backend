import { query } from "../config/db";
import { User, Role } from "../types/database";
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

    const result: any = await query(sql, params);

    // Fetch the newly created user
    const newUserSql = "SELECT * FROM users WHERE id = ?";
    const newUsers = await query(newUserSql, [result.insertId]);
    return newUsers[0] as User;
  }

  async verifyEmail(token: string) {
    const jwtSecret = process.env.JWT_SECRET || "default_secret";
    const payload = jwt.verify(token, jwtSecret);

    const findUserSql = `
      SELECT * FROM users 
      WHERE email = ? AND verification_token = ?
    `;
    const users = await query(findUserSql, [(payload as any).email, token]);
    const user = users[0];

    if (!user) throw new Error("Invalid or expired verification token");

    const updateSql = `
      UPDATE users 
      SET is_verified = ?, verification_token = ? 
      WHERE id = ?
    `;
    await query(updateSql, [true, null, user.id]);

    // Fetch the updated user
    const updatedUserSql = "SELECT * FROM users WHERE id = ?";
    const updatedUsers = await query(updatedUserSql, [user.id]);
    return updatedUsers[0] as User;
  }

  async loginUser(email: string, password: string) {
    const sql = "SELECT * FROM users WHERE email = ?";
    const users = await query(sql, [email]);
    const user = users[0];

    if (!user) throw new Error("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");
    if (!user.is_verified) throw new Error("Email not verified");

    return user as User;
  }
}
