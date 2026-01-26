export const TRACKING_QUERY_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "msclkid",
  "ref",
  "refid",
  "mc_cid",
  "mc_eid",
] as const;

export function getSiteUrl(): string {
  const raw =
    (typeof process !== "undefined" && process.env && process.env.SITE_URL) ||
    (typeof process !== "undefined" &&
      process.env &&
      process.env.PUBLIC_SITE_URL) ||
    "";
  const fallback = "https://www.allsavingscalculators.com";
  const base = (raw || fallback).trim();
  // Remove trailing slashes.
  return base.replace(/\/+$/, "");
}

export function buildCanonical(pathname: string): string {
  const base = getSiteUrl();
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path}`.replace(/\/+$/, "");
}

export function isLikelyDuplicateQuery(searchParams: URLSearchParams): boolean {
  for (const k of TRACKING_QUERY_PARAMS) {
    if (searchParams.has(k)) return true;
  }
  // Common print/embedded variants.
  if (searchParams.get("print") === "1") return true;
  if (searchParams.get("view") === "print") return true;
  if (searchParams.get("embed") === "1") return true;
  return false;
}

export function normalizeJsonLdToCanonical<T>(jsonLd: T, canonical: string): T {
  const targetPath = safeParseUrl(canonical)?.pathname;

  const visit = (v: any): any => {
    if (typeof v === "string") {
      const u = safeParseUrl(v);
      if (u && targetPath && normalizePath(u.pathname) === normalizePath(targetPath)) {
        // Preserve fragment identifiers for @id nodes.
        return `${canonical}${u.hash || ""}`;
      }
      return v;
    }
    if (Array.isArray(v)) return v.map(visit);
    if (v && typeof v === "object") {
      const out: Record<string, any> = {};
      for (const [k, val] of Object.entries(v)) out[k] = visit(val);
      return out;
    }
    return v;
  };

  return visit(jsonLd);
}

function safeParseUrl(s: string): URL | null {
  try {
    return new URL(s);
  } catch {
    return null;
  }
}

function normalizePath(p: string): string {
  // Treat trailing slash variants as equivalent.
  return p.replace(/\/+$/, "") || "/";
}
