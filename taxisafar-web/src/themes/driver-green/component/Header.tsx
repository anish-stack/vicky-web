import React, { useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Tours", href: "#tours" },
  { label: "Routes", href: "#routes" },
  { label: "Services", href: "#services" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

const Header: React.FC = () => {
  const { website } = useWebsite();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const basicInfo = website?.basicInfo || {};
  const phone = basicInfo.phone || "9876543210";
  const whatsapp = basicInfo.whatsapp || phone;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-emerald-100 shadow-sm">
      {/* Top utility bar */}
      <div className="hidden sm:block bg-emerald-700 text-emerald-50 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Phone className="h-3 w-3" /> +91 {phone}
          </span>
          <span>24/7 Outstation &amp; Local Cab Service</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2 min-w-0">
            <img
              src={
                basicInfo.logoUrl ||
                "https://www.taxisafar.com/images/logo/taxisafar-logo.png"
              }
              alt={basicInfo.name || "Taxi Logo"}
              className="h-11 w-auto object-contain flex-shrink-0"
            />
            <h1 className="text-emerald-700 font-extrabold text-2xl md:text-3xl tracking-wide truncate">
              {basicInfo.logo_name || basicInfo.name || "TaxiSafar"}
            </h1>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-700">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="relative hover:text-emerald-700 transition-colors group"
              >
                {item.label}
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-emerald-600 transition-all group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <a
              href={`https://wa.me/91${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition active:scale-95 shadow-sm"
            >
              Book a Ride
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-emerald-50 text-emerald-700"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-emerald-100 shadow-lg">
          <div className="px-4 pt-3 pb-4 space-y-1">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-emerald-50 hover:text-emerald-700 transition"
              >
                {item.label}
              </a>
            ))}
            <a
              href={`https://wa.me/91${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMenuOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold"
            >
              Book a Ride
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
