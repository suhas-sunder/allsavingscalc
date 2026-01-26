import * as React from "react";
import type {
  Frequency,
  HorizonUnit,
  ContributionTiming,
  ContributionGrowthFrequency,
} from "./compound.logic";
import { LabeledNumber, LabeledSelect } from "../home/ui.primitives";

function useMediaQuery(query: string): boolean {
  const getSnapshot = React.useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  }, [query]);

  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === "undefined") return () => {};
      const mql = window.matchMedia(query);
      const handler = () => onStoreChange();
      // Safari < 14
      if (typeof mql.addEventListener === "function") {
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
      }
      mql.addListener(handler);
      return () => mql.removeListener(handler);
    },
    [query],
  );

  return React.useSyncExternalStore(subscribe, getSnapshot, () => false);
}

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

  contributionDelayMonths,
  setContributionDelayMonths,
  contributionTiming,
  setContributionTiming,
  contributionGrowthAnnualPct,
  setContributionGrowthAnnualPct,
  contributionGrowthFrequency,
  setContributionGrowthFrequency,
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

  contributionDelayMonths: number;
  setContributionDelayMonths: (n: number) => void;

  contributionTiming: ContributionTiming;
  setContributionTiming: (v: ContributionTiming) => void;

  contributionGrowthAnnualPct: number;
  setContributionGrowthAnnualPct: (n: number) => void;

  contributionGrowthFrequency: ContributionGrowthFrequency;
  setContributionGrowthFrequency: (v: ContributionGrowthFrequency) => void;
}) {
  type AdvancedMode = "auto" | "open" | "closed";
  const [advancedMode, setAdvancedMode] = React.useState<AdvancedMode>("auto");
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const advancedOpen =
    advancedMode === "open"
      ? true
      : advancedMode === "closed"
        ? false
        : isDesktop;
  const advancedId = React.useId();

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
          min={0}
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

      {/* Advanced Options */}
      <div
        className="mt-4 overflow-hidden rounded-2xl border border-slate-200"
        data-adv-mode={advancedMode}
      >
        <style
          // CSS-only default: closed on small screens, open on md+.
          // Avoids layout shift because visibility is determined by CSS at first paint.
          dangerouslySetInnerHTML={{
            __html:
              "[data-adv-mode='open'] .adv-content{display:block;}" +
              "[data-adv-mode='closed'] .adv-content{display:none;}" +
              "[data-adv-mode='auto'] .adv-content{display:none;}" +
              "@media (min-width:768px){[data-adv-mode='auto'] .adv-content{display:block;}}" +
              "[data-adv-mode='open'] .adv-caret{transform:rotate(180deg);}" +
              "[data-adv-mode='closed'] .adv-caret{transform:rotate(0deg);}" +
              "[data-adv-mode='auto'] .adv-caret{transform:rotate(0deg);}" +
              "@media (min-width:768px){[data-adv-mode='auto'] .adv-caret{transform:rotate(180deg);}}",
          }}
        />
        <button
          type="button"
          onClick={() => {
            setAdvancedMode((prev) => {
              const currentlyOpen =
                prev === "open" ? true : prev === "closed" ? false : isDesktop;
              return currentlyOpen ? "closed" : "open";
            });
          }}
          className="flex w-full cursor-pointer items-start justify-between gap-3 bg-slate-50 px-3 py-3 text-left transition hover:bg-slate-100"
          aria-expanded={advancedOpen}
          suppressHydrationWarning
          aria-controls={advancedId}
        >
          <div className="min-w-0">
            <div className="text-sm font-black text-slate-900">
              Advanced options
            </div>
            <div className="mt-0.5 text-xs leading-relaxed text-slate-600">
              Optional controls for delayed contributions, contribution timing,
              and contribution growth.
            </div>
          </div>
          <span
            className={
              "adv-caret mt-0.5 select-none text-xs font-black text-slate-500 transition"
            }
            aria-hidden="true"
          >
            ▼
          </span>
        </button>

        <div id={advancedId} className="adv-content bg-white p-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <LabeledNumber
              label="Start regular contributions after"
              value={contributionDelayMonths}
              setValue={setContributionDelayMonths}
              min={0}
              max={1200}
              maxFractionDigits={0}
              integer
              suffix=" months"
            />

            <LabeledSelect<ContributionTiming>
              label="Contribution timing"
              value={contributionTiming}
              setValue={setContributionTiming}
              options={[
                { value: "start", label: "Start of period (before interest)" },
                { value: "end", label: "End of period (after interest)" },
              ]}
            />

            <LabeledNumber
              label="Contribution growth (rate of increase)"
              value={contributionGrowthAnnualPct}
              setValue={setContributionGrowthAnnualPct}
              min={0}
              max={1000}
              maxFractionDigits={6}
              suffix="%"
            />

            <LabeledSelect<ContributionGrowthFrequency>
              label="Contribution growth frequency"
              value={contributionGrowthFrequency}
              setValue={setContributionGrowthFrequency}
              options={[
                { value: "annual", label: "Annual" },
                { value: "monthly", label: "Monthly" },
              ]}
            />
          </div>

          <p className="mt-3 text-xs leading-relaxed text-slate-600">
            Timing affects whether the monthly addition earns interest in the
            same month. Contribution growth can be applied once per year
            (annual) or smoothed across months (monthly) based on elapsed time
            from the start of the projection.
          </p>
        </div>
      </div>
    </div>
  );
}
