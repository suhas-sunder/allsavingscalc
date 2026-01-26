export function HeaderSection() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl font-black leading-[1.08] tracking-tight text-blue-950 sm:text-2xl">
        Savings Calculator
      </h1>
      <p className="text-xs leading-snug text-slate-600 sm:text-base">
        Compare annual vs monthly contributions, compounding, taxes, and inflation with a full schedule and charts.
      </p>
    </div>
  );
}
