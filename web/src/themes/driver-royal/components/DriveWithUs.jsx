"use client";

import {
  ArrowRight,
  Clock3,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

import { useWebsite } from "@/context/WebsiteContext";

export default function DriveWithUs() {
  const { website } = useWebsite();

  const basicInfo = website?.basicInfo || {};

  const rawWhatsapp =
    basicInfo.whatsapp ||
    basicInfo.phone ||
    "919876543210";

  const whatsapp = rawWhatsapp
    .toString()
    .replace(/\D/g, "")
    .replace(/^91(?=\d{10}$)/, "");

  const driverUrl = `https://wa.me/91${whatsapp}?text=${encodeURIComponent(
    "Hi, I want to become a driver partner."
  )}`;

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1400px] px-3 sm:px-4 lg:px-6">

        {/* MAIN BANNER */}
        <div className="relative min-h-[360px] overflow-hidden rounded-[28px] bg-[#FFF0E5] lg:min-h-[390px]">

          {/* ================= BACKGROUND ================= */}

          <div className="absolute inset-0 bg-gradient-to-r from-[#FFF5EE] via-[#FFE8D8] to-[#FFD4B9]" />

          {/* soft glow */}
          <div className="pointer-events-none absolute -left-20 top-1/2 h-[300px] w-[300px] -translate-y-1/2 rounded-full bg-white/70 blur-[90px]" />

          <div className="pointer-events-none absolute right-[20%] top-[-100px] h-[300px] w-[300px] rounded-full bg-orange-300/20 blur-[100px]" />

          {/* subtle city effect */}
          <div
            className="
              pointer-events-none
              absolute bottom-0 right-0
              h-[70%] w-[65%]
              opacity-[0.09]
              [background-image:linear-gradient(to_top,#071936_1px,transparent_1px),linear-gradient(to_right,#071936_1px,transparent_1px)]
              [background-size:38px_38px]
            "
          />

          {/* ================= CONTENT ================= */}

          <div className="relative z-20 flex min-h-[360px] items-center lg:min-h-[390px]">

            <div className="w-full px-6 py-8 sm:px-8 md:px-10 lg:w-[52%] lg:px-12 lg:py-10">

              {/* label */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3.5 py-2 shadow-sm backdrop-blur-md">
                <TrendingUp
                  size={14}
                  className="text-[#FF641A]"
                />

                <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#071936]">
                  Drive With Us
                </span>
              </div>

              {/* heading */}
              <h2 className="mt-4 max-w-[560px] text-[34px] font-extrabold leading-[1.05] tracking-[-0.04em] text-[#071936] sm:text-[42px] lg:text-[50px]">
                Earn More.
                <br />

                Drive On{" "}
                <span className="text-[#FF641A]">
                  Your Terms.
                </span>
              </h2>

              {/* description */}
              <p className="mt-4 max-w-[470px] text-[14px] leading-6 text-slate-600 sm:text-[15px]">
                Join our growing driver community, choose your own working
                hours and earn more with every ride.
              </p>

              {/* benefits */}
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2.5">
                {[
                  "Flexible schedule",
                  "Regular bookings",
                  "Fast support",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-1.5"
                  >
                    <CheckCircle2
                      size={14}
                      className="text-emerald-500"
                    />

                    <span className="text-[11px] font-bold text-[#071936]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              {/* buttons */}
              <div className="mt-7 flex flex-wrap items-center gap-3">

                <a
                  href={driverUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    group
                    inline-flex h-[52px] items-center justify-center gap-2
                    rounded-xl
                    bg-[#FF641A]
                    px-6
                    text-[13px] font-extrabold text-white
                    shadow-[0_12px_28px_rgba(255,100,26,0.25)]
                    transition-all duration-300
                    hover:-translate-y-0.5
                    hover:bg-[#E95712]
                  "
                >
                  Become a Driver

                  <ArrowRight
                    size={15}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </a>

                <a
                  href="#faq"
                  className="
                    inline-flex h-[52px] items-center justify-center
                    rounded-xl
                    border border-[#071936]/15
                    bg-white/70
                    px-6
                    text-[13px] font-extrabold text-[#071936]
                    backdrop-blur-md
                    transition-all
                    hover:bg-white
                  "
                >
                  Learn More
                </a>

              </div>
            </div>
          </div>

          {/* ================= PERSON + CAR IMAGE ================= */}

          <div
            className="
              pointer-events-none
              absolute
              bottom-0
              right-[-30px]
              z-10
              hidden
              h-full
              w-[59%]
              lg:block
            "
          >
            <img
              src="https://i.ibb.co/ZRxn9vxV/Chat-GPT-Image-Sep-19-2026-10-34-20-PM.png"
              alt="Driver with car"
              className="
                absolute
                bottom-0
                right-0
                h-[95%]
                w-full
                object-contain
                object-bottom
              "
            />
          </div>

          {/* ================= FLOATING BADGE ================= */}

          <div
            className="
              absolute
              right-6
              top-6
              z-30
              hidden
              items-center
              gap-3
              rounded-2xl
              border border-white/70
              bg-white/90
              px-4
              py-3
              shadow-[0_12px_30px_rgba(15,23,42,0.10)]
              backdrop-blur-xl
              lg:flex
            "
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF0E8]">
              <Clock3
                size={17}
                className="text-[#FF641A]"
              />
            </div>

            <div>
              <p className="text-[11px] font-extrabold text-[#071936]">
                Flexible Hours
              </p>

              <p className="mt-0.5 text-[10px] font-medium text-slate-500">
                Higher earning potential
              </p>
            </div>
          </div>

          {/* ================= MOBILE IMAGE ================= */}

          <div className="relative z-10 mt-[-25px] block h-[240px] overflow-hidden lg:hidden">
            <img
              src="https://i.ibb.co/ZRxn9vxV/Chat-GPT-Image-Sep-19-2026-10-34-20-PM.png"
              alt="Driver with car"
              className="absolute bottom-0 right-[-5%] h-full w-[110%] object-contain object-bottom"
            />
          </div>

        </div>
      </div>
    </section>
  );
}