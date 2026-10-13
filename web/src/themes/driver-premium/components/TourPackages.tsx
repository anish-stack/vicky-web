import React, { useState } from "react";
import {
  MapPin,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Car,
  ShieldCheck,
  Headphones,
  Sparkles,
} from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

type TourPackage = {
  id: string | number;
  title: string;
  location: string;
  duration: string;
  image: string;
  description: string;
  price: string;
};

const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='700' height='500'>
      <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='#fb923c'/><stop offset='1' stop-color='#f97316'/>
      </linearGradient></defs>
      <rect width='700' height='500' fill='url(#g)'/>
      <text x='50%' y='50%' fill='white' font-family='sans-serif' font-size='36' font-weight='700' text-anchor='middle' dominant-baseline='middle'>Tour Package</text>
    </svg>`
  );

const staticPackages: TourPackage[] = [
  {
    id: 1,
    title: "Agra Taj Mahal Tour",
    location: "Delhi to Agra",
    duration: "1 Day",
    image:
      "https://images.pexels.com/photos/1583339/pexels-photo-1583339.jpeg?auto=compress&cs=tinysrgb&w=700",
    description: "Taj Mahal, Agra Fort and Mehtab Bagh, with a premium sedan included.",
    price: "₹7,499",
  },
  {
    id: 2,
    title: "Golden Triangle Package",
    location: "Delhi · Agra · Jaipur",
    duration: "3 Days",
    image:
      "https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?auto=compress&cs=tinysrgb&w=700",
    description: "A premium SUV with a chauffeur for the complete heritage circuit.",
    price: "₹17,999",
  },
  {
    id: 3,
    title: "Shimla Manali Getaway",
    location: "Delhi to the Hills",
    duration: "5 Days",
    image:
      "https://images.pexels.com/photos/1141853/pexels-photo-1141853.jpeg?auto=compress&cs=tinysrgb&w=700",
    description: "Scenic mountain drives in comfortable, well-maintained vehicles.",
    price: "₹27,999",
  },
  {
    id: 4,
    title: "Rajasthan Heritage",
    location: "Rajasthan Circuit",
    duration: "7 Days",
    image:
      "https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=700",
    description: "Palace visits, a desert safari and luxury stays along the way.",
    price: "₹38,999",
  },
];

const highlights = [
  { icon: Car, label: "Premium fleet" },
  { icon: ShieldCheck, label: "Verified chauffeurs" },
  { icon: Headphones, label: "24/7 support" },
];

const formatPrice = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0
    ? `₹${num.toLocaleString("en-IN")}`
    : "On request";
};

type Props = {
  onEnquiry?: (subject?: string) => void;
};

const TourPackages: React.FC<Props> = ({ onEnquiry }) => {
  const { website } = useWebsite() as any;
  const [showMore, setShowMore] = useState(false);

  const realPackages: any[] = Array.isArray(website?.packages) ? website.packages : [];

  const formattedRealPackages: TourPackage[] = realPackages.map((pkg, index) => ({
    id: `real-${index}-${pkg.title ?? ""}`,
    title: pkg.title || "Tour Package",
    location: pkg.location || "Custom Route",
    image: pkg.image || FALLBACK_IMAGE,
    description:
      pkg.description || "Premium chauffeur-driven tour tailored to your route.",
    duration: pkg.duration || "Flexible",
    price: formatPrice(pkg.price),
  }));

  const sourcePackages =
    formattedRealPackages.length > 0 ? formattedRealPackages : staticPackages;

  const INITIAL_COUNT = 4;
  const displayed = showMore ? sourcePackages : sourcePackages.slice(0, INITIAL_COUNT);
  const hasMore = sourcePackages.length > INITIAL_COUNT;

  return (
    <section
      id="tours"
      className="relative overflow-hidden bg-gradient-to-b from-orange-50/60 via-white to-gray-50 py-16 md:py-24"
    >
      {/* soft background accents */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-orange-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-600 sm:text-sm">
            <Sparkles className="h-4 w-4" />
            Tour Packages
          </span>
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Journeys Worth <span className="text-orange-500">Remembering</span>
          </h2>
          <p className="text-base text-gray-600 sm:text-lg">
            Carefully curated trips with a premium fleet and professional chauffeurs,
            so you can sit back and enjoy the ride.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {highlights.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-orange-100">
                  <Icon className="h-4 w-4 text-orange-500" />
                </span>
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {displayed.map((pkg) => (
            <article
              key={pkg.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-100"
            >
              <div className="relative h-44 flex-shrink-0 overflow-hidden">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  loading="lazy"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.src !== FALLBACK_IMAGE) img.src = FALLBACK_IMAGE;
                  }}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                  <Clock className="h-3 w-3" />
                  {pkg.duration}
                </span>

                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 text-xs font-medium text-white">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-orange-300" />
                  <span className="truncate">{pkg.location}</span>
                </div>
              </div>

              <div
                className="flex flex-1 flex-col text-left"
                style={{ padding: "14px 16px 16px" }}
              >
                <h3
                  className="line-clamp-2 text-[17px] font-bold leading-tight tracking-normal text-gray-900"
                  style={{ margin: "0 0 6px" }}
                >
                  {pkg.title}
                </h3>

                <p
                  className="line-clamp-2 text-[13px] font-normal leading-snug tracking-normal text-gray-600"
                  style={{ margin: "0 0 12px" }}
                >
                  {pkg.description}
                </p>

                <div
                  className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100"
                  style={{ paddingTop: 12 }}
                >
                  <div className="whitespace-nowrap leading-none">
                    <span className="block text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      From
                    </span>
                    <span className="block text-xl font-extrabold text-orange-600" style={{ marginTop: 2 }}>
                      {pkg.price}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onEnquiry?.(pkg.title)}
                    className="inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-orange-500 text-[13px] font-semibold leading-none text-white shadow-sm transition-all hover:bg-orange-600 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 active:scale-95"
                    style={{ padding: "10px 14px" }}
                  >
                    Enquire Now
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Show more / less */}
        {hasMore && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setShowMore((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full border-2 border-orange-500 px-7 py-2.5 text-sm font-semibold text-orange-600 transition-all hover:bg-orange-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
            >
              {showMore ? "Show Fewer Packages" : "View More Packages"}
              {showMore ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4 animate-bounce" />
              )}
            </button>
          </div>
        )}

        {/* Custom trip CTA */}
        <div className="mt-14 flex flex-col items-center justify-between gap-5 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-center shadow-lg sm:p-8 md:flex-row md:text-left">
          <div>
            <h3 className="text-xl font-bold text-white sm:text-2xl">
              Don&apos;t see your route?
            </h3>
            <p className="mt-1 text-sm text-orange-50 sm:text-base">
              Tell us where you want to go and we&apos;ll plan a custom trip for you.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onEnquiry?.("Custom Tour")}
            className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-orange-600 shadow-md transition-all hover:bg-orange-50 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-orange-500 active:scale-95"
          >
            Plan My Trip
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TourPackages;