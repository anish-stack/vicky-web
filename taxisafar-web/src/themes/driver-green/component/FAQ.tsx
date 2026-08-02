import React, { useState } from "react";
import {
  ChevronDown,
  Calendar,
  Tag,
  ShieldCheck,
  Clock,
  CreditCard,
  XCircle,
  Briefcase,
  Headphones,
  MessageCircle,
  Phone,
  HelpCircle,
} from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

type Props = {
  onEnquiry?: () => void;
};

const faqs = [
  {
    icon: Calendar,
    question: "How do I book a taxi?",
    answer:
      "Book through our website enquiry form or message us on WhatsApp. Enter pickup & destination, pick a time, get instant confirmation with driver details.",
  },
  {
    icon: Tag,
    question: "What are your fare rates and pricing structure?",
    answer:
      "Fares are transparent and based on distance, time and vehicle type. Get an instant estimate on our booking form before confirming — no hidden charges.",
  },
  {
    icon: ShieldCheck,
    question: "Are all your drivers verified and professional?",
    answer:
      "Yes. Every driver is background-verified, holds a valid license, and follows strict safety and cleanliness standards.",
  },
  {
    icon: Clock,
    question: "Do you provide 24/7 taxi service?",
    answer:
      "Yes, we operate round-the-clock, 365 days a year — early airport transfers, late-night rides or emergency trips.",
  },
  {
    icon: CreditCard,
    question: "What payment methods do you accept?",
    answer:
      "We accept cash, UPI and most digital wallets. Choose your preferred method while booking or pay the driver directly.",
  },
  {
    icon: XCircle,
    question: "Can I cancel or modify my booking?",
    answer:
      "You can cancel or modify free up to 30 minutes before pickup. Small charges may apply within 30 minutes of pickup.",
  },
  {
    icon: Briefcase,
    question: "Do you offer outstation and tour packages?",
    answer:
      "Yes, we offer comfortable outstation travel and custom tour packages with professional drivers and flexible itineraries.",
  },
];

const FAQ: React.FC<Props> = ({ onEnquiry }) => {
  const { website } = useWebsite();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const phone = website?.basicInfo?.phone || "9876543210";

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-14 md:py-20 bg-white relative overflow-hidden">
      {/* decorative dots */}
      <div className="hidden sm:grid absolute top-8 right-8 grid-cols-6 gap-1.5 opacity-30">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="w-1 h-1 rounded-full bg-emerald-300" />
        ))}
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3.5 py-1.5 rounded-full text-xs font-bold mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            We're Here to Help
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Frequently Asked <span className="text-emerald-600">Questions</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
            Find quick answers to common questions about our taxi services, booking
            process, and policies.
          </p>
        </div>

        {/* FAQ list */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const Icon = faq.icon;
            return (
              <div
                key={index}
                className={`rounded-xl border transition-all duration-200 ${
                  isOpen
                    ? "border-emerald-200 bg-white shadow-md shadow-emerald-100/60"
                    : "border-gray-100 bg-gray-50/70 hover:border-emerald-100 hover:bg-white hover:shadow-sm"
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-4 sm:px-5 py-3.5 flex items-center gap-3 text-left"
                >
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${
                      isOpen ? "bg-emerald-600" : "bg-emerald-100"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isOpen ? "text-white" : "text-emerald-600"}`} />
                  </span>
                  <span className="flex-1 font-semibold text-gray-900 text-[13.5px] sm:text-sm">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 text-emerald-600 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-200 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-4 sm:px-5 pb-4 pl-[52px] sm:pl-[56px] text-[13px] sm:text-sm text-gray-500 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Support CTA */}
        <div className="mt-10 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 sm:p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-600/25">
            <Headphones className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5">Still Need Help?</h3>
          <p className="text-[13px] sm:text-sm text-gray-500 mb-5 max-w-sm mx-auto">
            Our team is available 24/7 to assist you with any questions or concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onEnquiry}
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2.5 px-6 rounded-full transition-colors duration-200 shadow-md shadow-emerald-600/20"
            >
              <MessageCircle className="w-4 h-4" />
              Contact Support
            </button>
              <a
              href={`tel:+91${phone}`}
              className="inline-flex items-center justify-center gap-2 border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white text-sm font-bold py-2.5 px-6 rounded-full transition-colors duration-200"
            >
              <Phone className="w-4 h-4" />
              Call: +91 {phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;