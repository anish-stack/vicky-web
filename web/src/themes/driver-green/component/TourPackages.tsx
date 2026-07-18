import React, { useState } from "react";
import {
  MapPin,
  Clock,
  ArrowRight,
  ArrowDown,
  Shield,
  Car,
  Users,
  Headphones,
} from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

const staticPackages = [
  {
    id: 1,
    title: "Haridwar + Rishikesh",
    location: "Custom Route",
    duration: "1 Day",
    image:
      "https://images.pexels.com/photos/1141853/pexels-photo-1141853.jpeg?auto=compress&cs=tinysrgb&w=700",
    description: "Ganga Aarti + Laxman Jhula, Ram Jhula & Beatles Ashram",
    price: "₹\n5,999",
    priceRaw: "5,999",
  },
  {
    id: 2,
    title: "Agra Taj Mahal Tour",
    location: "Custom Route",
    duration: "1 Day",
    image:
      "https://images.pexels.com/photos/1583339/pexels-photo-1583339.jpeg?auto=compress&cs=tinysrgb&w=700",
    description: "Taj Mahal, Agra Fort & Mehtab Bagh sunrise/sunset",
    price: "₹\n8,499",
    priceRaw: "8,499",
  },
  {
    id: 3,
    title: "Mathura Vrindavan Yatra",
    location: "Custom Route",
    duration: "1 Day",
    image:
      "https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?auto=compress&cs=tinysrgb&w=700",
    description: "Krishna Janmabhoomi, Banke Bihari, ISKCON & Prem Mandir",
    price: "₹\n6,499",
    priceRaw: "6,499",
  },
  {
    id: 4,
    title: "Rishikesh Adventure",
    location: "Custom Route",
    duration: "1-2 Days",
    image:
      "https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=700",
    description: "River Rafting + Yoga, Ganga Aarti & waterfalls",
    price: "₹\n7,999",
    priceRaw: "7,999",
  },
];

const trustItems = [
  {
    Icon: Shield,
    label: "Best Price Guarantee",
    sub: "Get the best prices for amazing experiences.",
  },
  {
    Icon: Car,
    label: "Comfortable Rides",
    sub: "Well-maintained vehicles for a smooth journey.",
  },
  {
    Icon: Users,
    label: "Professional Drivers",
    sub: "Experienced & verified drivers for your safety.",
  },
  {
    Icon: Headphones,
    label: "24/7 Support",
    sub: "We are here to help you anytime, anywhere.",
  },
];

const TourPackages: React.FC = () => {
  const { website } = useWebsite();
  const [showMore, setShowMore] = useState(false);

  const realPackages = website?.packages || [];

  const formattedRealPackages = realPackages.map((pkg: any, index: number) => ({
    id: `real-${pkg.title || index}`,
    title: pkg.title || "Package",
    location: pkg.location || "Custom Route",
    image: pkg.image || "https://via.placeholder.com/700x500?text=Tour",
    description:
      pkg.description || "Comfortable cab tour with an experienced driver.",
    duration: pkg.duration || "Custom",
    price: `₹\n${Number(pkg.price || 0).toLocaleString()}`,
    priceRaw: Number(pkg.price || 0).toLocaleString(),
  }));

  const sourcePackages =
    formattedRealPackages.length > 0 ? formattedRealPackages : staticPackages;

  const displayed = showMore ? sourcePackages : sourcePackages.slice(0, 5);
  const hasMore = sourcePackages.length > 4;

  return (
    <section
      id="tours"
      className="relative py-16 md:py-24 overflow-hidden"
      style={{ isolation: "isolate" }}
    >
      {/* Sticky parallax background */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: "url('/destin.png')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundAttachment: "fixed",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Light scrim so cards stay readable */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.30) 30%, rgba(255,255,255,0.30) 70%, rgba(255,255,255,0.55) 100%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-emerald-200 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold mb-5 shadow-sm">
            <span className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z" />
              </svg>
            </span>
            Tour Packages
          </div>

          <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            Discover Amazing{" "}
            <span className="text-emerald-600 relative inline-block">
              Destinations
              <span
                className="absolute -bottom-1 left-0 w-full h-1 rounded-full bg-emerald-400/50"
                style={{ transform: "scaleX(1)" }}
              />
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Explore incredible destinations with our curated tour packages
            featuring comfortable vehicles and professional drivers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 xl:gap-7">
          {displayed.map((pkg: any) => (
            <div
              key={pkg.id}
              className="group relative bg-white rounded-[28px] overflow-hidden shadow-[0_2px_20px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_40px_-8px_rgba(16,185,129,0.25)] ring-1 ring-slate-100 hover:ring-emerald-200 transition-all duration-500 hover:-translate-y-1.5 flex flex-col"
            >
              {/* Image */}
              <div className="relative overflow-hidden h-52 sm:h-56">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="w-full h-full object-cover scale-105 group-hover:scale-115 transition-transform duration-700 ease-out"
                />
                {/* gradient wash for legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0" />

                {/* Duration badge */}
                <span className="absolute top-3.5 left-3.5 flex items-center gap-1.5 bg-white/90 backdrop-blur-md text-emerald-700 px-3 py-1.5 rounded-full text-[11px] font-bold shadow-sm">
                  <Clock className="w-3 h-3" />
                  {pkg.duration}
                </span>

                {/* Price pill floating on image */}
                <span className="absolute bottom-3.5 right-3.5 bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg">
                  <span className="text-emerald-400">₹</span> {pkg.priceRaw}
                </span>

                {/* Location, overlaid on image bottom-left */}
                <div className="absolute bottom-3.5 left-3.5 flex items-center gap-1.5 text-white text-xs font-semibold drop-shadow">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="truncate max-w-[140px]">{pkg.location}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-extrabold text-slate-900 mb-2 leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
                  {pkg.title}
                </h3>

                <p className="text-sm text-slate-500 mb-6 leading-relaxed line-clamp-2 flex-grow">
                  {pkg.description}
                </p>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-end justify-between gap-4">
                  {/* Price */}
                  <div>
                    <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Starting From
                    </p>

                    <div className="flex items-start mt-1">
                      <span className="text-emerald-600 text-sm font-bold mt-1">
                        ₹
                      </span>
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-none ml-1">
                        {pkg.priceRaw}
                      </span>
                    </div>
                  </div>

                  {/* Button */}
                  <button className="shrink-0 h-11 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white text-sm font-semibold flex items-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-200">
                    Enquire
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show more */}
        {hasMore && !showMore && (
          <div className="text-center mt-10">
            <button
              onClick={() => setShowMore(true)}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-emerald-600 text-emerald-700 bg-white/80 backdrop-blur-sm rounded-full font-semibold hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
            >
              View More Tours
              <ArrowDown size={16} className="animate-bounce" />
            </button>
          </div>
        )}

        {/* Trust bar */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-4 gap-4">
          {trustItems.map(({ Icon, label, sub }) => (
            <div
              key={label}
              className="flex items-start gap-4 bg-white/80 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-sm border border-white/60"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 leading-tight mb-0.5">
                  {label}
                </p>
                <p className="text-xs text-gray-500 leading-snug">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TourPackages;
