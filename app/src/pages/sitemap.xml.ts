import type { APIRoute } from "astro";
export const GET: APIRoute = async () => {
  const site = (process.env.PUBLIC_SITE_URL || "http://localhost:4321").replace(
    /\/+$/,
    ""
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${site}/sitemap-directus.xml</loc></sitemap>
  <!-- ajoute d'autres sous-sitemaps si besoin -->
</sitemapindex>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
