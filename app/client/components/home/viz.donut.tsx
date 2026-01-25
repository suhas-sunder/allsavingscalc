import * as React from "react";

export function DonutChart({
  parts,
  percents,
  className,
}: {
  parts: { label: string; value: number; color: string }[];
  percents: number[];
  className?: string;
}) {
  const total = parts.reduce((a, b) => a + b.value, 0);
  const r = 48;
  const stroke = 14;
  const c = 2 * Math.PI * r;

  let offset = 0;

  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label="Breakdown donut chart">
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth={stroke}
      />
      {parts.map((p, i) => {
        const pct = percents[i] ?? 0;
        const len = total > 0 ? (pct / 100) * c : 0;
        const dash = `${len} ${c - len}`;
        const dashOffset = -offset;
        offset += len;

        return (
          <circle
            key={p.label}
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={p.color}
            strokeWidth={stroke}
            strokeDasharray={dash}
            strokeDashoffset={dashOffset}
            strokeLinecap="butt"
            transform="rotate(-90 60 60)"
          />
        );
      })}

      <circle cx="60" cy="60" r={r - stroke / 2 - 8} fill="white" />

      <text
        x="60"
        y="57"
        textAnchor="middle"
        className="fill-slate-900"
        style={{ fontSize: 12, fontWeight: 900 }}
      >
        Total
      </text>
      <text
        x="60"
        y="74"
        textAnchor="middle"
        className="fill-slate-600"
        style={{ fontSize: 10, fontWeight: 800 }}
      >
        {total > 0 ? "100%" : "0%"}
      </text>
    </svg>
  );
}
