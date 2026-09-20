import { useWebsite } from "@/context/WebsiteContext";
import { ArrowUpRight } from "lucide-react";

const services = [
  {
    title: "One Way Drop",
    desc: "Pay only for the onward fare — toll and tax included, nothing for the return.",
    image: "https://images.pexels.com/photos/21014/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    title: "Round Trip",
    desc: "Your own car and driver for the whole journey — stops wherever you do.",
    image: "https://images.pexels.com/photos/386025/pexels-photo-386025.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    title: "Tour Package",
    desc: "Pilgrimage or family trip — everything included in the package.",
    image: "https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    title: "Local & Airport",
    desc: "Hourly rentals within the city and on-time airport pickup-drop.",
    image: "https://images.pexels.com/photos/2026324/pexels-photo-2026324.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
];

export default function Services() {
  const { website } = useWebsite();
  const whatsapp = website?.basicInfo?.whatsapp || website?.basicInfo?.phone || "919876543210";

  return (
    <section id="services" className="py-12 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex px-5 py-2 rounded-full bg-green-700 text-white text-xs font-black uppercase tracking-[0.2em] shadow-[3px_3px_0px_0px_rgba(249,115,22,1)]">
            Our Services
          </span>
          <h2 className="mt-5 text-3xl md:text-5xl font-black text-slate-900">
            Tell Us, <span className="text-green-700">Where To?</span>
          </h2>
          <p className="mt-3 text-slate-500 font-semibold">Tap a card — talk to us directly on WhatsApp.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((item, index) => (
            <a
              key={index}
              href={`https://wa.me/91${whatsapp}?text=${encodeURIComponent(`Hi, I'd like more information about ${item.title}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-2xl overflow-hidden h-72 md:h-80 block border-[3px] border-green-700 shadow-[6px_6px_0px_0px_rgba(21,128,61,0.35)] hover:shadow-[6px_6px_0px_0px_rgba(249,115,22,0.8)] hover:-translate-y-1 transition-all"
            >
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-950/90 via-green-900/25 to-transparent" />

              <span className="absolute top-3 left-3 bg-amber-300 text-green-900 text-xs font-black px-2.5 py-1 rounded-lg -rotate-2 shadow">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="absolute bottom-0 inset-x-0 p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-white font-black text-lg leading-tight">{item.title}</h3>
                  <span className="w-9 h-9 shrink-0 rounded-xl bg-white flex items-center justify-center group-hover:rotate-45 group-hover:bg-orange-500 transition-all">
                    <ArrowUpRight size={16} className="text-green-800 group-hover:text-white transition-colors" />
                  </span>
                </div>
                <p className="mt-2 text-green-50 text-xs md:text-sm font-semibold leading-relaxed">{item.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
