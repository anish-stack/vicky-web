import React from 'react';
import { Star, Quote } from 'lucide-react';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'Priya Sharma',
      location: 'Delhi',
      role: 'Business Executive',
      rating: 5,
      text: 'Exceptional service! The driver was punctual, professional, and the car was spotless. VickyCab has become my go-to choice for all business travels. Highly recommended!',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
      date: '2 weeks ago'
    },
    {
      name: 'Rajesh Kumar',
      location: 'Mumbai',
      role: 'Software Engineer',
      rating: 5,
      text: 'Best taxi service in the city! The booking process is seamless, drivers are courteous, and rates are very reasonable. The 24/7 availability is a huge plus.',
      avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=150',
      date: '1 week ago'
    },
    {
      name: 'Anita Patel',
      location: 'Bangalore',
      role: 'Marketing Manager',
      rating: 5,
      text: 'Safe, reliable, and comfortable rides every single time. The real-time tracking feature gives me peace of mind, and customer support is always helpful.',
      avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150',
      date: '3 days ago'
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            Customer Reviews
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-dark-900 dark:text-white mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-dark-600 dark:text-dark-300 max-w-3xl mx-auto">
            Thousands of satisfied customers trust us with their daily commute and special journeys. Here's what they have to say about their experience.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-dark-900 p-8 rounded-2xl hover:shadow-soft-xl transition-all duration-300 border border-gray-100 dark:border-dark-700 relative group hover:-translate-y-1"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 text-primary-200 dark:text-primary-800 group-hover:text-primary-300 dark:group-hover:text-primary-700 transition-colors duration-300">
                <Quote className="w-8 h-8" />
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                ))}
                <span className="ml-2 text-sm text-dark-500 dark:text-dark-400">{testimonial.date}</span>
              </div>

              {/* Testimonial Text */}
              <p className="text-dark-600 dark:text-dark-300 mb-6 leading-relaxed text-lg">
                "{testimonial.text}"
              </p>

              {/* Customer Info */}
              <div className="flex items-center">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full object-cover mr-4 ring-2 ring-primary-100 dark:ring-primary-900/30"
                />
                <div>
                  <h4 className="font-bold text-dark-900 dark:text-white text-lg">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-dark-500 dark:text-dark-400">
                    {testimonial.role}
                  </p>
                  <p className="text-xs text-primary-600 dark:text-primary-500 font-medium">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid md:grid-cols-4 gap-8 text-center">
          <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-2xl">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-500 mb-2">50K+</div>
            <div className="text-dark-600 dark:text-dark-300 font-medium">Happy Customers</div>
          </div>
          <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-2xl">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-500 mb-2">4.9</div>
            <div className="text-dark-600 dark:text-dark-300 font-medium">Average Rating</div>
          </div>
          <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-2xl">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-500 mb-2">100K+</div>
            <div className="text-dark-600 dark:text-dark-300 font-medium">Rides Completed</div>
          </div>
          <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-2xl">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-500 mb-2">99%</div>
            <div className="text-dark-600 dark:text-dark-300 font-medium">Customer Satisfaction</div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gray-50 dark:bg-dark-900 rounded-2xl p-8 border border-gray-100 dark:border-dark-700">
            <h3 className="text-2xl font-bold text-dark-900 dark:text-white mb-3">
              Join Our Community of Satisfied Riders
            </h3>
            <p className="text-dark-600 dark:text-dark-300 mb-6 max-w-2xl mx-auto">
              Experience the same exceptional service that thousands of customers enjoy every day.
            </p>
            <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-soft hover:shadow-soft-lg">
              Start Your Journey
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;