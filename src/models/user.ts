import bcrypt from "bcrypt";
import { User as PrismaUser, Role } from "../types/prisma";

export interface IUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  isVerified?: boolean;
  verificationToken?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export class UserService {
  static async hashPassword(password: string): Promise<string> {
    if (password && !password.startsWith('$2')) {
      return await bcrypt.hash(password, 10);
    }
    return password;
  }

  static async comparePassword(candidatePassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, hashedPassword);
  }
}

// Export Prisma User type as default
export type User = PrismaUser;
export default User;
