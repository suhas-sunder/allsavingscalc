import type { Frequency } from "./compound.logic";
import { LabeledNumber, LabeledSelect } from "../home/ui.primitives";

export function InputsSection({
  principal,
  setPrincipal,
  annualInterestRatePct,
  setAnnualInterestRatePct,
  frequency,
  setFrequency,
  years,
  setYears,
}: {
  principal: number;
  setPrincipal: (n: number) => void;

  annualInterestRatePct: number;
  setAnnualInterestRatePct: (n: number) => void;

  frequency: Frequency;
  setFrequency: (v: Frequency) => void;

  years: number;
  setYears: (n: number) => void;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
      <div className="text-xs font-black uppercase tracking-wide text-slate-700">
        Inputs
      </div>
      <div className="mt-1 text-xs text-slate-500">
        Enter a principal, rate, compounding frequency, and timeline. Outputs update instantly.
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <LabeledNumber
          label="Starting principal"
          value={principal}
          setValue={setPrincipal}
          min={0}
          max={1e9}
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

        <LabeledNumber
          label="Years"
          value={years}
          setValue={setYears}
          min={0}
          max={100}
          maxFractionDigits={0}
          integer
        />
      </div>
    </div>
  );
}
