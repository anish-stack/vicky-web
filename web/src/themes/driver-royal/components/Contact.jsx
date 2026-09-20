"use client";

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

import { useWebsite } from "@/context/WebsiteContext";

export default function Contact() {
  const { website } = useWebsite();

  const basicInfo = website?.basicInfo || {};

  const rawPhone =
    basicInfo.phone ||
    basicInfo.whatsapp ||
    "9876543210";

  const rawWhatsapp =
    basicInfo.whatsapp ||
    basicInfo.phone ||
    "9876543210";

  const phone = rawPhone
    .toString()
    .replace(/\D/g, "")
    .replace(/^91(?=\d{10}$)/, "");

  const whatsapp = rawWhatsapp
    .toString()
    .replace(/\D/g, "")
    .replace(/^91(?=\d{10}$)/, "");

  const email =
    basicInfo.email ||
    "support@quickride.com";

  const area =
    basicInfo.serviceArea ||
    basicInfo.city ||
    "Delhi NCR";

  const officeHours =
    basicInfo.officeHours ||
    "Available 24×7";

  const whatsappUrl = `https://wa.me/91${whatsapp}?text=${encodeURIComponent(
    "Hi, I'd like to enquire about a ride."
  )}`;

  const cards = [
    {
      icon: Phone,
      title: "Phone Support",
      desc: "Speak directly with our support team for instant assistance.",
      value: `+91 ${phone}`,
      href: `tel:+91${phone}`,
      iconBg: "bg-[#FFF0E8]",
      iconColor: "text-[#FF641A]",
    },

    {
      icon: MessageCircle,
      title: "Live Chat",
      desc: "Chat with our team in real-time for quick answers.",
      value: "Chat now",
      href: whatsappUrl,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      icon: BookOpen,
      title: "FAQ",
      desc: "Find quick answers to the most common questions.",
      value: "Visit FAQ",
      href: "#faq",
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
    },
  ];

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-[#FCFDFF] py-8 sm:py-10 lg:py-12"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute -left-24 top-10 h-60 w-60 rounded-full bg-orange-100/40 blur-[100px]" />

      <div className="pointer-events-none absolute -right-32 top-0 h-72 w-72 rounded-full bg-blue-100/50 blur-[120px]" />

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">

        {/* ================================================= */}
        {/* TOP HERO */}
        {/* ================================================= */}

        <div className="grid items-center gap-7 lg:grid-cols-[1fr_1fr] lg:gap-8">

          {/* ================= LEFT CONTENT ================= */}

          <div className="relative z-20">

            {/* badge */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#F3F6FA] px-3.5 py-2 text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#071936]">
                <span className="h-2 w-2 rounded-full bg-[#FF641A]" />
                Support
              </span>

              <span className="text-[11px] font-medium text-slate-500">
                Always here for your journey
              </span>
            </div>

            {/* heading */}
            <h2 className="mt-4 max-w-[580px] text-[38px] font-extrabold leading-[0.98] tracking-[-0.05em] text-[#071936] sm:text-[48px] lg:text-[58px]">
              We&apos;re Here
              <br />
              To{" "}
              <span className="relative text-[#FF641A]">
                Help
                <span className="absolute -bottom-2 left-0 h-[3px] w-[85%] rotate-[-3deg] rounded-full bg-[#FF641A]" />
              </span>
            </h2>

            {/* description */}
            <p className="mt-6 max-w-[570px] text-[13px] leading-6 text-slate-500 sm:text-[14px] lg:text-[15px]">
              Have a question, need to make a change, or need help with your
              booking? Our friendly support team is here 24/7 to make your
              journey smooth and stress-free.
            </p>

            {/* CTA buttons */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">

              <a
                href={`tel:+91${phone}`}
                className="group inline-flex h-[52px] items-center justify-center gap-3 rounded-[13px] bg-[#FF641A] px-6 text-[12px] font-extrabold text-white shadow-[0_12px_30px_rgba(255,100,26,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#E95813]"
              >
                <Headphones size={17} />

                Contact Support

                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-[52px] items-center justify-center gap-3 rounded-[13px] border border-slate-200 bg-white px-6 text-[12px] font-extrabold text-[#071936] shadow-sm transition-all hover:border-emerald-200 hover:bg-emerald-50"
              >
                <MessageCircle
                  size={18}
                  className="text-emerald-500"
                />

                Chat on WhatsApp

                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>
            </div>

            {/* Benefits */}
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2.5">

              <SmallTrust text="Fast response" />

              <SmallTrust text="Real people" />

              <SmallTrust text="Here 24/7" />

            </div>
          </div>

          {/* ================= RIGHT IMAGE ================= */}

          <div className="relative min-h-[330px] sm:min-h-[380px] lg:min-h-[420px]">

            {/* big blue soft circle */}
            <div className="absolute bottom-0 left-1/2 h-[90%] w-[85%] -translate-x-1/2 rounded-t-[50%] bg-gradient-to-b from-blue-50 to-white/40" />

            {/* faded city */}
            <div className="pointer-events-none absolute bottom-4 left-1/2 h-[65%] w-[95%] -translate-x-1/2 opacity-[0.12]">
              <div className="absolute bottom-0 left-[5%] h-[45%] w-[8%] bg-[#5681A8]" />
              <div className="absolute bottom-0 left-[17%] h-[62%] w-[10%] bg-[#5681A8]" />
              <div className="absolute bottom-0 left-[30%] h-[38%] w-[7%] bg-[#5681A8]" />
              <div className="absolute bottom-0 right-[28%] h-[54%] w-[9%] bg-[#5681A8]" />
              <div className="absolute bottom-0 right-[13%] h-[70%] w-[10%] bg-[#5681A8]" />
            </div>

            {/* support girl */}
            <img
              src="/images/support-girl.png"
              alt="Customer support"
              className="absolute bottom-0 left-1/2 z-10 h-[95%] w-[90%] -translate-x-1/2 object-contain object-bottom"
            />

            {/* 24/7 Card */}
            <div className="absolute left-0 top-[10%] z-20 hidden items-center gap-3 rounded-[18px] border border-slate-100 bg-white/95 px-4 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-lg sm:flex lg:left-[-10px]">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF0E8] text-[#FF641A]">
                <Clock3 size={19} />
              </div>

              <div>
                <p className="text-[16px] font-extrabold leading-tight text-[#071936]">
                  24/7
                </p>

                <p className="text-[10px] font-bold text-[#071936]">
                  Response
                </p>

                <p className="mt-0.5 text-[8px] text-slate-400">
                  We&apos;re always here
                </p>
              </div>
            </div>

            {/* small support card */}
            <div className="absolute bottom-[25%] left-[-4px] z-20 hidden items-center gap-2.5 rounded-[16px] border border-white bg-white/95 px-3 py-2.5 shadow-lg sm:flex">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
                <MessageCircle
                  size={15}
                  className="text-[#071936]"
                />
              </span>

              <span className="max-w-[90px] text-[9px] font-semibold leading-4 text-[#071936]">
                Support for a smoother journey
              </span>
            </div>

            {/* right floating card */}
            <div className="absolute right-0 top-[52%] z-20 hidden rounded-[16px] bg-white/95 px-4 py-3 shadow-lg backdrop-blur-md lg:block">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFF0E8]">
                  <CheckCircle2
                    size={13}
                    className="text-[#FF641A]"
                  />
                </span>

                <div>
                  <p className="text-[9px] font-extrabold text-[#071936]">
                    Real support.
                  </p>

                  <p className="text-[9px] text-slate-500">
                    Real people.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="relative z-30 mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <a
                key={card.title}
                href={card.href}
                {...(
                  card.href.startsWith("http")
                    ? {
                      target: "_blank",
                      rel: "noopener noreferrer",
                    }
                    : {}
                )}
                className="
          group
          flex
          min-h-[170px]
          flex-col
          rounded-[16px]
          border
          border-slate-100
          bg-white
          p-4
          shadow-[0_8px_24px_rgba(15,23,42,0.04)]
          transition-all
          duration-300
          hover:-translate-y-0.5
          hover:border-orange-200
          hover:shadow-[0_12px_30px_rgba(15,23,42,0.07)]
        "
              >
                {/* icon + title */}
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${card.iconBg}`}
                  >
                    <Icon
                      size={17}
                      className={card.iconColor}
                    />
                  </div>

                  <h3 className="text-[13px] font-extrabold text-[#071936]">
                    {card.title}
                  </h3>
                </div>

                {/* description */}
                <p className="mt-3 line-clamp-2 text-[10px] leading-[1.65] text-slate-500">
                  {card.desc}
                </p>

                {/* value */}
                <div
                  className="
            mt-auto
            flex
            items-center
            gap-2
            border-t
            border-slate-100
            pt-3
          "
                >
                  <Icon
                    size={12}
                    className={card.iconColor}
                  />

                  <span className="min-w-0 flex-1 truncate text-[10px] font-bold text-[#071936]">
                    {card.value}
                  </span>

                  <span
                    className="
              flex
              h-7
              w-7
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#F7F8FA]
              text-slate-400
              transition-all
              duration-300
              group-hover:bg-[#FF641A]
              group-hover:text-white
            "
                  >
                    <ArrowRight
                      size={11}
                      className="transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </a>
            );
          })}
        </div>
        {/* ================================================= */}
        {/* OPTIONAL LOCATION INFO */}
        {/* ================================================= */}

        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[9px] text-slate-400">

          <span className="flex items-center gap-1.5">
            <MapPin
              size={11}
              className="text-[#FF641A]"
            />
            {area}
          </span>

          <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

          <span className="flex items-center gap-1.5">
            <Clock3
              size={11}
              className="text-[#FF641A]"
            />
            {officeHours}
          </span>

        </div>
      </div>
    </section>
  );
}

/* ================================================= */
/* SMALL TRUST */
/* ================================================= */

function SmallTrust({ text }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FF641A]">
        <CheckCircle2
          size={9}
          className="text-white"
        />
      </span>

      {text}
    </span>
  );
}