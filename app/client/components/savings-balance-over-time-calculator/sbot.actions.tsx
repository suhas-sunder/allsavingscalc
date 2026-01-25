import * as React from "react";
import { round2, type SeriesPoint } from "./sbot.logic";

export function ActionsBar({
  onPrint,
  onExportCsv,
}: {
  onPrint: () => void;
  onExportCsv: () => void;
}) {
  return (
    <div className="noPrint mt-4 flex flex-col gap-3 md:flex-row md:items-center">
      <button
        type="button"
        onClick={onPrint}
        aria-label="Print or save as PDF"
        className="w-full cursor-pointer rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-900 shadow-sm transition hover:bg-slate-50 md:w-auto"
      >
        Print / Save PDF
      </button>
      <button
        type="button"
        onClick={onExportCsv}
        aria-label="Export chart data CSV"
        className="w-full cursor-pointer rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-900 shadow-sm transition hover:bg-slate-50 md:w-auto"
      >
        Export CSV
      </button>
    </div>
  );
}

export function usePrint() {
  return React.useCallback(() => {
    if (typeof window !== "undefined") window.print();
  }, []);
}

export function useExportCsv(series: SeriesPoint[]) {
  return React.useCallback(() => {
    if (typeof window === "undefined") return;

    const header = [
      "Period",
      "Deposits",
      "Interest",
      "Balance",
      "Inflation-adjusted balance",
    ];

    const rows = series.map((p) => [
      p.label,
      String(round2(p.deposits)),
      String(round2(p.interest)),
      String(round2(p.balance)),
      String(round2(p.realBalance)),
    ]);

    const esc = (v: string) => {
      const needs = /[",\n]/.test(v);
      const s = v.replace(/"/g, '""');
      return needs ? `"${s}"` : s;
    };

    const csv =
      [header, ...rows].map((row) => row.map(esc).join(",")).join("\n") + "\n";

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "savings-balance-over-time.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  }, [series]);
}
