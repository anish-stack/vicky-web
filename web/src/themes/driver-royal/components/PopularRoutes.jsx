import { useState } from "react";
import { ArrowRight, Car, MapPin } from "lucide-react";
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
    <section id="routes" className="py-12 md:py-20 bg-[#fffdf5] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex px-5 py-2 rounded-full bg-green-700 text-white text-xs font-black uppercase tracking-[0.2em] shadow-[3px_3px_0px_0px_rgba(249,115,22,1)]">
            Fixed Rate Routes
          </span>
          <h2 className="mt-5 text-3xl md:text-5xl font-black text-slate-900">
            Fixed <span className="text-green-700">Highway Rates</span>
          </h2>
          <p className="mt-3 text-slate-500 font-semibold">What's on the board is what you pay — toll and tax all included.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {displayed.map((item, index) => (
            <div key={index} className="relative">
              {/* Signboard posts */}
              <div className="absolute -bottom-2 left-8 w-2.5 h-10 bg-slate-400 rounded-b-md hidden md:block" />
              <div className="absolute -bottom-2 right-8 w-2.5 h-10 bg-slate-400 rounded-b-md hidden md:block" />

              {/* NH green signboard */}
              <div className="relative rounded-2xl bg-green-800 border-4 border-white shadow-xl ring-2 ring-green-900/20 overflow-hidden">
                {/* Board header */}
                <div className="px-6 pt-5 pb-4 flex items-center justify-between gap-3 border-b-2 border-dashed border-green-600">
                  <div className="flex items-center gap-2.5 min-w-0 text-white">
                    <MapPin size={17} className="text-amber-300 shrink-0" />
                    <span className="font-black text-lg truncate uppercase tracking-wide">{item.start}</span>
                    <ArrowRight size={16} className="text-green-300 shrink-0" />
                    <span className="font-black text-lg truncate uppercase tracking-wide">{item.end}</span>
                  </div>
                  <span className="shrink-0 text-[10px] font-black uppercase tracking-wide bg-amber-300 text-green-900 px-2.5 py-1 rounded-md">
                    {item.tag}
                  </span>
                </div>

                {/* Fares — signboard rows */}
                <div className="p-5 space-y-2">
                  {item.prices.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl bg-green-700/60 hover:bg-green-700 px-4 py-3 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Car size={17} className="text-amber-300" />
                        <div>
                          <p className="text-sm font-black text-white">{p.car}</p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-green-200">{p.type}</p>
                        </div>
                      </div>
                      <p className="text-lg font-black text-amber-300">₹ {Number(p.price).toLocaleString()}</p>
                    </div>
                  ))}
                  {item.prices.length === 0 && (
                    <p className="text-sm text-green-200 font-semibold">Enquire for the rate.</p>
                  )}

                  <button
                    onClick={() => enquire(item)}
                    className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-green-800 text-sm font-black uppercase tracking-widest hover:bg-amber-300 transition-colors"
                  >
                    Book This Route <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {routes.length > 4 && (
          <div className="text-center mt-12">
            <button
              onClick={() => setShowMore(!showMore)}
              className="px-8 py-3 rounded-xl bg-green-700 text-white text-sm font-black uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(249,115,22,1)] transition-all"
            >
              {showMore ? "Show Less" : `View All ${routes.length} Routes`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
