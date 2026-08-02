import { useState } from "react";
import { Menu, X, Phone, MessageCircle, CarFront } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Tours", href: "#tours" },
  { label: "Routes", href: "#routes" },
  { label: "Services", href: "#services" },
  { label: "Reviews", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

// Road strip: dark asphalt band with dashed center line
export const Road = ({ className = "h-3" }) => (
  <div className={`w-full bg-gray-800 flex items-center ${className}`}>
    <div className="w-full h-[2px] bg-[repeating-linear-gradient(to_right,#fbbf24_0px,#fbbf24_16px,transparent_16px,transparent_32px)]" />
  </div>
);

export default function Header() {
  const { website } = useWebsite();
  const [open, setOpen] = useState(false);
  const basicInfo = website?.basicInfo || {};
  const phone = basicInfo.phone || "9876543210";
  const whatsapp = basicInfo.whatsapp || phone;
  const companyName = basicInfo.logo_name || basicInfo.name || "TaxiSafar";

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
          {/* Logo — highway signboard style */}
          <a href="#home" className="flex items-center gap-3 min-w-0">
            {basicInfo.logoUrl ? (
              <img src={basicInfo.logoUrl} alt={basicInfo.name || "Logo"} className="h-10 w-10 md:h-11 md:w-11 object-contain rounded-xl" />
            ) : (
              <div className="h-10 w-10 md:h-11 md:w-11 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-lg shadow-sky-600/30">
                <CarFront size={20} />
              </div>
            )}
            <div className="min-w-0 border-l-4 border-amber-400 pl-3">
              <p className="font-extrabold text-gray-900 truncate text-base md:text-lg leading-tight">{companyName}</p>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-sky-600">Taxi & Travels</p>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="relative px-4 py-2 text-sm font-bold text-gray-600 hover:text-sky-700 transition-colors group"
              >
                {l.label}
                <span className="absolute left-4 right-4 bottom-0.5 h-[3px] rounded-full bg-amber-400 scale-x-0 group-hover:scale-x-100 origin-left transition-transform" />
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2.5">
            <a
              href={`https://wa.me/91${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-extrabold shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/45 hover:-translate-y-0.5 transition-all"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
            <a
              href={`tel:+91${phone}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-extrabold shadow-md shadow-sky-600/25 hover:shadow-sky-600/45 hover:-translate-y-0.5 transition-all"
            >
              <Phone size={16} /> Call Now
            </a>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2.5 rounded-xl bg-sky-100 text-sky-700">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden bg-white border-t border-sky-100">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block px-6 py-3.5 text-sm font-bold text-gray-700 border-b border-gray-50 hover:bg-sky-50 hover:text-sky-700"
              >
                {l.label}
              </a>
            ))}
            <div className="p-4 grid grid-cols-2 gap-3">
              <a
                href={`https://wa.me/91${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 text-white text-sm font-extrabold"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
              <a
                href={`tel:+91${phone}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sky-600 text-white text-sm font-extrabold"
              >
                <Phone size={16} /> Call Now
              </a>
            </div>
          </div>
        )}
      </div>
      <Road />
    </header>
  );
}
