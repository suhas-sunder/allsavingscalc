
import type { CalcOutputs } from "./sbot.logic";
import { toCurrency } from "./sbot.logic";
import { LineChart } from "./sbot.lineChart";

export function ChartSection({
  outputs,
  showReal,
  setShowReal,
  inflationEnabled,
}: {
  outputs: CalcOutputs;
  showReal: boolean;
  setShowReal: (v: boolean) => void;
  inflationEnabled: boolean;
}) {
  return (
    <div className="my-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-xs font-black uppercase tracking-wide text-slate-700">
          Balance chart
        </div>

        <div className="noPrint flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowReal(false)}
            aria-pressed={!showReal}
            className={[
              "cursor-pointer rounded-full border px-4 py-2 text-sm font-black shadow-sm transition",
              !showReal
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
            ].join(" ")}
          >
            Nominal
          </button>

          <button
            type="button"
            onClick={() => {
              if (!inflationEnabled) return;
              setShowReal(true);
            }}
            aria-pressed={showReal}
            disabled={!inflationEnabled}
            className={[
              "cursor-pointer rounded-full border px-4 py-2 text-sm font-black shadow-sm transition",
              showReal
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
              !inflationEnabled ? "opacity-50 cursor-not-allowed" : "",
            ].join(" ")}
            title={
              inflationEnabled
                ? "Show inflation-adjusted balances"
                : "Add an inflation rate to enable"
            }
          >
            Inflation-adjusted
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 border-l-4 border-l-emerald-800 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-700">End balance</div>
          <div className="mt-2 break-words text-2xl font-black tracking-tight text-emerald-800 md:text-3xl">
            {toCurrency(outputs.endBalance)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Final projected balance (nominal).
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 border-l-4 border-l-amber-500 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-700">
            Total interest earned
          </div>
          <div className="mt-2 break-words text-2xl font-black tracking-tight text-amber-700 md:text-3xl">
            {toCurrency(outputs.totalInterest)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Net interest after tax (if enabled).
          </div>
        </div>

        {inflationEnabled && (
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

      <div className="mt-5">
        <LineChart points={outputs.series} height={290} showReal={showReal} />
      </div>
    </div>
  );
}
