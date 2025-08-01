import nodemailer from "nodemailer";

export async function sendEmail(to: string, subject: string, text: string) {
  // Configure your SMTP transport here
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true, // true for port 465, false for 587
    auth: {
      user: process.env.SMTP_FROM,
      pass: process.env.SMTP_PASS,
    },
  });
  // Send the email
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
  });
}
