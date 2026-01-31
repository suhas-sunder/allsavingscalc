import * as React from "react";
import type { Route } from "./+types/compound-interest-calculator";

import {
  buildCanonical,
  isLikelyDuplicateQuery,
  normalizeJsonLdToCanonical,
} from "../client/components/compound-interest/seo";

import {
  COLORS,
  COMPOUND_FAQS,
  type Frequency,
  type HorizonUnit,
  type ContributionTiming,
  type ContributionGrowthFrequency,
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
import { FAQSection } from "../client/components/compound-interest/ui.faq";
import { DisclaimersSection } from "../client/components/compound-interest/ui.disclaimers";
import { HistorySection } from "../client/components/compound-interest/ui.history";
import { Link } from "react-router";

const MAX_YEARS = 100;
const MAX_MONTHS = 1200;

const ROUTE_PATH = "/compound-interest-calculator";
const CANONICAL_URL = buildCanonical(ROUTE_PATH);

export function meta({ data }: Route.MetaArgs) {
  const title = "Compound Interest Calculator (APY + Contributions)";
  const description =
    "Calculate compound interest with monthly contributions. See ending balance, total interest, APY, charts, and a full monthly or yearly schedule. Export CSV or print.";

  const canonical = data?.canonical ?? CANONICAL_URL;
  const robots = data?.robots ?? "index,follow";

  // Optional if you have it:
  // const ogImage = data?.ogImage ?? `${canonical}/og.png`;

  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: robots },
    { name: "theme-color", content: "#0b2447" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { tagName: "link", rel: "canonical", href: canonical },

    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: canonical },
    // { property: "og:image", content: ogImage },

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:url", content: canonical },
    // { name: "twitter:image", content: ogImage },
  ];
}

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const robots = isLikelyDuplicateQuery(url.searchParams)
    ? "noindex,follow"
    : "index,follow";

  return { ok: true, canonical: CANONICAL_URL, robots };
}

export default function CompoundInterestCalculator() {
  const jsonLdRaw = useCompoundInterestJsonLd();
  const jsonLd = React.useMemo(
    () => normalizeJsonLdToCanonical(jsonLdRaw, CANONICAL_URL),
    [jsonLdRaw],
  );

  const [initialInvestment, setInitialInvestment] = React.useState(10000);
  const [regularAddition, setRegularAddition] = React.useState(0);
  const [annualInterestRatePct, setAnnualInterestRatePct] = React.useState(5);
  const [frequency, setFrequency] = React.useState<Frequency>("monthly");

  const [horizonUnit, setHorizonUnit] = React.useState<HorizonUnit>("years");
  const [horizonValue, setHorizonValue] = React.useState(10);

  // Advanced options (collapsed by default in UI). Defaults preserve legacy behavior.
  const [contributionDelayMonths, setContributionDelayMonths] =
    React.useState(0);
  const [contributionTiming, setContributionTiming] =
    React.useState<ContributionTiming>("start");
  const [contributionGrowthAnnualPct, setContributionGrowthAnnualPct] =
    React.useState(0);

  const [contributionGrowthFrequency, setContributionGrowthFrequency] =
    React.useState<ContributionGrowthFrequency>("annual");

  // Single source of truth for schedule resolution (also used by CSV export).
  const [scheduleView, setScheduleView] = React.useState<"yearly" | "monthly">(
    "yearly",
  );

  const setInitialInvestmentSafe = React.useCallback((n: number) => {
    if (!Number.isFinite(n)) return;
    setInitialInvestment(clampNumber(n, 0, 1e9));
  }, []);

  const setRegularAdditionSafe = React.useCallback((n: number) => {
    if (!Number.isFinite(n)) return;
    // Regular additions represent contributions. Withdrawals are out of scope for this calculator.
    setRegularAddition(clampNumber(n, 0, 1e8));
  }, []);

  const setAprSafe = React.useCallback((n: number) => {
    if (!Number.isFinite(n)) return;
    setAnnualInterestRatePct(clampNumber(n, -50, 100));
  }, []);

  const setHorizonValueSafe = React.useCallback(
    (n: number, unit: HorizonUnit) => {
      if (!Number.isFinite(n)) return;
      const raw = Math.floor(n);
      const max = unit === "months" ? MAX_MONTHS : MAX_YEARS;
      setHorizonValue(clampNumber(raw, 0, max));
    },
    [],
  );

  const setContributionDelayMonthsSafe = React.useCallback((n: number) => {
    if (!Number.isFinite(n)) return;
    const raw = Math.floor(n);
    setContributionDelayMonths(clampNumber(raw, 0, MAX_MONTHS));
  }, []);

  const setContributionGrowthAnnualPctSafe = React.useCallback((n: number) => {
    if (!Number.isFinite(n)) return;
    setContributionGrowthAnnualPct(clampNumber(n, 0, 1000));
  }, []);

  const setContributionTimingSafe = React.useCallback(
    (v: ContributionTiming) => {
      setContributionTiming(v === "end" ? "end" : "start");
    },
    [],
  );

  const setContributionGrowthFrequencySafe = React.useCallback(
    (v: ContributionGrowthFrequency) => {
      setContributionGrowthFrequency(v === "monthly" ? "monthly" : "annual");
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
      regularAddition: clampNumber(Number(regularAddition) || 0, 0, 1e8),
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

      // Advanced options
      contributionDelayMonths: clampNumber(
        Math.floor(Number(contributionDelayMonths) || 0),
        0,
        MAX_MONTHS,
      ),
      contributionTiming,
      contributionGrowthAnnualPct: clampNumber(
        Number(contributionGrowthAnnualPct) || 0,
        0,
        1000,
      ),
      contributionGrowthFrequency,
    });
  }, [
    initialInvestment,
    regularAddition,
    annualInterestRatePct,
    frequency,
    horizonUnit,
    horizonValue,

    contributionDelayMonths,
    contributionTiming,
    contributionGrowthAnnualPct,
    contributionGrowthFrequency,
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
                contributionDelayMonths={contributionDelayMonths}
                setContributionDelayMonths={setContributionDelayMonthsSafe}
                contributionTiming={contributionTiming}
                setContributionTiming={setContributionTimingSafe}
                contributionGrowthAnnualPct={contributionGrowthAnnualPct}
                setContributionGrowthAnnualPct={
                  setContributionGrowthAnnualPctSafe
                }
                contributionGrowthFrequency={contributionGrowthFrequency}
                setContributionGrowthFrequency={
                  setContributionGrowthFrequencySafe
                }
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

              <HistorySection
                currentInputs={{
                  initialInvestment: Number(initialInvestment) || 0,
                  regularAddition: Number(regularAddition) || 0,
                  annualInterestRatePct: Number(annualInterestRatePct) || 0,
                  frequency,
                  horizonUnit,
                  horizonValue: Number(horizonValue) || 0,

                  contributionDelayMonths: Math.floor(
                    Number(contributionDelayMonths) || 0,
                  ),
                  contributionTiming,
                  contributionGrowthAnnualPct:
                    Number(contributionGrowthAnnualPct) || 0,

                  contributionGrowthFrequency,
                }}
                currentSummary={{
                  endBalance: outputs.endBalance,
                  totalInterest: outputs.totalInterest,
                  totalAdditions: outputs.totalAdditions,
                  effectiveAnnualRatePct: outputs.effectiveAnnualRatePct,
                }}
                onLoad={(inputs) => {
                  setInitialInvestmentSafe(inputs.initialInvestment);
                  setRegularAdditionSafe(inputs.regularAddition);
                  setAprSafe(inputs.annualInterestRatePct);
                  setFrequency(inputs.frequency);
                  onChangeHorizonUnit(inputs.horizonUnit);
                  setHorizonValueSafe(inputs.horizonValue, inputs.horizonUnit);

                  // Backward compatible: older saved results may not have advanced options.
                  setContributionDelayMonthsSafe(
                    inputs.contributionDelayMonths ?? 0,
                  );
                  setContributionTimingSafe(
                    (inputs.contributionTiming as ContributionTiming) ??
                      "start",
                  );
                  setContributionGrowthAnnualPctSafe(
                    inputs.contributionGrowthAnnualPct ?? 0,
                  );

                  setContributionGrowthFrequencySafe(
                    (inputs.contributionGrowthFrequency as ContributionGrowthFrequency) ??
                      "annual",
                  );
                }}
              />
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
