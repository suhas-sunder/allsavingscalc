import * as React from "react";

function parseNumericInput(raw: string): number | null {
  const s = raw
    .trim()
    .replace(/[,\s]/g, "")
    .replace(/[$£€¥₹]/g, "")
    .replace(/%/g, "");

  if (s === "" || s === "-" || s === "." || s === "-.") return null;
  if (!/^-?\d*\.?\d*$/.test(s)) return null;

  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return n;
}

function formatWithGrouping(n: number, maxFractionDigits: number) {
  const frac = Math.abs(n % 1);
  const hasFrac = frac > 0 && frac < 1;
  const digits = hasFrac ? maxFractionDigits : 0;

  return n.toLocaleString(undefined, {
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

export function LabeledNumber({
  label,
  value,
  setValue,
  min,
  max,
  maxFractionDigits,
  prefix,
  suffix,
  integer,
}: {
  label: string;
  value: number;
  setValue: (n: number) => void;
  min: number;
  max: number;
  maxFractionDigits: number;
  prefix?: string;
  suffix?: string;
  integer?: boolean;
}) {
  const [text, setText] = React.useState(() =>
    formatWithGrouping(Number(value) || 0, maxFractionDigits),
  );

  React.useEffect(() => {
    setText(formatWithGrouping(Number(value) || 0, maxFractionDigits));
  }, [value, maxFractionDigits]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="text-xs font-black uppercase tracking-wide text-slate-700">
        {label}
      </div>

      <div className="mt-2 flex items-center gap-2">
        {prefix ? (
          <span className="select-none text-sm font-black text-slate-500">
            {prefix}
          </span>
        ) : null}

        <input
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-900 outline-none focus:border-blue-600"
          inputMode="decimal"
          value={text}
          onChange={(e) => {
            const raw = e.target.value;
            setText(raw);

            const parsed = parseNumericInput(raw);
            if (parsed === null) return;

            const clamped = Math.max(min, Math.min(max, parsed));
            setValue(integer ? Math.trunc(clamped) : clamped);
          }}
          onBlur={() => {
            const parsed = parseNumericInput(text);
            const safe = parsed === null ? (Number(value) || 0) : parsed;
            const clamped = Math.max(min, Math.min(max, safe));
            setText(formatWithGrouping(integer ? Math.trunc(clamped) : clamped, maxFractionDigits));
            setValue(integer ? Math.trunc(clamped) : clamped);
          }}
          aria-label={label}
        />

        {suffix ? (
          <span className="select-none whitespace-nowrap text-xs font-black text-slate-500">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function LabeledSelect<T extends string>({
  label,
  value,
  setValue,
  options,
}: {
  label: string;
  value: T;
  setValue: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="text-xs font-black uppercase tracking-wide text-slate-700">
        {label}
      </div>
      <select
        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-900 outline-none focus:border-blue-600"
        value={value}
        onChange={(e) => setValue(e.target.value as T)}
        aria-label={label}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
