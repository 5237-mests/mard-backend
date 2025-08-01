"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Construct DATABASE_URL if not provided directly
const getDatabaseUrl = () => {
    if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
    }
    const host = process.env.DB_HOST || "localhost";
    const port = process.env.DB_PORT || "3306";
    const username = process.env.DB_USERNAME || "root";
    const password = process.env.DB_PASSWORD || "password";
    const database = process.env.DB_DATABASE || "marddb";
    return `mysql://${username}:${password}@${host}:${port}/${database}`;
};
exports.prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: getDatabaseUrl(),
        },
    },
});
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield exports.prisma.$connect();
        console.log(`MySQL Connected via Prisma: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}`);
    }
    catch (error) {
        console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
    }
});
exports.default = connectDB;
