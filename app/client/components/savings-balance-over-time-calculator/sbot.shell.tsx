import * as React from "react";
import { FAQS } from "./sbot.logic";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-200 text-slate-900 overflow-x-hidden">
      <style>{`
        @media print {
          .noPrint { display: none !important; }
          body { background: #ffffff !important; }
          table { page-break-inside: avoid; }
          a { text-decoration: none !important; color: inherit !important; }
        }
      `}</style>
      {children}
    </div>
  );
}

export function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5">
      {children}
    </div>
  );
}

export function JsonLdScript({ jsonLd }: { jsonLd: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function useSavingsBalanceOverTimeJsonLd() {
  const baseUrl = "https://www.allsavingscalculators.com";

  return React.useMemo(() => {
    const faqEntities = FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    }));

    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${baseUrl}#org`,
          name: "AllSavingsCalculators",
          url: baseUrl,
          logo: { "@type": "ImageObject", url: `${baseUrl}/logo.png` },
        },
        {
          "@type": "WebSite",
          "@id": `${baseUrl}#website`,
          url: baseUrl,
          name: "AllSavingsCalculators",
          inLanguage: "en",
          publisher: { "@id": `${baseUrl}#org` },
        },
        {
          "@type": "WebPage",
          "@id": `${baseUrl}/savings-balance-over-time#webpage`,
          url: `${baseUrl}/savings-balance-over-time`,
          name: "Savings Balance Over Time",
          description:
            "Chart-forward savings projection showing balance growth by month, quarter, or year.",
          isPartOf: { "@id": `${baseUrl}#website` },
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${baseUrl}/savings-balance-over-time#breadcrumbs`,
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "AllSavingsCalculators",
              item: `${baseUrl}/`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Savings Balance Over Time",
              item: `${baseUrl}/savings-balance-over-time`,
            },
          ],
        },
        {
          "@type": "SoftwareApplication",
          "@id": `${baseUrl}/savings-balance-over-time#app`,
          name: "Savings Balance Over Time",
          applicationCategory: "FinanceApplication",
          operatingSystem: "Web",
          url: `${baseUrl}/savings-balance-over-time`,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        },
        {
          "@type": "FAQPage",
          "@id": `${baseUrl}/savings-balance-over-time#faq`,
          mainEntity: faqEntities,
        },
      ],
    };
  }, []);
}
