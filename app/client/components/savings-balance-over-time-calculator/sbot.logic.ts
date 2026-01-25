export const COLORS = {
  border: "#d2d9ea",
  softBlue: "#dbeafe",
  softGreen: "#dcfce7",
  softYellow: "#fef3c7",
  text: "#0f172a",
  muted: "#475569",
};

export type Frequency =
  | "annually"
  | "semiannually"
  | "quarterly"
  | "monthly"
  | "semimonthly"
  | "biweekly"
  | "weekly"
  | "daily"
  | "continuously";

export type ChartPeriod = "monthly" | "quarterly" | "yearly";

export type SeriesPoint = {
  index: number;
  label: string;
  deposits: number;
  interest: number;
  balance: number;
  realBalance: number;
};

export type CalcInputs = {
  initialDeposit: number;
  monthlyContribution: number;
  monthlyContributionGrowthPct: number;
  annualContribution: number;
  annualContributionGrowthPct: number;
  annualInterestRatePct: number;
  frequency: Frequency;
  years: number;
  taxRatePct: number;
  inflationRatePct: number;
  contributionsAtPeriodEnd: boolean;
  chartPeriod: ChartPeriod;
};

export type CalcOutputs = {
  endBalance: number;
  realEndBalance: number;
  totalDepositsExInitial: number;
  totalInterest: number;
  series: SeriesPoint[];
};

export const FAQS = [
  {
    q: "Why does my balance chart differ from my bank?",
    a: "Banks can use different posting schedules, rounding, fee rules, and day count conventions. This tool is an estimate meant for planning, not an exact statement forecast.",
  },
  {
    q: "What does contribution timing change?",
    a: "Beginning-of-period deposits start earning interest sooner than end-of-period deposits. If your deposits post at the start of a month, use Beginning to better match reality.",
  },
  {
    q: "How is tax on interest modeled?",
    a: "We apply your tax rate to interest as it accrues and add the net interest to the balance. This approximates a taxable account and keeps the chart consistent over time.",
  },
  {
    q: "What does inflation-adjusted balance mean?",
    a: "It shows the projected balance in today’s purchasing power using your inflation rate. It helps compare future balances against current costs.",
  },
];

export const clampNumber = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function toCurrency(n: number): string {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getPeriodsPerYear(freq: Frequency): number | "continuous" {
  if (freq === "continuously") return "continuous";
  if (freq === "annually") return 1;
  if (freq === "semiannually") return 2;
  if (freq === "quarterly") return 4;
  if (freq === "monthly") return 12;
  if (freq === "semimonthly") return 24;
  if (freq === "biweekly") return 26;
  if (freq === "weekly") return 52;
  if (freq === "daily") return 365;
  return 12;
}

function getMonthlyRateFromNominalAPR(apr: number, freq: Frequency) {
  if (!Number.isFinite(apr)) return 0;

  const ppy = getPeriodsPerYear(freq);
  if (ppy === "continuous") return Math.exp(apr / 12) - 1;

  if (ppy <= 0) return 0;
  return Math.pow(1 + apr / ppy, ppy / 12) - 1;
}

export function computeSavingsBalanceOverTime(inputs: CalcInputs): CalcOutputs {
  const years = Math.max(0, Math.floor(inputs.years));
  const taxRate = clampNumber(inputs.taxRatePct / 100, 0, 1);
  const inflationRate = clampNumber(inputs.inflationRatePct / 100, 0, 10);
  const apr = inputs.annualInterestRatePct / 100;

  let balance = Number.isFinite(inputs.initialDeposit)
    ? inputs.initialDeposit
    : 0;

  let annualContribution = inputs.annualContribution;
  let monthlyContribution = inputs.monthlyContribution;

  let totalDepositsExInitial = 0;
  let totalInterest = 0;

  const series: SeriesPoint[] = [];

  const pushPoint = (
    idx: number,
    label: string,
    deposits: number,
    interest: number,
  ) => {
    const nominalBalance = round2(balance);
    const yearsElapsed =
      inputs.chartPeriod === "monthly"
        ? (idx + 1) / 12
        : inputs.chartPeriod === "quarterly"
          ? (idx + 1) / 4
          : idx + 1;

    const realBalance =
      inflationRate > 0
        ? round2(nominalBalance / Math.pow(1 + inflationRate, yearsElapsed))
        : nominalBalance;

    series.push({
      index: idx,
      label,
      deposits: round2(deposits),
      interest: round2(interest),
      balance: nominalBalance,
      realBalance,
    });
  };

  // Keep your original “daily” branch for true day-by-day simulation.
  if (inputs.frequency === "daily") {
    const stepsPerYear = 365;
    const rDaily = apr / stepsPerYear;

    const stepsPerMonth = Math.max(1, Math.round(stepsPerYear / 12));
    const stepsPerQuarter = stepsPerMonth * 3;

    let chartIdx = 0;

    for (let year = 1; year <= years; year++) {
      let depositsYear = 0;
      let interestYear = 0;

      let depositsMonth = 0;
      let interestMonth = 0;

      let depositsQuarter = 0;
      let interestQuarter = 0;

      for (let k = 1; k <= stepsPerYear; k++) {
        const isMonthBoundary = k % stepsPerMonth === 0;
        const isQuarterBoundary = k % stepsPerQuarter === 0;
        const isYearEnd = k === stepsPerYear;

        if (!inputs.contributionsAtPeriodEnd) {
          if (k === 1 && annualContribution !== 0) {
            balance += annualContribution;
            depositsYear += annualContribution;
          }
          if (isMonthBoundary && monthlyContribution !== 0) {
            balance += monthlyContribution;
            depositsYear += monthlyContribution;
          }
        }

        const interestGross = balance * rDaily;
        const interestNet = interestGross * (1 - taxRate);
        balance += interestNet;

        interestYear += interestNet;
        totalInterest += interestNet;

        if (inputs.contributionsAtPeriodEnd) {
          if (isMonthBoundary && monthlyContribution !== 0) {
            balance += monthlyContribution;
            depositsYear += monthlyContribution;
          }
          if (isYearEnd && annualContribution !== 0) {
            balance += annualContribution;
            depositsYear += annualContribution;
          }
        }

        interestMonth += interestNet;
        interestQuarter += interestNet;

        if (isMonthBoundary && monthlyContribution !== 0) {
          depositsMonth += monthlyContribution;
          depositsQuarter += monthlyContribution;
        }

        if (inputs.chartPeriod === "monthly" && isMonthBoundary) {
          chartIdx += 1;
          pushPoint(chartIdx - 1, `M${chartIdx}`, depositsMonth, interestMonth);
          depositsMonth = 0;
          interestMonth = 0;
        }

        if (inputs.chartPeriod === "quarterly" && isQuarterBoundary) {
          const qIdx = (year - 1) * 4 + Math.round(k / stepsPerQuarter);
          pushPoint(qIdx - 1, `Q${qIdx}`, depositsQuarter, interestQuarter);
          depositsQuarter = 0;
          interestQuarter = 0;
        }

        if (inputs.chartPeriod === "yearly" && isYearEnd) {
          pushPoint(year - 1, `Y${year}`, depositsYear, interestYear);
        }
      }

      totalDepositsExInitial += depositsYear;

      annualContribution *= 1 + inputs.annualContributionGrowthPct / 100;
      monthlyContribution *= 1 + inputs.monthlyContributionGrowthPct / 100;
    }
  } else {
    // Everything else: simulate month-by-month using an equivalent monthly rate.
    const rMonthly = getMonthlyRateFromNominalAPR(apr, inputs.frequency);

    let idxMonth = 0;
    let idxQuarter = 0;

    for (let year = 1; year <= years; year++) {
      let depositsYear = 0;
      let interestYear = 0;

      let depositsQuarter = 0;
      let interestQuarter = 0;

      for (let m = 1; m <= 12; m++) {
        let depositsThisMonth = 0;
        let interestThisMonth = 0;

        if (!inputs.contributionsAtPeriodEnd) {
          if (m === 1 && annualContribution !== 0) {
            balance += annualContribution;
            depositsYear += annualContribution;
            depositsThisMonth += annualContribution;
          }
          if (monthlyContribution !== 0) {
            balance += monthlyContribution;
            depositsYear += monthlyContribution;
            depositsThisMonth += monthlyContribution;
          }
        }

        const interestGross = balance * rMonthly;
        const interestNet = interestGross * (1 - taxRate);
        balance += interestNet;

        interestYear += interestNet;
        interestThisMonth += interestNet;
        totalInterest += interestNet;

        if (inputs.contributionsAtPeriodEnd) {
          if (monthlyContribution !== 0) {
            balance += monthlyContribution;
            depositsYear += monthlyContribution;
            depositsThisMonth += monthlyContribution;
          }
          if (m === 12 && annualContribution !== 0) {
            balance += annualContribution;
            depositsYear += annualContribution;
            depositsThisMonth += annualContribution;
          }
        }

        depositsQuarter += depositsThisMonth;
        interestQuarter += interestThisMonth;

        if (inputs.chartPeriod === "monthly") {
          idxMonth += 1;
          pushPoint(
            idxMonth - 1,
            `M${idxMonth}`,
            depositsThisMonth,
            interestThisMonth,
          );
        }

        if (inputs.chartPeriod === "quarterly" && m % 3 === 0) {
          idxQuarter += 1;
          pushPoint(
            idxQuarter - 1,
            `Q${idxQuarter}`,
            depositsQuarter,
            interestQuarter,
          );
          depositsQuarter = 0;
          interestQuarter = 0;
        }

        if (inputs.chartPeriod === "yearly" && m === 12) {
          pushPoint(year - 1, `Y${year}`, depositsYear, interestYear);
        }
      }

      totalDepositsExInitial += depositsYear;

      annualContribution *= 1 + inputs.annualContributionGrowthPct / 100;
      monthlyContribution *= 1 + inputs.monthlyContributionGrowthPct / 100;
    }
  }

  const endBalance = round2(balance);
  const realEndBalance =
    inflationRate > 0
      ? round2(endBalance / Math.pow(1 + inflationRate, years))
      : endBalance;

  return {
    endBalance,
    realEndBalance,
    totalDepositsExInitial: round2(totalDepositsExInitial),
    totalInterest: round2(totalInterest),
    series,
  };
}
