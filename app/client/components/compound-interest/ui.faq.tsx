import * as React from "react";

export type FAQ = { q: string; a: string };

export function FAQSection({ faqs }: { faqs: FAQ[] }) {
  const items = React.useMemo(() => {
    return (faqs || []).filter(
      (f): f is FAQ => !!f && typeof f.q === "string" && typeof f.a === "string",
    );
  }, [faqs]);

  const [open, setOpen] = React.useState<Record<number, boolean>>({});

  if (items.length === 0) return null;

  return (
    <section
      id="faq"
      className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5"
    >
      <h2 className="text-lg font-black tracking-tight text-slate-900">FAQ</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Quick answers to common compound-interest questions. Tap a question to expand.
      </p>

      <div className="mt-4 grid gap-2">
        {items.map((f, idx) => {
          const isOpen = !!open[idx];
          return (
            <div
              key={idx}
              className="overflow-hidden rounded-xl border border-slate-200"
            >
              <button
                type="button"
                onClick={() => setOpen((p) => ({ ...p, [idx]: !p[idx] }))}
                className="flex w-full cursor-pointer items-start justify-between gap-3 bg-white px-3 py-3 text-left transition hover:bg-slate-50"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-black text-slate-900">{f.q}</span>
                <span
                  className={
                    "mt-0.5 select-none text-xs font-black text-slate-500 transition " +
                    (isOpen ? "rotate-180" : "")
                  }
                  aria-hidden="true"
                >
                  ▼
                </span>
              </button>

              {isOpen ? (
                <div className="bg-slate-50 px-3 py-3 text-sm leading-relaxed text-slate-700">
                  {f.a}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
