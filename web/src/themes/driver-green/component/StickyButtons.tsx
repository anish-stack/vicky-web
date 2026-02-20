import React from 'react';
import { Phone, MessageCircle, Mail } from 'lucide-react';

const StickyButtons: React.FC = () => {
  const openContactModal = () => {
    window.dispatchEvent(new CustomEvent('openContactModal'));
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-40">
      {/* WhatsApp Button */}
      <a
        href="https://wa.me/919999999999?text=Hi! I need a taxi booking."
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 group hover:-translate-y-1"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
      </a>

      {/* Call Button */}
      <a
        href="tel:+919999999999"
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 group hover:-translate-y-1"
        aria-label="Call Now"
      >
        <Phone className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
      </a>

      {/* Contact Modal Button */}
      <button
        onClick={openContactModal}
        className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 text-white p-4 rounded-full shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 group hover:-translate-y-1"
        aria-label="Send Message"
      >
        <Mail className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
      </button>
    </div>
  );
};

export default StickyButtons;