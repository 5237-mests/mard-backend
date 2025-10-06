import { NextFunction, Request, Response } from "express";
import * as orderService from "../services/orderService";

export const create = async (req: Request, res: Response) => {
  try {
    const user_id = Number(req?.user?.user?.id);
    const { delivery_details } = req.body;
    const result = await orderService.createOrder({
      user_id,
      delivery_details,
    });
    res.status(201).json({ message: "Order created", ...result });
  } catch (error) {
    res.status(500).json({ error: "Failed to create order" });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await orderService.getAllOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

export const getByUser = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.user?.id);
    // console.log("get o b u>", userId);
    const orders = await orderService.getOrdersByUser(userId);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// get order by id
export const getById = async (req: Request, res: Response) => {
  try {
    const orderId = Number(req.params.orderId);
    const order = await orderService.getOrderById(orderId);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

export const updateDelivery = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { delivery_details } = req.body;
    await orderService.updateOrderDelivery(Number(orderId), delivery_details);
    res.json({ message: "Delivery details updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update delivery details" });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { orderId, status } = req.params;
    await orderService.updateOrderStatus(Number(orderId), status);
    res.json({ message: "Order status updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update order status" });
  }
};
export const updateOrderStatus2 = async (req: Request, res: Response) => {
  try {
    const sold_by_id = Number(req?.user?.user?.id);
    const { orderId, status } = req.params;
    const shop_id = 2;

    if (!status || !shop_id || !sold_by_id) {
      return res
        .status(400)
        .json({ message: "status, shop_id and sold_by_id are required" });
    }

    const result = await orderService.updateOrderStatus2(
      Number(orderId),
      status,
      shop_id,
      sold_by_id
    );
    return res.json(result);
  } catch (error: any) {
    console.error("Error updating order status:", error);
    return res
      .status(500)
      .json({ message: error.message || "Failed to update order status" });
  }
};

// update item quantity
export const updateOrderItem = async (req: Request, res: Response) => {
  try {
    const { orderId, itemId } = req.params;
    const { quantity } = req.body;
    console.log("q", quantity);
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be >= 1" });
    }

    const result = await orderService.updateOrderItem(
      Number(orderId),
      Number(itemId),
      Number(quantity)
    );

    // if (result.affectedRows === 0) {
    //   return res.status(404).json({ message: "Order item not found" });
    // }

    res.json({ message: "Order item updated successfully" });
  } catch (error: any) {
    console.error("Error updating order item:", error);
    res.status(500).json({ message: "Failed to update order item" });
  }
};

export const removeOrderItem = async (req: Request, res: Response) => {
  try {
    const { orderId, itemId } = req.params;

    const result = await orderService.removeOrderItem(
      Number(orderId),
      Number(itemId)
    );

    // if (result.affectedRows === 0) {
    //   return res.status(404).json({ message: "Order item not found" });
    // }

    res.json({ message: "Order item removed successfully" });
  } catch (error: any) {
    console.error("Error removing order item:", error);
    res.status(500).json({ message: "Failed to remove order item" });
  }
};

// delete order
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const result: any = await orderService.deleteOrder(Number(orderId));

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Failed to delete order" });
  }
};

export const refundOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("Order Id");
    const { orderId } = req.params;
    console.log("Order Id", orderId);
    const result = await orderService.refundOrder(Number(orderId));
    res.json(result);
  } catch (error) {
    next(error);
  }
};
