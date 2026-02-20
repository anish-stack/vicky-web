"use client";

import React, { useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

/* ================= TYPES ================= */

type PriceType = {
  car: string;
  price: number;
  type: string;
};

type RouteType = {
  route: string;
  prices: PriceType[];
  distance?: string;
  duration?: string;
};

/* ================= STATIC FALLBACK ================= */

const staticRoutes: RouteType[] = [
  {
    route: "Delhi → Agra (One Way Drop)",
    prices: [
      { car: "Mini (WagonR)", price: 1800, type: "All Inclusive" },
      { car: "Sedan (Swift Dzire)", price: 2060, type: "All Inclusive" },
    ],
    distance: "230 km",
    duration: "4 hrs",
  },
  {
    route: "Delhi → Jaipur (One Way Drop)",
    prices: [
      { car: "Mini (WagonR)", price: 2500, type: "All Inclusive" },
      { car: "Sedan (Swift Dzire)", price: 2900, type: "All Inclusive" },
    ],
    distance: "280 km",
    duration: "5 hrs",
  },
  {
    route: "Delhi → Chandigarh (One Way Drop)",
    prices: [
      { car: "Sedan (Swift Dzire)", price: 3600, type: "All Inclusive" },
    ],
    distance: "250 km",
    duration: "5 hrs",
  },
];

/* ================= COMPONENT ================= */

const PopularRoutes = () => {
  const { website } = useWebsite();
  const [showMore, setShowMore] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string>("");

  /* ===== TRANSFORM DATA (SAME AS ONEWAYTRIP) ===== */
  // console.log("website?.popularPrices", website?.popularPrices);

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

      /* SORT LOW → HIGH */
      prices.sort((a, b) => a.price - b.price);

      return {
        route: `${r.start} → ${r.end} (${
          r.type === "one-way" ? "One Way Drop" : "Round Trip"
        })`,
        prices,
      };
    },
  );

  /* ===== DATA SOURCE ===== */

  const routes =
    transformedRoutes.length > 0 ? transformedRoutes : staticRoutes;

  const displayedRoutes = showMore ? routes : routes.slice(0, 3);

  const hasMore = routes.length > 3;

  /* ================= UI (UNCHANGED) ================= */

  return (
    <section id="routes" className="py-8 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        {/* HEADER */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-3">
            Popular Routes
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
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
                className="group bg-white dark:bg-gray-900 p-6 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
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
                      {route.route.split("→")[1].split("(")[0]}
                    </span>
                    <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                  </div>
                </div>

                {/* DETAILS */}
                <div className="space-y-3 mb-6">
                  <p className="text-sm text-gray-500">
                    {route.route.includes("(")
                      ? route.route.split("(")[1].replace(")", "")
                      : ""}
                  </p>
                </div>

                {/* ALL VEHICLE PRICES */}
                <ul className="space-y-2 text-sm text-gray-700 mb-5">
                  {route.prices?.map((p, i) => (
                    <li
                      key={i}
                      className="flex justify-between border-b pb-1 last:border-none"
                    >
                      <span>• {p.car}</span>

                      <span className="font-semibold">
                        ₹{p.price}{" "}
                        <span className="text-xs text-gray-500">
                          ({p.type})
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>

                {/* PRICE */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold">
                      ₹{cheapest?.price || "—"}
                    </span>
                    <p className="text-xs text-gray-500">Starting from</p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedRoute(route.route);
                      setOpenPopup(true);
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-4 rounded-lg font-semibold text-sm"
                  >
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
              onClick={() => setShowMore(!showMore)}
              className="px-6 py-2 border border-yellow-500 text-yellow-600 rounded-full hover:bg-yellow-500 hover:text-black transition"
            >
              {showMore ? "Show Less" : "More Routes"}
            </button>
          </div>
        )}

        {/* NOTE */}
        <p className="text-center text-xs text-gray-500 mt-8">
          Prices may vary by date, demand & tolls.
        </p>
      </div>
      <EnquiryPopup
        isOpen={openPopup}
        onClose={() => setOpenPopup(false)}
        route={selectedRoute}
      />
    </section>
  );
};

type FormDataType = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

const EnquiryPopup = ({
  isOpen,
  onClose,
  route,
}: {
  isOpen: boolean;
  onClose: () => void;
  route: string;
}) => {
  const { website } = useWebsite();

  const basicInfo = website?.basicInfo || {};
  const companyName = basicInfo.name || "Taxi Safar";
  const whatsapp = basicInfo.whatsapp || basicInfo.phone || "9876543210";

  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const text = `
📩 *New Route Enquiry - ${companyName}*

🛣 Route: ${route}

👤 Name: ${formData.name}
📞 Phone: ${formData.phone}
📧 Email: ${formData.email}

📝 Message:
${formData.message}
    `.trim();

    window.open(
      `https://wa.me/91${whatsapp}?text=${encodeURIComponent(text)}`,
      "_blank",
    );

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500"
        >
          ✕
        </button>

        <h3 className="text-lg font-bold mb-2">Enquiry for</h3>

        <p className="text-sm text-gray-600 mb-4">{route}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="input"
          />

          <input
            required
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="input"
          />

          <input
            required
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="input"
          />

          <textarea
            name="message"
            rows={3}
            placeholder="Your message..."
            value={formData.message}
            onChange={handleChange}
            className="input"
          />

          <button className="w-full bg-yellow-500 py-2 rounded-lg font-semibold">
            Send on WhatsApp
          </button>
        </form>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          outline: none;
        }
      `}</style>
    </div>
  );
};

export default PopularRoutes;
