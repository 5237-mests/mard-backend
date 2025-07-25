import User from "../models/user";

export class UserService {
  async createUser(userData: any) {
    const user = new User(userData);
    return await user.save();
  }

  async findUserByEmail(email: string) {
    return await User.findOne({ email });
  }

  async updateUserRole(
    userId: string,
    role: "admin" | "shopkeeper" | "storekeeper" | "user"
  ) {
    return await User.findByIdAndUpdate(userId, { role }, { new: true });
  }

  async getAllUsers() {
    return await User.find();
  }

  async getUserById(userId: string) {
    return await User.findById(userId);
  }
}
