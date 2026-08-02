import React from "react";
import {
  Smartphone,
  Shield,
  CreditCard,
  Headphones,
  Users,
  Clock,
  Star,
  ShieldCheck,
  Phone,
  MessageCircle,
} from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

const features = [
  {
    icon: Smartphone,
    title: "Easy Booking",
    description:
      "Book your ride in just a few taps with our simple enquiry form and instant WhatsApp confirmation.",
  },
  {
    icon: Shield,
    title: "Verified & Secure",
    description:
      "All drivers are background-verified and vehicles are regularly inspected for maximum safety.",
  },
  {
    icon: CreditCard,
    title: "Flexible Payments",
    description:
      "Pay with cash, card, UPI, or digital wallets — whatever works best for you.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description:
      "Round-the-clock customer support to assist you whenever you need help.",
  },
];

const stats = [
  { icon: Users, number: "5K+", label: "Happy Customers", description: "Satisfied riders trust us daily" },
  { icon: Clock, number: "24/7", label: "Service Available", description: "Always ready to serve you" },
  { icon: Star, number: "4.9★", label: "Average Rating", description: "Consistently excellent reviews" },
  { icon: ShieldCheck, number: "100%", label: "Verified Drivers", description: "Background checked professionals" },
];

const Features: React.FC = () => {
  const { website } = useWebsite();
  const companyName = website?.basicInfo?.name || "Yadav Tour & Travels";
  const whatsappNumber =
    website?.basicInfo?.whatsapp || website?.basicInfo?.phone || "919876543210";

  const openWhatsApp = () => {
    const message = `Hi, I'd like to book a ride with ${companyName}.`;
    window.open(`https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <section className="relative py-16 md:py-20 overflow-hidden">
      {/* full-section background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/road-city.png')" }}
      />
      {/* readability overlay: white on left fading to soft green on right */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Content Side */}
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Star className="w-4 h-4 fill-emerald-700" /> Why Choose Us
            </div>

            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
              Experience Premium <br className="hidden sm:block" />
              Quality{" "}
              <span className="relative text-emerald-600">
                & Reliability
                <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 220 8" fill="none">
                  <path d="M2 6C50 1 170 1 218 6" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </h2>

            <p className="text-lg text-gray-500 mb-8 leading-relaxed max-w-lg">
              We combine careful drivers, clean vehicles and honest pricing to deliver
              the most comfortable and dependable taxi experience.
            </p>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-base font-bold text-gray-900 mb-0.5">{feature.title}</h4>
                    <p className="text-gray-500 leading-relaxed text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Side */}
         <div className="grid grid-cols-2 gap-3 sm:gap-5">
  {stats.map((stat, index) => (
    <div
      key={index}
      className="bg-white/90 backdrop-blur-sm p-3 sm:p-6 rounded-xl sm:rounded-2xl text-center border border-white/60 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      {/* Icon */}
      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-2 sm:mb-3">
        <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
      </div>

      {/* Number */}
      <div className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-emerald-700 leading-none">
        {stat.number}
      </div>

      {/* Label */}
      <div className="mt-1 text-xs sm:text-sm font-bold text-gray-900">
        {stat.label}
      </div>

      {/* Description */}
      <div className="mt-1 text-[10px] sm:text-xs text-gray-500 leading-relaxed">
        {stat.description}
      </div>
    </div>
  ))}
</div>
        </div>

        {/* Bottom CTA banner */}
        <div className="mt-14 relative rounded-3xl overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/sunset-road.png')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />

          <div className="relative px-6 sm:px-12 py-10 sm:py-12 text-center">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Ready to <span className="text-emerald-400">Experience the Difference?</span>
            </h3>
            <p className="text-gray-200 mb-7 max-w-lg mx-auto text-sm sm:text-base">
              Join thousands of satisfied customers who choose {companyName} for their daily travels.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-7 py-3.5 rounded-xl transition-colors duration-200 shadow-lg"
              >
                <Phone className="w-4 h-4" />
                Book Your Ride Now
              </a>
              <button
                onClick={openWhatsApp}
                className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white hover:bg-white/10 font-bold px-7 py-3.5 rounded-xl transition-colors duration-200"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;