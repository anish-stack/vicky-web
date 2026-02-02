import { useWebsite } from "@/context/WebsiteContext";
import React, { useState } from "react";

const staticRoutes = [
  {
    route: "Delhi → Agra (One Way Drop)",
    prices: [
      { car: "Mini (WagonR)", price: 1800, type: "All Inclusive" },
      { car: "Sedan (Swift Dzire)", price: 2060, type: "All Inclusive" },
      { car: "SUV (Ertiga)", price: 2600, type: "All Exclusive" },
      { car: "Prime SUV (Innova Crysta)", price: 2900, type: "All Exclusive" },
    ],
  },
  {
    route: "Delhi → Jaipur (One Way Drop)",
    prices: [
      { car: "Mini (WagonR)", price: 2500, type: "All Inclusive" },
      { car: "Sedan (Swift Dzire)", price: 2900, type: "All Inclusive" },
      { car: "SUV (Ertiga)", price: 3300, type: "All Exclusive" },
      { car: "Prime SUV (Innova Crysta)", price: 3800, type: "All Exclusive" },
    ],
  },
  {
    route: "Delhi → Chandigarh (One Way Drop)",
    prices: [
      { car: "Mini (WagonR)", price: 3200, type: "All Inclusive" },
      { car: "Sedan (Swift Dzire)", price: 3600, type: "All Inclusive" },
      { car: "SUV (Ertiga)", price: 4200, type: "All Exclusive" },
      { car: "Prime SUV (Innova Crysta)", price: 4800, type: "All Exclusive" },
    ],
  },
];

const OneWayTrip = () => {
  const [showMore, setShowMore] = useState(false);
  const { website } = useWebsite();

  const transformedRoutes = (website?.popularPrices || []).map((r) => {
    const prices = [];

    if (r.mini?.active) {
      prices.push({
        car: "Mini (WagonR)",
        price: r.mini.price,
        type: r.mini.allExclusive ? "All Exclusive" : "All Inclusive",
      });
    }

    if (r.sedan?.active) {
      prices.push({
        car: "Sedan (Swift Dzire)",
        price: r.sedan.price,
        type: r.sedan.allExclusive ? "All Exclusive" : "All Inclusive",
      });
    }

    if (r.suv?.active) {
      prices.push({
        car: "SUV (Ertiga)",
        price: r.suv.price,
        type: r.suv.allExclusive ? "All Exclusive" : "All Inclusive",
      });
    }

    if (r.innova?.active) {
      prices.push({
        car: "Prime SUV (Innova Crysta)",
        price: r.innova.price,
        type: r.innova.allExclusive ? "All Exclusive" : "All Inclusive",
      });
    }

    if (r.traveller?.active) {
      prices.push({
        car: "Traveller",
        price: r.traveller.price,
        type: r.traveller.allExclusive ? "All Exclusive" : "All Inclusive",
      });
    }

    prices.sort((a, b) => a.price - b.price);

    return {
      route: `${r.start} → ${r.end} (${r.type === "one-way" ? "One Way Drop" : "Round Trip"})`,
      prices,
    };
  });

  const routes = transformedRoutes.length > 0 ? transformedRoutes : staticRoutes;

  return (
    <section className="bg-gradient-to-b from-white to-red-50 py-6 md:py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          Popular One Way Drop Routes Price
        </h2>

        {/* GRID 3 COLUMNS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(showMore ? routes : routes.slice(0, 3)).map((item, index) => (
            <div
              key={index}
              className="bg-white shadow-lg border border-gray-200 rounded-xl p-5 hover:shadow-2xl transition"
            >
              <h3 className="font-semibold text-lg text-red-600 mb-3">
                {item.route}
              </h3>

              <ul className="space-y-2 text-sm text-gray-700">
                {item.prices.map((p, i) => (
                  <li
                    key={i}
                    className="flex justify-between border-b pb-1 last:border-none"
                  >
                    <span>• {p.car}</span>
                    <span className="font-semibold">
                      ₹{p.price}{" "}
                      <span className="text-xs text-gray-500">({p.type})</span>
                    </span>
                  </li>
                ))}
              </ul>

              <button className="mt-4 w-full px-4 py-2.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition">
                Enquiry
              </button>
            </div>
          ))}
        </div>

        {/* More Button - only show if more than 3 routes */}
        {routes.length > 3 && (
          <div className="text-center mt-6">
            <button
              onClick={() => setShowMore(!showMore)}
              className="px-6 py-2 border border-red-600 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition"
            >
              {showMore ? "Show Less" : "More Routes"}
            </button>
          </div>
        )}

        {/* Optional small disclaimer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Prices are indicative and may vary by date, demand, season, and exact inclusions (tolls, parking, GST extra where applicable). Contact for latest quotes.
        </p>
      </div>
    </section>
  );
};

export default OneWayTrip;