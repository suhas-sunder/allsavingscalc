/**
 * SEO helpers for canonical and host normalization.
 */

export function getSiteUrlFromEnv(
  env: Record<string, string | undefined>,
  fallbackSiteUrl: string,
): string {
  const raw =
    env.SITE_URL ||
    env.PUBLIC_SITE_URL ||
    env.VITE_SITE_URL ||
    env.REMIX_PUBLIC_SITE_URL ||
    fallbackSiteUrl;

  return normalizeSiteUrl(raw, fallbackSiteUrl);
}

/**
 * Normalize to an absolute origin (https://host), without trailing slash.
 */
export function normalizeSiteUrl(
  candidate: string,
  fallbackSiteUrl: string,
): string {
  const c = String(candidate || "").trim();
  const f = String(fallbackSiteUrl || "").trim();

  const parsed = safeParseUrl(c) ?? safeParseUrl(f);
  if (!parsed) return "https://example.com";

  // Force https for canonical unless explicitly configured as http.
  // Keeps prod stable but doesn't break local dev.
  const protocol = parsed.protocol === "http:" ? "http:" : "https:";

  return `${protocol}//${parsed.host}`;
}

/**
 * Prefer a consistent host shape.
 * If the configured base is already normalized, this is a no-op.
 */
export function pickPreferredHost(siteUrl: string): string {
  return normalizeSiteUrl(siteUrl, siteUrl);
}

/**
 * Build the canonical URL for a known route slug.
 * The pathname must be the route's true public slug.
 */
export function buildCanonicalUrl(siteUrl: string, pathname: string): string {
  const origin = pickPreferredHost(siteUrl);
  const p = String(pathname || "");
  if (!p.startsWith("/")) {
    // Never guess: if a bad pathname is passed, still return a deterministic URL.
    return `${origin}/${p}`;
  }
  return `${origin}${p}`;
}

function safeParseUrl(s: string): URL | null {
  if (!s) return null;
  try {
    return new URL(s);
  } catch {
    try {
      return new URL(`https://${s.replace(/^\/\/+/, "")}`);
    } catch {
      return null;
    }
  }
}
