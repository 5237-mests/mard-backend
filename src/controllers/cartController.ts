import { NextFunction, Request, Response } from "express";
import * as cartService from "../services/cartService";
import AppError from "../utils/AppError";

export const addItem1 = async (req: Request, res: Response) => {
  try {
    const userId = Number(req?.user?.user?.id);
    const { item_id, quantity } = req.body;

    if (!item_id || !quantity) {
      return res
        .status(400)
        .json({ message: "item_id and quantity are required" });
    }

    const result = await cartService.addToCart({ item_id, quantity }, userId);
    res.status(201).json(result);
  } catch (error: any) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }

    if (error.message.includes("Insufficient stock")) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Failed to add item to cart" });
  }
};

export const addItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = Number(req.user?.user?.id);
    const { item_id, quantity } = req.body;

    if (!item_id || !quantity) {
      throw new AppError("item_id and quantity are required", 400);
    }

    const result = await cartService.addToCart({ item_id, quantity }, userId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getCart0 = async (req: Request, res: Response) => {
  try {
    const userId = Number(req?.user?.user?.id);
    const items = await cartService.getCartByUser(userId);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cart" });
  }
};
export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = Number(req?.user?.user?.id);

    const cart = await cartService.getCartByUser(Number(userId));
    res.json(cart);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateItem = async (req: Request, res: Response) => {
  try {
    const { item_id, quantity } = req.body;
    const userId = Number(req?.user?.user?.id);
    const data = await cartService.updateCartItem(
      userId,
      Number(item_id),
      Number(quantity)
    );
    res.json({ message: "Cart item updated", data });
  } catch (error) {
    res.status(500).json({ error: "Failed to update cart item" });
  }
};

export const removeItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const userId = Number(req?.user?.user?.id);
    console.log(userId, Number(itemId));
    await cartService.removeCartItem(userId, Number(itemId));
    res.json({ message: "Cart item removed" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove cart item" });
  }
};

// clear cart
export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = Number(req?.user?.user?.id);
    await cartService.clearCart(userId);
    res.json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear cart" });
  }
};

// Increment item by +1
export const incrementItem = async (req: Request, res: Response) => {
  try {
    const { item_id } = req.params;
    const user_id = req?.user?.user.id;
    const result = await cartService.incrementCartItem(
      Number(user_id),
      Number(item_id)
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Decrement item by -1
export const decrementItem = async (req: Request, res: Response) => {
  try {
    const { item_id } = req.params;
    const user_id = req?.user?.user.id;
    const result = await cartService.decrementCartItem(
      Number(user_id),
      Number(item_id)
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
