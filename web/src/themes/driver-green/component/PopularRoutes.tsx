import React, { useState } from "react";
import { ArrowRight, Star, Landmark, IndianRupee, ShieldCheck, Percent, Headset, Car as CarIcon } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

type PriceType = {
  car: string;
  price: number;
  type: string;
};

type RouteType = {
  from: string;
  to: string;
  rating: number;
  prices: PriceType[];
};

const staticRoutes: RouteType[] = [
  {
    from: "Noida",
    to: "Jaipur",
    rating: 4.8,
    prices: [
      { car: "Mini (WagonR)", price: 3000, type: "All Inclusive" },
      { car: "Sedan (Swift Dzire)", price: 3300, type: "All Inclusive" },
      { car: "SUV (Maruti Ertiga)", price: 4500, type: "All Exclusive" },
      { car: "Prime SUV (Innova Crysta)", price: 6500, type: "All Exclusive" },
    ],
  },
  {
    from: "Delhi",
    to: "Agra",
    rating: 4.7,
    prices: [
      { car: "Mini (WagonR)", price: 2400, type: "All Inclusive" },
      { car: "Sedan (Swift Dzire)", price: 2700, type: "All Inclusive" },
      { car: "SUV (Maruti Ertiga)", price: 3800, type: "All Exclusive" },
      { car: "Prime SUV (Innova Crysta)", price: 5500, type: "All Exclusive" },
    ],
  },
  {
    from: "Lucknow",
    to: "Prayagraj",
    rating: 4.8,
    prices: [
      { car: "Mini (WagonR)", price: 2800, type: "All Inclusive" },
      { car: "Sedan (Swift Dzire)", price: 3100, type: "All Inclusive" },
      { car: "SUV (Maruti Ertiga)", price: 4300, type: "All Exclusive" },
      { car: "Prime SUV (Innova Crysta)", price: 6200, type: "All Exclusive" },
    ],
  },
  {
    from: "Chandigarh",
    to: "Shimla",
    rating: 4.9,
    prices: [
      { car: "Mini (WagonR)", price: 3200, type: "All Inclusive" },
      { car: "Sedan (Swift Dzire)", price: 3600, type: "All Inclusive" },
      { car: "SUV (Maruti Ertiga)", price: 5000, type: "All Exclusive" },
      { car: "Prime SUV (Innova Crysta)", price: 7000, type: "All Exclusive" },
    ],
  },
];

const trustBadges = [
  { icon: IndianRupee, title: "Best Price Guarantee", desc: "Get the best price for every ride" },
  { icon: Percent, title: "Toll & Parking Included", desc: "All tolls, parking & taxes are included" },
  { icon: Headset, title: "24x7 Support", desc: "We are here for you anytime, anywhere" },
  { icon: ShieldCheck, title: "Secure Booking", desc: "Your payments and data are 100% safe" },
];

const PopularRoutes: React.FC = () => {
  const { website } = useWebsite();
  const [showMore, setShowMore] = useState(false);

  const whatsappNumber =
    website?.basicInfo?.whatsapp || website?.basicInfo?.phone || "919876543210";

  const transformedRoutes: RouteType[] = (website?.popularPrices || []).map((r: any) => {
    const prices: PriceType[] = [];

    if (r.mini?.active) {
      prices.push({ car: "Mini (WagonR)", price: r.mini.price, type: r.mini.allExclusive ? "All Exclusive" : "All Inclusive" });
    }
    if (r.sedan?.active) {
      prices.push({ car: "Sedan (Swift Dzire)", price: r.sedan.price, type: r.sedan.allExclusive ? "All Exclusive" : "All Inclusive" });
    }
    if (r.suv?.active) {
      prices.push({ car: "SUV (Maruti Ertiga)", price: r.suv.price, type: r.suv.allExclusive ? "All Exclusive" : "All Inclusive" });
    }
    if (r.innova?.active) {
      prices.push({ car: "Prime SUV (Innova Crysta)", price: r.innova.price, type: r.innova.allExclusive ? "All Exclusive" : "All Inclusive" });
    }

    prices.sort((a, b) => a.price - b.price);

    return {
      from: r.start,
      to: r.end,
      rating: r.rating || 4.8,
      prices,
    };
  });

  const routes = transformedRoutes.length > 0 ? transformedRoutes : staticRoutes;
  const displayed = showMore ? routes : routes.slice(0, 4);

  const openWhatsApp = (route: RouteType) => {
    const message = `Hi, I'd like to enquire about the ${route.from} to ${route.to} route. Could you share the fare details and availability?`;
    const whatsappURL = `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, "_blank");
  };

  return (
    <section id="routes" className="py-16 md:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header + hero image */}
        <div className="relative rounded-3xl overflow-hidden mb-12 bg-gradient-to-br from-sky-50 to-emerald-50">
          {/* bg image - right side on desktop, full width faded on mobile */}
          <div
            className="absolute inset-0 sm:left-[30%] bg-cover bg-center sm:bg-right opacity-25 sm:opacity-100"
            style={{ backgroundImage: "url('/route-hero.png')" }}
          />
          {/* readability gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 sm:via-white/60 to-transparent" />
          <div className="absolute inset-0 sm:hidden bg-white/40" />

          <div className="relative px-5 sm:px-10 py-8 sm:py-14 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-5">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-emerald-700" /> Popular Routes
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-gray-900 mb-3 sm:mb-4 leading-tight">
              Popular One Way <br />
              <span className="text-emerald-600">Drop Routes</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-md mb-6 sm:mb-7 leading-relaxed">
              Transparent, all-inclusive pricing for our most requested outstation routes.
            </p>
            <div className="flex flex-wrap gap-4 sm:gap-6">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <IndianRupee className="w-4 h-4 text-emerald-700" />
                </span>
                <div className="text-xs sm:text-sm">
                  <p className="font-bold text-gray-900 leading-tight">All Inclusive</p>
                  <p className="text-gray-500 text-[11px] sm:text-xs">No Hidden Charges</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-2.5">
                <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                </span>
                <div className="text-xs sm:text-sm">
                  <p className="font-bold text-gray-900 leading-tight">Safe & Reliable</p>
                  <p className="text-gray-500 text-[11px] sm:text-xs">Verified Drivers</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-2.5">
                <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CarIcon className="w-4 h-4 text-emerald-700" />
                </span>
                <div className="text-xs sm:text-sm">
                  <p className="font-bold text-gray-900 leading-tight">On Time</p>
                  <p className="text-gray-500 text-[11px] sm:text-xs">Every Time</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Route cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {displayed.map((item, index) => (
            <div
              key={index}
              className="bg-white shadow-sm border border-gray-100 rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Landmark className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-sm font-bold text-gray-700 ml-1">{item.rating}</span>
                </div>
              </div>

              <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                {item.from} <ArrowRight className="w-4 h-4 text-emerald-500" /> {item.to}
              </h3>

              <ul className="space-y-2 text-sm text-gray-700 mb-5">
                {item.prices.map((p, i) => (
                  <li key={i} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-none">
                    <span className="flex items-center gap-2 text-gray-600">
                      <CarIcon className="w-3.5 h-3.5 text-emerald-500" />
                      {p.car}
                    </span>
                    <span className="font-bold text-gray-900">₹{p.price}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => openWhatsApp(item)}
                className="w-full px-4 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                Enquiry <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>

        {routes.length > 4 && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowMore(!showMore)}
              className="px-6 py-2.5 border-2 border-emerald-600 text-emerald-700 font-bold rounded-full hover:bg-emerald-600 hover:text-white transition-colors duration-200"
            >
              {showMore ? "Show Less" : "More Routes"}
            </button>
          </div>
        )}

        {/* Trust badges strip */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-8 mt-8 sm:mt-10">
  {trustBadges.map((b, i) => (
    <div key={i} className="flex items-start gap-2 sm:gap-3">
      {/* Icon */}
      <span className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
        <b.icon className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
      </span>

      {/* Content */}
      <div>
        <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight mb-0.5">
          {b.title}
        </p>

        <p className="text-[10px] sm:text-xs text-gray-500 leading-snug">
          {b.desc}
        </p>
      </div>
    </div>
  ))}
</div>

        <p className="text-center text-xs text-gray-500 mt-8">
          Prices are indicative and may vary by date, demand, season, and exact
          inclusions (tolls, parking, GST extra where applicable). Contact for latest
          quotes.
        </p>
      </div>
    </section>
  );
};

export default PopularRoutes;