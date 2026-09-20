"use client";

import { useWebsite } from "@/context/WebsiteContext";
import {
  Building2,
  Plane,
  MapPinned,
  BriefcaseBusiness,
  ArrowRight,
} from "lucide-react";

const services = [
  {
    icon: Building2,
    title: "City Rides",
    desc: "Quick rides within the city",
    image:
      "https://i.ibb.co/R4gvL1cn/maruti-suzuki-ertiga-pearl-metallic-arctic-white-removebg-preview.png",
    bg: "bg-[#EEF5FF]",
    iconBg: "bg-[#DFECFF]",
    iconColor: "text-[#2878F0]",
  },
  {
    icon: Plane,
    title: "Airport Transfers",
    desc: "On-time airport pickups & drops",
    image:
      "https://i.ibb.co/R4gvL1cn/maruti-suzuki-ertiga-pearl-metallic-arctic-white-removebg-preview.png",
    bg: "bg-[#F5F8FF]",
    iconBg: "bg-[#EAF0FF]",
    iconColor: "text-[#3468E8]",
  },
  {
    icon: MapPinned,
    title: "Outstation Trips",
    desc: "Comfortable long-distance rides",
    image:
      "https://i.ibb.co/R4gvL1cn/maruti-suzuki-ertiga-pearl-metallic-arctic-white-removebg-preview.png",
    bg: "bg-[#F2FAF7]",
    iconBg: "bg-[#DCF4EA]",
    iconColor: "text-[#159966]",
  },
  {
    icon: BriefcaseBusiness,
    title: "Corporate Travel",
    desc: "Reliable business travel",
    image:
      "https://i.ibb.co/R4gvL1cn/maruti-suzuki-ertiga-pearl-metallic-arctic-white-removebg-preview.png",
    bg: "bg-[#FFF4ED]",
    iconBg: "bg-[#FFE5D4]",
    iconColor: "text-[#FF641A]",
  },
];

export default function Services() {
  const { website } = useWebsite();

  const rawWhatsapp =
    website?.basicInfo?.whatsapp ||
    website?.basicInfo?.phone ||
    "919876543210";

  const whatsapp = rawWhatsapp
    .toString()
    .replace(/\D/g, "")
    .replace(/^91(?=\d{10}$)/, "");

  const handleBookingUrl = (title) => {
    const message = `Hi, I want to book ${title}.`;
    return `https://wa.me/91${whatsapp}?text=${encodeURIComponent(message)}`;
  };

  return (
    <section
      id="services"
      className="relative overflow-hidden bg-white py-10 md:py-14 lg:py-16"
    >
      {/* Decorative background blurs */}
      <div className="pointer-events-none absolute left-[-160px] top-[-100px] h-[350px] w-[350px] rounded-full bg-orange-50 blur-3xl" />
      <div className="pointer-events-none absolute right-[-180px] bottom-[-100px] h-[380px] w-[380px] rounded-full bg-blue-50 blur-3xl" />

      <div className="relative mx-auto max-w-[1400px] px-3 sm:px-6 lg:px-8">
        
        {/* SECTION HEADER */}
        <div className="mx-auto mb-6 max-w-2xl text-center md:mb-10">
          <span className="inline-flex items-center rounded-full bg-[#FFF0E8] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#FF641A]">
            Our Services
          </span>
          <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.035em] text-[#071936] sm:text-3xl lg:text-[40px]">
            Ride For Every Need
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-slate-500 md:text-sm">
            From daily commutes to airport transfers and outstation trips,
            we&apos;ve got the perfect ride for every journey.
          </p>
        </div>

        {/* SERVICE CARDS GRID - 2 cards on mobile, 4 on large screens */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <article
                key={service.title}
                className={`group relative overflow-hidden rounded-[16px] sm:rounded-[24px] border border-slate-100 ${service.bg} p-2 sm:p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
              >
                {/* IMAGE AREA */}
                <div className="relative h-[110px] sm:h-[180px] overflow-hidden rounded-[12px] sm:rounded-[18px]">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  />

                  {/* Icon */}
                  <div
                    className={`absolute left-2 top-2 sm:left-3 sm:top-3 flex h-7 w-7 sm:h-10 sm:w-10 items-center justify-center rounded-lg ${service.iconBg} shadow-sm backdrop-blur-md`}
                  >
                    <Icon
                      size={15}
                      strokeWidth={2}
                      className={service.iconColor}
                    />
                  </div>
                </div>

                {/* CONTENT */}
                <div className="px-1 pb-1 pt-2.5 sm:px-2 sm:pb-2 sm:pt-4">
                  <h3 className="text-xs sm:text-[16px] font-extrabold tracking-[-0.02em] text-[#071936] line-clamp-1">
                    {service.title}
                  </h3>

                  <p className="mt-0.5 sm:mt-1 min-h-[28px] sm:min-h-[36px] text-[10px] sm:text-[12px] leading-3.5 sm:leading-4 text-slate-500 line-clamp-2">
                    {service.desc}
                  </p>

                  {/* Divider */}
                  <div className="my-2 sm:my-3 h-px bg-slate-900/[0.07]" />

                  {/* Button */}
                  <a
                    href={handleBookingUrl(service.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/btn inline-flex w-full items-center justify-between rounded-lg sm:rounded-xl border border-slate-200 bg-white px-2 py-1.5 sm:px-3.5 sm:py-2.5 text-[10px] sm:text-[12px] font-bold text-[#071936] shadow-sm transition-all duration-300 hover:border-[#FF641A]/30 hover:bg-[#FF641A] hover:text-white"
                  >
                    <span className="truncate">Book Now</span>
                    <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-[#FFF0E8] text-[#FF641A] transition-all duration-300 group-hover/btn:bg-white/20 group-hover/btn:text-white shrink-0">
                      <ArrowRight
                        size={11}
                        className="transition-transform duration-300 group-hover/btn:translate-x-0.5"
                      />
                    </span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}