export function FAQSection({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <h2 className="text-lg font-black tracking-tight text-slate-900">FAQ</h2>

      <div id="faq" className="mt-4 grid gap-3">
        {faqs.map((f) => (
          <details
            key={f.q}
            className="rounded-xl border border-slate-200 bg-white p-3 open:shadow-sm"
          >
            <summary className="cursor-pointer list-none text-sm font-black text-slate-900">
              {f.q}
            </summary>
            <div className="mt-2 text-sm leading-relaxed text-slate-700">
              {f.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
