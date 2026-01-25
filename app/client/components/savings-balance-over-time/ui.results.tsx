import * as React from "react";
import { COLORS, type CalcOutputs, toCurrency } from "./savings.logic";
import { DonutChart } from "./viz.donut";
import { YearlyStackedBars } from "./viz.yearly";
import { BalanceLineChart } from "./viz.balance-line";

export function ResultsSection({
  outputs,
  initialDeposit,
  inflationRatePct,
  breakdown,
  pct,
  normalizeChartColor,
  scheduleView,
}: {
  outputs: CalcOutputs;
  initialDeposit: number;
  inflationRatePct: number;
  breakdown: { label: string; value: number; color: string }[];
  pct: number[];
  normalizeChartColor: (c: string) => string;
  scheduleView: "yearly" | "monthly";
}) {
  const strongColors = React.useMemo(
    () => ({
      principal: normalizeChartColor(COLORS.softBlue),
      contributions: normalizeChartColor(COLORS.softGreen),
      interest: normalizeChartColor(COLORS.softYellow),
    }),
    [normalizeChartColor],
  );

  const donutParts = React.useMemo(
    () =>
      breakdown.map((b) => ({
        ...b,
        color: normalizeChartColor(b.color),
      })),
    [breakdown, normalizeChartColor],
  );

  const linePoints = React.useMemo(() => {
    if (scheduleView === "monthly") {
      return outputs.monthlySchedule.map((r) => ({
        xLabel: `Y${r.year} M${r.month}`,
        value: r.endingBalance,
      }));
    }

    return outputs.schedule.map((r) => ({
      xLabel: `Year ${r.year}`,
      value: r.endingBalance,
    }));
  }, [outputs.monthlySchedule, outputs.schedule, scheduleView]);

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 border-l-4 border-l-green-600 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-700">
            Ending balance
          </div>
          <div className="mt-2 break-words text-2xl font-black tracking-tight text-green-700 sm:text-3xl">
            {toCurrency(outputs.endBalance)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            The final balance at the end of the projection.
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-700">
            Starting balance
          </div>
          <div className="mt-2 break-words text-lg font-black tracking-tight text-slate-900 sm:text-xl">
            {toCurrency(initialDeposit)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Your balance at the beginning of the timeline.
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 border-l-4 border-l-blue-600 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-700">
            Total contributions
          </div>
          <div className="mt-2 break-words text-lg font-black tracking-tight text-blue-700 sm:text-xl">
            {toCurrency(outputs.totalContributionsExInitial)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Total added across periods (excluding the starting balance).
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 border-l-4 border-l-amber-500 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-700">
            Total interest earned
          </div>
          <div className="mt-2 break-words text-lg font-black tracking-tight text-amber-700 sm:text-xl">
            {toCurrency(outputs.totalInterest)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Net interest after tax (if enabled).
          </div>
        </div>

        {inflationRatePct > 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm md:col-span-2">
            <div className="text-sm font-semibold text-slate-700">
              Inflation-adjusted ending balance
            </div>
            <div className="mt-2 break-words text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              {toCurrency(outputs.realEndBalance)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Expressed in today’s purchasing power.
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="mx-auto w-fit">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <div className="h-28 w-28 shrink-0 sm:h-32 sm:w-32">
              <DonutChart
                parts={donutParts}
                percents={pct}
                className="h-full w-full"
              />
            </div>

            <ul className="m-0 list-none p-0 text-sm">
              {donutParts.map((b, i) => (
                <li
                  key={i}
                  className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1"
                >
                  <span
                    className="inline-block h-3 w-3 shrink-0 rounded-sm border border-slate-200 align-middle"
                    style={{ background: b.color }}
                    aria-hidden="true"
                  />
                  <span className="break-words text-slate-700">
                    {b.label}:{" "}
                    <strong className="inline-block max-w-full break-words font-black text-slate-900">
                      {toCurrency(b.value)}
                    </strong>{" "}
                    <span className="text-slate-500">({pct[i]}%)</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-4">
        {/* Mobile: closed by default */}
        <details className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:hidden">
          <summary className="cursor-pointer list-none select-none">
            <div className="flex items-center justify-between">
              <div className="text-sm font-black text-slate-900">
                Balance over time charts
              </div>
              <span className="text-xs font-black text-slate-600">Show</span>
            </div>
            <div className="mt-1 text-xs leading-relaxed text-slate-600">
              Line chart of ending balance by period, plus a stacked breakdown.
            </div>
          </summary>

          <div className="mt-3">
            <BalanceLineChart
              points={linePoints}
              height={240}
              label="Balance over time line chart"
            />
          </div>

          <div className="mt-4">
            <YearlyStackedBars
              schedule={outputs.schedule}
              initialDeposit={initialDeposit}
              colors={strongColors}
              height={220}
              cornerRadius={8}
            />
          </div>
        </details>

        {/* Desktop: open by default */}
        <details
          className="hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:block"
          open
        >
          <summary className="cursor-pointer list-none select-none">
            <div className="flex items-center justify-between">
              <div className="text-sm font-black text-slate-900">
                Balance over time charts
              </div>
              <span className="text-xs font-black text-slate-600">Hide</span>
            </div>
            <div className="mt-1 text-xs leading-relaxed text-slate-600">
              Line chart of ending balance by period, plus a stacked breakdown.
            </div>
          </summary>

          <div className="mt-3">
            <BalanceLineChart
              points={linePoints}
              height={280}
              label="Balance over time line chart"
            />
          </div>

          <div className="mt-4">
            <YearlyStackedBars
              schedule={outputs.schedule}
              initialDeposit={initialDeposit}
              colors={strongColors}
              height={300}
              cornerRadius={8}
            />
          </div>
        </details>
      </div>
    </div>
  );
}
