import { useWebsite } from "@/context/WebsiteContext";
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Globe,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const { website } = useWebsite();

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
    <footer className="w-full py-3 md:py-5 bg-zinc-950 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-zinc-400">

          {/* Left */}
          <div className="text-center md:text-left">
            Powered by{" "}
            <Link
              href="/"
              className="!text-[#DC2626] font-semibold hover:underline"
            >
              TaxiSafar
            </Link>
          </div>

          {/* Center */}
          <div className="text-center">
            © {new Date().getFullYear()}{" "}
            {website?.basicInfo?.name || "TaxiSafar"}. All rights reserved.
          </div>

          {/* Right - Mobile background row */}
          <div
            className="
              flex items-center gap-4
              px-4 py-2
              rounded-xl
              bg-zinc-900/80
              md:bg-transparent md:p-0
            "
          >
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
    </footer>
  );
}
