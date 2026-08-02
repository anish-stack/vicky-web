import { useWebsite } from "@/context/WebsiteContext";
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Globe, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Bandhani } from "./Header";

export default function Footer() {
  const { website } = useWebsite();
  const basicInfo = website?.basicInfo || {};
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
    <footer className="bg-pink-950">
      <Bandhani className="h-2.5" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-[11px] font-black uppercase tracking-[0.35em] text-pink-400 mb-5">
          ✦ Guest Is God · Fair Fares, Royal Rides ✦
        </p>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-bold text-pink-200/70">
          <div className="text-center md:text-left">
            Powered by{" "}
            <Link href="/" className="!text-amber-300 font-black hover:underline">
              TaxiSafar
            </Link>
          </div>

          <div className="text-center">
            © {new Date().getFullYear()} {basicInfo.name || "TaxiSafar"}. All rights reserved.
          </div>

          <div className="flex items-center gap-3">
            {socials.map(({ key, url, Icon }) =>
              url ? (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={key}
                  className="w-8 h-8 rounded-lg bg-pink-900 border border-pink-800 flex items-center justify-center text-pink-300 hover:bg-amber-400 hover:text-pink-900 hover:border-amber-400 transition-colors"
                >
                  <Icon size={14} />
                </a>
              ) : null
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
