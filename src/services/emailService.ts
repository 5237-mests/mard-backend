// import nodemailer from "nodemailer";

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

import nodemailer from "nodemailer";

/**
 * Sends an email using Nodemailer with support for both plain text and HTML.
 * Falls back to a simple HTML version of the text if no html is provided.
 */
export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html: string,
): Promise<void> {
  // Create transporter (you can move this outside the function for better performance in production)
  const transporter = nodemailer.createTransport({
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
      await transporter.verify();
      console.log("SMTP connection verified successfully");
    } catch (err) {
      console.error("SMTP connection verification failed:", err);
    }
  }

  const mailOptions = {
    from: `"MARD Trading" <${process.env.SMTP_FROM}>`, // friendly sender name
    to,
    subject,
    text, // plain text version - always required
    html:
      html ||
      `<div style="font-family: Arial, sans-serif;">${text.replace(/\n/g, "<br>")}</div>`, // simple fallback
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `Email sent successfully to ${to} - Message ID: ${info.messageId}`,
    );
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error; // let the caller handle the error (e.g. show toast)
  }
}
