// Utilitaires communs pour Sitemap & Plan du site
export type PageItem = {
  slug?: string;
  title?: string;
  status?: string;
  date_updated?: string;
  date_created?: string;
};

function getEnv(key: string) {
  return (import.meta.env as any)[key] ?? process.env[key];
}

function baseUrlRequired(): string {
  const base = (getEnv("DIRECTUS_URL") || getEnv("PUBLIC_DIRECTUS_URL")) as
    | string
    | undefined;
  if (!base) throw new Error("DIRECTUS_URL ou PUBLIC_DIRECTUS_URL manquant");
  return base.replace(/\/+$/, "");
}

async function fetchJSON(url: string, token?: string) {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Directus error:", res.status, text);
    throw new Error(`Directus HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Récupère TOUTES les pages publiées (pagination incluse).
 * - essaie avec filtre status=published, puis retombe SANS filtre si 403 (permissions strictes au rôle).
 */
export async function getPublishedPages(): Promise<PageItem[]> {
  const base = baseUrlRequired();
  const token = (getEnv("DIRECTUS_STATIC_TOKEN") ||
    getEnv("DIRECTUS_TOKEN")) as string | undefined;

  const limit = 200;
  let page = 1;
  const all: PageItem[] = [];
  let useFilter = true;

  while (true) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sort: "-date_updated",
      fields: "slug,title,status,date_updated,date_created",
    });
    if (useFilter) params.set("filter[status][_eq]", "published");

    const url = `${base}/items/page?${params.toString()}`;

    try {
      const json = await fetchJSON(url, token);
      all.push(...(json?.data || []));
      const meta = json?.meta;
      if (!(meta?.page && meta?.pageCount && meta.page < meta.pageCount)) break;
      page++;
    } catch (err: any) {
      // si 403 sur la première page, réessaie sans filtre
      if (useFilter && String(err.message).includes("403") && page === 1) {
        useFilter = false;
        continue;
      }
      throw err;
    }
  }

  return all;
}

/** Construit le path public à partir d’un item Directus */
export function buildPagePath(p: PageItem): string | null {
  if (!p?.slug) return null;
  return p.slug === "accueil" ? "/" : `/${p.slug}`;
}

/** lastmod = date_updated || date_created (ISO) */
export function pageLastmod(p: PageItem): string | undefined {
  const d = p.date_updated || p.date_created;
  return d ? new Date(d).toISOString() : undefined;
}

/** Base du site pour fabriquer des URLs absolues */
export function getSiteBase(): string {
  const site = (getEnv("PUBLIC_SITE_URL") || "http://localhost:4321") as string;
  return site.replace(/\/+$/, "");
}
