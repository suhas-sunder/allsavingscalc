function MathBlock({ children }: { children: any }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800">
      <code className="font-mono">{children}</code>
    </div>
  );
}

function Fraction({ top, bottom }: { top: any; bottom: any }) {
  return (
    <span className="mx-0.5 inline-flex flex-col items-center align-middle leading-none">
      <span className="border-b border-slate-400 px-0.5">{top}</span>
      <span className="px-0.5">{bottom}</span>
    </span>
  );
}

export function HowItWorksSection() {
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <h2 className="text-lg font-black tracking-tight text-slate-900">
        How it works
      </h2>

      <div className="mt-3 grid gap-4 text-normal leading-relaxed text-slate-700">
        <p>
          This page models <strong>compound interest</strong> for a single
          account or investment. You can include a recurring monthly
          contribution, then view the final balance, how much came from your
          deposits, and how much came from interest. It is intended for clean
          "what if" comparisons (different rates, contribution sizes, or
          compounding frequencies).
        </p>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-black uppercase tracking-wide text-slate-700">
            What you enter
          </div>
          <ul className="mt-2 grid gap-2">
            <li>
              <strong>Initial investment</strong>: your starting principal at
              time 0.
            </li>
            <li>
              <strong>Regular addition</strong>: a fixed contribution added each
              month. This calculator treats additions as deposits only.
              Withdrawals are intentionally out of scope.
            </li>
            <li>
              <strong>APR</strong>: the stated annual percentage rate (nominal).
              This is not the same as APY when compounding happens more than
              once per year.
            </li>
            <li>
              <strong>Compounding frequency</strong>: how often interest is
              compounded (monthly, daily, continuously, and so on).
            </li>
            <li>
              <strong>Time horizon</strong>: the number of years or months you
              want to project.
            </li>
          </ul>
        </div>

        <div className="grid gap-3">
          <h3 className="text-base font-black tracking-tight text-slate-900">
            The formulas
          </h3>
          <p>
            Let <strong>P</strong> be your starting principal,{" "}
            <strong>r</strong> be the APR as a decimal (so 5% becomes 0.05), and{" "}
            <strong>n</strong> be the number of compounding periods per year.
          </p>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-xs font-black uppercase tracking-wide text-slate-700">
              APY (effective annual rate)
            </div>
            <div className="mt-2 grid gap-2">
              <p>Discrete compounding (most banks and brokers):</p>
              <MathBlock>
                <span>
                  APY = (1 + <Fraction top="r" bottom="n" />)
                  <sup className="text-[0.65em] align-super">n</sup> − 1
                </span>
              </MathBlock>

              <p>Continuous compounding (a mathematical model):</p>
              <MathBlock>
                <span>
                  APY = e<sup className="text-[0.65em] align-super">r</sup> − 1
                </span>
              </MathBlock>

              <p className="text-slate-600">
                The calculator shows APY as a percentage so you can compare
                different compounding frequencies on an equal annual basis.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-xs font-black uppercase tracking-wide text-slate-700">
              Growth with no additions
            </div>
            <div className="mt-2 grid gap-2">
              <p>
                If there are no monthly additions, the classic compound interest
                formula after <strong>t</strong> years is:
              </p>
              <MathBlock>
                <span>
                  A = P(1 + <Fraction top="r" bottom="n" />)
                  <sup className="text-[0.65em] align-super">n·t</sup>
                </span>
              </MathBlock>
              <p className="text-slate-600">
                When additions are included, there is no single clean closed
                form that matches every real posting schedule. This tool uses a
                month-by-month simulation so the schedule, charts, and totals
                are internally consistent.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          <h3 className="text-base font-black tracking-tight text-slate-900">
            How the schedule is built
          </h3>
          <p>
            The monthly table is the "source of truth". For each month, the
            calculator:
          </p>
          <ol className="list-decimal pl-5">
            <li>Adds your regular addition for that month (if any).</li>
            <li>
              Applies interest using an <strong>equivalent monthly rate</strong>{" "}
              derived from your APR and compounding frequency.
            </li>
            <li>
              Stores the starting balance, addition, interest earned, and ending
              balance for that month.
            </li>
          </ol>
          <p>
            For compounding frequencies like quarterly or daily, we convert the
            nominal APR into an equivalent monthly multiplier so the monthly
            schedule stays smooth and the yearly rollup matches the same math.
          </p>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-black uppercase tracking-wide text-slate-700">
              Equivalent monthly rate
            </div>

            <p className="mt-2 text-normal text-slate-700">
              Discrete compounding uses the interest rate converted to a monthly
              equivalent so results can be applied consistently in a
              month-by-month schedule.
            </p>

            <div className="mt-2 rounded-lg border border-slate-200 bg-white p-2 font-mono text-xs text-slate-800">
              {"r"}
              <sub>{"m"}</sub>
              {" = (1 + r / n)"}
              <sup>{"n / 12"}</sup>
              {" − 1"}
            </div>

            <p className="mt-2 text-normal text-slate-600">
              Here{" "}
              <strong>
                {"r"}
                <sub>{"m"}</sub>
              </strong>{" "}
              represents the monthly rate used internally for each step of the
              calculation. If you select continuous compounding, the calculator
              derives the monthly rate using{" "}
              <span className="font-mono">
                {"r"}
                <sub>{"m"}</sub>
                {" = e"}
                <sup>{"r/12"}</sup>
                {" − 1"}
              </span>
              .
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          <h3 className="text-base font-black tracking-tight text-slate-900">
            Step-by-step example
          </h3>
          <p>
            Suppose you start with <strong>$10,000</strong>, add{" "}
            <strong>$200</strong> every month, choose
            <strong> 6% APR</strong>, and compound monthly for{" "}
            <strong>3 years</strong>.
          </p>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-xs font-black uppercase tracking-wide text-slate-700">
              Month 1
            </div>
            <ul className="mt-2 grid gap-1">
              <li>Starting balance: $10,000.00</li>
              <li>Addition: +$200.00 → $10,200.00</li>
              <li>Monthly rate: r/12 = 0.06/12 = 0.005</li>
              <li>Interest: $10,200.00 × 0.005 = $51.00</li>
              <li>Ending balance: $10,251.00</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-xs font-black uppercase tracking-wide text-slate-700">
              Month 2
            </div>
            <ul className="mt-2 grid gap-1">
              <li>Starting balance: $10,251.00</li>
              <li>Addition: +$200.00 → $10,451.00</li>
              <li>Interest: $10,451.00 × 0.005 = $52.26</li>
              <li>Ending balance: $10,503.26</li>
            </ul>
          </div>
          <p className="text-slate-600">
            The calculator repeats this for 36 months, then totals your deposits
            (initial + additions) and totals the interest. Switch the schedule
            to yearly to see the same data grouped by year.
          </p>
        </div>

        <div className="grid gap-3">
          <h3 className="text-base font-black tracking-tight text-slate-900">
            Definitions used on this page
          </h3>
          <ul className="grid gap-2">
            <li>
              <strong>APR (nominal rate)</strong>: the stated annual rate before
              considering compounding. If APR is 6%, that is r = 0.06 in the
              formulas.
            </li>
            <li>
              <strong>APY (effective annual rate)</strong>: the annualized
              return after compounding. Same APR can produce different APY
              depending on compounding frequency.
            </li>
            <li>
              <strong>Compounding frequency</strong>: how often interest is
              added to the balance. More frequent compounding increases APY
              (slightly) when APR is positive.
            </li>
            <li>
              <strong>Regular addition</strong>: a fixed monthly deposit used
              for the simulation. If you contribute weekly or biweekly in real
              life, you can approximate by converting to an equivalent monthly
              deposit.
            </li>
          </ul>
        </div>

        <div className="grid gap-3">
          <h3 className="text-base font-black tracking-tight text-slate-900">
            Assumptions and limitations
          </h3>
          <ul className="list-disc pl-5">
            <li>
              Regular additions are applied <strong>once per month</strong>. You can optionally delay when additions start, and you can choose whether each monthly addition is applied before interest (start of period) or after interest (end of period).
            </li>
            <li>
              If you enable contribution growth, the monthly addition amount increases once per year (based on elapsed time from the start of the projection). The schedule, charts, totals, and exports all use the same rule.
            </li>
            <li>
              Daily compounding assumes <strong>365 days per year</strong>.
            </li>
            <li>
              Rates are assumed constant for the entire time horizon. The tool
              does not model variable rates.
            </li>
            <li>
              The calculator does not include taxes, fees, inflation, minimum
              balance rules, or real institution posting quirks.
            </li>
            <li>
              Negative APR is allowed to model declining balances, but it is
              still a mathematical projection.
            </li>
          </ul>
          <p className="text-slate-600">
            If you need withdrawals, irregular deposits, tax treatment, or
            inflation adjustment, you need a different model. This page stays
            focused on clean compound-growth math so comparisons are easy.
          </p>
        </div>
      </div>
    </section>
  );
}
