import { Request, Response } from "express";
import { UserService } from "../services/userService";

class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public async getUserDetails(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.params.id;
      const user = await this.userService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  }

  public async updateUserRole(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.params.id;
      const { role } = req.body;
      const updatedUser = await this.userService.updateUserRole(userId, role);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json(updatedUser);
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  }

  public async listAllUsers(req: Request, res: Response): Promise<Response> {
    try {
      console.log("Listing all users");
      const users = await this.userService.getAllUsers();
      console.log("Listing all users:", users.length, "users found");
      return res.status(200).json(users);
    } catch (error) {
      console.error("Error in listAllUsers:", error);
      if (error instanceof Error) {
        console.error("Error stack:", error.stack);
      }
      return res
        .status(500)
        .json({ message: "Server error *** from controller", error });
    }
  }
}

export default UserController;
