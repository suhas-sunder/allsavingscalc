import * as React from "react";
import { FAQS } from "./savings.logic";

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

export function useSavingsBalanceOverTimeJsonLd(canonical: string) {
  return React.useMemo(() => {
    const safeCanonical = canonical;
    let origin = "https://www.allsavingscalculators.com";
    try {
      origin = new URL(safeCanonical).origin;
    } catch {
      // If canonical is somehow not absolute, fall back to the production origin.
    }
    const faqId = `${safeCanonical}#faq`;
    const appId = `${safeCanonical}#calculator`;
    const orgId = `${safeCanonical}#organization`;
    const siteId = `${origin}/#website`;

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
      "Chart-forward calculator that visualizes savings balance progression by month or year based on contributions, compounding, taxes on interest, and optional inflation adjustment. Includes schedules, CSV export, and print-to-PDF.";

    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": orgId,
          name: "AllSavingsCalculators",
          url: `${origin}/`,
        },
        {
          "@type": "WebSite",
          "@id": siteId,
          url: `${origin}/`,
          name: "AllSavingsCalculators",
          publisher: { "@id": orgId },
        },
        {
          "@type": "WebPage",
          "@id": safeCanonical,
          url: safeCanonical,
          name: "Savings Balance Over Time Calculator",
          description,
          isPartOf: { "@id": siteId },
          publisher: { "@id": orgId },
          mainEntity: { "@id": appId },
        },
        {
          "@type": "SoftwareApplication",
          "@id": appId,
          name: "Savings Balance Over Time Calculator",
          applicationCategory: "FinanceApplication",
          operatingSystem: "Web",
          url: safeCanonical,
          description:
            "Interactive balance progression tool with charts and schedules to project savings growth over time.",
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
          url: safeCanonical,
          mainEntity: faqs,
          isPartOf: { "@id": safeCanonical },
          publisher: { "@id": orgId },
        },
      ],
    };
  }, [canonical]);
}
