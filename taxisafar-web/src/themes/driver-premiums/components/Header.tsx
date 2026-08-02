import React, { useState } from "react";
import { Menu, X, MapPin, Phone, Mail, Globe, User } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { website } = useWebsite() as any;

  const navItems = [
    { name: "Home", href: "#" },
    { name: "Services", href: "#services" },
    { name: "Vehicle Models", href: "#tours" },
    { name: "News", href: "#routes" },
    { name: "Locations", href: "#locations" },
    { name: "Faq", href: "#contact" },
  ];

  return (
    <header className="sticky top-0 z-50">
      {/* ── Top bar ── */}
      <div className="bg-gray-800 text-gray-300 py-2 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-orange-400" />
              <span>{website?.basicInfo?.phone || "+91 98765 43210"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="h-3 w-3 text-orange-400" />
              <span>{website?.basicInfo?.email || "info@example.com"}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-orange-400" />
            <span>24/7 Service Available</span>
          </div>
        </div>
      </div>

      {/* ── Main Header ── */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <a href="#" className="flex items-center gap-2 flex-shrink-0">
              {website?.basicInfo?.logoUrl ? (
                <img
                  src={website.basicInfo.logoUrl}
                  alt={website?.basicInfo?.name || "Logo"}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                /* Default orange pin icon logo if no logo */
                <div className="flex items-center gap-2">
                  <div className="bg-orange-500 rounded-full p-1.5">
                    <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </div>
                  <span className="font-extrabold text-xl text-gray-800 tracking-tight">
                    {website?.basicInfo?.logo_name || "Carbook"}
                  </span>
                </div>
              )}
              {website?.basicInfo?.logoUrl && (
                <span className="font-extrabold text-xl text-gray-800 tracking-tight">
                  {website?.basicInfo?.logo_name}
                </span>
              )}
            </a>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-600 hover:text-orange-500 px-3 py-2 text-sm font-medium transition-colors relative group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
                </a>
              ))}
            </nav>

            {/* Right actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* Language */}
              <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-orange-500 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                <Globe size={16} />
                <span className="font-medium">EN | ₹</span>
              </button>

              {/* Login */}
              <a
                href="#"
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
              >
                <User size={15} />
                Log in | Register
              </a>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 text-gray-600"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 pt-3 pb-4 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center text-gray-700 hover:text-orange-500 hover:bg-orange-50 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <div className="pt-3 border-t border-gray-100">
              <a
                href="#"
                className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
              >
                <User size={15} />
                Log in | Register
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;