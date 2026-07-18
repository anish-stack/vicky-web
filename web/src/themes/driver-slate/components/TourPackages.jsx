import { useState } from "react";
import { ArrowRight, Clock } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";
import { Road } from "./Header";

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
    <section id="tours" className="py-12 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex px-4 py-2 rounded-full bg-sky-100 text-sky-700 text-xs font-extrabold uppercase tracking-widest">
            Tour Packages
          </span>
          <h2 className="mt-4 text-3xl md:text-5xl font-extrabold text-gray-900">
            Destinations Worth <span className="text-sky-600">The Drive</span>
          </h2>
          <p className="mt-3 text-gray-500 font-medium max-w-xl mx-auto">
            All-inclusive fares — toll, taxes, fuel & driver covered. Only parking extra.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayed.map((pkg, i) => (
            <div
              key={pkg.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg shadow-gray-200/80 border-b-4 border-amber-400 hover:border-sky-600 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-sky-200/60 transition-all flex flex-col"
            >
              <div className="relative overflow-hidden">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="w-full h-48 md:h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Milestone marker */}
                <div className="absolute -bottom-0 left-5 translate-y-1/2 bg-white rounded-xl shadow-lg px-3 py-2 flex items-center gap-1.5">
                  <Clock size={13} className="text-sky-600" />
                  <span className="text-[11px] font-extrabold text-gray-800">{pkg.duration}</span>
                </div>
              </div>

              <div className="p-6 pt-8 flex flex-col flex-1">
                <h3 className="font-extrabold text-gray-900 text-lg leading-snug">{pkg.title}</h3>
                <p className="mt-2 text-sm text-gray-500 font-medium leading-relaxed line-clamp-2">{pkg.description}</p>

                <div className="mt-5 flex items-center justify-between mt-auto pt-4">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">All Inclusive</p>
                    <p className="text-xl font-extrabold text-sky-700">{pkg.price}</p>
                  </div>
                  <button
                    onClick={() => enquire(pkg)}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-extrabold hover:bg-amber-400 hover:text-gray-900 transition-colors shadow-md shadow-sky-600/20"
                  >
                    Enquire <ArrowRight size={14} />
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
              className="px-8 py-3 rounded-xl bg-sky-100 text-sky-700 text-sm font-extrabold hover:bg-sky-600 hover:text-white transition-colors"
            >
              {showMore ? "Show Less" : `View All ${packages.length} Packages`}
            </button>
          </div>
        )}
      </div>
      <div className="mt-12 md:mt-16">
        <Road className="h-4" />
      </div>
    </section>
  );
}
