import React from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Globe,
  MessageCircle,
  ChevronRight,
  Shield,
  Car,
  Users,
  Tag,
  Plane,
  Navigation,
  Building2,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useWebsite } from "@/context/WebsiteContext";

const serviceList = [
  { label: "City Rides", Icon: Car },
  { label: "Airport Transfer", Icon: Plane },
  { label: "Outstation Trips", Icon: Navigation },
  { label: "Tour Packages", Icon: Tag },
  { label: "Corporate Travel", Icon: Building2 },
  { label: "Event Transport", Icon: CalendarDays },
];

const trustBadges = [
  { Icon: Shield, label: "Safe &", sub: "Secure" },
  { Icon: Clock, label: "24/7", sub: "Available" },
  { Icon: Users, label: "Verified", sub: "Drivers" },
  { Icon: Tag, label: "Best Price", sub: "Guarantee" },
];

const quickLinks = [
  { label: "Home", href: "#home" },
  { label: "Tours", href: "#tours" },
  { label: "Routes", href: "#routes" },
  { label: "Services", href: "#services" },
  { label: "About Us", href: "#about" },
  { label: "Contact Us", href: "#contact" },
  { label: "FAQ", href: "#faq" },
  { label: "Blog", href: "#blog" },
];

const Footer: React.FC = () => {
  const { website } = useWebsite();
  const currentYear = new Date().getFullYear();

  const basicInfo = website?.basicInfo || {};
  const companyName = basicInfo.name || "TaxiSafar";
  const socialLinks = website?.socialLinks || {};

  const socials = [
    { key: "facebook", url: socialLinks.facebook, Icon: Facebook },
    { key: "instagram", url: socialLinks.instagram, Icon: Instagram },
    { key: "twitter", url: socialLinks.twitter, Icon: Twitter },
    { key: "linkedin", url: socialLinks.linkedin, Icon: Linkedin },
    { key: "youtube", url: socialLinks.youtube, Icon: Youtube },
    { key: "website", url: socialLinks.website, Icon: Globe },
    { key: "whatsapp", url: socialLinks.whatsapp, Icon: MessageCircle },
  ].filter((s) => !!s.url);

  const nameParts = companyName.trim().split(/\s+/);
  const firstWord = nameParts[0];
  const restWords = nameParts.slice(1).join(" ");

  return (
    <footer className="relative text-white overflow-hidden">
      {/* Wave divider top */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-10 pointer-events-none">
        <svg
          viewBox="0 0 1440 80"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-16 sm:h-20"
        >
          <path
            d="M0,0 C360,80 1080,0 1440,60 L1440,0 L0,0 Z"
            fill="white"
          />
        </svg>
      </div>

      {/* Background image layer */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/footer.png"
          alt="Footer background"
          fill
          className="object-cover object-center"
          priority={false}
        />
        {/* Dark gradient overlay — heavier at top, lighter at bottom for image visibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(5,30,25,0.96) 0%, rgba(5,30,25,0.88) 55%, rgba(5,30,25,0.65) 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 pt-24 sm:pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
          <div className="grid lg:grid-cols-[1.4fr_1fr_1.2fr_1.1fr] gap-10 xl:gap-14">
            {/* ── Col 1: Brand ── */}
            <div>
              {/* Logo */}
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="flex items-center justify-center rounded-2xl w-14 h-14 shadow-lg flex-shrink-0"
                  style={{ background: "rgba(20,180,120,0.18)", border: "1.5px solid rgba(20,180,120,0.35)" }}
                >
                  <svg className="w-7 h-7 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                  </svg>
                </div>
                <div className="leading-tight">
                  <span className="text-2xl font-extrabold text-white tracking-tight">
                    {firstWord}{" "}
                  </span>
                  {restWords && (
                    <span className="text-2xl font-extrabold text-emerald-400 tracking-tight block sm:inline">
                      {restWords}
                    </span>
                  )}
                </div>
              </div>

              {/* Emerald underline accent */}
              <div className="w-12 h-0.5 bg-emerald-500 rounded mb-4 ml-1" />

              <p className="text-gray-300 text-sm leading-relaxed mb-6 max-w-xs">
                Your trusted partner for safe, reliable, and comfortable
                transportation. Available 24/7 for all your travel needs.
              </p>

              {/* Trust badges */}
              <div className="grid grid-cols-4 gap-2 mb-7">
                {trustBadges.map(({ Icon, label, sub }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl text-center"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
                  >
                    <Icon className="w-5 h-5 text-emerald-400" />
                    <span className="text-[10px] leading-tight text-gray-300 font-medium">
                      {label}
                      <br />
                      {sub}
                    </span>
                  </div>
                ))}
              </div>

              {/* Follow Us */}
              <p className="text-sm font-semibold text-white mb-3 tracking-wide">
                Follow Us
              </p>
              <div className="flex flex-wrap gap-2">
                {socials.map(({ key, url, Icon }) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={key}
                    className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 hover:bg-emerald-600"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                  >
                    <Icon className="w-4 h-4 text-gray-300" />
                  </a>
                ))}
              </div>
            </div>

            {/* ── Col 2: Quick Links ── */}
            <div>
              <h3 className="text-base font-bold mb-2 tracking-wide text-white">
                Quick Links
              </h3>
              <div className="w-8 h-0.5 bg-emerald-500 rounded mb-5" />
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="flex items-center gap-2 text-sm text-gray-300 hover:text-emerald-400 transition-colors duration-200 group"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Col 3: Services ── */}
            <div>
              <h3 className="text-base font-bold mb-2 tracking-wide text-white">
                Our Services
              </h3>
              <div className="w-8 h-0.5 bg-emerald-500 rounded mb-5" />
              <ul className="space-y-3">
                {serviceList.map(({ label, Icon }) => (
                  <li
                    key={label}
                    className="flex items-center gap-3 text-sm text-gray-300 group cursor-default"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600/30 transition-colors"
                      style={{ background: "rgba(20,180,120,0.12)" }}
                    >
                      <Icon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="group-hover:text-white transition-colors">
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Col 4: Contact + App ── */}
            <div>
              <h3 className="text-base font-bold mb-2 tracking-wide text-white">
                Get In Touch
              </h3>
              <div className="w-8 h-0.5 bg-emerald-500 rounded mb-5" />
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "rgba(20,180,120,0.12)" }}
                  >
                    <Phone className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                    <span className="text-sm text-gray-200 font-medium">
                      +91 {basicInfo.phone || "9999999999"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "rgba(20,180,120,0.12)" }}
                  >
                    <Mail className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Email</p>
                    <span className="text-sm text-gray-200 break-all">
                      {basicInfo.email ||
                        `support@${companyName.toLowerCase().replace(/\s+/g, "")}.in`}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "rgba(20,180,120,0.12)" }}
                  >
                    <MapPin className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Address</p>
                    <span className="text-sm text-gray-200">
                      {basicInfo.address || basicInfo.city || "New Delhi, India"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "rgba(20,180,120,0.12)" }}
                  >
                    <Clock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Hours</p>
                    <span className="text-sm text-gray-200">24/7 Available</span>
                  </div>
                </div>
              </div>

            
            </div>
          </div>

          {/* Tagline */}
          <div className="mt-12 text-center pointer-events-none select-none">
            <p
              className="text-3xl sm:text-4xl font-bold italic"
              style={{
                fontFamily: "'Georgia', serif",
                color: "rgba(255,255,255,0.10)",
                letterSpacing: "0.01em",
              }}
            >
              Your Journey,{" "}
              <span className="text-emerald-500/30">Our Priority!</span>
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="border-t w-full py-4 sm:py-5"
          style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.45)" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ background: "rgba(20,180,120,0.2)" }}
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <span>
                  Powered by{" "}
                  <Link
                    href="/"
                    className="text-emerald-400 font-semibold hover:underline"
                  >
                    TaxiSafar
                  </Link>
                </span>
              </div>

              <div className="text-center text-gray-500 text-xs sm:text-sm">
                © {currentYear} {companyName}. All rights reserved.
              </div>

              <div className="flex items-center gap-3">
                {socials.map(({ key, url, Icon }) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={key}
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    <Icon size={17} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;