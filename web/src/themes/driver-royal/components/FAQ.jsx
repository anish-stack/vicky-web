"use client";

import { useState } from "react";
import {
  Plus,
  Minus,
  MessageCircleQuestion,
  Headphones,
  ArrowRight,
} from "lucide-react";

const faqs = [
  {
    q: "How do I book a cab?",
    a: "You can book instantly through the booking form on this website, or directly via call or WhatsApp — available 24×7.",
  },
  {
    q: "Can I schedule a ride in advance?",
    a: "Yes. Select your preferred date and time in the booking form and we'll arrange a cab for your scheduled journey.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept cash, UPI, credit/debit cards and popular digital payment methods for your convenience.",
  },
  {
    q: "Is it safe to travel with QuickRide?",
    a: "Our drivers are verified and vehicles are regularly maintained to provide a safe and comfortable travel experience.",
  },
  {
    q: "Do you offer outstation trips?",
    a: "Yes. We provide one-way and round-trip outstation rides with clear and transparent pricing.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-[#FCFCFD] py-6 sm:py-8 lg:py-10"
    >
      {/* Soft background */}
      <div className="pointer-events-none absolute -left-28 top-0 h-52 w-52 rounded-full bg-orange-100/50 blur-[90px]" />
      <div className="pointer-events-none absolute -right-28 bottom-0 h-56 w-56 rounded-full bg-blue-100/40 blur-[90px]" />

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-5 lg:grid-cols-[0.78fr_1.22fr] lg:gap-8">

          {/* ================= LEFT ================= */}

          <div className="relative">
            {/* Heading */}
            <div className="max-w-[470px]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF1E8] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#FF641A]">
                <MessageCircleQuestion size={12} />
                FAQ
              </span>

              <h2 className="mt-3 text-[29px] font-extrabold leading-[1.04] tracking-[-0.04em] text-[#071936] sm:text-[34px] lg:text-[40px]">
                Got Questions?
                <br />
                We&apos;ve Got{" "}
                <span className="text-[#FF641A]">
                  Answers.
                </span>
              </h2>

              <p className="mt-2 max-w-[390px] text-[12px] leading-5 text-slate-500 sm:text-[13px]">
                Everything you need to know before booking your next ride.
              </p>
            </div>

            {/* ================= GIRL IMAGE ================= */}

            <div className="relative mt-3 h-[230px] overflow-hidden rounded-[22px] bg-gradient-to-br from-[#FFF3EB] via-[#FFF9F5] to-white sm:h-[250px] lg:h-[280px]">

              {/* decoration */}
              <div className="absolute -left-12 -top-14 h-32 w-32 rounded-full bg-orange-200/30" />

              <div className="absolute -right-12 bottom-[-60px] h-40 w-40 rounded-full bg-blue-100/40" />

              {/* transparent PNG */}
              <img
                src="https://i.ibb.co/dJD9FnpW/Chat-GPT-Image-Sep-19-2026-10-47-15-PM.png"
                alt="FAQ help"
                className="
                  absolute
                  bottom-0
                  left-1/2
                  h-[96%]
                  w-[82%]
                  -translate-x-1/2
                  object-contain
                  object-bottom
                  sm:w-[70%]
                  lg:w-[72%]
                "
              />

              {/* support card */}
              <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2.5 rounded-xl border border-white/80 bg-white/90 px-3 py-2.5 shadow-[0_10px_25px_rgba(15,23,42,0.08)] backdrop-blur-md">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF0E8] text-[#FF641A]">
                  <Headphones size={15} />
                </div>

                <div>
                  <p className="text-[10px] font-extrabold text-[#071936]">
                    Need more help?
                  </p>

                  <p className="text-[8px] text-slate-400">
                    Available 24×7
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT FAQ ================= */}

          <div className="space-y-2">
            {faqs.map((faq, index) => {
              const isOpen = open === index;

              return (
                <div
                  key={index}
                  className={`overflow-hidden rounded-[15px] border bg-white transition-all duration-300 ${
                    isOpen
                      ? "border-orange-200 shadow-[0_8px_25px_rgba(15,23,42,0.05)]"
                      : "border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpen(isOpen ? null : index)
                    }
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left sm:px-5 sm:py-3.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {/* Number */}
                      <span
                        className={`text-[9px] font-extrabold ${
                          isOpen
                            ? "text-[#FF641A]"
                            : "text-slate-300"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      {/* Question */}
                      <span className="text-[12px] font-extrabold leading-5 text-[#071936] sm:text-[13px]">
                        {faq.q}
                      </span>
                    </div>

                    {/* Icon */}
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                        isOpen
                          ? "bg-[#FF641A] text-white"
                          : "bg-[#F5F7FA] text-[#071936]"
                      }`}
                    >
                      {isOpen ? (
                        <Minus size={13} />
                      ) : (
                        <Plus size={13} />
                      )}
                    </span>
                  </button>

                  {/* Smooth answer */}
                  <div
                    className={`grid transition-all duration-300 ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 pb-3 sm:px-5">
                        <div className="ml-[27px] border-l-2 border-orange-100 pl-3">
                          <p className="text-[11px] leading-5 text-slate-500 sm:text-[12px]">
                            {faq.a}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ================= SUPPORT CTA ================= */}

            <div className="mt-2 flex flex-col gap-3 rounded-[16px] bg-[#071936] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div>
                <p className="text-[11px] font-extrabold text-white sm:text-[12px]">
                  Still have a question?
                </p>

                <p className="mt-0.5 text-[9px] text-slate-300 sm:text-[10px]">
                  Our support team is ready to help.
                </p>
              </div>

              <a
                href="#contact"
                className="group inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#FF641A] px-4 text-[10px] font-extrabold text-white transition-colors hover:bg-[#E95813]"
              >
                Contact Support

                <ArrowRight
                  size={12}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}