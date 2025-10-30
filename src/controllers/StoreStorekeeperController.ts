// File: src/controllers/storestorekeeperController.ts
// This controller handles HTTP requests for the store_storekeepers relationship.
import { Request, Response } from "express";
// import { storestorekeeperService } from "../services/storestorekeeperService";
import { StoreStorekeeperService } from "../services/StoreStorekeeperService";

export class storestorekeeperController {
  public static async addstorekeeperTostore(req: Request, res: Response) {
    const { storeId, userId } = req.params;
    try {
      const newLink = await StoreStorekeeperService.addStorekeeperTostore(
        parseInt(storeId, 10),
        parseInt(userId, 10)
      );
      res.status(201).json(newLink);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async removestorekeeperFromstore(
    req: Request,
    res: Response
  ): Promise<void> {
    const { storeId, userId } = req.params;
    try {
      const success = await StoreStorekeeperService.removeStorekeeperFromstore(
        parseInt(storeId, 10),
        parseInt(userId, 10)
      );
      if (!success) {
        res.status(404).json({
          message: "Link not found. storekeeper is not assigned to this store.",
        });
        return;
      }
      res.status(204).send(); // No content
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async getstorekeepersBystoreId(req: Request, res: Response) {
    const { storeId } = req.params;
    try {
      const storekeepers =
        await StoreStorekeeperService.getStorekeepersByStoreId(
          parseInt(storeId, 10)
        );
      res.status(200).json(storekeepers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async getstoresBystorekeeperId(
    req: Request,
    res: Response
  ): Promise<void> {
    const { userId } = req.params;
    try {
      const stores = await StoreStorekeeperService.getStoresByStorekeeperId(
        parseInt(userId, 10)
      );
      res.status(200).json(stores);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
