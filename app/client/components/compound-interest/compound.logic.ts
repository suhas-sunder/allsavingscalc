export const COLORS = {
  border: "#d2d9ea",
  accentYellow: "#f59e0b",
  softBlue: "#dbeafe",
  softGreen: "#dcfce7",
  softYellow: "#fef3c7",
};

export const COMPOUND_FAQS = [
  {
    q: "What is the difference between APR and APY?",
    a: "APR is the stated annual rate before compounding. APY (effective annual rate) includes the effect of compounding, so it is higher than APR when compounding happens more than once per year.",
  },
  {
    q: "Does this calculator include deposits, withdrawals, taxes, or inflation?",
    a: "No. This tool is math-first and models pure compounding on a starting principal only. If you need contributions, taxes, or inflation, use the Savings Calculator.",
  },
  {
    q: "Why does the monthly schedule show a smooth rate even for quarterly or semiannual compounding?",
    a: "We convert your chosen compounding frequency into an equivalent monthly growth rate so the monthly schedule and the yearly aggregation stay consistent and easy to read.",
  },
  {
    q: "What does “continuously” compounding mean here?",
    a: "Continuous compounding uses an exponential model where growth happens continuously instead of in discrete periods. APY is computed as e^APR − 1.",
  },
];

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

export type YearlyRow = {
  year: number;
  startingBalance: number;
  interest: number;
  endingBalance: number;
};

export type MonthlyRow = {
  year: number;
  month: number;
  startingBalance: number;
  interest: number;
  endingBalance: number;
};

export type CalcInputs = {
  principal: number;
  annualInterestRatePct: number;
  frequency: Frequency;
  years: number;
};

export type CalcOutputs = {
  endBalance: number;
  totalInterest: number;
  growthMultiple: number;
  effectiveAnnualRatePct: number;
  schedule: YearlyRow[];
  monthlySchedule: MonthlyRow[];
};

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

export function formatPercentLoose(pct: number) {
  const n = Number(pct) || 0;
  return n.toLocaleString(undefined, {
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
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

function getEffectiveAnnualRate(apr: number, freq: Frequency) {
  if (!Number.isFinite(apr)) return 0;

  const ppy = getPeriodsPerYear(freq);
  if (ppy === "continuous") return Math.exp(apr) - 1;

  if (ppy <= 0) return 0;
  return Math.pow(1 + apr / ppy, ppy) - 1;
}

/**
 * Pure compounding on a starting principal only.
 * Implementation detail:
 * - We simulate monthly using an equivalent monthly rate derived from the chosen frequency.
 * - Yearly rows are aggregates of the monthly simulation so the chart, schedule, and totals stay aligned.
 */
export function computeCompoundGrowth(inputs: CalcInputs): CalcOutputs {
  const years = Math.max(0, Math.floor(inputs.years));
  const apr = (Number(inputs.annualInterestRatePct) || 0) / 100;

  const rMonthly = getMonthlyRateFromNominalAPR(apr, inputs.frequency);
  const effectiveAnnualRatePct =
    getEffectiveAnnualRate(apr, inputs.frequency) * 100;

  let balance = Number.isFinite(inputs.principal) ? inputs.principal : 0;
  const principal = Number.isFinite(inputs.principal) ? inputs.principal : 0;

  let totalInterest = 0;

  const schedule: YearlyRow[] = [];
  const monthlySchedule: MonthlyRow[] = [];

  for (let year = 1; year <= years; year++) {
    let interestThisYear = 0;

    for (let month = 1; month <= 12; month++) {
      const starting = balance;

      const interest = balance * rMonthly;
      balance += interest;

      interestThisYear += interest;
      totalInterest += interest;

      monthlySchedule.push({
        year,
        month,
        startingBalance: round2(starting),
        interest: round2(interest),
        endingBalance: round2(balance),
      });
    }

    const yearStart =
      monthlySchedule.length >= 12
        ? monthlySchedule[monthlySchedule.length - 12].startingBalance
        : round2(principal);

    schedule.push({
      year,
      startingBalance: round2(yearStart),
      interest: round2(interestThisYear),
      endingBalance: round2(balance),
    });
  }

  const endBalance = round2(balance);
  const totalInterestRounded = round2(totalInterest);

  const growthMultiple =
    principal > 0 ? round2(endBalance / principal) : 0;

  return {
    endBalance,
    totalInterest: totalInterestRounded,
    growthMultiple,
    effectiveAnnualRatePct: round2(effectiveAnnualRatePct),
    schedule,
    monthlySchedule,
  };
}

export function computePercents(values: number[]) {
  const total = values.reduce((a, b) => a + b, 0);
  if (!(total > 0)) return values.map(() => 0);

  const raw = values.map((v) => (v / total) * 100);
  const floored = raw.map((r) => Math.floor(r));
  let remain = 100 - floored.reduce((a, b) => a + b, 0);

  const order = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac);

  const out = [...floored];
  for (let k = 0; k < order.length && remain > 0; k++) {
    out[order[k].i] += 1;
    remain -= 1;
  }

  return out;
}
