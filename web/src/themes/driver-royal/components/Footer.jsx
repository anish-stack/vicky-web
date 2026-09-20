"use client";

import Link from "next/link";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  UsersRound,
  IndianRupee,
  Heart,
} from "lucide-react";

import { useWebsite } from "@/context/WebsiteContext";

const quickLinks = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "Tour Packages", href: "#tours" },
  { label: "Popular Routes", href: "#routes" },
  { label: "About Us", href: "#about" },
  { label: "FAQs", href: "#faq" },
  { label: "Contact Us", href: "#contact" },
];

const services = [
  "City Cab",
  "Airport Transfer",
  "Outstation Trips",
  "Corporate Travel",
  "Tempo Traveller",
  "Wedding Car Rental",
  "Driver Partner",
];

export default function Footer() {
  const { website } = useWebsite();

  const basicInfo = website?.basicInfo || {};
  const socialLinks = website?.socialLinks || {};

  const name =
    basicInfo.logo_name ||
    basicInfo.name ||
    "QuickRide";

  const phone =
    basicInfo.phone ||
    basicInfo.whatsapp ||
    "+91 98765 43210";

  const email =
    basicInfo.email ||
    "support@quickride.com";

  const address =
    basicInfo.address ||
    basicInfo.city ||
    "Delhi, India";

  const rawWhatsapp =
    basicInfo.whatsapp ||
    basicInfo.phone ||
    "919876543210";

  const whatsapp = rawWhatsapp
    .toString()
    .replace(/\D/g, "")
    .replace(/^91(?=\d{10}$)/, "");

  const whatsappUrl = `https://wa.me/91${whatsapp}?text=${encodeURIComponent(
    "Hi, I need help with a ride booking."
  )}`;

  const socials = [
    { key: "facebook", url: socialLinks.facebook, Icon: Facebook },
    { key: "instagram", url: socialLinks.instagram, Icon: Instagram },
    { key: "twitter", url: socialLinks.twitter, Icon: Twitter },
    { key: "youtube", url: socialLinks.youtube, Icon: Youtube },
    { key: "linkedin", url: socialLinks.linkedin, Icon: Linkedin },
  ].filter((item) => item.url);

  return (
    <footer className="relative overflow-hidden bg-[#FFF9F3]">

      {/* RESPONSIVE BACKGROUND IMAGE */}
      <picture className="pointer-events-none absolute inset-0">
        <source media="(max-width: 639px)" srcSet="/images/footer-bg-mobile.png" />
        <img src="/images/footer-bg-desktop.png" alt="" className="h-full w-full object-cover object-bottom" />
      </picture>

      {/* Readability Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/95 via-white/85 to-white/40 sm:from-white/92 sm:via-white/70 sm:to-transparent" />

      {/* MAIN FOOTER */}
      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">

        <div className="grid gap-8 pb-12 pt-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.9fr_1.1fr] lg:gap-8 lg:pt-12">

          {/* BRAND COLUMN */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF641A] text-white shadow-md">
                <MapPin size={20} fill="currentColor" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold tracking-tight text-[#071936]">
                  {name}
                </h3>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#FF641A]">
                  Ride Anywhere
                </p>
              </div>
            </div>

            <p className="mt-3 max-w-[320px] text-xs leading-5 text-slate-600 sm:text-[13px]">
              Your trusted travel partner for city rides, airport transfers, outstation trips and more. Safe, comfortable and always on time.
            </p>

            {/* TRUST ITEMS */}
            <div className="mt-4 grid max-w-[340px] grid-cols-3 gap-2.5">
              <TrustItem icon={ShieldCheck} label="Safe" sub="Travel" />
              <TrustItem icon={UsersRound} label="Verified" sub="Drivers" />
              <TrustItem icon={IndianRupee} label="Clear" sub="Pricing" />
            </div>

            {/* SOCIALS */}
            {socials.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {socials.map(({ key, url, Icon }) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={key}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-[#071936] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#FF641A] hover:bg-[#FF641A] hover:text-white"
                  >
                    <Icon size={14} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* QUICK LINKS */}
          <div>
            <FooterHeading>Quick Links</FooterHeading>
            <div className="mt-3.5 space-y-2">
              {quickLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="group flex w-fit items-center gap-2 text-xs font-medium text-slate-600 transition-colors hover:text-[#FF641A] sm:text-[13px]"
                >
                  <ArrowRight size={12} className="text-[#FF641A] opacity-70 transition-transform group-hover:translate-x-1" />
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {/* SERVICES */}
          <div>
            <FooterHeading>Our Services</FooterHeading>
            <div className="mt-3.5 space-y-2">
              {services.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF641A]" />
                  <span className="text-xs font-medium text-slate-600 sm:text-[13px]">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* GET IN TOUCH */}
          <div>
            <FooterHeading>Get In Touch</FooterHeading>
            <div className="mt-3.5 space-y-3">
              <ContactItem icon={Phone} title={phone} subtitle="Call us anytime" />
              <ContactItem icon={Mail} title={email} subtitle="We'll respond soon" />
              <ContactItem icon={MapPin} title={address} subtitle="Our office location" />
            </div>

            {/* WHATSAPP BUTTON */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-4 flex max-w-[300px] items-center justify-between rounded-xl bg-[#FF641A] px-3.5 py-3 text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#E95813]"
            >
              <div className="flex items-center gap-2.5">
                <MessageCircle size={18} />
                <div>
                  <p className="text-xs font-extrabold">Chat on WhatsApp</p>
                  <p className="text-[10px] text-orange-100">Fast booking & support</p>
                </div>
              </div>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </a>

            <div className="mt-2.5 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[10px] font-medium text-slate-500">
                We usually reply within minutes
              </span>
            </div>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-slate-900/10 py-4">
          <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
            <p className="text-[11px] font-medium text-slate-500">
              © {new Date().getFullYear()} {name}. All rights reserved.
            </p>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500">
                Made by <span className="font-extrabold text-[#FF641A]">Taxi Safar</span>
              </span>
              <Heart size={12} className="fill-[#FF641A] text-[#FF641A]" />
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}

/* FOOTER HEADING */
function FooterHeading({ children }) {
  return (
    <div>
      <h4 className="text-sm font-extrabold text-[#071936]">
        {children}
      </h4>
      <div className="mt-1.5 h-[2.5px] w-7 rounded-full bg-[#FF641A]" />
    </div>
  );
}

/* TRUST ITEM */
function TrustItem({ icon: Icon, label, sub }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-orange-100 bg-white/70 px-2 py-1.5 shadow-sm backdrop-blur-sm">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[#FF641A]">
        <Icon size={12} />
      </div>
      <div className="text-left min-w-0">
        <p className="text-[10px] font-extrabold leading-tight text-[#071936] truncate">{label}</p>
        <p className="text-[8px] leading-tight text-slate-500 truncate">{sub}</p>
      </div>
    </div>
  );
}

/* CONTACT ITEM */
function ContactItem({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FF641A] text-white shadow-sm">
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <p className="break-words text-xs font-extrabold text-[#071936]">
          {title}
        </p>
        <p className="text-[10px] text-slate-500">
          {subtitle}
        </p>
      </div>
    </div>
  );
}