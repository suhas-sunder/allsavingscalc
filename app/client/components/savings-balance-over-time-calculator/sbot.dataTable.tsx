import * as React from "react";
import type { SeriesPoint } from "./sbot.logic";
import { toCurrency } from "./sbot.logic";
import { ActionsBar, usePrint, useExportCsv } from "./sbot.actions";

type ViewMode = "yearly" | "monthly";

export function DataTableSection({
  monthlySeries,
  years,
}: {
  monthlySeries: SeriesPoint[];
  years: number;
}) {
  const [view, setView] = React.useState<ViewMode>("yearly");

  const yearlySeries = React.useMemo(
    () => buildYearlySeriesFromMonthly(monthlySeries, years),
    [monthlySeries, years],
  );

  const displayedSeries = view === "yearly" ? yearlySeries : monthlySeries;

  const onPrint = usePrint();
  const onExportCsv = useExportCsv(displayedSeries);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-wide text-slate-700">
            Schedule
          </div>
          <div className="mt-1 text-xs text-slate-600">
            Year-by-year and month-by-month breakdown.
          </div>
        </div>

        <div className="noPrint inline-flex w-full overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm md:w-auto">
          <ToggleButton
            active={view === "yearly"}
            onClick={() => setView("yearly")}
          >
            Yearly
          </ToggleButton>
          <ToggleButton
            active={view === "monthly"}
            onClick={() => setView("monthly")}
          >
            Monthly
          </ToggleButton>
        </div>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-xs md:text-sm">
          <thead className="bg-slate-100">
            <tr>
              {view === "yearly" ? (
                <>
                  <Th>Year</Th>
                  <Th>Deposit</Th>
                  <Th>Interest</Th>
                  <Th>Ending balance</Th>
                </>
              ) : (
                <>
                  <Th>Month</Th>
                  <Th>Deposit</Th>
                  <Th>Interest</Th>
                  <Th>Ending balance</Th>
                </>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {displayedSeries.map((row, i) => (
              <tr
                key={`${view}-${row.index}-${row.label}`}
                className="transition-colors even:bg-slate-50 hover:bg-indigo-50/70"
              >
                <Td>{view === "yearly" ? String(i + 1) : row.label}</Td>
                <Td>{toCurrency(row.deposits)}</Td>
                <Td>{toCurrency(row.interest)}</Td>
                <Td strong>{toCurrency(row.balance)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs leading-relaxed text-slate-600">
        Yearly totals are aggregates of the underlying monthly simulation.
      </div>

      <ActionsBar onPrint={onPrint} onExportCsv={onExportCsv} />
    </div>
  );
}

function buildYearlySeriesFromMonthly(
  monthly: SeriesPoint[],
  years: number,
): SeriesPoint[] {
  const out: SeriesPoint[] = [];
  const y = Math.max(0, Math.floor(years));
  const count = Math.min(monthly.length, y * 12);

  for (let yearIdx = 0; yearIdx < y; yearIdx++) {
    const start = yearIdx * 12;
    const end = Math.min(start + 12, count);
    if (start >= end) break;

    const slice = monthly.slice(start, end);
    const last = slice[slice.length - 1];

    const deposits = slice.reduce((sum, p) => sum + p.deposits, 0);
    const interest = slice.reduce((sum, p) => sum + p.interest, 0);

    out.push({
      index: yearIdx,
      label: `Y${yearIdx + 1}`,
      deposits,
      interest,
      balance: last.balance,
      realBalance: last.realBalance,
    });
  }

  return out;
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full px-4 py-2 text-sm font-black transition md:w-auto",
        active
          ? "bg-indigo-600 text-white"
          : "bg-white text-slate-900 hover:bg-slate-50",
      ].join(" ")}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap border-b border-slate-200 px-2 py-2 text-left text-[8px] font-black uppercase tracking-wide text-slate-700 sm:px-3 sm:py-3 sm:text-xs">
      {children}
    </th>
  );
}

function Td({
  children,
  strong,
}: {
  children: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <td className="whitespace-nowrap px-2 py-2 text-[10px] font-semibold text-slate-800 sm:px-3 sm:py-3 sm:text-sm">
      {strong ? (
        <span className="font-black text-slate-900">{children}</span>
      ) : (
        children
      )}
    </td>
  );
}
