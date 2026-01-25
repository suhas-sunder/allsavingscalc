import * as React from "react";
import type { CalcOutputs } from "./compound.logic";
import { toCurrency } from "./compound.logic";

export function ScheduleSection({
  scheduleView,
  setScheduleView,
  outputs,
}: {
  scheduleView: "yearly" | "monthly";
  setScheduleView: (v: "yearly" | "monthly") => void;
  outputs: CalcOutputs;
}) {
  const DESKTOP_PREVIEW_ROWS = 12;
  const [yearlyExpanded, setYearlyExpanded] = React.useState(false);
  const [monthlyExpanded, setMonthlyExpanded] = React.useState(false);

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-wide text-slate-700">
            Schedule
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Detailed breakdown by year or by month (adds contributions, then compounds).
          </div>
        </div>

        <div
          className="noPrint flex w-full flex-wrap gap-2 md:w-auto"
          role="group"
          aria-label="Schedule view"
        >
          <button
            type="button"
            onClick={() => setScheduleView("yearly")}
            aria-pressed={scheduleView === "yearly"}
            className={[
              "flex-1 rounded-xl border px-3 py-2 text-sm font-black shadow-sm transition md:flex-none",
              scheduleView === "yearly"
                ? "border-blue-600 bg-blue-600 text-white shadow-blue-600/20"
                : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
            ].join(" ")}
          >
            Yearly
          </button>
          <button
            type="button"
            onClick={() => setScheduleView("monthly")}
            aria-pressed={scheduleView === "monthly"}
            className={[
              "flex-1 rounded-xl border px-3 py-2 text-sm font-black shadow-sm transition md:flex-none",
              scheduleView === "monthly"
                ? "border-blue-600 bg-blue-600 text-white shadow-blue-600/20"
                : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
            ].join(" ")}
          >
            Monthly
          </button>
        </div>
      </div>

      {scheduleView === "yearly" ? (
        <>
          <div className="mt-4 sm:hidden">
            <YearlyScheduleCards rows={outputs.schedule} />
          </div>

          <div className="mt-4 hidden sm:block">
            <DesktopTableWithCap
              rows={outputs.schedule}
              previewCount={DESKTOP_PREVIEW_ROWS}
              expanded={yearlyExpanded}
              setExpanded={setYearlyExpanded}
              renderTable={(visible) => <YearlyScheduleTable rows={visible} />}
              labelSingular="year"
              labelPlural="years"
            />
          </div>
        </>
      ) : (
        <>
          <div className="mt-4 sm:hidden">
            <MonthlyScheduleCards rows={outputs.monthlySchedule} />
          </div>

          <div className="mt-4 hidden sm:block">
            <DesktopTableWithCap
              rows={outputs.monthlySchedule}
              previewCount={DESKTOP_PREVIEW_ROWS}
              expanded={monthlyExpanded}
              setExpanded={setMonthlyExpanded}
              renderTable={(visible) => <MonthlyScheduleTable rows={visible} />}
              labelSingular="row"
              labelPlural="rows"
            />
          </div>
        </>
      )}
    </div>
  );
}

function DesktopTableWithCap<T>({
  rows,
  previewCount,
  expanded,
  setExpanded,
  renderTable,
  labelSingular,
  labelPlural,
}: {
  rows: T[];
  previewCount: number;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  renderTable: (visible: T[]) => React.ReactNode;
  labelSingular: string;
  labelPlural: string;
}) {
  const total = rows.length;
  const showToggle = total > previewCount;
  const visible = expanded ? rows : rows.slice(0, previewCount);

  return (
    <div className="rounded-xl border border-slate-200">
      <div
        className={[
          "overflow-x-auto",
          expanded ? "max-h-[60vh] overflow-y-auto" : "",
        ].join(" ")}
      >
        <div className="p-2">{renderTable(visible)}</div>
      </div>

      {showToggle ? (
        <div className="noPrint border-t border-slate-200 p-2">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-900 shadow-sm transition hover:bg-slate-50"
          >
            {expanded
              ? `Show first ${previewCount} ${
                  previewCount === 1 ? labelSingular : labelPlural
                }`
              : `Show all ${total} ${total === 1 ? labelSingular : labelPlural}`}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function MobileCardRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <div className="text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="text-sm font-black tabular-nums text-slate-900">
        {value}
      </div>
    </div>
  );
}

function YearlyScheduleCards({
  rows,
}: {
  rows: {
    year: number;
    startingBalance: number;
    additions: number;
    interest: number;
    endingBalance: number;
  }[];
}) {
  return (
    <div className="rounded-xl border border-slate-200">
      <div className="max-h-[420px] overflow-y-auto p-2">
        <div className="mb-2 text-xs text-slate-500">
          Yearly rows are aggregates of the monthly simulation.
        </div>
        <div className="grid gap-2">
          {rows.map((r) => (
            <div
              key={r.year}
              className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
            >
              <MobileCardRow label="Year" value={r.year} />
              <div className="mt-2 grid gap-2">
                <MobileCardRow label="Starting" value={toCurrency(r.startingBalance)} />
                <MobileCardRow label="Additions" value={toCurrency(r.additions)} />
                <MobileCardRow label="Interest" value={toCurrency(r.interest)} />
                <MobileCardRow label="Ending" value={toCurrency(r.endingBalance)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MonthlyScheduleCards({
  rows,
}: {
  rows: {
    year: number;
    month: number;
    startingBalance: number;
    addition: number;
    interest: number;
    endingBalance: number;
  }[];
}) {
  return (
    <div className="rounded-xl border border-slate-200">
      <div className="max-h-[420px] overflow-y-auto p-2">
        <div className="mb-2 text-xs text-slate-500">
          Monthly rows use an equivalent monthly rate derived from your chosen compounding frequency.
        </div>
        <div className="grid gap-2">
          {rows.map((r, idx) => (
            <div
              key={`${r.year}-${r.month}-${idx}`}
              className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="text-sm font-black text-slate-900">
                  Year {r.year}, Month {r.month}
                </div>
              </div>
              <div className="mt-2 grid gap-2">
                <MobileCardRow label="Starting" value={toCurrency(r.startingBalance)} />
                <MobileCardRow label="Addition" value={toCurrency(r.addition)} />
                <MobileCardRow label="Interest" value={toCurrency(r.interest)} />
                <MobileCardRow label="Ending" value={toCurrency(r.endingBalance)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TableShell({
  children,
  caption,
}: {
  children: React.ReactNode;
  caption?: string;
}) {
  return (
    <table className="w-full min-w-[720px] border-collapse text-sm">
      {caption ? (
        <caption className="caption-bottom pt-2 text-left text-xs text-slate-500">
          {caption}
        </caption>
      ) : null}
      {children}
    </table>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={[
        "sticky top-0 z-10 border-b border-slate-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-700",
        align === "right" ? "text-right" : "text-left",
      ].join(" ")}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
  subtle,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  subtle?: boolean;
}) {
  return (
    <td
      className={[
        "border-b border-slate-100 px-3 py-2",
        align === "right" ? "text-right" : "text-left",
        subtle ? "text-slate-500" : "text-slate-900",
      ].join(" ")}
    >
      {children}
    </td>
  );
}

function YearlyScheduleTable({
  rows,
}: {
  rows: {
    year: number;
    startingBalance: number;
    additions: number;
    interest: number;
    endingBalance: number;
  }[];
}) {
  return (
    <TableShell caption="Yearly totals.">
      <thead>
        <tr>
          <Th>Year</Th>
          <Th align="right">Starting</Th>
          <Th align="right">Additions</Th>
          <Th align="right">Interest</Th>
          <Th align="right">Ending</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.year}>
            <Td subtle>{r.year}</Td>
            <Td align="right">{toCurrency(r.startingBalance)}</Td>
            <Td align="right">{toCurrency(r.additions)}</Td>
            <Td align="right">{toCurrency(r.interest)}</Td>
            <Td align="right">{toCurrency(r.endingBalance)}</Td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

function MonthlyScheduleTable({
  rows,
}: {
  rows: {
    year: number;
    month: number;
    startingBalance: number;
    addition: number;
    interest: number;
    endingBalance: number;
  }[];
}) {
  return (
    <TableShell caption="Monthly rows (12 per year).">
      <thead>
        <tr>
          <Th>Year</Th>
          <Th>Month</Th>
          <Th align="right">Starting</Th>
          <Th align="right">Addition</Th>
          <Th align="right">Interest</Th>
          <Th align="right">Ending</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, idx) => (
          <tr key={`${r.year}-${r.month}-${idx}`}>
            <Td subtle>{r.year}</Td>
            <Td subtle>{r.month}</Td>
            <Td align="right">{toCurrency(r.startingBalance)}</Td>
            <Td align="right">{toCurrency(r.addition)}</Td>
            <Td align="right">{toCurrency(r.interest)}</Td>
            <Td align="right">{toCurrency(r.endingBalance)}</Td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}
