import type { Frequency, HorizonUnit } from "./compound.logic";
import { LabeledNumber, LabeledSelect } from "../home/ui.primitives";

export function InputsSection({
  initialInvestment,
  setInitialInvestment,
  regularAddition,
  setRegularAddition,
  annualInterestRatePct,
  setAnnualInterestRatePct,
  frequency,
  setFrequency,
  horizonUnit,
  setHorizonUnit,
  horizonValue,
  setHorizonValue,
}: {
  initialInvestment: number;
  setInitialInvestment: (n: number) => void;

  regularAddition: number;
  setRegularAddition: (n: number) => void;

  annualInterestRatePct: number;
  setAnnualInterestRatePct: (n: number) => void;

  frequency: Frequency;
  setFrequency: (v: Frequency) => void;

  horizonUnit: HorizonUnit;
  setHorizonUnit: (v: HorizonUnit) => void;

  horizonValue: number;
  setHorizonValue: (n: number) => void;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
      <div className=" grid grid-cols-1 gap-3 md:grid-cols-2">
        <LabeledNumber
          label="Initial investment"
          value={initialInvestment}
          setValue={setInitialInvestment}
          min={0}
          max={1e9}
          maxFractionDigits={12}
          prefix="$"
        />

        <LabeledNumber
          label="Regular addition (each month)"
          value={regularAddition}
          setValue={setRegularAddition}
          min={-1e8}
          max={1e8}
          maxFractionDigits={12}
          prefix="$"
        />

        <LabeledNumber
          label="Annual interest rate (APR)"
          value={annualInterestRatePct}
          setValue={setAnnualInterestRatePct}
          min={-50}
          max={100}
          maxFractionDigits={12}
          suffix="%"
        />

        <LabeledSelect<Frequency>
          label="Compounding frequency"
          value={frequency}
          setValue={setFrequency}
          options={[
            { value: "annually", label: "Annually" },
            { value: "semiannually", label: "Semiannually" },
            { value: "quarterly", label: "Quarterly" },
            { value: "monthly", label: "Monthly" },
            { value: "semimonthly", label: "Semimonthly (24x/yr)" },
            { value: "biweekly", label: "Biweekly (26x/yr)" },
            { value: "weekly", label: "Weekly (52x/yr)" },
            { value: "daily", label: "Daily (365x/yr)" },
            { value: "continuously", label: "Continuously" },
          ]}
        />

        <LabeledSelect<HorizonUnit>
          label="Time horizon"
          value={horizonUnit}
          setValue={setHorizonUnit}
          options={[
            { value: "years", label: "Years" },
            { value: "months", label: "Months" },
          ]}
        />

        <LabeledNumber
          label={horizonUnit === "months" ? "Months to grow" : "Years to grow"}
          value={horizonValue}
          setValue={setHorizonValue}
          min={0}
          max={horizonUnit === "months" ? 1200 : 100}
          maxFractionDigits={0}
          integer
        />
      </div>
    </div>
  );
}
