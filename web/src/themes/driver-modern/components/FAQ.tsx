"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  /* ================= FAQ DATA ================= */

  const faqSections = [
    {
      title: "Tour Package – Frequently Asked Questions",
      color: "bg-red-600",
      items: [
        {
          q: "Tour package mein kya-kya include hota hai?",
          a: [
            "Tour package mein toll tax, state tax, driver charge, driver food, driver stay, fuel aur vehicle charges include hote hain.",
            "Sirf parking charge extra hota hai.",
          ],
        },
        {
          q: "Tour package minimum kitne din ka hota hai?",
          a: ["Tour package minimum 1 day ke liye available hota hai."],
        },
        {
          q: "Kya tour package mein hotel booking included hoti hai?",
          a: [
            "Nahi, hotel booking included nahi hoti jab tak mention na ho.",
          ],
        },
        {
          q: "Extra charges kab lagte hain?",
          a: [
            "Package se extra places visit karne par.",
            "Extra kilometer & extra time charge lagta hai.",
          ],
        },
        {
          q: "Kya tour package cancel kar sakte hain?",
          a: [
            "Pickup se pehle cancellation possible hoti hai.",
            "Charges policy ke according lagte hain.",
          ],
        },
        {
          q: "Tour package ke liye kaun-kaun si car available hoti hai?",
          a: [
            "Mini, Sedan, SUV aur Prime SUV cars available hoti hain.",
            "Jaise WagonR, Dzire, Ertiga, Innova Crysta etc.",
          ],
        },
      ],
    },

    {
      title: "One Way Drop – Frequently Asked Questions",
      color: "bg-gray-900",
      items: [
        {
          q: "One Way Drop service kya hoti hai?",
          a: [
            "Pickup se drop tak ka hi charge dena hota hai.",
          ],
        },
        {
          q: "One Way Drop round trip se sasta hota hai?",
          a: [
            "Haan, yeh round trip se zyada economical hota hai.",
          ],
        },
        {
          q: "Rate mein kya include hota hai?",
          a: [
            "Toll tax & state tax included hote hain.",
            "Parking extra hoti hai.",
          ],
        },
        {
          q: "Booking kaise karein?",
          a: [
            "Website, call ya WhatsApp se booking kar sakte hain.",
          ],
        },
        {
          q: "Advance payment deni hoti hai?",
          a: [
            "Kuch routes par advance required hoti hai.",
          ],
        },
        {
          q: "Kaun-kaun si car available hoti hai?",
          a: [
            "Mini, Sedan, SUV aur Prime SUV cars available hoti hain.",
          ],
        },
      ],
    },
  ];

  /* ================= TOGGLE ================= */

  const toggleFAQ = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  /* ================= UI ================= */

  return (
    <section className="py-8 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4">

        {/* HEADER */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            Need Help?
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold mb-2">
            Frequently Asked Questions
          </h2>

          <p className="text-l text-gray-600">
            Find answers to common taxi & travel queries.
          </p>
        </div>

        {/* SECTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-center">
          {faqSections.map((section, sIndex) => (
            <div
              key={sIndex}
              className="bg-white w-[48%] dark:bg-gray-900 rounded-2xl shadow-lg border overflow-hidden"
            >
              {/* Section Header */}
              <div
                className={`${section.color} text-white px-6 py-3 font-semibold`}
              >
                {section.title}
              </div>

              {/* FAQ List */}
              <div className="divide-y">
                {section.items.map((faq, index) => {
                  const id = `${sIndex}-${index}`;
                  const isOpen = openIndex === id;

                  return (
                    <div key={id}>
                      <button
                        onClick={() => toggleFAQ(id)}
                        className="w-full px-6 py-2.8 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                      >
                        <span className="font-medium py-2.5">
                          {faq.q}
                        </span>

                        {isOpen ? (
                          <Minus className="text-yellow-500" />
                        ) : (
                          <Plus className="text-gray-400" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="px-6 pb-2 border-t pt-2 text-gray-600 dark:text-gray-400 space-y-0">
                          {faq.a.map((line, i) => (
                            <p key={i}>{line}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-8 rounded-2xl border">
            <h3 className="text-xl font-semibold mb-3">
              Still have questions?
            </h3>

            <p className="text-gray-600 mb-6">
              Contact our support team anytime.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-yellow-500 hover:bg-yellow-600 text-black py-3 px-8 rounded-xl font-semibold">
                Contact Support
              </button>

              <button className="border-2 py-3 px-8 rounded-xl font-semibold">
                Call Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
