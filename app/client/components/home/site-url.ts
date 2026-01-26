const FALLBACK_SITE_URL = "https://www.allsavingscalculators.com";

function readEnvSiteUrl(): string | null {
  // Safe to import client-side: only reads process.env if process exists.
  try {
    const raw =
      typeof process !== "undefined" ? (process.env?.SITE_URL as unknown) : null;
    if (typeof raw !== "string") return null;

    const trimmed = raw.trim();
    if (!trimmed) return null;

    // Normalize: no trailing slash.
    return trimmed.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

export const DEFAULT_SITE_URL = FALLBACK_SITE_URL;

export function getSiteUrl(): string {
  return readEnvSiteUrl() ?? FALLBACK_SITE_URL;
}

/**
 * Returns the preferred site origin (scheme + host), with no trailing slash.
 * This is useful for schema Organization/WebSite URLs.
 */
export function getSiteOrigin(): string {
  try {
    return new URL(getSiteUrl()).origin.replace(/\/+$/, "");
  } catch {
    return FALLBACK_SITE_URL;
  }
}

function stripTrailingSlashes(s: string): string {
  return s.replace(/\/+$/, "");
}

function normalizePathname(pathname: string): string {
  let p = String(pathname || "/");

  // Collapse repeated slashes.
  p = p.replace(/\/{2,}/g, "/");

  // Strip common duplicate variants.
  if (p.endsWith("/index.html")) p = p.slice(0, -"/index.html".length) || "/";
  if (!p.startsWith("/")) p = `/${p}`;

  if (p === "/") return "/";

  // Preferred: no trailing slash for non-root paths.
  p = stripTrailingSlashes(p);
  return p || "/";
}

/**
 * Canonicalize the current request URL to the preferred absolute URL.
 * - host/protocol come from SITE_URL (or fallback)
 * - pathname comes from the request
 * - query/hash are dropped to avoid duplicate indexing across tracking params
 */
export function canonicalFromRequest(requestUrl: string): string {
  const base = getSiteUrl();

  try {
    const u = new URL(requestUrl);
    const path = normalizePathname(u.pathname);
    return path === "/" ? `${base}/` : `${base}${path}`;
  } catch {
    // If requestUrl is malformed, fall back to the site root.
    return `${base}/`;
  }
}
