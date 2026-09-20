"use client";

import { useState } from "react";
import { Menu, X, MapPin, HelpCircle, Globe } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Fares", href: "#routes" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  const { website } = useWebsite();
  const [open, setOpen] = useState(false);
  const basicInfo = website?.basicInfo || {};
  const name = basicInfo.logo_name || basicInfo.name || "QuickRide";
  const phone = basicInfo.phone || "9876543210";
  const whatsapp = basicInfo.whatsapp || phone;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-[4.5rem] flex items-center justify-between gap-4">
        <a href="#home" className="flex items-center gap-2 min-w-0 flex-shrink-0">
          {basicInfo.logoUrl ? (
            <img src={basicInfo.logoUrl} alt={name} className="h-9 w-9 object-contain rounded-lg flex-shrink-0" />
          ) : (
            <span className="h-9 w-9 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
              <MapPin size={18} className="text-white" fill="white" strokeWidth={1.5} />
            </span>
          )}
          <span className="leading-tight">
            <span className="block font-extrabold text-lg md:text-xl text-slate-900 truncate">{name}</span>
            <span className="hidden sm:block text-[10px] font-bold tracking-widest text-orange-500 uppercase -mt-0.5">
              Ride Anywhere
            </span>
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
          {navLinks.map((item) => (
            <a key={item.label} href={item.href} className="hover:text-orange-500 transition-colors">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-5">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <HelpCircle size={15} /> Help
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Globe size={15} /> EN
          </span>
          <a
            href={`https://wa.me/91${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-full border border-slate-200 text-sm font-bold text-slate-700 hover:border-slate-300 transition-colors"
          >
            Login
          </a>
          <a
            href={`tel:+91${phone}`}
            className="px-5 py-2.5 rounded-full bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200"
          >
            Book Now
          </a>
        </div>

        <button onClick={() => setOpen(!open)} className="lg:hidden p-2 rounded-lg bg-slate-50 text-slate-700">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-white border-t border-slate-100 px-5 py-4">
          <div className="flex flex-col gap-1">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-slate-700 font-semibold hover:text-orange-500 transition"
              >
                {item.label}
              </a>
            ))}
            <a
              href={`https://wa.me/91${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center py-3 rounded-full border border-slate-200 font-bold text-slate-700"
            >
              Login
            </a>
            <a
              href={`tel:+91${phone}`}
              className="mt-2 flex items-center justify-center py-3 rounded-full bg-orange-500 text-white font-bold"
            >
              Book Now
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
