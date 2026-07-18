import { useWebsite } from "@/context/WebsiteContext";
import { ArrowRight } from "lucide-react";

const services = [
  {
    title: "One Way Drop",
    desc: "Pay only for one side of your trip. Toll & state taxes included — only parking extra.",
    image: "https://images.pexels.com/photos/21014/pexels-photo.jpg",
    emoji: "🚕",
  },
  {
    title: "Round Trip",
    desc: "A dedicated cab and driver for your entire journey with flexible stops on the way.",
    image: "https://images.pexels.com/photos/386025/pexels-photo-386025.jpeg",
    emoji: "🔄",
  },
  {
    title: "Tour Packages",
    desc: "All-inclusive city & pilgrimage tours — fuel, driver, toll and taxes covered.",
    image: "https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg",
    emoji: "🗺️",
  },
];

export default function Services() {
  const { website } = useWebsite();
  const whatsapp = website?.basicInfo?.whatsapp || website?.basicInfo?.phone || "919876543210";

  return (
    <section id="services" className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex px-4 py-2 rounded-full bg-white border-2 border-orange-300 text-orange-700 text-xs font-black uppercase tracking-wide shadow-[3px_3px_0px_0px_rgba(251,146,60,0.5)]">
            Our Services
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-black text-stone-900">
            Pick Your Kind of <span className="text-orange-600">Ride</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {services.map((item, index) => (
            <a
              key={index}
              href={`https://wa.me/91${whatsapp}?text=${encodeURIComponent(`Hi, I want to enquire about ${item.title}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-3xl border-2 border-orange-200 overflow-hidden hover:-rotate-1 hover:border-orange-400 transition-all duration-300 shadow-[6px_6px_0px_0px_rgba(251,146,60,0.25)] block"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-black text-stone-900">
                  {item.emoji} {item.title}
                </h3>
                <p className="mt-2 text-sm text-stone-600 leading-relaxed">{item.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-orange-700 font-black text-sm group-hover:gap-3 transition-all">
                  Enquire Now <ArrowRight size={16} />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
