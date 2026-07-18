import React from "react";
import { Phone, MessageCircle, Mail } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

const StickyButtons: React.FC = () => {
  const { website } = useWebsite();

  const basicInfo = website?.basicInfo || {};
  const phone = basicInfo.phone || "9876543210";
  const whatsapp = basicInfo.whatsapp || phone;

  const openContactModal = () => {
    window.dispatchEvent(new CustomEvent("openContactModal"));
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-40">
      {/* WhatsApp Button */}
      <a
        href={`https://wa.me/91${whatsapp}?text=${encodeURIComponent(
          "Hi! I need a taxi booking."
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
      </a>

      {/* Call Button */}
      <a
        href={`tel:+91${phone}`}
        className="bg-emerald-700 hover:bg-emerald-800 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
        aria-label="Call Now"
      >
        <Phone className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
      </a>

      {/* Contact Modal Button */}
      <button
        onClick={openContactModal}
        className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
        aria-label="Send Message"
      >
        <Mail className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
      </button>
    </div>
  );
};

export default StickyButtons;
