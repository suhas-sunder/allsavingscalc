import * as React from "react";
import type { SeriesPoint } from "./sbot.logic";
import { toCurrency } from "./sbot.logic";
import { COLORS } from "./sbot.logic";

export function LineChart({
  points,
  height = 280,
  showReal = false,
}: {
  points: SeriesPoint[];
  height?: number;
  showReal?: boolean;
}) {
  if (!points.length) return null;

  const W = 900;
  const H = height;
  const padL = 64;
  const padR = 18;
  const padT = 18;
  const padB = 54;

  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const values = points.map((p) => (showReal ? p.realBalance : p.balance));
  const maxV = Math.max(...values, 1);
  const minV = Math.min(...values, 0);

  const x = (i: number) => padL + (i / Math.max(1, points.length - 1)) * plotW;
  const y = (v: number) => {
    const denom = maxV - minV || 1;
    return padT + (1 - (v - minV) / denom) * plotH;
  };

  const path = points
    .map((p, i) => {
      const v = showReal ? p.realBalance : p.balance;
      return `${i === 0 ? "M" : "L"} ${x(i)} ${y(v)}`;
    })
    .join(" ");

  const tickCount = 5;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const frac = i / tickCount;
    const value = minV + (maxV - minV) * frac;
    return { value, y: y(value) };
  });

  const fmtAxis = (n: number) => {
    const abs = Math.abs(n);
    if (abs >= 1_000_000) return `$${Math.round(n / 1_000_000)}M`;
    if (abs >= 1_000) return `$${Math.round(n / 1_000)}K`;
    return `$${Math.round(n)}`;
  };

  const [selectedIdx, setSelectedIdx] = React.useState(() =>
    Math.max(0, Math.floor(points.length * 0.75)),
  );

  React.useEffect(() => {
    setSelectedIdx(Math.max(0, Math.floor(points.length * 0.75)));
  }, [points.length, showReal]);

  const draggingRef = React.useRef(false);

  const clampIdx = (i: number) => Math.max(0, Math.min(points.length - 1, i));

  const selected = points[clampIdx(selectedIdx)];
  const selectedBalance = showReal ? selected.realBalance : selected.balance;

  const pickIndexFromClientX = (evt: React.PointerEvent<SVGSVGElement>): number => {
    const svg = evt.currentTarget;
    const rect = svg.getBoundingClientRect();
    const px = evt.clientX - rect.left;
    const viewX = (px / rect.width) * W;

    const clampedX = Math.max(padL, Math.min(W - padR, viewX));
    const frac = (clampedX - padL) / plotW;
    const idx = Math.round(frac * (points.length - 1));
    return clampIdx(idx);
  };

  const endDrag = (e: React.PointerEvent<SVGSVGElement>) => {
    draggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <div className="w-full max-w-full overflow-x-auto">
      <svg
        className="block w-full max-w-none select-none touch-none"
        width="100%"
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Balance over time line chart"
        onPointerDown={(e) => {
          e.preventDefault();
          draggingRef.current = true;
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {}
          setSelectedIdx(pickIndexFromClientX(e));
        }}
        onPointerMove={(e) => {
          if (!draggingRef.current) return;
          setSelectedIdx(pickIndexFromClientX(e));
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={(e) => {
          if (!draggingRef.current) return;
          endDrag(e);
        }}
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
              x={padL - 10}
              y={t.y}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={12}
              fill={COLORS.muted}
              fontWeight={800}
            >
              {fmtAxis(t.value)}
            </text>
          </g>
        ))}

        <path
          d={path}
          fill="none"
          stroke="#2563eb"
          strokeWidth={4}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        <line
          x1={x(clampIdx(selectedIdx))}
          x2={x(clampIdx(selectedIdx))}
          y1={padT}
          y2={padT + plotH}
          stroke="#cbd5e1"
          strokeWidth={1}
          strokeDasharray="4 4"
        />

        {points.map((p, i) => {
          const v = showReal ? p.realBalance : p.balance;
          const isSel = i === clampIdx(selectedIdx);
          return (
            <g key={i}>
              {isSel && (
                <circle
                  cx={x(i)}
                  cy={y(v)}
                  r={10}
                  fill={COLORS.softBlue}
                  opacity={0.85}
                />
              )}
              <circle
                cx={x(i)}
                cy={y(v)}
                r={isSel ? 4.8 : 3.5}
                fill="#0f172a"
              />
            </g>
          );
        })}

        <text
          x={padL + plotW / 2}
          y={H - 12}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={12}
          fill={COLORS.text}
          fontWeight={900}
        >
          Period
        </text>

        {points.length > 1 && (
          <>
            <text
              x={padL}
              y={H - 30}
              textAnchor="start"
              dominantBaseline="middle"
              fontSize={11}
              fill={COLORS.muted}
              fontWeight={800}
            >
              {points[0].label}
            </text>
            <text
              x={W - padR}
              y={H - 30}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={11}
              fill={COLORS.muted}
              fontWeight={800}
            >
              {points[points.length - 1].label}
            </text>
          </>
        )}
      </svg>

      <div className="noPrint mt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-black uppercase tracking-wide text-slate-700">
            Selected
          </div>
          <div className="text-xs font-semibold text-slate-600">{selected.label}</div>
        </div>

        <input
          type="range"
          min={0}
          max={Math.max(0, points.length - 1)}
          step={1}
          value={clampIdx(selectedIdx)}
          onChange={(e) => setSelectedIdx(Number(e.target.value))}
          aria-label="Select chart period"
          className="mt-2 w-full"
        />

        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="text-sm font-black text-slate-900">
            {selected.label} snapshot
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="text-[11px] font-black uppercase tracking-wide text-slate-700">
                Balance
              </div>
              <div className="mt-1 text-lg font-black text-blue-950">
                {toCurrency(selectedBalance)}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="text-[11px] font-black uppercase tracking-wide text-slate-700">
                Deposits
              </div>
              <div className="mt-1 text-lg font-black text-slate-900">
                {toCurrency(selected.deposits)}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="text-[11px] font-black uppercase tracking-wide text-slate-700">
                Interest
              </div>
              <div className="mt-1 text-lg font-black text-slate-900">
                {toCurrency(selected.interest)}
              </div>
            </div>
          </div>
          <div className="mt-2 text-xs font-semibold leading-relaxed text-amber-700">
            Tap the chart or drag the slider to inspect any period.
          </div>
        </div>
      </div>
    </div>
  );
}
