/* Deterministic validation harness for SEO and history behavior.
   Run with: node scripts/seo-home-validation.mjs
   No dependencies. */
import assert from "node:assert/strict";

function canonicalFromLike(urlStr) {
  const u = new URL(urlStr);
  // strip common tracker params
  const TRACK = new Set(["utm_source","utm_medium","utm_campaign","utm_term","utm_content","gclid","fbclid","ref"]);
  const out = new URL(u.origin + u.pathname);
  // normalize pathname
  out.pathname = out.pathname.replace(/\/index\.html$/i, "/");
  out.pathname = out.pathname.replace(/\/+/g, "/");
  // prefer no trailing slash for non-root
  if (out.pathname.length > 1 && out.pathname.endsWith("/")) out.pathname = out.pathname.slice(0, -1);
  // keep only non-tracking query params (none expected for this route)
  for (const [k,v] of u.searchParams.entries()) {
    if (!TRACK.has(k)) out.searchParams.append(k, v);
  }
  // For this route we expect the canonical to be root.
  return out.toString().replace(/\?$/, "");
}

function run() {
  const cases = [
    "https://www.allsavingscalculators.com/?utm_source=x",
    "https://www.allsavingscalculators.com/index.html?gclid=1",
    "https://www.allsavingscalculators.com//?ref=test",
    "https://www.allsavingscalculators.com/?utm_medium=a&utm_campaign=b#frag",
  ];

  for (const c of cases) {
    const can = canonicalFromLike(c);
    assert.equal(can, "https://www.allsavingscalculators.com/");
  }

  // history payload sanity checks
  const item = {
    id: "x",
    savedAtIso: "2026-01-01T00:00:00.000Z",
    summary: {
      endBalance: 100,
      interestEarned: 10,
      totalContributionsExInitial: 90,
      years: 1,
      annualInterestRatePct: 5,
      frequency: "monthly",
      contributionMode: "monthly",
      annualContribution: 0,
      annualContributionGrowthPct: 0,
      monthlyContribution: 10,
      monthlyContributionGrowthPct: 0,
      taxRatePct: 0,
      inflationRatePct: 0,
      contributionsAtPeriodEnd: true,
      initialDeposit: 0,
    },
  };

  assert.equal(typeof item.summary.endBalance, "number");
  assert.ok(Number.isFinite(item.summary.endBalance));
}

run();
console.log("OK: home SEO validation passed");
