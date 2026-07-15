import nodemailer from "nodemailer";

// Works with Resend's SMTP relay out of the box:
//   SMTP_HOST=smtp.resend.com
//   SMTP_PORT=465
//   SMTP_USER=resend
//   SMTP_PASS=<your Resend API key>
// Swap these env vars for any other SMTP provider (Brevo, SendGrid, Gmail) without touching this file.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: Number(process.env.SMTP_PORT) !== 587, // true for 465, false for 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail({ to, subject, html }) {
  if (!process.env.SMTP_HOST) {
    console.warn(`[mailer] SMTP not configured — skipping email to ${to}: "${subject}"`);
    return { skipped: true };
  }
  return transporter.sendMail({
    from: process.env.MAIL_FROM || "Humsafar <onboarding@resend.dev>",
    to,
    subject,
    html,
  });
}

export function otpEmailTemplate(otp, firstName = "") {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 420px; margin: auto;">
      <h2 style="color:#c94750;">Humsafar</h2>
      <p>Hi ${firstName || "there"},</p>
      <p>Your verification code is:</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
      <p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
    </div>
  `;
}
