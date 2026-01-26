import * as React from "react";
import { MathBlock } from "./ui.math";

export function HowItWorksSection() {
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <h2 className="text-lg font-black tracking-tight text-slate-900">
        How this calculator works
      </h2>

      <div className="mt-3 grid gap-3 text-sm leading-relaxed text-slate-700">
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-black uppercase tracking-wide text-slate-700">
              The utility
            </div>
            <div className="mt-1 text-sm leading-relaxed text-slate-700">
              See your balance change over time with a chart plus a clean schedule.
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-black uppercase tracking-wide text-slate-700">
              Best for
            </div>
            <ul className="mt-1 ml-5 list-disc space-y-1 text-sm leading-relaxed text-slate-700">
              <li>Comparing monthly vs yearly contributions</li>
              <li>Seeing how compounding and timing change the path</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-black uppercase tracking-wide text-slate-700">
              What you get
            </div>
            <ul className="mt-1 ml-5 list-disc space-y-1 text-sm leading-relaxed text-slate-700">
              <li>Monthly or yearly timeline</li>
              <li>CSV export and print-to-PDF</li>
              <li>Saved results history (on this device)</li>
            </ul>
          </div>
        </div>

        <p>
          This tool simulates your savings balance month by month and then shows
          the results as either a monthly or yearly schedule. It is not a single
          formula applied once. It is a timeline where each period builds on the
          previous one: deposits are applied, interest is earned on the current
          balance, optional tax can be applied to that interest, and the ending
          balance becomes the starting point for the next period.
        </p>

        <p>
          The purpose is practical: you can see how contribution timing and
          compounding interact. A one-time change, like switching contributions
          from the beginning of the period to the end, can noticeably change the
          path even if your annual totals are the same. The schedule makes those
          differences visible.
        </p>

        <h3 className="mt-2 text-base font-black text-slate-900">
          The math
        </h3>
        <p>
          The simulation uses an effective monthly interest rate derived from
          your nominal annual rate (APR) and selected compounding frequency. Let
          <code className="px-1">B</code> be the starting balance for a month,
          <code className="px-1">C</code> be the contribution applied that
          month,
          <code className="px-1">t</code> be the tax rate on interest (0 to 1),
          and <code className="px-1">r_m</code> be the effective monthly rate.
        </p>

                <div className="grid gap-3">
          <MathBlock
            latex={String.raw`r_m = \left(1 + \frac{\text{APR}}{n}\right)^{\frac{n}{12}} - 1`}
            mathml={
              <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
                <mrow>
                  <msub><mi>r</mi><mi>m</mi></msub>
                  <mo>=</mo>
                  <msup>
                    <mrow>
                      <mo>(</mo>
                      <mn>1</mn>
                      <mo>+</mo>
                      <mfrac>
                        <mrow><mi>A</mi><mi>P</mi><mi>R</mi></mrow>
                        <mi>n</mi>
                      </mfrac>
                      <mo>)</mo>
                    </mrow>
                    <mrow>
                      <mfrac><mi>n</mi><mn>12</mn></mfrac>
                    </mrow>
                  </msup>
                  <mo>&#x2212;</mo>
                  <mn>1</mn>
                </mrow>
              </math>
            }
            caption="Effective monthly rate when the nominal annual APR compounds n times per year."
          />

          <MathBlock
            latex={String.raw`r_m = e^{\frac{\text{APR}}{12}} - 1`}
            mathml={
              <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
                <mrow>
                  <msub><mi>r</mi><mi>m</mi></msub>
                  <mo>=</mo>
                  <msup>
                    <mi>e</mi>
                    <mrow>
                      <mfrac>
                        <mrow><mi>A</mi><mi>P</mi><mi>R</mi></mrow>
                        <mn>12</mn>
                      </mfrac>
                    </mrow>
                  </msup>
                  <mo>&#x2212;</mo>
                  <mn>1</mn>
                </mrow>
              </math>
            }
            caption="Effective monthly rate for continuous compounding."
          />

          <MathBlock
            latex={String.raw`\text{interest}_{\text{gross}} = B \cdot r_m\;\;\;\text{interest}_{\text{net}} = \text{interest}_{\text{gross}} \cdot (1 - t)`}
            mathml={
              <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
                <mrow>
                  <msub>
                    <mi>interest</mi>
                    <mi>gross</mi>
                  </msub>
                  <mo>=</mo>
                  <mi>B</mi>
                  <mo>&#x22C5;</mo>
                  <msub><mi>r</mi><mi>m</mi></msub>
                </mrow>
                <mspace width="2em" />
                <mrow>
                  <msub>
                    <mi>interest</mi>
                    <mi>net</mi>
                  </msub>
                  <mo>=</mo>
                  <msub>
                    <mi>interest</mi>
                    <mi>gross</mi>
                  </msub>
                  <mo>&#x22C5;</mo>
                  <mrow>
                    <mo>(</mo>
                    <mn>1</mn>
                    <mo>&#x2212;</mo>
                    <mi>t</mi>
                    <mo>)</mo>
                  </mrow>
                </mrow>
              </math>
            }
            caption="Gross interest is computed from the starting balance. Net interest applies the tax rate t (0 to 1)."
          />

          <MathBlock
            latex={String.raw`\text{Start-of-month contributions:}\;\;B' = B + C\;\;B_{\text{end}} = B' + (B' \cdot r_m)\cdot (1 - t)`}
            mathml={
              <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
                <mrow>
                  <mi>B</mi><mo>&#x2032;</mo>
                  <mo>=</mo>
                  <mi>B</mi>
                  <mo>+</mo>
                  <mi>C</mi>
                </mrow>
                <mspace width="2em" />
                <mrow>
                  <msub><mi>B</mi><mi>end</mi></msub>
                  <mo>=</mo>
                  <mi>B</mi><mo>&#x2032;</mo>
                  <mo>+</mo>
                  <mrow>
                    <mo>(</mo>
                    <mi>B</mi><mo>&#x2032;</mo>
                    <mo>&#x22C5;</mo>
                    <msub><mi>r</mi><mi>m</mi></msub>
                    <mo>)</mo>
                  </mrow>
                  <mo>&#x22C5;</mo>
                  <mrow>
                    <mo>(</mo><mn>1</mn><mo>&#x2212;</mo><mi>t</mi><mo>)</mo>
                  </mrow>
                </mrow>
              </math>
            }
            caption="If contributions happen at the start of the month, the contribution earns interest for that month."
          />

          <MathBlock
            latex={String.raw`\text{End-of-month contributions:}\;\;B' = B + (B \cdot r_m)\cdot (1 - t)\;\;B_{\text{end}} = B' + C`}
            mathml={
              <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
                <mrow>
                  <mi>B</mi><mo>&#x2032;</mo>
                  <mo>=</mo>
                  <mi>B</mi>
                  <mo>+</mo>
                  <mrow>
                    <mo>(</mo>
                    <mi>B</mi>
                    <mo>&#x22C5;</mo>
                    <msub><mi>r</mi><mi>m</mi></msub>
                    <mo>)</mo>
                  </mrow>
                  <mo>&#x22C5;</mo>
                  <mrow>
                    <mo>(</mo><mn>1</mn><mo>&#x2212;</mo><mi>t</mi><mo>)</mo>
                  </mrow>
                </mrow>
                <mspace width="2em" />
                <mrow>
                  <msub><mi>B</mi><mi>end</mi></msub>
                  <mo>=</mo>
                  <mi>B</mi><mo>&#x2032;</mo>
                  <mo>+</mo>
                  <mi>C</mi>
                </mrow>
              </math>
            }
            caption="If contributions happen at the end of the month, interest is computed first, then the contribution is added."
          />
        </div>

        <p>
          If inflation adjustment is enabled, the calculator also reports a
          “real” ending balance. This converts the nominal ending balance into
          today’s dollars using the provided annual inflation rate.
        </p>

                <MathBlock
          latex={String.raw`\text{Real End Balance} = \frac{\text{Nominal End Balance}}{(1 + i)^{Y}}`}
          mathml={
            <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
              <mrow>
                <mi>Real</mi><mspace width="0.2em"/><mi>End</mi><mspace width="0.2em"/><mi>Balance</mi>
                <mo>=</mo>
                <mfrac>
                  <mrow>
                    <mi>Nominal</mi><mspace width="0.2em"/><mi>End</mi><mspace width="0.2em"/><mi>Balance</mi>
                  </mrow>
                  <msup>
                    <mrow>
                      <mo>(</mo><mn>1</mn><mo>+</mo><mi>i</mi><mo>)</mo>
                    </mrow>
                    <mi>Y</mi>
                  </msup>
                </mfrac>
              </mrow>
            </math>
          }
          caption="Inflation adjustment converts the nominal end balance into today’s dollars using annual inflation rate i over Y years."
        />

        <h3 className="mt-2 text-base font-black text-slate-900">
          Practical step-by-step example
        </h3>
        <p>
          Example: Starting balance <code className="px-1">B_0 = $1,000</code>.
          You contribute <code className="px-1">$100</code> per month at the
          beginning of the month. APR is 6% compounded monthly. Taxes and
          inflation are off. With monthly compounding,{" "}
          <code className="px-1">n = 12</code>
          so <code className="px-1">r_m = (1 + 0.06/12)^1 - 1 = 0.005</code>,
          which is 0.5% per month.
        </p>

        <ol className="ml-5 list-decimal space-y-2">
          <li>
            Month 1 start deposit:{" "}
            <code className="px-1">B = 1000 + 100 = 1100</code>.
          </li>
          <li>
            Month 1 interest: <code className="px-1">1100 × 0.005 = 5.50</code>.
            End of Month 1:
            <code className="px-1">1100 + 5.50 = 1105.50</code>.
          </li>
          <li>
            Month 2 start deposit:{" "}
            <code className="px-1">1105.50 + 100 = 1205.50</code>.
          </li>
          <li>
            Month 2 interest:{" "}
            <code className="px-1">1205.50 × 0.005 = 6.0275</code>. End of Month
            2:
            <code className="px-1">1211.5275</code>.
          </li>
        </ol>

        <p>
          The calculator repeats this process for every month, applying the same
          contribution logic and interest math. Over many periods, small
          differences compound, which is why contribution timing and compounding
          frequency matter.
        </p>

        <h3 className="mt-2 text-base font-black text-slate-900">
          Definitions
        </h3>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong>Compounding frequency</strong>: how often interest is
            “posted” per year in the nominal rate model (monthly, daily, etc.).
            The calculator converts that into an effective monthly rate so the
            monthly simulation stays consistent regardless of frequency.
          </li>
          <li>
            <strong>Contribution timing</strong>: whether deposits are applied
            before interest (beginning of period) or after interest (end of
            period). Beginning-of-period deposits earn interest immediately in
            that period; end-of-period deposits start earning interest next
            period.
          </li>
          <li>
            <strong>Tax on interest</strong>: a simplified model that taxes each
            period’s earned interest immediately. It approximates the drag of
            taxable interest on growth (real tax rules vary by jurisdiction and
            account type).
          </li>
          <li>
            <strong>Inflation adjustment</strong>: a conversion of the final
            nominal balance into “today’s dollars” using an annual inflation
            rate. This does not change the simulated nominal path, only the
            reported real ending value.
          </li>
          <li>
            <strong>Monthly vs yearly view</strong>: the monthly view shows
            every month’s deposit/interest/balance; the yearly view aggregates
            the 12 months into a single row per year for a faster scan.
          </li>
        </ul>

        <h3 className="mt-2 text-base font-black text-slate-900">
          Assumptions
        </h3>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            The simulation runs in monthly steps (12 periods per year) even when
            you choose a non-monthly compounding frequency. The selected
            frequency is converted into an equivalent effective monthly rate.
          </li>
          <li>
            “Daily” compounding uses 365 periods per year for the nominal model.
          </li>
          <li>
            Interest is earned on the current balance only, with no minimum
            balance rules, fees, posting cutoffs, or promotional tiers.
          </li>
          <li>
            Contribution growth (if set) increases the contribution amount once
            per year. If you are in monthly contribution mode, the monthly
            contribution is increased annually by your growth percentage.
          </li>
          <li>
            Negative contributions represent withdrawals. The balance can go
            down, and interest is earned on the resulting balance the same way.
          </li>
        </ul>

        <h3 className="mt-2 text-base font-black text-slate-900">
          How to use this page efficiently
        </h3>
        <p>
          Start with your current balance, pick monthly or yearly contributions,
          and set years and APR. Then open Advanced Options only if you need
          timing, taxes, inflation, or contribution growth. Use the schedule to
          spot when the balance crosses a target, and export to CSV when you
          want to compare scenarios in a spreadsheet. If you are testing
          multiple scenarios, use the Saved Results section to store snapshots
          on this device so you can come back without losing comparisons.
        </p>

        <p className="text-xs text-slate-500">
          This is an estimate. Real accounts can differ due to posting rules,
          fees, calendar conventions, and rounding.
        </p>
      </div>
    </section>
  );
}
