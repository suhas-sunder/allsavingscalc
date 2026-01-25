import * as React from "react";
import { toCurrency, type ScheduleRow } from "./savings.logic";

export function YearlyStackedBars({
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
  if (!years) return null;

  // Cumulative totals so year N shows the full build-up to that point.
  let contribCum = 0;
  let interestCum = 0;

  const points = schedule.map((row) => {
    contribCum += row.deposit;
    interestCum += row.interest;

    const principal = Math.max(initialDeposit, 0);
    const contrib = Math.max(contribCum, 0);
    const interest = Math.max(interestCum, 0);
    const total = Math.max(principal + contrib + interest, 0.000001);

    return { year: row.year, principal, contrib, interest, total };
  });

  const maxTotal = Math.max(...points.map((p) => p.total), 1);

  // Layout: pick a bar width that stays readable, and expand the SVG width as needed.
  const H = Math.max(160, Math.round(height));
  const padL = 56;
  const padR = 18;
  const padT = 16;
  const padB = 40;

  const barW = clampInt(Math.floor(520 / Math.max(1, years)), 12, 28);
  const gap = clampInt(Math.floor(barW * 0.35), 6, 14);

  const W = padL + padR + years * barW + (years > 1 ? (years - 1) * gap : 0);

  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

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
        className="block h-auto"
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Yearly stacked balances chart"
      >
        {/* Grid + y-axis tick labels */}
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

        {/* Clip each bar so the overall stack has rounded corners */}
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

        {/* Bars */}
        {points.map((p, idx) => {
          const x = padL + idx * (barW + gap);

          const principalH = h(p.principal);
          const contribH = h(p.contrib);
          const interestH = h(p.interest);

          const totalTopY = y(p.total);

          // Stack from bottom up: principal, contributions, interest
          const interestY = totalTopY;
          const contribY = totalTopY + interestH;
          const principalY = totalTopY + interestH + contribH;

          return (
            <g key={p.year}>
              <title>
                {`Year ${p.year}\nInitial deposit: ${toCurrency(
                  p.principal,
                )}\nContributions: ${toCurrency(p.contrib)}\nInterest: ${toCurrency(
                  p.interest,
                )}\nTotal: ${toCurrency(p.total)}`}
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

              {/* x-axis year label */}
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

        {/* x-axis label */}
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

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.trunc(n)));
}
