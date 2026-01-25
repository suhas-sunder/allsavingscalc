import * as React from "react";

export function HowItWorksSection() {
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <h2 className="text-lg font-black tracking-tight text-slate-900">
        How this balance over time calculator works
      </h2>

      <div className="mt-3 grid gap-3 text-sm leading-relaxed text-slate-700">
        <p>
          This tool simulates your savings month by month, then surfaces the
          results as a monthly or yearly timeline. The key output is your
          ending balance at each period, which is what the line chart and
          schedule represent.
        </p>

        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong>Starting balance</strong> sets the initial amount in the
            account.
          </li>
          <li>
            <strong>Contributions</strong> are applied either at the beginning
            or end of each period depending on the timing toggle.
          </li>
          <li>
            <strong>Interest</strong> is computed using an effective monthly
            rate derived from your selected compounding frequency.
          </li>
          <li>
            <strong>Tax on interest</strong> (optional) reduces each period’s
            interest before it is added to the balance.
          </li>
          <li>
            <strong>Inflation adjustment</strong> (optional) converts the final
            balance into today’s purchasing power.
          </li>
        </ul>

        <p className="text-xs text-slate-500">
          This is an estimate. Real accounts can differ due to posting rules,
          fees, calendar conventions, and rounding.
        </p>
      </div>
    </section>
  );
}
