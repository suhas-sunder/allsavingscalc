export function HeaderSection() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl font-black leading-[1.08] tracking-tight text-blue-950 sm:text-2xl">
        Compound Interest Calculator
      </h1>
      <p className="max-w-3xl text-xs leading-snug text-slate-600 sm:text-base">
        Compound growth from an initial investment, with optional regular additions. No withdrawals, taxes, or inflation adjustments.
      </p>
    </div>
  );
}
