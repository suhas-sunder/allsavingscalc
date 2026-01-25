import * as React from "react";
import type { ChartPeriod, Frequency } from "./sbot.logic";
import { LabeledNumber, LabeledSelect } from "./sbot.primitives";

export function InputsSection(props: {
  initialDeposit: number;
  setInitialDeposit: (n: number) => void;

  monthlyContribution: number;
  setMonthlyContribution: (n: number) => void;

  monthlyContributionGrowthPct: number;
  setMonthlyContributionGrowthPct: (n: number) => void;

  annualContribution: number;
  setAnnualContribution: (n: number) => void;

  annualContributionGrowthPct: number;
  setAnnualContributionGrowthPct: (n: number) => void;

  chartPeriod: ChartPeriod;
  setChartPeriod: (v: ChartPeriod) => void;

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
    initialDeposit,
    setInitialDeposit,
    monthlyContribution,
    setMonthlyContribution,
    monthlyContributionGrowthPct,
    setMonthlyContributionGrowthPct,
    annualContribution,
    setAnnualContribution,
    annualContributionGrowthPct,
    setAnnualContributionGrowthPct,
    chartPeriod,
    setChartPeriod,
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
    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div className="mb-3 text-xs font-black uppercase tracking-wide text-slate-700">
        Inputs
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <LabeledNumber
          label="Initial deposit"
          value={initialDeposit}
          setValue={setInitialDeposit}
          min={0}
          max={1e9}
          maxFractionDigits={2}
          prefix="$"
        />

        <LabeledNumber
          label="Monthly contribution"
          value={monthlyContribution}
          setValue={setMonthlyContribution}
          min={-1e8}
          max={1e8}
          maxFractionDigits={2}
          prefix="$"
        />

        <LabeledNumber
          label="Monthly contribution increase"
          value={monthlyContributionGrowthPct}
          setValue={setMonthlyContributionGrowthPct}
          min={-100}
          max={100}
          maxFractionDigits={4}
          suffix="%/yr"
        />

        <LabeledNumber
          label="Annual contribution (optional)"
          value={annualContribution}
          setValue={setAnnualContribution}
          min={-1e8}
          max={1e8}
          maxFractionDigits={2}
          prefix="$"
        />

        <LabeledNumber
          label="Annual contribution increase"
          value={annualContributionGrowthPct}
          setValue={setAnnualContributionGrowthPct}
          min={-100}
          max={100}
          maxFractionDigits={4}
          suffix="%/yr"
        />

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
          label="Interest rate"
          value={annualInterestRatePct}
          setValue={setAnnualInterestRatePct}
          min={-50}
          max={100}
          maxFractionDigits={4}
          suffix="% APR"
        />

        <LabeledNumber
          label="Years"
          value={years}
          setValue={setYears}
          min={0}
          max={100}
          maxFractionDigits={0}
          integer
        />

        <LabeledNumber
          label="Tax rate on interest"
          value={taxRatePct}
          setValue={setTaxRatePct}
          min={0}
          max={60}
          maxFractionDigits={4}
          suffix="%"
        />

        <LabeledNumber
          label="Inflation rate (optional)"
          value={inflationRatePct}
          setValue={setInflationRatePct}
          min={0}
          max={50}
          maxFractionDigits={4}
          suffix="%"
        />

        {/* THIS is what you're missing */}
        <LabeledSelect
          label="Chart period (for line chart below)"
          value={chartPeriod}
          setValue={setChartPeriod}
          options={[
            { value: "monthly", label: "Monthly" },
            { value: "quarterly", label: "Quarterly" },
            { value: "yearly", label: "Yearly" },
          ]}
        />
      </div>
    </div>
  );
}
