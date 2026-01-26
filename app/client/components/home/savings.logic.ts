export const COLORS = {
  border: "#d2d9ea",
  accentYellow: "#f59e0b",
  softBlue: "#dbeafe",
  softGreen: "#dcfce7",
  softYellow: "#fef3c7",
};

export const FAQS = [
  {
    q: "Does this match what my bank will pay?",
    a: "It is a strong estimate for planning, but exact payouts can differ. Banks may use specific posting dates, day-count conventions, minimum balance rules, and rounding at different steps. If you need precision down to the penny, use your account’s stated interest method and statements as the source of truth.",
  },
  {
    q: "What compounding frequency should I pick?",
    a: "Pick the frequency your account actually uses (monthly, daily, continuous, and so on). More frequent compounding credits interest sooner, which can slightly increase the end balance at the same APR. If you are unsure, monthly is a common default for consumer savings products.",
  },
  {
    q: "How do tax on interest and inflation change the results?",
    a: "Tax reduces interest as it is earned: each period’s gross interest is multiplied by (1 − tax rate) before being added to the balance. Inflation adjustment does not change the nominal account value. It reports an additional inflation-adjusted end balance so you can compare purchasing power in today’s dollars.",
  },
  {
    q: "Can contributions be negative?",
    a: "Yes. A negative contribution represents a withdrawal. If withdrawals exceed the available balance in a period, the schedule will show the balance dropping accordingly. For planning, treat negative contributions as periodic cash needs coming out of savings.",
  },
  {
    q: "Why does switching annual vs monthly contributions change the result?",
    a: "It is mostly timing. Monthly contributions get added throughout the year, so more of your money starts earning interest earlier. Annual contributions land once per year. This calculator also applies contribution growth based on the selected cadence, so the pattern of deposits changes when you switch modes.",
  },
  {
    q: "What does “contributions at period end” mean?",
    a: "It controls deposit timing inside each period. At the beginning of the period, your deposit earns interest for the full period. At the end of the period, it earns interest starting next period. For monthly mode, the period is a month. For annual mode, it is the year-end deposit.",
  },
  {
    q: "Why can my schedule view show monthly rows even if I pick quarterly compounding?",
    a: "The schedule is displayed monthly or yearly for readability. Internally, the calculator converts your selected compounding frequency into an effective monthly rate so it can apply deposits, tax on interest, and timing rules consistently month by month.",
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
