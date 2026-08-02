import { useState } from "react";
import { ArrowRight, Clock } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

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
    price: Number(pkg.price || 0).toLocaleString(),
  }));

  const displayed = showMore ? packages : packages.slice(0, 6);

  const enquire = (pkg) => {
    const message = `*Tour Package Enquiry*\n\n*${basicInfo.logo_name || basicInfo.name || ""}*\n\n*Package:* ${pkg.title}\n*Duration:* ${pkg.duration}\n*Price:* ₹${pkg.price}\n\nPlease share more details.`;
    window.open(`https://wa.me/91${whatsapp}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <section id="tours" className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex px-4 py-2 rounded-full bg-white border-2 border-orange-300 text-orange-700 text-xs font-black uppercase tracking-wide shadow-[3px_3px_0px_0px_rgba(251,146,60,0.5)]">
            Tour Packages
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-black text-stone-900">
            Adventures with <span className="text-orange-600">{basicInfo.name || "Us"}</span>
          </h2>
          <p className="mt-3 text-stone-600 max-w-xl mx-auto">
            All-inclusive tours — fuel, toll, taxes and driver covered. Only parking extra.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {displayed.map((tour, idx) => (
            <div
              key={tour.id}
              className={`group bg-white rounded-3xl border-2 border-orange-200 overflow-hidden hover:-translate-y-1.5 transition-all duration-300 shadow-[6px_6px_0px_0px_rgba(251,146,60,0.25)] hover:shadow-[8px_8px_0px_0px_rgba(251,146,60,0.4)] ${idx % 2 === 1 ? "lg:mt-6" : ""}`}
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={tour.image}
                  alt={tour.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <span className="absolute top-4 right-4 flex items-center gap-1.5 bg-orange-600 text-white px-3.5 py-1.5 rounded-full text-xs font-black shadow-md">
                  <Clock size={12} /> {tour.duration}
                </span>
              </div>

              <div className="p-5">
                <h3 className="text-xl font-black text-stone-900">{tour.title}</h3>
                <p className="mt-2 text-sm text-stone-600 line-clamp-2 leading-relaxed">{tour.description}</p>

                <div className="mt-5 flex items-center justify-between border-t-2 border-dashed border-orange-200 pt-4">
                  <div>
                    <p className="text-[11px] font-bold text-stone-400 uppercase">All Inclusive</p>
                    <p className="text-orange-600 font-black text-2xl">₹{tour.price}</p>
                  </div>
                  <button
                    onClick={() => enquire(tour)}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-stone-900 text-white text-sm font-black hover:bg-orange-600 transition-colors"
                  >
                    Book <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {packages.length > 6 && (
          <div className="text-center mt-12">
            <button
              onClick={() => setShowMore(!showMore)}
              className="px-8 py-3.5 rounded-2xl bg-white border-2 border-orange-300 text-orange-700 font-black hover:bg-orange-100 transition shadow-[4px_4px_0px_0px_rgba(251,146,60,0.4)]"
            >
              {showMore ? "Show Less" : "View All Packages"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
