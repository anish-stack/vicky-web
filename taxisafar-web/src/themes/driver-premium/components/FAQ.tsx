import React, { useState } from "react";
import { ChevronDown, ChevronUp, Circle as HelpCircle } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

type Props = {
  onEnquiry?: () => void;
};

const faqs = [
  {
    question: "How do I book a vehicle?",
    answer:
      "Use our enquiry form or message us directly on WhatsApp with your pickup, drop and dates. You'll get instant confirmation with driver and vehicle details.",
  },
  {
    question: "What are your rental rates?",
    answer:
      "Rates depend on vehicle class, distance, and duration. Use the booking form for an instant estimate — there are no hidden charges.",
  },
  {
    question: "Are your drivers verified?",
    answer:
      "Yes. Every driver is background-verified, licensed, and trained to premium service standards.",
  },
  {
    question: "Is the service available 24/7?",
    answer:
      "Yes, we operate round-the-clock — early airport pickups, late-night drops, or emergency transportation.",
  },
  {
    question: "What payment methods are accepted?",
    answer: "Cash, UPI, and most digital wallets. You can pay online or directly to the driver.",
  },
  {
    question: "Can I cancel or reschedule my booking?",
    answer:
      "Yes, free cancellation up to 30 minutes before pickup. Minimal charges may apply for late cancellations.",
  },
];

const FAQ: React.FC<Props> = ({ onEnquiry }) => {
  const { website } = useWebsite() as any;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const phone = website?.basicInfo?.phone || "9876543210";

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 md:py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-bold mb-4">
            <HelpCircle className="w-4 h-4" />
            Help &amp; Support
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Quick answers about bookings, pricing, and our premium fleet.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-orange-50/60 transition-colors duration-200"
              >
                <span className="font-semibold text-gray-900 pr-6">{faq.question}</span>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-orange-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {openIndex === index && (
                <div className="px-6 pb-5">
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-14">
          <div className="bg-orange-50 rounded-2xl p-8 border border-orange-100">
            <div className="bg-orange-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-7 h-7 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Still Need Help?</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Our team is available 24/7 to assist you with any questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onEnquiry}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-8 rounded-xl transition-all duration-200 shadow-lg"
              >
                Contact Support
              </button>
              <a
                href={`tel:+91${phone}`}
                className="border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white font-bold py-3.5 px-8 rounded-xl transition-all duration-200"
              >
                Call: +91 {phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
