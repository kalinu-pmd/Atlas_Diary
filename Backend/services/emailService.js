import nodemailer from "nodemailer";
import { Resend } from "resend";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Ensure the Backend/.env file is loaded regardless of where node is started from
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

let transporter = null;
let fallbackTransporter = null;
let resendClient = null;

const EMAIL_SEND_TIMEOUT_MS = Number(process.env.EMAIL_SEND_TIMEOUT_MS || 15000);
const EMAIL_PROVIDER = pickEnv(["EMAIL_PROVIDER"]) || "resend";

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

function getFromAddress(defaultValue = "Atlas Diary <no-reply@pramodgyawali.com.np>") {
  const explicitFrom = pickEnv(["EMAIL_FROM", "MAIL_FROM", "SMTP_FROM"]);
  if (explicitFrom) return explicitFrom;

  const fromName = pickEnv(["EMAIL_FROM_NAME"]);
  const fromAddress = pickEnv([
    "EMAIL_FROM_ADDRESS",
    "EMAIL_FROM_EMAIL",
    "RESEND_FROM",
    "FROM_EMAIL",
  ]);

  if (fromName && fromAddress) {
    return `${fromName} <${fromAddress}>`;
  }

  if (fromAddress) {
    return fromAddress;
  }

  return defaultValue;
}

function getResendClient() {
  if (resendClient) return resendClient;

  const apiKey = pickEnv(["RESEND_API_KEY"]);
  if (!apiKey) {
    console.warn("[emailService] RESEND_API_KEY is not set.");
    return null;
  }

  resendClient = new Resend(apiKey);
  return resendClient;
}

async function sendWithResend({ to, from, subject, html, text }) {
  const client = getResendClient();
  if (!client) return false;

  try {
    await client.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });
    return true;
  } catch (error) {
    console.error("[emailService] Resend send failed:", error?.message || error);
    return false;
  }
}

// Legacy SMTP path kept for later reuse.
// Set EMAIL_PROVIDER=smtp to use the existing SMTP transport again.
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
    requireTLS: !secure,
    tls: secure
      ? undefined
      : {
          minVersion: "TLSv1.2",
        },
    auth: {
      user,
      pass,
    },
  });

  return transporter;
}

function getFallbackTransporter() {
  if (fallbackTransporter) return fallbackTransporter;

  const host = pickEnv(["SMTP_HOST", "MAIL_HOST", "EMAIL_HOST"]) || "smtp.gmail.com";
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

  if (!user || !pass) {
    return null;
  }

  fallbackTransporter = nodemailer.createTransport({
    host,
    port: 465,
    secure: true,
    connectionTimeout: EMAIL_SEND_TIMEOUT_MS,
    greetingTimeout: EMAIL_SEND_TIMEOUT_MS,
    socketTimeout: EMAIL_SEND_TIMEOUT_MS,
    auth: {
      user,
      pass,
    },
  });

  return fallbackTransporter;
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
  const from = getFromAddress();

  const subject = "Your Atlas Diary verification code";
  const html = `
        <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; color: #0c342c;">
          <p>Hi there,</p>
          <p>Your verification code for <strong>Atlas Diary</strong> is:</p>
          <p style="font-size: 24px; font-weight: 700; letter-spacing: 4px; margin: 16px 0;">${otp}</p>
          <p>This code will expire in <strong>3 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
          <p style="margin-top: 24px; font-size: 13px; color: #647067;">Thank you,<br/>Atlas Diary Team</p>
        </div>
      `;

  if (EMAIL_PROVIDER === "resend") {
    const sent = await sendWithResend({
      to,
      from,
      subject,
      html,
      text: `Your Atlas Diary verification code is ${otp}. It expires in 3 minutes.`,
    });

    if (sent) return true;
    console.warn("[emailService] Resend send failed. Falling back to SMTP legacy path.");
  }

  const mailer = getTransporter();

  if (!mailer) {
    console.warn("[emailService] Attempted to send OTP email without SMTP configuration.");
    return false;
  }

  try {
    await sendMailWithPromise(mailer, { from, to, subject, html });
    return true;
  } catch (error) {
    console.error("[emailService] Failed to send OTP email:", error?.message || error);

    const fallbackMailer = getFallbackTransporter();
    if (!fallbackMailer || fallbackMailer === mailer) {
      return false;
    }

    try {
      console.warn("[emailService] Retrying OTP email with Gmail SSL fallback on port 465.");
      await sendMailWithPromise(fallbackMailer, {
        from,
        to,
        subject: "Your Atlas Diary verification code",
        html: `
          <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; color: #0c342c;">
            <p>Hi there,</p>
            <p>Your verification code for <strong>Atlas Diary</strong> is:</p>
            <p style="font-size: 24px; font-weight: 700; letter-spacing: 4px; margin: 16px 0;">${otp}</p>
            <p>This code will expire in <strong>3 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
            <p style="margin-top: 24px; font-size: 13px; color: #647067;">Thank you,<br/>Atlas Diary Team</p>
          </div>
        `,
      });
      return true;
    } catch (fallbackError) {
      console.error(
        "[emailService] Gmail SSL fallback also failed:",
        fallbackError?.message || fallbackError,
      );
      return false;
    }
  }
}

export async function sendPasswordResetOtpEmail(to, otp) {
  const from = getFromAddress();

  const subject = "Atlas Diary password reset code";
  const html = `
        <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; color: #0c342c;">
          <p>Hi there,</p>
          <p>You requested to reset your <strong>Atlas Diary</strong> password. Your reset code is:</p>
          <p style="font-size: 24px; font-weight: 700; letter-spacing: 4px; margin: 16px 0;">${otp}</p>
          <p>This code will expire in <strong>3 minutes</strong>. If you did not request this, you can ignore this email and your password will stay the same.</p>
          <p style="margin-top: 24px; font-size: 13px; color: #647067;">Thank you,<br/>Atlas Diary Team</p>
        </div>
      `;

  if (EMAIL_PROVIDER === "resend") {
    const sent = await sendWithResend({
      to,
      from,
      subject,
      html,
      text: `Your Atlas Diary password reset code is ${otp}. It expires in 3 minutes.`,
    });

    if (sent) return true;
    console.warn("[emailService] Resend send failed. Falling back to SMTP legacy path.");
  }

  const mailer = getTransporter();

  if (!mailer) {
    console.warn("[emailService] Attempted to send password reset email without SMTP configuration.");
    return false;
  }

  try {
    await sendMailWithPromise(mailer, { from, to, subject, html });
    return true;
  } catch (error) {
    console.error("[emailService] Failed to send password reset email:", error?.message || error);
    return false;
  }
}

export async function sendDeleteAccountOtpEmail(to, otp) {
  const from = getFromAddress();

  const subject = "Atlas Diary account deletion confirmation code";
  const html = `
        <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; color: #0c342c;">
          <p>Hi there,</p>
          <p>We received a request to delete your <strong>Atlas Diary</strong> account. Your confirmation code is:</p>
          <p style="font-size: 24px; font-weight: 700; letter-spacing: 4px; margin: 16px 0;">${otp}</p>
          <p>This code will expire in <strong>3 minutes</strong>. If you did not request account deletion, please keep your account and change your password immediately.</p>
          <p style="margin-top: 24px; font-size: 13px; color: #647067;">Thank you,<br/>Atlas Diary Team</p>
        </div>
      `;

  if (EMAIL_PROVIDER === "resend") {
    const sent = await sendWithResend({
      to,
      from,
      subject,
      html,
      text: `Your Atlas Diary account deletion confirmation code is ${otp}. It expires in 3 minutes.`,
    });

    if (sent) return true;
    console.warn("[emailService] Resend send failed. Falling back to SMTP legacy path.");
  }

  const mailer = getTransporter();

  if (!mailer) {
    console.warn("[emailService] Attempted to send account deletion OTP email without SMTP configuration.");
    return false;
  }

  try {
    await sendMailWithPromise(mailer, { from, to, subject, html });
    return true;
  } catch (error) {
    console.error("[emailService] Failed to send account deletion OTP email:", error?.message || error);
    return false;
  }
}

export async function sendPasswordResetAlertToAdmin(userIdentifier) {
  const from = getFromAddress();
  const adminEmail = pickEnv(["ADMIN_EMAIL", "MAIL_ADMIN_EMAIL"]);

  if (!adminEmail) {
    console.warn("[emailService] ADMIN_EMAIL is not set. Cannot send admin reset alert.");
    return false;
  }

  if (EMAIL_PROVIDER === "resend") {
    const sent = await sendWithResend({
      to: adminEmail,
      from,
      subject: "Password reset requested for user without email",
      text: `A password reset was requested for user: ${userIdentifier}. This account does not have an email address configured. Please contact the user and reset their password manually from the admin panel.`,
    });

    if (sent) return true;
    console.warn("[emailService] Resend send failed. Falling back to SMTP legacy path.");
  }

  const mailer = getTransporter();

  if (!mailer) {
    console.warn("[emailService] Attempted to send admin reset alert without SMTP configuration.");
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
  const from = getFromAddress();

  const subject = "Your updated Atlas Diary password";
  const html = `
        <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; color: #0c342c;">
          <p>Hi there,</p>
          <p>An administrator has reset your <strong>Atlas Diary</strong> account password.</p>
          <p>Your new temporary password is:</p>
          <p style="font-size: 20px; font-weight: 600; margin: 16px 0;">${temporaryPassword}</p>
          <p>For your security, please sign in and change this password immediately from your account settings.</p>
          <p style="margin-top: 24px; font-size: 13px; color: #647067;">Thank you,<br/>Atlas Diary Team</p>
        </div>
      `;

  if (EMAIL_PROVIDER === "resend") {
    const sent = await sendWithResend({
      to,
      from,
      subject,
      html,
    });

    if (sent) return true;
    console.warn("[emailService] Resend send failed. Falling back to SMTP legacy path.");
  }

  const mailer = getTransporter();

  if (!mailer) {
    console.warn("[emailService] Attempted to send admin-set password email without SMTP configuration.");
    return false;
  }

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

export async function sendContactConfirmationEmail(to, name) {
  const from = getFromAddress();

  const subject = "We've received your message - Atlas Diary";
  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; color: #0c342c;">
      <p>Hi ${name || "there"},</p>
      <p>Thank you for reaching out to <strong>Atlas Diary</strong>!</p>
      <p>We have successfully received your message and will review it shortly. Our team will get back to you as soon as possible, typically within <strong>24 hours</strong>.</p>
      <p style="margin: 20px 0; padding: 15px; background-color: #f0f9f8; border-left: 4px solid #0c7a6a; border-radius: 4px;">
        <strong style="color: #0c7a6a;">We appreciate your feedback!</strong><br/>
        Your input helps us improve Atlas Diary and provide better experiences for all our users.
      </p>
      <p>If you have any additional information to add, please feel free to contact us again at <strong>hello@atlasdiary.com</strong>.</p>
      <p style="margin-top: 24px; font-size: 13px; color: #647067;">Best regards,<br/><strong>Atlas Diary Team</strong><br/>Making travel memorable, one diary at a time.</p>
    </div>
  `;

  if (EMAIL_PROVIDER === "resend") {
    const sent = await sendWithResend({
      to,
      from,
      subject,
      html,
      text: `Thank you for your message. We have received it and will contact you shortly.`,
    });

    if (sent) return true;
    console.warn("[emailService] Resend send failed. Falling back to SMTP legacy path.");
  }

  const mailer = getTransporter();

  if (!mailer) {
    console.warn("[emailService] Attempted to send contact confirmation email without SMTP configuration.");
    return false;
  }

  try {
    await sendMailWithPromise(mailer, { from, to, subject, html });
    return true;
  } catch (error) {
    console.error("[emailService] Failed to send contact confirmation email:", error?.message || error);

    const fallbackMailer = getFallbackTransporter();
    if (!fallbackMailer || fallbackMailer === mailer) {
      return false;
    }

    try {
      console.warn("[emailService] Retrying contact confirmation email with Gmail SSL fallback on port 465.");
      await sendMailWithPromise(fallbackMailer, {
        from,
        to,
        subject: "We've received your message - Atlas Diary",
        html: `
          <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; color: #0c342c;">
            <p>Hi ${name || "there"},</p>
            <p>Thank you for reaching out to <strong>Atlas Diary</strong>!</p>
            <p>We have successfully received your message and will review it shortly. Our team will get back to you as soon as possible, typically within <strong>24 hours</strong>.</p>
            <p style="margin: 20px 0; padding: 15px; background-color: #f0f9f8; border-left: 4px solid #0c7a6a; border-radius: 4px;">
              <strong style="color: #0c7a6a;">We appreciate your feedback!</strong><br/>
              Your input helps us improve Atlas Diary and provide better experiences for all our users.
            </p>
            <p>If you have any additional information to add, please feel free to contact us again at <strong>hello@atlasdiary.com</strong>.</p>
            <p style="margin-top: 24px; font-size: 13px; color: #647067;">Best regards,<br/><strong>Atlas Diary Team</strong><br/>Making travel memorable, one diary at a time.</p>
          </div>
        `,
      });
      return true;
    } catch (fallbackError) {
      console.error(
        "[emailService] Gmail SSL fallback also failed:",
        fallbackError?.message || fallbackError,
      );
      return false;
    }
  }
}

export async function sendSupportReplyEmail({ to, name, subject, reply }) {
  const from = getFromAddress();
  const safeName = name || "there";
  const safeSubject = subject || "Your support request";
  const safeReply = reply || "";

  const mailSubject = `Support reply: ${safeSubject}`;
  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; color: #0c342c;">
      <p>Hi ${safeName},</p>
      <p>We have replied to your support request:</p>
      <p style="margin: 16px 0; font-weight: 700;">${safeSubject}</p>
      <div style="margin: 16px 0; padding: 14px; background-color: #f6fbf8; border-left: 4px solid #0c7a6a; border-radius: 6px;">
        ${safeReply.replace(/\n/g, "<br/>")}
      </div>
      <p>You can continue the conversation by replying inside Atlas Diary.</p>
      <p style="margin-top: 24px; font-size: 13px; color: #647067;">Best regards,<br/><strong>Atlas Diary Support</strong></p>
    </div>
  `;

  if (EMAIL_PROVIDER === "resend") {
    const sent = await sendWithResend({
      to,
      from,
      subject: mailSubject,
      html,
      text: `Support reply for "${safeSubject}": ${safeReply}`,
    });

    if (sent) return true;
    console.warn("[emailService] Resend send failed. Falling back to SMTP legacy path.");
  }

  const mailer = getTransporter();

  if (!mailer) {
    console.warn("[emailService] Attempted to send support reply email without SMTP configuration.");
    return false;
  }

  try {
    await sendMailWithPromise(mailer, { from, to, subject: mailSubject, html });
    return true;
  } catch (error) {
    console.error("[emailService] Failed to send support reply email:", error?.message || error);
    return false;
  }
}
