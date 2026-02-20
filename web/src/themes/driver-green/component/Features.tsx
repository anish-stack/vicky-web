import React from 'react';
import { Smartphone, Shield, CreditCard, CircleCheck as CheckCircle, Award, Headphones } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: Smartphone,
      title: 'Easy Booking',
      description: 'Book your ride in just a few taps with our user-friendly interface and instant confirmation.'
    },
    {
      icon: Shield,
      title: 'Verified & Secure',
      description: 'All drivers are background-verified and vehicles are regularly inspected for maximum safety.'
    },
    {
      icon: CreditCard,
      title: 'Flexible Payments',
      description: 'Pay with cash, card, UPI, or digital wallets - whatever works best for you.'
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Round-the-clock customer support to assist you whenever you need help.'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Happy Customers', description: 'Satisfied riders trust us daily' },
    { number: '24/7', label: 'Service Available', description: 'Always ready to serve you' },
    { number: '4.9★', label: 'Average Rating', description: 'Consistently excellent reviews' },
    { number: '100%', label: 'Verified Drivers', description: 'Background checked professionals' }
  ];

  return (
    <section className="py-20 bg-primary-600 dark:bg-primary-700 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-48 translate-y-48"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content Side */}
          <div>
            <div className="inline-flex items-center bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Why Choose Us
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Experience Premium Quality & Reliability
            </h2>
            
            <p className="text-xl text-primary-100 mb-8 leading-relaxed">
              We combine cutting-edge technology with exceptional service to deliver the safest, most comfortable, and most convenient taxi experience in the city.
            </p>

            {/* Feature List */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start group">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl mr-4 flex-shrink-0 group-hover:bg-white/30 transition-colors duration-300">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
                    <p className="text-primary-100 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Side */}
          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl text-center hover:bg-white/15 transition-colors duration-300 border border-white/20">
                <div className="text-3xl lg:text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg font-semibold text-primary-100 mb-1">{stat.label}</div>
                <div className="text-sm text-primary-200">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold mb-4">Ready to Experience the Difference?</h3>
            <p className="text-primary-100 mb-6">Join thousands of satisfied customers who choose VickyCab for their daily travels.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-primary-600 hover:bg-gray-100 font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-soft hover:shadow-soft-lg">
                Book Your Ride
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-bold px-8 py-4 rounded-xl transition-all duration-200">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;