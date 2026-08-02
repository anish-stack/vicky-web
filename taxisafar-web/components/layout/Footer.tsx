import Link from "next/link";
import { useState } from "react";
import { Phone, Mail, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { request } from "@/lib/api";

const QUICK = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Service", href: "/services" },
  { label: "Contact", href: "/contact" },
];

const SUPPORT = [
  { label: "Customer Support", href: "/customer-support" },
  { label: "FAQs", href: "/faq" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Term & Conditions", href: "/terms-of-use" },
];

function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<{ kind: "idle" | "busy" | "done" | "error"; message?: string }>({ kind: "idle" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ kind: "busy" });
    try {
      await request("post", "/newsletter", { email });
      setEmail("");
      setState({ kind: "done", message: "Subscribed. Offers will land in your inbox." });
    } catch (err: any) {
      setState({ kind: "error", message: err.message });
    }
  };

  return (
    <div className="container">
      <div className="rounded-2xl bg-ink px-6 py-8 md:px-12 md:py-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <h2 className="max-w-sm text-xl leading-snug text-white md:text-2xl">
            Stay Updated With
            <br />
            The Latest News &amp; Offers!
          </h2>

          <form onSubmit={submit} className="w-full max-w-md">
            <div className="flex overflow-hidden rounded-lg bg-white p-1">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email id"
                className="min-w-0 flex-1 px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint"
              />
              <button type="submit" disabled={state.kind === "busy"} className="btn-primary shrink-0">
                {state.kind === "busy" ? "Subscribing…" : "Subscribe"}
              </button>
            </div>
            {state.message ? (
              <p className={`mt-2 text-xs ${state.kind === "error" ? "text-brand-300" : "text-white/70"}`}>
                {state.message}
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Footer({ settings = {} as any }) {
  const social = settings.social || {};
  const socials = [
    { icon: Facebook, href: social.facebook, label: "Facebook" },
    { icon: Instagram, href: social.instagram, label: "Instagram" },
    { icon: Linkedin, href: social.linkedin, label: "LinkedIn" },
    { icon: Youtube, href: social.youtube, label: "YouTube" },
  ].filter((s) => s.href);

  return (
    <footer className="relative mt-16">
      {/* the newsletter panel straddles the footer edge, as in the design */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-white" aria-hidden="true" />
      <div className="relative pt-0">
        <Newsletter />
      </div>

      <div className="-mt-20 bg-surface pt-28">
        <div className="container pb-10">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Logo />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
                Enjoy reliable, comfortable cab services tailored to your needs. From airport transfers to
                local rentals, round trips, and one-way rides — we&apos;ve got you covered!
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold">Quick Link</h3>
              <ul className="mt-4 space-y-3">
                {QUICK.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-ink-muted hover:text-brand-500">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-base font-semibold">Support</h3>
              <ul className="mt-4 space-y-3">
                {SUPPORT.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-ink-muted hover:text-brand-500">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-base font-semibold">Contact</h3>
              <ul className="mt-4 space-y-5">
                <li className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-500">
                    <Phone size={16} />
                  </span>
                  <span>
                    <span className="block text-[11px] font-medium uppercase tracking-wide text-brand-500">
                      Call anytime
                    </span>
                    <a href={`tel:${settings.support_phone || ""}`} className="text-sm font-medium">
                      {settings.support_phone || "+91 78945 61230"}
                    </a>
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-500">
                    <Mail size={16} />
                  </span>
                  <span>
                    <span className="block text-[11px] font-medium uppercase tracking-wide text-brand-500">
                      Email
                    </span>
                    <a href={`mailto:${settings.support_email || ""}`} className="text-sm font-medium">
                      {settings.support_email || "support@taxisafar.com"}
                    </a>
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
            <p className="text-xs text-ink-muted">
              Copyright © TaxiSafar. All rights reserved @{new Date().getFullYear()}.
            </p>
            <div className="flex items-center gap-4">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                  className="text-ink-muted transition-colors hover:text-brand-500"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
