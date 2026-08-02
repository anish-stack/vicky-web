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
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useWebsite } from "@/context/WebsiteContext";

const Footer: React.FC = () => {
  const { website } = useWebsite() as any;
  const currentYear = new Date().getFullYear();

  const basicInfo = website?.basicInfo || {};
  const companyName = basicInfo.name || basicInfo.logo_name || "Carbook";
  const socialLinks = website?.socialLinks || {};

  const socials = [
    { key: "facebook", url: socialLinks.facebook, Icon: Facebook },
    { key: "instagram", url: socialLinks.instagram, Icon: Instagram },
    { key: "twitter", url: socialLinks.twitter, Icon: Twitter },
    { key: "linkedin", url: socialLinks.linkedin, Icon: Linkedin },
    { key: "youtube", url: socialLinks.youtube, Icon: Youtube },
    { key: "website", url: socialLinks.website, Icon: Globe },
    { key: "whatsapp", url: socialLinks.whatsapp, Icon: MessageCircle },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-10">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-orange-500 rounded-full p-1.5">
                <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold">{companyName}</h2>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed text-sm">
              Premium vehicle rentals and outstation taxi service, built around comfort,
              safety and reliability.
            </p>

            <div className="flex space-x-3">
              {socials.map(({ key, url, Icon }) =>
                url ? (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={key}
                    className="bg-gray-800 hover:bg-orange-500 p-2.5 rounded-xl transition-all duration-200"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ) : null
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-5">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              {[
                { label: "Home", href: "#home" },
                { label: "Services", href: "#services" },
                { label: "Fleet", href: "#tours" },
                { label: "Routes", href: "#routes" },
                { label: "Contact", href: "#contact" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-orange-400 transition-colors duration-200 flex items-center group"
                  >
                    <ArrowRight className="h-3.5 w-3.5 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-5">Our Services</h3>
            <ul className="space-y-3 text-sm">
              {["City Rides", "Airport Transfer", "Outstation Trips", "Tour Packages"].map(
                (service) => (
                  <li key={service}>
                    <span className="text-gray-400">{service}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-5">Get In Touch</h3>
            <div className="space-y-3.5 text-sm">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400">+91 {basicInfo.phone || "9876543210"}</span>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400 break-all">
                  {basicInfo.email ||
                    `support@${companyName.toLowerCase().replace(/\s+/g, "")}.in`}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400">
                  {basicInfo.address || basicInfo.city || "Delhi NCR, India"}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400">24/7 Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full py-3 md:py-5 bg-zinc-950 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-zinc-400">
            <div className="text-center md:text-left">
              Powered by{" "}
              <Link href="/" className="!text-orange-500 font-semibold hover:underline">
                TaxiSafar
              </Link>
            </div>

            <div className="text-center">
              © {currentYear} {companyName}. All rights reserved.
            </div>

            <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-zinc-900/80 md:bg-transparent md:p-0">
              {socials.map(({ key, url, Icon }) =>
                url ? (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={key}
                    className="hover:text-white transition-colors"
                  >
                    <Icon size={18} />
                  </a>
                ) : null
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
