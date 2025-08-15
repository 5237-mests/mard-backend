import { Request, Response } from "express";
import { StoreService } from "../services/storeService";

export class StoreController {
  /**
   * Creates a new store.
   * @param req The HTTP request object.
   * @param res The HTTP response object.
   * @returns A Promise that resolves when the store is created.
   * @throws Will return a 400 error if name or location is missing from the request body.
   * @throws Will return a 500 error if there is an error creating the store.
   */
  public static async createStore(req: Request, res: Response) {
    const { name, location } = req.body;
    if (!name || !location) {
      res.status(400).json({ message: "Name and location are required." });
      return;
    }

    try {
      const newstore = await StoreService.createStore(name, location);
      res.status(201).json(newstore);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async getStores(_req: Request, res: Response) {
    try {
      const stores = await StoreService.getStores();
      res.status(200).json(stores);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async getStoreById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const store = await StoreService.getStoreById(parseInt(id, 10));
      if (!store) {
        res.status(404).json({ message: "store not found." });
        return;
      }
      res.status(200).json(store);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async updateStore(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { name, location } = req.body;
    try {
      const updatedstore = await StoreService.updateStore(
        parseInt(id, 10),
        name,
        location
      );
      if (!updatedstore) {
        res.status(404).json({ message: "store not found." });
        return;
      }
      res.status(200).json(updatedstore);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async deleteStore(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const success = await StoreService.deleteStore(parseInt(id, 10));
      if (!success) {
        res.status(404).json({ message: "store not found." });
        return;
      }
      res.status(200).json({ message: "store deleted successfully." });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
