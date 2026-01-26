import * as React from "react";
import type {
  Frequency,
  HorizonUnit,
  ContributionTiming,
  ContributionGrowthFrequency,
} from "./compound.logic";
import { toCurrency, formatPercentLoose } from "./compound.logic";

type SavedInputs = {
  initialInvestment: number;
  regularAddition: number;
  annualInterestRatePct: number;
  frequency: Frequency;
  horizonUnit: HorizonUnit;
  horizonValue: number;

  // Advanced options (optional for backward compatibility with v1 saved results).
  contributionDelayMonths?: number;
  contributionTiming?: ContributionTiming;
  contributionGrowthAnnualPct?: number;
  contributionGrowthFrequency?: ContributionGrowthFrequency;
};

type SavedOutputsSummary = {
  endBalance: number;
  totalInterest: number;
  totalAdditions: number;
  effectiveAnnualRatePct: number;
};

export type SavedResult = {
  id: string;
  createdAt: number;
  inputs: SavedInputs;
  summary: SavedOutputsSummary;
};

const STORAGE_KEY = "compound_interest_saved_results_v1";
const MAX_ITEMS = 20;

function safeParse(json: string | null): unknown {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isSavedResultArray(v: unknown): v is SavedResult[] {
  if (!Array.isArray(v)) return false;
  return v.every((x) => {
    if (!x || typeof x !== "object") return false;
    const r = x as any;
    return (
      typeof r.id === "string" &&
      typeof r.createdAt === "number" &&
      r.inputs &&
      typeof r.inputs.initialInvestment === "number" &&
      typeof r.inputs.regularAddition === "number" &&
      typeof r.inputs.annualInterestRatePct === "number" &&
      typeof r.inputs.frequency === "string" &&
      typeof r.inputs.horizonUnit === "string" &&
      typeof r.inputs.horizonValue === "number" &&

      // Advanced inputs are optional.
      (r.inputs.contributionDelayMonths === undefined ||
        typeof r.inputs.contributionDelayMonths === "number") &&
      (r.inputs.contributionTiming === undefined ||
        typeof r.inputs.contributionTiming === "string") &&
      (r.inputs.contributionGrowthAnnualPct === undefined ||
        typeof r.inputs.contributionGrowthAnnualPct === "number") &&
      (r.inputs.contributionGrowthFrequency === undefined ||
        typeof r.inputs.contributionGrowthFrequency === "string") &&
      r.summary &&
      typeof r.summary.endBalance === "number" &&
      typeof r.summary.totalInterest === "number" &&
      typeof r.summary.totalAdditions === "number" &&
      typeof r.summary.effectiveAnnualRatePct === "number"
    );
  });
}

function readSaved(): SavedResult[] {
  if (typeof window === "undefined") return [];
  const raw = safeParse(window.localStorage.getItem(STORAGE_KEY));
  if (!isSavedResultArray(raw)) return [];
  return raw
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, MAX_ITEMS);
}

function writeSaved(items: SavedResult[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
}

export function HistorySection({
  currentInputs,
  currentSummary,
  onLoad,
}: {
  currentInputs: SavedInputs;
  currentSummary: SavedOutputsSummary;
  onLoad: (inputs: SavedInputs) => void;
}) {
  const [items, setItems] = React.useState<SavedResult[]>([]);

  React.useEffect(() => {
    setItems(readSaved());
  }, []);

  const saveCurrent = React.useCallback(() => {
    const now = Date.now();
    const next: SavedResult = {
      id: `${now}_${Math.random().toString(16).slice(2)}`,
      createdAt: now,
      inputs: {
        initialInvestment: Number(currentInputs.initialInvestment) || 0,
        regularAddition: Number(currentInputs.regularAddition) || 0,
        annualInterestRatePct: Number(currentInputs.annualInterestRatePct) || 0,
        frequency: currentInputs.frequency,
        horizonUnit: currentInputs.horizonUnit,
        horizonValue: Math.floor(Number(currentInputs.horizonValue) || 0),

        contributionDelayMonths: Math.floor(Number(currentInputs.contributionDelayMonths) || 0),
        contributionTiming: currentInputs.contributionTiming,
        contributionGrowthAnnualPct: Number(currentInputs.contributionGrowthAnnualPct) || 0,
        contributionGrowthFrequency: currentInputs.contributionGrowthFrequency,
      },
      summary: {
        endBalance: Number(currentSummary.endBalance) || 0,
        totalInterest: Number(currentSummary.totalInterest) || 0,
        totalAdditions: Number(currentSummary.totalAdditions) || 0,
        effectiveAnnualRatePct: Number(currentSummary.effectiveAnnualRatePct) || 0,
      },
    };

    const updated = [next, ...items].slice(0, MAX_ITEMS);
    setItems(updated);
    writeSaved(updated);
  }, [currentInputs, currentSummary, items]);

  const removeOne = React.useCallback(
    (id: string) => {
      const updated = items.filter((x) => x.id !== id);
      setItems(updated);
      writeSaved(updated);
    },
    [items],
  );

  const clearAll = React.useCallback(() => {
    setItems([]);
    writeSaved([]);
  }, []);

  return (
    <section className="noPrint mt-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-black tracking-tight text-slate-900">
            Saved results
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Save a snapshot of your inputs and headline results in your browser (localStorage). This keeps the page feeling like an app and makes quick comparisons easier.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={saveCurrent}
            className="rounded-xl bg-blue-950 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:opacity-95"
          >
            Save current result
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-900 shadow-sm transition hover:bg-slate-50"
          >
            Clear all
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          No saved results yet. Enter your numbers, then use <strong>Save current result</strong>.
        </div>
      ) : (
        <div className="mt-4 grid gap-2">
          {items.map((r) => {
            const dt = new Date(r.createdAt);
            const when = dt.toLocaleString(undefined, {
              year: "numeric",
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <div
                key={r.id}
                className="rounded-xl border border-slate-200 bg-white p-3"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-xs font-black uppercase tracking-wide text-slate-500">
                      {when}
                    </div>
                    <div className="mt-1 grid gap-1 text-sm">
                      <div className="font-black text-slate-900">
                        End balance: {toCurrency(r.summary.endBalance)}
                      </div>
                      <div className="text-slate-700">
                        Interest: {toCurrency(r.summary.totalInterest)} · Additions: {toCurrency(r.summary.totalAdditions)} · APY: {formatPercentLoose(r.summary.effectiveAnnualRatePct)}%
                      </div>
                      <div className="text-xs text-slate-600">
                        Inputs: {toCurrency(r.inputs.initialInvestment)} start · {toCurrency(r.inputs.regularAddition)} / month · {formatPercentLoose(r.inputs.annualInterestRatePct)}% APR · {r.inputs.frequency} · {r.inputs.horizonValue} {r.inputs.horizonUnit}
                        {r.inputs.contributionDelayMonths ? (
                          <>
                            {" "}· delay {Math.floor(r.inputs.contributionDelayMonths)} mo
                          </>
                        ) : null}
                        {r.inputs.contributionTiming && r.inputs.contributionTiming !== "start" ? (
                          <>
                            {" "}· timing {r.inputs.contributionTiming}
                          </>
                        ) : null}
                        {r.inputs.contributionGrowthAnnualPct ? (
                          <>
                            {" "}· +{formatPercentLoose(r.inputs.contributionGrowthAnnualPct)}%
                            {r.inputs.contributionGrowthFrequency === "monthly"
                              ? "/yr (monthly)"
                              : "/yr"}
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={() => onLoad(r.inputs)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-900 shadow-sm transition hover:bg-slate-50"
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      onClick={() => removeOne(r.id)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-900 shadow-sm transition hover:bg-slate-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        Note: saved results live on this device and browser only. Clearing site data will remove them.
      </p>
    </section>
  );
}
