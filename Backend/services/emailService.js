import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Ensure the Backend/.env file is loaded regardless of where node is started from
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    console.warn(
      "[emailService] SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS are not fully set. Email sending will be disabled."
    );
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });

  return transporter;
}

export async function sendOtpEmail(to, otp) {
  const mailer = getTransporter();

  if (!mailer) {
    console.warn("[emailService] Attempted to send OTP email without SMTP configuration.");
    return;
  }

  const from =
    process.env.EMAIL_FROM || "Atlas Diary <no-reply@atlas-diary.local>";

  try {
    await mailer.sendMail({
      from,
      to,
      subject: "Your Atlas Diary verification code",
      html: `
        <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; color: #0c342c;">
          <p>Hi there,</p>
          <p>Your verification code for <strong>Atlas Diary</strong> is:</p>
          <p style="font-size: 24px; font-weight: 700; letter-spacing: 4px; margin: 16px 0;">${otp}</p>
          <p>This code will expire in <strong>10 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
          <p style="margin-top: 24px; font-size: 13px; color: #647067;">Thank you,<br/>Atlas Diary Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("[emailService] Failed to send OTP email:", error?.message || error);
    // Swallow error so signup flow can still respond; client can retry.
  }
}
