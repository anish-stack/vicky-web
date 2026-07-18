import React from "react";
import { Smartphone, Shield, CreditCard, Headphones } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

const features = [
  {
    icon: Smartphone,
    title: "Easy Booking",
    description:
      "Reserve your vehicle in a few taps and get instant WhatsApp confirmation.",
  },
  {
    icon: Shield,
    title: "Verified & Secure",
    description:
      "Background-verified drivers and regularly inspected, well-maintained vehicles.",
  },
  {
    icon: CreditCard,
    title: "Flexible Payments",
    description: "Pay by cash, card, UPI, or digital wallet — whatever suits you.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Round-the-clock assistance whenever you need help on the road.",
  },
];

const stats = [
  { number: "500+", label: "Happy Customers" },
  { number: "24/7", label: "Service Available" },
  { number: "4.9★", label: "Average Rating" },
  { number: "100%", label: "Verified Fleet" },
];

const Features: React.FC = () => {
  const { website } = useWebsite() as any;
  const companyName = website?.basicInfo?.name || website?.basicInfo?.logo_name || "Carbook";

  return (
    <section className="py-16 md:py-20 bg-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500 rounded-full -translate-x-48 -translate-y-48 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500 rounded-full translate-x-48 translate-y-48 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <div className="inline-flex items-center bg-orange-500/20 text-orange-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Why Choose Us
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Premium Rentals, Zero Compromise
            </h2>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              {companyName} pairs a premium fleet with meticulous service standards
              so every trip feels effortless.
            </p>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start group">
                  <div className="bg-orange-500/15 p-3 rounded-xl mr-4 flex-shrink-0 group-hover:bg-orange-500/25 transition-colors duration-300">
                    <feature.icon className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-1.5">{feature.title}</h4>
                    <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl text-center hover:bg-white/10 transition-colors duration-300 border border-white/10"
              >
                <div className="text-3xl lg:text-4xl font-bold mb-2 text-orange-400">
                  {stat.number}
                </div>
                <div className="text-sm font-semibold text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold mb-3">Ready for a Premium Ride?</h3>
            <p className="text-gray-300 mb-6">
              Join hundreds of satisfied customers who trust {companyName}.
            </p>
            <a
              href="#contact"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-orange-900/40"
            >
              Book Your Vehicle
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
