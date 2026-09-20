"use client";

import { useWebsite } from "@/context/WebsiteContext";

export default function FinalCTA() {
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

  const message = `Hi, I'd like to book a ride.`;

  const bookingUrl = `https://wa.me/91${whatsapp}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <section className="bg-white py-4 sm:py-5 lg:py-6">
      <div className="mx-auto max-w-[1400px] px-3 sm:px-4 lg:px-6">

        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Book a ride on WhatsApp"
          className="group block overflow-hidden rounded-[20px] sm:rounded-[24px]"
        >
          <picture>

            {/* MOBILE IMAGE */}
            <source
              media="(max-width: 639px)"
              srcSet="/images/final-cta-mobile.png"
            />

            {/* DESKTOP IMAGE */}
            <img
              src="/images/final-cta-desktop.png"
              alt="Book your ride now"
              className="
                block
                h-auto
                w-full
                object-cover
                transition-transform
                duration-500
                group-hover:scale-[1.01]
              "
            />

          </picture>
        </a>

      </div>
    </section>
  );
}