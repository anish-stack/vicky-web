import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWebsite } from "@/context/WebsiteContext";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Rides", href: "#rides" },
  { label: "About", href: "#about" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  const { website } = useWebsite()
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-white border-b border-red-100">
        <div className="max-w-7xl mx-auto px-3 h-14 md:h-20 flex items-center justify-between">

          {/* Logo */}
          <a href="#home" className="flex items-center gap-2">
            <img
              src={
                website?.basicInfo?.logoUrl ||
                "https://www.taxisafar.com/images/logo/taxisafar-logo.png"
              }
              alt={website?.basicInfo?.name || "TaxiSafar Logo"}
              className="h-12 w-auto object-contain"
            />

            <h4
              className="text-red-600 font-extrabold italic text-3xl tracking-wide"
              style={{ fontFamily: "RobotoBlack" }}
            >
              {website?.basicInfo?.logo_name}
            </h4>

          </a>


          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10 text-sm font-semibold text-gray-700">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="relative hover:text-red-600 transition-colors group"
              >
                {item.label}
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-red-600 transition-all group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* ✅ Desktop CTA (Download QR only) */}
          <div className="hidden md:block">

            <button className="px-6 py-3 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition active:scale-95 shadow-sm">
              Contact Us
            </button>
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setOpen(true)} className="md:hidden text-gray-700">
            <Menu size={28} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="fixed inset-0 z-50 bg-white"
          >
            {/* Mobile Top */}
            <div className="flex items-center justify-between px-4 h-14 border-b">
              <a href="#home" onClick={() => setOpen(false)}>
                <img
                  src={website?.basicInfo?.logoUrl || "https://www.taxisafar.com/images/logo/taxisafar-logo.png"}
                  alt={website?.basicInfo?.name || "TaxiSafar Logo"}
                  className="h-7 w-auto object-contain"
                />
              </a>
              <button onClick={() => setOpen(false)}>
                <X size={28} />
              </button>
            </div>

            {/* Mobile Links */}
            <div className="flex flex-col items-center gap-5 mt-10 text-lg font-semibold text-gray-800">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="hover:text-red-600 transition"
                >
                  {item.label}
                </a>
              ))}

              {/* ✅ Mobile Download QR Button */}
              <button className="mt-4 px-8 py-3 rounded-full bg-red-600 text-white font-semibold shadow-md active:scale-95">
                Download QR
              </button>

              {/* ✅ QR IMAGE ONLY ON MOBILE MENU */}
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://taxisafar.com"
                alt="TaxiSafar QR"
                className="mt-4 w-40 h-40 object-contain border rounded-xl p-2"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
