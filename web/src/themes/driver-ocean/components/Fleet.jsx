import { Users, Briefcase, Snowflake, Fuel, ArrowRight, CarFront } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

const fleet = [
  {
    name: "Mini",
    model: "WagonR / Celerio",
    seats: "4 Seater",
    bags: "2 Bags",
    tag: "Budget Pick",
    tagColor: "bg-emerald-600",
    desc: "Perfect for small families and quick city rides — light on the pocket, big on comfort.",
  },
  {
    name: "Sedan",
    model: "Swift Dzire / Aura",
    seats: "4 Seater",
    bags: "3 Bags",
    tag: "Most Popular",
    tagColor: "bg-amber-500",
    desc: "The trusted outstation companion — spacious boot and a smooth highway ride.",
  },
  {
    name: "SUV",
    model: "Maruti Ertiga",
    seats: "6+1 Seater",
    bags: "4 Bags",
    tag: "Family Choice",
    tagColor: "bg-pink-700",
    desc: "The whole family travels together — 7 seats and room for all the luggage.",
  },
  {
    name: "Prime SUV",
    model: "Innova Crysta",
    seats: "6+1 Seater",
    bags: "5 Bags",
    tag: "VIP Ride",
    tagColor: "bg-rose-600",
    desc: "Long-distance luxury — captain seats, powerful AC, a truly royal ride.",
  },
];

export default function Fleet() {
  const { website } = useWebsite();
  const basicInfo = website?.basicInfo || {};
  const whatsapp = basicInfo.whatsapp || basicInfo.phone || "919876543210";

  return (
    <section id="fleet" className="py-12 md:py-20 bg-white relative overflow-hidden">
      {/* Faint road watermark */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "url(https://images.pexels.com/photos/21014/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1600)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-pink-700 text-white text-xs font-black uppercase tracking-[0.2em] shadow-[3px_3px_0px_0px_rgba(245,158,11,1)]">
            <CarFront size={14} /> Our Fleet
          </span>
          <h2 className="mt-5 text-3xl md:text-5xl font-black text-slate-900">
            A Car For <span className="text-pink-700">Every Budget</span>
          </h2>
          <p className="mt-3 text-slate-500 font-semibold max-w-xl mx-auto">
            Every cab washed daily, AC running cold, and always on time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {fleet.map((car, i) => (
            <div
              key={i}
              className="group bg-white rounded-2xl border-2 border-pink-700/25 hover:border-pink-700 p-6 shadow-md hover:shadow-[6px_6px_0px_0px_rgba(190,24,93,0.25)] hover:-translate-y-1 transition-all flex flex-col"
            >
              <div className="flex items-start justify-between">
                {/* Number plate style */}
                <div className="rounded-lg border-2 border-slate-900 overflow-hidden shadow-sm">
                  <div className="bg-slate-900 text-[7px] font-black text-white text-center tracking-[0.3em] py-0.5 px-2">
                    IND
                  </div>
                  <div className="bg-amber-300 px-3 py-1 text-slate-900 font-black text-sm tracking-widest">
                    {car.name.toUpperCase()}
                  </div>
                </div>
                <span className={`${car.tagColor} text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg -rotate-2 shadow`}>
                  {car.tag}
                </span>
              </div>

              {/* Car illustration */}
              <div className="mt-5 flex items-center justify-center h-20 rounded-xl bg-gradient-to-b from-pink-50 to-[#fffbf2] border border-dashed border-pink-700/30 relative overflow-hidden">
                <CarFront size={44} className="text-pink-700 group-hover:scale-110 group-hover:-translate-y-0.5 transition-transform" strokeWidth={1.5} />
                <div className="absolute bottom-1.5 left-3 right-3 h-[3px] bg-[repeating-linear-gradient(to_right,#be185d_0px,#be185d_10px,transparent_10px,transparent_20px)] opacity-40" />
              </div>

              <p className="mt-4 font-black text-slate-900 text-lg leading-tight">{car.model}</p>
              <p className="mt-1.5 text-[13px] text-slate-500 font-semibold leading-relaxed flex-1">{car.desc}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { icon: Users, label: car.seats },
                  { icon: Briefcase, label: car.bags },
                  { icon: Snowflake, label: "AC" },
                  { icon: Fuel, label: "Fuel Incl." },
                ].map((s, j) => (
                  <span
                    key={j}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-50 text-pink-800 text-[10px] font-black uppercase tracking-wide"
                  >
                    <s.icon size={11} /> {s.label}
                  </span>
                ))}
              </div>

              <a
                href={`https://wa.me/91${whatsapp}?text=${encodeURIComponent(`Hi, I would like to book a ${car.model} (${car.name}). Please share the fare.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-pink-700 text-white text-xs font-black uppercase tracking-widest hover:bg-amber-500 transition-colors"
              >
                Book This Car <ArrowRight size={14} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
