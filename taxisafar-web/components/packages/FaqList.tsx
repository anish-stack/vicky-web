import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FaqList({ faqs = [] }: { faqs: any[] }) {
  const [open, setOpen] = useState(-1);
  if (!faqs.length) return null;

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">Frequently Asked Questions (FAQs)</h2>

      <div className="mt-5 divide-y divide-line rounded-xl border border-line">
        {faqs.map((faq: any, i: number) => {
          const expanded = open === i;
          return (
            <div key={i}>
              <h3>
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? -1 : i)}
                  aria-expanded={expanded}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                >
                  <HelpCircle size={15} className="shrink-0 text-[#2563EB]" />
                  <span className="flex-1 text-sm">{faq.question}</span>
                  <ChevronDown
                    size={15}
                    className={`shrink-0 text-ink-faint transition-transform ${expanded ? "rotate-180" : ""}`}
                  />
                </button>
              </h3>
              {expanded ? <p className="px-4 pb-4 pl-12 text-xs leading-relaxed text-ink-muted">{faq.answer}</p> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
