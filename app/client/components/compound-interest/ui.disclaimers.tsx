export function DisclaimersSection() {
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <h2 className="text-lg font-black tracking-tight text-slate-900">
        Disclaimer
      </h2>

      <div className="mt-3 grid gap-3 text-sm leading-relaxed text-slate-700">
        <p>
          This tool is for informational and educational use only. It shows pure
          mathematical compounding based on your inputs and does not account for
          fees, taxes, inflation, minimum balance rules, or real-world posting
          schedules.
        </p>
        <p>
          Verify results with your financial institution or a qualified
          professional if you are making decisions based on interest
          calculations.
        </p>
      </div>
    </section>
  );
}
