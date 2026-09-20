import { useState } from "react";
import { Menu, X, Phone, MessageCircle, CarTaxiFront, BadgeCheck } from "lucide-react";
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

// India tricolor pride strip
export const Tricolor = ({ className = "h-1.5" }) => (
  <div className={`w-full flex ${className}`}>
    <span className="flex-1 bg-orange-500" />
    <span className="flex-1 bg-white" />
    <span className="flex-1 bg-green-700" />
  </div>
);

// Truck-art scallop border (row of half circles)
export const Scallop = ({ color = "#15803d", bg = "transparent", flip = false, className = "" }) => (
  <div
    className={`w-full h-3.5 ${flip ? "rotate-180" : ""} ${className}`}
    style={{
      backgroundColor: bg,
      backgroundImage: `radial-gradient(circle at 10px -4px, transparent 11px, ${color} 12px)`,
      backgroundSize: "26px 14px",
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
      <Tricolor />
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
          {/* Logo — taxi badge style */}
          <a href="#home" className="flex items-center gap-3 min-w-0">
            {basicInfo.logoUrl ? (
              <img src={basicInfo.logoUrl} alt={basicInfo.name || "Logo"} className="h-10 w-10 md:h-11 md:w-11 object-contain rounded-xl border-2 border-green-700" />
            ) : (
              <div className="h-10 w-10 md:h-11 md:w-11 rounded-xl bg-green-700 flex items-center justify-center text-white shadow-[3px_3px_0px_0px_rgba(249,115,22,1)]">
                <CarTaxiFront size={20} />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-black text-slate-900 truncate text-base md:text-lg leading-tight">{companyName}</p>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-green-700 flex items-center gap-1">
                <BadgeCheck size={10} className="text-orange-500" /> All India Permit
              </p>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-3 py-2 rounded-lg text-[13px] font-black uppercase tracking-wide text-slate-600 hover:text-green-700 hover:bg-green-50 transition-colors"
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
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-green-700 text-sm font-black border-2 border-green-700 hover:bg-green-50 transition-colors"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
            <a
              href={`tel:+91${phone}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-700 text-white text-sm font-black shadow-[3px_3px_0px_0px_rgba(249,115,22,1)] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(249,115,22,1)] transition-all"
            >
              <Phone size={16} /> Call Now
            </a>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 rounded-xl bg-green-700 text-white">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden bg-white border-t-2 border-dashed border-green-200">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block px-6 py-3.5 text-sm font-black uppercase tracking-wide text-slate-700 border-b border-slate-50 hover:bg-green-50 hover:text-green-700"
              >
                {l.label}
              </a>
            ))}
            <div className="p-4 grid grid-cols-2 gap-3">
              <a
                href={`https://wa.me/91${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-green-700 text-sm font-black border-2 border-green-700"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
              <a
                href={`tel:+91${phone}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-700 text-white text-sm font-black"
              >
                <Phone size={16} /> Call Now
              </a>
            </div>
          </div>
        )}
      </div>
      <Scallop color="#15803d" />
    </header>
  );
}
