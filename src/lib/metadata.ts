import type { SiteMetadata } from "./types";

const BLOCKED_HOST_PATTERNS = [
  /^localhost$/i,
  /\.local$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^0\./,
  /^\[?::1\]?$/,
  /^169\.254\./,
];

export function normalizeUrl(input: string): string | null {
  let raw = input.trim();
  if (!raw) return null;
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (!url.hostname.includes(".")) return null;
  if (BLOCKED_HOST_PATTERNS.some((p) => p.test(url.hostname))) return null;
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .trim();
}

function findMeta(html: string, attr: "property" | "name", key: string): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]+${attr}=["']${key}["'][^>]*content=["']([^"']*)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]*${attr}=["']${key}["']`,
      "i"
    ),
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]) return decodeEntities(m[1]);
  }
  return null;
}

export async function fetchSiteMetadata(rawUrl: string): Promise<SiteMetadata | { error: string }> {
  const url = normalizeUrl(rawUrl);
  if (!url) return { error: "That doesn't look like a valid public website URL." };

  const host = new URL(url).hostname;
  const googleFavicon = `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
  const fallback: SiteMetadata = {
    url,
    name: host.replace(/^www\./, ""),
    tagline: "",
    faviconUrl: googleFavicon,
  };

  let html: string;
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "LaunchBidBot/1.0 (+https://launchbid.example)" },
      signal: AbortSignal.timeout(6000),
      redirect: "follow",
    });
    if (!res.ok) return fallback;
    // Only read the head-ish portion; og tags live early in the document.
    html = (await res.text()).slice(0, 200_000);
  } catch {
    return fallback;
  }

  const name =
    findMeta(html, "property", "og:site_name") ??
    findMeta(html, "property", "og:title") ??
    (html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] &&
      decodeEntities(html.match(/<title[^>]*>([^<]*)<\/title>/i)![1])) ??
    fallback.name;

  const tagline =
    findMeta(html, "property", "og:description") ??
    findMeta(html, "name", "description") ??
    "";

  let faviconUrl = googleFavicon;
  const iconMatch =
    html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i) ??
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/i);
  if (iconMatch?.[1]) {
    try {
      faviconUrl = new URL(iconMatch[1], url).toString();
    } catch {
      /* keep google fallback */
    }
  }

  return {
    url,
    name: name.slice(0, 80) || fallback.name,
    tagline: tagline.slice(0, 140),
    faviconUrl,
  };
}
