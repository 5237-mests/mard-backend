"use strict";
// import nodemailer from "nodemailer";
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
exports.sendEmail = sendEmail;
// export async function sendEmail(to: string, subject: string, text: string) {
//   // Configure your SMTP transport here
//   const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: Number(process.env.SMTP_PORT),
//     secure: true, // true for port 465, false for 587
//     auth: {
//       user: process.env.SMTP_FROM,
//       pass: process.env.SMTP_PASS,
//     },
//   });
//   // Send the email
//   await transporter.sendMail({
//     from: process.env.SMTP_FROM,
//     to,
//     subject,
//     text,
//   });
// }
const nodemailer_1 = __importDefault(require("nodemailer"));
/**
 * Sends an email using Nodemailer with support for both plain text and HTML.
 * Falls back to a simple HTML version of the text if no html is provided.
 */
function sendEmail(to, subject, text, html) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create transporter (you can move this outside the function for better performance in production)
        const transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: Number(process.env.SMTP_PORT) === 465, // automatically set based on port (465 = SSL, 587 = TLS)
            auth: {
                user: process.env.SMTP_USER || process.env.SMTP_FROM, // sometimes auth user is different from from address
                pass: process.env.SMTP_PASS,
            },
            // Optional: improve reliability
            pool: true,
            maxConnections: 5,
            connectionTimeout: 10000,
        });
        // Optional: verify connection in development
        if (process.env.NODE_ENV !== "production") {
            try {
                yield transporter.verify();
                console.log("SMTP connection verified successfully");
            }
            catch (err) {
                console.error("SMTP connection verification failed:", err);
            }
        }
        const mailOptions = {
            from: `"MARD Trading" <${process.env.SMTP_FROM}>`, // friendly sender name
            to,
            subject,
            text, // plain text version - always required
            html: html ||
                `<div style="font-family: Arial, sans-serif;">${text.replace(/\n/g, "<br>")}</div>`, // simple fallback
        };
        try {
            const info = yield transporter.sendMail(mailOptions);
            console.log(`Email sent successfully to ${to} - Message ID: ${info.messageId}`);
        }
        catch (error) {
            console.error("Failed to send email:", error);
            throw error; // let the caller handle the error (e.g. show toast)
        }
    });
}
