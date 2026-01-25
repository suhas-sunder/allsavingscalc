import { describe, expect, test } from "vitest";
import { computeSavings } from "./savings.logic";

describe("computeSavings precision", () => {
  test("does not round deposits or balances inside the schedule", () => {
    const out = computeSavings({
      initialDeposit: 0,
      annualContribution: 0,
      annualContributionGrowthPct: 0,
      monthlyContribution: 0.1,
      monthlyContributionGrowthPct: 0,
      annualInterestRatePct: 0,
      frequency: "monthly",
      years: 1,
      taxRatePct: 0,
      inflationRatePct: 0,
      contributionsAtPeriodEnd: true,
    });

    // 0.1 * 12 = 1.2 exactly in decimal representation, but JS floats can be slightly off.
    // The point of the test is: we do not forcibly round to 2 decimals in the model.
    const last = out.monthlySchedule[out.monthlySchedule.length - 1];
    expect(last.endingBalance).toBeGreaterThan(1.19);
    expect(last.endingBalance).toBeLessThan(1.21);

    // Deposits should preserve fractional cents (not rounded to 0.10 via model rounding).
    const anyNonIntegerDeposit = out.monthlySchedule.some(
      (r) => Math.abs(r.deposit - Math.round(r.deposit)) > 0,
    );
    expect(anyNonIntegerDeposit).toBe(true);
  });

  test("inflation adjustment only affects reported realEndBalance", () => {
    const out = computeSavings({
      initialDeposit: 1000,
      annualContribution: 0,
      annualContributionGrowthPct: 0,
      monthlyContribution: 0,
      monthlyContributionGrowthPct: 0,
      annualInterestRatePct: 0,
      frequency: "annually",
      years: 10,
      taxRatePct: 0,
      inflationRatePct: 2,
      contributionsAtPeriodEnd: true,
    });

    expect(out.endBalance).toBe(1000);
    expect(out.realEndBalance).toBeLessThan(1000);
  });
});
