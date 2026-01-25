import * as React from "react";

export function HowItWorksSection() {
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <h2 className="text-lg font-black tracking-tight text-slate-900">
        How this savings calculator works
      </h2>

      <div className="mt-3 grid gap-3 text-sm leading-relaxed text-slate-700">
        <p>
          This tool simulates your savings month by month. Each month it applies
          an effective monthly interest rate derived from your selected compound
          frequency, then adds contributions based on your contribution timing.
        </p>

        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong>Initial deposit</strong> starts your balance.
          </li>
          <li>
            <strong>Contributions</strong> (annual + monthly) are added either at
            the beginning or end of each period, depending on the timing toggle.
          </li>
          <li>
            <strong>Interest</strong> is calculated on the current balance.
            If a tax rate is entered, the tool adds interest net of tax.
          </li>
          <li>
            <strong>Inflation</strong> optionally converts the final balance into
            today’s purchasing power.
          </li>
        </ul>

        <p className="text-xs text-slate-500">
          This is an estimate. Real accounts can differ due to posting rules,
          fees, day-count conventions, and rounding.
        </p>
      </div>
    </section>
  );
}
