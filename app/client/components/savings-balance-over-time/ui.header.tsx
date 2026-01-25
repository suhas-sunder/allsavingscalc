import * as React from "react";

export function HeaderSection() {
  return (
    <div className="flex flex-col gap-2">
      <div className="noPrint hidden sm:block">
        <nav
          aria-label="Breadcrumb"
          className="text-xs font-black text-slate-600"
        >
          <a href="/" className="text-slate-600 hover:text-slate-900">
            Home
          </a>{" "}
          <span className="text-slate-400">/</span>{" "}
          <span className="text-slate-900">Balance Over Time</span>
        </nav>
      </div>

      <h1 className="text-xl font-black leading-[1.08] tracking-tight text-blue-950 sm:text-2xl">
        Savings Balance Over Time Calculator
      </h1>

      <p className="max-w-3xl text-[11px] leading-tight text-slate-600 sm:text-base sm:leading-snug">
        Visualize balance growth by period with charts, schedules, CSV export,
        and print-to-PDF.
      </p>
    </div>
  );
}
