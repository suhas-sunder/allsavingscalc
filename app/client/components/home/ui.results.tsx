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
  return (
    <div className="my-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
      <div className="text-xs font-black uppercase tracking-wide text-slate-700">
        Results
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 border-l-4 border-l-emerald-800 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-700">
            End balance
          </div>
          <div className="mt-2 break-words text-2xl font-black tracking-tight text-emerald-800 md:text-3xl">
            {toCurrency(outputs.endBalance)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Balance after interest, contributions, taxes, and timing.
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 border-l-4 border-l-blue-600 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-700">
            Initial deposit
          </div>
          <div className="mt-2 break-words text-lg font-black tracking-tight text-blue-700 md:text-xl">
            {toCurrency(initialDeposit)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Your starting principal.
          </div>
        </div>

        <div className=" rounded-xl border border-slate-200 border-l-4 border-l-green-600 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-700">
            Total contributions
          </div>
          <div className="mt-2 break-words text-lg font-black tracking-tight text-green-700 md:text-xl">
            {toCurrency(outputs.totalContributionsExInitial)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Total contributed over the timeline (excluding the initial deposit).
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 border-l-4 border-l-amber-500 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-700">
            Total interest earned
          </div>
          <div className="mt-2 break-words text-lg font-black tracking-tight text-amber-700 md:text-xl">
            {toCurrency(outputs.totalInterest)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Net interest after tax (if enabled).
          </div>
        </div>

        {inflationRatePct > 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm md:col-span-2">
            <div className="text-sm font-semibold text-slate-700">
              Inflation-adjusted end balance
            </div>
            <div className="mt-2 break-words text-xl font-black tracking-tight text-slate-900 md:text-2xl">
              {toCurrency(outputs.realEndBalance)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Expressed in today’s purchasing power.
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3">
        
      </div>

      <div className="mt-8 flex w-full flex-col items-center justify-center gap-4 md:flex-row md:flex-wrap md:gap-6">
        <div>
          <div className="mb-2 text-xs font-black uppercase tracking-wide text-slate-700">
            Balance by year
          </div>
          <YearlyStackedBars
            schedule={outputs.schedule}
            initialDeposit={initialDeposit}
            colors={{
              principal: normalizeChartColor(COLORS.softBlue),
              contributions: normalizeChartColor(COLORS.softGreen),
              interest: normalizeChartColor(COLORS.softYellow),
            }}
            height={240}
          />
        </div>
        <div className="h-28 w-28 sm:h-32 sm:w-32 md:h-36 md:w-36 lg:h-40 lg:w-40">
          <DonutChart
            parts={breakdown.map((b) => ({
              ...b,
              color: normalizeChartColor(b.color),
            }))}
            percents={pct}
            className="h-full w-full"
          />
        </div>

        <ul className="m-0 w-full max-w-full list-none p-0 text-sm md:w-auto">
          {breakdown.map((b, i) => (
            <li
              key={i}
              className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1"
            >
              <span
                className="inline-block h-3 w-3 shrink-0 rounded-sm border border-slate-200 align-middle"
                style={{ background: normalizeChartColor(b.color) }}
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
  );
}
