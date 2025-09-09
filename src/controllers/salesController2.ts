import { Request, Response } from "express";
import * as salesService from "../services/salesSarvice2";

// Get all sales
export const getAllSales = async (req: Request, res: Response) => {
  try {
    const sales = await salesService.getAllSales();
    return res.json(sales);
  } catch (error: any) {
    console.error("Error fetching sales:", error);
    return res
      .status(500)
      .json({ message: error.message || "Failed to fetch sales" });
  }
};

// Get single sale by ID
export const getSaleById = async (req: Request, res: Response) => {
  try {
    const saleId = parseInt(req.params.id, 10);
    const sale = await salesService.getSaleById(saleId);
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }
    return res.json(sale);
  } catch (error: any) {
    console.error("Error fetching sale:", error);
    return res
      .status(500)
      .json({ message: error.message || "Failed to fetch sale" });
  }
};

// Update sale (walk-in only)
export const updateSale = async (req: Request, res: Response) => {
  try {
    const saleId = parseInt(req.params.id, 10);
    const { customer_name, customer_contact } = req.body;

    if (!customer_name && !customer_contact) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    await salesService.updateSale(saleId, { customer_name, customer_contact });
    return res.json({ message: "Sale updated successfully" });
  } catch (error: any) {
    console.error("Error updating sale:", error);
    return res
      .status(500)
      .json({ message: error.message || "Failed to update sale" });
  }
};

// Delete sale
export const deleteSale = async (req: Request, res: Response) => {
  try {
    const saleId = parseInt(req.params.id, 10);
    await salesService.deleteSale(saleId);
    return res.json({ message: "Sale deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting sale:", error);
    return res
      .status(500)
      .json({ message: error.message || "Failed to delete sale" });
  }
};

// Search sales
export const searchSales = async (req: Request, res: Response) => {
  try {
    const { customer_name, customer_contact, date_from, date_to } = req.query;

    const sales = await salesService.searchSales({
      customer_name: customer_name as string,
      customer_contact: customer_contact as string,
      date_from: date_from as string,
      date_to: date_to as string,
    });

    return res.json(sales);
  } catch (error: any) {
    console.error("Error searching sales:", error);
    return res
      .status(500)
      .json({ message: error.message || "Failed to search sales" });
  }
};
