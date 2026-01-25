import * as React from "react";

export function HowItWorksSection() {
  return (
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-lg font-black tracking-tight text-slate-900">
        How this balance-over-time tool works
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="text-sm font-black text-slate-900">
            1) You enter deposits, contributions, and a rate
          </div>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Set your initial deposit, monthly and optional annual contributions,
            interest rate, compounding frequency, and time horizon. You can also
            model taxes on interest and inflation.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="text-sm font-black text-slate-900">
            2) We simulate the balance across the timeline
          </div>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Interest is applied over time using your selected compounding and
            contribution timing. If you add a tax rate, interest is reduced
            before it is added to the balance.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="text-sm font-black text-slate-900">
            3) We aggregate into your selected chart period
          </div>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Choose monthly, quarterly, or yearly. The chart and table show the
            balance at each period end, with deposits and interest summarized
            for that period. Export the chart data to CSV or print to PDF.
          </p>
        </div>
      </div>
    </section>
  );
}
