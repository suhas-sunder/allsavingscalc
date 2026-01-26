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
    a: "It includes optional regular additions (contributions). It does not model withdrawals, taxes, or inflation.",
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
  additions: number;
  interest: number;
  endingBalance: number;
};

export type MonthlyRow = {
  year: number;
  month: number;
  startingBalance: number;
  addition: number;
  interest: number;
  endingBalance: number;
};

export type HorizonUnit = "years" | "months";

export type ContributionTiming = "start" | "end";

export type ContributionGrowthFrequency = "annual" | "monthly";

export type CalcInputs = {
  initialInvestment: number;
  regularAddition: number; // applied each month
  annualInterestRatePct: number;
  frequency: Frequency;
  horizonUnit: HorizonUnit;
  horizonValue: number; // integer count in the selected unit

  // Advanced options (all optional; defaults preserve legacy behavior).
  // - contributionDelayMonths: skip regular additions for the first N months.
  // - contributionTiming: whether the monthly addition is applied before or after interest for that month.
  // - contributionGrowthAnnualPct: percentage increase applied to the monthly addition.
  // - contributionGrowthFrequency: whether growth is applied once per year or smoothly each month.
  contributionDelayMonths?: number;
  contributionTiming?: ContributionTiming;
  contributionGrowthAnnualPct?: number;
  contributionGrowthFrequency?: ContributionGrowthFrequency;
};

export type CalcOutputs = {
  endBalance: number;
  totalInterest: number;
  totalAdditions: number;
  totalContributions: number; // initial + additions
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

function toTotalMonths(unit: HorizonUnit, value: number) {
  const v = Math.max(0, Math.floor(Number(value) || 0));
  if (unit === "months") return v;
  return v * 12;
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
 * Compound growth with optional regular monthly additions.
 * Implementation detail:
 * - We simulate monthly using an equivalent monthly rate derived from the chosen frequency.
 * - Each month: apply the addition, then apply interest.
 * - Yearly rows are aggregates of the monthly simulation so the chart, schedule, and totals stay aligned.
 */
function computeCompoundGrowthLegacy(inputs: CalcInputs): CalcOutputs {
  const totalMonths = toTotalMonths(inputs.horizonUnit, inputs.horizonValue);
  const apr = (Number(inputs.annualInterestRatePct) || 0) / 100;

  const rMonthly = getMonthlyRateFromNominalAPR(apr, inputs.frequency);
  const effectiveAnnualRatePct =
    getEffectiveAnnualRate(apr, inputs.frequency) * 100;

  const initial = Number.isFinite(inputs.initialInvestment)
    ? inputs.initialInvestment
    : 0;
  const monthlyAddition = Number.isFinite(inputs.regularAddition)
    ? inputs.regularAddition
    : 0;

  let balance = initial;
  const principal = initial;

  let totalInterest = 0;
  let totalAdditions = 0;

  const schedule: YearlyRow[] = [];
  const monthlySchedule: MonthlyRow[] = [];

  let monthIndex = 0;
  const years = Math.ceil(totalMonths / 12);

  for (let year = 1; year <= years; year++) {
    const monthsThisYear = Math.min(12, totalMonths - monthIndex);
    if (monthsThisYear <= 0) break;

    const yearStartBalance = balance;
    let interestThisYear = 0;
    let additionsThisYear = 0;

    for (let month = 1; month <= monthsThisYear; month++) {
      const starting = balance;

      // Regular addition at the start of the month.
      const add = monthlyAddition;
      balance += add;
      additionsThisYear += add;
      totalAdditions += add;

      const interest = balance * rMonthly;
      balance += interest;

      interestThisYear += interest;
      totalInterest += interest;

      monthlySchedule.push({
        year,
        month,
        startingBalance: starting,
        addition: add,
        interest,
        endingBalance: balance,
      });

      monthIndex += 1;
    }

    schedule.push({
      year,
      startingBalance: yearStartBalance,
      additions: additionsThisYear,
      interest: interestThisYear,
      endingBalance: balance,
    });
  }

  const endBalance = balance;
  const totalInterestRaw = totalInterest;
  const totalAdditionsRaw = totalAdditions;
  const totalContributions = principal + totalAdditionsRaw;

  const growthMultiple = principal > 0 ? endBalance / principal : 0;

  return {
    endBalance,
    totalInterest: totalInterestRaw,
    totalAdditions: totalAdditionsRaw,
    totalContributions,
    growthMultiple,
    effectiveAnnualRatePct,
    schedule,
    monthlySchedule,
  };
}

/**
 * Compound growth with optional advanced contribution behaviors.
 *
 * IMPORTANT COMPATIBILITY RULE:
 * If advanced options are left at their defaults (delay 0, timing "start", growth 0),
 * this function must return outputs that are bit-for-bit identical to the legacy calculator.
 */
export function computeCompoundGrowth(inputs: CalcInputs): CalcOutputs {
  const delayMonths = Math.max(
    0,
    Math.floor(Number(inputs.contributionDelayMonths) || 0),
  );
  const timing: ContributionTiming =
    inputs.contributionTiming === "end" || inputs.contributionTiming === "start"
      ? inputs.contributionTiming
      : "start";
  const growthAnnualPct = Math.max(
    0,
    Number(inputs.contributionGrowthAnnualPct) || 0,
  );

  const growthFrequency: ContributionGrowthFrequency =
    inputs.contributionGrowthFrequency === "monthly" ||
    inputs.contributionGrowthFrequency === "annual"
      ? inputs.contributionGrowthFrequency
      : "annual";

  // Legacy fast-path: guarantees no regressions when advanced options are unused.
  if (delayMonths === 0 && timing === "start" && !(growthAnnualPct > 0)) {
    return computeCompoundGrowthLegacy(inputs);
  }

  const totalMonths = toTotalMonths(inputs.horizonUnit, inputs.horizonValue);
  const apr = (Number(inputs.annualInterestRatePct) || 0) / 100;

  const rMonthly = getMonthlyRateFromNominalAPR(apr, inputs.frequency);
  const effectiveAnnualRatePct =
    getEffectiveAnnualRate(apr, inputs.frequency) * 100;

  const initial = Number.isFinite(inputs.initialInvestment)
    ? inputs.initialInvestment
    : 0;
  const baseMonthlyAddition = Number.isFinite(inputs.regularAddition)
    ? inputs.regularAddition
    : 0;

  const growthFactorPerYear = 1 + growthAnnualPct / 100;

  let balance = initial;
  const principal = initial;

  let totalInterest = 0;
  let totalAdditions = 0;

  const schedule: YearlyRow[] = [];
  const monthlySchedule: MonthlyRow[] = [];

  let monthIndex = 0;
  const years = Math.ceil(totalMonths / 12);

  for (let year = 1; year <= years; year++) {
    const monthsThisYear = Math.min(12, totalMonths - monthIndex);
    if (monthsThisYear <= 0) break;

    const yearStartBalance = balance;
    let interestThisYear = 0;
    let additionsThisYear = 0;

    for (let month = 1; month <= monthsThisYear; month++) {
      const starting = balance;

      let grownMonthlyAddition = baseMonthlyAddition;
      if (growthAnnualPct > 0) {
        if (growthFrequency === "monthly") {
          // Smooth monthly growth derived from the annual percentage so that 12 months
          // of growth compounds to the same annual factor.
          // Equivalent: growthFactorPerYear^(monthIndex/12).
          grownMonthlyAddition =
            baseMonthlyAddition * Math.pow(growthFactorPerYear, monthIndex / 12);
        } else {
          // Annual growth applied once per year based on elapsed time from month 0.
          const yearIndex0 = Math.floor(monthIndex / 12);
          grownMonthlyAddition =
            baseMonthlyAddition *
            (yearIndex0 === 0 ? 1 : Math.pow(growthFactorPerYear, yearIndex0));
        }
      }

      const add = monthIndex < delayMonths ? 0 : grownMonthlyAddition;

      let interest = 0;

      if (timing === "start") {
        // Addition compounds for this month.
        balance += add;
        interest = balance * rMonthly;
        balance += interest;
      } else {
        // End-of-period addition does not compound for this month.
        interest = balance * rMonthly;
        balance += interest;
        balance += add;
      }

      additionsThisYear += add;
      totalAdditions += add;

      interestThisYear += interest;
      totalInterest += interest;

      monthlySchedule.push({
        year,
        month,
        startingBalance: starting,
        addition: add,
        interest,
        endingBalance: balance,
      });

      monthIndex += 1;
    }

    schedule.push({
      year,
      startingBalance: yearStartBalance,
      additions: additionsThisYear,
      interest: interestThisYear,
      endingBalance: balance,
    });
  }

  const endBalance = balance;
  const totalContributions = principal + totalAdditions;
  const growthMultiple = principal > 0 ? endBalance / principal : 0;

  return {
    endBalance,
    totalInterest,
    totalAdditions,
    totalContributions,
    growthMultiple,
    effectiveAnnualRatePct,
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
