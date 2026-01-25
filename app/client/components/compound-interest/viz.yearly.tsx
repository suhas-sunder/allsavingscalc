import * as React from "react";
import { toCurrency } from "./compound.logic";

type ScheduleRow = {
  year: number;
  startingBalance: number;
  interest: number;
  endingBalance: number;
};

export function YearlyStackedBars({
  schedule,
  principal,
  colors,
  height = 240,
  cornerRadius = 8,
}: {
  schedule: ScheduleRow[];
  principal: number;
  colors: { principal: string; interest: string };
  height?: number;
  cornerRadius?: number;
}) {
  const years = schedule.length;
  if (years === 0) return null;

  let interestCum = 0;

  const points = schedule.map((row) => {
    interestCum += row.interest;

    const p = Math.max(principal, 0);
    const interest = Math.max(interestCum, 0);
    const total = p + interest;

    return { year: row.year, principal: p, interest, total };
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

  const gap = Math.max(8, Math.round(plotW / (years * 10)));
  const barW = Math.max(14, Math.floor((plotW - gap * (years - 1)) / years));
  const r = Math.max(0, Math.min(cornerRadius, Math.floor(barW / 2)));

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
                <rect x={x} y={topY} width={barW} height={totalH} rx={r} ry={r} />
              </clipPath>
            );
          })}
        </defs>

        {points.map((p, idx) => {
          const x = padL + idx * (barW + gap);

          const principalH = h(p.principal);
          const interestH = h(p.interest);

          const totalTopY = y(p.total);

          const interestY = totalTopY;
          const principalY = totalTopY + interestH;

          return (
            <g key={p.year}>
              <title>
                {`Year ${p.year}\nPrincipal: ${toCurrency(p.principal)}\nInterest: ${toCurrency(
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
