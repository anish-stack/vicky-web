import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ChevronDown, Play } from "lucide-react";
import { mediaUrl } from "@/lib/format";

export default function FeatureAccordion({ section }: { section: any }) {
  const items = section?.items || [];
  const [open, setOpen] = useState(0);

  if (!items.length) return null;

  return (
    <section className="section pt-0">
      <div className="container grid items-center gap-10 lg:grid-cols-2">
        <div>
          <h2 className="max-w-xs text-2xl leading-tight md:text-[30px]">{section.heading}</h2>

          <div className="mt-7 space-y-2.5">
            {items.map((item: any, i: number) => {
              const expanded = open === i;
              return (
                <div
                  key={i}
                  className={`overflow-hidden rounded-xl border transition-colors ${
                    expanded ? "border-brand-200 bg-brand-50/60" : "border-line bg-white"
                  }`}
                >
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpen(expanded ? -1 : i)}
                      aria-expanded={expanded}
                      className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                    >
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold ${
                          expanded ? "bg-brand-500 text-white" : "bg-surface text-ink-muted"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 text-sm font-medium">{item.title}</span>
                      <ChevronDown
                        size={16}
                        className={`shrink-0 text-ink-faint transition-transform ${expanded ? "rotate-180" : ""}`}
                      />
                    </button>
                  </h3>
                  {expanded ? (
                    <p className="px-4 pb-4 pl-14 text-xs leading-relaxed text-ink-muted">{item.body}</p>
                  ) : null}
                </div>
              );
            })}
          </div>

          {section.ctaLabel ? (
            <Link href={section.ctaHref || "/"} className="btn-primary mt-7">
              {section.ctaLabel} <ArrowRight size={15} />
            </Link>
          ) : (
            <Link href="/" className="btn-primary mt-7">
              Book Outstation Cab <ArrowRight size={15} />
            </Link>
          )}
        </div>

        <div className="relative">
          {/* dotted route line from the design */}
          <svg
            className="pointer-events-none absolute -left-6 top-1/3 hidden h-64 w-16 lg:block"
            viewBox="0 0 60 240"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M30 10 C 5 70, 55 130, 30 230"
              stroke="#FFC53D"
              strokeWidth="2.5"
              strokeDasharray="6 8"
              strokeLinecap="round"
            />
            <circle cx="30" cy="10" r="6" fill="#EF3124" />
            <circle cx="30" cy="230" r="6" fill="#16A34A" />
          </svg>

          <div className="relative mx-auto aspect-[3/4] max-w-sm overflow-hidden rounded-[28px]">
            {section.image ? (
              <Image
                src={mediaUrl(section.image)}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-surface" />
            )}
            {section.videoUrl ? (
              <a
                href={section.videoUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Play video"
                className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 shadow-pop"
              >
                <Play size={20} className="translate-x-0.5 fill-ink text-ink" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
