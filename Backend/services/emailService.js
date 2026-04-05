import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Ensure the Backend/.env file is loaded regardless of where node is started from
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

let transporter = null;

const EMAIL_SEND_TIMEOUT_MS = Number(process.env.EMAIL_SEND_TIMEOUT_MS || 15000);

function pickEnv(keys = []) {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function parseBool(value, defaultValue = false) {
  if (typeof value !== "string") return defaultValue;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return defaultValue;
}

function getTransporter() {
  if (transporter) return transporter;

  const smtpUrl = pickEnv(["SMTP_URL", "SMTP_URI", "MAIL_URL"]);
  const host = pickEnv(["SMTP_HOST", "MAIL_HOST", "EMAIL_HOST"]);
  const port = pickEnv(["SMTP_PORT", "MAIL_PORT", "EMAIL_PORT"]);
  const user = pickEnv([
    "SMTP_USER",
    "SMTP_USERNAME",
    "MAIL_USER",
    "EMAIL_USER",
    "GMAIL_USER",
    "NEXT_PUBLIC_GMAIL_EMAIL",
  ]);
  const pass = pickEnv([
    "SMTP_PASS",
    "SMTP_PASSWORD",
    "MAIL_PASS",
    "EMAIL_PASSWORD",
    "GMAIL_APP_PASSWORD",
    "GMAIL_PASSWORD",
    "NEXT_PUBLIC_GMAIL_PASSWORD",
  ]);

  if (!smtpUrl && (!host || !port || !user || !pass)) {
    const missing = [];
    if (!host) missing.push("host");
    if (!port) missing.push("port");
    if (!user) missing.push("user");
    if (!pass) missing.push("pass");

    console.warn(
      `[emailService] SMTP config missing (${missing.join(", ")}). Set SMTP_URL or SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS in production env.`
    );
    return null;
  }

  if (smtpUrl) {
    transporter = nodemailer.createTransport(smtpUrl, {
      connectionTimeout: EMAIL_SEND_TIMEOUT_MS,
      greetingTimeout: EMAIL_SEND_TIMEOUT_MS,
      socketTimeout: EMAIL_SEND_TIMEOUT_MS,
    });
    return transporter;
  }

  const secure = parseBool(process.env.SMTP_SECURE, Number(port) === 465);
  transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure, // true for 465 unless overridden by SMTP_SECURE
    connectionTimeout: EMAIL_SEND_TIMEOUT_MS,
    greetingTimeout: EMAIL_SEND_TIMEOUT_MS,
    socketTimeout: EMAIL_SEND_TIMEOUT_MS,
    auth: {
      user,
      pass,
    },
  });

  return transporter;
}

function sendMailWithPromise(mailer, mailData) {
  return new Promise((resolve, reject) => {
    let settled = false;

    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error(`Email send timed out after ${EMAIL_SEND_TIMEOUT_MS}ms`));
    }, EMAIL_SEND_TIMEOUT_MS);

    mailer.sendMail(mailData, (error, info) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);

      if (error) {
        reject(error);
        return;
      }

      resolve(info);
    });
  });
}

export async function sendOtpEmail(to, otp) {
  const mailer = getTransporter();

  if (!mailer) {
    console.warn("[emailService] Attempted to send OTP email without SMTP configuration.");
    return false;
  }

  const from =
    pickEnv(["EMAIL_FROM", "MAIL_FROM", "SMTP_FROM"]) ||
    "Atlas Diary <no-reply@atlas-diary.local>";

  try {
    await sendMailWithPromise(mailer, {
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
    return true;
  } catch (error) {
    console.error("[emailService] Failed to send OTP email:", error?.message || error);
    return false;
  }
}

export async function sendPasswordResetOtpEmail(to, otp) {
  const mailer = getTransporter();

  if (!mailer) {
    console.warn("[emailService] Attempted to send password reset email without SMTP configuration.");
    return false;
  }

  const from =
    pickEnv(["EMAIL_FROM", "MAIL_FROM", "SMTP_FROM"]) ||
    "Atlas Diary <no-reply@atlas-diary.local>";

  try {
    await sendMailWithPromise(mailer, {
      from,
      to,
      subject: "Atlas Diary password reset code",
      html: `
        <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; color: #0c342c;">
          <p>Hi there,</p>
          <p>You requested to reset your <strong>Atlas Diary</strong> password. Your reset code is:</p>
          <p style="font-size: 24px; font-weight: 700; letter-spacing: 4px; margin: 16px 0;">${otp}</p>
          <p>This code will expire in <strong>10 minutes</strong>. If you did not request this, you can ignore this email and your password will stay the same.</p>
          <p style="margin-top: 24px; font-size: 13px; color: #647067;">Thank you,<br/>Atlas Diary Team</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("[emailService] Failed to send password reset email:", error?.message || error);
    return false;
  }
}

export async function sendPasswordResetAlertToAdmin(userIdentifier) {
  const mailer = getTransporter();

  if (!mailer) {
    console.warn("[emailService] Attempted to send admin reset alert without SMTP configuration.");
    return false;
  }

  const from =
    pickEnv(["EMAIL_FROM", "MAIL_FROM", "SMTP_FROM"]) ||
    "Atlas Diary <no-reply@atlas-diary.local>";
  const adminEmail = pickEnv(["ADMIN_EMAIL", "MAIL_ADMIN_EMAIL"]);

  if (!adminEmail) {
    console.warn("[emailService] ADMIN_EMAIL is not set. Cannot send admin reset alert.");
    return false;
  }

  try {
    await sendMailWithPromise(mailer, {
      from,
      to: adminEmail,
      subject: "Password reset requested for user without email",
      text: `A password reset was requested for user: ${userIdentifier}. This account does not have an email address configured. Please contact the user and reset their password manually from the admin panel.`,
    });
    return true;
  } catch (error) {
    console.error("[emailService] Failed to send admin password reset alert:", error?.message || error);
    return false;
  }
}

export async function sendAdminPasswordToUserEmail(to, temporaryPassword) {
  const mailer = getTransporter();

  if (!mailer) {
    console.warn("[emailService] Attempted to send admin-set password email without SMTP configuration.");
    return false;
  }

  const from =
    pickEnv(["EMAIL_FROM", "MAIL_FROM", "SMTP_FROM"]) ||
    "Atlas Diary <no-reply@atlas-diary.local>";

  try {
    await sendMailWithPromise(mailer, {
      from,
      to,
      subject: "Your updated Atlas Diary password",
      html: `
        <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; color: #0c342c;">
          <p>Hi there,</p>
          <p>An administrator has reset your <strong>Atlas Diary</strong> account password.</p>
          <p>Your new temporary password is:</p>
          <p style="font-size: 20px; font-weight: 600; margin: 16px 0;">${temporaryPassword}</p>
          <p>For your security, please sign in and change this password immediately from your account settings.</p>
          <p style="margin-top: 24px; font-size: 13px; color: #647067;">Thank you,<br/>Atlas Diary Team</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("[emailService] Failed to send admin password email:", error?.message || error);
    return false;
  }
}
