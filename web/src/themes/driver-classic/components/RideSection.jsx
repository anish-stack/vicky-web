import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Clock,
  IndianRupee,
  MapPin,
} from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

const initialTours = [
  {
    id: 1,
    title: "Haridwar Darshan",
    image:
      "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/07/32/fe/81.jpg",
    description: "Ganga Aarti, Har Ki Pauri, Mansa Devi & Chandi Devi temples",
    duration: "1 Day",
    price: "₹ 4,999",
  },
  {
    id: 2,
    title: "Haridwar + Rishikesh",
    image:
      "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/06/6c/74/cb.jpg",
    description: "Ganga Aarti + Laxman Jhula, Ram Jhula & Beatles Ashram",
    duration: "1 Day",
    price: "₹ 5,999",
  },
  {
    id: 3,
    title: "Agra Taj Mahal Tour",
    image:
      "https://vstaxiservice.com/wp-content/uploads/2025/12/Agra-Tour-Package.jpeg",
    description: "Taj Mahal, Agra Fort & Mehtab Bagh sunrise/sunset",
    duration: "1 Day",
    price: "₹ 8,499",
  },
  {
    id: 4,
    title: "Mathura Vrindavan Yatra",
    image:
      "https://vstaxiservice.com/wp-content/uploads/2025/12/mathura-vrindavn-tour.jpeg",
    description: "Krishna Janmabhoomi, Banke Bihari, ISKCON & Prem Mandir",
    duration: "1 Day",
    price: "₹ 6,499",
  },
  {
    id: 5,
    title: "Rishikesh Adventure",
    image:
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0e/b7/fb/19/rishikesh-river-rafting.jpg?w=1200&h=900&s=1",
    description: "River Rafting + Yoga, Ganga Aarti & waterfalls",
    duration: "1-2 Days",
    price: "₹ 7,999",
  },
  {
    id: 6,
    title: "Golden Triangle (Delhi-Agra-Jaipur)",
    image:
      "https://www.tajtaxiagra.com/wp-content/uploads/2025/11/golden-triangle-tour-by-car-5days.png",
    description: "Taj Mahal, Amber Fort, Hawa Mahal & City Palace",
    duration: "3-4 Days",
    price: "₹ 24,999",
  },
];

const moreTours = [
  {
    id: 7,
    title: "Jim Corbett National Park",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Safari, wildlife spotting & nature stay",
    duration: "2 Days",
    price: "₹ 14,999",
  },
  {
    id: 8,
    title: "Mussoorie Landour Tour",
    image:
      "https://images.unsplash.com/photo-1580130718646-9f694209b207?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Kempty Falls, Gun Hill, Mall Road & scenic views",
    duration: "2 Days",
    price: "₹ 11,499",
  },
  {
    id: 9,
    title: "Nainital Lake Tour",
    image:
      "https://images.unsplash.com/photo-1603262110263-fb6c1fd2c7cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Boating, Naina Devi Temple & Snow View Point",
    duration: "2 Days",
    price: "₹ 12,999",
  },
  {
    id: 10,
    title: "Amarnath Yatra Package",
    image:
      "https://images.unsplash.com/photo-1625504611747-f1d0e6a0f8b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Helicopter / trek option with stay & meals",
    duration: "4-5 Days",
    price: "₹ 29,999",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 80, damping: 15 },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function RideSection() {
  const { website } = useWebsite();
  
  // Prepare real packages if they exist
  const realPackages = website?.packages || [];
  
  // Convert real packages to same shape as your hardcoded tours
  const formattedRealPackages = realPackages.map((pkg, index) => ({
    id: `real-${pkg.title || index}`,
    title: pkg.title || "Package",
    image: pkg.image || "https://via.placeholder.com/800x500?text=Tour",
    description: pkg.description || "Comfortable cab tour with experienced driver",
    duration: pkg.duration || "Custom Duration",
    price: `₹ ${Number(pkg.price || 0).toLocaleString()}`,
  }));

  // Decide which data source to use
  const sourceTours = formattedRealPackages.length > 0 
    ? formattedRealPackages 
    : [...initialTours, ...moreTours];

  const [showMore, setShowMore] = useState(false);

  // Show first 6 by default, rest when "View More" clicked
  const displayedTours = showMore 
    ? sourceTours 
    : sourceTours.slice(0, 6);

  const hasMore = sourceTours.length > 6;

  return (
    <section id="rides" className="py-6 md:py-10 bg-zinc-50">
      <div className="max-w-7xl mx-auto px-3 md:px-3">
        <div className="text-center mb-6 md:mb-16">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-100 text-red-600 text-m font-bold">
            Popular Tours
          </span>
          <h2 className="mt-4 md:mt-6 text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Explore with <span className="text-[#B91C1C]">{website?.basicInfo?.name}</span>
          </h2>
          <p className="mt-2 md:mt-3 text-lg text-zinc-600 max-w-2xl mx-auto">
            Comfortable AC cabs, experienced drivers, and best routes for your
            spiritual & adventure getaways from Faridabad.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8"
        >
          <AnimatePresence>
            {displayedTours.map((tour) => (
              <motion.div
                key={tour.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: 20 }}
                className="group bg-white rounded-2xl overflow-hidden border border-zinc-100 shadow-sm hover:shadow-2xl hover:border-primary/30 transition-all duration-300 flex flex-col h-full"
              >
                <div className="relative overflow-hidden h-48">
                  <img
                    src={tour.image}
                    alt={tour.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 bg-[#B91C1C] text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-md">
                    {tour.duration}
                  </div>
                </div>

                <div className="p-2.5 md:p-4 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {tour.title}
                  </h3>
                  <p className="text-zinc-600 mb-3 flex-grow">
                    {tour.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 text-[#B91C1C] font-bold text-xl">
                      {/* <IndianRupee size={20} /> */}
                      {tour.price}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      className="bg-red-600 text-white px-3 md:px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-md hover:bg-primary-dark transition-colors"
                    >
                      Enquiry Now
                      <ArrowRight size={18} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {hasMore && !showMore && (
          <div className="text-center mt-8 md:mt-10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowMore(true)}
              className="px-6 py-2 border border-red-600 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition flex items-center gap-3 mx-auto shadow-lg transition-all duration-300"
            >
              View More Tours
              <ArrowDown size={20} className="animate-bounce" />
            </motion.button>
          </div>
        )}
      </div>
    </section>
  );
}