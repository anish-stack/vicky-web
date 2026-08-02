import { useState } from "react";
import { ArrowRight, MoveRight } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

export default function PopularRoutes() {
  const { website } = useWebsite();
  const [showMore, setShowMore] = useState(false);
  const basicInfo = website?.basicInfo || {};
  const whatsapp = basicInfo.whatsapp || basicInfo.phone || "919876543210";

  const routes = (website?.popularPrices || []).map((r) => {
    const prices = [];
    if (r.mini?.active)
      prices.push({ car: "Mini (WagonR)", price: r.mini.price, type: r.mini.allExclusive ? "All Exclusive" : "All Inclusive" });
    if (r.sedan?.active)
      prices.push({ car: "Sedan (Swift Dzire)", price: r.sedan.price, type: r.sedan.allExclusive ? "All Exclusive" : "All Inclusive" });
    if (r.suv?.active)
      prices.push({ car: "SUV (Maruti Ertiga)", price: r.suv.price, type: r.suv.allExclusive ? "All Exclusive" : "All Inclusive" });
    if (r.innova?.active)
      prices.push({ car: "Prime SUV (Innova Crysta)", price: r.innova.price, type: r.innova.allExclusive ? "All Exclusive" : "All Inclusive" });
    prices.sort((a, b) => a.price - b.price);
    return { start: r.start, end: r.end, tag: r.type === "one-way" ? "One Way Drop" : "Round Trip", prices };
  });

  const displayed = showMore ? routes : routes.slice(0, 3);

  const enquire = (item) => {
    const message = `*Route Enquiry*\n\n*${basicInfo.logo_name || basicInfo.name || ""}*\n\n*Route:* ${item.start} → ${item.end} (${item.tag})\n\nPlease share availability & final fare.`;
    window.open(`https://wa.me/91${whatsapp}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <section id="routes" className="py-12 md:py-20 bg-white border-y-2 border-orange-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex px-4 py-2 rounded-full bg-orange-50 border-2 border-orange-300 text-orange-700 text-xs font-black uppercase tracking-wide shadow-[3px_3px_0px_0px_rgba(251,146,60,0.5)]">
            Popular Routes
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-black text-stone-900">
            Fixed Fare <span className="text-orange-600">Route Cards</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((item, index) => (
            <div
              key={index}
              className="bg-orange-50 rounded-3xl border-2 border-orange-200 p-6 hover:bg-white hover:shadow-[6px_6px_0px_0px_rgba(251,146,60,0.3)] transition-all"
            >
              <span className="inline-block text-[10px] font-black uppercase tracking-wider text-white bg-orange-600 rounded-full px-3 py-1">
                {item.tag}
              </span>
              <div className="mt-3 flex items-center gap-2 text-lg font-black text-stone-900">
                <span className="truncate">{item.start}</span>
                <MoveRight size={20} className="text-orange-500 flex-shrink-0" />
                <span className="truncate">{item.end}</span>
              </div>

              <ul className="mt-4 space-y-2 text-sm">
                {item.prices.map((p, i) => (
                  <li key={i} className="flex justify-between items-center bg-white border border-orange-100 rounded-xl px-3.5 py-2.5">
                    <span className="text-stone-700 font-semibold">{p.car}</span>
                    <span className="font-black text-stone-900">
                      ₹{Number(p.price).toLocaleString()}{" "}
                      <span className="text-[10px] text-stone-400 font-semibold">({p.type})</span>
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => enquire(item)}
                className="mt-5 w-full py-3 rounded-2xl bg-orange-600 text-white text-sm font-black hover:bg-orange-700 transition flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                Enquiry Now <ArrowRight size={15} />
              </button>
            </div>
          ))}
        </div>

        {routes.length > 3 && (
          <div className="text-center mt-10">
            <button
              onClick={() => setShowMore(!showMore)}
              className="px-8 py-3.5 rounded-2xl bg-orange-50 border-2 border-orange-300 text-orange-700 font-black hover:bg-orange-100 transition shadow-[4px_4px_0px_0px_rgba(251,146,60,0.4)]"
            >
              {showMore ? "Show Less" : "View All Routes"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
