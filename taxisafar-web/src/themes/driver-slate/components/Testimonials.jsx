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
    <section id="testimonials" className="py-12 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex px-4 py-2 rounded-full bg-sky-100 text-sky-700 text-xs font-extrabold uppercase tracking-widest">
            Testimonials
          </span>
          <h2 className="mt-4 text-3xl md:text-5xl font-extrabold text-gray-900">
            Voices From <span className="text-sky-600">The Road</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-sky-50/60 rounded-2xl p-6 border-l-4 border-sky-600 shadow-sm hover:shadow-xl hover:shadow-sky-200/60 hover:-translate-y-1 transition-all"
            >
              <div className="flex items-center justify-between">
                <Quote size={26} className="text-sky-300" />
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating || 5 }).map((_, s) => (
                    <Star key={s} size={13} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="mt-4 text-gray-600 font-medium leading-relaxed text-sm md:text-base">“{t.text}”</p>
              <div className="mt-5 pt-4 border-t border-sky-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white font-extrabold flex items-center justify-center uppercase">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-extrabold text-gray-900 text-sm">{t.name}</p>
                  <p className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-400">
                    <MapPin size={11} className="text-amber-500" /> {t.location}
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
