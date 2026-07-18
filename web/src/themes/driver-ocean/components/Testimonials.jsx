import { Star, Quote, MapPin } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

const locationPool = ["Delhi", "Gurgaon", "Noida", "Jaipur", "Chandigarh", "Agra"];

export default function Testimonials() {
  const { website } = useWebsite();

  const testimonials = (website?.reviews || []).map((review, index) => ({
    name: review.name || "Happy Customer",
    text: review.text || review.review || "",
    rating: review.rating || 5,
    location: review.location || locationPool[index % locationPool.length],
  }));

  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="py-12 md:py-20 bg-[#fffbf2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex px-5 py-2 rounded-full bg-pink-700 text-white text-xs font-black uppercase tracking-[0.2em] shadow-[3px_3px_0px_0px_rgba(245,158,11,1)]">
            Testimonials
          </span>
          <h2 className="mt-5 text-3xl md:text-5xl font-black text-slate-900">
            Word From The <span className="text-pink-700">Back Seat</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`bg-white rounded-2xl border-2 border-pink-700/20 p-6 hover:border-pink-700 hover:-translate-y-1 hover:shadow-[5px_5px_0px_0px_rgba(190,24,93,0.2)] transition-all ${
                i % 2 === 1 ? "md:rotate-1" : "md:-rotate-1"
              } hover:rotate-0`}
            >
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-pink-700 flex items-center justify-center shadow-md -rotate-6">
                  <Quote size={17} className="text-white" />
                </span>
                <div className="flex items-center gap-0.5 bg-pink-50 rounded-lg px-2.5 py-1.5">
                  {Array.from({ length: t.rating || 5 }).map((_, s) => (
                    <Star key={s} size={12} className="text-amber-500 fill-amber-500" />
                  ))}
                </div>
              </div>

              <p className="mt-4 text-slate-600 font-semibold leading-relaxed text-sm md:text-base">“{t.text}”</p>

              <div className="mt-5 pt-4 border-t-2 border-dashed border-pink-700/15 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-black flex items-center justify-center uppercase shadow-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-black text-slate-900 text-sm">{t.name}</p>
                  <p className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wide text-slate-400">
                    <MapPin size={11} className="text-pink-700" /> {t.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
