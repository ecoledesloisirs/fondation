export const prerender = false;

import type { APIRoute } from "astro";
import { sendMail, sendTemplateMail } from "../../lib/mailer";

function isPhone(v: string) {
  return /^[+()\-.\s\d]{6,}$/.test(v || "");
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const form = await request.formData();

    const hp = String(form.get("company") || "");
    if (hp.trim()) {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    const last_name = String(form.get("last_name") || "").trim();
    const first_name = String(form.get("first_name") || "").trim();
    const organization = String(form.get("organization") || "").trim();
    const email = String(form.get("email") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const subject = String(form.get("subject") || "").trim();
    const message = String(form.get("message") || "").trim();

    const errors: Record<string, string> = {};
    if (!last_name) errors.last_name = "required";
    if (!first_name) errors.first_name = "required";
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      errors.email = "invalid";
    if (!phone || !isPhone(phone)) errors.phone = "invalid";
    if (!subject) errors.subject = "required";
    if (!message) errors.message = "required";

    if (Object.keys(errors).length) {
      return new Response(JSON.stringify({ ok: false, errors }), {
        status: 400,
      });
    }

    const plain = `Nouveau message de contact

    Nom: ${last_name}
    Prénom: ${first_name}
    Organisation: ${organization || "(non renseigné)"}
    Email: ${email}
    Téléphone: ${phone}
    Message:${message}`.trim();

    const html = `
      <h2>Nouveau message de contact</h2>
      <ul>
        <li><strong>Nom:</strong> ${last_name}</li>
        <li><strong>Prénom:</strong> ${first_name}</li>
        <li><strong>Organisation:</strong> ${
          organization || "(non renseigné)"
        }</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Téléphone:</strong> ${phone}</li>
      </ul>
      <p><strong>Objet:</strong> ${subject}</p>
      <p style="white-space:pre-wrap">${message.replace(/</g, "&lt;")}</p>
    `;

    await sendMail({
      notifyTo: String(import.meta.env.MAIL_TO || "cb.dauvier@gmail.com"),
      from: String(import.meta.env.MAIL_FROM || "no-reply@exemple.com"),
      subject: "Un visiteur vient d'envoyer un message",
      text: plain,
      html,
    });

    await sendTemplateMail({
      to: email,
      from: String(import.meta.env.MAIL_FROM || "no-reply@exemple.com"),
      subject: "Confirmation de l’envoi de votre message",
      template: "confirmation",
      data: {
        brandName: "Fondation l’école des loisirs",
        logoUrl: import.meta.env.MAIL_LOGO,
        heroUrl: import.meta.env.MAIL_HERO,
        waveUrl: import.meta.env.MAIL_WAVE,
        mailType: "contactForm",
      },
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    console.error("submit-contact error:", e);
    return new Response(JSON.stringify({ ok: false }), { status: 500 });
  }
};
