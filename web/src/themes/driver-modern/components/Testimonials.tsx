"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";
import { useState, useEffect } from "react";

/* ================= STATIC FALLBACK ================= */

const staticTestimonials = [
  {
    name: "Priya Sharma",
    location: "Delhi",
    text: "Excellent service! Driver was punctual and polite.",
    rating: 5,
    avatar:
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
  },
  {
    name: "Rohit Mehta",
    location: "Mumbai",
    text: "Professional service and clean car.",
    rating: 5,
    avatar:
      "https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg",
  },
  {
    name: "Anjali Gupta",
    location: "Bangalore",
    text: "Very well organized tour package.",
    rating: 4,
    avatar:
      "https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg",
  },
  {
    name: "Vikram Singh",
    location: "Jaipur",
    text: "Outstanding family trip experience.",
    rating: 5,
    avatar:
      "https://images.pexels.com/photos/1484794/pexels-photo-1484794.jpeg",
  },
];

/* ================= AVATAR FALLBACK ================= */

const avatarPool = [
  "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
  "https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg",
  "https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg",
  "https://images.pexels.com/photos/1484794/pexels-photo-1484794.jpeg",
];

/* ================= COMPONENT ================= */

const Testimonials = () => {
  const { website } = useWebsite();
  // const website = []

  /* ===== TRANSFORM REVIEWS ===== */

  const dynamicReviews = (website?.reviews || []).map(
    (review: any, index: number) => ({
      name: review.name,
      text: review.text || review.review,
      rating: review.rating || 5,
      location:
        review.location ||
        [
          "Delhi",
          "Noida",
          "Gurgaon",
          "Faridabad",
          "Ghaziabad",
        ][index % 5],
      avatar:
        review.avatar ||
        avatarPool[index % avatarPool.length],
    })
  );

  const testimonials =
    dynamicReviews.length > 0
      ? dynamicReviews
      : staticTestimonials;

  /* ===== SLIDER LOGIC ===== */

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const slides = [];
  for (let i = 0; i < testimonials.length; i += 2) {
    slides.push(testimonials.slice(i, i + 2));
  }

  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex(
        (prev) => (prev + 1) % slides.length
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovered, slides.length]);

  /* ================= UI ================= */

  return (
    <section className="py-8 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">

        {/* HEADER */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-3">
            Customer Reviews
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold mb-2">
            Riders Love{" "}
            <span className="text-yellow-600">
              {website?.basicInfo?.name ||
                "Vicky Tour & Travels"}
            </span>
          </h2>

          <p className="text-l text-gray-600 max-w-3xl mx-auto">
            Real experiences from our happy customers.
          </p>
        </div>

        {/* SLIDER */}
        <div
          className="relative overflow-hidden"
          onMouseEnter={() =>
            setIsHovered(true)
          }
          onMouseLeave={() =>
            setIsHovered(false)
          }
        >
          <motion.div
            className="flex"
            animate={{
              x: `-${currentIndex * 100}%`,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            {slides.map((group, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-full grid md:grid-cols-2 gap-8"
              >
                {group.map((t:any, index:number
                ) => (
                  <div
                    key={index}
                    className="group bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl relative"
                  >
                    {/* Quote */}
                    <div className="absolute top-6 right-6 text-yellow-200">
                      <Quote className="h-8 w-8" />
                    </div>

                    {/* Rating */}
                    <div className="flex mb-4">
                      {[...Array(5)].map(
                        (_, starIndex) => (
                          <Star
                            key={starIndex}
                            className={`h-5 w-5 ${
                              starIndex <
                              t.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        )
                      )}
                    </div>

                    {/* Review */}
                    <p className="text-gray-700 mb-6 text-lg italic">
                      "{t.text}"
                    </p>

                    {/* User */}
                    <div className="flex items-center gap-4">
                      <img
                        src={t.avatar}
                        alt={t.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-yellow-300"
                      />
                      <div>
                        <h4 className="font-semibold">
                          {t.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {t.location}
                        </p>
                      </div>
                    </div>

                    {/* Bottom line */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-400 rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform"></div>
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        </div>

        {/* DOTS */}
        <div className="flex justify-center gap-2 mt-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() =>
                setCurrentIndex(index)
              }
              className={`rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 h-3 bg-yellow-500"
                  : "w-3 h-3 bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* STATS */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-yellow-500">
              500+
            </div>
            <div className="text-gray-600">
              Happy Customers
            </div>
          </div>

          <div>
            <div className="text-3xl font-bold text-yellow-500">
              4.9
            </div>
            <div className="text-gray-600">
              Average Rating
            </div>
          </div>

          <div>
            <div className="text-3xl font-bold">
              1000+
            </div>
            <div className="text-gray-600">
              Trips Completed
            </div>
          </div>

          <div>
            <div className="text-3xl font-bold">
              24/7
            </div>
            <div className="text-gray-600">
              Support
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
