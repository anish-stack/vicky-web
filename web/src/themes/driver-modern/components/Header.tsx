import React, { useState } from 'react';
import { Menu, X, Sun, Moon, MapPin, Phone, Mail } from 'lucide-react';
// import { useWebsite } from "@/context/WebsiteContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const { isDark, toggleTheme } = useTheme();

  const navItems = [
    { name: 'Home', href: '#' },
    { name: 'Tours', href: '#tours' },
    { name: 'Routes', href: '#routes' },
    { name: 'Services', href: '#services' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-yellow-500 dark:bg-yellow-600 text-black dark:text-gray-900 py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Phone className="h-3 w-3" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center space-x-1">
              <Mail className="h-3 w-3" />
              <span>info@vickycab.com</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span>24/7 Service Available</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="bg-yellow-500 text-black p-2 rounded-lg">
                <MapPin className="h-6 w-6" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Vicky Cab</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Tour & Travels</p>
              </div>
            </div>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 px-3 py-2 text-sm font-medium transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </nav>

          {/* Theme toggle and mobile menu */}
          <div className="flex items-center space-x-4">
            {/* <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button> */}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 block px-3 py-2 text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;