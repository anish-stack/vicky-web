import React from 'react';
import { Car, Clock, Shield, MapPin, Users, Star, Plane,RouterIcon } from 'lucide-react';

const Services: React.FC = () => {
  const mainServices = [
    {
      icon: Car,
      title: 'City Rides',
      description: 'Quick and reliable rides within the city for your daily commute and errands.',
      features: ['Real-time tracking', 'Multiple vehicle options', 'Instant booking'],
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
    },
    {
      icon: RouterIcon,
      title: 'Outstation Trips',
      description: 'Comfortable long-distance travel to your favorite destinations across cities.',
      features: ['Professional drivers', 'Well-maintained vehicles', 'Flexible timing'],
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
    },
    {
      icon: Plane,
      title: 'Airport Transfers',
      description: 'Punctual airport pickups and drops with flight monitoring and assistance.',
      features: ['Flight tracking', 'Meet & greet service', 'Luggage assistance'],
      color: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'All drivers are verified and vehicles are regularly inspected for your safety.',
      stat: '100% Verified'
    },
    {
      icon: Clock,
      title: '24/7 Available',
      description: 'Round-the-clock service availability for all your transportation needs.',
      stat: '24/7 Service'
    },
    {
      icon: Star,
      title: 'Top Rated',
      description: 'Consistently rated 5 stars by thousands of satisfied customers.',
      stat: '4.9★ Rating'
    },
    {
      icon: Users,
      title: 'Professional Drivers',
      description: 'Experienced and courteous drivers who know the city inside out.',
      stat: '500+ Drivers'
    }
  ];

  return (
    <section id="services" className="py-20 bg-white dark:bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            Our Services
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-dark-900 dark:text-white mb-4">
            Premium Transportation Solutions
          </h2>
          <p className="text-xl text-dark-600 dark:text-dark-300 max-w-3xl mx-auto">
            From quick city rides to long-distance journeys, we provide reliable and comfortable transportation services tailored to your needs.
          </p>
        </div>

        {/* Main Services Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {mainServices.map((service, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-dark-900 p-8 rounded-2xl hover:shadow-soft-xl transition-all duration-300 border border-gray-100 dark:border-dark-700 group hover:-translate-y-1"
            >
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${service.color} group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-dark-900 dark:text-white mb-3">
                {service.title}
              </h3>
              <p className="text-dark-600 dark:text-dark-300 mb-6 leading-relaxed">
                {service.description}
              </p>
              <ul className="space-y-3">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm text-dark-500 dark:text-dark-400">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mr-3 flex-shrink-0"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-8 bg-white dark:bg-dark-900 rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-300 border border-gray-100 dark:border-dark-700 group hover:-translate-y-1"
            >
              <div className="bg-primary-100 dark:bg-primary-900/30 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-7 h-7 text-primary-600 dark:text-primary-500" />
              </div>
              <h4 className="text-lg font-bold text-dark-900 dark:text-white mb-2">
                {feature.title}
              </h4>
              <p className="text-sm text-dark-600 dark:text-dark-300 mb-3 leading-relaxed">
                {feature.description}
              </p>
              <div className="text-primary-600 dark:text-primary-500 font-bold text-sm">
                {feature.stat}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;