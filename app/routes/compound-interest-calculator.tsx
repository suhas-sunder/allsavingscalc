import * as React from "react";
import type { Route } from "./+types/compound-interest-calculator";

import {
  COLORS,
  COMPOUND_FAQS,
  type Frequency,
  type HorizonUnit,
  clampNumber,
  computeCompoundGrowth,
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
const MAX_MONTHS = 1200;

export function meta({}: Route.MetaArgs) {
  const title =
    "Compound Interest Calculator | Additions, APY, Yearly and Monthly Schedule";
  const description =
    "Free compound interest calculator with optional regular additions. Enter an initial investment, monthly contribution, APR, compounding frequency, and a time horizon in years or months to get end balance, total interest, APY, charts, a detailed schedule, plus CSV export and print-to-PDF.";
  const canonical =
    "https://www.allsavingscalculators.com/compound-interest-calculator";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content:
        "compound interest calculator, compound interest with contributions, APY calculator, effective annual rate calculator, compounding frequency calculator, interest growth schedule, monthly compound interest table, yearly compound interest table, investment growth calculator",
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

  const [initialInvestment, setInitialInvestment] = React.useState(10000);
  const [regularAddition, setRegularAddition] = React.useState(0);
  const [annualInterestRatePct, setAnnualInterestRatePct] = React.useState(5);
  const [frequency, setFrequency] = React.useState<Frequency>("monthly");

  const [horizonUnit, setHorizonUnit] = React.useState<HorizonUnit>("years");
  const [horizonValue, setHorizonValue] = React.useState(10);

  // Single source of truth for schedule resolution (also used by CSV export).
  const [scheduleView, setScheduleView] = React.useState<"yearly" | "monthly">(
    "yearly",
  );

  const setInitialInvestmentSafe = React.useCallback((n: number) => {
    setInitialInvestment(clampNumber(Number(n) || 0, 0, 1e9));
  }, []);

  const setRegularAdditionSafe = React.useCallback((n: number) => {
    setRegularAddition(clampNumber(Number(n) || 0, -1e8, 1e8));
  }, []);

  const setAprSafe = React.useCallback((n: number) => {
    setAnnualInterestRatePct(clampNumber(Number(n) || 0, -50, 100));
  }, []);

  const setHorizonValueSafe = React.useCallback(
    (n: number, unit: HorizonUnit) => {
      const raw = Math.floor(Number(n) || 0);
      const max = unit === "months" ? MAX_MONTHS : MAX_YEARS;
      setHorizonValue(clampNumber(raw, 0, max));
    },
    [],
  );

  const onChangeHorizonUnit = React.useCallback(
    (u: HorizonUnit) => {
      setHorizonUnit(u);
      setHorizonValueSafe(horizonValue, u);
    },
    [horizonValue, setHorizonValueSafe],
  );

  const outputs = React.useMemo(() => {
    return computeCompoundGrowth({
      initialInvestment: clampNumber(Number(initialInvestment) || 0, 0, 1e9),
      regularAddition: clampNumber(Number(regularAddition) || 0, -1e8, 1e8),
      annualInterestRatePct: clampNumber(
        Number(annualInterestRatePct) || 0,
        -50,
        100,
      ),
      frequency,
      horizonUnit,
      horizonValue:
        horizonUnit === "months"
          ? clampNumber(Math.floor(Number(horizonValue) || 0), 0, MAX_MONTHS)
          : clampNumber(Math.floor(Number(horizonValue) || 0), 0, MAX_YEARS),
    });
  }, [
    initialInvestment,
    regularAddition,
    annualInterestRatePct,
    frequency,
    horizonUnit,
    horizonValue,
  ]);

  // Keep bar colors mapped to donut colors.
  const normalizeChartColor = React.useCallback((c: string) => {
    switch (c) {
      case COLORS.softBlue:
        return "#2563eb";
      case COLORS.softGreen:
        return "#16a34a";
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
                initialInvestment={initialInvestment}
                setInitialInvestment={setInitialInvestmentSafe}
                regularAddition={regularAddition}
                setRegularAddition={setRegularAdditionSafe}
                annualInterestRatePct={annualInterestRatePct}
                setAnnualInterestRatePct={setAprSafe}
                frequency={frequency}
                setFrequency={setFrequency}
                horizonUnit={horizonUnit}
                setHorizonUnit={onChangeHorizonUnit}
                horizonValue={horizonValue}
                setHorizonValue={(n) => setHorizonValueSafe(n, horizonUnit)}
              />

              <ResultsSection
                outputs={outputs}
                initialInvestment={Number(initialInvestment) || 0}
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
