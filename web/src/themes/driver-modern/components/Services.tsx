import React from 'react';
import { Car, Mountain, Building, ArrowRight } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: Car,
      title: 'One Way Trip',
      description: 'Convenient one-way travel to your destination with professional drivers.',
      image: 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800',
      color: 'bg-yellow-500'
    },
    {
      icon: Mountain,
      title: 'Round Trip',
      description: 'Complete round trip packages with flexible scheduling and comfort.',
      image: 'https://images.pexels.com/photos/1840624/pexels-photo-1840624.jpeg?auto=compress&cs=tinysrgb&w=800',
      color: 'bg-gray-600'
    },
    {
      icon: Building,
      title: 'Popular City Visits',
      description: 'Explore famous cities and landmarks with our guided tour services.',
      image: 'https://images.pexels.com/photos/460621/pexels-photo-460621.jpeg?auto=compress&cs=tinysrgb&w=800',
      color: 'bg-yellow-600'
    }
  ];

  return (
    <section id="services" className="py-8 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
            Our Services
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Explore Our Top-Rated Services
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Comprehensive travel solutions tailored to meet your specific journey requirements with excellence.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-4 left-4">
                  <div className={`${service.color} p-3 rounded-xl shadow-lg`}>
                    <service.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  {service.description}
                </p>
                <button className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 font-semibold transition-colors group-hover:translate-x-2 duration-200">
                  <span>Learn More</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-8 rounded-2xl border border-yellow-200 dark:border-yellow-800">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Start Your Journey?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Contact us today to discuss your travel needs and get a personalized quote for your next adventure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-yellow-500 hover:bg-yellow-600 text-black py-3 px-8 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                Book Service
              </button>
              <button className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 hover:border-yellow-500 dark:hover:border-yellow-400 py-3 px-8 rounded-xl font-semibold transition-all duration-200">
                Get Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;