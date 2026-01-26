import { buildCanonical, isLikelyDuplicateQuery } from "./seo";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

export function runSeoValidation() {
  const canonical = buildCanonical("/compound-interest-calculator");
  assert(
    canonical.startsWith("https://"),
    "Canonical must use https:// protocol",
  );
  assert(
    canonical.includes("/compound-interest-calculator"),
    "Canonical must include exact route pathname",
  );

  const sp1 = new URLSearchParams("utm_source=x&utm_medium=y");
  assert(isLikelyDuplicateQuery(sp1) === true, "Tracking params should be treated as duplicate variants");

  const sp2 = new URLSearchParams("");
  assert(isLikelyDuplicateQuery(sp2) === false, "Empty query should not be treated as duplicate");

  return { ok: true, canonical };
}
