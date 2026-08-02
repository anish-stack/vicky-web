"use client";

import React from "react";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Globe,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";
// import Link from "next/link";

const Footer = () => {
  const { website } = useWebsite();
  // const website = []

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
    <footer className="bg-gray-900 dark:bg-gray-950 text-white">

      {/* ================= MAIN FOOTER ================= */}
      {/* <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">

          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-500 p-2 rounded-lg">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {website?.basicInfo?.name || "Vicky Cab"}
                </h3>
                <p className="text-gray-400 text-sm">
                  Tour & Travels
                </p>
              </div>
            </div>

            <p className="text-gray-400 leading-relaxed">
              Your trusted travel partner providing safe,
              reliable, and comfortable taxi services.
            </p>
            <div className="flex space-x-4">
              {socials.map(({ key, url, Icon }) =>
                url ? (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    className="bg-gray-800 hover:bg-gray-700 p-2 rounded-lg"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ) : null
              )}
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                "Home",
                "About Us",
                "Services",
                "Tour Packages",
                "Contact",
              ].map((link) => (
                <li key={link}>
                  <a className="text-gray-400 hover:text-white flex items-center group">
                    <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100" />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">
              Our Services
            </h4>
            <ul className="space-y-3">
              {[
                "One Way Drop",
                "Round Trip",
                "Airport Transfer",
                "Outstation Taxi",
              ].map((service) => (
                <li key={service}>
                  <a className="text-gray-400 hover:text-white flex items-center group">
                    <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100" />
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">
              Get in Touch
            </h4>

            <div className="space-y-4 text-gray-400 text-sm">
              <p>
                📞 {website?.basicInfo?.phone ||
                  "+91 98765 43210"}
              </p>
              <p>
                📧 {website?.basicInfo?.email ||
                  "info@taxi.com"}
              </p>
              <p>
                📍 {website?.basicInfo?.address ||
                  "Delhi, India"}
              </p>
            </div>
          </div>
        </div>
      </div> */}

      {/* ================= NEWSLETTER ================= */}
      {/* <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h4 className="font-semibold">
              Let's Start Your Journey
            </h4>
            <p className="text-gray-400 text-sm">
              Subscribe for offers & updates
            </p>
          </div>

          <div className="flex gap-3">
            <input
              placeholder="Enter your email"
              className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700"
            />
            <button className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold">
              Subscribe
            </button>
          </div>
        </div>
      </div> */}

      {/* ================= BOTTOM BAR (COPIED UI) ================= */}
      <div className="w-full py-3 md:py-5 bg-zinc-950 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-zinc-400">

            {/* Left */}
            <div className="text-center md:text-left">
              Powered by{" "}
              <a
                href="/"
                className="!text-[#DC2626] font-semibold hover:underline"
              >
                TaxiSafar
              </a>
            </div>

            {/* Center */}
            <div className="text-center">
              © {new Date().getFullYear()}{" "}
              {website?.basicInfo?.name ||
                "TaxiSafar"}{" "}
              . All rights reserved.
            </div>

            {/* Right Social Row */}
            <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-zinc-900/80 md:bg-transparent md:p-0">
              {socials.map(({ key, url, Icon }) =>
                url ? (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
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
