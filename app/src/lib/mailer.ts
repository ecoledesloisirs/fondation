import nodemailer from "nodemailer";

export interface MailPayload {
  notifyTo: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendMail(payload: MailPayload) {
  const transporter = nodemailer.createTransport({
    host: import.meta.env.SMTP_HOST,
    port: Number(import.meta.env.SMTP_PORT || 587),
    secure: Number(import.meta.env.SMTP_PORT) === 465, // 465 = SSL
    auth: {
      user: import.meta.env.SMTP_USER,
      pass: import.meta.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: payload.from,
    to: payload.notifyTo,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });
}
