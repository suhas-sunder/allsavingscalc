import * as React from "react";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  const title =
    "Savings Calculator | End Balance, Interest Earned, Taxes, Inflation";
  const description =
    "Calculate your savings end balance fast. Adjust deposit, contributions, interest rate, compounding, taxes on interest, and inflation. Includes a clear yearly schedule.";
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
    { name: "viewport", content: "width=device-width, initial-scale=1" },
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

const COLORS = {
  border: "#d2d9ea",
  accentYellow: "#f59e0b",
  softBlue: "#dbeafe",
  softGreen: "#dcfce7",
  softYellow: "#fef3c7",
};

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
  annualContributionGrowthPct: number;
  monthlyContribution: number;
  monthlyContributionGrowthPct: number;
  annualInterestRatePct: number;
  frequency: Frequency;
  years: number;
  taxRatePct: number;
  inflationRatePct: number;
  contributionsAtPeriodEnd: boolean;
};

type CalcOutputs = {
  endBalance: number;
  totalContributions: number;
  totalInterest: number;
  schedule: ScheduleRow[];
  realEndBalance: number;
};

const clampNumber = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function toCurrency(n: number): string {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
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

function computeSavings(inputs: CalcInputs): CalcOutputs {
  const taxRate = clampNumber(inputs.taxRatePct / 100, 0, 1);
  const inflationRate = clampNumber(inputs.inflationRatePct / 100, 0, 10);
  const years = Math.max(0, Math.floor(inputs.years));

  let balance = inputs.initialDeposit;
  let totalContribution = inputs.initialDeposit;
  let totalInterestAccrued = 0;

  const schedule: ScheduleRow[] = [];
  let annualContribution = inputs.annualContribution;
  let monthlyContribution = inputs.monthlyContribution;

  if (inputs.frequency === "daily") {
    const stepsPerYear = 365;
    const rDaily = inputs.annualInterestRatePct / 100 / stepsPerYear;
    const monthStep = Math.max(1, Math.round(stepsPerYear / 12));

    for (let year = 1; year <= years; year++) {
      let depositsThisYear = 0;
      let interestThisYear = 0;

      for (let k = 1; k <= stepsPerYear; k++) {
        const isMonthBoundary = k % monthStep === 0;
        const isYearEnd = k === stepsPerYear;

        if (!inputs.contributionsAtPeriodEnd) {
          if (k === 1 && annualContribution !== 0) {
            balance += annualContribution;
            depositsThisYear += annualContribution;
          }
          if (isMonthBoundary && monthlyContribution !== 0) {
            balance += monthlyContribution;
            depositsThisYear += monthlyContribution;
          }
        }

        const interestGross = balance * rDaily;
        const interestNet = interestGross * (1 - taxRate);
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
  } else {
    const monthsPerYear = 12;
    const rMonthly = inputs.annualInterestRatePct / 100 / monthsPerYear;
    const periodsPerYear = freqToN(inputs.frequency);
    const monthsPerCompound = Math.max(
      1,
      Math.round(monthsPerYear / periodsPerYear),
    );

    for (let year = 1; year <= years; year++) {
      let depositsThisYear = 0;
      let interestCreditedThisYear = 0;
      let accruedInterest = 0;

      for (let m = 1; m <= monthsPerYear; m++) {
        if (!inputs.contributionsAtPeriodEnd) {
          if (m === 1 && annualContribution !== 0) {
            balance += annualContribution;
            depositsThisYear += annualContribution;
          }
          if (monthlyContribution !== 0) {
            balance += monthlyContribution;
            depositsThisYear += monthlyContribution;
          }
        }

        accruedInterest += balance * rMonthly;

        const isCompoundBoundary = m % monthsPerCompound === 0;
        if (isCompoundBoundary) {
          const creditedNet = accruedInterest * (1 - taxRate);
          balance += creditedNet;
          interestCreditedThisYear += creditedNet;
          totalInterestAccrued += creditedNet;
          accruedInterest = 0;
        }

        if (inputs.contributionsAtPeriodEnd) {
          if (monthlyContribution !== 0) {
            balance += monthlyContribution;
            depositsThisYear += monthlyContribution;
          }
          if (m === 12 && annualContribution !== 0) {
            balance += annualContribution;
            depositsThisYear += annualContribution;
          }
        }
      }

      totalContribution += depositsThisYear;

      schedule.push({
        year,
        deposit: round2(depositsThisYear),
        interest: round2(interestCreditedThisYear),
        endingBalance: round2(balance),
      });

      annualContribution *= 1 + inputs.annualContributionGrowthPct / 100;
      monthlyContribution *= 1 + inputs.monthlyContributionGrowthPct / 100;
    }
  }

  const endBalance = round2(balance);
  const totalContribExInitial = round2(
    totalContribution - inputs.initialDeposit,
  );
  const totalInt = round2(totalInterestAccrued);

  const realEndBalance =
    inflationRate > 0
      ? round2(endBalance / Math.pow(1 + inflationRate, years))
      : endBalance;

  return {
    endBalance,
    totalContributions: round2(totalContribExInitial + inputs.initialDeposit),
    totalInterest: totalInt,
    schedule,
    realEndBalance,
  };
}

function DonutChart({
  parts,
  percents,
  size = 160,
  stroke = 24,
  className = "",
}: {
  parts: { label: string; value: number; color: string }[];
  percents: number[];
  size?: number;
  stroke?: number;
  className?: string;
}) {
  const total = parts.reduce((a, b) => a + b.value, 0) || 1;
  const radius = (size - stroke) / 2;
  const C = 2 * Math.PI * radius;

  const startAngle = -Math.PI / 2;

  let dashOffset = 0;
  let angleAcc = 0;

  const labelRadius = radius;
  const fontSize = Math.max(11, Math.round(size * 0.085));

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      className={["shrink-0", className].join(" ").trim()}
      aria-label="Breakdown chart"
      role="img"
    >
      <g transform={`translate(${size / 2},${size / 2})`}>
        <circle
          r={radius}
          fill="none"
          stroke={COLORS.border}
          strokeWidth={stroke}
        />

        {parts.map((p, i) => {
          const frac = p.value / total;
          const dash = C * frac;
          const gap = C - dash;

          const el = (
            <circle
              key={i}
              r={radius}
              fill="none"
              stroke={p.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={
                -(dashOffset + C * (startAngle / (2 * Math.PI)))
              }
              strokeLinecap="butt"
              transform="rotate(-90)"
            />
          );

          dashOffset += dash;
          return el;
        })}

        {parts.map((p, i) => {
          if (p.value <= 0) return null;

          const frac = p.value / total;
          const mid = angleAcc + frac * Math.PI * 2 * 0.5;
          angleAcc += frac * Math.PI * 2;

          const a = startAngle + mid;
          const x = Math.cos(a) * labelRadius;
          const y = Math.sin(a) * labelRadius;

          const pctVal = percents[i] ?? Math.round(frac * 100);

          return (
            <text
              key={`pct-${i}`}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={fontSize}
              fontWeight={900}
              fill="#0f172a"
              stroke="#ffffff"
              strokeWidth={3}
              paintOrder="stroke"
            >
              {pctVal}%
            </text>
          );
        })}
      </g>
    </svg>
  );
}

function YearlyStackedBars({
  schedule,
  initialDeposit,
  colors,
  height = 240,
}: {
  schedule: ScheduleRow[];
  initialDeposit: number;
  colors: { principal: string; contributions: string; interest: string };
  height?: number;
}) {
  const years = schedule.length;
  if (years === 0) return null;

  let contribCum = 0;
  let interestCum = 0;

  const points = schedule.map((row) => {
    contribCum += row.deposit;
    interestCum += row.interest;

    const principal = Math.max(initialDeposit, 0);
    const contrib = Math.max(contribCum, 0);
    const interest = Math.max(interestCum, 0);
    const total = principal + contrib + interest;

    return { year: row.year, principal, contrib, interest, total };
  });

  const maxTotal = Math.max(...points.map((p) => p.total), 1);

  const W = 760;
  const H = height;
  const padL = 56;
  const padR = 18;
  const padT = 16;
  const padB = 40;

  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const gap = Math.max(10, Math.round(plotW / (years * 10)));
  const barW = Math.max(18, Math.floor((plotW - gap * (years - 1)) / years));
  const r = 14;

  const y = (v: number) => padT + (1 - v / maxTotal) * plotH;
  const h = (v: number) => (v / maxTotal) * plotH;

  const tickCount = 5;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const frac = i / tickCount;
    const value = maxTotal * frac;
    return { value, y: y(value) };
  });

  const fmtAxis = (n: number) => {
    if (n >= 1_000_000) return `$${Math.round(n / 1_000_000)}M`;
    if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
    return `$${Math.round(n)}`;
  };

  return (
    <div className="w-full max-w-full overflow-x-auto">
      <svg
        className="block w-full max-w-none"
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        height={H}
        role="img"
        aria-label="Yearly stacked balances chart"
      >
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={padL}
              x2={W - padR}
              y1={t.y}
              y2={t.y}
              stroke="#e2e8f0"
              strokeWidth={1}
            />
            <text
              x={padL - 8}
              y={t.y}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={12}
              fill="#475569"
              fontWeight={800}
            >
              {fmtAxis(t.value)}
            </text>
          </g>
        ))}

        <defs>
          {points.map((p, idx) => {
            const x = padL + idx * (barW + gap);
            const topY = y(p.total);
            const totalH = h(p.total);

            return (
              <clipPath key={p.year} id={`bar-clip-${p.year}`}>
                <rect
                  x={x}
                  y={topY}
                  width={barW}
                  height={totalH}
                  rx={r}
                  ry={r}
                />
              </clipPath>
            );
          })}
        </defs>

        {points.map((p, idx) => {
          const x = padL + idx * (barW + gap);

          const principalH = h(p.principal);
          const contribH = h(p.contrib);
          const interestH = h(p.interest);

          const totalTopY = y(p.total);

          const interestY = totalTopY;
          const contribY = totalTopY + interestH;
          const principalY = totalTopY + interestH + contribH;

          return (
            <g key={p.year}>
              <title>
                {`Year ${p.year}\nInitial deposit: ${toCurrency(p.principal)}\nContributions: ${toCurrency(
                  p.contrib,
                )}\nInterest: ${toCurrency(p.interest)}\nTotal: ${toCurrency(p.total)}`}
              </title>

              <g clipPath={`url(#bar-clip-${p.year})`}>
                <rect
                  x={x}
                  y={principalY}
                  width={barW}
                  height={principalH}
                  fill={colors.principal}
                />
                <rect
                  x={x}
                  y={contribY}
                  width={barW}
                  height={contribH}
                  fill={colors.contributions}
                />
                <rect
                  x={x}
                  y={interestY}
                  width={barW}
                  height={interestH}
                  fill={colors.interest}
                />
              </g>

              <text
                x={x + barW / 2}
                y={H - 16}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={12}
                fill="#475569"
                fontWeight={800}
              >
                {p.year}
              </text>
            </g>
          );
        })}

        <text
          x={padL + plotW / 2}
          y={H - 6}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={12}
          fill="#334155"
          fontWeight={900}
        >
          Year
        </text>
      </svg>
    </div>
  );
}

const FAQS = [
  {
    q: "Why does my result differ from my bank?",
    a: "Banks can use different rounding, posting schedules, fee rules, and calendars. Use this as an estimate and confirm with your institution.",
  },
  {
    q: "What does tax on interest do here?",
    a: "We apply your tax rate to interest at each interest crediting event, then add the net interest to the balance. This approximates taxable accounts.",
  },
  {
    q: "What does inflation-adjusted end balance mean?",
    a: "It shows the end balance in today’s purchasing power using your inflation rate.",
  },
  {
    q: "Can I model withdrawals?",
    a: "Yes. Enter a negative monthly or annual contribution to represent withdrawals.",
  },
];

function parseNumericInput(raw: string): number | null {
  const s = raw
    .trim()
    .replace(/[,\s]/g, "")
    .replace(/[$£€¥₹]/g, "")
    .replace(/%/g, "");

  if (s === "" || s === "-" || s === "." || s === "-.") return null;
  if (!/^-?\d*\.?\d*$/.test(s)) return null;

  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return n;
}

function formatWithGrouping(n: number, maxFractionDigits: number) {
  const frac = Math.abs(n % 1);
  const hasFrac = frac > 0 && frac < 1;
  const digits = hasFrac ? maxFractionDigits : 0;

  return n.toLocaleString(undefined, {
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

function formatPlain(n: number, maxFractionDigits: number) {
  const frac = Math.abs(n % 1);
  const hasFrac = frac > 0 && frac < 1;
  if (!hasFrac) return String(Math.trunc(n));
  return n.toLocaleString(undefined, {
    useGrouping: false,
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFractionDigits,
  });
}

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
    <div className="min-h-screen bg-slate-200 text-slate-900 overflow-x-hidden">
      <style>{`
        @media print {
          .noPrint { display: none !important; }
          body { background: #ffffff !important; }
          table { page-break-inside: avoid; }
          a { text-decoration: none !important; color: inherit !important; }
        }
      `}</style>

      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6">
        <section className="grid gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5">
            <div className="p-3 md:p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
                <div className="">
                  <h1 className="text-xl font-black leading-[1.08] tracking-tight text-blue-950 md:text-2xl">
                    Savings Calculator
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 md:text-base">
                    Estimate your end balance from deposits, contributions,
                    interest, taxes, and inflation in seconds.
                  </p>
                </div>

                <div className="w-full md:w-auto ">
                  <div className="text-xs font-black uppercase tracking-wide text-slate-700">
                    Contribution timing
                  </div>
                  <div
                    className="mt-2 flex w-full gap-2"
                    role="group"
                    aria-label="Contribution timing"
                  >
                    <button
                      type="button"
                      onClick={() => setContributionsAtPeriodEnd(true)}
                      aria-pressed={contributionsAtPeriodEnd}
                      className={[
                        "flex-1 cursor-pointer rounded-xl border px-3 py-2 text-sm font-black shadow-sm transition md:flex-none ",
                        contributionsAtPeriodEnd
                          ? "border-blue-600 bg-blue-600 text-white shadow-blue-600/20"
                          : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      End
                    </button>
                    <button
                      type="button"
                      onClick={() => setContributionsAtPeriodEnd(false)}
                      aria-pressed={!contributionsAtPeriodEnd}
                      className={[
                        "flex-1 cursor-pointer rounded-xl border px-3 py-2 text-sm font-black shadow-sm transition md:flex-none ",
                        !contributionsAtPeriodEnd
                          ? "border-blue-600 bg-blue-600 text-white shadow-blue-600/20"
                          : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      Beginning
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                <div className="mb-3 text-xs font-black uppercase tracking-wide text-slate-700">
                  Inputs
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <LabeledNumber
                    label="Initial deposit"
                    value={initialDeposit}
                    setValue={setInitialDeposit}
                    min={0}
                    max={1e9}
                    maxFractionDigits={2}
                    prefix="$"
                  />
                  <LabeledNumber
                    label="Annual contribution"
                    value={annualContribution}
                    setValue={setAnnualContribution}
                    min={-1e8}
                    max={1e8}
                    maxFractionDigits={2}
                    prefix="$"
                  />
                  <LabeledNumber
                    label="Annual contribution increase"
                    value={annualContributionGrowthPct}
                    setValue={setAnnualContributionGrowthPct}
                    min={-100}
                    max={100}
                    maxFractionDigits={4}
                    suffix="%/yr"
                  />
                  <LabeledNumber
                    label="Monthly contribution"
                    value={monthlyContribution}
                    setValue={setMonthlyContribution}
                    min={-1e8}
                    max={1e8}
                    maxFractionDigits={2}
                    prefix="$"
                  />
                  <LabeledNumber
                    label="Monthly contribution increase"
                    value={monthlyContributionGrowthPct}
                    setValue={setMonthlyContributionGrowthPct}
                    min={-100}
                    max={100}
                    maxFractionDigits={4}
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
                  <LabeledNumber
                    label="Interest rate"
                    value={annualInterestRatePct}
                    setValue={setAnnualInterestRatePct}
                    min={-50}
                    max={100}
                    maxFractionDigits={4}
                    suffix="% APR"
                  />
                  <LabeledNumber
                    label="Years"
                    value={years}
                    setValue={setYears}
                    min={0}
                    max={100}
                    maxFractionDigits={0}
                    integer
                  />
                  <LabeledNumber
                    label="Tax rate on interest"
                    value={taxRatePct}
                    setValue={setTaxRatePct}
                    min={0}
                    max={60}
                    maxFractionDigits={4}
                    suffix="%"
                  />
                  <LabeledNumber
                    label="Inflation rate (optional)"
                    value={inflationRatePct}
                    setValue={setInflationRatePct}
                    min={0}
                    max={50}
                    maxFractionDigits={4}
                    suffix="%"
                  />
                </div>
              </div>

              <div className="my-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
                <div className="text-xs font-black uppercase tracking-wide text-slate-700">
                  Results
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 border-l-4 border-l-green-600 bg-white p-4 shadow-sm">
                    <div className="text-sm font-semibold text-slate-700">
                      End balance
                    </div>
                    <div className="mt-2 break-words text-2xl font-black tracking-tight text-green-700 md:text-3xl">
                      {toCurrency(outputs.endBalance)}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Balance after interest, contributions, taxes, and timing.
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-sm font-semibold text-slate-700">
                      Initial deposit
                    </div>
                    <div className="mt-2 break-words text-lg font-black tracking-tight text-slate-900 md:text-xl">
                      {toCurrency(Number(initialDeposit) || 0)}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Your starting principal.
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 border-l-4 border-l-blue-600 bg-white p-4 shadow-sm">
                    <div className="text-sm font-semibold text-slate-700">
                      Total contributions
                    </div>
                    <div className="mt-2 break-words text-lg font-black tracking-tight text-blue-700 md:text-xl">
                      {toCurrency(
                        outputs.totalContributions -
                          (Number(initialDeposit) || 0),
                      )}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Total contributed over the timeline (excluding the initial
                      deposit).
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 border-l-4 border-l-amber-500 bg-white p-4 shadow-sm">
                    <div className="text-sm font-semibold text-slate-700">
                      Total interest earned
                    </div>
                    <div className="mt-2 break-words text-lg font-black tracking-tight text-amber-700 md:text-xl">
                      {toCurrency(outputs.totalInterest)}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Net interest after tax (if enabled).
                    </div>
                  </div>

                  {inflationRatePct > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm md:col-span-2">
                      <div className="text-sm font-semibold text-slate-700">
                        Inflation-adjusted end balance
                      </div>
                      <div className="mt-2 break-words text-xl font-black tracking-tight text-slate-900 md:text-2xl">
                        {toCurrency(outputs.realEndBalance)}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Expressed in today’s purchasing power.
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 grid gap-3">
                  <div className="">
                    <div className="mb-2 text-xs font-black uppercase tracking-wide text-slate-700">
                      Balance by year
                    </div>
                    <YearlyStackedBars
                      schedule={outputs.schedule}
                      initialDeposit={Number(initialDeposit) || 0}
                      colors={{
                        principal: COLORS.softBlue,
                        contributions: COLORS.softGreen,
                        interest: COLORS.softYellow,
                      }}
                      height={240}
                    />
                  </div>
                </div>

                <div className="mt-8 flex w-full flex-col items-center justify-center gap-4 md:flex-row md:flex-wrap md:items-center md:justify-center md:gap-6">
                  <div className="h-28 w-28 sm:h-32 sm:w-32 md:h-36 md:w-36 lg:h-40 lg:w-40">
                    <DonutChart
                      parts={breakdown}
                      percents={pct}
                      className="h-full w-full"
                    />
                  </div>
                  <ul className="m-0 w-full max-w-full list-none p-0 text-sm md:w-auto ">
                    {breakdown.map((b, i) => (
                      <li
                        key={i}
                        className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1"
                      >
                        <span
                          className="inline-block h-3 w-3 shrink-0 rounded-sm border border-slate-200 align-middle"
                          style={{ background: b.color }}
                          aria-hidden="true"
                        />
                        <span className="break-words text-slate-700">
                          {b.label}:{" "}
                          <strong className="inline-block max-w-full break-words font-black text-slate-900">
                            {toCurrency(b.value)}
                          </strong>{" "}
                          <span className="text-slate-500">({pct[i]}%)</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className=" rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
                <div className="text-xs font-black uppercase tracking-wide text-slate-700">
                  Yearly schedule
                </div>

                <div className="mt-3 overflow-x-auto">
                  <table className="w-full  border-collapse text-xs  md:text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="whitespace-nowrap border-b border-slate-200 px-2 py-2 text-left text-[8px] font-black uppercase tracking-wide text-slate-700 sm:px-3 sm:py-3 sm:text-xs">
                          Year
                        </th>
                        <th className="whitespace-nowrap border-b border-slate-200 px-2 py-2 text-left text-[8px] font-black uppercase tracking-wide text-slate-700 sm:px-3 sm:py-3 sm:text-xs">
                          Deposit
                        </th>
                        <th className="whitespace-nowrap border-b border-slate-200 px-2 py-2 text-left text-[8px] font-black uppercase tracking-wide text-slate-700 sm:px-3 sm:py-3 sm:text-xs">
                          Interest
                        </th>
                        <th className="whitespace-nowrap border-b border-slate-200 px-2 py-2 text-left text-[8px] font-black uppercase tracking-wide text-slate-700 sm:px-3 sm:py-3 sm:text-xs">
                          Ending balance
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200">
                      {outputs.schedule.map((row) => (
                        <tr
                          key={row.year}
                          className="transition-colors even:bg-slate-50 hover:bg-indigo-50/70"
                        >
                          <td className="whitespace-nowrap px-2 py-2 text-[10px]  font-semibold text-slate-800 sm:px-3 sm:py-3 sm:text-sm">
                            {row.year}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 text-[10px] font-semibold text-slate-800 sm:px-3 sm:py-3 sm:text-sm">
                            {toCurrency(row.deposit)}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 text-[10px] font-semibold text-slate-800 sm:px-3 sm:py-3 sm:text-sm">
                            {toCurrency(row.interest)}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 text-[10px] font-semibold text-slate-800 sm:px-3 sm:py-3 sm:text-sm">
                            <span className="font-black text-slate-900">
                              {toCurrency(row.endingBalance)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 text-xs leading-relaxed text-slate-600">
                  Schedule is shown yearly. Monthly contributions and tax on
                  interest are modeled during the simulation.
                </div>
              </div>

              <div className="noPrint mt-4 flex flex-col gap-3 md:flex-row md:items-center">
                <button
                  type="button"
                  onClick={onPrint}
                  aria-label="Print or save as PDF"
                  className="w-full cursor-pointer rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-900 shadow-sm transition hover:bg-slate-50 md:w-auto"
                >
                  Print / Save PDF
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-lg font-black tracking-tight text-slate-900">
              How this savings calculator works
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-sm font-black text-slate-900">
                  1) Enter your savings assumptions
                </div>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  Provide your initial deposit, ongoing contributions, interest
                  rate, compounding frequency, and time horizon. Optional inputs
                  let you model contribution growth, taxes on interest, and
                  inflation.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-sm font-black text-slate-900">
                  2) We model compounding and cash flows
                </div>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  Interest accrues monthly and is credited at your selected
                  compounding frequency. Contributions are applied at the
                  beginning or end of the period, and interest can be reduced by
                  a tax rate before it is added to the balance.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-sm font-black text-slate-900">
                  3) Review projected balances and breakdowns
                </div>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  See end balance, total contributions, and total interest
                  earned, plus a yearly schedule and visual breakdown of
                  principal versus growth.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div
            id="faq"
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="mb-3 text-base font-black tracking-tight text-slate-900">
              FAQ
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              {FAQS.map((f, idx) => (
                <details
                  key={f.q}
                  className={idx === 0 ? "" : "border-t border-slate-200"}
                >
                  <summary className="cursor-pointer px-4 py-4 text-sm font-semibold text-slate-900">
                    {f.q}
                  </summary>
                  <div className="px-4 pb-4 text-sm leading-relaxed text-slate-600">
                    {f.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-700">
              Disclaimers
            </div>
            <div className="text-xs leading-relaxed text-slate-600">
              <p>
                Results are estimates. Real outcomes can differ due to rounding,
                posting schedules, fees, minimums, and institution-specific
                rules.
              </p>
              <p className="mt-2">
                This tool does not provide financial, tax, or legal advice.
                Confirm details with your institution or a qualified
                professional.
              </p>
            </div>
          </div>
        </section>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}

function LabeledNumber({
  label,
  value,
  setValue,
  min,
  max,
  maxFractionDigits,
  prefix,
  suffix,
  integer,
}: {
  label: string;
  value: number;
  setValue: (n: number) => void;
  min?: number;
  max?: number;
  maxFractionDigits: number;
  prefix?: string;
  suffix?: string;
  integer?: boolean;
}) {
  const [focused, setFocused] = React.useState(false);
  const [text, setText] = React.useState(() =>
    formatWithGrouping(value, maxFractionDigits),
  );

  React.useEffect(() => {
    if (focused) return;
    setText(formatWithGrouping(value, maxFractionDigits));
  }, [value, focused, maxFractionDigits]);

  const applyParsed = React.useCallback(
    (raw: string) => {
      const parsed = parseNumericInput(raw);
      if (parsed === null) return null;

      let n = parsed;
      if (integer) n = Math.trunc(n);

      if (typeof min === "number") n = Math.max(min, n);
      if (typeof max === "number") n = Math.min(max, n);

      setValue(n);
      return n;
    },
    [integer, max, min, setValue],
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="text-xs font-black text-slate-900">{label}</div>

      <div className="relative mt-2">
        {prefix && (
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-black text-slate-900 shadow-sm sm:text-xs">
            {prefix}
          </span>
        )}

        <input
          inputMode="decimal"
          type="text"
          value={text}
          onFocus={() => {
            setFocused(true);
            setText(formatPlain(value, maxFractionDigits));
          }}
          onBlur={() => {
            setFocused(false);
            const parsed = parseNumericInput(text);
            if (parsed === null) {
              setText(formatWithGrouping(value, maxFractionDigits));
              return;
            }
            const next = applyParsed(text);
            if (next === null) {
              setText(formatWithGrouping(value, maxFractionDigits));
              return;
            }
            setText(formatWithGrouping(next, maxFractionDigits));
          }}
          onChange={(e) => {
            const nextText = e.target.value;
            setText(nextText);

            const parsed = parseNumericInput(nextText);
            if (parsed === null) return;

            let n = parsed;
            if (integer) n = Math.trunc(n);
            if (typeof min === "number") n = Math.max(min, n);
            if (typeof max === "number") n = Math.min(max, n);
            setValue(n);
          }}
          aria-label={label}
          className={[
            "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-black text-slate-900 shadow-inner shadow-slate-900/5 sm:text-base",
            "outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100",
            prefix ? "pl-12 sm:pl-14" : "",
            suffix ? "pr-14 sm:pr-16" : "",
          ].join(" ")}
        />

        {suffix && (
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-black text-slate-900 shadow-sm sm:text-xs">
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
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="text-xs font-black text-slate-900">{label}</div>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value as T)}
        aria-label={label}
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-black text-slate-900 shadow-inner shadow-slate-900/5 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 sm:text-base"
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
