import User, { IUser } from "../models/user";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export class AuthService {
  async registerUser(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: string;
    verificationToken: string;
  }) {
    const newUser = new User({
      ...data,
      isVerified: false,
    });
    await newUser.save();
    return newUser;
  }

  async verifyEmail(token: string) {
    const jwtSecret = process.env.JWT_SECRET || "default_secret";
    const payload = jwt.verify(token, jwtSecret);
    const user = await User.findOne({
      email: (payload as any).email,
      verificationToken: token,
    });
    if (!user) throw new Error("Invalid or expired verification token");
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    return user;
  }

  async loginUser(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid credentials");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");
    if (!user.isVerified) throw new Error("Email not verified");
    return user;
  }
}
