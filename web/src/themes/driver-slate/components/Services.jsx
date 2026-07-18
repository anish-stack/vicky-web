import { useWebsite } from "@/context/WebsiteContext";
import { ArrowUpRight } from "lucide-react";

const services = [
  {
    title: "One Way Drop",
    desc: "Pay only for one side of your journey. Toll and state tax included.",
    image: "https://images.pexels.com/photos/21014/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    title: "Round Trip",
    desc: "A dedicated cab and driver for your full journey, with flexible stops.",
    image: "https://images.pexels.com/photos/386025/pexels-photo-386025.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    title: "Tour Packages",
    desc: "All-inclusive city and pilgrimage tours — everything covered.",
    image: "https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    title: "Local & Airport",
    desc: "Hourly rentals and on-time airport pickups & drops, day or night.",
    image: "https://images.pexels.com/photos/2026324/pexels-photo-2026324.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
];

export default function Services() {
  const { website } = useWebsite();
  const whatsapp = website?.basicInfo?.whatsapp || website?.basicInfo?.phone || "919876543210";

  return (
    <section id="services" className="py-12 md:py-20 bg-sky-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex px-4 py-2 rounded-full bg-white shadow-sm text-sky-700 text-xs font-extrabold uppercase tracking-widest">
            Our Services
          </span>
          <h2 className="mt-4 text-3xl md:text-5xl font-extrabold text-gray-900">
            Pick Your <span className="text-sky-600">Lane</span>
          </h2>
          <p className="mt-3 text-gray-500 font-medium">Tap any card to enquire directly on WhatsApp.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((item, index) => (
            <a
              key={index}
              href={`https://wa.me/91${whatsapp}?text=${encodeURIComponent(`Hi, I want to enquire about ${item.title}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-2xl overflow-hidden h-72 md:h-80 block shadow-lg shadow-gray-300/50 border-b-4 border-amber-400 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-sky-300/50 transition-all"
            >
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sky-950/85 via-sky-900/20 to-transparent" />

              <span className="absolute top-3 left-3 bg-amber-400 text-gray-900 text-xs font-extrabold px-2.5 py-1 rounded-lg shadow">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="absolute bottom-0 inset-x-0 p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-white font-extrabold text-lg leading-tight">{item.title}</h3>
                  <span className="w-9 h-9 shrink-0 rounded-xl bg-white/90 flex items-center justify-center group-hover:rotate-45 transition-transform">
                    <ArrowUpRight size={16} className="text-sky-700" />
                  </span>
                </div>
                <p className="mt-2 text-sky-50 text-xs md:text-sm font-medium leading-relaxed">{item.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
