import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Circle as HelpCircle } from 'lucide-react';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How do I book a taxi with VickyCab?',
      answer: 'You can book a taxi through our website booking form, mobile app, or by calling us directly. Simply enter your pickup and destination, select your preferred time, and confirm your booking. You\'ll receive instant confirmation and driver details.'
    },
    {
      question: 'What are your fare rates and pricing structure?',
      answer: 'Our fares are transparent and competitive. Rates vary based on distance, time, and vehicle type. You can get an instant fare estimate using our booking form before confirming your ride. We don\'t have any hidden charges or surge pricing.'
    },
    {
      question: 'Are all your drivers verified and professional?',
      answer: 'Absolutely! All our drivers undergo thorough background verification, possess valid driving licenses, and complete professional training. We conduct regular performance reviews and maintain strict quality standards to ensure your safety and comfort.'
    },
    {
      question: 'Do you provide 24/7 taxi service?',
      answer: 'Yes, we operate round-the-clock, 365 days a year. Whether you need an early morning airport transfer, late-night ride home, or emergency transportation, our drivers are always available to serve you.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major payment methods including cash, credit/debit cards, UPI payments, digital wallets (Paytm, PhonePe, Google Pay), and net banking. You can choose your preferred payment method during booking or pay directly to the driver.'
    },
    {
      question: 'Can I cancel or modify my booking?',
      answer: 'Yes, you can cancel or modify your booking up to 30 minutes before the scheduled pickup time without any charges. For cancellations within 30 minutes of pickup time, minimal cancellation charges may apply as per our terms and conditions.'
    },
    {
      question: 'Do you offer outstation and tour packages?',
      answer: 'Yes, we provide comfortable outstation travel and customized tour packages to popular destinations. Our packages include professional drivers, well-maintained vehicles, and flexible itineraries. Contact us for custom tour planning and special rates.'
    },
    {
      question: 'How do I track my ride and driver location?',
      answer: 'Once your booking is confirmed, you\'ll receive driver details and can track your ride in real-time through our app or website. We also provide SMS updates with driver information and estimated arrival time for your convenience.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-gray-50 dark:bg-dark-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <HelpCircle className="w-4 h-4 mr-2" />
            Help & Support
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-dark-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-dark-600 dark:text-dark-300 max-w-2xl mx-auto">
            Find quick answers to common questions about our taxi services, booking process, and policies.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-dark-950 border border-gray-200 dark:border-dark-700 rounded-2xl overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors duration-200"
              >
                <span className="font-bold text-dark-900 dark:text-white text-lg pr-8">
                  {faq.question}
                </span>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronUp className="w-6 h-6 text-primary-600 dark:text-primary-500" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-dark-400 dark:text-dark-500" />
                  )}
                </div>
              </button>
              
              {openIndex === index && (
                <div className="px-8 pb-6">
                  <div className="border-t border-gray-200 dark:border-dark-700 pt-6">
                    <p className="text-dark-600 dark:text-dark-300 leading-relaxed text-lg">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="text-center mt-16">
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-8 border border-primary-200 dark:border-primary-800/50">
            <div className="bg-primary-100 dark:bg-primary-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8 text-primary-600 dark:text-primary-500" />
            </div>
            <h3 className="text-2xl font-bold text-dark-900 dark:text-white mb-3">
              Still Need Help?
            </h3>
            <p className="text-dark-600 dark:text-dark-300 mb-6 max-w-md mx-auto">
              Our customer support team is available 24/7 to assist you with any questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-soft hover:shadow-soft-lg">
                Contact Support
              </button>
              <a
                href="tel:+919999999999"
                className="border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-bold py-4 px-8 rounded-xl transition-all duration-200"
              >
                Call: +91 9999999999
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;