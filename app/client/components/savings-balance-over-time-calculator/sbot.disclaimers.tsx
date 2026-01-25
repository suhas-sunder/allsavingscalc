import * as React from "react";

export function DisclaimersSection() {
  return (
    <section className="mt-8">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-700">
          Disclaimers
        </div>
        <div className="text-xs leading-relaxed text-slate-600">
          <p>
            Results are estimates. Real outcomes can differ due to rounding,
            posting schedules, fees, minimums, and institution-specific rules.
          </p>
          <p className="mt-2">
            This tool does not provide financial, tax, or legal advice. Confirm
            details with your institution or a qualified professional.
          </p>
        </div>
      </div>
    </section>
  );
}
