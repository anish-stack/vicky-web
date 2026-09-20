import { useState } from "react";
import { ArrowRight, Clock } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";
import { Scallop } from "./Header";

export default function TourPackages() {
  const { website } = useWebsite();
  const [showMore, setShowMore] = useState(false);

  const basicInfo = website?.basicInfo || {};
  const whatsapp = basicInfo.whatsapp || basicInfo.phone || "919876543210";

  const packages = (website?.packages || []).map((pkg, index) => ({
    id: `pkg-${index}`,
    title: pkg.title || "Tour Package",
    image: pkg.image || "https://via.placeholder.com/800x500?text=Tour",
    description: pkg.description || "Comfortable cab tour with experienced driver",
    duration: pkg.duration || "Custom Duration",
    price: `₹ ${Number(pkg.price || 0).toLocaleString()}`,
  }));

  const displayed = showMore ? packages : packages.slice(0, 6);

  const enquire = (pkg) => {
    const message = `*Tour Package Enquiry*\n\n*${basicInfo.logo_name || basicInfo.name || ""}*\n\n*Package:* ${pkg.title}\n*Duration:* ${pkg.duration}\n*Price:* ${pkg.price}\n\nPlease share more details.`;
    window.open(`https://wa.me/91${whatsapp}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <section id="tours" className="bg-green-700 relative">
      <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex px-5 py-2 rounded-full bg-white text-green-800 text-xs font-black uppercase tracking-[0.2em] shadow-[3px_3px_0px_0px_rgba(249,115,22,1)]">
            Tour Packages
          </span>
          <h2 className="mt-5 text-3xl md:text-5xl font-black text-white">
            Planning a Trip? <span className="text-amber-300">The Car's On Us.</span>
          </h2>
          <p className="mt-3 text-green-100 font-semibold max-w-xl mx-auto">
            Toll, tax, fuel, driver — all included in the package. Only parking is extra.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {displayed.map((pkg) => (
            <div
              key={pkg.id}
              className="group rounded-2xl overflow-hidden bg-white shadow-xl hover:-translate-y-1.5 hover:shadow-2xl transition-all flex flex-col"
            >
              <div className="relative overflow-hidden">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="w-full h-48 md:h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white text-green-800 text-[11px] font-black uppercase tracking-wide px-3 py-1.5 rounded-lg shadow">
                  <Clock size={12} className="text-orange-500" /> {pkg.duration}
                </span>
                {/* Scallop edge on image bottom */}
                <div className="absolute -bottom-px left-0 right-0">
                  <Scallop color="#ffffff" flip className="h-3" />
                </div>
              </div>

              <div className="p-5 md:p-6 flex flex-col flex-1">
                <h3 className="font-black text-slate-900 text-lg leading-snug">{pkg.title}</h3>
                <p className="mt-2 text-sm text-slate-500 font-semibold leading-relaxed line-clamp-2">{pkg.description}</p>

                <div className="mt-5 pt-4 border-t-2 border-dashed border-green-700/20 flex items-center justify-between mt-auto">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Fixed Rate</p>
                    <p className="text-xl font-black text-green-700">{pkg.price}</p>
                  </div>
                  <button
                    onClick={() => enquire(pkg)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-green-700 text-white text-xs font-black uppercase tracking-wide hover:bg-orange-500 transition-colors"
                  >
                    Book Now <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {packages.length > 6 && (
          <div className="text-center mt-10">
            <button
              onClick={() => setShowMore(!showMore)}
              className="px-8 py-3 rounded-xl bg-white text-green-800 text-sm font-black uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(249,115,22,1)] transition-all"
            >
              {showMore ? "Show Less" : `View All ${packages.length} Packages`}
            </button>
          </div>
        )}
      </div>
      <Scallop color="#fffdf5" flip />
    </section>
  );
}
