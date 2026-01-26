import * as React from "react";

export function FAQSection({ faqs }: { faqs: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <h2 className="text-lg font-black tracking-tight text-slate-900">FAQ</h2>

      <div id="faq" className="mt-4 grid gap-2">
        {faqs.map((f, idx) => {
          const isOpen = openIndex === idx;
          const btnId = `faq-q-${idx}`;
          const panelId = `faq-a-${idx}`;

          return (
            <div key={f.q} className="rounded-xl border border-slate-200 bg-slate-50">
              <button
                id={btnId}
                type="button"
                className="flex w-full cursor-pointer items-start justify-between gap-3 rounded-xl px-3 py-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex((cur) => (cur === idx ? null : idx))}
              >
                <span className="text-sm font-semibold text-slate-900">{f.q}</span>
                <span
                  aria-hidden="true"
                  className="mt-0.5 select-none text-sm font-black text-slate-500"
                >
                  {isOpen ? "−" : "+"}
                </span>
              </button>

              <div
                id={panelId}
                role="region"
                aria-labelledby={btnId}
                className={isOpen ? "px-3 pb-3" : "hidden"}
              >
                <p className="text-sm leading-relaxed text-slate-700">{f.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
