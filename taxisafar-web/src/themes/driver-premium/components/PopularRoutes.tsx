import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

type PriceType = {
  car: string;
  price: number;
  type: string;
};

type RouteType = {
  route: string;
  prices: PriceType[];
};

const staticRoutes: RouteType[] = [
  {
    route: "Delhi → Agra (One Way Drop)",
    prices: [
      { car: "Sedan (Swift Dzire)", price: 2060, type: "All Inclusive" },
      { car: "SUV (Ertiga)", price: 2600, type: "All Exclusive" },
      { car: "Prime SUV (Innova Crysta)", price: 2900, type: "All Exclusive" },
    ],
  },
  {
    route: "Delhi → Jaipur (One Way Drop)",
    prices: [
      { car: "Sedan (Swift Dzire)", price: 2900, type: "All Inclusive" },
      { car: "SUV (Ertiga)", price: 3300, type: "All Exclusive" },
      { car: "Prime SUV (Innova Crysta)", price: 3800, type: "All Exclusive" },
    ],
  },
  {
    route: "Delhi → Chandigarh (One Way Drop)",
    prices: [
      { car: "Sedan (Swift Dzire)", price: 3600, type: "All Inclusive" },
      { car: "SUV (Ertiga)", price: 4200, type: "All Exclusive" },
      { car: "Prime SUV (Innova Crysta)", price: 4800, type: "All Exclusive" },
    ],
  },
];

const PopularRoutes: React.FC = () => {
  const { website } = useWebsite() as any;
  const [showMore, setShowMore] = useState(false);

  const transformedRoutes: RouteType[] = (website?.popularPrices || []).map(
    (r: any) => {
      const prices: PriceType[] = [];

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
          car: "SUV (Maruti Ertiga)",
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

      prices.sort((a, b) => a.price - b.price);

      return {
        route: `${r.start} → ${r.end} (${
          r.type === "one-way" ? "One Way Drop" : "Round Trip"
        })`,
        prices,
      };
    }
  );

  const routes = transformedRoutes.length > 0 ? transformedRoutes : staticRoutes;
  const displayed = showMore ? routes : routes.slice(0, 3);

  return (
    <section id="routes" className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-bold mb-4">
            Popular Routes
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">
            Popular One Way Drop Routes
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Transparent, all-inclusive pricing for our most requested outstation routes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((item, index) => (
            <div
              key={index}
              className="bg-gray-50 shadow-sm border border-gray-200 rounded-2xl p-5 hover:shadow-xl transition"
            >
              <h3 className="font-semibold text-base md:text-lg text-orange-600 mb-3">
                {item.route}
              </h3>

              <ul className="space-y-2 text-sm text-gray-700">
                {item.prices.map((p, i) => (
                  <li
                    key={i}
                    className="flex justify-between border-b border-gray-200 pb-1.5 last:border-none"
                  >
                    <span>• {p.car}</span>
                    <span className="font-semibold">
                      ₹{p.price}{" "}
                      <span className="text-xs text-gray-500">({p.type})</span>
                    </span>
                  </li>
                ))}
              </ul>

              <button className="mt-4 w-full px-4 py-2.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-2">
                Enquiry <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>

        {routes.length > 3 && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowMore(!showMore)}
              className="px-6 py-2.5 border border-orange-500 text-orange-600 rounded-full hover:bg-orange-500 hover:text-white transition"
            >
              {showMore ? "Show Less" : "More Routes"}
            </button>
          </div>
        )}

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
