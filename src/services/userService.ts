import { AppDataSource } from "../config/db";
import User from "../models/user";

export class UserService {
  async createUser(userData: any) {
    const userRepository = AppDataSource.getRepository(User);
    const user = userRepository.create(userData);
    return await userRepository.save(user);
  }

  async findUserByEmail(email: string) {
    const userRepository = AppDataSource.getRepository(User);
    return await userRepository.findOne({ where: { email } });
  }

  async updateUserRole(
    userId: string,
    role: "admin" | "shopkeeper" | "storekeeper" | "user"
  ) {
    const userRepository = AppDataSource.getRepository(User);
    await userRepository.update({ id: parseInt(userId) }, { role });
    return await userRepository.findOne({ where: { id: parseInt(userId) } });
  }

  async getAllUsers() {
    console.log("Fetching all users from the database");
    const userRepository = AppDataSource.getRepository(User);
    // Log the number of users in the database
    const users = await userRepository.find({});
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
    const userRepository = AppDataSource.getRepository(User);
    return await userRepository.findOne({ where: { id: parseInt(userId) } });
  }
}
