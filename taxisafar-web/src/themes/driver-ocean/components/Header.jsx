import { useState } from "react";
import { Menu, X, Phone, MessageCircle, CarTaxiFront, Crown } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Fleet", href: "#fleet" },
  { label: "Tours", href: "#tours" },
  { label: "Routes", href: "#routes" },
  { label: "Services", href: "#services" },
  { label: "Reviews", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

// Bandhani tie-dye dot strip
export const Bandhani = ({ className = "h-2.5" }) => (
  <div
    className={`w-full ${className}`}
    style={{
      backgroundColor: "#be185d",
      backgroundImage:
        "radial-gradient(circle at 6px 5px, #fbbf24 1.8px, transparent 2.4px), radial-gradient(circle at 16px 5px, #fffbf2 1.4px, transparent 2px)",
      backgroundSize: "20px 10px",
      backgroundRepeat: "repeat",
    }}
  />
);

// Marigold garland divider (row of flower dots)
export const Garland = ({ className = "" }) => (
  <div
    className={`w-full h-4 ${className}`}
    style={{
      backgroundImage:
        "radial-gradient(circle at 9px 8px, #f59e0b 5px, transparent 5.5px), radial-gradient(circle at 9px 8px, #fbbf24 3px, transparent 3.5px), radial-gradient(circle at 22px 8px, #ea580c 4px, transparent 4.5px)",
      backgroundSize: "27px 16px",
      backgroundRepeat: "repeat-x",
    }}
  />
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
      <Bandhani />
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
          {/* Logo — royal badge */}
          <a href="#home" className="flex items-center gap-3 min-w-0">
            {basicInfo.logoUrl ? (
              <img src={basicInfo.logoUrl} alt={basicInfo.name || "Logo"} className="h-10 w-10 md:h-11 md:w-11 object-contain rounded-xl border-2 border-pink-700" />
            ) : (
              <div className="h-10 w-10 md:h-11 md:w-11 rounded-xl rounded-t-[22px] bg-pink-700 flex items-center justify-center text-white shadow-[3px_3px_0px_0px_rgba(245,158,11,1)]">
                <CarTaxiFront size={20} />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-black text-slate-900 truncate text-base md:text-lg leading-tight">{companyName}</p>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-pink-700 flex items-center gap-1">
                <Crown size={10} className="text-amber-500" /> Royal Ride Service
              </p>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-3 py-2 rounded-lg text-[13px] font-black uppercase tracking-wide text-slate-600 hover:text-pink-700 hover:bg-pink-50 transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2.5">
            <a
              href={`https://wa.me/91${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-pink-700 text-sm font-black border-2 border-pink-700 hover:bg-pink-50 transition-colors"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
            <a
              href={`tel:+91${phone}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-700 text-white text-sm font-black shadow-[3px_3px_0px_0px_rgba(245,158,11,1)] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(245,158,11,1)] transition-all"
            >
              <Phone size={16} /> Call Now
            </a>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 rounded-xl bg-pink-700 text-white">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden bg-white border-t-2 border-dashed border-pink-200">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block px-6 py-3.5 text-sm font-black uppercase tracking-wide text-slate-700 border-b border-slate-50 hover:bg-pink-50 hover:text-pink-700"
              >
                {l.label}
              </a>
            ))}
            <div className="p-4 grid grid-cols-2 gap-3">
              <a
                href={`https://wa.me/91${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-pink-700 text-sm font-black border-2 border-pink-700"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
              <a
                href={`tel:+91${phone}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-pink-700 text-white text-sm font-black"
              >
                <Phone size={16} /> Call Now
              </a>
            </div>
          </div>
        )}
      </div>
      <Garland className="bg-white" />
    </header>
  );
}
