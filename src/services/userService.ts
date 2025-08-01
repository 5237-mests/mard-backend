import { prisma } from "../config/db";
import { User, Role } from "../types/prisma";
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
    return await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        role: userData.role || 'USER',
      },
    });
  }

  async findUserByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email } });
  }

  async updateUserRole(
    userId: string,
    role: Role
  ) {
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { role },
    });
    return await prisma.user.findUnique({ where: { id: parseInt(userId) } });
  }

  async getAllUsers() {
    console.log("Fetching all users from the database");
    // Log the number of users in the database
    const users = await prisma.user.findMany({});
    console.log("Total users in database:", users.length);
    // Return the list of users
    console.log("Returning all users:", users);
    if (users.length === 0) {
      console.log("No users found in the database");
      return [];
    }
    return users;
  }

  async getUserById(userId: string) {
    return await prisma.user.findUnique({ where: { id: parseInt(userId) } });
  }
}
