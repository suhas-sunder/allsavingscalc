// app/routes/_index.tsx
import * as React from "react";
import type { Route } from "./+types/home";

// ---------- META ----------
export function meta({}: Route.MetaArgs) {
  const title =
    "Savings Calculator | End Balance, Interest Earned, Taxes, Inflation";
  const description =
    "Project your savings end balance fast. Adjust deposit, contributions, interest rate, compounding, taxes on interest, and inflation. Includes a clear yearly schedule.";
  const canonical = "https://www.allsavingscalculators.com/";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content:
        "savings calculator, compound interest calculator, end balance calculator, interest earned calculator, inflation adjusted savings calculator, tax on interest calculator, contribution growth calculator",
    },
    { name: "robots", content: "index,follow" },
    { name: "theme-color", content: "#0b2447" },
    { tagName: "link", rel: "canonical", href: canonical },

    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: canonical },
    { name: "twitter:card", content: "summary" },
  ];
}

export function loader({}: Route.LoaderArgs) {
  return { ok: true };
}

// ---------- DESIGN TOKENS (flat colors, higher contrast) ----------
const COLORS = {
  navy: "#0b2447",
  navy2: "#071a36",
  pageBg: "#f6f7fb",
  cardBg: "#ffffff",

  text: "#0b0f17",
  muted: "#2f3744", // higher contrast than typical gray
  border: "#d2d9ea",
  borderStrong: "#b2bfdc",

  accentGreen: "#16a34a",
  accentYellow: "#f59e0b",
  focusRing: "rgba(245,158,11,0.28)",

  softBlue: "#dbeafe",
  softGreen: "#dcfce7",
  softYellow: "#fef3c7",

  tableHead: "#eef2ff",
  tableRowAlt: "#f8fafc",
  rowHover: "#eef2ff",
};

// ---------- STYLES ----------
const styles: Record<string, React.CSSProperties> = {
  page: {
    background: COLORS.pageBg,
    color: COLORS.text,
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
    border: `2px solid ${COLORS.navy}`,
    borderRadius: 10,
    background: COLORS.cardBg,
    position: "relative",
    flex: "0 0 auto",
  },
  siteTitle: {
    fontWeight: 950,
    letterSpacing: 0.2,
    fontSize: 18,
    color: COLORS.navy,
    lineHeight: 1.1,
  },
  pill: {
    border: `1px solid ${COLORS.border}`,
    padding: "9px 12px",
    borderRadius: 999,
    background: COLORS.cardBg,
    color: COLORS.navy,
    fontWeight: 950,
    fontSize: 13,
    lineHeight: 1,
    whiteSpace: "nowrap",
  },

  hero: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 12,
    padding: "10px 0 10px",
  },
  h1: {
    fontSize: "clamp(2.1rem, 2.7vw + 1rem, 3.2rem)",
    lineHeight: 1.08,
    margin: 0,
    letterSpacing: -0.3,
    color: COLORS.navy2,
  },
  lead: {
    marginTop: 10,
    color: COLORS.muted,
    fontSize: "clamp(1.05rem, 0.35vw + 1rem, 1.2rem)", // larger, readable
    margin: 0,
    maxWidth: 860,
    lineHeight: 1.45,
  },

  calcShell: {
    borderRadius: 20,
    border: `1px solid ${COLORS.borderStrong}`,
    background: COLORS.cardBg,
    boxShadow: "0 10px 22px rgba(11,36,71,0.10)",
  },
  calcShellPad: { padding: 18 },

  calcTopRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  calcTitle: { fontWeight: 950, color: COLORS.navy, fontSize: 15 },

  grid3: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 14,
  },

  label: {
    fontSize: 14.5, // bigger labels
    color: COLORS.muted,
    fontWeight: 800,
    letterSpacing: 0.1,
  },
  input: {
    width: "100%",
    minHeight: 44, // bigger target
    padding: "12px 12px",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    background: COLORS.cardBg,
    color: COLORS.text,
    font: "800 16px/1 ui-sans-serif, system-ui",
    outline: "none",
  },
  inputFocus: {
    border: `1px solid ${COLORS.navy}`,
    boxShadow: `0 0 0 4px ${COLORS.focusRing}`,
  },
  select: {
    width: "100%",
    minHeight: 44,
    padding: "12px 12px",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    background: COLORS.cardBg,
    color: COLORS.text,
    font: "800 16px/1 ui-sans-serif, system-ui",
    outline: "none",
  },

  btn: {
    border: `1px solid ${COLORS.border}`,
    background: COLORS.cardBg,
    color: COLORS.text,
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 950,
    cursor: "pointer",
    lineHeight: 1,
    fontSize: 14,
    whiteSpace: "nowrap",
  },
  btnPrimary: {
    border: `1px solid ${COLORS.navy}`,
    background: COLORS.navy,
    color: "#fff",
    cursor: "pointer",
  },
  btnActive: {
    border: `1px solid ${COLORS.navy}`,
    background: COLORS.navy,
    color: "#fff",
    cursor: "pointer",
  },

  resultsCard: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    padding: 16,
    background: COLORS.cardBg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 950,
    margin: "0 0 10px",
    color: COLORS.navy2,
    letterSpacing: -0.1,
  },

  howWrap: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    padding: 16,
    background: COLORS.cardBg,
  },
  steps: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 10,
    marginTop: 10,
  },
  step: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: 14,
    padding: 12,
    background: COLORS.cardBg,
  },
  stepTitle: {
    fontWeight: 950,
    color: COLORS.navy,
    marginBottom: 4,
    fontSize: 15.5,
  },
  stepBody: { color: COLORS.muted, margin: 0, fontSize: 15, lineHeight: 1.45 },

  faqWrap: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    background: COLORS.cardBg,
    overflow: "hidden",
  },
  faqItem: {
    borderTop: `1px solid ${COLORS.border}`,
    padding: 0,
    background: COLORS.cardBg,
  },
  faqSummary: {
    padding: "14px 16px",
    cursor: "pointer",
    fontWeight: 950,
    color: COLORS.navy2,
    fontSize: 16,
    listStyle: "none",
  },
  faqAnswer: {
    padding: "0 16px 14px",
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 1.5,
  },

  disclaimer: {
    color: COLORS.muted,
    fontSize: 12.5,
    lineHeight: 1.5,
    borderTop: `1px solid ${COLORS.border}`,
    paddingTop: 14,
    marginTop: 18,
  },

  footer: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: "center",
    padding: "18px 0 8px",
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
          background: COLORS.navy,
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
          background: COLORS.navy,
          borderRadius: 2,
        }}
      />
      <span
        style={{
          position: "absolute",
          right: 8,
          bottom: 12,
          width: 8,
          height: 8,
          background: COLORS.accentYellow,
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

// ---------- CORE ENGINE ----------
function computeSavings(inputs: CalcInputs): CalcOutputs {
  const nCompound = freqToN(inputs.frequency);
  const stepsPerYear = Math.max(nCompound, 12);
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

  if (inputs.frequency === "annually") {
    const r = inputs.annualInterestRatePct / 100;

    for (let year = 1; year <= inputs.years; year++) {
      const interestThisYear = balance * r;
      let depositsThisYear = 0;

      balance += interestThisYear;
      totalInterestAccrued += interestThisYear;

      if (annualContribution !== 0) {
        balance += annualContribution;
        depositsThisYear += annualContribution;
      }

      if (monthlyContribution !== 0) {
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

      annualContribution *= 1 + inputs.annualContributionGrowthPct / 100;
      monthlyContribution *= 1 + inputs.monthlyContributionGrowthPct / 100;
    }
  } else {
    for (let year = 1; year <= inputs.years; year++) {
      let interestThisYear = 0;
      let depositsThisYear = 0;

      const monthStep = Math.max(1, Math.round(stepsPerYear / 12));

      for (let k = 1; k <= stepsPerYear; k++) {
        const isMonthBoundary = k % monthStep === 0;
        const isYearEnd = k === stepsPerYear;

        if (!inputs.contributionsAtPeriodEnd) {
          if (isMonthBoundary && monthlyContribution !== 0) {
            balance += monthlyContribution;
            depositsThisYear += monthlyContribution;
          }
          if (k === 1 && annualContribution !== 0) {
            balance += annualContribution;
            depositsThisYear += annualContribution;
          }
        }

        const interestGross = balance * rStep;
        const taxOnInterest = interestGross * taxRate;
        const interestNet = interestGross - taxOnInterest;
        balance += interestNet;

        interestThisYear += interestNet;
        totalInterestAccrued += interestNet;

        if (inputs.contributionsAtPeriodEnd) {
          if (isMonthBoundary && monthlyContribution !== 0) {
            balance += monthlyContribution;
            depositsThisYear += monthlyContribution;
          }
          if (isYearEnd && annualContribution !== 0) {
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
    totalContributions: totalContrib + inputs.initialDeposit,
    totalInterest: totalInt,
    schedule,
    realEndBalance,
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

// ---------- MINI CHARTS ----------
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
        <circle
          r={radius}
          fill="none"
          stroke={COLORS.border}
          strokeWidth={stroke}
        />
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
  height = 110,
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
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        overflow: "hidden",
        background: COLORS.cardBg,
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

// ---------- FAQ DATA ----------
const FAQS = [
  {
    q: "Why does my result differ from my bank?",
    a: "Banks can use different rounding, posting schedules, fee rules, and calendars. Use this as a fast estimate and confirm with your institution.",
  },
  {
    q: "What does tax on interest do here?",
    a: "We reduce each interest step by your tax rate before crediting it to the balance. This helps approximate taxable accounts.",
  },
  {
    q: "What does inflation-adjusted end balance mean?",
    a: "It shows the end balance in today’s purchasing power using your inflation rate. Turn it on only if you want the real-value view.",
  },
  {
    q: "Can I model withdrawals?",
    a: "Yes. Enter a negative monthly or annual contribution to represent withdrawals.",
  },
];

// ---------- PAGE ----------
export default function Home() {
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

  const outputs = React.useMemo(() => {
    const safeInputs: CalcInputs = {
      initialDeposit: clampNumber(Number(initialDeposit) || 0, 0, 1e9),
      annualContribution: clampNumber(
        Number(annualContribution) || 0,
        -1e8,
        1e8,
      ),
      annualContributionGrowthPct: clampNumber(
        Number(annualContributionGrowthPct) || 0,
        -100,
        100,
      ),
      monthlyContribution: clampNumber(
        Number(monthlyContribution) || 0,
        -1e8,
        1e8,
      ),
      monthlyContributionGrowthPct: clampNumber(
        Number(monthlyContributionGrowthPct) || 0,
        -100,
        100,
      ),
      annualInterestRatePct: clampNumber(
        Number(annualInterestRatePct) || 0,
        -50,
        100,
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
    const principal = Number(initialDeposit) || 0;
    const contribs = outputs.totalContributions - principal;
    const interest = outputs.totalInterest;

    return [
      {
        label: "Initial deposit",
        value: Math.max(principal, 0),
        color: COLORS.softBlue,
      },
      {
        label: "Contributions",
        value: Math.max(contribs, 0),
        color: COLORS.softGreen,
      },
      {
        label: "Interest",
        value: Math.max(interest, 0),
        color: COLORS.softYellow,
      },
    ];
  }, [outputs, initialDeposit]);

  const totalForPct = breakdown.reduce((a, b) => a + b.value, 0) || 1;
  const pct = breakdown.map((b) => Math.round((b.value / totalForPct) * 100));

  const onPrint = React.useCallback(() => {
    if (typeof window !== "undefined") window.print();
  }, []);

  // ---------- JSON-LD ----------
  const baseUrl = "https://www.allsavingscalculators.com";
  const jsonLd = React.useMemo(() => {
    const faqEntities = FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    }));

    return {
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
          url: `${baseUrl}/`,
          name: "Savings Calculator",
          description:
            "Project end balance using deposits, contributions, interest rate, compounding, taxes, and inflation.",
          isPartOf: { "@id": `${baseUrl}#website` },
        },
        {
          "@type": "SoftwareApplication",
          "@id": `${baseUrl}/#app`,
          name: "Savings Calculator",
          applicationCategory: "FinanceApplication",
          operatingSystem: "Web",
          url: `${baseUrl}/`,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        },
        {
          "@type": "FAQPage",
          "@id": `${baseUrl}/#faq`,
          mainEntity: faqEntities,
        },
      ],
    };
  }, []);

  return (
    <div style={styles.page}>
      {/* Print rules: flat, readable, no gradients */}
      <style>{`
        :root { color-scheme: light; }
        button { cursor: pointer; }
        summary { cursor: pointer; }
        @media (max-width: 900px) {
          .grid3 { grid-template-columns: 1fr !important; }
          .resultsGrid { grid-template-columns: 1fr !important; }
          .split { grid-template-columns: 1fr !important; }
        }
        @media print {
          .noPrint { display: none !important; }
          body { background: #ffffff !important; }
          table { page-break-inside: avoid; }
          a { text-decoration: none !important; color: inherit !important; }
        }
      `}</style>

      <div style={styles.wrap}>
        {/* NAV */}
        <header style={styles.header}>
          <div style={styles.brand}>
            <div style={styles.logo} aria-hidden="true">
              <LogoBars />
            </div>
            <div>
              <div style={styles.siteTitle}>AllSavingsCalculators</div>
            </div>
          </div>
          <span style={styles.pill}>Savings Calculator</span>
        </header>

        {/* 1) HERO (above the fold) */}
        <section style={styles.hero}>
          <div>
            <h1 style={styles.h1}>Savings Calculator</h1>
            <p style={styles.lead} className="!mt-2">
              Estimate your end balance from deposits, contributions, interest,
              taxes, and inflation in seconds.
            </p>
          </div>

          {/* 2) CALCULATOR UTILITY CARD (dominant) */}
          <div style={{ ...styles.calcShell, ...styles.calcShellPad }}>
            <div style={styles.calcTopRow}>
              <div style={styles.calcTitle}>Calculator</div>

              <div className="ml-auto">
                <div style={styles.label}>Contribution timing</div>
                <div
                  className="flex items-center gap-2 mt-2"
                  role="group"
                  aria-label="Contribution timing"
                  style={{ marginTop: 8, display: "flex", gap: 10 }}
                >
                  <button
                    type="button"
                    onClick={() => setContributionsAtPeriodEnd(true)}
                    style={{
                      ...styles.btn,
                      ...(contributionsAtPeriodEnd ? styles.btnActive : null),
                    }}
                    aria-pressed={contributionsAtPeriodEnd}
                  >
                    End
                  </button>
                  <button
                    type="button"
                    onClick={() => setContributionsAtPeriodEnd(false)}
                    style={{
                      ...styles.btn,
                      ...(!contributionsAtPeriodEnd ? styles.btnActive : null),
                    }}
                    aria-pressed={!contributionsAtPeriodEnd}
                  >
                    Beginning
                  </button>
                </div>
              </div>
            </div>

            <div style={{ height: 14 }} />

            <div className="grid3" style={styles.grid3}>
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
                suffix="%/yr"
              />
            </div>

            <div style={{ height: 14 }} />

            <div className="grid3" style={styles.grid3}>
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
                suffix="%/yr"
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

            <div style={{ height: 14 }} />

            <div className="grid3" style={styles.grid3}>
              <LabeledNumber
                label="Interest rate"
                value={annualInterestRatePct}
                setValue={setAnnualInterestRatePct}
                step="0.1"
                suffix="% APR"
              />
              <LabeledNumber
                label="Years"
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

            <div style={{ height: 14 }} />

            <div className="grid3" style={styles.grid3}>
              <LabeledNumber
                label="Inflation rate (optional)"
                value={inflationRatePct}
                setValue={setInflationRatePct}
                min={0}
                max={50}
                step="0.5"
                suffix="%"
              />
              <div />
            </div>

            <div style={{ height: 16 }} />

            {/* RESULTS + CHARTS */}
            <div
              className="split"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
                alignItems: "start",
              }}
            >
              <div style={styles.resultsCard}>
                <div
                  style={{ color: COLORS.muted, fontWeight: 900, fontSize: 14 }}
                >
                  Results
                </div>

                <div
                  className="resultsGrid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginTop: 12,
                  }}
                >
                  <KeyVal
                    label="End balance"
                    value={toCurrency(outputs.endBalance)}
                    big
                    accent="green"
                  />
                  <KeyVal
                    label="Initial deposit"
                    value={toCurrency(Number(initialDeposit) || 0)}
                  />
                  <KeyVal
                    label="Total contributions"
                    value={toCurrency(
                      outputs.totalContributions -
                        (Number(initialDeposit) || 0),
                    )}
                  />
                  <KeyVal
                    label="Total interest earned"
                    value={toCurrency(outputs.totalInterest)}
                    accent="yellow"
                  />
                  {inflationRatePct > 0 && (
                    <KeyVal
                      label="Inflation-adjusted end"
                      value={toCurrency(outputs.realEndBalance)}
                    />
                  )}
                </div>

                <div
                  style={{
                    marginTop: 16,
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      flexWrap: "wrap",
                    }}
                  >
                    <DonutChart parts={breakdown} />
                    <ul
                      style={{
                        margin: 0,
                        padding: 0,
                        listStyle: "none",
                        fontSize: 15,
                      }}
                    >
                      {breakdown.map((b, i) => (
                        <li key={i} style={{ marginBottom: 8 }}>
                          <span
                            aria-hidden="true"
                            style={{
                              display: "inline-block",
                              width: 12,
                              height: 12,
                              borderRadius: 3,
                              background: b.color,
                              border: `1px solid ${COLORS.border}`,
                              marginRight: 8,
                              verticalAlign: "middle",
                            }}
                          />
                          <span style={{ color: COLORS.text }}>
                            {b.label}:{" "}
                            <strong style={{ color: COLORS.navy2 }}>
                              {toCurrency(b.value)}
                            </strong>{" "}
                            <span style={{ color: COLORS.muted }}>
                              ({pct[i]}%)
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div
                      style={{
                        color: COLORS.muted,
                        fontWeight: 900,
                        fontSize: 14,
                        marginBottom: 8,
                      }}
                    >
                      Breakdown
                    </div>
                    <StackedBars items={breakdown} height={110} />
                  </div>
                </div>
              </div>

              {/* SCHEDULE */}
              <div style={{ ...styles.resultsCard }}>
                <div
                  style={{ color: COLORS.muted, fontWeight: 900, fontSize: 14 }}
                >
                  Yearly schedule
                </div>

                <div style={{ marginTop: 10, overflowX: "auto" }}>
                  <table
                    style={{
                      minWidth: 640,
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 15,
                    }}
                  >
                    <thead style={{ background: COLORS.tableHead }}>
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
                          style={{
                            background:
                              row.year % 2 === 0
                                ? COLORS.tableRowAlt
                                : COLORS.cardBg,
                          }}
                          onMouseEnter={(e) => {
                            (
                              e.currentTarget as HTMLTableRowElement
                            ).style.background = COLORS.rowHover;
                          }}
                          onMouseLeave={(e) => {
                            (
                              e.currentTarget as HTMLTableRowElement
                            ).style.background =
                              row.year % 2 === 0
                                ? COLORS.tableRowAlt
                                : COLORS.cardBg;
                          }}
                        >
                          <Td>{row.year}</Td>
                          <Td>{toCurrency(row.deposit)}</Td>
                          <Td>{toCurrency(row.interest)}</Td>
                          <Td>
                            <span
                              style={{ fontWeight: 950, color: COLORS.navy2 }}
                            >
                              {toCurrency(row.endingBalance)}
                            </span>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div
                  style={{
                    marginTop: 10,
                    color: COLORS.muted,
                    fontSize: 13.5,
                    lineHeight: 1.5,
                  }}
                >
                  Schedule is shown yearly. Monthly contributions and tax on
                  interest are modeled during the simulation.
                </div>
              </div>
            </div>

            <div
              className="flex w-full ml-auto mt-4"
              style={{ display: "flex", gap: 10, alignItems: "center" }}
            >
              <button
                type="button"
                onClick={onPrint}
                className="bg-white border rounded-full px-2 py-1 cursor-pointer hover:bg-green-900 hover:text-white"
                aria-label="Print or save as PDF"
              >
                Print / Save PDF
              </button>
            </div>
          </div>
        </section>

        {/* 3) HOW IT WORKS (below tool, skimmable) */}
        <section style={{ marginTop: 18 }}>
          <div style={styles.howWrap}>
            <div style={styles.sectionTitle}>How it works</div>
            <div style={styles.steps}>
              <div style={styles.step}>
                <div style={styles.stepTitle}>1) Enter your numbers</div>
                <p style={styles.stepBody}>
                  Set your deposit, contributions, rate, and timeline.
                </p>
              </div>
              <div style={styles.step}>
                <div style={styles.stepTitle}>2) We calculate instantly</div>
                <p style={styles.stepBody}>
                  Compounding, taxes, and contribution timing apply
                  automatically.
                </p>
              </div>
              <div style={styles.step}>
                <div style={styles.stepTitle}>3) Review results clearly</div>
                <p style={styles.stepBody}>
                  See your end balance plus a clean yearly breakdown.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4) OPTIONAL SUPPORTING COPY (single section, includes FAQ) */}
        <section style={{ marginTop: 18 }}>
          <div style={styles.sectionTitle}>FAQ</div>
          <div style={styles.faqWrap} id="faq">
            {FAQS.map((f, idx) => (
              <details
                key={f.q}
                style={idx === 0 ? { padding: 0 } : styles.faqItem}
              >
                <summary style={styles.faqSummary}>{f.q}</summary>
                <div style={styles.faqAnswer}>{f.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* 5) DISCLAIMERS (bottom only) */}
        <section style={styles.disclaimer} aria-label="Disclaimers">
          <div
            style={{ fontWeight: 950, color: COLORS.navy2, marginBottom: 6 }}
          >
            Disclaimers
          </div>
          <div>
            Results are estimates. Real outcomes can differ due to rounding,
            posting schedules, fees, minimums, and institution-specific rules.
          </div>
          <div style={{ marginTop: 6 }}>
            This tool does not provide financial, tax, or legal advice. Confirm
            details with your institution or a qualified professional.
          </div>
        </section>

        <footer style={styles.footer}>
          © {new Date().getFullYear()} AllSavingsCalculators
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
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <div>
      <div style={styles.label}>{label}</div>
      <div style={{ position: "relative", marginTop: 8 }}>
        {prefix && (
          <span
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: COLORS.muted,
              fontWeight: 950,
              fontSize: 14,
              pointerEvents: "none",
            }}
          >
            {prefix}
          </span>
        )}

        <input
          inputMode="decimal"
          step={step || "1"}
          style={{
            ...styles.input,
            ...(isFocused ? styles.inputFocus : null),
            paddingLeft: prefix ? 30 : 12,
            paddingRight: suffix ? 52 : 12,
          }}
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
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
          aria-label={label}
        />

        {suffix && (
          <span
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: COLORS.muted,
              fontWeight: 950,
              fontSize: 14,
              pointerEvents: "none",
            }}
          >
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
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <div>
      <div style={styles.label}>{label}</div>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value as T)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          ...styles.select,
          ...(isFocused ? styles.inputFocus : null),
          marginTop: 8,
        }}
        aria-label={label}
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
  accent,
}: {
  label: string;
  value: string;
  big?: boolean;
  accent?: "green" | "yellow";
}) {
  const accentBorder =
    accent === "green"
      ? COLORS.accentGreen
      : accent === "yellow"
        ? COLORS.accentYellow
        : COLORS.border;

  const ring =
    accent === "green"
      ? "rgba(22,163,74,0.14)"
      : accent === "yellow"
        ? "rgba(245,158,11,0.16)"
        : "transparent";

  return (
    <div
      style={{
        border: `1px solid ${accentBorder}`,
        borderRadius: 14,
        padding: 12,
        background: COLORS.cardBg,
        boxShadow: ring === "transparent" ? "none" : `0 0 0 4px ${ring}`,
      }}
    >
      <div style={{ color: COLORS.muted, fontWeight: 900, fontSize: 13.5 }}>
        {label}
      </div>
      <div
        style={{
          marginTop: 8,
          fontWeight: 950,
          fontSize: big ? 28 : 18,
          lineHeight: 1.15,
          color: COLORS.navy2,
          letterSpacing: -0.2,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        padding: "10px 12px",
        textAlign: "left",
        fontWeight: 950,
        borderBottom: `1px solid ${COLORS.border}`,
        color: COLORS.navy2,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td
      style={{
        padding: "10px 12px",
        borderBottom: `1px solid ${COLORS.border}`,
        whiteSpace: "nowrap",
        color: COLORS.text,
      }}
    >
      {children}
    </td>
  );
}
