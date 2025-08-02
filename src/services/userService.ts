import { query } from "../config/db";
import { User, Role } from "../types/database";
import { UserService as UserUtility } from "../models/user";

export class UserService {
  async createUser(userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: Role;
    isVerified?: boolean;
    verificationToken?: string;
  }) {
    const hashedPassword = await UserUtility.hashPassword(userData.password);
    const sql = `
      INSERT INTO users (name, email, phone, password, role, isVerified, verificationToken)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      userData.name,
      userData.email,
      userData.phone,
      hashedPassword,
      userData.role || 'USER',
      userData.isVerified || false,
      userData.verificationToken || null
    ];
    
    const result: any = await query(sql, params);
    
    // Fetch the newly created user
    const newUserSql = "SELECT * FROM users WHERE id = ?";
    const newUsers = await query(newUserSql, [result.insertId]);
    return newUsers[0] as User;
  }

  async findUserByEmail(email: string) {
    const sql = "SELECT * FROM users WHERE email = ?";
    const users = await query(sql, [email]);
    return users[0] as User | undefined;
  }

  async updateUserRole(
    userId: string,
    role: Role
  ) {
    const updateSql = `
      UPDATE users 
      SET role = ? 
      WHERE id = ?
    `;
    await query(updateSql, [role, parseInt(userId)]);
    
    const getUserSql = "SELECT * FROM users WHERE id = ?";
    const users = await query(getUserSql, [parseInt(userId)]);
    return users[0] as User;
  }

  async getAllUsers() {
    console.log("Fetching all users from the database");
    const sql = "SELECT * FROM users";
    const users = await query(sql);
    console.log("Total users in database:", users.length);
    console.log("Returning all users:", users);
    if (users.length === 0) {
      console.log("No users found in the database");
      return [];
    }
    return users as User[];
  }

  async getUserById(userId: string) {
    const sql = "SELECT * FROM users WHERE id = ?";
    const users = await query(sql, [parseInt(userId)]);
    return users[0] as User | undefined;
  }
}
