import * as React from "react";
import type { Route } from "./+types/savings-balance-over-time-calculator";

import {
  COLORS,
  FAQS,
  type Frequency,
  type CalcInputs,
  clampNumber,
  computeSavings,
  computePercents,
} from "../client/components/savings-balance-over-time/savings.logic";

import {
  PageShell,
  CardShell,
  JsonLdScript,
  useSavingsBalanceOverTimeJsonLd,
} from "../client/components/savings-balance-over-time/ui.shell";

import { HeaderSection } from "../client/components/savings-balance-over-time/ui.header";
import { InputsSection } from "../client/components/savings-balance-over-time/ui.inputs";
import { ResultsSection } from "../client/components/savings-balance-over-time/ui.results";
import { ScheduleSection } from "../client/components/savings-balance-over-time/ui.schedule";
import {
  ActionsBar,
  usePrint,
  useExportCsv,
} from "../client/components/savings-balance-over-time/ui.actions";
import { HowItWorksSection } from "../client/components/savings-balance-over-time/ui.howitworks";
import { FAQSection } from "../client/components/savings-balance-over-time/ui.faq";
import { DisclaimersSection } from "../client/components/savings-balance-over-time/ui.disclaimers";

const MAX_YEARS = 100;
const ROUTE_SLUG = "/savings-balance-over-time-calculator";
const CANONICAL = `https://www.allsavingscalculators.com${ROUTE_SLUG}`;

export function meta({}: Route.MetaArgs) {
  const title =
    "Savings Balance Over Time Calculator | Chart Balance Growth by Period";
  const description =
    "Visualize how your savings balance grows over time. Chart-forward view of balance progression by month or year with contribution timing, compounding, taxes on interest, and optional inflation adjustment. Includes schedules, CSV export, and print-to-PDF.";
  const canonical = CANONICAL;

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content:
        "savings balance over time calculator, balance growth chart, savings growth by month, savings growth by year, balance progression calculator, compounding schedule, contribution timing, interest growth chart, savings timeline",
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

export default function SavingsBalanceOverTimeCalculator() {
  const jsonLd = useSavingsBalanceOverTimeJsonLd();

  const [initialDeposit, setInitialDeposit] = React.useState(20000);

  // Keep both values so toggling does not destroy user input.
  const [annualContribution, setAnnualContribution] = React.useState(5000);
  const [annualContributionGrowthPct, setAnnualContributionGrowthPct] =
    React.useState(3);

  const [monthlyContribution, setMonthlyContribution] = React.useState(0);
  const [monthlyContributionGrowthPct, setMonthlyContributionGrowthPct] =
    React.useState(0);

  const [annualInterestRatePct, setAnnualInterestRatePct] = React.useState(3);
  const [frequency, setFrequency] = React.useState<Frequency>("annually");
  const [years, setYears] = React.useState(10);
  const [taxRatePct, setTaxRatePct] = React.useState(0);
  const [inflationRatePct, setInflationRatePct] = React.useState(0);

  const [contributionsAtPeriodEnd, setContributionsAtPeriodEnd] =
    React.useState(true);

  // Single source of truth for Monthly vs Yearly across Inputs + Schedule.
  const [scheduleView, setScheduleView] = React.useState<"yearly" | "monthly">(
    "yearly",
  );

  // Authoritative clamp for years to prevent UI divergence (input shows 100, state holds 1000).
  const setYearsSafe = React.useCallback((n: number) => {
    setYears(clampNumber(Number(n) || 0, 0, MAX_YEARS));
  }, []);

  const outputs = React.useMemo(() => {
    // Apply only the selected contribution cadence in the calculation.
    const annualUsed =
      scheduleView === "yearly" ? Number(annualContribution) || 0 : 0;

    const annualGrowthUsed =
      scheduleView === "yearly" ? Number(annualContributionGrowthPct) || 0 : 0;

    const monthlyUsed =
      scheduleView === "monthly" ? Number(monthlyContribution) || 0 : 0;

    const monthlyGrowthUsed =
      scheduleView === "monthly"
        ? Number(monthlyContributionGrowthPct) || 0
        : 0;

    const safeInputs: CalcInputs = {
      initialDeposit: clampNumber(Number(initialDeposit) || 0, 0, 1e9),

      annualContribution: clampNumber(annualUsed, -1e8, 1e8),
      annualContributionGrowthPct: clampNumber(annualGrowthUsed, -100, 100),

      monthlyContribution: clampNumber(monthlyUsed, -1e8, 1e8),
      monthlyContributionGrowthPct: clampNumber(monthlyGrowthUsed, -100, 100),

      annualInterestRatePct: clampNumber(
        Number(annualInterestRatePct) || 0,
        -50,
        100,
      ),
      frequency,

      // Keep compute aligned to the same max.
      years: clampNumber(Number(years) || 0, 0, MAX_YEARS),

      taxRatePct: clampNumber(Number(taxRatePct) || 0, 0, 60),
      inflationRatePct: clampNumber(Number(inflationRatePct) || 0, 0, 50),
      contributionsAtPeriodEnd,
    };

    return computeSavings(safeInputs);
  }, [
    scheduleView,
    initialDeposit,
    annualContribution,
    annualContributionGrowthPct,
    monthlyContribution,
    monthlyContributionGrowthPct,
    annualInterestRatePct,
    frequency,
    years,
    taxRatePct,
    inflationRatePct,
    contributionsAtPeriodEnd,
  ]);

  const breakdown = React.useMemo(() => {
    const principal = Number(initialDeposit) || 0;
    const contribs = outputs.totalContributionsExInitial;
    const interest = outputs.totalInterest;

    return [
      {
        label: "Starting balance",
        value: Math.max(principal, 0),
        color: COLORS.softBlue,
      },
      {
        label: "Contributions",
        value: Math.max(contribs, 0),
        color: COLORS.softGreen,
      },
      {
        label: "Interest earned",
        value: Math.max(interest, 0),
        color: COLORS.softYellow,
      },
    ];
  }, [
    outputs.totalContributionsExInitial,
    outputs.totalInterest,
    initialDeposit,
  ]);

  // computePercents expects number[]
  const pct = React.useMemo(
    () => computePercents(breakdown.map((b) => b.value)),
    [breakdown],
  );

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
              <HeaderSection />

              <InputsSection
                contributionMode={scheduleView}
                setContributionMode={setScheduleView}
                contributionsAtPeriodEnd={contributionsAtPeriodEnd}
                setContributionsAtPeriodEnd={setContributionsAtPeriodEnd}
                initialDeposit={initialDeposit}
                setInitialDeposit={setInitialDeposit}
                annualContribution={annualContribution}
                setAnnualContribution={setAnnualContribution}
                annualContributionGrowthPct={annualContributionGrowthPct}
                setAnnualContributionGrowthPct={setAnnualContributionGrowthPct}
                monthlyContribution={monthlyContribution}
                setMonthlyContribution={setMonthlyContribution}
                monthlyContributionGrowthPct={monthlyContributionGrowthPct}
                setMonthlyContributionGrowthPct={
                  setMonthlyContributionGrowthPct
                }
                frequency={frequency}
                setFrequency={setFrequency}
                annualInterestRatePct={annualInterestRatePct}
                setAnnualInterestRatePct={setAnnualInterestRatePct}
                years={years}
                setYears={setYearsSafe}
                taxRatePct={taxRatePct}
                setTaxRatePct={setTaxRatePct}
                inflationRatePct={inflationRatePct}
                setInflationRatePct={setInflationRatePct}
              />

              <ResultsSection
                outputs={outputs}
                initialDeposit={Number(initialDeposit) || 0}
                inflationRatePct={Number(inflationRatePct) || 0}
                breakdown={breakdown}
                pct={pct}
                normalizeChartColor={normalizeChartColor}
                scheduleView={scheduleView}
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
        <FAQSection faqs={FAQS} />
        <DisclaimersSection />
      </div>

      <JsonLdScript jsonLd={jsonLd} />
    </PageShell>
  );
}
