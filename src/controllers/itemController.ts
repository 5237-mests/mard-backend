import { Request, Response } from "express";
import { ItemService } from "../services/itemService";
import { Item } from "../types/database";
import fs from "fs/promises";
import path from "path";

class ItemController {
  /**
   * Retrieves all items from the database.
   * @param req - Express request object
   * @param res - Express response object
   * @returns A promise that resolves when the response has been sent
   */
  async getAllItems(req: Request, res: Response) {
    try {
      const itemService = new ItemService();
      const items = await itemService.getAllItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).json({ error: "Failed to fetch items" });
    }
  }

  /**
   * Retrieves an item by its ID from the database.
   * @param req - Express request object
   * @param res - Express response object
   * @returns A promise that resolves when the response has been sent
   */
  async getItemById(req: Request, res: Response) {
    const itemId = parseInt(req.params.id, 10);
    if (isNaN(itemId)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    try {
      const itemService = new ItemService();
      const item = await itemService.getItemById(itemId);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching item:", error);
      res.status(500).json({ error: "Failed to fetch item" });
    }
  }

  /**
   * Creates a new item in the database.
   * @param req - Express request object
   * @param res - Express response object
   * @returns  A promise that resolves when the response has been sent
   */
  async createItem01(req: Request, res: Response) {
    const newItem = req.body;
    if (!newItem || !newItem.name || !newItem.category_id) {
      return res.status(400).json({ error: "Invalid item data" });
    }

    try {
      const itemService = new ItemService();
      const createdItem = await itemService.createItem(newItem);
      // If item with the same name exists
      if (!createdItem) {
        return res
          .status(400)
          .json({ error: "Item with the same name already exists" });
      }
      res.status(201).json(createdItem);
    } catch (error) {
      console.error("Error creating item:", error);
      res.status(500).json({ error: "Failed to create item" });
    }
  }

  async createItem(req: Request, res: Response) {
    const newItem: Item = req.body;
    const imageFile = req.file;

    if (!newItem || !newItem.name || !newItem.category_id) {
      if (imageFile) await fs.unlink(imageFile.path).catch(() => {}); // Cleanup on errorr
      return res.status(400).json({ error: "Invalid item data" });
    }

    try {
      const imagePath = imageFile ? `/uploads/${imageFile.filename}` : null;
      newItem.image = imagePath;

      const itemService = new ItemService();
      const createdItem = await itemService.createItem(newItem);
      if (!createdItem) {
        if (imageFile) await fs.unlink(imageFile.path).catch(() => {});
        return res
          .status(400)
          .json({ error: "Item with the same name already exists" });
      }
      res.status(201).json(createdItem);
    } catch (error) {
      console.error("Error creating item:", error);
      if (imageFile) await fs.unlink(imageFile.path).catch(() => {});
      res.status(500).json({ error: "Failed to create item." });
    }
  }

  /**
   * Updates an item in the database.
   * @param req - Express request object
   * @param res - Express response object
   * @returns A promise that resolves when the response has been sent
   */
  async updateItem1(req: Request, res: Response) {
    const itemId = parseInt(req.params.id, 10);
    if (isNaN(itemId)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    const updatedItem = req.body;

    try {
      const itemService = new ItemService();
      const item = await itemService.updateItem(itemId, updatedItem);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating item:", error);
      res.status(500).json({ error: "Failed to update item" });
    }
  }
  async updateItem(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    const updatedItem: Partial<Item> = req.body;
    const imageFile = req.file;

    try {
      let imagePath = updatedItem.image; // Existing image if no new upload
      let oldImagePath: string | null = null;

      if (imageFile) {
        imagePath = `/uploads/${imageFile.filename}`;
        // Fetch old image to delete later
        const itemService = new ItemService();
        const existingItem = await itemService.getItemById(id);
        oldImagePath = existingItem?.image || null;
      }

      const itemService = new ItemService();
      const result = await itemService.updateItem(id, {
        ...updatedItem,
        image: imagePath,
      });

      if (!result) {
        if (imageFile) await fs.unlink(imageFile.path).catch(() => {});
        return res.status(404).json({ error: "Item not found" });
      }

      // Delete old image if new one uploaded
      if (oldImagePath && imageFile) {
        const fullPath = path.join("public", oldImagePath);
        await fs.unlink(fullPath).catch(() => {}); // Silent fail if not exists
      }

      res.json({ message: "Item updated successfully" });
    } catch (error) {
      console.error("Error updating item:", error);
      if (imageFile) await fs.unlink(imageFile.path).catch(() => {});
      res.status(500).json({ error: "Failed to update item" });
    }
  }

  /**
   * Deletes an item by its ID from the database.
   * @param req - Express request object
   * @param res - Express response object
   * @returns A promise that resolves when the response has been sent
   */
  async deleteItem1(req: Request, res: Response) {
    const itemId = parseInt(req.params.id, 10);
    if (isNaN(itemId)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    try {
      const itemService = new ItemService();
      await itemService.deleteItem(itemId);
      res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
      console.error("Error deleting item:", error);
      res.status(500).json({ error: "Failed to delete item" });
    }
  }
  async deleteItem(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    try {
      const itemService = new ItemService();
      const item = (await itemService.getItemById(id)) as Item;
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }

      // Delete image if exists
      // if (item.image) {
      //   const fullPath = path.join("public", item.image);
      //   await fs.unlink(fullPath).catch(() => {});
      // }

      await itemService.deleteItem(id);
      res.json({ message: "Item deleted successfully" });
    } catch (error) {
      console.error("Error deleting item:", error);
      res.status(500).json({ error: "Failed to delete item" });
    }
  }
}

export default new ItemController();
