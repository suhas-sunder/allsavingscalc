export function HowItWorksSection() {
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <h2 className="text-lg font-black tracking-tight text-slate-900">
        How it works
      </h2>

      <div className="mt-3 grid gap-3 text-sm leading-relaxed text-slate-700">
        <p>
          This calculator models <strong>compound growth</strong> from an initial investment, with an
          optional regular addition each month. It does not model withdrawals, taxes, or inflation.
          You enter: initial investment, regular addition, APR, compounding frequency, and a time horizon
          measured in years or months.
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
          For the schedule, we convert your chosen compounding frequency into an
          <strong> equivalent monthly rate</strong>. Each month we apply your regular addition, then apply
          interest for that month using the equivalent monthly rate. Yearly rows are aggregates of the
          monthly steps.
        </p>

        <p className="text-slate-600">
          If you need taxes, inflation, irregular deposits/withdrawals, or varying contribution growth,
          use the Savings Calculator.
        </p>
      </div>
    </section>
  );
}
