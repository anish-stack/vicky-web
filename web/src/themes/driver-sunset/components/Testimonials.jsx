import { Star, Quote } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

const locationPool = [
  "Sector 21, Faridabad", "Noida Sector 62", "Gurgaon DLF Phase 3",
  "Greater Noida West", "South Delhi", "Ghaziabad Indirapuram",
];

const bgColors = ["bg-orange-100", "bg-amber-100", "bg-rose-100"];

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
    <section id="testimonials" className="py-12 md:py-20 bg-white border-y-2 border-orange-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex px-4 py-2 rounded-full bg-orange-50 border-2 border-orange-300 text-orange-700 text-xs font-black uppercase tracking-wide shadow-[3px_3px_0px_0px_rgba(251,146,60,0.5)]">
            Testimonials
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-black text-stone-900">
            Smiles Per <span className="text-orange-600">Kilometer</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`${bgColors[i % bgColors.length]} rounded-3xl border-2 border-orange-200 p-6 hover:-translate-y-1 transition-transform ${i % 3 === 1 ? "lg:mt-6" : ""}`}
            >
              <Quote size={26} className="text-orange-500" />
              <p className="mt-3 text-stone-800 font-medium leading-relaxed text-sm md:text-base">“{t.text}”</p>
              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className="font-black text-stone-900 text-sm">{t.name}</p>
                  <p className="text-xs text-stone-500 font-semibold">{t.location}</p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating || 5 }).map((_, s) => (
                    <Star key={s} size={13} className="text-orange-500 fill-orange-500" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
