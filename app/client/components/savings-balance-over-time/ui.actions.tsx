import * as React from "react";
import type { CalcOutputs } from "./savings.logic";
import { round2 } from "./savings.logic";

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

    if (scheduleView === "monthly") {
      const header = ["Year", "Month", "Deposit", "Interest", "Ending balance"];
      const rows = outputs.monthlySchedule.map((r) => [
        String(r.year),
        String(r.month),
        String(round2(r.deposit)),
        String(round2(r.interest)),
        String(round2(r.endingBalance)),
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
      String(round2(r.deposit)),
      String(round2(r.interest)),
      String(round2(r.endingBalance)),
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
