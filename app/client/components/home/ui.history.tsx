import * as React from "react";
import type { Frequency } from "./savings.logic";
import { toCurrency } from "./savings.logic";

type ContributionMode = "yearly" | "monthly";

export type HistorySummary = {
  endBalance: number;
  interestEarned: number;
  totalContributionsExInitial: number;
  years: number;
  annualInterestRatePct: number;
  frequency: Frequency;
  contributionMode: ContributionMode;
  annualContribution: number;
  annualContributionGrowthPct: number;
  monthlyContribution: number;
  monthlyContributionGrowthPct: number;
  taxRatePct: number;
  inflationRatePct: number;
  contributionsAtPeriodEnd: boolean;
  initialDeposit: number;
};

type HistoryItem = {
  id: string;
  savedAtIso: string;
  summary: HistorySummary;
};

const STORAGE_KEY = "savingsCalcHistory:v1";
const MAX_ITEMS = 20;

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function newId() {
  // deterministic enough for local storage lists without extra deps
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  const parsed = safeJsonParse<HistoryItem[]>(window.localStorage.getItem(STORAGE_KEY));
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((x) => x && typeof x.id === "string" && x.summary && typeof x.summary.endBalance === "number")
    .slice(0, MAX_ITEMS);
}

function saveHistory(items: HistoryItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    // ignore storage quota errors
  }
}

export function useSavingsHistory() {
  const [items, setItems] = React.useState<HistoryItem[]>(() => []);

  React.useEffect(() => {
    setItems(loadHistory());
  }, []);

  const add = React.useCallback((item: Omit<HistoryItem, "id" | "savedAtIso">) => {
    const next: HistoryItem = { ...item, id: newId(), savedAtIso: nowIso() };
    setItems((prev) => {
      const updated = [next, ...prev].slice(0, MAX_ITEMS);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const remove = React.useCallback((id: string) => {
    setItems((prev) => {
      const updated = prev.filter((x) => x.id !== id);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const clear = React.useCallback(() => {
    setItems([]);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }, []);

  return { items, add, remove, clear };
}

export function HistorySection({
  items,
  onSaveCurrent,
  onLoad,
  onRemove,
  onClear,
}: {
  items: HistoryItem[];
  onSaveCurrent: () => void;
  onLoad: (summary: HistoryItem["summary"]) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-0.5">
          <h2 className="text-sm font-black tracking-tight text-sky-900">Saved results</h2>
          <p className="text-xs text-slate-800">
            Save snapshots to compare scenarios later on this device.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onSaveCurrent}
            className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Save current
          </button>
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50"
            disabled={items.length === 0}
          >
            Clear
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-sky-700">
          No saved results yet. Use “Save current” after you tweak inputs.
        </p>
      ) : (
        <div className="mt-3 grid gap-2">
          {items.map((it) => {
            const s = it.summary;
            const modeLabel = s.contributionMode === "monthly" ? "Monthly" : "Annual";
            const when = new Date(it.savedAtIso);
            const timeLabel = Number.isFinite(when.getTime()) ? when.toLocaleString() : it.savedAtIso;

            return (
              <div
                key={it.id}
                className="rounded-xl border border-slate-200 bg-white p-3"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="grid gap-1">
                    <div className="text-xs text-slate-800">{timeLabel}</div>
                    <div className="text-sm font-semibold text-sky-900">
                      End balance: {toCurrency(s.endBalance)}
                    </div>
                    <div className="text-xs text-slate-800">
                      {modeLabel} contributions • {s.years} year{s.years === 1 ? "" : "s"} • {s.annualInterestRatePct}% • {s.frequency}
                    </div>
                    <div className="text-xs text-slate-800">
                      Interest earned: {toCurrency(s.interestEarned)} • Contributions: {toCurrency(s.totalContributionsExInitial)}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => onLoad(s)}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(it.id)}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
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
    </section>
  );
}
