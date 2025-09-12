export const GET = async () =>
  new Response(
    `User-agent: *
Disallow:

Sitemap: ${(process.env.PUBLIC_SITE_URL || "http://localhost:4321").replace(
      /\/+$/,
      ""
    )}/sitemap.xml
`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } }
  );
