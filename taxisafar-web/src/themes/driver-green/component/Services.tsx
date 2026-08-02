import React from "react";
import { Car, Clock, Shield, Users, Star, Plane, Route, Check, ArrowRight } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

const mainServices = [
  {
    icon: Car,
    title: "City Rides",
    description: "Quick and reliable rides within the city for your daily commute and errands.",
    features: ["Real-time confirmation", "Multiple vehicle options", "Instant booking"],
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80",
  },
  {
    icon: Route,
    title: "Outstation Trips",
    description: "Comfortable long-distance travel to your favorite destinations across cities.",
    features: ["Professional drivers", "Well-maintained vehicles", "Flexible timing"],
    image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80",
  },
  {
    icon: Plane,
    title: "Airport Transfers",
    description: "Punctual airport pickups and drops with flight tracking and assistance.",
    features: ["Flight tracking", "Meet & greet service", "Luggage assistance"],
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80",
  },
];

const trustFeatures = [
  { icon: Shield, title: "Safe & Secure", stat: "100% Verified" },
  { icon: Clock, title: "24/7 Available", stat: "24/7 Service" },
  { icon: Star, title: "Top Rated", stat: "4.8+ Rating" },
  { icon: Users, title: "Expert Drivers", stat: "50+ Drivers" },
];

const Services: React.FC = () => {
  const { website } = useWebsite();
  const companyName = website?.basicInfo?.name || "Yadav Tour & Travels";

  return (
    <section id="services" className="relative py-20 md:py-28 bg-gradient-to-b from-white via-emerald-50/40 to-white overflow-hidden">
      {/* skyline background */}
      <div
        className="absolute top-0 left-0 w-full h-full bg-cover bg-top opacity-[0.6] pointer-events-none"

    style={{
      backgroundImage:
        "url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1600&q=60')",
      backgroundAttachment: "fixed",
    }}      />

      {/* decorative car top-right */}
    

      {/* dotted decorations */}
      <div className="absolute top-10 left-6 grid grid-cols-6 gap-1.5 opacity-40">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
        ))}
      </div>
      <div className="absolute bottom-10 left-0 grid grid-cols-6 gap-1.5 opacity-30">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold mb-5">
            <Car className="w-4 h-4" /> Our Services
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Premium Transportation <br className="hidden md:block" />
            <span className="relative inline-block text-emerald-600">
              Solutions
              <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 200 10" fill="none">
                <path d="M2 8C40 2 160 2 198 8" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            From quick city rides to long-distance journeys, {companyName} provides reliable
            and comfortable transportation tailored to your needs.
          </p>
        </div>

        {/* Main Services Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {mainServices.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden group hover:-translate-y-2"
            >
              {/* image area */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 via-emerald-900/5 to-transparent" />
                <div className="absolute top-5 left-5 w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/40">
                  <service.icon className="w-7 h-7 text-white" />
                </div>
              </div>

              <div className="p-7">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-500 mb-5 leading-relaxed text-[15px]">{service.description}</p>
                <ul className="space-y-2.5 mb-6">
                  {service.features.map((feature, fi) => (
                    <li key={fi} className="flex items-center text-sm text-gray-600">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center mr-3 flex-shrink-0">
                        <Check className="w-3 h-3 text-emerald-600" strokeWidth={3} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 border-2 border-emerald-200 hover:border-emerald-600 hover:bg-emerald-600 hover:text-white px-5 py-2.5 rounded-full transition-all duration-300">
                  Book Now <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Features Strip */}
        <div className="bg-white rounded-3xl shadow-lg shadow-gray-100 border border-gray-100 p-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
            {trustFeatures.map((feature, index) => (
              <div key={index} className="text-center px-4 py-6 lg:py-0 group">
                <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-600 transition-colors duration-300">
                  <feature.icon className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-1">{feature.title}</h4>
                <div className="text-emerald-600 font-bold text-sm">{feature.stat}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;