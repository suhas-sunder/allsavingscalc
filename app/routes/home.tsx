// app/routes/_index.tsx
import * as React from "react";
import type { Route } from "./+types/home";

// ---------- META ----------
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Savings Calculator | AllSavingsCalculators" },
    {
      name: "description",
      content:
        "Free savings calculator that models compound interest with annual and monthly contributions, growth rates, taxes, and inflation. Get end balance, total interest, and an annual schedule with clear charts.",
    },
    {
      name: "keywords",
      content:
        "savings calculator, compound interest, contribution growth, tax on interest, inflation adjusted returns, financial planning tools",
    },
    { name: "robots", content: "index,follow" },
    { name: "theme-color", content: "#0b2447" },
  ];
}

export function loader({}: Route.LoaderArgs) {
  return { ok: true };
}

// ---------- STYLES ----------
const styles: Record<string, React.CSSProperties> = {
  page: {
    background: "#f7f8fb",
    color: "#111317",
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
    margin: 0,
  },
  wrap: { maxWidth: 1160, margin: "0 auto", padding: 24 },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 0",
  },
  brand: { display: "flex", alignItems: "center", gap: 12 },
  logo: {
    width: 44,
    height: 44,
    border: "2px solid #0b2447",
    borderRadius: 10,
    background: "#fff",
    position: "relative",
  },
  siteTitle: { fontWeight: 800, letterSpacing: 0.3, fontSize: "1.15rem" },
  tagline: { color: "#5a616c", fontSize: ".95rem" },
  h1: {
    fontSize: "clamp(1.8rem, 2.6vw + 1rem, 3rem)",
    lineHeight: 1.15,
    margin: 0,
  },
  lead: { marginTop: 8, color: "#5a616c", fontSize: "1.06rem" },
  card: {
    background: "#fff",
    border: "1px solid #e6e8ef",
    borderRadius: 16,
    boxShadow: "0 1px 0 rgba(11,36,71,0.14)",
  },
  cardPad: { padding: 16 },
  section: { padding: "8px 0 24px" },
  sectionTitle: { fontSize: "1.35rem", margin: "0 0 12px" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  grid3: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 12,
  },
  label: { fontSize: ".9rem", color: "#5a616c", fontWeight: 600 },
  input: {
    width: "100%",
    minHeight: 40,
    padding: "10px 12px",
    border: "1px solid #e6e8ef",
    borderRadius: 10,
    background: "#fff",
    color: "#111317",
    font: "600 0.98rem/1 ui-sans-serif, system-ui",
  },
  select: {
    width: "100%",
    minHeight: 40,
    padding: "10px 12px",
    border: "1px solid #e6e8ef",
    borderRadius: 10,
    background: "#fff",
    color: "#111317",
    font: "600 0.98rem/1 ui-sans-serif, system-ui",
  },
  btnPrimary: {
    border: "1px solid #0b2447",
    background: "#0b2447",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 800,
    cursor: "pointer",
  },
  btnGhost: {
    border: "1px solid #e6e8ef",
    background: "#fff",
    color: "#111317",
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 800,
    cursor: "pointer",
  },
  footer: {
    color: "#5a616c",
    fontSize: ".9rem",
    textAlign: "center",
    padding: "28px 0",
  },
};

function LogoBars() {
  return (
    <>
      <span
        style={{
          position: "absolute",
          left: 8,
          right: 8,
          top: 12,
          height: 3,
          background: "#0b2447",
          borderRadius: 2,
        }}
      />
      <span
        style={{
          position: "absolute",
          left: 8,
          width: "60%",
          bottom: 12,
          height: 3,
          background: "#0b2447",
          borderRadius: 2,
        }}
      />
    </>
  );
}

// ---------- CALC TYPES ----------
type Frequency = "annually" | "quarterly" | "monthly" | "daily";
type ScheduleRow = {
  year: number;
  deposit: number;
  interest: number;
  endingBalance: number;
};

type CalcInputs = {
  initialDeposit: number;
  annualContribution: number;
  annualContributionGrowthPct: number; // percent per year
  monthlyContribution: number;
  monthlyContributionGrowthPct: number; // percent per year
  annualInterestRatePct: number;
  frequency: Frequency;
  years: number;
  taxRatePct: number; // on interest
  inflationRatePct: number; // optional, can be zero
  contributionsAtPeriodEnd: boolean;
};

type CalcOutputs = {
  endBalance: number;
  totalContributions: number;
  totalInterest: number;
  schedule: ScheduleRow[];
  realEndBalance: number; // inflation adjusted
};

// ---------- UTIL ----------
const clampNumber = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

function toCurrency(n: number): string {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

function freqToN(f: Frequency): number {
  switch (f) {
    case "annually":
      return 1;
    case "quarterly":
      return 4;
    case "monthly":
      return 12;
    case "daily":
      return 365;
    default:
      return 1;
  }
}

// Future value of a growing annuity with growth once per year for the annual stream.
// This returns the value at end of year t for an annual contribution stream.
function fvGrowingAnnuity(
  contribution: number,
  rate: number,
  growth: number,
  years: number
): number {
  if (rate === growth) {
    // limit case
    return contribution * years * Math.pow(1 + rate, years - 1);
  }
  return (
    (contribution * (Math.pow(1 + rate, years) - Math.pow(1 + growth, years))) /
    (rate - growth)
  );
}

// ---------- CORE ENGINE ----------
// We simulate at the finer of monthly or compounding frequency to allow taxes and monthly deposits.
// Tax is applied each sub-period on interest before it is added to principal.
function computeSavings(inputs: CalcInputs): CalcOutputs {
  const nCompound = freqToN(inputs.frequency);
  const stepsPerYear = Math.max(nCompound, 12); // at least monthly resolution for monthly contributions
  const dt = 1 / stepsPerYear;

  const rNominal = inputs.annualInterestRatePct / 100;
  const rStep = rNominal / stepsPerYear;
  const taxRate = inputs.taxRatePct / 100;
  const inflationRate = inputs.inflationRatePct / 100;

  let balance = inputs.initialDeposit;
  let totalContribution = inputs.initialDeposit;
  let totalInterestAccrued = 0;

  const schedule: ScheduleRow[] = [];
  let annualContribution = inputs.annualContribution;
  let monthlyContribution = inputs.monthlyContribution;

  // Special case: match Calculator.net logic exactly for annual compounding
  if (inputs.frequency === "annually") {
    const r = inputs.annualInterestRatePct / 100;

    for (let year = 1; year <= inputs.years; year++) {
      // Interest on starting balance
      const interestThisYear = balance * r;
      let depositsThisYear = 0;

      balance += interestThisYear;
      totalInterestAccrued += interestThisYear;

      // Annual contribution added at end of year
      if (annualContribution > 0) {
        balance += annualContribution;
        depositsThisYear += annualContribution;
      }

      // Optional: lump in monthly contributions (treated as year-end sum)
      if (monthlyContribution > 0) {
        const yearlyMonthly = monthlyContribution * 12;
        balance += yearlyMonthly;
        depositsThisYear += yearlyMonthly;
      }

      totalContribution += depositsThisYear;

      schedule.push({
        year,
        deposit: round2(depositsThisYear),
        interest: round2(interestThisYear),
        endingBalance: round2(balance),
      });

      // Grow contributions for next year
      annualContribution *= 1 + inputs.annualContributionGrowthPct / 100;
      monthlyContribution *= 1 + inputs.monthlyContributionGrowthPct / 100;
    }
  } else {
    // Default logic for monthly / quarterly / daily (your original fine-grained loop)
    for (let year = 1; year <= inputs.years; year++) {
      let interestThisYear = 0;
      let depositsThisYear = 0;

      for (let k = 1; k <= stepsPerYear; k++) {
        const isMonthBoundary = k % Math.round(stepsPerYear / 12) === 0;
        const isYearEnd = k === stepsPerYear;

        // 1) Add periodic contributions
        if (!inputs.contributionsAtPeriodEnd) {
          if (isMonthBoundary && monthlyContribution > 0) {
            balance += monthlyContribution;
            depositsThisYear += monthlyContribution;
          }
          // For the fine-grained simulation (non-annual compounding), add the
          // annual contribution at the first sub-step of the year when using
          // beginning-of-period timing.
          if (k === 1 && annualContribution > 0) {
            balance += annualContribution;
            depositsThisYear += annualContribution;
          }
        }

        // 2) Interest this step
        const interestGross = balance * rStep;
        const taxOnInterest = interestGross * taxRate;
        const interestNet = interestGross - taxOnInterest;
        balance += interestNet;
        interestThisYear += interestNet;
        totalInterestAccrued += interestNet;

        // 3) End-timing contributions
        if (inputs.contributionsAtPeriodEnd) {
          if (isMonthBoundary && monthlyContribution > 0) {
            balance += monthlyContribution;
            depositsThisYear += monthlyContribution;
          }
          if (isYearEnd && annualContribution > 0) {
            balance += annualContribution;
            depositsThisYear += annualContribution;
          }
        }
      }

      totalContribution += depositsThisYear;

      schedule.push({
        year,
        deposit: round2(depositsThisYear),
        interest: round2(interestThisYear),
        endingBalance: round2(balance),
      });

      annualContribution *= 1 + inputs.annualContributionGrowthPct / 100;
      monthlyContribution *= 1 + inputs.monthlyContributionGrowthPct / 100;
    }
  }

  const endBalance = round2(balance);
  const totalContrib = round2(totalContribution - inputs.initialDeposit);
  const totalInt = round2(totalInterestAccrued);

  const realEndBalance =
    inflationRate > 0
      ? round2(endBalance / Math.pow(1 + inflationRate, inputs.years))
      : endBalance;

  return {
    endBalance,
    totalContributions: totalContrib + inputs.initialDeposit, // for reporting breakdown we include initial
    totalInterest: totalInt,
    schedule,
    realEndBalance,
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

// ---------- MINI CHARTS (SVG, no libs) ----------
function DonutChart({
  parts,
  size = 160,
  stroke = 24,
}: {
  parts: { label: string; value: number; color: string }[];
  size?: number;
  stroke?: number;
}) {
  const total = parts.reduce((a, b) => a + b.value, 0) || 1;
  const radius = (size - stroke) / 2;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`translate(${size / 2},${size / 2})`}>
        {parts.map((p, i) => {
          const frac = p.value / total;
          const dash = 2 * Math.PI * radius * frac;
          const gap = 2 * Math.PI * radius - dash;
          const el = (
            <circle
              key={i}
              r={radius}
              fill="none"
              stroke={p.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
            />
          );
          offset += dash;
          return el;
        })}
      </g>
    </svg>
  );
}

function StackedBars({
  items,
  height = 120,
}: {
  items: { label: string; value: number; color: string }[];
  height?: number;
}) {
  const total = items.reduce((a, b) => a + b.value, 0) || 1;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: items
          .map((i) => `${(i.value / total) * 100}%`)
          .join(" "),
        height,
        border: "1px solid #e6e8ef",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {items.map((i, idx) => (
        <div
          key={idx}
          title={`${i.label}: ${toCurrency(i.value)}`}
          style={{ background: i.color }}
        />
      ))}
    </div>
  );
}

// ---------- PAGE ----------
export default function Home() {
  // inputs, initialized to safe server defaults to avoid hydration issues
  const [initialDeposit, setInitialDeposit] = React.useState(20000);
  const [annualContribution, setAnnualContribution] = React.useState(5000);
  const [annualContributionGrowthPct, setAnnualContributionGrowthPct] =
    React.useState(3);
  const [monthlyContribution, setMonthlyContribution] = React.useState(0);
  const [monthlyContributionGrowthPct, setMonthlyContributionGrowthPct] =
    React.useState(0);
  const [annualInterestRatePct, setAnnualInterestRatePct] = React.useState(3);
  const [frequency, setFrequency] = React.useState<Frequency>("annually");
  const [years, setYears] = React.useState(10);
  const [taxRatePct, setTaxRatePct] = React.useState(0);
  const [inflationRatePct, setInflationRatePct] = React.useState(0);
  const [contributionsAtPeriodEnd, setContributionsAtPeriodEnd] =
    React.useState(true);

  // compute on input changes
  const outputs = React.useMemo(() => {
    const safeInputs: CalcInputs = {
      initialDeposit: clampNumber(Number(initialDeposit) || 0, 0, 1e9),
      annualContribution: clampNumber(
        Number(annualContribution) || 0,
        -1e8,
        1e8
      ),
      annualContributionGrowthPct: clampNumber(
        Number(annualContributionGrowthPct) || 0,
        -100,
        100
      ),
      monthlyContribution: clampNumber(
        Number(monthlyContribution) || 0,
        -1e8,
        1e8
      ),
      monthlyContributionGrowthPct: clampNumber(
        Number(monthlyContributionGrowthPct) || 0,
        -100,
        100
      ),
      annualInterestRatePct: clampNumber(
        Number(annualInterestRatePct) || 0,
        -50,
        100
      ),
      frequency,
      years: clampNumber(Number(years) || 0, 0, 100),
      taxRatePct: clampNumber(Number(taxRatePct) || 0, 0, 60),
      inflationRatePct: clampNumber(Number(inflationRatePct) || 0, 0, 50),
      contributionsAtPeriodEnd,
    };
    return computeSavings(safeInputs);
  }, [
    initialDeposit,
    annualContribution,
    annualContributionGrowthPct,
    monthlyContribution,
    monthlyContributionGrowthPct,
    annualInterestRatePct,
    frequency,
    years,
    taxRatePct,
    inflationRatePct,
    contributionsAtPeriodEnd,
  ]);

  const breakdown = React.useMemo(() => {
    const principal = Number(initialDeposit);
    const contribs = outputs.totalContributions - principal;
    const interest = outputs.totalInterest;
    return [
      {
        label: "Initial deposit",
        value: Math.max(principal, 0),
        color: "#cbe7ff",
      },
      {
        label: "Contributions",
        value: Math.max(contribs, 0),
        color: "#b6f3e1",
      },
      { label: "Interest", value: Math.max(interest, 0), color: "#ffd6a6" },
    ];
  }, [outputs, initialDeposit]);

  // percent labels
  const totalForPct = breakdown.reduce((a, b) => a + b.value, 0) || 1;
  const pct = breakdown.map((b) => Math.round((b.value / totalForPct) * 100));

  // JSON-LD
  const baseUrl = "https://www.allsavingscalculators.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}#org`,
        name: "AllSavingsCalculators",
        url: baseUrl,
        logo: { "@type": "ImageObject", url: `${baseUrl}/logo.png` },
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}#website`,
        url: baseUrl,
        name: "AllSavingsCalculators",
        inLanguage: "en",
        publisher: { "@id": `${baseUrl}#org` },
      },
      {
        "@type": "WebPage",
        "@id": `${baseUrl}/#webpage`,
        url: baseUrl + "/",
        name: "Savings Calculator",
        description:
          "Calculate compound savings with monthly and annual contributions, growth rates, taxes, and inflation. Includes annual schedule and charts.",
        isPartOf: { "@id": `${baseUrl}#website` },
      },
      {
        "@type": "FAQPage",
        "@id": `${baseUrl}#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "How is compound interest calculated here?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Interest compounds at the selected frequency. Monthly and annual contributions can grow each year. Interest is taxed at the input rate each step before being added back to principal. Results are estimates only.",
            },
          },
          {
            "@type": "Question",
            name: "Does the calculator account for inflation?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. If an inflation rate is entered, the calculator shows an inflation-adjusted end balance using standard real value deflation.",
            },
          },
          {
            "@type": "Question",
            name: "Are contributions assumed at the beginning or end of periods?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "By default, contributions are at the end of each period. You can switch to beginning-of-period timing to model annuity due style deposits.",
            },
          },
        ],
      },
    ],
  };

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        {/* NAV */}
        <header style={styles.header}>
          <div style={styles.brand}>
            <div style={styles.logo}>
              <LogoBars />
            </div>
            <div>
              <div style={styles.siteTitle}>AllSavingsCalculators</div>
              <div style={styles.tagline}>
                Clear savings math for real decisions.
              </div>
            </div>
          </div>
          <span className="border border-[#e6e8ef] py-2 px-4 text-sm sm:text-base rounded-full bg-white text-[#0b2447] font-extrabold text-center">
            Savings Calculator
          </span>
        </header>

        {/* HERO */}
        <section className="flex flex-col sm:flex-row gap-8 mt-6 mb-8 sm:mb-2">
          <div>
            <h1 style={styles.h1}>
              Savings Calculator with Taxes, Growth, and Inflation
            </h1>
            <p style={styles.lead}>
              Estimate your end balance with compound interest and flexible
              contributions. Model annual and monthly deposits with growth
              rates, tax on interest, multiple compounding options, and an
              annual schedule that shows deposits and interest earned.
            </p>
          </div>
          <div className="card" style={{ ...styles.card, ...styles.cardPad }}>
            <div style={{ fontWeight: 800, color: "#0b2447" }}>Heads up</div>
            <p style={{ color: "#5a616c", margin: 0 }}>
              Results are estimates. Banks may use different rounding rules,
              credit interest on different schedules, or adjust for fees. Always
              verify with your institution.
            </p>
          </div>
        </section>

        {/* CALCULATOR */}
        <section aria-labelledby="calc-title" style={styles.section}>
          <h2 id="calc-title" style={styles.sectionTitle}>
            Savings Calculator
          </h2>

          <div style={{ ...styles.card, ...styles.cardPad }}>
            <div style={styles.grid3}>
              <LabeledNumber
                label="Initial deposit"
                value={initialDeposit}
                setValue={setInitialDeposit}
                min={0}
                step="100"
                prefix="$"
              />
              <LabeledNumber
                label="Annual contribution"
                value={annualContribution}
                setValue={setAnnualContribution}
                step="100"
                prefix="$"
              />
              <LabeledNumber
                label="Annual contribution increase"
                value={annualContributionGrowthPct}
                setValue={setAnnualContributionGrowthPct}
                step="0.5"
                suffix="% /yr"
              />
            </div>

            <div style={{ height: 12 }} />

            <div style={styles.grid3}>
              <LabeledNumber
                label="Monthly contribution"
                value={monthlyContribution}
                setValue={setMonthlyContribution}
                step="50"
                prefix="$"
              />
              <LabeledNumber
                label="Monthly contribution increase"
                value={monthlyContributionGrowthPct}
                setValue={setMonthlyContributionGrowthPct}
                step="0.5"
                suffix="% /yr"
              />
              <LabeledSelect
                label="Compound frequency"
                value={frequency}
                setValue={(v) => setFrequency(v as Frequency)}
                options={[
                  { value: "annually", label: "Annually" },
                  { value: "quarterly", label: "Quarterly" },
                  { value: "monthly", label: "Monthly" },
                  { value: "daily", label: "Daily (approx)" },
                ]}
              />
            </div>

            <div style={{ height: 12 }} />

            <div style={styles.grid3}>
              <LabeledNumber
                label="Interest rate"
                value={annualInterestRatePct}
                setValue={setAnnualInterestRatePct}
                step="0.1"
                suffix="% APR"
              />
              <LabeledNumber
                label="Years to save"
                value={years}
                setValue={setYears}
                min={0}
                max={100}
                step="1"
              />
              <LabeledNumber
                label="Tax rate on interest"
                value={taxRatePct}
                setValue={setTaxRatePct}
                min={0}
                max={60}
                step="0.5"
                suffix="%"
              />
            </div>

            <div style={{ height: 12 }} />

            <div style={styles.grid3}>
              <LabeledNumber
                label="Inflation rate (optional)"
                value={inflationRatePct}
                setValue={setInflationRatePct}
                min={0}
                max={50}
                step="0.5"
                suffix="%"
              />
              <div>
                <div style={styles.label}>Contribution timing</div>
                <div
                  className="flex items-center gap-2 mt-2"
                  role="group"
                  aria-label="Contribution timing"
                >
                  <button
                    onClick={() => setContributionsAtPeriodEnd(true)}
                    style={{
                      ...styles.btnGhost,
                      background: contributionsAtPeriodEnd ? "#0b2447" : "#fff",
                      color: contributionsAtPeriodEnd ? "#fff" : "#111317",
                    }}
                  >
                    End of period
                  </button>
                  <button
                    onClick={() => setContributionsAtPeriodEnd(false)}
                    style={{
                      ...styles.btnGhost,
                      background: !contributionsAtPeriodEnd
                        ? "#0b2447"
                        : "#fff",
                      color: !contributionsAtPeriodEnd ? "#fff" : "#111317",
                    }}
                  >
                    Beginning of period
                  </button>
                </div>
              </div>
              <div />
            </div>

            {/* RESULTS */}
            <div className="grid gap-4 md:grid-cols-2 mt-6">
              <div className="rounded-xl border border-[#e6e8ef] p-4 bg-white">
                <div className="text-sm font-semibold text-[#5a616c]">
                  Results
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <KeyVal
                    label="End balance"
                    value={toCurrency(outputs.endBalance)}
                    big
                  />
                  <KeyVal
                    label="Initial deposit"
                    value={toCurrency(Number(initialDeposit))}
                  />
                  <KeyVal
                    label="Total contributions"
                    value={toCurrency(
                      outputs.totalContributions - Number(initialDeposit)
                    )}
                  />
                  <KeyVal
                    label="Total interest earned"
                    value={toCurrency(outputs.totalInterest)}
                  />
                  {inflationRatePct > 0 && (
                    <KeyVal
                      label="Inflation-adjusted end"
                      value={toCurrency(outputs.realEndBalance)}
                    />
                  )}
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="flex items-center gap-4">
                    <DonutChart parts={breakdown} />
                    <ul className="text-sm">
                      {breakdown.map((b, i) => (
                        <li key={i} className="mb-1">
                          <span
                            style={{
                              display: "inline-block",
                              width: 10,
                              height: 10,
                              borderRadius: 2,
                              background: b.color,
                              marginRight: 8,
                            }}
                          />
                          {b.label}: <strong>{toCurrency(b.value)}</strong>{" "}
                          <span className="text-gray-500">({pct[i]}%)</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#5a616c] mb-2">
                      Principal vs Contributions vs Interest
                    </div>
                    <StackedBars items={breakdown} height={110} />
                  </div>
                </div>

                <p className="text-xs text-gray-600 mt-3">
                  Note: This calculator assumes contributions occur at the
                  selected timing per period. Interest is taxed each subperiod
                  before being added to principal.
                </p>
              </div>

              {/* HOW IT WORKS + CITATION */}
              <div className="rounded-xl border border-[#e6e8ef] p-4 bg-white">
                <div className="text-sm font-semibold text-[#5a616c]">
                  How it works
                </div>
                <p className="text-gray-700 text-sm mt-2">
                  The balance accrues interest at the chosen compounding
                  frequency. Annual and monthly contributions can grow once per
                  year by their respective growth rates. Taxes on interest are
                  applied each subperiod, then interest is credited. If an
                  inflation rate is provided, the end balance is deflated to
                  show a real value.
                </p>
                <div className="text-xs text-gray-600">
                  <div className="font-semibold mt-2">Formulas and sources</div>
                  <ul className="list-disc ml-5 space-y-1 mt-1">
                    <li>
                      Compound interest and future value of annuities follow
                      standard time value of money relationships as presented in{" "}
                      <em>
                        Brigham, E. & Ehrhardt, M., Financial Management: Theory
                        & Practice
                      </em>
                      , Cengage, 2022.
                    </li>
                    <li>
                      Savings account characteristics and insurance limits:
                      FDIC, “Deposit Insurance at a Glance,” fdic.gov.
                    </li>
                    <li>
                      Inflation adjustment uses a constant annual inflation rate
                      to compute real value: Fisher equation, Federal Reserve
                      education resources.
                    </li>
                  </ul>
                </div>
                <div className="text-xs text-amber-700 mt-3">
                  Educational use only. Not financial advice.
                </div>
              </div>
            </div>

            {/* SCHEDULE */}
            <div className="mt-6">
              <div className="text-sm font-semibold text-[#5a616c] mb-2">
                Annual Schedule
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <Th>Year</Th>
                      <Th>Deposit</Th>
                      <Th>Interest</Th>
                      <Th>Ending balance</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {outputs.schedule.map((row) => (
                      <tr
                        key={row.year}
                        className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition"
                      >
                        <Td>{row.year}</Td>
                        <Td>{toCurrency(row.deposit)}</Td>
                        <Td>{toCurrency(row.interest)}</Td>
                        <Td>{toCurrency(row.endingBalance)}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Contributions and interest are shown at yearly resolution.
                Internally, the engine simulates using the finer of monthly or
                the chosen compounding frequency to support monthly deposits and
                per-step tax on interest.
              </p>
            </div>

            {/* DISCLAIMER UNDER CALCULATOR */}
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900 text-sm">
              <strong>Disclaimer:</strong> This tool is for education and
              planning. It does not consider fees, account minimums, or special
              bank rules. Tax treatment varies by jurisdiction. Always confirm
              results with your financial institution and consider consulting a
              qualified professional for advice.
            </div>
          </div>
        </section>

        {/* COMING SOON */}
        <section aria-labelledby="coming-title" style={styles.section}>
          <h2 id="coming-title" style={styles.sectionTitle}>
            More calculators coming soon
          </h2>
          <div style={{ ...styles.card, ...styles.cardPad }}>
            <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 text-gray-800">
              {[
                "CD Ladder Calculator",
                "High-Yield Savings Comparison",
                "Emergency Fund Planner",
                "Goal-Date Savings Planner",
                "Inflation-Adjusted Savings Target",
                "Tax-Deferred vs Taxable Savings",
              ].map((t) => (
                <li
                  key={t}
                  className="border border-[#e6e8ef] rounded-lg px-3 py-2 bg-white"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* LONG SEO CONTENT */}
        <section style={styles.section} aria-labelledby="learn-title">
          <h2 id="learn-title" style={styles.sectionTitle}>
            Savings basics
          </h2>
          <div style={{ ...styles.card, ...styles.cardPad }}>
            <p className="text-gray-700">
              Savings accounts provide liquidity and principal safety under U.S.
              FDIC insurance up to applicable limits. They are useful for
              emergency funds and near-term goals. Money market accounts and
              certificates of deposit can offer different yields and withdrawal
              rules. The right mix balances yield, access, and risk tolerance.
            </p>
            <h3 className="mt-4 font-bold text-[#0b2447]">
              How compound interest grows savings
            </h3>
            <p className="text-gray-700">
              Compounding means interest can earn interest. Regular
              contributions can significantly increase the end balance,
              especially when they grow each year with income or budget
              increases. Taxes on interest reduce the effective growth rate.
              Inflation reduces the future purchasing power of nominal balances,
              so it helps to compare both nominal and real amounts.
            </p>
            <h3 className="mt-4 font-bold text-[#0b2447]">
              Common rules of thumb
            </h3>
            <ul className="list-disc ml-6 text-gray-700">
              <li>Emergency fund covering three to six months of expenses.</li>
              <li>Automate contributions to stay consistent.</li>
              <li>Review rates and fees periodically.</li>
            </ul>
            <h3 className="mt-4 font-bold text-[#0b2447]">References</h3>
            <ul className="list-disc ml-6 text-gray-700">
              <li>FDIC. Deposit Insurance at a Glance. fdic.gov</li>
              <li>
                Federal Reserve Education. Time Value of Money and the Fisher
                Relationship.
              </li>
              <li>
                Brigham, E. & Ehrhardt, M. Financial Management: Theory &
                Practice. 2022.
              </li>
              <li>OECD. Household Saving Rates. oecd.org</li>
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" style={styles.section} aria-labelledby="faq-title">
          <h2 id="faq-title" style={styles.sectionTitle}>
            Frequently asked questions
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-200 shadow-sm">
            {FAQS.map((f) => (
              <details key={f.q} className="group open:bg-slate-50">
                <summary className="cursor-pointer list-none px-6 py-5 text-lg font-semibold text-[#0b2447]">
                  {f.q}
                </summary>
                <div className="px-6 pb-5 text-slate-700 text-base">{f.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* FOOTER DISCLAIMER */}
        <section className="mt-8">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900 text-sm">
            <strong>General information only:</strong> AllSavingsCalculators
            provides educational tools. We do not provide personalized financial
            advice. Consider speaking with a licensed professional before making
            financial decisions.
          </div>
        </section>

        <footer style={styles.footer}>
          © {new Date().getFullYear()} AllSavingsCalculators. Educational tools
          for better money decisions.
        </footer>
      </div>

      {/* STRUCTURED DATA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}

// ---------- REUSABLE UI ----------
function LabeledNumber({
  label,
  value,
  setValue,
  min,
  max,
  step,
  prefix,
  suffix,
}: {
  label: string;
  value: number;
  setValue: (n: number) => void;
  min?: number;
  max?: number;
  step?: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div>
      <div style={styles.label}>{label}</div>
      <div className="relative mt-2">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            {prefix}
          </span>
        )}
        <input
          inputMode="decimal"
          step={step || "1"}
          style={{
            ...styles.input,
            paddingLeft: prefix ? 28 : 12,
            paddingRight: suffix ? 40 : 12,
          }}
          value={value}
          onChange={(e) => {
            const raw = e.target.value.replace(/,/g, "");
            const n = Number(raw);
            if (Number.isFinite(n)) {
              let m = n;
              if (typeof min === "number") m = Math.max(min, m);
              if (typeof max === "number") m = Math.min(max, m);
              setValue(m);
            } else {
              setValue(0);
            }
          }}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function LabeledSelect<T extends string>({
  label,
  value,
  setValue,
  options,
}: {
  label: string;
  value: T;
  setValue: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div>
      <div style={styles.label}>{label}</div>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value as T)}
        style={{ ...styles.select, marginTop: 8 }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function KeyVal({
  label,
  value,
  big = false,
}: {
  label: string;
  value: string;
  big?: boolean;
}) {
  return (
    <div className="border border-[#e6e8ef] rounded-xl p-3 bg-white">
      <div className="text-xs text-[#5a616c]">{label}</div>
      <div
        className={
          big ? "text-2xl font-extrabold mt-1" : "text-lg font-bold mt-1"
        }
      >
        {value}
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="py-2 px-3 text-left font-semibold border-b border-[#e6e8ef] text-[#0b2447]">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="py-2 px-3 border-b border-[#e6e8ef]">{children}</td>;
}

// ---------- FAQ DATA ----------
const FAQS = [
  {
    q: "What compounding options are supported?",
    a: "You can choose annual, quarterly, monthly, or daily compounding. Internally, the simulation runs at the finer of monthly or your chosen frequency to support monthly contribution streams and per-step tax on interest.",
  },
  {
    q: "How are contribution increases applied?",
    a: "Annual and monthly contributions can grow once per year by their respective growth rates. This models raises or budget step-ups over time.",
  },
  {
    q: "How is tax on interest modeled?",
    a: "At each simulation step, interest is computed, tax is deducted at the specified rate, and the net interest is added to the balance. This approximates taxable accounts where interest is recognized as ordinary income.",
  },
  {
    q: "What does inflation-adjusted end balance mean?",
    a: "It deflates the nominal end balance using a constant annual inflation rate so you can compare purchasing power in today’s dollars. It uses the standard real value approach consistent with the Fisher relationship.",
  },
  {
    q: "Do negative contributions work?",
    a: "Yes. Negative values represent withdrawals. For example, a negative monthly amount can simulate a regular draw from the account.",
  },
  {
    q: "Why do results differ from my bank?",
    a: "Banks can use different rounding rules, credit interest on different calendars, or apply fees and minimums. Treat this as an estimate.",
  },
];
