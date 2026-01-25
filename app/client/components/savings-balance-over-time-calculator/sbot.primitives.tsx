import * as React from "react";

export function parseNumericInput(raw: string): number | null {
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

export function formatWithGrouping(n: number, maxFractionDigits: number) {
  const frac = Math.abs(n % 1);
  const hasFrac = frac > 0 && frac < 1;
  const digits = hasFrac ? maxFractionDigits : 0;

  return n.toLocaleString(undefined, {
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

export function formatPlain(n: number, maxFractionDigits: number) {
  const frac = Math.abs(n % 1);
  const hasFrac = frac > 0 && frac < 1;
  if (!hasFrac) return String(Math.trunc(n));
  return n.toLocaleString(undefined, {
    useGrouping: false,
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFractionDigits,
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
  min?: number;
  max?: number;
  maxFractionDigits: number;
  prefix?: string;
  suffix?: string;
  integer?: boolean;
}) {
  const [focused, setFocused] = React.useState(false);
  const [text, setText] = React.useState(() =>
    formatWithGrouping(value, maxFractionDigits),
  );

  React.useEffect(() => {
    if (focused) return;
    setText(formatWithGrouping(value, maxFractionDigits));
  }, [value, focused, maxFractionDigits]);

  const applyParsed = React.useCallback(
    (raw: string) => {
      const parsed = parseNumericInput(raw);
      if (parsed === null) return null;

      let n = parsed;
      if (integer) n = Math.trunc(n);

      if (typeof min === "number") n = Math.max(min, n);
      if (typeof max === "number") n = Math.min(max, n);

      setValue(n);
      return n;
    },
    [integer, max, min, setValue],
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="text-xs font-black text-slate-900">{label}</div>

      <div className="relative mt-2">
        {prefix && (
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-black text-slate-900 shadow-sm sm:text-xs">
            {prefix}
          </span>
        )}

        <input
          inputMode="decimal"
          type="text"
          value={text}
          onFocus={() => {
            setFocused(true);
            setText(formatPlain(value, maxFractionDigits));
          }}
          onBlur={() => {
            setFocused(false);
            const parsed = parseNumericInput(text);
            if (parsed === null) {
              setText(formatWithGrouping(value, maxFractionDigits));
              return;
            }
            const next = applyParsed(text);
            if (next === null) {
              setText(formatWithGrouping(value, maxFractionDigits));
              return;
            }
            setText(formatWithGrouping(next, maxFractionDigits));
          }}
          onChange={(e) => {
            const nextText = e.target.value;
            setText(nextText);

            const parsed = parseNumericInput(nextText);
            if (parsed === null) return;

            let n = parsed;
            if (integer) n = Math.trunc(n);
            if (typeof min === "number") n = Math.max(min, n);
            if (typeof max === "number") n = Math.min(max, n);
            setValue(n);
          }}
          aria-label={label}
          className={[
            "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-black text-slate-900 shadow-inner shadow-slate-900/5 sm:text-base",
            "outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100",
            prefix ? "pl-12 sm:pl-14" : "",
            suffix ? "pr-14 sm:pr-16" : "",
          ].join(" ")}
        />

        {suffix && (
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-black text-slate-900 shadow-sm sm:text-xs">
            {suffix}
          </span>
        )}
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
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="text-xs font-black text-slate-900">{label}</div>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value as T)}
        aria-label={label}
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-black text-slate-900 shadow-inner shadow-slate-900/5 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 sm:text-base"
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
