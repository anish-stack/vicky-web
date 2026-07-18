import React, { useState } from "react";
import { MapPin, Clock, ArrowRight, ArrowDown } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

const staticPackages = [
  {
    id: 1,
    title: "Agra Taj Mahal Tour",
    location: "Delhi to Agra",
    duration: "1 Day",
    image:
      "https://images.pexels.com/photos/1583339/pexels-photo-1583339.jpeg?auto=compress&cs=tinysrgb&w=700",
    description: "Taj Mahal, Agra Fort & Mehtab Bagh — premium sedan included.",
    price: "₹ 7,499",
  },
  {
    id: 2,
    title: "Golden Triangle Package",
    location: "Delhi - Agra - Jaipur",
    duration: "3 Days",
    image:
      "https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?auto=compress&cs=tinysrgb&w=700",
    description: "Premium SUV with chauffeur for the full heritage circuit.",
    price: "₹ 17,999",
  },
  {
    id: 3,
    title: "Shimla Manali Getaway",
    location: "Delhi to Hills",
    duration: "5 Days",
    image:
      "https://images.pexels.com/photos/1141853/pexels-photo-1141853.jpeg?auto=compress&cs=tinysrgb&w=700",
    description: "Scenic hill drives with comfort-class vehicles.",
    price: "₹ 27,999",
  },
  {
    id: 4,
    title: "Rajasthan Heritage",
    location: "Rajasthan Circuit",
    duration: "7 Days",
    image:
      "https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=700",
    description: "Palace visits, desert safari and luxury stays.",
    price: "₹ 38,999",
  },
];

const TourPackages: React.FC = () => {
  const { website } = useWebsite() as any;
  const [showMore, setShowMore] = useState(false);

  const realPackages = website?.packages || [];

  const formattedRealPackages = realPackages.map((pkg: any, index: number) => ({
    id: `real-${pkg.title || index}`,
    title: pkg.title || "Package",
    location: pkg.location || "Custom Route",
    image: pkg.image || "https://via.placeholder.com/700x500?text=Tour",
    description: pkg.description || "Premium cab tour with an experienced chauffeur.",
    duration: pkg.duration || "Custom Duration",
    price: `₹ ${Number(pkg.price || 0).toLocaleString()}`,
  }));

  const sourcePackages =
    formattedRealPackages.length > 0 ? formattedRealPackages : staticPackages;

  const displayed = showMore ? sourcePackages : sourcePackages.slice(0, 4);
  const hasMore = sourcePackages.length > 4;

  return (
    <section id="tours" className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-bold mb-4">
            Fleet &amp; Packages
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
            Premium Tour Packages
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Curated journeys featuring a premium fleet and professional chauffeurs.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayed.map((pkg: any) => (
            <div
              key={pkg.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1 flex flex-col"
            >
              <div className="relative overflow-hidden h-44">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  {pkg.duration}
                </div>
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
                  {pkg.title}
                </h3>

                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center text-xs text-gray-600">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-orange-500 flex-shrink-0" />
                    <span className="truncate">{pkg.location}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <Clock className="w-3.5 h-3.5 mr-1.5 text-orange-500 flex-shrink-0" />
                    {pkg.duration}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 flex-grow">{pkg.description}</p>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xl font-bold text-orange-600">{pkg.price}</span>
                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-colors">
                    Enquiry
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasMore && !showMore && (
          <div className="text-center mt-10">
            <button
              onClick={() => setShowMore(true)}
              className="px-6 py-2.5 border border-orange-500 text-orange-600 rounded-full hover:bg-orange-500 hover:text-white transition flex items-center gap-2 mx-auto"
            >
              View More Packages
              <ArrowDown size={18} className="animate-bounce" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TourPackages;
