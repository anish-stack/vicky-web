import React from "react";
import {
  Car,
  Clock,
  ShieldCheck,
  Users,
  Star,
  Plane,
  Route,
  Check,
  ArrowRight,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

const mainServices = [
  {
    icon: Car,
    title: "City Rides",
    subtitle: "Travel around town",
    description:
      "Make everyday travel effortless with comfortable rides for office commutes, shopping, appointments, and city exploration.",
    features: [
      "Quick booking assistance",
      "Multiple vehicle options",
      "Flexible pickup locations",
    ],
    image:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1000&q=85",
    message:
      "Hi, I'd like to enquire about City Rides. Please share your fares, vehicle options, and availability.",
  },
  {
    icon: Route,
    title: "Outstation Trips",
    subtitle: "Go beyond the city",
    description:
      "Enjoy a relaxed journey to your favorite destinations with comfortable vehicles and experienced drivers.",
    features: [
      "One-way and round trips",
      "Experienced drivers",
      "Flexible travel schedules",
    ],
    image:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1000&q=85",
    message:
      "Hi, I'd like to enquire about an Outstation Trip. Please share your fares, available vehicles, and booking details.",
  },
  {
    icon: Plane,
    title: "Airport Transfers",
    subtitle: "Arrive without the stress",
    description:
      "Plan convenient airport pickups and drops with reliable transportation for business trips, holidays, and family travel.",
    features: [
      "Scheduled pickup and drop",
      "Luggage-friendly vehicles",
      "Advance booking assistance",
    ],
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1000&q=85",
    message:
      "Hi, I'd like to enquire about an Airport Transfer. Please share your fares, pickup options, and availability.",
  },
];

const trustFeatures = [
  {
    icon: ShieldCheck,
    title: "Safety First",
    description: "Travel with greater peace of mind",
  },
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description: "Plan journeys around your time",
  },
  {
    icon: Star,
    title: "Quality Service",
    description: "A comfortable travel experience",
  },
  {
    icon: Users,
    title: "Experienced Drivers",
    description: "Professional travel assistance",
  },
];

const Services: React.FC = () => {
  const { website } = useWebsite();

  const companyName =
    website?.basicInfo?.name || "Yadav Tour & Travels";

  const rawWhatsApp =
    website?.basicInfo?.whatsapp ||
    website?.basicInfo?.phone ||
    "919876543210";

  // Supports numbers with spaces, +, dashes, and country codes.
  const whatsappNumber = String(rawWhatsApp).replace(/\D/g, "");

  // Add India's country code only when a 10-digit local number is provided.
  const formattedWhatsAppNumber =
    whatsappNumber.length === 10
      ? `91${whatsappNumber}`
      : whatsappNumber;

  const openWhatsApp = (message: string) => {
    if (!formattedWhatsAppNumber) return;

    const whatsappURL =
      `https://wa.me/${formattedWhatsAppNumber}` +
      `?text=${encodeURIComponent(message)}`;

    window.open(whatsappURL, "_blank", "noopener,noreferrer");
  };

  return (
    <section
      id="services"
      className="relative isolate overflow-hidden bg-gradient-to-b from-white via-emerald-50/50 to-white py-20 sm:py-24 lg:py-28"
    >
      {/* Soft decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-0 -z-10 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 -z-10 h-72 w-72 rounded-full bg-teal-100/40 blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="mx-auto mb-14 max-w-3xl text-center sm:mb-16">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
            <Sparkles className="h-4 w-4" />
            Travel Made Simple
          </div>

          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
            Every Journey Deserves
            <span className="mt-1 block text-emerald-600">
              a Better Ride.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
            From everyday city travel to long-distance adventures,{" "}
            <span className="font-semibold text-gray-800">
              {companyName}
            </span>{" "}
            helps you plan comfortable journeys with convenient booking
            assistance and service tailored to your needs.
          </p>
        </div>

        {/* Service cards */}
        <div className="grid grid-cols-1 items-stretch gap-7 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {mainServices.map((service) => (
            <article
              key={service.title}
              className="group flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/10"
            >
              {/* Service image */}
              <div className="relative h-56 overflow-hidden sm:h-60">
                <img
                  src={service.image}
                  alt={`${service.title} by ${companyName}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-gray-950/10 to-transparent" />

                <div className="absolute left-5 top-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/30 bg-white/95 text-emerald-700 shadow-lg backdrop-blur-sm">
                  <service.icon className="h-6 w-6" />
                </div>

                <div className="absolute bottom-5 left-5 right-5">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                    {service.subtitle}
                  </p>
                  <h3 className="text-2xl font-bold tracking-tight text-white">
                    {service.title}
                  </h3>
                </div>
              </div>

              {/* Service details */}
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <p className="text-[15px] leading-7 text-gray-600">
                  {service.description}
                </p>

                <div className="my-6 h-px bg-gray-100" />

                <ul className="mb-7 space-y-3">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm leading-6 text-gray-700"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                        <Check
                          className="h-3.5 w-3.5"
                          strokeWidth={2.5}
                        />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => openWhatsApp(service.message)}
                  disabled={!formattedWhatsAppNumber}
                  className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/20 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`Enquire about ${service.title} on WhatsApp`}
                >
                  <MessageCircle className="h-4 w-4" />
                  Enquire on WhatsApp
                  <ArrowRight className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Trust section */}
        <div className="mt-16 overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-sm sm:mt-20">
          <div className="border-b border-gray-100 px-6 py-7 text-center sm:px-8">
            <h3 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              Your Comfort Is Our Priority
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
              Thoughtful service at every step of your journey.
            </p>
          </div>

          <div className="grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
            {trustFeatures.map((feature) => (
              <div
                key={feature.title}
                className="group flex items-center gap-4 px-6 py-6 transition-colors hover:bg-emerald-50/50 sm:px-7 lg:flex-col lg:items-center lg:py-8 lg:text-center"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 transition-colors duration-300 group-hover:bg-emerald-600 group-hover:text-white">
                  <feature.icon className="h-6 w-6" />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-900 sm:text-base">
                    {feature.title}
                  </h4>
                  <p className="mt-1 text-sm leading-5 text-gray-500">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Closing call to action */}
        <div className="mt-10 flex flex-col items-center justify-between gap-5 rounded-3xl bg-gray-950 px-6 py-8 text-center sm:px-10 md:flex-row md:text-left">
          <div>
            <h3 className="text-xl font-bold text-white sm:text-2xl">
              Planning your next trip?
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-300 sm:text-base">
              Tell us where you want to go. We’ll help you explore your
              travel options.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              openWhatsApp(
                `Hi, I'd like to enquire about travel services from ${companyName}. Please help me plan my trip.`
              )
            }
            disabled={!formattedWhatsAppNumber}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-gray-950 transition-colors hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-white/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Plan Your Journey
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Services;
