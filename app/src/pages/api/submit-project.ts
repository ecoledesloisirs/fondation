export const prerender = false;

import type { APIRoute } from "astro";
import { sendMail, sendTemplateMail } from "../../lib/mailer";
import {
  createDirectus,
  rest,
  staticToken,
  uploadFiles,
  createItem,
  type DirectusFile,
} from "@directus/sdk";

const DIRECTUS_URL = import.meta.env.DIRECTUS_URL;
const PUBLIC_SITE_URL = import.meta.env.PUBLIC_SITE_URL;

const url = import.meta.env.DIRECTUS_URL as string;
const token = import.meta.env.DIRECTUS_TOKEN as string;
const folder = import.meta.env.DIRECTUS_FOLDER_ID as string | undefined;

const client = createDirectus(url).with(rest()).with(staticToken(token));

export const POST: APIRoute = async ({ request }) => {
  try {
    const origin = request.headers.get("origin");
    if (
      origin &&
      new URL(origin).host !==
        new URL(import.meta.env.SITE ?? "http://localhost:4321").host
    ) {
      return json(403, { ok: false, error: "Forbidden" });
    }

    const form = await request.formData();
    const email = String(form.get("email") || "").trim();
    const file = form.get("file");

    const ts = Number(form.get("ts") || 0);
    if (!ts || Date.now() - ts < 2000) {
      return json(200, { ok: true });
    }

    const honey = String(form.get("company") || "").trim();
    if (honey) {
      return json(200, { ok: true });
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isEmail) {
      return json(400, { ok: false, error: "Email invalide." });
    }

    if (!(file instanceof File)) {
      return json(400, { ok: false, error: "Fichier manquant." });
    }
    if (file.size > 25 * 1024 * 1024) {
      return json(400, {
        ok: false,
        error: "Fichier trop volumineux (max 25 Mo).",
      });
    }

    const head = new Uint8Array(await file.slice(0, 5).arrayBuffer());
    const isPDF =
      head[0] === 0x25 &&
      head[1] === 0x50 &&
      head[2] === 0x44 &&
      head[3] === 0x46 &&
      head[4] === 0x2d;
    if (!isPDF) {
      return json(400, {
        ok: false,
        error: "Le fichier n'est pas un PDF valide.",
      });
    }

    const fd = new FormData();
    fd.append("file", file, file.name);
    if (folder) fd.append("folder", folder);

    const uploaded = await client.request(uploadFiles(fd));
    const fileId = Array.isArray(uploaded)
      ? uploaded[0]?.id
      : (uploaded as DirectusFile).id;

    if (!fileId) {
      return json(502, {
        ok: false,
        error: "Upload Directus échoué (id manquant).",
      });
    }

    await client.request(
      createItem("application_file", { email, pdf_form: fileId })
    );

    // 🔔 tenter l’envoi d’email (ne bloque pas la réponse en cas d’échec)
    try {
      await sendMail({
        notifyTo: String(import.meta.env.MAIL_TO || "cb.dauvier@gmail.com"),
        from: String(import.meta.env.MAIL_FROM || "no-reply@exemple.com"),
        subject: "Nouveau dépôt de dossier",
        text: `Un dossier a été déposé par ${email} (fileId: ${DIRECTUS_URL}/assets/${fileId})`,
        html: `<p>Un dossier a été déposé par <b>${email}</b>.<br/>File ID : ${DIRECTUS_URL}/assets/${fileId}</p>`,
      });

      await sendTemplateMail({
        to: email,
        from: String(import.meta.env.MAIL_FROM || "no-reply@exemple.com"),
        subject: "Confirmation du dépôt de votre dossier",
        template: "confirmation",
        data: {
          brandName: "Fondation l’école des loisirs",
          logoUrl: import.meta.env.MAIL_LOGO,
          heroUrl: import.meta.env.MAIL_HERO,
          waveUrl: import.meta.env.MAIL_WAVE,
          mailType: "submitProject",
          calendarUrl: `${PUBLIC_SITE_URL}/deposer-un-dossier`,
          contactEmail: "exemple@fondation-ecoledesloisirs.com",
        },
      });
    } catch (err) {
      console.error("Erreur d’envoi mail submit-project:", err);
    }

    return json(200, { ok: true, fileId });
  } catch (e: any) {
    console.error("submit-project error:", e?.response || e);
    return json(500, {
      ok: false,
      error: "Erreur serveur. Veuillez réessayer.",
    });
  }
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
