import * as React from "react";

export function DisclaimersSection() {
  return (
    <footer className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-800">
      <div className="font-black text-sky-700">Disclaimer</div>
      <p className="mt-2">
        This calculator provides estimates for informational purposes only and
        does not constitute financial, tax, or investment advice. Results depend
        on the assumptions you provide.
      </p>
    </footer>
  );
}
