import { useWebsite } from "@/context/WebsiteContext";
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Globe, MessageCircle } from "lucide-react";
import Link from "next/link";

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
    <footer className="bg-stone-900 border-t-4 border-orange-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-stone-400 font-semibold">
          <div className="text-center md:text-left">
            Powered by{" "}
            <Link href="/" className="!text-orange-400 font-black hover:underline">
              TaxiSafar
            </Link>
          </div>

          <div className="text-center">
            © {new Date().getFullYear()} {basicInfo.name || "TaxiSafar"}. All rights reserved.
          </div>

          <div className="flex items-center gap-4">
            {socials.map(({ key, url, Icon }) =>
              url ? (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={key}
                  className="w-8 h-8 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-400 hover:text-orange-400 hover:border-orange-500 transition-colors"
                >
                  <Icon size={15} />
                </a>
              ) : null
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
