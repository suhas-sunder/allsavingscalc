import * as React from "react";
import { FAQS } from "./savings.logic";
import { getSiteOrigin } from "./site-url";

export function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const m = window.matchMedia(query);
    const onChange = () => setMatches(m.matches);

    onChange();

    if (typeof m.addEventListener === "function") {
      m.addEventListener("change", onChange);
      return () => m.removeEventListener("change", onChange);
    }

    // Safari fallback
    // eslint-disable-next-line deprecation/deprecation
    m.addListener(onChange);
    // eslint-disable-next-line deprecation/deprecation
    return () => m.removeListener(onChange);
  }, [query]);

  return matches;
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-slate-50">{children}</div>;
}

export function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {children}
    </div>
  );
}

export function JsonLdScript({ jsonLd }: { jsonLd: any }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function siteRootFromCanonical(canonicalUrl?: string): string {
  if (canonicalUrl) {
    try {
      const u = new URL(canonicalUrl);
      return `${u.origin}/`;
    } catch {
      // Fall through to env-based origin below.
    }
  }
  return `${getSiteOrigin()}/`;
}

export function useSavingsJsonLd(canonicalUrl?: string) {
  return React.useMemo(() => {
    const canonical =
      canonicalUrl || "https://www.allsavingscalculators.com/";
    const siteRoot = siteRootFromCanonical(canonical);

    const faqId = `${canonical}#faq`;
    const appId = `${canonical}#calculator`;
    const orgId = `${siteRoot}#organization`;
    const siteId = `${siteRoot}#website`;

    const faqs = (FAQS || [])
      .filter((f) => f && typeof f.q === "string" && typeof f.a === "string")
      .map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.a,
        },
      }));

    const description =
      "Free savings calculator to estimate an ending balance from an initial deposit, ongoing contributions, interest rate, compounding frequency, tax on interest, and inflation. Includes a yearly schedule, charts, and CSV export.";

    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": orgId,
          name: "AllSavingsCalculators",
          url: siteRoot,
        },
        {
          "@type": "WebSite",
          "@id": siteId,
          url: siteRoot,
          name: "AllSavingsCalculators",
          publisher: { "@id": orgId },
        },
        {
          "@type": "WebPage",
          "@id": canonical,
          url: canonical,
          name: "Savings Calculator",
          description,
          isPartOf: { "@id": siteId },
          publisher: { "@id": orgId },
          mainEntity: { "@id": appId },
        },
        {
          "@type": "SoftwareApplication",
          "@id": appId,
          name: "Savings Calculator",
          applicationCategory: "FinanceApplication",
          operatingSystem: "Web",
          url: canonical,
          description:
            "Interactive savings calculator to estimate end balance, interest earned, contributions, taxes, and inflation over time.",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          creator: { "@id": orgId },
        },
        {
          "@type": "FAQPage",
          "@id": faqId,
          url: faqId,
          mainEntity: faqs,
          mainEntityOfPage: { "@id": canonical },
          isPartOf: { "@id": canonical },
          publisher: { "@id": orgId },
        },
      ],
    };
  }, [canonicalUrl]);
}
