/**
 * Server-only canonical URL helpers.
 *
 * Canonical requirements:
 * - Absolute URL
 * - Stable across query params (utm/ref/etc.)
 * - Matches preferred host/protocol
 */

const DEFAULT_SITE_URL = "https://www.allsavingscalculators.com";

function normalizeOrigin(origin: string): string {
  return origin.replace(/\/+$/, "");
}

function getSiteOrigin(): string {
  // Prefer explicit env vars when present.
  const env =
    process.env.SITE_URL ||
    process.env.PUBLIC_SITE_URL ||
    process.env.ORIGIN ||
    "";

  const origin = env.trim() ? env.trim() : DEFAULT_SITE_URL;
  return normalizeOrigin(origin);
}

function normalizePathname(pathname: string): string {
  if (!pathname) return "/";
  // Ensure leading slash.
  let p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  // Collapse duplicate slashes.
  p = p.replace(/\/+/g, "/");
  return p;
}

/**
 * Builds the canonical URL for a request URL.
 * - Drops query + hash
 * - Uses configured site origin (or safe default)
 */
export function canonicalFromRequest(requestUrl: string): string {
  const u = new URL(requestUrl);
  const origin = getSiteOrigin();
  const pathname = normalizePathname(u.pathname);

  if (pathname === "/") return `${origin}/`;
  return `${origin}${pathname}`;
}

/**
 * Deterministic validation harness for local verification (no deps).
 */
export function validateCanonicalHarness() {
  const origin = getSiteOrigin();
  return [
    canonicalFromRequest(`${origin}/?utm_source=x`),
    canonicalFromRequest(`${origin}/?ref=test#hash`),
    canonicalFromRequest(`${origin}/`),
  ];
}
