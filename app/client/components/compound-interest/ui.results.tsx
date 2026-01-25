import * as React from "react";
import {
  COLORS,
  type CalcOutputs,
  toCurrency,
  formatPercentLoose,
  computePercents,
} from "./compound.logic";
import { DonutChart } from "../home/viz.donut";
import { YearlyStackedBars } from "./viz.yearly";

export function ResultsSection({
  outputs,
  initialInvestment,
  normalizeChartColor,
}: {
  outputs: CalcOutputs;
  initialInvestment: number;
  normalizeChartColor: (c: string) => string;
}) {
  const strongColors = React.useMemo(
    () => ({
      initial: normalizeChartColor(COLORS.softBlue),
      additions: normalizeChartColor(COLORS.softGreen),
      interest: normalizeChartColor(COLORS.softYellow),
    }),
    [normalizeChartColor],
  );

  const breakdown = React.useMemo(
    () => [
      {
        label: "Initial investment",
        value: Math.max(initialInvestment, 0),
        color: COLORS.softBlue,
      },
      {
        label: "Additions",
        value: Math.max(outputs.totalAdditions, 0),
        color: COLORS.softGreen,
      },
      {
        label: "Interest",
        value: Math.max(outputs.totalInterest, 0),
        color: COLORS.softYellow,
      },
    ],
    [initialInvestment, outputs.totalAdditions, outputs.totalInterest],
  );

  const pct = React.useMemo(
    () => computePercents(breakdown.map((b) => b.value)),
    [breakdown],
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
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 border-l-4 border-l-green-600 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-700">End balance</div>
          <div className="mt-2 break-words text-2xl font-black tracking-tight text-green-700 sm:text-3xl">
            {toCurrency(outputs.endBalance)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Initial investment plus additions, compounded over the full timeline.
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-700">Initial investment</div>
          <div className="mt-2 break-words text-lg font-black tracking-tight text-slate-900 sm:text-xl">
            {toCurrency(initialInvestment)}
          </div>
          <div className="mt-1 text-xs text-slate-500">Your starting amount.</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-700">Total additions</div>
          <div className="mt-2 break-words text-lg font-black tracking-tight text-slate-900 sm:text-xl">
            {toCurrency(outputs.totalAdditions)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Regular additions across the full timeline.
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 border-l-4 border-l-amber-500 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-700">Total interest earned</div>
          <div className="mt-2 break-words text-lg font-black tracking-tight text-amber-700 sm:text-xl">
            {toCurrency(outputs.totalInterest)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Interest only (end balance minus all contributions).
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-700">APY (effective annual rate)</div>
          <div className="mt-2 break-words text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
            {formatPercentLoose(outputs.effectiveAnnualRatePct)}%
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Includes the effect of your chosen compounding frequency.
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:col-span-2">
          <div className="text-sm font-semibold text-slate-700">Growth multiple</div>
          <div className="mt-2 break-words text-lg font-black tracking-tight text-slate-900 sm:text-xl">
            {outputs.growthMultiple > 0 ? `${outputs.growthMultiple}×` : "—"}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            End balance divided by initial investment (ignores additions).
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="mx-auto w-fit">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <div className="h-28 w-28 shrink-0 sm:h-32 sm:w-32">
              <DonutChart parts={donutParts} percents={pct} className="h-full w-full" />
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
        <details className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:hidden">
          <summary className="cursor-pointer list-none select-none">
            <div className="flex items-center justify-between">
              <div className="text-sm font-black text-slate-900">Balance growth chart</div>
              <span className="text-xs font-black text-slate-600">Show</span>
            </div>
            <div className="mt-1 text-xs leading-relaxed text-slate-600">
              Stacked balance by year (initial vs additions vs interest).
            </div>
          </summary>

          <div className="mt-3">
            <YearlyStackedBars
              schedule={outputs.schedule}
              initialInvestment={initialInvestment}
              colors={strongColors}
              height={240}
              cornerRadius={8}
            />
          </div>
        </details>

        <details
          className="hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:block"
          open
        >
          <summary className="cursor-pointer list-none select-none">
            <div className="flex items-center justify-between">
              <div className="text-sm font-black text-slate-900">Balance growth chart</div>
              <span className="text-xs font-black text-slate-600">Hide</span>
            </div>
            <div className="mt-1 text-xs leading-relaxed text-slate-600">
              Stacked balance by year (initial vs additions vs interest).
            </div>
          </summary>

          <div className="mt-3">
            <YearlyStackedBars
              schedule={outputs.schedule}
              initialInvestment={initialInvestment}
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
