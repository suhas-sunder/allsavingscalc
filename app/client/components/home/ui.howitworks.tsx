import * as React from "react";
import { MathBlock } from "./ui.math";

export function HowItWorksSection() {
  const latex =
    "FV = P(1 + r/n)^{nt} + PMT \\cdot \\frac{(1 + r/n)^{nt} - 1}{r/n}";

  return (
    <section className="mt-10 space-y-6">
      <h2 className="text-xl font-semibold">How the savings grows</h2>
      <p>
        This calculator models compound growth with recurring contributions and
        optional contribution growth, taxes, and inflation adjustments.
      </p>

      <h3 className="text-lg font-medium">Core formula</h3>

      <MathBlock
        latex={latex}
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
        caption="Where P is the initial deposit, PMT is the contribution per period, r is the annual rate, n is periods per year, and t is years."
      />

      <p>
        Real savings plans rarely stay perfectly fixed. This tool extends the
        core model with contribution growth, optional taxes on interest, and an
        inflation-adjusted view, then computes the schedule period by period so
        timing is explicit.
      </p>
    </section>
  );
}
