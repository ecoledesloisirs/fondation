import type { APIRoute } from "astro";

type PageItem = {
  slug?: string;
  status?: string;
  date_created?: string;
  date_updated?: string;
};

function getEnv(key: string) {
  return (import.meta.env as any)[key] ?? process.env[key];
}

const COLLECTIONS = [
  {
    name: "page",
    buildPath: (i: PageItem) => {
      if (!i.slug) return null;
      return i.slug === "accueil" ? "/" : `/${i.slug}`;
    },
    changefreq: "weekly" as const,
  },
];

async function fetchAllPages(collection: string) {
  const base = (getEnv("DIRECTUS_URL") || getEnv("PUBLIC_DIRECTUS_URL")) as
    | string
    | undefined;
  if (!base) throw new Error("DIRECTUS_URL ou PUBLIC_DIRECTUS_URL manquant");

  const token = (getEnv("DIRECTUS_STATIC_TOKEN") ||
    getEnv("DIRECTUS_TOKEN")) as string | undefined;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const baseUrl = base.replace(/\/+$/, "");
  const limit = 200;
  let page = 1;
  const all: PageItem[] = [];

  while (true) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sort: "-date_updated",
      fields: "slug,status,date_updated,date_created",
    });

    // 👉 garde cette ligne si tu n’as pas mis le filtre au niveau du rôle
    params.set("filter[status][_eq]", "published");

    const url = `${baseUrl}/items/${collection}?${params.toString()}`;
    const res = await fetch(url, { headers });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("Directus error:", res.status, errText);
      throw new Error(`Directus ${collection} HTTP ${res.status}`);
    }

    const json = await res.json();
    const data: PageItem[] = json?.data || [];
    all.push(...data);

    const meta = json?.meta;
    if (!(meta?.page && meta?.pageCount && meta.page < meta.pageCount)) break;
    page++;
  }

  return all;
}

export const GET: APIRoute = async () => {
  const site = (getEnv("PUBLIC_SITE_URL") || "http://localhost:4321").replace(
    /\/+$/,
    ""
  );

  const entries: Array<{ loc: string; lastmod?: string; changefreq?: string }> =
    [];

  // pages
  const pages = await fetchAllPages("page");
  for (const p of pages) {
    const path = COLLECTIONS[0].buildPath(p);
    if (!path) continue;

    entries.push({
      loc: `${site}${path.startsWith("/") ? "" : "/"}${path}`.replace(
        /\/+$/,
        ""
      ),
      lastmod:
        p.date_updated || p.date_created
          ? new Date(p.date_updated || p.date_created || "").toISOString()
          : undefined,
      changefreq: COLLECTIONS[0].changefreq,
    });
  }

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
