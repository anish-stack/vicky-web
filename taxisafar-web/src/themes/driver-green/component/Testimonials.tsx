import React from "react";
import { Star, Quote } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

const avatarPool = [
  "https://img.freepik.com/free-photo/portrait-smiling-indian-woman_23-2148990150.jpg",
  "https://media.istockphoto.com/id/1961053928/photo/testimonial-portrait-of-a-handsome-mature-man.jpg",
  "https://img.freepik.com/free-photo/happy-indian-man-smiling_23-2148990150.jpg",
  "https://img.freepik.com/free-photo/confident-indian-woman-portrait_23-2148990150.jpg",
];

const staticTestimonials = [
  {
    name: "Priya Sharma",
    location: "Sector 15, Faridabad",
    text: "Booked a Haridwar tour. Clean car, polite driver, amazing experience!",
    rating: 5,
    avatar: avatarPool[0],
  },
  {
    name: "Rajesh Kumar",
    location: "Ballabhgarh",
    text: "Daily office commute. Honest pricing, always on time.",
    rating: 5,
    avatar: avatarPool[1],
  },
  {
    name: "Anita Patel",
    location: "NIT Faridabad",
    text: "Mathura-Vrindavan trip with family was super comfortable.",
    rating: 5,
    avatar: avatarPool[2],
  },
];

const Testimonials: React.FC = () => {
  const { website } = useWebsite();
  const companyName = website?.basicInfo?.name || "TaxiSafar";

  const dynamicReviews = (website?.reviews || []).map((review: any, index: number) => ({
    ...review,
    location:
      review.location ||
      ["Sector 21, Faridabad", "Noida Sector 62", "Gurgaon DLF Phase 3", "South Delhi"][
        index % 4
      ],
    avatar: review.avatar || avatarPool[index % avatarPool.length],
  }));

  const testimonials = dynamicReviews.length > 0 ? dynamicReviews : staticTestimonials;

  return (
    <section id="testimonials" className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
            Customer Reviews
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
            Riders Love {companyName}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Real experiences from happy customers on outstation and local trips.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item: any, index: number) => (
            <div
              key={index}
              className="bg-white p-7 rounded-2xl hover:shadow-xl transition-all duration-300 border border-gray-100 relative group hover:-translate-y-1"
            >
              <div className="absolute top-6 right-6 text-emerald-100 group-hover:text-emerald-200 transition-colors duration-300">
                <Quote className="w-8 h-8" />
              </div>

              <div className="flex items-center mb-3">
                {Array.from({ length: item.rating || 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                ))}
                {Array.from({ length: 5 - (item.rating || 5) }).map((_, i) => (
                  <Star key={`e-${i}`} className="w-4 h-4 text-gray-300" />
                ))}
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed italic">"{item.text}"</p>

              <div className="flex items-center">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-12 h-12 rounded-full object-cover mr-3 ring-2 ring-emerald-100"
                />
                <div>
                  <h4 className="font-bold text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-500">{item.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-500 mt-8">
          Reviews are from verified customers. Experiences may vary based on trip,
          driver, and conditions.
        </p>
      </div>
    </section>
  );
};

export default Testimonials;
