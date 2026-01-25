export function HowItWorksSection() {
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <h2 className="text-lg font-black tracking-tight text-slate-900">
        How it works
      </h2>

      <div className="mt-3 grid gap-3 text-sm leading-relaxed text-slate-700">
        <p>
          This calculator models <strong>pure compound growth</strong> from a starting principal.
          There are no deposits, withdrawals, taxes, or inflation adjustments. You enter:
          principal, APR, compounding frequency, and years.
        </p>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-black uppercase tracking-wide text-slate-700">
            Core idea
          </div>
          <p className="mt-2">
            The end balance depends on the compounding frequency. APY (effective annual rate)
            is the annualized result after compounding:
          </p>
          <ul className="mt-2 list-disc pl-5">
            <li>
              Discrete compounding: <strong>APY = (1 + APR / n)^n − 1</strong>
            </li>
            <li>
              Continuous compounding: <strong>APY = e^APR − 1</strong>
            </li>
          </ul>
        </div>

        <p>
          For the monthly schedule, we convert your chosen compounding frequency into an
          <strong> equivalent monthly rate</strong> so the monthly rows and the yearly totals stay aligned.
          Yearly rows are just the sum of the 12 monthly steps.
        </p>

        <p className="text-slate-600">
          If you need to include deposits or withdrawals over time, switch to the Savings Calculator.
        </p>
      </div>
    </section>
  );
}
