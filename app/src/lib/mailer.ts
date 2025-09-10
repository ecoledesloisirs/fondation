import nodemailer from "nodemailer";
import { renderMjmlTemplate } from "./emailRenderer";

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
    secure: Number(import.meta.env.SMTP_PORT) === 465,
    auth: { user: import.meta.env.SMTP_USER, pass: import.meta.env.SMTP_PASS },
  });

  try {
    await transporter.sendMail({
      from: payload.from,
      to: payload.notifyTo,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    });
    console.log("✅ Mail envoyé");
  } catch (err) {
    console.error("❌ Erreur envoi mail:", err);
  }
}

// --- Nouveau : envoi basé sur un template MJML + Handlebars ---
export async function sendTemplateMail(opts: {
  to: string;
  from: string;
  subject: string;
  template: string; // ex: "confirmation"
  data: Record<string, unknown>; // variables pour le template
}) {
  const transporter = nodemailer.createTransport({
    host: import.meta.env.SMTP_HOST,
    port: Number(import.meta.env.SMTP_PORT || 587),
    secure: Number(import.meta.env.SMTP_PORT) === 465,
    auth: { user: import.meta.env.SMTP_USER, pass: import.meta.env.SMTP_PASS },
  });

  const { html, text } = await renderMjmlTemplate(opts.template, opts.data);

  await transporter.sendMail({
    from: opts.from,
    to: opts.to,
    subject: opts.subject,
    html,
    text,
  });
}
