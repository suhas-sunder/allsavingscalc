import * as React from "react";
import type { Route } from "./+types/compound-interest-calculator";

import {
  COLORS,
  COMPOUND_FAQS,
  type Frequency,
  clampNumber,
  computeCompoundGrowth,
  computePercents,
} from "../client/components/compound-interest/compound.logic";

import {
  PageShell,
  CardShell,
  JsonLdScript,
  useCompoundInterestJsonLd,
} from "../client/components/compound-interest/ui.shell";

import { HeaderSection } from "../client/components/compound-interest/ui.header";
import { InputsSection } from "../client/components/compound-interest/ui.inputs";
import { ResultsSection } from "../client/components/compound-interest/ui.results";
import { ScheduleSection } from "../client/components/compound-interest/ui.schedule";
import {
  ActionsBar,
  usePrint,
  useExportCsv,
} from "../client/components/compound-interest/ui.actions";
import { HowItWorksSection } from "../client/components/compound-interest/ui.howitworks";
import { FAQSection } from "../client/components/home/ui.faq";
import { DisclaimersSection } from "../client/components/compound-interest/ui.disclaimers";
import { Link } from "react-router";

const MAX_YEARS = 100;

export function meta({}: Route.MetaArgs) {
  const title =
    "Compound Interest Calculator | Pure Growth, APY, Yearly & Monthly Schedule";
  const description =
    "Free compound interest calculator for pure growth with no deposits or withdrawals. Enter a starting principal, APR, compounding frequency, and years to get end balance, total interest, APY, charts, a detailed schedule, plus CSV export and print-to-PDF.";
  const canonical =
    "https://www.allsavingscalculators.com/compound-interest-calculator";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content:
        "compound interest calculator, pure compound growth calculator, APY calculator, effective annual rate calculator, compounding frequency calculator, interest growth schedule, monthly compound interest table, yearly compound interest table",
    },
    { name: "robots", content: "index,follow" },
    { name: "theme-color", content: "#0b2447" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { tagName: "link", rel: "canonical", href: canonical },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: canonical },
    { name: "twitter:card", content: "summary" },
  ];
}

export function loader({}: Route.LoaderArgs) {
  return { ok: true };
}

export default function CompoundInterestCalculator() {
  const jsonLd = useCompoundInterestJsonLd();

  const [principal, setPrincipal] = React.useState(10000);
  const [annualInterestRatePct, setAnnualInterestRatePct] = React.useState(5);
  const [frequency, setFrequency] = React.useState<Frequency>("monthly");
  const [years, setYears] = React.useState(10);

  // Single source of truth for schedule resolution (also used by CSV export).
  const [scheduleView, setScheduleView] = React.useState<"yearly" | "monthly">(
    "yearly",
  );

  const setYearsSafe = React.useCallback((n: number) => {
    setYears(clampNumber(Number(n) || 0, 0, MAX_YEARS));
  }, []);

  const outputs = React.useMemo(() => {
    return computeCompoundGrowth({
      principal: clampNumber(Number(principal) || 0, 0, 1e9),
      annualInterestRatePct: clampNumber(
        Number(annualInterestRatePct) || 0,
        -50,
        100,
      ),
      frequency,
      years: clampNumber(Number(years) || 0, 0, MAX_YEARS),
    });
  }, [principal, annualInterestRatePct, frequency, years]);

  const breakdown = React.useMemo(() => {
    const p = Number(principal) || 0;
    const interest = outputs.totalInterest;

    return [
      { label: "Principal", value: Math.max(p, 0), color: COLORS.softBlue },
      {
        label: "Interest",
        value: Math.max(interest, 0),
        color: COLORS.softYellow,
      },
    ];
  }, [outputs.totalInterest, principal]);

  const pct = React.useMemo(
    () => computePercents(breakdown.map((b) => b.value)),
    [breakdown],
  );

  // Keep bar colors mapped to donut colors.
  const normalizeChartColor = React.useCallback((c: string) => {
    switch (c) {
      case COLORS.softBlue:
        return "#2563eb";
      case COLORS.softYellow:
        return "#f59e0b";
      default:
        return c;
    }
  }, []);

  const onPrint = usePrint();
  const onExportCsv = useExportCsv(outputs, scheduleView);

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6">
        <section className="grid gap-4">
          <CardShell>
            <div className="p-3 sm:p-5">
              {/* Breadcrumb: hidden on mobile to avoid pushing header down */}
              <div className="noPrint hidden sm:block">
                <div className="mb-2 text-xs font-black text-slate-500">
                  <Link to="/" className="hover:text-slate-700">
                    Home
                  </Link>{" "}
                  <span className="mx-1 text-slate-300">/</span>
                  <span className="text-slate-700">
                    Compound Interest Calculator
                  </span>
                </div>
              </div>

              <HeaderSection />

              <InputsSection
                principal={principal}
                setPrincipal={setPrincipal}
                annualInterestRatePct={annualInterestRatePct}
                setAnnualInterestRatePct={setAnnualInterestRatePct}
                frequency={frequency}
                setFrequency={setFrequency}
                years={years}
                setYears={setYearsSafe}
              />

              <ResultsSection
                outputs={outputs}
                principal={Number(principal) || 0}
                breakdown={breakdown}
                pct={pct}
                normalizeChartColor={normalizeChartColor}
              />

              <ScheduleSection
                scheduleView={scheduleView}
                setScheduleView={setScheduleView}
                outputs={outputs}
              />

              <ActionsBar onExportCsv={onExportCsv} onPrint={onPrint} />
            </div>
          </CardShell>
        </section>

        <HowItWorksSection />
        <FAQSection faqs={COMPOUND_FAQS} />
        <DisclaimersSection />
      </div>

      <JsonLdScript jsonLd={jsonLd} />
    </PageShell>
  );
}
