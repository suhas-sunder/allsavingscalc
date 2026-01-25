import { describe, expect, test } from "vitest";

import {
  buildCanonicalUrl,
  getSiteUrlFromEnv,
  normalizeSiteUrl,
  pickPreferredHost,
} from "./seo.server";

describe("seo.server canonical helpers", () => {
  test("normalizeSiteUrl forces https by default and removes trailing slash", () => {
    expect(normalizeSiteUrl("https://example.com/", "https://fallback.com")).toBe(
      "https://example.com",
    );
    expect(normalizeSiteUrl("example.com/", "https://fallback.com")).toBe(
      "https://example.com",
    );
  });

  test("normalizeSiteUrl preserves explicit http for local/dev", () => {
    expect(normalizeSiteUrl("http://localhost:3000/", "https://fallback.com")).toBe(
      "http://localhost:3000",
    );
  });

  test("getSiteUrlFromEnv uses priority order", () => {
    const env = {
      SITE_URL: "https://site.example",
      PUBLIC_SITE_URL: "https://public.example",
      VITE_SITE_URL: "https://vite.example",
      REMIX_PUBLIC_SITE_URL: "https://remix.example",
    };
    expect(getSiteUrlFromEnv(env, "https://fallback.example")).toBe(
      "https://site.example",
    );
  });

  test("buildCanonicalUrl concatenates origin + known route slug", () => {
    const origin = pickPreferredHost("https://www.allsavingscalculators.com/");
    expect(buildCanonicalUrl(origin, "/savings-balance-over-time-calculator")).toBe(
      "https://www.allsavingscalculators.com/savings-balance-over-time-calculator",
    );
  });
});
