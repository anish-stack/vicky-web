import React from 'react';
import { MapPin, Clock, Users, ArrowRight, Star, Calendar } from 'lucide-react';

const TourPackages: React.FC = () => {
  const packages = [
    {
      title: 'Agra Taj Mahal Tour',
      location: 'Delhi to Agra',
      duration: '12 hours',
      passengers: '4-6 people',
      price: '₹6,999',
      originalPrice: '₹8,999',
      rating: 4.8,
      reviews: 245,
      image: 'https://images.pexels.com/photos/1583339/pexels-photo-1583339.jpeg?auto=compress&cs=tinysrgb&w=500',
      highlights: ['Taj Mahal visit', 'Agra Fort', 'Local lunch', 'Professional guide'],
      badge: 'Popular'
    },
    {
      title: 'Golden Triangle Package',
      location: 'Delhi - Agra - Jaipur',
      duration: '3 days',
      passengers: '4-6 people',
      price: '₹15,999',
      originalPrice: '₹19,999',
      rating: 4.9,
      reviews: 189,
      image: 'https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?auto=compress&cs=tinysrgb&w=500',
      highlights: ['3 cities tour', 'Heritage hotels', 'All meals', 'Expert guides'],
      badge: 'Best Seller'
    },
    {
      title: 'Shimla Manali Trip',
      location: 'Delhi to Hills',
      duration: '5 days',
      passengers: '4-8 people',
      price: '₹25,999',
      originalPrice: '₹29,999',
      rating: 4.7,
      reviews: 167,
      image: 'https://images.pexels.com/photos/1141853/pexels-photo-1141853.jpeg?auto=compress&cs=tinysrgb&w=500',
      highlights: ['Hill stations', 'Adventure activities', 'Scenic drives', 'Hotel stays'],
      badge: 'Adventure'
    },
    {
      title: 'Rajasthan Heritage',
      location: 'Rajasthan Circuit',
      duration: '7 days',
      passengers: '4-8 people',
      price: '₹35,999',
      originalPrice: '₹42,999',
      rating: 4.9,
      reviews: 203,
      image: 'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=500',
      highlights: ['Palace visits', 'Desert safari', 'Cultural shows', 'Luxury stays'],
      badge: 'Premium'
    }
  ];

  return (
    <section id="tours" className="py-20 bg-gray-50 dark:bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            Tour Packages
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-dark-900 dark:text-white mb-4">
            Discover Amazing Destinations
          </h2>
          <p className="text-xl text-dark-600 dark:text-dark-300 max-w-3xl mx-auto">
            Explore incredible destinations with our curated tour packages featuring comfortable vehicles, professional drivers, and unforgettable experiences.
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {packages.map((pkg, index) => (
            <div
              key={index}
              className="bg-white dark:bg-dark-950 rounded-2xl overflow-hidden shadow-soft hover:shadow-soft-xl transition-all duration-300 border border-gray-100 dark:border-dark-700 group hover:-translate-y-1"
            >
              {/* Package Image */}
              <div className="relative overflow-hidden">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  {pkg.badge}
                </div>
                <div className="absolute top-4 right-4 bg-white/95 dark:bg-dark-900/95 px-3 py-2 rounded-xl flex items-center backdrop-blur-sm">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-bold text-dark-900 dark:text-white">{pkg.rating}</span>
                  <span className="text-xs text-dark-500 dark:text-dark-400 ml-1">({pkg.reviews})</span>
                </div>
              </div>

              {/* Package Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-3 leading-tight">
                  {pkg.title}
                </h3>
                
                {/* Package Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-dark-600 dark:text-dark-300">
                    <MapPin className="w-4 h-4 mr-2 text-primary-500 flex-shrink-0" />
                    <span className="truncate">{pkg.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-dark-600 dark:text-dark-300">
                    <Clock className="w-4 h-4 mr-2 text-primary-500 flex-shrink-0" />
                    {pkg.duration}
                  </div>
                  <div className="flex items-center text-sm text-dark-600 dark:text-dark-300">
                    <Users className="w-4 h-4 mr-2 text-primary-500 flex-shrink-0" />
                    {pkg.passengers}
                  </div>
                </div>

                {/* Pricing */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-500">{pkg.price}</span>
                  <span className="text-sm text-dark-400 dark:text-dark-500 line-through">{pkg.originalPrice}</span>
                </div>

                {/* Highlights */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-dark-900 dark:text-white mb-2">Highlights:</h4>
                  <ul className="space-y-1">
                    {pkg.highlights.map((highlight, highlightIndex) => (
                      <li key={highlightIndex} className="flex items-center text-xs text-dark-500 dark:text-dark-400">
                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2 flex-shrink-0"></div>
                        <span className="truncate">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Book Button */}
                <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center group shadow-soft hover:shadow-soft-lg">
                  Book Package
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 bg-white dark:bg-dark-950 rounded-2xl p-8 shadow-soft border border-gray-100 dark:border-dark-700">
          <h3 className="text-2xl font-bold text-dark-900 dark:text-white mb-3">
            Don't see what you're looking for?
          </h3>
          <p className="text-dark-600 dark:text-dark-300 mb-6 max-w-2xl mx-auto">
            We create custom tour packages tailored to your preferences and budget. Let us plan your perfect journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-soft hover:shadow-soft-lg">
              Customize Your Trip
            </button>
            <button className="border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-bold py-4 px-8 rounded-xl transition-all duration-200">
              View All Packages
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TourPackages;