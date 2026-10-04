// Small presentational pieces shared by the tour pages (server-safe, no hooks).
import React from "react";
import { SOCIAL_LINKS } from "@/lib/tourPackage";

export function SectionTitle({ children, icon }: { children: React.ReactNode; icon?: string }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-[18px] font-bold text-slate-900 sm:text-[20px]">
      {icon && <i className={`${icon} text-[16px] text-red-600`} />}
      {children}
    </h2>
  );
}

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 ${className}`}>{children}</section>;
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-[12px] font-semibold text-slate-800 sm:text-[13px]">
      {children}
    </span>
  );
}

export function Stars({ value, size = "text-[14px]" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <i
          key={i}
          className={`${value >= i ? "fa-solid fa-star" : value >= i - 0.5 ? "fa-solid fa-star-half-stroke" : "fa-regular fa-star"} ${size} text-amber-400`}
        />
      ))}
    </span>
  );
}

export function Feature({ icon, label, sub, tone }: { icon: string; label: string; sub?: string; tone: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5 px-0.5 text-center">
      <span className={`grid h-10 w-10 place-items-center rounded-full sm:h-12 sm:w-12 ${tone}`}>
        <i className={`${icon} text-[16px] sm:text-[19px]`} />
      </span>
      <span className="text-[10px] font-semibold leading-tight text-slate-800 sm:text-[12px]">{label}</span>
      {sub && <span className="-mt-1 text-[9px] leading-tight text-slate-500 sm:text-[11px]">{sub}</span>}
    </div>
  );
}

export function CheckList({ items, tone }: { items: string[]; tone: "yes" | "no" }) {
  return (
    <ul className="m-0 list-none space-y-2 p-0">
      {items.map((s, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[14px] leading-snug text-slate-700">
          <i
            className={`mt-0.5 text-[15px] ${tone === "yes" ? "fa-solid fa-circle-check text-green-600" : "fa-solid fa-circle-xmark text-red-500"}`}
          />
          <span>{s}</span>
        </li>
      ))}
    </ul>
  );
}

/** Fixed bottom action bar (all screen sizes). Leave `pb-28` on the page so content isn't hidden. */
export function BottomBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur">
      <div
        className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        {children}
      </div>
    </div>
  );
}


/** Brand backgrounds - the real brand colours (Instagram uses its multi-colour gradient). */
const BRAND_BG: Record<string, string> = {
  facebook: "linear-gradient(180deg,#2d8cff 0%,#1877f2 100%)",
  youtube: "linear-gradient(180deg,#ff3b30 0%,#ff0000 100%)",
  instagram: "radial-gradient(circle at 30% 107%,#fdf497 0%,#fdf497 5%,#fd5949 45%,#d6249f 60%,#285aeb 90%)",
  whatsapp: "linear-gradient(180deg,#3be07a 0%,#25d366 100%)",
};

/** Facebook / YouTube / Instagram / WhatsApp - full-colour brand icons, each opens its own profile. */
export function SocialLinks({ title = "Follow us", className = "" }: { title?: string; className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-2.5 ${className}`}>
      {title && <p className="m-0 text-[13px] font-semibold text-slate-600">{title}</p>}
      <ul className="m-0 flex list-none items-center gap-3.5 p-0">
        {SOCIAL_LINKS.map((s) => (
          <li key={s.key}>
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              title={s.label}
              className="grid h-12 w-12 place-items-center rounded-full text-[22px] text-white no-underline shadow-md ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg"
              style={{ background: BRAND_BG[s.key] || s.color, color: "#fff" }}
            >
              <i className={s.icon} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}