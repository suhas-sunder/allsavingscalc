import * as React from "react";
import type { CalcOutputs } from "./savings.logic";
import { toCurrency } from "./savings.logic";

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
  const yearlyTableId = React.useId();
  const monthlyTableId = React.useId();

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-wide text-sky-700">
            Schedule
          </div>
          <div className="mt-1 text-xs text-slate-800">
            Year-by-year and month-by-month breakdown (matches the contribution
            mode above).
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
                : "border-slate-200 bg-white text-sky-900 hover:bg-slate-50",
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
                : "border-slate-200 bg-white text-sky-900 hover:bg-slate-50",
            ].join(" ")}
          >
            Monthly
          </button>
        </div>
      </div>

      {scheduleView === "yearly" ? (
        <>
          {/* Mobile-friendly layout (prevents table from blowing out the viewport). */}
          <div className="mt-4 sm:hidden">
            <YearlyScheduleCards rows={outputs.schedule} />
          </div>

          {/* Desktop/tablet: cap at 12 rows by default. */}
          <div className="mt-4 hidden sm:block">
            <DesktopTableWithCap
              rows={outputs.schedule}
              previewCount={DESKTOP_PREVIEW_ROWS}
              expanded={yearlyExpanded}
              setExpanded={setYearlyExpanded}
              controlsId={yearlyTableId}
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
              controlsId={monthlyTableId}
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
  controlsId,
  renderTable,
  labelSingular,
  labelPlural,
}: {
  rows: T[];
  previewCount: number;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  controlsId: string;
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
        <div id={controlsId} className="p-2">
          {renderTable(visible)}
        </div>
      </div>

      {showToggle ? (
        <div className="noPrint border-t border-slate-200 p-2">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-controls={controlsId}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-sky-900 shadow-sm transition hover:bg-slate-50"
          >
            {expanded
              ? `Show first ${previewCount} ${
                  previewCount === 1 ? labelSingular : labelPlural
                }`
              : `Show all ${total} ${
                  total === 1 ? labelSingular : labelPlural
                }`}
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
      <div className="text-xs font-black uppercase tracking-wide text-slate-800">
        {label}
      </div>
      <div className="text-sm font-black tabular-nums text-sky-900">
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
    deposit: number;
    interest: number;
    endingBalance: number;
  }[];
}) {
  return (
    <div className="rounded-xl border border-slate-200">
      <div className="max-h-[420px] overflow-y-auto p-2">
        <div className="mb-2 text-xs text-slate-800">
          Yearly totals are aggregates of the underlying monthly simulation.
        </div>
        <div className="grid gap-2">
          {rows.map((r) => (
            <div
              key={r.year}
              className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
            >
              <MobileCardRow label="Year" value={r.year} />
              <div className="mt-2 grid gap-2">
                <MobileCardRow label="Deposit" value={toCurrency(r.deposit)} />
                <MobileCardRow
                  label="Interest"
                  value={toCurrency(r.interest)}
                />
                <MobileCardRow
                  label="Ending"
                  value={toCurrency(r.endingBalance)}
                />
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
    deposit: number;
    interest: number;
    endingBalance: number;
  }[];
}) {
  return (
    <div className="rounded-xl border border-slate-200">
      <div className="max-h-[420px] overflow-y-auto p-2">
        <div className="mb-2 text-xs text-slate-800">
          Monthly rows reflect contribution timing, tax on interest, and
          compounding converted to an effective monthly rate.
        </div>
        <div className="grid gap-2">
          {rows.map((r, idx) => (
            <div
              key={`${r.year}-${r.month}-${idx}`}
              className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="text-sm font-black text-sky-900">
                  Year {r.year}, Month {r.month}
                </div>
              </div>
              <div className="mt-2 grid gap-2">
                <MobileCardRow label="Deposit" value={toCurrency(r.deposit)} />
                <MobileCardRow
                  label="Interest"
                  value={toCurrency(r.interest)}
                />
                <MobileCardRow
                  label="Ending"
                  value={toCurrency(r.endingBalance)}
                />
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
        <caption className="caption-bottom pt-2 text-left text-xs text-slate-800">
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
        "sticky top-0 z-10 border-b border-slate-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-wide text-sky-700",
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
  mono,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  mono?: boolean;
}) {
  return (
    <td
      className={[
        "border-b border-slate-100 px-3 py-2 text-sky-700",
        align === "right" ? "text-right tabular-nums" : "text-left",
        mono ? "font-mono" : "",
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
    deposit: number;
    interest: number;
    endingBalance: number;
  }[];
}) {
  return (
    <TableShell caption="Yearly totals are aggregates of the underlying monthly simulation.">
      <thead>
        <tr>
          <Th>Year</Th>
          <Th align="right">Deposit</Th>
          <Th align="right">Interest</Th>
          <Th align="right">Ending balance</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.year} className="odd:bg-slate-50/60">
            <Td mono>{r.year}</Td>
            <Td align="right">{toCurrency(r.deposit)}</Td>
            <Td align="right">{toCurrency(r.interest)}</Td>
            <Td align="right" mono>
              {toCurrency(r.endingBalance)}
            </Td>
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
    deposit: number;
    interest: number;
    endingBalance: number;
  }[];
}) {
  return (
    <TableShell caption="Monthly rows reflect contribution timing, tax on interest, and compounding converted to an effective monthly rate.">
      <thead>
        <tr>
          <Th>Year</Th>
          <Th>Month</Th>
          <Th align="right">Deposit</Th>
          <Th align="right">Interest</Th>
          <Th align="right">Ending balance</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, idx) => (
          <tr
            key={`${r.year}-${r.month}-${idx}`}
            className="odd:bg-slate-50/60"
          >
            <Td mono>{r.year}</Td>
            <Td mono>{r.month}</Td>
            <Td align="right">{toCurrency(r.deposit)}</Td>
            <Td align="right">{toCurrency(r.interest)}</Td>
            <Td align="right" mono>
              {toCurrency(r.endingBalance)}
            </Td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}
