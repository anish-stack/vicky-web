import { useState } from "react";
import { Menu, X, Phone, Sun } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Tours", href: "#tours" },
  { label: "Routes", href: "#routes" },
  { label: "Services", href: "#services" },
  { label: "Reviews", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  const { website } = useWebsite();
  const [open, setOpen] = useState(false);
  const basicInfo = website?.basicInfo || {};
  const phone = basicInfo.phone || "9876543210";
  const whatsapp = basicInfo.whatsapp || phone;

  return (
    <header className="sticky top-0 z-50 bg-orange-50/95 backdrop-blur border-b-2 border-orange-200">
      {/* Top strip */}
      <div className="bg-orange-600 text-orange-50 text-xs">
        <div className="max-w-7xl mx-auto px-4 h-8 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-semibold">
            <Sun className="h-3.5 w-3.5" /> 24×7 Outstation & Local Cabs
          </span>
          <a href={`tel:+91${phone}`} className="flex items-center gap-1.5 font-bold hover:underline">
            <Phone className="h-3 w-3" /> +91 {phone}
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-[4.5rem] flex items-center justify-between">
        <a href="#home" className="flex items-center gap-2.5 min-w-0">
          <img
            src={basicInfo.logoUrl || "https://www.taxisafar.com/images/logo/taxisafar-logo.png"}
            alt={basicInfo.name || "Logo"}
            className="h-10 w-auto object-contain flex-shrink-0"
          />
          <span className="font-black text-xl md:text-2xl text-stone-900 truncate">
            {basicInfo.logo_name || basicInfo.name || "TaxiSafar"}
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-7 text-sm font-bold text-stone-700">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="px-3 py-1.5 rounded-full hover:bg-orange-100 hover:text-orange-700 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <a
            href={`https://wa.me/91${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-2xl bg-orange-600 text-white text-sm font-black hover:bg-orange-700 transition active:scale-95 shadow-[4px_4px_0px_0px_rgba(154,52,18,0.3)]"
          >
            Book on WhatsApp
          </a>
        </div>

        <button onClick={() => setOpen(!open)} className="lg:hidden p-2 rounded-xl bg-orange-100 text-orange-700">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-orange-50 border-t-2 border-orange-200 px-5 py-4">
          <div className="flex flex-col gap-1">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-stone-800 font-bold hover:text-orange-700 transition"
              >
                {item.label}
              </a>
            ))}
            <a
              href={`https://wa.me/91${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 py-3 rounded-2xl bg-orange-600 text-white font-black"
            >
              Book on WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
