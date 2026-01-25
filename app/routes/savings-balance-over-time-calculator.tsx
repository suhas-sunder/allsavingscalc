import * as React from "react";
import type { Route } from "./+types/savings-balance-over-time-calculator";
import { json } from "@remix-run/node";

import {
  COLORS,
  FAQS,
  type Frequency,
  type ChartPeriod,
  type CalcInputs,
  clampNumber,
  computeSavingsBalanceOverTime,
} from "../client/components/savings-balance-over-time-calculator/sbot.logic";

import {
  PageShell,
  CardShell,
  JsonLdScript,
  useSavingsBalanceOverTimeJsonLd,
} from "../client/components/savings-balance-over-time-calculator/sbot.shell";
import { HeaderSection } from "../client/components/savings-balance-over-time-calculator/sbot.header";
import { InputsSection } from "../client/components/savings-balance-over-time-calculator/sbot.inputs";
import { ChartSection } from "../client/components/savings-balance-over-time-calculator/sbot.chartSection";
import { DataTableSection } from "../client/components/savings-balance-over-time-calculator/sbot.dataTable";
import { HowItWorksSection } from "../client/components/savings-balance-over-time-calculator/sbot.howItWorks";
import { FAQSection } from "../client/components/savings-balance-over-time-calculator/sbot.faq";
import { DisclaimersSection } from "../client/components/savings-balance-over-time-calculator/sbot.disclaimers";

export function meta({}: Route.MetaArgs) {
  const title =
    "Savings Balance Over Time | Balance Growth Chart by Month, Quarter, or Year";
  const description =
    "Visual savings balance over time calculator. See a chart-forward projection of your balance growth by month, quarter, or year based on deposits, contributions, interest rate, compounding, taxes on interest, and optional inflation adjustment. Includes CSV export and print-to-PDF.";
  const canonical =
    "https://www.allsavingscalculators.com/savings-balance-over-time";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content:
        "savings balance over time, balance growth chart, savings projection chart, savings timeline calculator, compound interest timeline, interest growth chart, monthly savings growth, yearly savings growth",
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
  return json({ ok: true });
}

export default function SavingsBalanceOverTimeRoute() {
  const [initialDeposit, setInitialDeposit] = React.useState(20000);

  const [monthlyContribution, setMonthlyContribution] = React.useState(300);
  const [monthlyContributionGrowthPct, setMonthlyContributionGrowthPct] =
    React.useState(0);

  const [annualContribution, setAnnualContribution] = React.useState(0);
  const [annualContributionGrowthPct, setAnnualContributionGrowthPct] =
    React.useState(0);

  const [annualInterestRatePct, setAnnualInterestRatePct] = React.useState(4);

  const [frequency, setFrequency] = React.useState<Frequency>("monthly");
  const [years, setYears] = React.useState(10);

  const [taxRatePct, setTaxRatePct] = React.useState(0);
  const [inflationRatePct, setInflationRatePct] = React.useState(0);

  const [contributionsAtPeriodEnd, setContributionsAtPeriodEnd] =
    React.useState(true);

  const [chartPeriod, setChartPeriod] = React.useState<ChartPeriod>("yearly");
  const [showReal, setShowReal] = React.useState(false);

  const safeInputs: CalcInputs = React.useMemo(() => {
    return {
      initialDeposit: clampNumber(Number(initialDeposit) || 0, 0, 1e9),
      monthlyContribution: clampNumber(
        Number(monthlyContribution) || 0,
        -1e8,
        1e8,
      ),
      monthlyContributionGrowthPct: clampNumber(
        Number(monthlyContributionGrowthPct) || 0,
        -100,
        100,
      ),
      annualContribution: clampNumber(
        Number(annualContribution) || 0,
        -1e8,
        1e8,
      ),
      annualContributionGrowthPct: clampNumber(
        Number(annualContributionGrowthPct) || 0,
        -100,
        100,
      ),
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
      chartPeriod,
    };
  }, [
    annualContribution,
    annualContributionGrowthPct,
    annualInterestRatePct,
    chartPeriod,
    contributionsAtPeriodEnd,
    frequency,
    inflationRatePct,
    initialDeposit,
    monthlyContribution,
    monthlyContributionGrowthPct,
    taxRatePct,
    years,
  ]);

  const outputs = React.useMemo(() => {
    return computeSavingsBalanceOverTime(safeInputs);
  }, [safeInputs]);

  // Schedule table is always derived from the underlying monthly simulation
  // so the user can toggle between Monthly and Yearly rows independent of the chart.
  const scheduleMonthly = React.useMemo(() => {
    return computeSavingsBalanceOverTime({
      ...safeInputs,
      chartPeriod: "monthly",
    });
  }, [safeInputs]);

  const inflationEnabled = (Number(inflationRatePct) || 0) > 0;

  React.useEffect(() => {
    if (inflationEnabled) return;
    setShowReal(false);
  }, [inflationEnabled]);

  const jsonLd = useSavingsBalanceOverTimeJsonLd();

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
                initialDeposit={initialDeposit}
                setInitialDeposit={setInitialDeposit}
                monthlyContribution={monthlyContribution}
                setMonthlyContribution={setMonthlyContribution}
                monthlyContributionGrowthPct={monthlyContributionGrowthPct}
                setMonthlyContributionGrowthPct={
                  setMonthlyContributionGrowthPct
                }
                annualContribution={annualContribution}
                setAnnualContribution={setAnnualContribution}
                annualContributionGrowthPct={annualContributionGrowthPct}
                setAnnualContributionGrowthPct={setAnnualContributionGrowthPct}
                chartPeriod={chartPeriod}
                setChartPeriod={setChartPeriod}
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

              <ChartSection
                outputs={outputs}
                showReal={showReal}
                setShowReal={setShowReal}
                inflationEnabled={inflationEnabled}
              />

              <DataTableSection
                monthlySeries={scheduleMonthly.series}
                years={safeInputs.years}
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
