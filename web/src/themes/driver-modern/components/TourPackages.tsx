"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ArrowRight, ArrowDown } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

/* ================= FALLBACK TOURS ================= */

const initialTours = [
  {
    id: 1,
    title: "Haridwar Darshan",
    description:
      "Experience the divine beauty of Haridwar with our spiritual journey package.",
    image:
      "https://images.pexels.com/photos/3881104/pexels-photo-3881104.jpeg",
    price: "₹ 6,999",
    duration: "2 Days",
    rating: 4.8,
    features: ["Temple visits", "Ganga Aarti", "Local sightseeing"],
  },
  {
    id: 2,
    title: "Haridwar + Rishikesh",
    description:
      "Combined spiritual and adventure tour covering both holy cities.",
    image:
      "https://images.pexels.com/photos/12753820/pexels-photo-12753820.jpeg",
    price: "₹ 8,999",
    duration: "3 Days",
    rating: 4.9,
    features: ["River rafting", "Yoga sessions", "Adventure sports"],
  },
  {
    id: 3,
    title: "Agra Taj Mahal Tour",
    description:
      "Witness the magnificent beauty of the Taj Mahal.",
    image:
      "https://images.pexels.com/photos/1583339/pexels-photo-1583339.jpeg",
    price: "₹ 12,999",
    duration: "2 Days",
    rating: 4.7,
    features: ["Taj Mahal", "Agra Fort", "Local cuisine"],
  },
  {
    id: 4,
    title: "Golden Triangle",
    description:
      "Delhi, Agra & Jaipur complete heritage tour.",
    image:
      "https://images.pexels.com/photos/3881104/pexels-photo-3881104.jpeg",
    price: "₹ 24,999",
    duration: "5 Days",
    rating: 4.9,
    features: ["Historical sites", "Culture", "Shopping"],
  },
];

/* ================= ANIMATION ================= */

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 80, damping: 15 },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function TourPackages() {
  const { website } = useWebsite();
  // const website = []

  /* ================= REAL PACKAGES ================= */

  const realPackages = website?.packages || [];

  const formattedRealPackages = realPackages.map(
    (pkg: any, index: number) => ({
      id: `real-${index}`,
      title: pkg.title || "Package",
      image:
        pkg.image ||
        "https://via.placeholder.com/800x500?text=Tour",
      description:
        pkg.description ||
        "Comfortable cab tour with experienced driver",
      duration: pkg.duration || "Custom Duration",
      price: `₹ ${Number(pkg.price || 0).toLocaleString()}`,
      rating: 4.8,
      features: ["Cab Included", "Driver", "Sightseeing"],
    })
  );

  /* ================= DATA SOURCE ================= */

  const sourceTours =
    formattedRealPackages.length > 0
      ? formattedRealPackages
      : initialTours;

  /* ================= VIEW MORE ================= */

  const [showMore, setShowMore] = useState(false);

  const displayedTours = showMore
    ? sourceTours
    : sourceTours.slice(0, 6);

  const hasMore = sourceTours.length > 6;

  /* ================= UI ================= */

  return (
    <section
      id="tours"
      className="py-8 bg-white dark:bg-gray-900"
    >
      <div className="max-w-7xl mx-auto px-4">

        {/* HEADER */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            Popular Tours
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Explore with{" "}
            <span className="text-yellow-500">
              {website?.basicInfo?.name ||
                "Vicky Tour & Travels"}
            </span>
          </h2>

          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Discover incredible destinations with our curated
            tour packages.
          </p>
        </div>

        {/* GRID */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence>
            {displayedTours.map((pkg: any) => (
              <motion.div
                key={pkg.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: 20 }}
                className="group bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700"
              >
                {/* IMAGE */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />

                  <div className="absolute top-4 right-4 bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {pkg.duration}
                  </div>

                  <div className="absolute bottom-4 left-4 flex items-center">
                    <div className="flex items-center bg-white/90 px-2 py-1 rounded-full text-sm">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      {pkg.rating}
                    </div>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {pkg.title}
                    </h3>

                    <span className="text-2xl font-bold text-yellow-500">
                      {pkg.price}
                    </span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {pkg.description}
                  </p>

                  {/* FEATURES */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {pkg.features?.map(
                      (feature: string, i: number) => (
                        <span
                          key={i}
                          className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium"
                        >
                          {feature}
                        </span>
                      )
                    )}
                  </div>

                  {/* CTA */}
                  <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-3 px-6 rounded-xl font-semibold flex items-center justify-center space-x-2">
                    <span>Enquiry Now</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* VIEW MORE */}
        {hasMore && !showMore && (
          <div className="text-center mt-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowMore(true)}
              className="px-6 py-3 border border-yellow-500 text-yellow-600 rounded-full hover:bg-yellow-500 hover:text-black flex items-center gap-3 mx-auto"
            >
              View More Tours
              <ArrowDown className="animate-bounce" />
            </motion.button>
          </div>
        )}
      </div>
    </section>
  );
}
