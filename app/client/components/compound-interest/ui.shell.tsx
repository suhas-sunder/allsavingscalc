import * as React from "react";
import { COMPOUND_FAQS } from "./compound.logic";

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

export function useCompoundInterestJsonLd() {
  return React.useMemo(() => {
    const canonical =
      "https://www.allsavingscalculators.com/compound-interest-calculator";
    const faqId = `${canonical}#faq`;
    const appId = `${canonical}#calculator`;
    const orgId = `https://www.allsavingscalculators.com/#organization`;
    const siteId = `https://www.allsavingscalculators.com/#website`;

    const faqs = (COMPOUND_FAQS || [])
      .filter((f) => f && typeof f.q === "string" && typeof f.a === "string")
      .map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      }));

    const description =
      "Free compound interest calculator with optional regular additions: initial investment, APR, compounding frequency, and a time horizon in years or months. Includes APY, charts, schedules, CSV export, and print-to-PDF.";

    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": orgId,
          name: "AllSavingsCalculators",
          url: "https://www.allsavingscalculators.com/",
        },
        {
          "@type": "WebSite",
          "@id": siteId,
          url: "https://www.allsavingscalculators.com/",
          name: "AllSavingsCalculators",
          publisher: { "@id": orgId },
        },
        {
          "@type": "WebPage",
          "@id": canonical,
          url: canonical,
          name: "Compound Interest Calculator",
          description,
          isPartOf: { "@id": siteId },
          publisher: { "@id": orgId },
          mainEntity: { "@id": appId },
        },
        {
          "@type": "SoftwareApplication",
          "@id": appId,
          name: "Compound Interest Calculator",
          applicationCategory: "FinanceApplication",
          operatingSystem: "Web",
          url: canonical,
          description:
            "Interactive compound interest tool that computes compound growth with optional regular additions, APY (effective annual rate), end balance, and schedules by month and year.",
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
          url: canonical,
          mainEntity: faqs,
          isPartOf: { "@id": canonical },
          publisher: { "@id": orgId },
        },
      ],
    };
  }, []);
}
