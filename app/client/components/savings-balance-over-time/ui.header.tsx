import * as React from "react";

export function HeaderSection() {
  return (
    <div className="flex flex-col gap-3">
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

      <div className="grid gap-2">
        <h1 className="text-xl font-black leading-[1.08] tracking-tight text-blue-950 sm:text-2xl">
          Savings Balance Over Time Calculator
        </h1>

        <p className="w-full max-w-none text-[12px] leading-snug text-slate-700 sm:text-base sm:leading-snug">
          Savings balance over time based on starting balance, contributions,
          frequency, and interest.
        </p>
      </div>
    </div>
  );
}
