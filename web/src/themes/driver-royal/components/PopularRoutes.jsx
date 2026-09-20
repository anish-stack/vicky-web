"use client";

import {
  ArrowRight,
  Car,
  CheckCircle2,
  Clock3,
  MapPin,
  Route,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

const vehicleConfig = [
  { 
    key: "mini", 
    name: "Mini",
    image: "https://i.ibb.co/R4gvL1cn/maruti-suzuki-ertiga-pearl-metallic-arctic-white-removebg-preview.png"
  },
  { 
    key: "sedan", 
    name: "Sedan",
    image: "https://i.ibb.co/R4gvL1cn/maruti-suzuki-ertiga-pearl-metallic-arctic-white-removebg-preview.png"
  },
  { 
    key: "suv", 
    name: "SUV",
    image: "https://i.ibb.co/R4gvL1cn/maruti-suzuki-ertiga-pearl-metallic-arctic-white-removebg-preview.png"
  },
  { 
    key: "innova", 
    name: "Prime SUV", 
    subName: "Innova",
    image: "https://i.ibb.co/R4gvL1cn/maruti-suzuki-ertiga-pearl-metallic-arctic-white-removebg-preview.png"
  },
];

export default function FixedRoutes() {
  const { website } = useWebsite();
  const basicInfo = website?.basicInfo || {};

  const rawWhatsapp =
    basicInfo.whatsapp || basicInfo.phone || "919876543210";
  const whatsapp = rawWhatsapp
    .toString()
    .replace(/\D/g, "")
    .replace(/^91(?=\d{10}$)/, "");

  const routes = website?.popularPrices || [];

  if (!routes.length) return null;

  const formatTripType = (type) => {
    if (!type) return "One Way";
    return type
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getVehicles = (route) => {
    return vehicleConfig
      .map((vehicle) => {
        const data = route?.[vehicle.key];
        if (!data || data.active === false) return null;
        return {
          ...vehicle,
          price: data.price || 0,
          allExclusive: data.allExclusive,
        };
      })
      .filter(Boolean);
  };

  const enquire = (route) => {
    const message = `*Route Fare Enquiry*

*${basicInfo.logo_name || basicInfo.name || ""}*

*Route:* ${route.start} → ${route.end}
*Trip Type:* ${formatTripType(route.type)}

Please share availability and booking details.`;

    window.open(
      `https://wa.me/91${whatsapp}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const duplicatedRoutes = [...routes, ...routes];

  return (
    <section
      id="routes"
      className="relative overflow-hidden bg-[#FFF9F4] py-10 md:py-14 lg:py-16"
    >
      {/* Background decorations */}
      <div className="pointer-events-none absolute -left-40 top-10 h-[280px] w-[280px] rounded-full bg-orange-100/60 blur-[90px]" />
      <div className="pointer-events-none absolute -right-40 bottom-10 h-[300px] w-[300px] rounded-full bg-blue-100/50 blur-[100px]" />

      <div className="relative mx-auto max-w-[1400px] px-3 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 md:mb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF0E7] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#FF641A]">
              <Route size={12} />
              Fixed Highway Rates
            </span>

            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.035em] text-[#071936] sm:text-3xl lg:text-[40px]">
              Simple Pricing. <span className="text-[#FF641A]">No Fare Surprises.</span>
            </h2>

            <p className="mt-1.5 max-w-xl text-xs leading-5 text-slate-500 md:text-sm">
              Transparent, fixed fares to your favourite destinations. Choose your vehicle and travel with confidence.
            </p>
          </div>

          <div className="hidden items-center gap-3 rounded-[16px] border border-blue-100 bg-white px-4 py-2.5 shadow-sm lg:flex">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-xs font-extrabold text-[#071936]">Transparent Pricing</p>
              <p className="text-[10px] text-slate-500">What you see is what you pay.</p>
            </div>
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">

          {/* AUTO-SLIDING HORIZONTAL CAROUSEL */}
          <div className="relative w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
            <div className="flex w-max animate-marquee gap-5 py-2 hover:[animation-play-state:paused]">
              {duplicatedRoutes.map((route, index) => {
                const vehicles = getVehicles(route);

                return (
                  <article
                    key={`${route.start}-${route.end}-${index}`}
                    className="group w-[320px] sm:w-[380px] shrink-0 rounded-[20px] border border-orange-100 bg-white p-4 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  >
                    {/* Top Row */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF0E7] px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#D94F0D]">
                        <Car size={11} />
                        {formatTripType(route.type)}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-[9px] font-semibold text-slate-500">
                        <Clock3 size={11} />
                        Fixed Fare
                      </span>
                    </div>

                    {/* ROUTE VISUAL */}
                    <div className="mt-3.5 rounded-[14px] bg-[#F8FAFC] px-3 py-3.5">
                      <div className="flex items-center">
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-1">
                            <MapPin size={10} className="text-[#FF641A]" />
                            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Pickup</span>
                          </div>
                          <h3 className="truncate text-sm font-extrabold text-[#071936] sm:text-base">
                            {route.start}
                          </h3>
                        </div>

                        <div className="mx-2 flex min-w-[60px] flex-1 items-center">
                          <span className="h-2 w-2 shrink-0 rounded-full border-[2px] border-[#FF641A] bg-white" />
                          <div className="relative mx-1 flex-1 border-t border-dashed border-slate-300">
                            <span className="absolute left-1/2 top-1/2 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-sm">
                              <Car size={11} className="text-[#071936]" />
                            </span>
                          </div>
                          <ArrowRight size={12} className="shrink-0 text-slate-400" />
                        </div>

                        <div className="min-w-0 flex-1 text-right">
                          <div className="mb-1 flex items-center justify-end gap-1">
                            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Destination</span>
                            <MapPin size={10} className="text-[#FF641A]" />
                          </div>
                          <h3 className="truncate text-sm font-extrabold text-[#071936] sm:text-base">
                            {route.end}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* VEHICLES GRID WITH IMAGES */}
                    <div className="mt-3.5">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#071936]">
                          Choose Your Cab
                        </p>
                        <span className="text-[9px] font-medium text-slate-400">
                          {vehicles.length} options
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {vehicles.map((vehicle) => (
                          <div
                            key={vehicle.key}
                            className="group/fare rounded-[12px] border border-slate-100 bg-[#FAFBFC] p-2.5 transition-all duration-300 hover:border-orange-200 hover:bg-[#FFF8F3]"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <div>
                                <p className="text-[10px] font-bold text-slate-600 line-clamp-1">
                                  {vehicle.name}
                                </p>
                                {vehicle.subName && (
                                  <p className="text-[8px] text-slate-400">
                                    ({vehicle.subName})
                                  </p>
                                )}
                              </div>
                              
                              {/* Vehicle Image Container */}
                              <div className="h-7 w-12 flex items-center justify-center shrink-0">
                                <img
                                  src={vehicle.image}
                                  alt={vehicle.name}
                                  className="h-full w-full object-contain transition-transform duration-300 group-hover/fare:scale-110"
                                />
                              </div>
                            </div>

                            <p className="mt-2 text-sm sm:text-base font-extrabold tracking-[-0.02em] text-[#071936]">
                              ₹{Number(vehicle.price).toLocaleString("en-IN")}
                            </p>
                            <p className="text-[8px] font-medium text-slate-400">
                              {vehicle.allExclusive ? "Excl. extras" : "All Inclusive"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA BUTTON */}
                    <button
                      type="button"
                      onClick={() => enquire(route)}
                      className="group/btn mt-3.5 flex h-10 w-full items-center justify-center gap-1.5 rounded-[12px] bg-[#FF641A] text-[11px] font-extrabold text-white shadow-sm transition-all duration-300 hover:bg-[#E95712]"
                    >
                      Enquire for this Route
                      <ArrowRight size={13} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </button>
                  </article>
                );
              })}
            </div>
          </div>

          {/* SIDEBAR - IMPROVED FONT SIZES & REDUCED SPACING */}
          <aside className="rounded-[20px] border border-orange-100 bg-[#FFF3E9] p-4 sm:p-5 lg:sticky lg:top-20">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#FF641A] shadow-sm">
              <WalletCards size={18} />
            </div>

            <h3 className="mt-2.5 text-base sm:text-lg font-extrabold tracking-[-0.025em] text-[#071936]">
              What&apos;s Included?
            </h3>
            <p className="mt-1 text-xs leading-4 text-slate-600">
              Clear pricing so you can plan your journey without unexpected surprises.
            </p>

            <div className="mt-3.5 space-y-2.5">
              {[
                { title: "Driver allowance included", desc: "Professional verified drivers" },
                { title: "Fuel charges included", desc: "No extra fuel costs" },
                { title: "Toll taxes included", desc: "Smooth highway journey" },
                { title: "No hidden booking fee", desc: "Transparent pricing" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                    <CheckCircle2 size={13} className="text-[#FF641A]" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-[#071936]">{item.title}</p>
                    <p className="text-[11px] leading-3.5 text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3.5 rounded-[14px] border border-white bg-white/80 p-3">
              <p className="text-xs font-extrabold text-[#071936]">Fixed fares. Greater peace of mind.</p>
              <p className="mt-0.5 text-[11px] leading-3.5 text-slate-500">Plan your trip with confidence, always.</p>
            </div>
          </aside>

        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 50s linear infinite;
        }
      `}</style>
    </section>
  );
}