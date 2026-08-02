import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import { mediaUrl } from "@/lib/format";

export default function Destinations({ section }: { section: any }) {
  const items = section?.items || [];
  const scroller = useRef<HTMLDivElement>(null);

  if (!items.length) return null;

  return (
    <section className="section">
      <div className="container">
        <SectionHeading heading={section.heading} subheading={section.subheading} />

        <div className="relative mt-9">
          <div
            ref={scroller}
            className="no-scrollbar grid snap-x snap-mandatory grid-flow-col auto-cols-[minmax(260px,1fr)] gap-5 overflow-x-auto pb-2 md:grid-flow-row md:auto-cols-auto md:grid-cols-3 md:overflow-visible"
          >
            {items.slice(0, 6).map((item: any) => (
              <Link
                key={item.id || item.slug}
                href={item.href || `/destinations/${item.slug}`}
                className="group snap-start overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-card"
              >
                <div className="relative aspect-[16/11] overflow-hidden">
                  {item.image ? (
                    <Image
                      src={mediaUrl(item.image)}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 80vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-surface" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-base font-semibold">{item.title}</h3>
                  <p className="mt-1 text-xs text-ink-muted">
                    {item.subtitle || (item.propertyCount ? `${item.propertyCount.toLocaleString("en-IN")} properties` : "")}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scroller.current?.scrollBy({ left: 300, behavior: "smooth" })}
            aria-label="Scroll destinations"
            className="absolute -right-2 top-[38%] hidden h-9 w-9 place-items-center rounded-full border border-line bg-white shadow-pop md:grid"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
