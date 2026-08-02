import React from "react";
import { Car, Clock, Shield, Users, Star, Plane, Route } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

const mainServices = [
  {
    icon: Car,
    title: "City Rides",
    description: "Premium sedans and hatchbacks for quick, comfortable city travel.",
    features: ["Instant confirmation", "Multiple vehicle classes", "Clean interiors"],
  },
  {
    icon: Route,
    title: "Outstation Trips",
    description: "Long-distance travel with experienced drivers and flexible routes.",
    features: ["Professional chauffeurs", "Well-maintained fleet", "Flexible timing"],
  },
  {
    icon: Plane,
    title: "Airport Transfers",
    description: "On-time airport pickups and drops with flight tracking.",
    features: ["Flight tracking", "Meet & greet", "Luggage assistance"],
  },
];

const trustFeatures = [
  { icon: Shield, title: "Safe & Secure", stat: "100% Verified" },
  { icon: Clock, title: "24/7 Available", stat: "24/7 Service" },
  { icon: Star, title: "Top Rated", stat: "4.9★ Rating" },
  { icon: Users, title: "Expert Drivers", stat: "50+ Drivers" },
];

const Services: React.FC = () => {
  const { website } = useWebsite() as any;
  const companyName = website?.basicInfo?.name || website?.basicInfo?.logo_name || "Carbook";

  return (
    <section id="services" className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-bold mb-4">
            Our Services
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
            Premium Transportation Solutions
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            From quick city rides to long-distance journeys, {companyName} delivers a
            reliable, comfortable experience every time.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {mainServices.map((service, index) => (
            <div
              key={index}
              className="bg-gray-50 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 bg-orange-100 text-orange-600 group-hover:scale-110 transition-transform duration-300">
                <service.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
              <ul className="space-y-2.5">
                {service.features.map((feature, fi) => (
                  <li key={fi} className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustFeatures.map((feature, index) => (
            <div
              key={index}
              className="text-center p-7 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group hover:-translate-y-1"
            >
              <div className="bg-orange-100 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-7 h-7 text-orange-600" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h4>
              <div className="text-orange-600 font-bold text-sm">{feature.stat}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
