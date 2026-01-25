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
  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-wide text-slate-700">
            Schedule
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Year-by-year and month-by-month breakdown (matches the contribution
            mode above).
          </div>
        </div>

        <div
          className="noPrint flex gap-2"
          role="group"
          aria-label="Schedule view"
        >
          <button
            type="button"
            onClick={() => setScheduleView("yearly")}
            aria-pressed={scheduleView === "yearly"}
            className={[
              "rounded-xl border px-3 py-2 text-sm font-black shadow-sm transition",
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
              "rounded-xl border px-3 py-2 text-sm font-black shadow-sm transition",
              scheduleView === "monthly"
                ? "border-blue-600 bg-blue-600 text-white shadow-blue-600/20"
                : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
            ].join(" ")}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        {scheduleView === "yearly" ? (
          <YearlyScheduleTable rows={outputs.schedule} />
        ) : (
          <MonthlyScheduleTable rows={outputs.monthlySchedule} />
        )}
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
  mono,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  mono?: boolean;
}) {
  return (
    <td
      className={[
        "border-b border-slate-100 px-3 py-2 text-slate-700",
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
