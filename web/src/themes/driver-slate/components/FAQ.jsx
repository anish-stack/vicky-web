import { useState } from "react";
import { ChevronDown } from "lucide-react";

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
    <section id="faq" className="py-12 md:py-20 bg-sky-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="inline-flex px-4 py-2 rounded-full bg-white shadow-sm text-sky-700 text-xs font-extrabold uppercase tracking-widest">
            FAQs
          </span>
          <h2 className="mt-4 text-3xl md:text-5xl font-extrabold text-gray-900">
            Pit-Stop <span className="text-sky-600">Questions</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={`rounded-2xl bg-white transition-all ${
                  isOpen
                    ? "shadow-lg shadow-sky-200/60 border-l-4 border-amber-400"
                    : "shadow-sm border-l-4 border-transparent hover:border-sky-300"
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-2 text-left"
                >
                  <span className="font-extrabold text-gray-900 text-sm md:text-base">{f.q}</span>
                  <span
                    className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      isOpen ? "bg-sky-600 text-white rotate-180" : "bg-sky-100 text-sky-700"
                    }`}
                  >
                    <ChevronDown size={17} />
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 -mt-1">
                    <p className="text-gray-500 text-sm md:text-base leading-relaxed font-medium">{f.a}</p>
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
