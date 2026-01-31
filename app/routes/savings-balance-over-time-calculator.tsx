import * as React from "react";
import type { Route } from "./+types/savings-balance-over-time-calculator";

import { json } from "@remix-run/node";

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
  type HistorySnapshot,
} from "../client/components/savings-balance-over-time/ui.actions";
import { HowItWorksSection } from "../client/components/savings-balance-over-time/ui.howitworks";
import { FAQSection } from "../client/components/savings-balance-over-time/ui.faq";
import { DisclaimersSection } from "../client/components/savings-balance-over-time/ui.disclaimers";

import {
  buildCanonicalUrl,
  getSiteUrlFromEnv,
  pickPreferredHost,
} from "../client/components/savings-balance-over-time/seo.server";
import { useLoaderData } from "react-router";

const MAX_YEARS = 100;
const ROUTE_SLUG = "/savings-balance-over-time-calculator";
const DEFAULT_SITE_URL = "https://www.allsavingscalculators.com";

export function meta({ data }: Route.MetaArgs) {
  const title = "Savings Balance Over Time Calculator (Monthly or Yearly)";
  const description =
    "See how your savings balance grows over time with a clear monthly or yearly chart. Includes contribution timing, compounding, taxes on interest, inflation adjustment, schedules, CSV export, and print to PDF.";

  const canonical = `${DEFAULT_SITE_URL}${ROUTE_SLUG}`;

  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: "index,follow" },
    { name: "theme-color", content: "#0b2447" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { tagName: "link", rel: "canonical", href: canonical },

    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: canonical },
    { property: "og:site_name", content: "AllSavingsCalculators" },

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:url", content: canonical },
  ];
}

export function loader({ request }: Route.LoaderArgs) {
  const siteUrl = pickPreferredHost(
    getSiteUrlFromEnv(process.env, DEFAULT_SITE_URL),
  );
  const canonical = buildCanonicalUrl(siteUrl, ROUTE_SLUG);

  return json(
    { ok: true, canonical },
    {
      headers: {
        // Helps crawlers that pay attention to response headers.
        Link: `<${canonical}>; rel="canonical"`,
        "X-Robots-Tag": "index, follow",
      },
    },
  );
}

export default function SavingsBalanceOverTimeCalculator() {
  const data = useLoaderData<{ ok: boolean; canonical: string }>();
  const canonical = data?.canonical ?? `${DEFAULT_SITE_URL}${ROUTE_SLUG}`;
  const jsonLd = useSavingsBalanceOverTimeJsonLd(canonical);

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

  const historySnapshot: HistorySnapshot = React.useMemo(
    () => ({
      id: "current",
      savedAt: new Date(0).toISOString(),
      scheduleView,
      inputs: {
        initialDeposit: Number(initialDeposit) || 0,
        annualContribution: Number(annualContribution) || 0,
        annualContributionGrowthPct: Number(annualContributionGrowthPct) || 0,
        monthlyContribution: Number(monthlyContribution) || 0,
        monthlyContributionGrowthPct: Number(monthlyContributionGrowthPct) || 0,
        annualInterestRatePct: Number(annualInterestRatePct) || 0,
        frequency,
        years: Number(years) || 0,
        taxRatePct: Number(taxRatePct) || 0,
        inflationRatePct: Number(inflationRatePct) || 0,
        contributionsAtPeriodEnd,
      },
      outputs: {
        endBalance: outputs.endBalance,
        realEndBalance: outputs.realEndBalance,
        totalContributionsExInitial: outputs.totalContributionsExInitial,
        totalInterest: outputs.totalInterest,
      },
    }),
    [
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
      outputs.endBalance,
      outputs.realEndBalance,
      outputs.totalContributionsExInitial,
      outputs.totalInterest,
    ],
  );

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

              <ActionsBar
                onExportCsv={onExportCsv}
                onPrint={onPrint}
                historySnapshot={historySnapshot}
              />
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
