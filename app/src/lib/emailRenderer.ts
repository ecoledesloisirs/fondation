import fs from "node:fs/promises";
import path from "node:path";
import Handlebars from "handlebars";
import mjml2html from "mjml";
import { htmlToText } from "html-to-text";

const ROOT = process.cwd();

export async function renderMjmlTemplate(
  templateName: string,
  data: Record<string, unknown>
) {
  // ex: emails/templates/confirmation.mjml.hbs
  const file = path.join(
    ROOT,
    "emails",
    "templates",
    `${templateName}.mjml.hbs`
  );
  const src = await fs.readFile(file, "utf8");

  // Handlebars -> MJML
  Handlebars.registerHelper("eq", (a, b) => a === b);
  const hbs = Handlebars.compile(src);
  const mjml = hbs(data);

  // MJML -> HTML
  const { html, errors } = mjml2html(mjml, {
    keepComments: false,
  });
  if (errors?.length) console.error("MJML errors:", errors);

  // Fallback texte
  const text = htmlToText(html, { wordwrap: 100 });
  return { html, text };
}
