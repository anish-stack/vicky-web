import { useState } from "react";
import { Plus, Minus, HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "What is included in the tour package price?",
    a: "Tour packages include toll tax, state tax, driver charges, driver food & stay, fuel and vehicle charges. Only parking charges are extra.",
  },
  {
    q: "What is a One Way Drop service?",
    a: "In a One Way Drop, you pay only for the pickup-to-drop journey — not for the cab's return. It is far more economical than a round trip for single-side travel.",
  },
  {
    q: "Which cars are available for booking?",
    a: "We offer Mini (WagonR), Sedan (Swift Dzire, Aura, Amaze), SUV (Ertiga) and Prime SUV (Innova Crysta) categories, all clean and AC-fitted.",
  },
  {
    q: "Are toll and state taxes included in the displayed fare?",
    a: "Yes — displayed one-way fares include toll tax and state tax. Only parking charges are payable extra.",
  },
  {
    q: "Can I cancel my booking?",
    a: "Yes, cancellation is possible before pickup time. Cancellation charges, if any, apply as per company policy.",
  },
  {
    q: "How do I book a cab?",
    a: "You can book instantly via the enquiry form on this website, or directly through Call / WhatsApp — available 24×7.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="py-12 md:py-20 bg-orange-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-orange-300 text-orange-700 text-xs font-black uppercase tracking-wide shadow-[3px_3px_0px_0px_rgba(251,146,60,0.5)]">
            <HelpCircle size={14} /> FAQs
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-black text-stone-900">
            Questions? <span className="text-orange-600">Sorted.</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={`rounded-2xl border-2 bg-white transition-all ${
                  isOpen
                    ? "border-orange-500 shadow-[5px_5px_0px_0px_rgba(234,88,12,0.8)]"
                    : "border-orange-200 hover:border-orange-400"
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-black text-stone-900 text-sm md:text-base">{f.q}</span>
                  <span
                    className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isOpen ? "bg-orange-600 border-orange-600 text-white" : "border-orange-300 text-orange-600"
                    }`}
                  >
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 -mt-1">
                    <p className="text-stone-600 text-sm md:text-base leading-relaxed font-medium">{f.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
