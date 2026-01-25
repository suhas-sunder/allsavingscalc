import * as React from "react";

export function FAQSection({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <section className="mt-8">
      <div id="faq" className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 text-base font-black tracking-tight text-slate-900">
          FAQ
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {faqs.map((f, idx) => (
            <details key={f.q} className={idx === 0 ? "" : "border-t border-slate-200"}>
              <summary className="cursor-pointer px-4 py-4 text-sm font-semibold text-slate-900">
                {f.q}
              </summary>
              <div className="px-4 pb-4 text-sm leading-relaxed text-slate-600">
                {f.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
