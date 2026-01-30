import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { useWebsite } from "@/context/WebsiteContext"
import { useState, useEffect } from "react"

const staticTestimonials = [
  {
    name: "Priya Sharma",
    location: "Sector 15, Faridabad",
    text: "Booked Haridwar tour. Clean car, polite driver. Amazing experience!",
    rating: 5,
    avatar:
      "https://img.freepik.com/free-photo/woman-showing-ok-sign_23-2148990150.jpg?w=740"
  },
  {
    name: "Rahul Verma",
    location: "Ballabhgarh",
    text: "Daily office commute. Honest pricing, always on time.",
    rating: 5,
    avatar:
      "https://media.istockphoto.com/id/1961053928/photo/testimonial-portrait-of-a-handsome-mature-man.jpg"
  },
  {
    name: "Anjali Gupta",
    location: "NIT Faridabad",
    text: "Mathura-Vrindavan trip with family was super comfortable.",
    rating: 5,
    avatar:
      "https://img.freepik.com/free-photo/woman-showing-ok-sign_23-2148990150.jpg?w=740"
  },
  {
    name: "Vikram Singh",
    location: "Old Faridabad",
    text: "4 AM Agra booking. Everything arranged smoothly.",
    rating: 5,
    avatar:
      "https://media.istockphoto.com/id/1961053928/photo/testimonial-portrait-of-a-handsome-mature-man.jpg"
  }
]

const avatarPool = [
  "https://img.freepik.com/free-photo/portrait-smiling-indian-woman_23-2148990150.jpg",
  "https://media.istockphoto.com/id/1961053928/photo/testimonial-portrait-of-a-handsome-mature-man.jpg",
  "https://img.freepik.com/free-photo/happy-indian-man-smiling_23-2148990150.jpg",
  "https://img.freepik.com/free-photo/confident-indian-woman-portrait_23-2148990150.jpg"
]

const TestimonialsSwiperLight = () => {
  const { website } = useWebsite()

  // Transform dynamic reviews
  const dynamicReviews = (website?.reviews || []).map((review, index) => ({
    ...review,
    location:
      review.location ||
      [
        "Sector 21, Faridabad",
        "Noida Sector 62",
        "Gurgaon DLF Phase 3",
        "Greater Noida West",
        "South Delhi",
        "Ghaziabad Indirapuram"
      ][index % 6],
    avatar: review.avatar || avatarPool[index % avatarPool.length]
  }))

  const testimonials =
    dynamicReviews.length > 0 ? dynamicReviews : staticTestimonials

  // Group testimonials into pairs (2 per slide)
  const groupedTestimonials = []
  for (let i = 0; i < testimonials.length; i += 2) {
    groupedTestimonials.push(testimonials.slice(i, i + 2))
  }

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // Auto-slide every 4 seconds
  useEffect(() => {
    if (isHovered) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % groupedTestimonials.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isHovered, groupedTestimonials.length])

  // Manual dot click
  const goToSlide = index => {
    setCurrentIndex(index)
  }

  return (
    <section
      id="testimonials"
      className="py-6 md:py-10 bg-gradient-to-b from-white to-red-50"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-6 md:mb-16">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-100 text-red-600 text-m font-bold">
            Testimonials
          </span>

          <h2 className="mt-4 md:mt-6 text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900">
            Riders Love{" "}
            <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
              {website?.basicInfo?.name || "TaxiSafar"}
            </span>
          </h2>

          <p className="mt-2 md:mt-3 text-gray-600 text-lg">
            Real experiences from happy customers on outstation trips.
          </p>
        </div>

        {/* Carousel Container */}
        <div
          className="relative overflow-hidden pb-12"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div
            className="flex"
            animate={{ x: `-${currentIndex * 100}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {groupedTestimonials.map((group, groupIndex) => (
              <div key={groupIndex} className="flex-shrink-0 w-full px-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {group.map((item, i) => (
                    <div
                      key={i}
                      className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-lg transition h-full"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={item.avatar}
                          alt={item.name}
                          className="w-14 h-14 rounded-full object-cover ring-2 ring-red-300"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {item.location}
                          </p>
                        </div>
                      </div>

                      <div className="flex mb-4">
                        {Array.from({ length: item.rating }).map((_, idx) => (
                          <Star
                            key={idx}
                            size={18}
                            className="fill-red-500 text-red-500"
                          />
                        ))}
                        {Array.from({ length: 5 - item.rating }).map(
                          (_, idx) => (
                            <Star
                              key={idx + 10}
                              size={18}
                              className="text-gray-300"
                            />
                          )
                        )}
                      </div>

                      <p className="italic text-gray-700 leading-relaxed">
                        "{item.text}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {groupedTestimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? "w-8 h-3 bg-red-500"
                    : "w-3 h-3 bg-gray-300 hover:bg-red-300"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Reviews are from verified customers. Experiences may vary based on
          trip, driver, and conditions.
        </p>
      </div>
    </section>
  )
}

export default TestimonialsSwiperLight
