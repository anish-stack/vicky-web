import React from 'react';
import { Shield, Clock, Star, Phone } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Shield,
      title: 'Verified & Secure',
      description: 'All our drivers are verified and trained. Your safety is guaranteed.',
      color: 'bg-yellow-500'
    },
    {
      icon: Clock,
      title: '24x7 Availability',
      description: 'Round-the-clock service availability for your convenience.',
      color: 'bg-gray-600'
    },
    {
      icon: Star,
      title: 'Fair Pricing',
      description: 'Transparent and affordable pricing with no hidden charges.',
      color: 'bg-yellow-600'
    }
  ];

  return (
    <section className="py-8 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-4 py-2 rounded-full text-sm font-medium mb-3">
                Why Choose Us
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                Designed for{' '}
                <span className="text-yellow-600 dark:text-yellow-400">
                  Safe & Smart
                </span>{' '}
                Journeys
              </h2>
              <p className="text-l text-gray-600 dark:text-gray-400 leading-relaxed">
                Experience top-notch travel services with quality, reliability, and trust. 
                We prioritize your comfort and safety above everything else.
              </p>
            </div>

            {/* Features list */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className={`${feature.color} p-3 rounded-xl shadow-lg`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* <button className="bg-yellow-500 hover:bg-yellow-600 text-black py-2.5 px-8 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                <Phone className="h-5 w-5" />
                <span>Book Now</span>
              </button> */}
              {/* <button className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 hover:border-yellow-500 dark:hover:border-yellow-400 py-2.5 px-8 rounded-xl font-semibold transition-all duration-200">
                Learn More
              </button> */}
            </div>
          </div>

          {/* Right image */}
          <div className="relative">
            <div className="relative">
              <img
                src="https://media.istockphoto.com/id/1413761196/photo/happy-mature-man-driving-car.jpg?s=612x612&w=0&k=20&c=cHortB6t2CuIicx-UzOiq2jyfXufja9vETTN9dmThG4="
                alt="Safe journey"
                className="w-full rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent rounded-2xl"></div>
              
              {/* Floating card */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4">
                    <div className="bg-yellow-500 p-3 rounded-full">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Safety Guaranteed
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Your trusted travel partner since years
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;