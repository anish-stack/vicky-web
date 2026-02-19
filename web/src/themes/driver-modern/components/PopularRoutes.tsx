"use client";

import React, { useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

/* ================= STATIC FALLBACK ================= */

const staticRoutes = [
  {
    route: "Delhi → Dehradun (One Way Drop)",
    prices: [{ car: "Sedan", price: 6500, type: "All Inclusive" }],
    distance: "248 km",
    duration: "5-6 hrs",
  },
  {
    route: "Delhi → Haridwar",
    prices: [{ car: "Sedan", price: 5800, type: "All Inclusive" }],
    distance: "214 km",
    duration: "4-5 hrs",
  },
  {
    route: "Delhi → Rishikesh",
    prices: [{ car: "Sedan", price: 6200, type: "All Inclusive" }],
    distance: "243 km",
    duration: "5 hrs",
  },
  {
    route: "Delhi → Mussoorie",
    prices: [{ car: "SUV", price: 7500, type: "All Inclusive" }],
    distance: "290 km",
    duration: "6-7 hrs",
  },
];

/* ================= COMPONENT ================= */

const PopularRoutes = () => {
  const { website } = useWebsite();
  // const website = []
  const [showMore, setShowMore] = useState(false);

  /* ===== TRANSFORM REAL DATA ===== */

  const transformedRoutes = (website?.popularPrices || []).map(
    (r: any) => {
      const prices: any[] = [];

      if (r.mini?.active) {
        prices.push({
          car: "Mini",
          price: r.mini.price,
          type: r.mini.allExclusive
            ? "All Exclusive"
            : "All Inclusive",
        });
      }

      if (r.sedan?.active) {
        prices.push({
          car: "Sedan",
          price: r.sedan.price,
          type: r.sedan.allExclusive
            ? "All Exclusive"
            : "All Inclusive",
        });
      }

      if (r.suv?.active) {
        prices.push({
          car: "SUV",
          price: r.suv.price,
          type: r.suv.allExclusive
            ? "All Exclusive"
            : "All Inclusive",
        });
      }

      if (r.innova?.active) {
        prices.push({
          car: "Innova",
          price: r.innova.price,
          type: r.innova.allExclusive
            ? "All Exclusive"
            : "All Inclusive",
        });
      }

      prices.sort((a, b) => a.price - b.price);

      return {
        route: `${r.start} → ${r.end} (${
          r.type === "one-way"
            ? "One Way Drop"
            : "Round Trip"
        })`,
        prices,
        distance: r.distance || "—",
        duration: r.duration || "—",
      };
    }
  );

  /* ===== DATA SOURCE ===== */

  const routes =
    transformedRoutes.length > 0
      ? transformedRoutes
      : staticRoutes;

  const displayedRoutes = showMore
    ? routes
    : routes.slice(0, 3);

  const hasMore = routes.length > 3;

  /* ================= UI ================= */

  return (
    <section
      id="routes"
      className="py-8 bg-gray-50 dark:bg-gray-800"
    >
      <div className="max-w-7xl mx-auto px-4">

        {/* HEADER */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            Popular Routes
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Popular One Way Drop Routes Price
          </h2>

          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Transparent pricing for popular destinations.
          </p>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedRoutes.map((route, index) => {
            const cheapest = route.prices?.[0];

            return (
              <div
                key={index}
                className="group bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
              >
                {/* ROUTE */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="font-semibold">
                      {route.route.split("→")[0]}
                    </span>
                  </div>

                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-yellow-500" />

                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">
                      {
                        route.route
                          .split("→")[1]
                          .split("(")[0]
                      }
                    </span>
                    <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                  </div>
                </div>

                {/* DETAILS */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    {route.distance} • {route.duration}
                  </div>

                  <p className="text-sm text-gray-500">
                    {route.route.includes("(")
                      ? route.route
                          .split("(")[1]
                          .replace(")", "")
                      : ""}
                  </p>
                </div>

                {/* PRICE */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold">
                      ₹{cheapest?.price || "—"}
                    </span>
                    <p className="text-xs text-gray-500">
                      Starting from
                    </p>
                  </div>

                  <button className="bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-4 rounded-lg font-semibold text-sm">
                    Enquiry
                  </button>
                </div>

                {/* LINE */}
                <div className="mt-4 h-1 bg-yellow-200 rounded-full group-hover:bg-yellow-400 transition-all"></div>
              </div>
            );
          })}
        </div>

        {/* SHOW MORE */}
        {hasMore && (
          <div className="text-center mt-10">
            <button
              onClick={() =>
                setShowMore(!showMore)
              }
              className="px-6 py-2 border border-yellow-500 text-yellow-600 rounded-full hover:bg-yellow-500 hover:text-black transition"
            >
              {showMore
                ? "Show Less"
                : "More Routes"}
            </button>
          </div>
        )}

        {/* NOTE */}
        <p className="text-center text-xs text-gray-500 mt-8">
          Prices may vary by date, demand & tolls.
        </p>
      </div>
    </section>
  );
};

export default PopularRoutes;
