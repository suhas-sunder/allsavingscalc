import * as React from "react";
import { COLORS, type CalcOutputs, toCurrency } from "./savings.logic";
import { DonutChart } from "./viz.donut";
import { YearlyStackedBars } from "./viz.yearly";

export function ResultsSection({
  outputs,
  initialDeposit,
  inflationRatePct,
  breakdown,
  pct,
  normalizeChartColor,
}: {
  outputs: CalcOutputs;
  initialDeposit: number;
  inflationRatePct: number;
  breakdown: { label: string; value: number; color: string }[];
  pct: number[];
  normalizeChartColor: (c: string) => string;
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

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-600 p-3 shadow-sm md:p-4">
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 border-l-4 border-l-green-600 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-sky-700">
            End balance
          </div>
          <div className="mt-2 break-words text-2xl font-black tracking-tight text-green-700 sm:text-3xl">
            {toCurrency(outputs.endBalance)}
          </div>
          <div className="mt-1 text-xs text-slate-800">
            Balance after interest, contributions, taxes, and timing.
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-sky-700">
            Initial deposit
          </div>
          <div className="mt-2 break-words text-lg font-black tracking-tight text-sky-900 sm:text-xl">
            {toCurrency(initialDeposit)}
          </div>
          <div className="mt-1 text-xs text-slate-800">
            Your starting principal.
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 border-l-4 border-l-blue-600 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-sky-700">
            Total contributions
          </div>
          <div className="mt-2 break-words text-lg font-black tracking-tight text-sky-700 sm:text-xl">
            {toCurrency(outputs.totalContributionsExInitial)}
          </div>
          <div className="mt-1 text-xs text-slate-800">
            Total contributed over the timeline (excluding the initial deposit).
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 border-l-4 border-l-amber-500 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-sky-700">
            Total interest earned
          </div>
          <div className="mt-2 break-words text-lg font-black tracking-tight text-amber-700 sm:text-xl">
            {toCurrency(outputs.totalInterest)}
          </div>
          <div className="mt-1 text-xs text-slate-800">
            Net interest after tax (if enabled).
          </div>
        </div>

        {inflationRatePct > 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm md:col-span-2">
            <div className="text-sm font-semibold text-sky-700">
              Inflation-adjusted end balance
            </div>
            <div className="mt-2 break-words text-xl font-black tracking-tight text-sky-900 sm:text-2xl">
              {toCurrency(outputs.realEndBalance)}
            </div>
            <div className="mt-1 text-xs text-slate-800">
              Expressed in today’s purchasing power.
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="mx-auto w-fit">
          <div className="flex flex-col items-center gap-4 sm:flex-row bg-white p-4 rounded-xl sm:items-center">
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
                  <span className="break-words text-sky-700">
                    {b.label}:{" "}
                    <strong className="inline-block max-w-full break-words font-black text-sky-900">
                      {toCurrency(b.value)}
                    </strong>{" "}
                    <span className="text-slate-800">({pct[i]}%)</span>
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
              <div className="text-sm font-black text-sky-900">
                Balance growth chart
              </div>
              <span className="text-xs font-black text-slate-800">Show</span>
            </div>
            <div className="mt-1 text-xs leading-relaxed text-slate-800">
              Stacked balance by year (initial deposit, contributions,
              interest).
            </div>
          </summary>

          <div className="mt-3">
            <YearlyStackedBars
              schedule={outputs.schedule}
              initialDeposit={initialDeposit}
              colors={strongColors}
              height={240}
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
              <div className="text-sm font-black text-sky-900">
                Balance growth chart
              </div>
              <span className="text-xs font-black text-slate-800">Hide</span>
            </div>
            <div className="mt-1 text-xs leading-relaxed text-slate-800">
              Stacked balance by year (initial deposit, contributions,
              interest).
            </div>
          </summary>

          <div className="mt-3">
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
