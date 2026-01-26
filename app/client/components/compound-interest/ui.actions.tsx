import * as React from "react";
import type { CalcOutputs } from "./compound.logic";
import { round2 } from "./compound.logic";

function moneyCsv(n: number) {
  const v = Number.isFinite(n) ? n : 0;
  return round2(v).toFixed(2);
}

export function ActionsBar({
  onPrint,
  onExportCsv,
}: {
  onPrint: () => void;
  onExportCsv: () => void;
}) {
  return (
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
  );
}

export function usePrint() {
  return React.useCallback(() => {
    if (typeof window !== "undefined") window.print();
  }, []);
}

export function useExportCsv(outputs: CalcOutputs, scheduleView: "yearly" | "monthly") {
  return React.useCallback(() => {
    if (typeof window === "undefined") return;

    const esc = (v: string) => {
      const needs = /[",\n]/.test(v);
      const s = v.replace(/"/g, '""');
      return needs ? `"${s}"` : s;
    };

    if (scheduleView === "monthly") {
      const header = ["Year", "Month", "Starting balance", "Addition", "Interest", "Ending balance"];
      const rows = outputs.monthlySchedule.map((r) => [
        String(r.year),
        String(r.month),
        moneyCsv(r.startingBalance),
        moneyCsv(r.addition),
        moneyCsv(r.interest),
        moneyCsv(r.endingBalance),
      ]);
      const csv =
        [header, ...rows].map((row) => row.map(esc).join(",")).join("\n") + "\n";

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "compound-interest-monthly-schedule.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
      return;
    }

    const header = ["Year", "Starting balance", "Additions", "Interest", "Ending balance"];
    const rows = outputs.schedule.map((r) => [
      String(r.year),
      moneyCsv(r.startingBalance),
      moneyCsv(r.additions),
      moneyCsv(r.interest),
      moneyCsv(r.endingBalance),
    ]);
    const csv =
      [header, ...rows].map((row) => row.map(esc).join(",")).join("\n") + "\n";

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "compound-interest-yearly-schedule.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  }, [outputs.monthlySchedule, outputs.schedule, scheduleView]);
}
