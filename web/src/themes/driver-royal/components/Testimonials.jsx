"use client";

import { useMemo } from "react";
import { Heart, Quote, Star, MapPin } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

export default function Testimonials() {
  const { website } = useWebsite();

  const testimonials = useMemo(() => {
    return (website?.reviews || []).map((review, index) => ({
      id: review._id || review.id || `${review.name}-${index}`,
      name: review.name || "Happy Rider",
      text: review.text || review.review || "",
      rating: Math.min(5, Math.max(1, Number(review.rating || 5))),
      location: review.location || review.city || "Verified Rider",
      image: review.image || "",
    }));
  }, [website?.reviews]);

  if (!testimonials.length) return null;

  // Duplicate array for seamless infinite marquee loop
  const duplicatedReviews = [...testimonials, ...testimonials];

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden bg-[#FBFCFF] py-10 md:py-14 lg:py-16"
    >
      {/* Decorative background glows */}
      <div className="pointer-events-none absolute -left-30 top-10 h-[300px] w-[300px] rounded-full bg-orange-100/50 blur-[100px]" />
      <div className="pointer-events-none absolute -right-30 top-0 h-[350px] w-[350px] rounded-full bg-blue-100/50 blur-[100px]" />

      <div className="relative mx-auto max-w-[1400px] px-3 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="mx-auto max-w-[700px] text-center mb-8 md:mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-100 bg-[#FFF4EC] px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#FF641A]">
            <Heart size={12} className="fill-[#FF641A]" />
            Real People. Real Journeys.
          </span>

          <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.04em] text-[#071936] sm:text-3xl lg:text-[42px]">
            Our Riders <span className="text-[#FF641A]">Love Us</span>
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-slate-500 md:text-sm">
            Real experiences from happy travellers across the city.
          </p>
        </div>
      </div>

      {/* AUTO-SCROLLING HORIZONTAL TESTIMONIALS CAROUSEL */}
      <div className="relative w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
        <div className="flex w-max animate-testimonial-marquee gap-5 py-3 hover:[animation-play-state:paused]">
          {duplicatedReviews.map((testimonial, index) => {
            // Alternate featured cards style for visual variety
            const featured = index % 2 === 1;

            return (
              <article
                key={`${testimonial.id}-${index}`}
                className={`
                  group relative flex w-[300px] sm:w-[360px] shrink-0 flex-col justify-between overflow-hidden rounded-[20px] sm:rounded-[24px] border p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1.5
                  ${
                    featured
                      ? "border-[#0B2A4F] bg-gradient-to-br from-[#071936] to-[#0E3766] text-white shadow-xl"
                      : "border-slate-100 bg-white text-slate-900 shadow-sm hover:shadow-md"
                  }
                `}
              >
                {/* Background decorative quote watermark */}
                <Quote
                  size={60}
                  className={`pointer-events-none absolute -bottom-2 right-2 rotate-180 ${
                    featured ? "text-white/[0.05]" : "text-[#071936]/[0.03]"
                  }`}
                />

                <div>
                  {/* Top: Avatar & Name */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-extrabold ${
                          featured ? "bg-white text-[#071936]" : "bg-[#FFF0E8] text-[#FF641A]"
                        }`}
                      >
                        {testimonial.image ? (
                          <img src={testimonial.image} alt={testimonial.name} className="h-full w-full object-cover" />
                        ) : (
                          testimonial.name.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div>
                        <p className={`text-xs sm:text-sm font-extrabold ${featured ? "text-white" : "text-[#071936]"}`}>
                          {testimonial.name}
                        </p>
                        <p className={`mt-0.5 flex items-center gap-1 text-[10px] ${featured ? "text-blue-200" : "text-slate-400"}`}>
                          <MapPin size={10} />
                          {testimonial.location}
                        </p>
                      </div>
                    </div>

                    <span className={`flex h-8 w-8 items-center justify-center rounded-full ${featured ? "bg-white/10" : "bg-[#FFF4EC]"}`}>
                      <Heart size={14} className={featured ? "fill-orange-400 text-orange-400" : "fill-[#FF641A] text-[#FF641A]"} />
                    </span>
                  </div>

                  {/* Rating Stars */}
                  <div className="mt-3.5 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        size={13}
                        className={
                          starIndex < testimonial.rating
                            ? "fill-amber-400 text-amber-400"
                            : featured ? "text-white/20" : "text-slate-200"
                        }
                      />
                    ))}
                    <span className={`ml-1.5 text-[10px] font-bold ${featured ? "text-white/70" : "text-slate-400"}`}>
                      {testimonial.rating}.0
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className={`mt-3 line-clamp-4 text-xs sm:text-[13px] leading-5 ${featured ? "text-slate-200" : "text-slate-600"}`}>
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                </div>

                {/* Footer status */}
                <div className={`mt-5 flex items-center justify-between border-t pt-3 ${featured ? "border-white/10" : "border-slate-100"}`}>
                  <span className={`text-[9px] font-extrabold uppercase tracking-wider ${featured ? "text-blue-200" : "text-slate-400"}`}>
                    Verified Rider
                  </span>
                  <span className={`h-2 w-2 rounded-full ${featured ? "bg-orange-400" : "bg-emerald-400"}`} />
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Marquee Custom Animation Style */}
      <style jsx global>{`
        @keyframes testimonialMarquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-testimonial-marquee {
          display: flex;
          width: max-content;
          animation: testimonialMarquee 40s linear infinite;
        }
      `}</style>
    </section>
  );
}