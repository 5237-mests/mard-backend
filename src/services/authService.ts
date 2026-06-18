import { query } from "../config/db";
import { User, Role } from "../types/database";
import { UserService } from "../models/user";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

interface User2 {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
  is_verified: boolean;
  shopId: string; // Added to include shop_id
  storeId: number; // Added to include store_id
}

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

  async loginUser(email: string, password: string): Promise<User2> {
    const sql = `
    SELECT u.*, ss.shop_id, sst.store_id
    FROM users u
    LEFT JOIN shop_shopkeepers ss ON u.id = ss.user_id
    LEFT JOIN store_storekeepers sst ON u.id = sst.user_id
    WHERE u.email = ?
  `;
    const users = await query(sql, [email]);
    const user = users[0];

    if (!user) throw new Error("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");
    if (!user.is_verified) throw new Error("Email not verified");
    // if (!user.shop_id) throw new Error("User not assigned to a shop");

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_verified: user.is_verified,
      shopId: user.shop_id,
      storeId: user.store_id,
    } as User2;
  }

  /**
   * Find user by email - returns null if not found (important for security)
   */
  async findUserByEmail(email: string): Promise<User | null> {
    const sql = `
    SELECT id, name, email, password, role, is_verified, verification_token
    FROM users 
    WHERE email = ?
  `;
    const users = await query(sql, [email.trim().toLowerCase()]);

    if (users.length === 0) return null;
    return users[0] as User;
  }

  /**
   * Find user by ID
   */
  async findUserById(id: number): Promise<User | null> {
    //   const sql = `
    //   SELECT id, name, email, password, role, is_verified
    //   FROM users 
    //   WHERE id = ?
    // `;

    const sql = `
    SELECT u.*, ss.shop_id, sst.store_id
    FROM users u
    LEFT JOIN shop_shopkeepers ss ON u.id = ss.user_id
    LEFT JOIN store_storekeepers sst ON u.id = sst.user_id
    WHERE u.id = ?
  `;

    const users = await query(sql, [id]);
    if (users.length === 0) return null;
    return users[0] as User;
  }

  /**
   * Update user's password (hashes automatically via UserService)
   */
  async updatePassword(
    userId: number,
    newPlainPassword: string,
  ): Promise<void> {
    const hashedPassword = await UserService.hashPassword(newPlainPassword);

    const sql = `
    UPDATE users 
    SET password = ?
    WHERE id = ?
  `;
    await query(sql, [hashedPassword, userId]);
  }
}
