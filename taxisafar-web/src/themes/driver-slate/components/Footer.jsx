import { useWebsite } from "@/context/WebsiteContext";
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Globe, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Road } from "./Header";

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
    <footer>
      <Road className="h-4" />
      <div className="bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-semibold text-gray-400">
            <div className="text-center md:text-left">
              Powered by{" "}
              <Link href="/" className="!text-amber-400 font-extrabold hover:underline">
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
                    className="w-8 h-8 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-sky-600 hover:text-white transition-colors"
                  >
                    <Icon size={14} />
                  </a>
                ) : null
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
