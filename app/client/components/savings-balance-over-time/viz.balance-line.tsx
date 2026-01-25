import * as React from "react";
import { toCurrency } from "./savings.logic";

export function BalanceLineChart({
  points,
  height = 260,
  stroke = "#16a34a",
  label,
}: {
  points: { xLabel: string; value: number }[];
  height?: number;
  stroke?: string;
  label: string;
}) {
  if (!points.length) return null;

  const MAX_POINTS = 180;

  const sampled = React.useMemo(() => {
    if (points.length <= MAX_POINTS) return { points, sampled: false };

    const out: { xLabel: string; value: number }[] = [];
    const step = (points.length - 1) / (MAX_POINTS - 1);

    for (let i = 0; i < MAX_POINTS; i++) {
      const idx = Math.round(i * step);
      out.push(points[idx]);
    }

    return { points: out, sampled: true };
  }, [points]);

  const P = sampled.points;
  const W = 760;
  const H = height;

  const padL = 56;
  const padR = 18;
  const padT = 16;
  const padB = 44;

  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const maxY = Math.max(...P.map((p) => p.value), 1);
  const minY = Math.min(...P.map((p) => p.value), 0);

  const y = (v: number) => {
    const span = Math.max(maxY - minY, 1e-9);
    const frac = (v - minY) / span;
    return padT + (1 - frac) * plotH;
  };

  const x = (i: number) => {
    if (P.length === 1) return padL + plotW / 2;
    return padL + (i / (P.length - 1)) * plotW;
  };

  const pathD = P.map((p, i) => {
    const xi = x(i);
    const yi = y(p.value);
    return `${i === 0 ? "M" : "L"} ${xi.toFixed(2)} ${yi.toFixed(2)}`;
  }).join(" ");

  const tickCount = 5;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const frac = i / tickCount;
    const value = minY + (maxY - minY) * frac;
    return { value, y: y(value) };
  });

  const fmtAxis = (n: number) => {
    if (n >= 1_000_000) return `$${Math.round(n / 1_000_000)}M`;
    if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
    return `$${Math.round(n)}`;
  };

  const firstLabel = P[0]?.xLabel ?? "";
  const lastLabel = P[P.length - 1]?.xLabel ?? "";

  return (
    <div className="w-full max-w-full overflow-x-auto">
      <svg
        className="block w-full max-w-none"
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        height={H}
        role="img"
        aria-label={label}
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

        <path d={pathD} fill="none" stroke={stroke} strokeWidth={3} />

        {P.map((p, i) => (
          <g key={`${p.xLabel}-${i}`}>
            <circle cx={x(i)} cy={y(p.value)} r={3} fill={stroke} />
            <title>{`${p.xLabel}: ${toCurrency(p.value)}`}</title>
          </g>
        ))}

        <text
          x={padL}
          y={H - 16}
          textAnchor="start"
          dominantBaseline="middle"
          fontSize={12}
          fill="#475569"
          fontWeight={800}
        >
          {firstLabel}
        </text>
        <text
          x={W - padR}
          y={H - 16}
          textAnchor="end"
          dominantBaseline="middle"
          fontSize={12}
          fill="#475569"
          fontWeight={800}
        >
          {lastLabel}
        </text>

        <text
          x={padL + plotW / 2}
          y={H - 6}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={12}
          fill="#334155"
          fontWeight={900}
        >
          Period
        </text>
      </svg>

      {sampled.sampled ? (
        <div className="mt-2 text-xs text-slate-500">
          Chart is sampled for readability. CSV export includes the full
          schedule.
        </div>
      ) : null}
    </div>
  );
}
