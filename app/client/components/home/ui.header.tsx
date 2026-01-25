import * as React from "react";

export function HeaderSection({
  contributionsAtPeriodEnd,
  setContributionsAtPeriodEnd,
}: {
  contributionsAtPeriodEnd: boolean;
  setContributionsAtPeriodEnd: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
      <div>
        <h1 className="text-xl font-black leading-[1.08] tracking-tight text-blue-950 md:text-2xl">
          Savings Calculator
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 md:text-base">
          Estimate your end balance from deposits, contributions, interest,
          taxes, and inflation in seconds.
        </p>
      </div>

      <div className="w-full md:w-auto">
        <div className="text-xs font-black uppercase tracking-wide text-slate-700">
          Contribution timing
        </div>

        <div
          className="mt-2 flex w-full gap-2"
          role="group"
          aria-label="Contribution timing"
        >
          <button
            type="button"
            onClick={() => setContributionsAtPeriodEnd(true)}
            aria-pressed={contributionsAtPeriodEnd}
            className={[
              "flex-1 cursor-pointer rounded-xl border px-3 py-2 text-sm font-black shadow-sm transition md:flex-none",
              contributionsAtPeriodEnd
                ? "border-blue-600 bg-blue-600 text-white shadow-blue-600/20"
                : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
            ].join(" ")}
          >
            End
          </button>

          <button
            type="button"
            onClick={() => setContributionsAtPeriodEnd(false)}
            aria-pressed={!contributionsAtPeriodEnd}
            className={[
              "flex-1 cursor-pointer rounded-xl border px-3 py-2 text-sm font-black shadow-sm transition md:flex-none",
              !contributionsAtPeriodEnd
                ? "border-blue-600 bg-blue-600 text-white shadow-blue-600/20"
                : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
            ].join(" ")}
          >
            Beginning
          </button>
        </div>
      </div>
    </div>
  );
}
