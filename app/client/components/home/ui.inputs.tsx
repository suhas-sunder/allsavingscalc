import * as React from "react";
import { type Frequency } from "./savings.logic";
import {
  formatNumberLoose,
  formatNumericStringPreserveFraction,
  LabeledNumber,
  LabeledSelect,
  parseNumericInput,
} from "./ui.primitives";

export type ContributionMode = "yearly" | "monthly";

function ContributionAmount({
  contributionMode,
  setContributionMode,
  annualContribution,
  setAnnualContribution,
  monthlyContribution,
  setMonthlyContribution,
}: {
  contributionMode: ContributionMode;
  setContributionMode: (mode: ContributionMode) => void;
  annualContribution: number;
  setAnnualContribution: (n: number) => void;
  monthlyContribution: number;
  setMonthlyContribution: (n: number) => void;
}) {
  // Keep clamping consistent with the route calculation clamp so the input,
  // results, schedule, CSV export, and print output never disagree.
  const MIN_CONTRIB = -1e8;
  const MAX_CONTRIB = 1e8;

  const value =
    contributionMode === "yearly" ? annualContribution : monthlyContribution;

  const [text, setText] = React.useState(() => formatNumberLoose(value || 0));

  React.useEffect(() => {
    setText(formatNumberLoose(value || 0));
  }, [value]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        {/* Match other input labels */}
        <div className="text-xs font-black uppercase tracking-wide text-sky-700">
          Contribution
        </div>

        <label className="flex items-center gap-2">
          <span className="sr-only">Contribution period</span>
          <select
            value={contributionMode}
            onChange={(e) =>
              setContributionMode(e.target.value as ContributionMode)
            }
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-black text-sky-900 shadow-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            aria-label="Contribution period"
          >
            <option value="monthly">per month</option>
            <option value="yearly">per year</option>
          </select>
        </label>
      </div>

      <div className="relative mt-2">
        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-black text-sky-900 shadow-sm sm:text-xs">
          $
        </span>

        <input
          inputMode="decimal"
          value={text}
          onChange={(e) => {
            const raw = e.target.value;
            setText(raw);

            const parsed = parseNumericInput(raw);
            if (parsed === null) return;

            const clamped = Math.max(MIN_CONTRIB, Math.min(MAX_CONTRIB, parsed));

            if (contributionMode === "yearly") setAnnualContribution(clamped);
            else setMonthlyContribution(clamped);
          }}
          onBlur={() => {
            const parsed = parseNumericInput(text);
            const safe = parsed === null ? Number(value) || 0 : parsed;

            const clamped = Math.max(MIN_CONTRIB, Math.min(MAX_CONTRIB, safe));

            const didClamp = clamped !== safe;

            // No rounding: preserve whatever fractional digits user typed.
            setText(
              didClamp
                ? formatNumberLoose(clamped)
                : formatNumericStringPreserveFraction(text),
            );

            if (contributionMode === "yearly") setAnnualContribution(clamped);
            else setMonthlyContribution(clamped);
          }}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 pl-12 text-sm font-black text-sky-900 shadow-inner shadow-slate-900/5 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 sm:text-base"
          aria-label="Contribution amount"
        />
      </div>

      <div className="mt-1 text-xs leading-relaxed text-slate-800">
        Use a negative value to model withdrawals.
      </div>
    </div>
  );
}

function AdvancedOptionsBody({
  contributionMode,
  contributionsAtPeriodEnd,
  setContributionsAtPeriodEnd,
  frequency,
  setFrequency,
  taxRatePct,
  setTaxRatePct,
  inflationRatePct,
  setInflationRatePct,
  annualContributionGrowthPct,
  setAnnualContributionGrowthPct,
  monthlyContributionGrowthPct,
  setMonthlyContributionGrowthPct,
}: {
  contributionMode: ContributionMode;
  contributionsAtPeriodEnd: boolean;
  setContributionsAtPeriodEnd: (v: boolean) => void;
  frequency: Frequency;
  setFrequency: (v: Frequency) => void;
  taxRatePct: number;
  setTaxRatePct: (n: number) => void;
  inflationRatePct: number;
  setInflationRatePct: (n: number) => void;
  annualContributionGrowthPct: number;
  setAnnualContributionGrowthPct: (n: number) => void;
  monthlyContributionGrowthPct: number;
  setMonthlyContributionGrowthPct: (n: number) => void;
}) {
  return (
    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <div className="text-xs font-black uppercase tracking-wide text-sky-700">
          Contribution timing
        </div>
        <div
          className="mt-2 flex w-full gap-2"
          role="group"
          aria-label="Contribution timing"
        >
          <button
            type="button"
            onClick={() => setContributionsAtPeriodEnd(true)}
            aria-pressed={contributionsAtPeriodEnd}
            className={[
              "flex-1 cursor-pointer rounded-xl border px-3 py-2 text-sm font-black shadow-sm transition",
              contributionsAtPeriodEnd
                ? "border-blue-600 bg-blue-600 text-white shadow-blue-600/20"
                : "border-slate-200 bg-white text-sky-900 hover:bg-slate-50",
            ].join(" ")}
          >
            End
          </button>
          <button
            type="button"
            onClick={() => setContributionsAtPeriodEnd(false)}
            aria-pressed={!contributionsAtPeriodEnd}
            className={[
              "flex-1 cursor-pointer rounded-xl border px-3 py-2 text-sm font-black shadow-sm transition",
              !contributionsAtPeriodEnd
                ? "border-blue-600 bg-blue-600 text-white shadow-blue-600/20"
                : "border-slate-200 bg-white text-sky-900 hover:bg-slate-50",
            ].join(" ")}
          >
            Beginning
          </button>
        </div>
        <div className="mt-2 text-xs leading-relaxed text-slate-800">
          Applies contributions at the start or end of the period.
        </div>
      </div>

      <LabeledSelect
        label="Compound frequency"
        value={frequency}
        setValue={setFrequency}
        options={[
          { value: "annually", label: "Annually" },
          { value: "semiannually", label: "Semiannually" },
          { value: "quarterly", label: "Quarterly" },
          { value: "monthly", label: "Monthly" },
          { value: "semimonthly", label: "Semimonthly" },
          { value: "biweekly", label: "Biweekly" },
          { value: "weekly", label: "Weekly" },
          { value: "daily", label: "Daily (approx)" },
          { value: "continuously", label: "Continuously" },
        ]}
      />

      <LabeledNumber
        label="Tax rate on interest"
        value={taxRatePct}
        setValue={setTaxRatePct}
        min={0}
        max={60}
        maxFractionDigits={12}
        suffix="%"
      />

      <LabeledNumber
        label="Inflation rate (optional)"
        value={inflationRatePct}
        setValue={setInflationRatePct}
        min={0}
        max={50}
        maxFractionDigits={12}
        suffix="%"
      />

      {contributionMode === "yearly" ? (
        <LabeledNumber
          label="Annual contribution increase"
          value={annualContributionGrowthPct}
          setValue={setAnnualContributionGrowthPct}
          min={-100}
          max={100}
          maxFractionDigits={12}
          suffix="%/yr"
        />
      ) : (
        <LabeledNumber
          label="Monthly contribution increase"
          value={monthlyContributionGrowthPct}
          setValue={setMonthlyContributionGrowthPct}
          min={-100}
          max={100}
          maxFractionDigits={12}
          suffix="%/yr"
        />
      )}

      <div className="hidden sm:block">
        {contributionMode === "yearly" ? (
          <LabeledNumber
            label="Monthly contribution increase"
            value={monthlyContributionGrowthPct}
            setValue={setMonthlyContributionGrowthPct}
            min={-100}
            max={100}
            maxFractionDigits={12}
            suffix="%/yr"
          />
        ) : (
          <LabeledNumber
            label="Annual contribution increase"
            value={annualContributionGrowthPct}
            setValue={setAnnualContributionGrowthPct}
            min={-100}
            max={100}
            maxFractionDigits={12}
            suffix="%/yr"
          />
        )}
      </div>
    </div>
  );
}

export function InputsSection(props: {
  contributionMode: ContributionMode;
  setContributionMode: (mode: ContributionMode) => void;

  contributionsAtPeriodEnd: boolean;
  setContributionsAtPeriodEnd: (v: boolean) => void;

  initialDeposit: number;
  setInitialDeposit: (n: number) => void;

  annualContribution: number;
  setAnnualContribution: (n: number) => void;

  annualContributionGrowthPct: number;
  setAnnualContributionGrowthPct: (n: number) => void;

  monthlyContribution: number;
  setMonthlyContribution: (n: number) => void;

  monthlyContributionGrowthPct: number;
  setMonthlyContributionGrowthPct: (n: number) => void;

  frequency: Frequency;
  setFrequency: (v: Frequency) => void;

  annualInterestRatePct: number;
  setAnnualInterestRatePct: (n: number) => void;

  years: number;
  setYears: (n: number) => void;

  taxRatePct: number;
  setTaxRatePct: (n: number) => void;

  inflationRatePct: number;
  setInflationRatePct: (n: number) => void;
}) {
  const {
    contributionMode,
    setContributionMode,

    contributionsAtPeriodEnd,
    setContributionsAtPeriodEnd,

    initialDeposit,
    setInitialDeposit,
    annualContribution,
    setAnnualContribution,
    annualContributionGrowthPct,
    setAnnualContributionGrowthPct,
    monthlyContribution,
    setMonthlyContribution,
    monthlyContributionGrowthPct,
    setMonthlyContributionGrowthPct,
    frequency,
    setFrequency,
    annualInterestRatePct,
    setAnnualInterestRatePct,
    years,
    setYears,
    taxRatePct,
    setTaxRatePct,
    inflationRatePct,
    setInflationRatePct,
  } = props;

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-100 p-3 sm:p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <LabeledNumber
          label="Initial deposit"
          value={initialDeposit}
          setValue={setInitialDeposit}
          min={0}
          max={1e9}
          maxFractionDigits={12}
          prefix="$"
        />

        <ContributionAmount
          contributionMode={contributionMode}
          setContributionMode={setContributionMode}
          annualContribution={annualContribution}
          setAnnualContribution={setAnnualContribution}
          monthlyContribution={monthlyContribution}
          setMonthlyContribution={setMonthlyContribution}
        />

        <LabeledNumber
          label="Interest rate"
          value={annualInterestRatePct}
          setValue={setAnnualInterestRatePct}
          min={-50}
          max={100}
          maxFractionDigits={12}
          suffix="% APR"
        />

        <LabeledNumber
          label="Years to save"
          value={years}
          setValue={setYears}
          min={0}
          max={100}
          maxFractionDigits={0}
          integer
        />
      </div>

      <div className="mt-3">
        {/* Mobile: closed by default (no JS, no layout shift) */}
        <details className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:hidden">
          <summary className="cursor-pointer list-none select-none">
            <div className="flex items-center justify-between">
              <div className="text-sm font-black text-sky-900">
                Advanced options
              </div>
              <span className="text-xs font-black text-slate-800">Show</span>
            </div>
            <div className="mt-1 text-xs leading-relaxed text-slate-800">
              Compounding, contribution growth, taxes, inflation, and timing.
            </div>
          </summary>

          <AdvancedOptionsBody
            contributionMode={contributionMode}
            contributionsAtPeriodEnd={contributionsAtPeriodEnd}
            setContributionsAtPeriodEnd={setContributionsAtPeriodEnd}
            frequency={frequency}
            setFrequency={setFrequency}
            taxRatePct={taxRatePct}
            setTaxRatePct={setTaxRatePct}
            inflationRatePct={inflationRatePct}
            setInflationRatePct={setInflationRatePct}
            annualContributionGrowthPct={annualContributionGrowthPct}
            setAnnualContributionGrowthPct={setAnnualContributionGrowthPct}
            monthlyContributionGrowthPct={monthlyContributionGrowthPct}
            setMonthlyContributionGrowthPct={setMonthlyContributionGrowthPct}
          />
        </details>

        {/* Desktop: open by default (no JS, no layout shift) */}
        <details
          className="hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:block"
          open
        >
          <summary className="cursor-pointer list-none select-none">
            <div className="flex items-center justify-between">
              <div className="text-sm font-black text-sky-900">
                Advanced options
              </div>
              <span className="text-xs font-black text-slate-800">Hide</span>
            </div>
            <div className="mt-1 text-xs leading-relaxed text-slate-800">
              Compounding, contribution growth, taxes, inflation, and timing.
            </div>
          </summary>

          <AdvancedOptionsBody
            contributionMode={contributionMode}
            contributionsAtPeriodEnd={contributionsAtPeriodEnd}
            setContributionsAtPeriodEnd={setContributionsAtPeriodEnd}
            frequency={frequency}
            setFrequency={setFrequency}
            taxRatePct={taxRatePct}
            setTaxRatePct={setTaxRatePct}
            inflationRatePct={inflationRatePct}
            setInflationRatePct={setInflationRatePct}
            annualContributionGrowthPct={annualContributionGrowthPct}
            setAnnualContributionGrowthPct={setAnnualContributionGrowthPct}
            monthlyContributionGrowthPct={monthlyContributionGrowthPct}
            setMonthlyContributionGrowthPct={setMonthlyContributionGrowthPct}
          />
        </details>
      </div>
    </div>
  );
}
