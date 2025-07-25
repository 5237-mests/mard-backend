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
    console.log("Fetching all users from the database");
    // Log the number of users in the database
    const users = await User.find({});
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
    return await User.findById(userId);
  }
}
