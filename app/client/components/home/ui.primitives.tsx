import * as React from "react";

const STRIP_CHARS_RE = /[\s,]/g;
const STRIP_CURRENCY_RE = /[$£€¥₹]/g;

function addGrouping(intPart: string) {
  const cleaned = intPart.replace(/^0+(?=\d)/, "");
  return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0";
}

/**
 * Parses a permissive numeric input string.
 * - Accepts commas, currency symbols, percent symbols, and whitespace.
 * - Returns null for "in progress" states like "-", ".", "-."
 */
export function parseNumericInput(raw: string): number | null {
  const s = raw
    .trim()
    .replace(STRIP_CHARS_RE, "")
    .replace(STRIP_CURRENCY_RE, "")
    .replace(/%/g, "");

  if (s === "" || s === "-" || s === "." || s === "-.") return null;
  if (!/^-?\d*\.?\d*$/.test(s)) return null;

  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return n;
}

/**
 * Inserts comma grouping in the integer part while preserving the user's
 * fractional digits exactly (no rounding).
 */
export function formatNumericStringPreserveFraction(
  raw: string,
  integer?: boolean,
) {
  const trimmed = raw.trim();
  if (trimmed === "" || trimmed === "-" || trimmed === "." || trimmed === "-.") {
    return raw;
  }

  let s = trimmed
    .replace(STRIP_CHARS_RE, "")
    .replace(STRIP_CURRENCY_RE, "")
    .replace(/%/g, "");

  if (!/^-?\d*\.?\d*$/.test(s)) return raw;

  const neg = s.startsWith("-");
  if (neg) s = s.slice(1);

  const parts = s.split(".");
  const intPart = parts[0] ?? "";
  const fracPart = parts.length > 1 ? parts[1] : undefined;

  const groupedInt = addGrouping(intPart === "" ? "0" : intPart);
  const sign = neg ? "-" : "";

  if (integer) return sign + groupedInt;

  if (fracPart === undefined || fracPart === "") return sign + groupedInt;

  return sign + groupedInt + "." + fracPart;
}

/**
 * Formats a number without forcing a fixed number of decimals.
 * Uses a high maxFractionDigits to avoid rounding away precision.
 */
export function formatNumberLoose(n: number) {
  const MAX = 12;
  return n.toLocaleString(undefined, {
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: MAX,
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
  const inputId = React.useId();

  const [text, setText] = React.useState(() => {
    const v = Number(value) || 0;
    return integer ? formatNumberLoose(Math.trunc(v)) : formatNumberLoose(v);
  });

  React.useEffect(() => {
    const v = Number(value) || 0;
    setText(integer ? formatNumberLoose(Math.trunc(v)) : formatNumberLoose(v));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, integer]);

  const hasPrefix = Boolean(prefix);
  const hasSuffix = Boolean(suffix);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <label
        htmlFor={inputId}
        className="text-xs font-black uppercase tracking-wide text-slate-700"
      >
        {label}
      </label>

      <div className="relative mt-2">
        {hasPrefix ? (
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-black text-slate-900 shadow-sm sm:text-xs">
            {prefix}
          </span>
        ) : null}

        {hasSuffix ? (
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-black text-slate-700 shadow-sm sm:text-xs">
            {suffix}
          </span>
        ) : null}

        <input
          id={inputId}
          className={[
            "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-black text-slate-900 shadow-inner shadow-slate-900/5",
            "outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 sm:text-base",
            hasPrefix ? "pl-12" : "",
            hasSuffix ? "pr-24" : "",
          ].join(" ")}
          inputMode={integer ? "numeric" : "decimal"}
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
            const final = integer ? Math.trunc(clamped) : clamped;

            const didClamp = final !== (integer ? Math.trunc(safe) : safe);

            if (!didClamp && parsed !== null) {
              setText(formatNumericStringPreserveFraction(text, integer));
            } else {
              setText(
                integer
                  ? formatNumberLoose(final)
                  : formatNumberLoose(final),
              );
            }

            setValue(final);
          }}
          aria-label={label}
        />
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
  const selectId = React.useId();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <label
        htmlFor={selectId}
        className="text-xs font-black uppercase tracking-wide text-slate-700"
      >
        {label}
      </label>
      <select
        id={selectId}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-900 shadow-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
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
