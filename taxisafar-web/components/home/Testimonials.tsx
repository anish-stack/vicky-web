import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Stars from "@/components/ui/Stars";
import { mediaUrl } from "@/lib/format";

export default function Testimonials({ section }: { section: any }) {
  const items = section?.items || [];
  const [index, setIndex] = useState(0);
  if (!items.length) return null;

  const active = items[index];
  const stats = section.data || {};
  const gallery = section.images || [];

  const move = (delta: number) => setIndex((i) => (i + delta + items.length) % items.length);

  return (
    <section className="section">
      <div className="container grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="kicker">{section.kicker}</p>
          <h2 className="mt-2 max-w-sm text-2xl leading-tight md:text-[32px]">{section.heading}</h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-muted">{section.body}</p>

          <div className="mt-8 flex gap-12">
            {stats.satisfactionRate ? (
              <div>
                <p className="font-display text-3xl font-bold">
                  {stats.satisfactionRate}
                  <span className="text-brand-500">%</span>
                </p>
                <p className="mt-1 text-xs text-ink-muted">Satisfaction Rate</p>
              </div>
            ) : null}
            {stats.yearsOfExperience ? (
              <div>
                <p className="font-display text-3xl font-bold">
                  {stats.yearsOfExperience}
                  <span className="text-brand-500">+</span>
                </p>
                <p className="mt-1 text-xs text-ink-muted">Year of Experience</p>
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <figure className="rounded-2xl bg-surface p-6">
            <Stars value={active.rating} />
            <blockquote className="mt-3 text-sm leading-relaxed text-ink-soft">{active.message}</blockquote>

            <figcaption className="mt-5 flex items-center justify-between">
              <span className="flex items-center gap-3">
                <span className="relative h-9 w-9 overflow-hidden rounded-full bg-brand-100">
                  {active.avatar ? (
                    <Image src={mediaUrl(active.avatar)} alt="" fill sizes="36px" className="object-cover" />
                  ) : null}
                </span>
                <span>
                  <span className="block text-sm font-medium">{active.name}</span>
                  <span className="block text-xs text-ink-muted">{active.designation}</span>
                </span>
              </span>

              <span className="flex gap-2">
                <button
                  onClick={() => move(-1)}
                  aria-label="Previous review"
                  className="grid h-8 w-8 place-items-center rounded-full border border-line bg-white"
                >
                  <ArrowLeft size={14} />
                </button>
                <button
                  onClick={() => move(1)}
                  aria-label="Next review"
                  className="grid h-8 w-8 place-items-center rounded-full border border-line bg-white"
                >
                  <ArrowRight size={14} />
                </button>
              </span>
            </figcaption>
          </figure>

          {gallery.length ? (
            <div className="mt-4 grid grid-cols-2 gap-4">
              {gallery.slice(0, 2).map((src: string, i: number) => (
                <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <Image src={mediaUrl(src)} alt="" fill sizes="25vw" className="object-cover" />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
