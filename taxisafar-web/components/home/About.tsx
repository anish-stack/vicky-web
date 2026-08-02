import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Headphones, Play } from "lucide-react";
import { mediaUrl } from "@/lib/format";

export default function About({ section }: { section: any }) {
  if (!section) return null;

  return (
    <section className="section pt-0">
      <div className="container grid items-center gap-10 lg:grid-cols-2">
        <div className="relative">
          <span
            aria-hidden="true"
            className="absolute -left-3 -top-6 text-4xl leading-none text-[#FFB020]"
          >
            ✳
          </span>

          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            {section.image ? (
              <Image
                src={mediaUrl(section.image)}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
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
                aria-label="Play intro video"
                className="absolute right-6 top-1/2 grid h-14 w-14 -translate-y-1/2 place-items-center rounded-full bg-white/95 shadow-pop"
              >
                <Play size={20} className="translate-x-0.5 fill-ink text-ink" />
              </a>
            ) : null}

            <div className="absolute bottom-4 left-4 flex items-center gap-4 rounded-xl bg-white/95 px-4 py-2.5 shadow-pop">
              <div>
                <p className="text-[10px] text-ink-muted">Client</p>
                <div className="mt-1 flex -space-x-2">
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} className="h-6 w-6 rounded-full border-2 border-white bg-brand-200" />
                  ))}
                </div>
              </div>
              <div className="border-l border-line pl-4">
                <p className="text-[10px] text-ink-muted">Rating</p>
                <p className="text-sm font-semibold">4.5 ★</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="kicker">{section.kicker}</p>
          <h2 className="mt-2 text-2xl leading-tight md:text-[32px]">{section.heading}</h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">{section.body}</p>

          {section.data?.note ? (
            <p className="mt-5 border-l-2 border-ink pl-4 text-sm text-ink-soft">{section.data.note}</p>
          ) : (
            <p className="mt-5 border-l-2 border-ink pl-4 text-sm text-ink-soft">
              Our reliable cab services ensure a safe, comfortable, and hassle-free journey.
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-6">
            <span className="flex items-center gap-2 text-sm">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-500">
                <CalendarCheck size={16} />
              </span>
              Online Booking
            </span>
            <span className="flex items-center gap-2 text-sm">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-500">
                <Headphones size={16} />
              </span>
              24/7 Support
            </span>
          </div>

          {section.ctaLabel ? (
            <Link href={section.ctaHref || "/"} className="btn-primary mt-7">
              {section.ctaLabel} <ArrowRight size={15} />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
