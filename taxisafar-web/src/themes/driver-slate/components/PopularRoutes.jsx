import { useState } from "react";
import { ArrowRight, Car, MapPin, Milestone } from "lucide-react";
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
    return {
      start: r.start,
      end: r.end,
      route: `${r.start} → ${r.end}`,
      tag: r.type === "one-way" ? "One Way Drop" : "Round Trip",
      prices,
    };
  });

  const displayed = showMore ? routes : routes.slice(0, 4);

  const enquire = (item) => {
    const message = `*Route Enquiry*\n\n*${basicInfo.logo_name || basicInfo.name || ""}*\n\n*Route:* ${item.route} (${item.tag})\n\nPlease share availability & final fare.`;
    window.open(`https://wa.me/91${whatsapp}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <section id="routes" className="py-12 md:py-20 bg-sky-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm text-sky-700 text-xs font-extrabold uppercase tracking-widest">
            <Milestone size={13} className="text-amber-500" /> Fixed Fares
          </span>
          <h2 className="mt-4 text-3xl md:text-5xl font-extrabold text-gray-900">
            Popular <span className="text-sky-600">Highway Routes</span>
          </h2>
          <p className="mt-3 text-gray-500 font-medium">Toll & state tax included in every fare shown.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
          {displayed.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg shadow-gray-200/80 overflow-hidden hover:shadow-2xl hover:shadow-sky-200/60 transition-shadow"
            >
              {/* Highway signboard header */}
              <div className="bg-sky-600 px-6 py-4 relative">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0 text-white">
                    <MapPin size={16} className="text-amber-300 shrink-0" />
                    <span className="font-extrabold truncate">{item.start}</span>
                    <ArrowRight size={15} className="text-sky-200 shrink-0" />
                    <span className="font-extrabold truncate">{item.end}</span>
                  </div>
                  <span className="shrink-0 text-[10px] font-extrabold uppercase tracking-wide bg-amber-400 text-gray-900 px-2.5 py-1 rounded-lg">
                    {item.tag}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[repeating-linear-gradient(to_right,#fbbf24_0px,#fbbf24_12px,transparent_12px,transparent_24px)]" />
              </div>

              {/* Fares */}
              <div className="p-6 space-y-2.5">
                {item.prices.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl bg-sky-50/70 hover:bg-amber-50 px-4 py-3 transition-colors border-l-4 border-sky-600"
                  >
                    <div className="flex items-center gap-3">
                      <Car size={17} className="text-sky-600" />
                      <div>
                        <p className="text-sm font-extrabold text-gray-900">{p.car}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{p.type}</p>
                      </div>
                    </div>
                    <p className="text-lg font-extrabold text-gray-900">₹ {Number(p.price).toLocaleString()}</p>
                  </div>
                ))}
                {item.prices.length === 0 && (
                  <p className="text-sm text-gray-400 font-medium">Fare on request — enquire below.</p>
                )}

                <button
                  onClick={() => enquire(item)}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-400 text-gray-900 text-sm font-extrabold shadow-md shadow-amber-400/25 hover:bg-sky-600 hover:text-white transition-colors"
                >
                  Book This Route <ArrowRight size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {routes.length > 4 && (
          <div className="text-center mt-10">
            <button
              onClick={() => setShowMore(!showMore)}
              className="px-8 py-3 rounded-xl bg-white shadow-sm text-sky-700 text-sm font-extrabold hover:bg-sky-600 hover:text-white transition-colors"
            >
              {showMore ? "Show Less" : `View All ${routes.length} Routes`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
