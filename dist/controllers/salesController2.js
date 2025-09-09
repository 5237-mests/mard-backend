"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchSales = exports.deleteSale = exports.updateSale = exports.getSaleById = exports.getAllSales = void 0;
const salesService = __importStar(require("../services/salesSarvice2"));
// Get all sales
const getAllSales = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sales = yield salesService.getAllSales();
        return res.json(sales);
    }
    catch (error) {
        console.error("Error fetching sales:", error);
        return res
            .status(500)
            .json({ message: error.message || "Failed to fetch sales" });
    }
});
exports.getAllSales = getAllSales;
// Get single sale by ID
const getSaleById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const saleId = parseInt(req.params.id, 10);
        const sale = yield salesService.getSaleById(saleId);
        if (!sale) {
            return res.status(404).json({ message: "Sale not found" });
        }
        return res.json(sale);
    }
    catch (error) {
        console.error("Error fetching sale:", error);
        return res
            .status(500)
            .json({ message: error.message || "Failed to fetch sale" });
    }
});
exports.getSaleById = getSaleById;
// Update sale (walk-in only)
const updateSale = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const saleId = parseInt(req.params.id, 10);
        const { customer_name, customer_contact } = req.body;
        if (!customer_name && !customer_contact) {
            return res.status(400).json({ message: "Nothing to update" });
        }
        yield salesService.updateSale(saleId, { customer_name, customer_contact });
        return res.json({ message: "Sale updated successfully" });
    }
    catch (error) {
        console.error("Error updating sale:", error);
        return res
            .status(500)
            .json({ message: error.message || "Failed to update sale" });
    }
});
exports.updateSale = updateSale;
// Delete sale
const deleteSale = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const saleId = parseInt(req.params.id, 10);
        yield salesService.deleteSale(saleId);
        return res.json({ message: "Sale deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting sale:", error);
        return res
            .status(500)
            .json({ message: error.message || "Failed to delete sale" });
    }
});
exports.deleteSale = deleteSale;
// Search sales
const searchSales = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customer_name, customer_contact, date_from, date_to } = req.query;
        const sales = yield salesService.searchSales({
            customer_name: customer_name,
            customer_contact: customer_contact,
            date_from: date_from,
            date_to: date_to,
        });
        return res.json(sales);
    }
    catch (error) {
        console.error("Error searching sales:", error);
        return res
            .status(500)
            .json({ message: error.message || "Failed to search sales" });
    }
});
exports.searchSales = searchSales;
