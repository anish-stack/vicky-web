import { useWebsite } from "@/context/WebsiteContext";
import { Route, MapPinned, Star, Car, Phone } from "lucide-react";

export default function JourneyBanner() {
  const { website } = useWebsite();
  const basicInfo = website?.basicInfo || {};
  const name = basicInfo.logo_name || basicInfo.name || "Us";
  const phone = basicInfo.phone || "9876543210";

  const stats = [
    { icon: Route, value: "10,000+", label: "Trips Completed" },
    { icon: MapPinned, value: "50+", label: "Cities Covered" },
    { icon: Star, value: "4.9/5", label: "Average Rating" },
    { icon: Car, value: "24×7", label: "On The Road" },
  ];

  return (
    <section className="py-6 md:py-10 bg-[#fffbf2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[2rem] overflow-hidden border-4 border-pink-700 shadow-[10px_10px_0px_0px_rgba(245,158,11,0.85)]">
          <img
            src="https://images.pexels.com/photos/21014/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1800"
            alt="Open road journey"
            className="w-full h-[440px] md:h-[420px] object-cover"
          />
          {/* Readability scrim over the photo */}
          <div className="absolute inset-0 bg-gradient-to-t from-pink-950/90 via-pink-900/40 to-pink-900/10" />

          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 md:p-12">
            <span className="inline-flex w-fit items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400 text-pink-900 text-xs font-black uppercase tracking-wider -rotate-1 shadow mb-4">
              ✦ Every Road Leads Somewhere Good ✦
            </span>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white max-w-xl leading-tight">
                {name} Has Taken Thousands Of Riders Places.{" "}
                <span className="text-amber-300">You&apos;re Next.</span>
              </h2>
              <a
                href={`tel:+91${phone}`}
                className="inline-flex w-fit items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-pink-800 text-sm font-black uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(245,158,11,1)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(245,158,11,1)] transition-all shrink-0"
              >
                <Phone size={16} /> Book A Ride Now
              </a>
            </div>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats.map((s, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-white/10 backdrop-blur-md border-2 border-white/25 px-4 py-3.5 flex items-center gap-3"
                >
                  <s.icon size={20} className="text-amber-300 shrink-0" />
                  <div>
                    <p className="text-lg font-black text-white leading-none">{s.value}</p>
                    <p className="text-[10px] font-black uppercase tracking-wide text-pink-200 mt-1">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
