import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

export default function FAQTEMP() {
  const [openTour, setOpenTour] = useState(null);
  const [openOneWay, setOpenOneWay] = useState(null);
  return (
    <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-3">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Frequently Asked <span className="text-red-600">Questions</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* TOUR PACKAGE */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-red-600 text-white px-6 py-4 text-lg font-semibold">
              Tour Package – Frequently Asked Questions (FAQs)
            </div>

            <div className="divide-y">
              {[
                {
                  q: "Q1. Tour package mein kya-kya include hota hai?",
                  a: [
                    "👉 Tour package mein toll tax, state tax, driver charge, driver food, driver stay, fuel aur vehicle charges include hote hain.",
                    "👉 Sirf parking charge extra hota hai.",
                  ],
                },
                {
                  q: "Q2. Tour package minimum kitne din ka hota hai?",
                  a: [
                    "👉 Tour package minimum 1 day ke liye available hota hai.",
                  ],
                },
                {
                  q: "Q3. Kya tour package mein hotel booking included hoti hai?",
                  a: [
                    "👉 Nahi, hotel booking included nahi hoti, jab tak clearly mention na ho.",
                  ],
                },
                {
                  q: "Q4. Extra charges kab lagte hain?",
                  a: [
                    "👉 Jab aap package se extra places visit karte hain.",
                    "👉 Jo places package mein mention nahi hoti, unko visit karne par extra kilometer aur extra time charge lagta hai.",
                  ],
                },
                {
                  q: "Q5. Kya tour package cancel kar sakte hain?",
                  a: [
                    "👉 Haan, pickup time se pehle cancellation possible hoti hai.",
                    "👉 Cancellation charges company policy ke according apply hote hain.",
                  ],
                },
                {
                  q: "Q6. Tour package ke liye kaun-kaun si car available hoti hai?",
                  a: [
                    "👉 Mini, Sedan, SUV aur Prime SUV category ki cars available hoti hain.",
                    "👉 Jaise: WagonR, Swift Dzire, Hyundai Aura, Honda Amaze, Etios, Maruti Ertiga, Toyota Innova Crysta aur similar taxis.",
                  ],
                },
              ].map((item, i) => (
                <div key={i} className="px-6 py-4">
                  <button
                    onClick={() => setOpenTour(openTour === i ? null : i)}
                    className="w-full flex justify-between items-center text-left font-medium text-gray-900"
                  >
                    {item.q}
                    {openTour === i ? (
                      <Minus className="text-red-600" />
                    ) : (
                      <Plus className="text-gray-400" />
                    )}
                  </button>

                  {openTour === i && (
                    <div className="mt-3 space-y-2 text-gray-700">
                      {item.a.map((line, idx) => (
                        <p key={idx}>{line}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ONE WAY DROP */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-900 text-white px-6 py-4 text-lg font-semibold">
              One Way Drop – Frequently Asked Questions (FAQs)
            </div>

            <div className="divide-y">
              {[
                {
                  q: "Q1. One Way Drop service kya hoti hai?",
                  a: [
                    "👉 One Way Drop mein aapko sirf pickup se drop location tak ka hi charge dena hota hai.",
                  ],
                },
                {
                  q: "Q2. One Way Drop round trip se sasta hota hai kya?",
                  a: [
                    "👉 Haan, One Way Drop round trip ke comparison mein zyada economical hota hai.",
                  ],
                },
                {
                  q: "Q3. One Way Drop ke rate mein kya-kya include hota hai?",
                  a: [
                    "👉 Website par jo rate show hota hai, usmein toll tax aur state tax included hote hain.",
                    "👉 Sirf parking charge extra hota hai.",
                  ],
                },
                {
                  q: "Q4. One Way Drop booking kaise karein?",
                  a: [
                    "👉 Aap website, call ya WhatsApp ke through easily booking kar sakte hain.",
                  ],
                },
                {
                  q: "Q5. Kya advance payment deni hoti hai?",
                  a: ["👉 Kuch routes par advance payment required hoti hai."],
                },
                {
                  q: "Q6. One Way Drop ke liye kaun-kaun si car available hoti hai?",
                  a: [
                    "👉 Mini, Sedan, SUV aur Prime SUV category ki cars available hoti hain.",
                    "👉 Jaise: WagonR, Swift Dzire, Hyundai Aura, Honda Amaze, Etios, Maruti Ertiga, Toyota Innova Crysta aur similar taxis.",
                  ],
                },
              ].map((item, i) => (
                <div key={i} className="px-6 py-4">
                  <button
                    onClick={() => setOpenOneWay(openOneWay === i ? null : i)}
                    className="w-full flex justify-between items-center text-left font-medium text-gray-900"
                  >
                    {item.q}
                    {openOneWay === i ? (
                      <Minus className="text-red-600" />
                    ) : (
                      <Plus className="text-gray-400" />
                    )}
                  </button>

                  {openOneWay === i && (
                    <div className="mt-3 space-y-2 text-gray-700">
                      {item.a.map((line, idx) => (
                        <p key={idx}>{line}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
