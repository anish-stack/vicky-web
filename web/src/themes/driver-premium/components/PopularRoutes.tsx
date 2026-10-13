import React, { useState } from "react";
import { ArrowRight, ArrowRightLeft, Car, ChevronDown, ChevronUp, Info } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

type PriceType = {
  car: string;
  price: number;
  type: string;
};

type RouteType = {
  id: string;
  start: string;
  end: string;
  tripType: string;
  prices: PriceType[];
};

const INCLUSIVE = "All Inclusive";
const EXCLUSIVE = "All Exclusive";

const staticRoutes: RouteType[] = [
  {
    id: "delhi-agra",
    start: "Delhi",
    end: "Agra",
    tripType: "One Way Drop",
    prices: [
      { car: "Sedan (Swift Dzire)", price: 2060, type: INCLUSIVE },
      { car: "SUV (Ertiga)", price: 2600, type: EXCLUSIVE },
      { car: "Prime SUV (Innova Crysta)", price: 2900, type: EXCLUSIVE },
    ],
  },
  {
    id: "delhi-jaipur",
    start: "Delhi",
    end: "Jaipur",
    tripType: "One Way Drop",
    prices: [
      { car: "Sedan (Swift Dzire)", price: 2900, type: INCLUSIVE },
      { car: "SUV (Ertiga)", price: 3300, type: EXCLUSIVE },
      { car: "Prime SUV (Innova Crysta)", price: 3800, type: EXCLUSIVE },
    ],
  },
  {
    id: "delhi-chandigarh",
    start: "Delhi",
    end: "Chandigarh",
    tripType: "One Way Drop",
    prices: [
      { car: "Sedan (Swift Dzire)", price: 3600, type: INCLUSIVE },
      { car: "SUV (Ertiga)", price: 4200, type: EXCLUSIVE },
      { car: "Prime SUV (Innova Crysta)", price: 4800, type: EXCLUSIVE },
    ],
  },
];

const carDefs = [
  { key: "mini", label: "Mini (WagonR)" },
  { key: "sedan", label: "Sedan (Swift Dzire)" },
  { key: "suv", label: "SUV (Maruti Ertiga)" },
  { key: "innova", label: "Prime SUV (Innova Crysta)" },
];

const formatPrice = (value: number) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

type Props = {
  onEnquiry?: (subject?: string) => void;
};

const PopularRoutes: React.FC<Props> = ({ onEnquiry }) => {
  const { website } = useWebsite() as any;
  const [showMore, setShowMore] = useState(false);

  const rawRoutes: any[] = Array.isArray(website?.popularPrices) ? website.popularPrices : [];

  const transformedRoutes: RouteType[] = rawRoutes.map((r, index) => {
    const prices: PriceType[] = [];

    carDefs.forEach(({ key, label }) => {
      const item = r[key];
      if (item?.active) {
        prices.push({
          car: label,
          price: Number(item.price) || 0,
          type: item.allExclusive ? EXCLUSIVE : INCLUSIVE,
        });
      }
    });

    prices.sort((a, b) => a.price - b.price);

    return {
      id: `real-${index}-${r.start}-${r.end}`,
      start: r.start || "—",
      end: r.end || "—",
      tripType: r.type === "one-way" ? "One Way Drop" : "Round Trip",
      prices,
    };
  });

  const routes = transformedRoutes.length > 0 ? transformedRoutes : staticRoutes;
  const INITIAL_COUNT = 3;
  const displayed = showMore ? routes : routes.slice(0, INITIAL_COUNT);

  return (
    <section
      id="routes"
      className="relative overflow-hidden bg-gradient-to-b from-white via-orange-50/40 to-white py-16 md:py-24"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-14">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-600 sm:text-sm">
            <Car className="h-4 w-4" />
            Popular Routes
          </span>
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Outstation Cabs at <span className="text-orange-500">Clear Prices</span>
          </h2>
          <p className="text-base text-gray-600 sm:text-lg">
            Transparent fares for our most requested outstation routes. Pick your
            car and enquire in a click.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayed.map((item) => {
            const lowest = item.prices[0]?.price;
            const subject = `${item.start} → ${item.end} (${item.tripType})`;

            return (
              <article
                key={item.id}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-100"
              >
                {/* Route header */}
                <div
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                  style={{ padding: "14px 16px" }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 text-[11px] font-semibold uppercase leading-none tracking-wide" style={{ padding: "5px 10px" }}>
                      <ArrowRightLeft className="h-3 w-3" />
                      {item.tripType}
                    </span>
                    {lowest !== undefined && (
                      <span className="whitespace-nowrap text-xs font-medium leading-none text-orange-50">
                        From <b className="text-sm font-extrabold text-white">{formatPrice(lowest)}</b>
                      </span>
                    )}
                  </div>

                  <h3
                    className="flex flex-wrap items-center gap-x-2 text-lg font-bold leading-tight tracking-normal text-white"
                    style={{ margin: "10px 0 0" }}
                  >
                    <span>{item.start}</span>
                    <ArrowRight className="h-4 w-4 flex-shrink-0" />
                    <span>{item.end}</span>
                  </h3>
                </div>

                {/* Price list */}
                <ul
                  className="flex-1 list-none"
                  style={{ margin: 0, padding: "6px 16px" }}
                >
                  {item.prices.length === 0 && (
                    <li className="py-4 text-sm text-gray-500">
                      Prices on request. Tap enquire for a quote.
                    </li>
                  )}
                  {item.prices.map((p, i) => (
                    <li
                      key={`${p.car}-${i}`}
                      className="flex items-center justify-between gap-3 border-b border-gray-100 last:border-b-0"
                      style={{ padding: "11px 0" }}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-orange-50">
                          <Car className="h-4 w-4 text-orange-500" />
                        </span>
                        <span className="text-[13px] font-medium leading-snug text-gray-800">
                          {p.car}
                        </span>
                      </span>

                      <span className="flex-shrink-0 text-right leading-none">
                        <span className="block text-base font-extrabold text-gray-900">
                          {formatPrice(p.price)}
                        </span>
                        <span
                          className={`mt-1 inline-block rounded-full text-[10px] font-semibold leading-none ${p.type === INCLUSIVE
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                            }`}
                          style={{ padding: "3px 7px", marginTop: 5 }}
                        >
                          {p.type}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div style={{ padding: "6px 16px 16px" }}>
                  <button
                    type="button"
                    onClick={() => onEnquiry?.(subject)}
                    className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-orange-500 text-sm font-semibold leading-none text-white shadow-sm transition-all hover:bg-orange-600 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 active:scale-[0.98]"
                    style={{ padding: "12px 16px" }}
                  >
                    Enquire Now
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Show more / less */}
        {routes.length > INITIAL_COUNT && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setShowMore((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full border-2 border-orange-500 px-7 py-2.5 text-sm font-semibold text-orange-600 transition-all hover:bg-orange-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
            >
              {showMore ? "Show Fewer Routes" : "View More Routes"}
              {showMore ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mx-auto mt-10 flex max-w-3xl items-start gap-2 rounded-xl bg-gray-50 p-3 text-left text-xs leading-relaxed text-gray-500 ring-1 ring-gray-100">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-400" />
          <p style={{ margin: 0 }}>
            Prices are indicative and may vary by date, demand, season and exact
            inclusions. Tolls, parking and GST may be extra where applicable.
            Contact us for the latest quote.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PopularRoutes;