import * as React from "react";
import type { Route } from "./+types/home";

import {
  COLORS,
  FAQS,
  type Frequency,
  type CalcInputs,
  clampNumber,
  computeSavings,
  computePercents,
} from "../client/components/home/savings.logic";

import {
  PageShell,
  CardShell,
  JsonLdScript,
  useSavingsJsonLd,
} from "../client/components/home/ui.shell";

import { HeaderSection } from "../client/components/home/ui.header";
import { InputsSection } from "../client/components/home/ui.inputs";
import { ResultsSection } from "../client/components/home/ui.results";
import { ScheduleSection } from "../client/components/home/ui.schedule";
import {
  ActionsBar,
  usePrint,
  useExportCsv,
} from "../client/components/home/ui.actions";
import { HowItWorksSection } from "../client/components/home/ui.howitworks";
import { FAQSection } from "../client/components/home/ui.faq";
import { DisclaimersSection } from "../client/components/home/ui.disclaimers";

export function meta({}: Route.MetaArgs) {
  const title =
    "Savings Calculator | End Balance, Interest Earned, Taxes, Inflation";
  const description =
    "Free savings calculator to estimate an ending balance from an initial deposit, ongoing contributions, interest rate, compounding frequency, tax on interest, and inflation. Includes a yearly schedule, charts, and CSV export.";
  const canonical = "https://www.allsavingscalculators.com/";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content:
        "savings calculator, end balance calculator, compound interest calculator, interest earned calculator, contribution growth calculator, tax on interest calculator, inflation adjusted savings calculator, savings projection",
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
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
}

export function loader({}: Route.LoaderArgs) {
  return { ok: true };
}

type ViewMode = "yearly" | "monthly";

export default function Home() {
  const [initialDeposit, setInitialDeposit] = React.useState(20000);
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

  // One shared state drives BOTH:
  // - which contribution inputs are shown (yearly vs monthly)
  // - which schedule table is shown (yearly vs monthly)
  const [viewMode, setViewMode] = React.useState<ViewMode>(() => {
    const a = Number(annualContribution) || 0;
    const m = Number(monthlyContribution) || 0;
    if (m !== 0 && a === 0) return "monthly";
    return "yearly";
  });

  const outputs = React.useMemo(() => {
    // Key fix:
    // Do NOT clear contribution values when toggling.
    // Instead, zero-out the inactive contribution type *for this calculation*.
    const annualUsed =
      viewMode === "yearly" ? Number(annualContribution) || 0 : 0;
    const annualGrowthUsed =
      viewMode === "yearly" ? Number(annualContributionGrowthPct) || 0 : 0;

    const monthlyUsed =
      viewMode === "monthly" ? Number(monthlyContribution) || 0 : 0;
    const monthlyGrowthUsed =
      viewMode === "monthly" ? Number(monthlyContributionGrowthPct) || 0 : 0;

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
      years: clampNumber(Number(years) || 0, 0, 100),
      taxRatePct: clampNumber(Number(taxRatePct) || 0, 0, 60),
      inflationRatePct: clampNumber(Number(inflationRatePct) || 0, 0, 50),
      contributionsAtPeriodEnd,
    };

    return computeSavings(safeInputs);
  }, [
    viewMode,
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
        label: "Initial deposit",
        value: Math.max(principal, 0),
        color: COLORS.softBlue,
      },
      {
        label: "Contributions",
        value: Math.max(contribs, 0),
        color: COLORS.softGreen,
      },
      {
        label: "Interest",
        value: Math.max(interest, 0),
        color: COLORS.softYellow,
      },
    ];
  }, [outputs, initialDeposit]);

  const pct = React.useMemo(
    () => computePercents(breakdown.map((b) => b.value)),
    [breakdown],
  );

  const normalizeChartColor = React.useCallback((c: string) => {
    const STRONG = { blue: "#2563eb", green: "#16a34a", amber: "#f59e0b" };
    if (c === COLORS.softBlue) return STRONG.blue;
    if (c === COLORS.softGreen) return STRONG.green;
    if (c === COLORS.softYellow) return STRONG.amber;
    return c;
  }, []);

  const onPrint = usePrint();
  const onExportCsv = useExportCsv(outputs, viewMode);

  const jsonLd = useSavingsJsonLd();

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6">
        <section className="grid gap-4">
          <CardShell>
            <div className="p-3 md:p-5">
              <HeaderSection
                contributionsAtPeriodEnd={contributionsAtPeriodEnd}
                setContributionsAtPeriodEnd={setContributionsAtPeriodEnd}
              />

              <InputsSection
                contributionMode={viewMode}
                setContributionMode={setViewMode}
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
                setYears={setYears}
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
              />

              <ScheduleSection
                scheduleView={viewMode}
                setScheduleView={setViewMode}
                outputs={outputs}
              />

              <ActionsBar onPrint={onPrint} onExportCsv={onExportCsv} />
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
