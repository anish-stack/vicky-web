import React from 'react';
import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-900 dark:bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 mb-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="bg-primary-600 text-white p-2.5 rounded-xl mr-3 shadow-soft">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold">VickyCab</h2>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Your trusted partner for safe, reliable, and comfortable transportation. Available 24/7 for all your travel needs.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-3">
              <a href="#" className="bg-gray-800 hover:bg-primary-600 p-3 rounded-xl transition-all duration-200 group">
                <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              </a>
              <a href="#" className="bg-gray-800 hover:bg-primary-600 p-3 rounded-xl transition-all duration-200 group">
                <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              </a>
              <a href="#" className="bg-gray-800 hover:bg-primary-600 p-3 rounded-xl transition-all duration-200 group">
                <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              </a>
              <a href="#" className="bg-gray-800 hover:bg-primary-600 p-3 rounded-xl transition-all duration-200 group">
                <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {['Home', 'Services', 'Tour Packages', 'About Us', 'Contact'].map((link, index) => (
                <li key={index}>
                  <a
                    href={`#${link.toLowerCase().replace(' ', '')}`}
                    className="text-gray-300 hover:text-primary-500 transition-colors duration-200 hover:translate-x-1 transform inline-block"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold mb-6">Our Services</h3>
            <ul className="space-y-3">
              {['City Rides', 'Airport Transfer', 'Outstation Trips', 'Tour Packages', 'Corporate Bookings'].map((service, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-primary-500 transition-colors duration-200 hover:translate-x-1 transform inline-block"
                  >
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6">Get In Touch</h3>
            <div className="space-y-4">
              <div className="flex items-start group">
                <Phone className="w-5 h-5 text-primary-500 mr-3 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                <div>
                  <p className="text-gray-300 hover:text-white transition-colors duration-200">+91 9999999999</p>
                  <p className="text-gray-300 hover:text-white transition-colors duration-200">+91 8888888888</p>
                </div>
              </div>
              
              <div className="flex items-start group">
                <Mail className="w-5 h-5 text-primary-500 mr-3 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                <div>
                  <p className="text-gray-300 hover:text-white transition-colors duration-200">info@vickycab.com</p>
                  <p className="text-gray-300 hover:text-white transition-colors duration-200">support@vickycab.com</p>
                </div>
              </div>
              
              <div className="flex items-start group">
                <MapPin className="w-5 h-5 text-primary-500 mr-3 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                <p className="text-gray-300 hover:text-white transition-colors duration-200">
                  123 Main Street, Delhi, India - 110001
                </p>
              </div>
              
              <div className="flex items-start group">
                <Clock className="w-5 h-5 text-primary-500 mr-3 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                <p className="text-gray-300 hover:text-white transition-colors duration-200">24/7 Available</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} VickyCab. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors duration-200">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors duration-200">
                Refund Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;