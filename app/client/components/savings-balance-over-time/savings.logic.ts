export const COLORS = {
  border: "#d2d9ea",
  accentYellow: "#f59e0b",
  softBlue: "#dbeafe",
  softGreen: "#dcfce7",
  softYellow: "#fef3c7",
};

export const FAQS = [
  {
    q: "What does “balance over time” mean in this calculator?",
    a: "It is the projected ending balance at each period (month or year) based on your starting balance, contributions, interest, taxes on interest, and contribution timing.",
  },
  {
    q: "Why does the chart not match my bank statement exactly?",
    a: "Banks can apply day-count conventions, posting cutoffs, minimum balance rules, fees, and rounding that differ from a simple simulation. Use this as an estimate and confirm with your institution.",
  },
  {
    q: "Should I use monthly or yearly mode?",
    a: "Use monthly if you contribute every month and want a finer-grain timeline. Use yearly if you contribute once per year or want a simpler year-by-year view. The schedule and charts follow the selected mode.",
  },
  {
    q: "How are taxes on interest applied here?",
    a: "We apply your tax rate to each period’s interest as it is earned, then add the net interest to the balance. This approximates how taxable interest reduces growth over time.",
  },
  {
    q: "Can this model withdrawals or spending down savings?",
    a: "Yes. Enter a negative contribution to represent withdrawals. If withdrawals exceed growth, your balance can decrease over time.",
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

export type ScheduleRow = {
  year: number;
  deposit: number;
  interest: number;
  endingBalance: number;
};

export type MonthlyRow = {
  year: number;
  month: number;
  deposit: number;
  interest: number;
  endingBalance: number;
};

export type CalcInputs = {
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

export type CalcOutputs = {
  endBalance: number;
  totalContributions: number;
  totalContributionsExInitial: number;
  totalInterest: number;
  schedule: ScheduleRow[];
  monthlySchedule: MonthlyRow[];
  realEndBalance: number;
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

export function computeSavings(inputs: CalcInputs): CalcOutputs {
  const taxRate = clampNumber(inputs.taxRatePct / 100, 0, 1);
  const inflationRate = clampNumber(inputs.inflationRatePct / 100, 0, 10);
  const years = Math.max(0, Math.floor(inputs.years));

  let balance = Number.isFinite(inputs.initialDeposit)
    ? inputs.initialDeposit
    : 0;

  let totalContribExInitial = 0;
  let totalInterest = 0;

  const schedule: ScheduleRow[] = [];
  const monthlySchedule: MonthlyRow[] = [];

  let annualContribution = inputs.annualContribution;
  let monthlyContribution = inputs.monthlyContribution;

  const apr = inputs.annualInterestRatePct / 100;
  const rMonthly = getMonthlyRateFromNominalAPR(apr, inputs.frequency);

  for (let year = 1; year <= years; year++) {
    let depositsThisYear = 0;
    let interestThisYear = 0;

    for (let month = 1; month <= 12; month++) {
      let depositsThisMonth = 0;
      let interestThisMonth = 0;

      if (!inputs.contributionsAtPeriodEnd) {
        if (month === 1 && annualContribution !== 0) {
          balance += annualContribution;
          depositsThisMonth += annualContribution;
        }
        if (monthlyContribution !== 0) {
          balance += monthlyContribution;
          depositsThisMonth += monthlyContribution;
        }
      }

      const interestGross = balance * rMonthly;
      const interestNet = interestGross * (1 - taxRate);
      balance += interestNet;

      interestThisMonth += interestNet;
      totalInterest += interestNet;

      if (inputs.contributionsAtPeriodEnd) {
        if (monthlyContribution !== 0) {
          balance += monthlyContribution;
          depositsThisMonth += monthlyContribution;
        }
        if (month === 12 && annualContribution !== 0) {
          balance += annualContribution;
          depositsThisMonth += annualContribution;
        }
      }

      depositsThisYear += depositsThisMonth;
      interestThisYear += interestThisMonth;

      totalContribExInitial += depositsThisMonth;

      monthlySchedule.push({
        year,
        month,
        deposit: round2(depositsThisMonth),
        interest: round2(interestThisMonth),
        endingBalance: round2(balance),
      });
    }

    schedule.push({
      year,
      deposit: round2(depositsThisYear),
      interest: round2(interestThisYear),
      endingBalance: round2(balance),
    });

    annualContribution *= 1 + inputs.annualContributionGrowthPct / 100;
    monthlyContribution *= 1 + inputs.monthlyContributionGrowthPct / 100;
  }

  const endBalance = round2(balance);

  const realEndBalance =
    inflationRate > 0
      ? round2(endBalance / Math.pow(1 + inflationRate, years))
      : endBalance;

  return {
    endBalance,
    totalContributions: round2(inputs.initialDeposit + totalContribExInitial),
    totalContributionsExInitial: round2(totalContribExInitial),
    totalInterest: round2(totalInterest),
    schedule,
    monthlySchedule,
    realEndBalance,
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
