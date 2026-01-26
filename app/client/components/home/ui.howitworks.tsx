import * as React from "react";
import { MathBlock } from "./ui.math";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      math: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          xmlns?: string;
          display?: string;
        },
        HTMLElement
      >;
      mrow: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      mi: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      mo: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      mn: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      msup: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      mfrac: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      msub: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      mtext: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

export {};

export function HowItWorksSection() {
  const latexBase = "A = P(1 + r/n)^{nt}";
  const latexPmt =
    "FV = P(1 + r/n)^{nt} + PMT \\cdot \\frac{(1 + r/n)^{nt} - 1}{r/n}";
  const latexGrowing =
    "FV_{contrib} = C \\cdot \\frac{(1 + r)^t - (1 + g)^t}{r - g}";
  const latexInflation = "Real\\ Value = Nominal\\ Value / (1 + i)^t";

  return (
    <section
      id="how-it-works"
      className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5"
    >
      <h2 className="text-lg font-black tracking-tight text-slate-900">
        How this savings calculator works
      </h2>

      <p className="mt-3 text-normal leading-relaxed text-slate-700">
        This calculator estimates your future savings balance by simulating the
        account period by period. That lets it apply your contribution timing,
        compounding frequency, taxes on interest, and optional inflation
        adjustment in a consistent way.
      </p>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-normal font-bold text-slate-900">What you control</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-normal leading-relaxed text-slate-700">
          <li>Initial deposit.</li>
          <li>
            Contribution mode: annual or monthly (one mode at a time), plus an
            optional contribution growth rate.
          </li>
          <li>Interest rate and compounding frequency.</li>
          <li>Years to run.</li>
          <li>Optional tax rate on interest and optional inflation rate.</li>
          <li>Contribution timing: beginning vs end of each period.</li>
        </ul>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            1) The baseline compound interest
          </h3>
          <p className="text-normal leading-relaxed text-slate-700">
            If you make no additional contributions, the classic compound
            interest model is:
          </p>

          <MathBlock
            latex={latexBase}
            mathml={
              <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
                <mrow>
                  <mi>A</mi>
                  <mo>=</mo>
                  <mi>P</mi>
                  <msup>
                    <mrow>
                      <mo>(</mo>
                      <mn>1</mn>
                      <mo>+</mo>
                      <mfrac>
                        <mi>r</mi>
                        <mi>n</mi>
                      </mfrac>
                      <mo>)</mo>
                    </mrow>
                    <mrow>
                      <mi>n</mi>
                      <mi>t</mi>
                    </mrow>
                  </msup>
                </mrow>
              </math>
            }
            caption="P is your initial deposit, r is the annual interest rate (as a decimal), n is the number of compounding periods per year, and t is the number of years."
          />

          <p className="text-normal leading-relaxed text-slate-700">
            This calculator also supports recurring contributions. If the
            contribution amount is constant and happens once per compounding
            period, an annuity-style form is often shown as:
          </p>

          <MathBlock
            latex={latexPmt}
            mathml={
              <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
                <mrow>
                  <mi>F</mi>
                  <mi>V</mi>
                  <mo>=</mo>
                  <mi>P</mi>
                  <msup>
                    <mrow>
                      <mo>(</mo>
                      <mn>1</mn>
                      <mo>+</mo>
                      <mfrac>
                        <mi>r</mi>
                        <mi>n</mi>
                      </mfrac>
                      <mo>)</mo>
                    </mrow>
                    <mrow>
                      <mi>n</mi>
                      <mi>t</mi>
                    </mrow>
                  </msup>
                  <mo>+</mo>
                  <mi>P</mi>
                  <mi>M</mi>
                  <mi>T</mi>
                  <mo>&#x22C5;</mo>
                  <mfrac>
                    <mrow>
                      <msup>
                        <mrow>
                          <mo>(</mo>
                          <mn>1</mn>
                          <mo>+</mo>
                          <mfrac>
                            <mi>r</mi>
                            <mi>n</mi>
                          </mfrac>
                          <mo>)</mo>
                        </mrow>
                        <mrow>
                          <mi>n</mi>
                          <mi>t</mi>
                        </mrow>
                      </msup>
                      <mo>&#x2212;</mo>
                      <mn>1</mn>
                    </mrow>
                    <mfrac>
                      <mi>r</mi>
                      <mi>n</mi>
                    </mfrac>
                  </mfrac>
                </mrow>
              </math>
            }
            caption="PMT is the contribution per period. This is a helpful reference, but the calculator computes month by month so contribution timing and taxes are applied consistently."
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            2) Contribution growth, taxes, and inflation
          </h3>

          <p className="text-normal leading-relaxed text-slate-700">
            In real savings plans, contributions often change over time. If a
            yearly contribution starts at{" "}
            <span className="font-bold">C</span> and grows at a constant
            rate <span className="font-bold">g</span> per year, a common
            reference formula for the future value of those growing
            contributions is:
          </p>

          <MathBlock
            latex={latexGrowing}
            mathml={
              <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
                <mrow>
                  <msub>
                    <mi>FV</mi>
                    <mi>contrib</mi>
                  </msub>
                  <mo>=</mo>
                  <mi>C</mi>
                  <mo>&#x22C5;</mo>
                  <mfrac>
                    <mrow>
                      <msup>
                        <mrow>
                          <mo>(</mo>
                          <mn>1</mn>
                          <mo>+</mo>
                          <mi>r</mi>
                          <mo>)</mo>
                        </mrow>
                        <mi>t</mi>
                      </msup>
                      <mo>&#x2212;</mo>
                      <msup>
                        <mrow>
                          <mo>(</mo>
                          <mn>1</mn>
                          <mo>+</mo>
                          <mi>g</mi>
                          <mo>)</mo>
                        </mrow>
                        <mi>t</mi>
                      </msup>
                    </mrow>
                    <mrow>
                      <mi>r</mi>
                      <mo>&#x2212;</mo>
                      <mi>g</mi>
                    </mrow>
                  </mfrac>
                </mrow>
              </math>
            }
            caption="C is the first contribution amount, g is the contribution growth rate, r is the return rate, and t is years. If r equals g, the growing-annuity form changes; the calculator avoids this edge case by computing period by period."
          />

          <p className="text-normal leading-relaxed text-slate-700">
            Taxes and inflation are modeled in the most transparent way:
          </p>

          <ul className="list-disc space-y-2 pl-5 text-normal leading-relaxed text-slate-700">
            <li>
              <span className="font-bold">Tax on interest</span> is applied
              to the interest earned in each period, not to your principal or
              contributions. If interest earned for a period is{" "}
              <span className="font-bold">I</span> and your tax rate is{" "}
              <span className="font-bold">τ</span>, the net interest added
              is
              <span className="font-bold"> I × (1 − τ)</span>.
            </li>
            <li>
              <span className="font-bold">Inflation adjustment</span>{" "}
              converts the final nominal balance into today’s dollars
              (purchasing power) using the inflation rate{" "}
              <span className="font-bold">i</span>.
            </li>
          </ul>

          <MathBlock
            latex={latexInflation}
            mathml={
              <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
                <mrow>
                  <mtext>Real value</mtext>
                  <mo>=</mo>
                  <mfrac>
                    <mrow>
                      <mtext>Nominal value</mtext>
                    </mrow>
                    <msup>
                      <mrow>
                        <mo>(</mo>
                        <mn>1</mn>
                        <mo>+</mo>
                        <mi>i</mi>
                        <mo>)</mo>
                      </mrow>
                      <mi>t</mi>
                    </msup>
                  </mfrac>
                </mrow>
              </math>
            }
            caption="If inflation is 0%, real value equals nominal value. The calculator shows both so you can compare account value vs purchasing power."
          />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <h3 className="text-lg font-medium">Practical step-by-step example</h3>
        <p className="text-normal leading-relaxed text-slate-700">
          Example scenario:
        </p>
        <ul className="list-disc space-y-1 pl-5 text-normal text-slate-700">
          <li>Initial deposit: $20,000</li>
          <li>Annual contribution: $5,000 (end of each year)</li>
          <li>Contribution growth: 3% per year</li>
          <li>Interest rate: 5% compounded monthly</li>
          <li>Taxes: 0% (to keep the math short)</li>
          <li>Time: 3 years (short horizon so you can follow it manually)</li>
        </ul>

        <p className="text-normal leading-relaxed text-slate-700">
          First compute the monthly rate implied by the APR and compounding
          frequency. With 5% APR compounded monthly, the monthly rate is about
          0.05 / 12 ≈ 0.0041667. Month by month, the balance grows by roughly
          0.4167% and then your contribution is added at year end.
        </p>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <ol className="list-decimal space-y-2 pl-5 text-normal leading-relaxed text-slate-700">
            <li>
              Start with $20,000. After 12 months of monthly compounding, the
              approximate balance is $20,000 × (1 + 0.05/12)^{12} ≈ $21,023.
            </li>
            <li>
              Add the year 1 contribution of $5,000 at the end of the year. End
              of year 1 ≈ $26,023.
            </li>
            <li>
              Grow the contribution by 3%. Year 2 contribution becomes $5,000 ×
              1.03 = $5,150.
            </li>
            <li>
              Apply monthly compounding again for year 2: $26,023 × (1 +
              0.05/12)^{12} ≈ $27,368, then add $5,150. End of year 2 ≈ $32,518.
            </li>
            <li>
              Year 3 contribution grows again: $5,150 × 1.03 ≈ $5,304.50.
              Compound for the year: $32,518 × (1 + 0.05/12)^{12} ≈ $34,180,
              then add $5,304.50. End of year 3 ≈ $39,484.50.
            </li>
          </ol>
        </div>

        <p className="text-normal leading-relaxed text-slate-700">
          The calculator performs this same process at the selected cadence
          (monthly schedule or yearly summary). If you enable tax, it reduces
          the interest credited each period. If you enable inflation, it reports
          an additional inflation-adjusted end balance.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <h3 className="text-lg font-medium">Definitions used on this page</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-normal font-bold text-slate-900">
              Compounding frequency
            </p>
            <p className="mt-1 text-normal leading-relaxed text-slate-700">
              How often interest is credited. More frequent compounding credits
              interest more often, which can slightly increase the end balance
              at the same APR. Select the frequency that matches your account
              terms.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-normal font-bold text-slate-900">
              Contribution growth
            </p>
            <p className="mt-1 text-normal leading-relaxed text-slate-700">
              The percent change applied to your contribution amount over time.
              This is not your investment return. It models saving more (or
              less) each year or month.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-normal font-bold text-slate-900">
              Tax on interest
            </p>
            <p className="mt-1 text-normal leading-relaxed text-slate-700">
              A percentage applied to interest earned each period. If your tax
              rate is 30%, you keep 70% of the period’s interest and the rest is
              treated as paid tax.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-normal font-bold text-slate-900">
              Inflation adjustment
            </p>
            <p className="mt-1 text-normal leading-relaxed text-slate-700">
              Converts the end balance into today’s dollars so you can compare
              purchasing power. A higher nominal balance can still have lower
              purchasing power if inflation is high.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <h3 className="text-lg font-medium">Assumptions</h3>
        <ul className="list-disc space-y-1 pl-5 text-normal leading-relaxed text-slate-700">
          <li>12 months per year in the schedule.</li>
          <li>
            APR is converted into an effective monthly rate based on the
            selected compounding frequency.
          </li>
          <li>
            Taxes apply only to interest earned, not to deposits or withdrawals.
          </li>
          <li>
            Inflation adjustment is applied to the final balance using (1 +
            inflation)<sup>t</sup>, where t is the number of years.
          </li>
          <li>
            Annual contributions happen once per year; monthly contributions
            happen once per month.
          </li>
          <li>
            Contribution timing can be set to the beginning or end of each
            period.
          </li>
        </ul>

        <p className="text-normal leading-relaxed text-slate-700">
          Tip: Save multiple scenarios using the History section. Your saved
          runs stay in your browser (local storage) so you can compare
          strategies without creating an account.
        </p>
      </div>
    </section>
  );
}
