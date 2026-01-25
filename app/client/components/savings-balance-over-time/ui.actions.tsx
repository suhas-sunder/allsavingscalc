import * as React from "react";
import type { CalcOutputs, Frequency } from "./savings.logic";

type HistorySnapshot = {
  id: string;
  savedAt: string;
  scheduleView: "yearly" | "monthly";
  inputs: {
    initialDeposit: number;
    annualContribution: number;
    annualContributionGrowthPct: number;
    monthlyContribution: number;
    monthlyContributionGrowthPct: number;
    annualInterestRatePct: number;
    frequency: Frequency;
    years: number;
    taxRatePct: number;
    inflationRatePct: number;
    contributionsAtPeriodEnd: boolean;
  };
  outputs: {
    endBalance: number;
    realEndBalance: number;
    totalContributionsExInitial: number;
    totalInterest: number;
  };
};

const HISTORY_KEY = "savingsBalanceOverTime.history.v1";
const HISTORY_LIMIT = 20;

function safeParseHistory(raw: string | null): HistorySnapshot[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => x && typeof x === "object")
      .slice(0, HISTORY_LIMIT);
  } catch {
    return [];
  }
}

function formatIsoShort(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function toFixed2(n: number) {
  if (!Number.isFinite(n)) return "0.00";
  return (Math.round(n * 100) / 100).toFixed(2);
}

function SavedResultsSection({
  current,
}: {
  current: HistorySnapshot;
}) {
  const [items, setItems] = React.useState<HistorySnapshot[]>(() => {
    if (typeof window === "undefined") return [];
    return safeParseHistory(window.localStorage.getItem(HISTORY_KEY));
  });

  const persist = React.useCallback((next: HistorySnapshot[]) => {
    setItems(next);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {
      // ignore quota / privacy mode
    }
  }, []);

  const onSave = React.useCallback(() => {
    const now = new Date().toISOString();
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now());

    const snap: HistorySnapshot = {
      ...current,
      id,
      savedAt: now,
    };

    const next = [snap, ...items].slice(0, HISTORY_LIMIT);
    persist(next);
  }, [current, items, persist]);

  const onRemove = React.useCallback(
    (id: string) => {
      persist(items.filter((x) => x.id !== id));
    },
    [items, persist],
  );

  const onClear = React.useCallback(() => {
    persist([]);
  }, [persist]);

  return (
    <section className="noPrint mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-black text-slate-900">Saved results</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Save snapshots of your inputs and outcomes to compare scenarios later.
            Stored locally on this device.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onSave}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-900 shadow-sm transition hover:bg-slate-50"
          >
            Save current result
          </button>
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-900 shadow-sm transition hover:bg-slate-50"
            disabled={items.length === 0}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-2">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-700">
            No saved results yet. Use “Save current result” after entering a scenario you want to keep.
          </div>
        ) : (
          items.map((x) => (
            <div
              key={x.id}
              className="rounded-xl border border-slate-200 bg-white p-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="text-xs font-black uppercase tracking-wide text-slate-600">
                    {formatIsoShort(x.savedAt)}
                  </div>
                  <div className="mt-1 text-sm font-black text-slate-900">
                    Ending balance: ${toFixed2(x.outputs.endBalance)}
                  </div>
                  <div className="mt-1 text-xs leading-relaxed text-slate-600">
                    {x.scheduleView === "monthly" ? "Monthly" : "Yearly"} view • {x.inputs.years} years • APR {toFixed2(x.inputs.annualInterestRatePct)}% • {x.inputs.frequency}
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={() => onRemove(x.id)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-900 shadow-sm transition hover:bg-slate-50"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-700 sm:grid-cols-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <div className="font-black text-slate-900">Start</div>
                  <div>${toFixed2(x.inputs.initialDeposit)}</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <div className="font-black text-slate-900">
                    Contribution
                  </div>
                  <div>
                    {x.scheduleView === "monthly"
                      ? `$${toFixed2(x.inputs.monthlyContribution)}/mo`
                      : `$${toFixed2(x.inputs.annualContribution)}/yr`}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <div className="font-black text-slate-900">Interest</div>
                  <div>${toFixed2(x.outputs.totalInterest)}</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <div className="font-black text-slate-900">Inflation adj.</div>
                  <div>${toFixed2(x.outputs.realEndBalance)}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export function ActionsBar({
  onPrint,
  onExportCsv,
  historySnapshot,
}: {
  onPrint: () => void;
  onExportCsv: () => void;
  historySnapshot: HistorySnapshot;
}) {
  return (
    <>
      <div className="noPrint mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onExportCsv}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-900 shadow-sm transition hover:bg-slate-50"
        >
          Export CSV
        </button>
        <button
          type="button"
          onClick={onPrint}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-900 shadow-sm transition hover:bg-slate-50"
        >
          Print / Save PDF
        </button>
      </div>

      <SavedResultsSection current={historySnapshot} />
    </>
  );
}

export function usePrint() {
  return React.useCallback(() => {
    if (typeof window !== "undefined") window.print();
  }, []);
}

export function useExportCsv(
  outputs: CalcOutputs,
  scheduleView: "yearly" | "monthly",
) {
  return React.useCallback(() => {
    if (typeof window === "undefined") return;

    const esc = (v: string) => {
      const needs = /[",\n]/.test(v);
      const s = v.replace(/"/g, '""');
      return needs ? `"${s}"` : s;
    };

    const f2 = (n: number) => {
      if (!Number.isFinite(n)) return "0.00";
      return (Math.round(n * 100) / 100).toFixed(2);
    };

    if (scheduleView === "monthly") {
      const header = ["Year", "Month", "Deposit", "Interest", "Ending balance"];
      const rows = outputs.monthlySchedule.map((r) => [
        String(r.year),
        String(r.month),
        f2(r.deposit),
        f2(r.interest),
        f2(r.endingBalance),
      ]);
      const csv =
        [header, ...rows].map((row) => row.map(esc).join(",")).join("\n") + "\n";

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "savings-balance-over-time-monthly.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
      return;
    }

    const header = ["Year", "Deposit", "Interest", "Ending balance"];
    const rows = outputs.schedule.map((r) => [
      String(r.year),
      f2(r.deposit),
      f2(r.interest),
      f2(r.endingBalance),
    ]);
    const csv =
      [header, ...rows].map((row) => row.map(esc).join(",")).join("\n") + "\n";

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "savings-balance-over-time-yearly.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  }, [outputs.monthlySchedule, outputs.schedule, scheduleView]);
}

export type { HistorySnapshot };
