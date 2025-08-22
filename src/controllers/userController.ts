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

  public async getUsersByRole(req: Request, res: Response) {
    try {
      const { role } = req.query;
      if (!role) {
        return res.status(400).json({
          message:
            "Invalid role parameter. Only shopkeeper or storekeeper is supported.'",
        });
      }

      if (role === "shopkeeper") {
        const shopkeepers = await this.userService.getShopkeepers();
        return res.status(200).json(shopkeepers);
      } else if (role === "storekeeper") {
        const storekeepers = await this.userService.getStorekeepers();
        return res.status(200).json(storekeepers);
      } else {
        return res.status(400).json({
          message:
            "Invalid role parameter. Only shopkeeper or storekeeper is supported.'",
        });
      }
    } catch (error) {}
  }

  public async getShopkeepers(req: Request, res: Response): Promise<Response> {
    try {
      const { role } = req.query;
      if (role && role !== "shopkeeper") {
        return res.status(400).json({
          message: "Invalid role parameter. Only shopkeeper is supported.'",
        });
      }
      const shopkeepers = await this.userService.getShopkeepers();
      return res.status(200).json(shopkeepers);
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

  public async updateUserProfile(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const userId = req.params.id;
      const { name, email, phone } = req.body;
      const updatedUser = await this.userService.updateUserProfile(userId, {
        name,
        email,
        phone,
      });
      return res.status(200).json(updatedUser);
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  }

  public async updateUserPassword(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const userId = req.params.id;
      const { newPassword } = req.body;
      const updatedUser = await this.userService.updateUserPassword(
        userId,
        newPassword
      );
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
      const users = await this.userService.getAllUsers();
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

  // Delete user
  public async deleteUser(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.params.id;
      const deletedUser = await this.userService.deleteUser(userId);
      if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  }
}

export default UserController;
