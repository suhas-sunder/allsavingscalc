import * as React from "react";

type Faq = { q: string; a: string };

function FaqItem({
  faq,
  isOpen,
  onToggle,
  idx,
}: {
  faq: Faq;
  isOpen: boolean;
  onToggle: () => void;
  idx: number;
}) {
  const contentId = `faq-panel-${idx}`;
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-start justify-between gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span className="text-sm font-black text-slate-900">{faq.q}</span>
        <span
          className="mt-0.5 shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-black text-slate-700"
          aria-hidden="true"
        >
          {isOpen ? "–" : "+"}
        </span>
      </button>

      <div
        id={contentId}
        className={isOpen ? "px-3 pb-3" : "hidden"}
        role="region"
        aria-label={faq.q}
      >
        <div className="text-sm leading-relaxed text-slate-700">{faq.a}</div>
      </div>
    </div>
  );
}

export function FAQSection({ faqs }: { faqs: Faq[] }) {
  const [openIdx, setOpenIdx] = React.useState<number | null>(null);

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <h2 className="text-lg font-black tracking-tight text-slate-900">FAQ</h2>

      <div id="faq" className="mt-4 grid gap-3">
        {faqs.map((f, i) => (
          <FaqItem
            key={f.q}
            faq={f}
            idx={i}
            isOpen={openIdx === i}
            onToggle={() => setOpenIdx((v) => (v === i ? null : i))}
          />
        ))}
      </div>
    </section>
  );
}
