"use client";

import { useState } from "react";
import {
  ArrowRight,
  Clock3,
  MapPin,
} from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

export default function Packages() {
  const { website } = useWebsite();

  const basicInfo = website?.basicInfo || {};

  const rawWhatsapp =
    basicInfo.whatsapp ||
    basicInfo.phone ||
    "919876543210";

  // Remove spaces, +, etc.
  const whatsapp = rawWhatsapp
    .toString()
    .replace(/\D/g, "")
    .replace(/^91(?=\d{10}$)/, "");

  const packages = website?.packages || [];

  const [showMore, setShowMore] = useState(false);

  if (packages.length === 0) return null;

  const displayed = showMore
    ? packages
    : packages.slice(0, 4);

  const enquire = (pkg) => {
    const message = `*Tour Package Enquiry*

*${basicInfo.logo_name || basicInfo.name || ""}*

*Package:* ${pkg.title}
*Duration:* ${pkg.duration || "N/A"}
*Price:* ₹${Number(pkg.price || 0).toLocaleString("en-IN")}

Please share more details.`;

    window.open(
      `https://wa.me/91${whatsapp}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <section
      id="tours"
      className="relative overflow-hidden bg-[#071B36] py-10 md:py-14 lg:py-16"
    >
      {/* Background blur elements */}
      <div className="pointer-events-none absolute -left-40 top-0 h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[300px] w-[300px] rounded-full bg-orange-500/10 blur-[100px]" />

      <div className="relative mx-auto max-w-[1400px] px-3 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white/80 backdrop-blur-md">
              Popular Destinations
            </span>

            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.035em] text-white sm:text-3xl lg:text-[40px]">
              Explore <span className="text-[#FF681F]">New Places</span>
            </h2>

            <p className="mt-1.5 max-w-xl text-xs leading-5 text-slate-300 md:text-sm">
              Comfortable rides to your favourite destinations with everything you need for a memorable journey.
            </p>
          </div>

          {packages.length > 4 && (
            <button
              type="button"
              onClick={() => setShowMore(!showMore)}
              className="group hidden items-center gap-1.5 text-xs font-bold text-white transition-colors hover:text-[#FF681F] md:flex"
            >
              {showMore ? "Show Less" : "View All Packages"}
              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          )}
        </div>

        {/* PACKAGE CARDS - 2 columns on mobile, 4 on large screens */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {displayed.map((pkg, index) => (
            <article
              key={pkg._id || pkg.id || `${pkg.title}-${index}`}
              className="group overflow-hidden rounded-[16px] sm:rounded-[20px] bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* IMAGE */}
              <div className="relative h-[110px] sm:h-[180px] overflow-hidden bg-slate-200">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

                {/* Duration badge */}
                {pkg.duration && (
                  <span className="absolute left-2 top-2 sm:left-3 sm:top-3 inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/90 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-bold text-[#071B36] shadow-sm backdrop-blur-md">
                    <Clock3 size={10} className="text-[#FF681F]" />
                    {pkg.duration}
                  </span>
                )}
              </div>

              {/* CONTENT */}
              <div className="p-2.5 sm:p-4">
                <div className="mb-1 flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  <MapPin size={10} className="text-[#FF681F]" />
                  Tour Package
                </div>

                <h3 className="line-clamp-1 text-xs sm:text-[16px] font-extrabold tracking-[-0.02em] text-[#071B36]">
                  {pkg.title}
                </h3>

                {pkg.description && (
                  <p className="mt-1 line-clamp-2 min-h-[28px] sm:min-h-[36px] text-[10px] sm:text-[12px] leading-3.5 sm:leading-4 text-slate-500">
                    {pkg.description}
                  </p>
                )}

                {/* Bottom price / CTA */}
                <div className="mt-2.5 sm:mt-4 flex items-end justify-between border-t border-slate-100 pt-2.5 sm:pt-3">
                  <div>
                    <p className="mb-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
                      Starting From
                    </p>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-[10px] sm:text-[12px] font-semibold text-slate-400">₹</span>
                      <span className="text-sm sm:text-lg font-extrabold tracking-[-0.03em] text-[#071B36]">
                        {Number(pkg.price || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => enquire(pkg)}
                    aria-label={`Book ${pkg.title}`}
                    className="flex h-7 w-7 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-[#071B36] text-white transition-all duration-300 hover:bg-[#FF681F] group-hover:rotate-[-5deg]"
                  >
                    <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* MOBILE VIEW ALL */}
        {packages.length > 4 && (
          <div className="mt-6 text-center md:hidden">
            <button
              type="button"
              onClick={() => setShowMore(!showMore)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-bold text-white backdrop-blur-md transition-all hover:border-[#FF681F] hover:bg-[#FF681F]"
            >
              {showMore ? "Show Less" : "View All Packages"}
              <ArrowRight size={13} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}