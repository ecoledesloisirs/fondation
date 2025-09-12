import type { APIRoute } from "astro";
import {
  getPublishedPages,
  buildPagePath,
  pageLastmod,
  getSiteBase,
} from "../lib/cms/sitemap";

export const GET: APIRoute = async () => {
  const site = getSiteBase();

  const pages = await getPublishedPages();

  const entries = pages
    .map((p) => {
      const path = buildPagePath(p);
      if (!path) return null;
      return {
        loc: `${site}${path.startsWith("/") ? "" : "/"}${path}`.replace(
          /\/+$/,
          ""
        ),
        lastmod: pageLastmod(p),
        changefreq: "weekly",
      };
    })
    .filter(Boolean) as Array<{
    loc: string;
    lastmod?: string;
    changefreq?: string;
  }>;

  // dédoublonnage + tri
  const seen = new Set<string>();
  const urls = entries
    .filter((e) => (seen.has(e.loc) ? false : (seen.add(e.loc), true)))
    .sort((a, b) => a.loc.localeCompare(b.loc))
    .map(
      (e) =>
        `<url><loc>${e.loc}</loc>${
          e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""
        }${
          e.changefreq ? `<changefreq>${e.changefreq}</changefreq>` : ""
        }</url>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
