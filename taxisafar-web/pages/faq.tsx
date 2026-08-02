import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/ui/Seo";
import { fetchServer } from "@/lib/api";
import { faqJsonLd } from "@/lib/seo";

export default function FaqPage({ faqs, bootstrap }: any) {
  const [open, setOpen] = useState(0);

  return (
    <Layout settings={bootstrap?.settings}>
      <Seo
        title="Frequently Asked Questions | TaxiSafar"
        description="Answers about booking, pricing, tolls and state taxes, cancellations and driver details."
        jsonLd={faqs?.length ? faqJsonLd(faqs) : undefined}
      />

      <div className="container max-w-2xl py-14">
        <h1 className="text-3xl">Frequently asked questions</h1>

        <div className="mt-8 divide-y divide-line rounded-xl border border-line">
          {(faqs || []).map((faq: any, i: number) => {
            const expanded = open === i;
            return (
              <div key={faq.id || i}>
                <h2>
                  <button
                    onClick={() => setOpen(expanded ? -1 : i)}
                    aria-expanded={expanded}
                    className="flex w-full items-center gap-3 px-5 py-4 text-left"
                  >
                    <span className="flex-1 text-sm font-medium">{faq.question}</span>
                    <ChevronDown size={16} className={`shrink-0 text-ink-faint ${expanded ? "rotate-180" : ""}`} />
                  </button>
                </h2>
                {expanded ? <p className="px-5 pb-5 text-sm leading-relaxed text-ink-muted">{faq.answer}</p> : null}
              </div>
            );
          })}
          {!faqs?.length ? <p className="p-6 text-sm text-ink-muted">No questions published yet.</p> : null}
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  const [faqs, bootstrap] = await Promise.all([fetchServer("/faqs", []), fetchServer("/bootstrap", {})]);
  return { props: { faqs, bootstrap }, revalidate: 600 };
}
