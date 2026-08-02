import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import { mediaUrl } from "@/lib/format";

export default function Services({ section }: { section: any }) {
  const items = section?.items || [];
  if (!items.length) return null;

  return (
    <section className="bg-surface py-14 md:py-20">
      <div className="container">
        <SectionHeading kicker={section.kicker} heading={section.heading} />

        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item: any) => (
            <Link
              key={item.id || item.slug}
              href={item.href || `/services/${item.slug}`}
              className="group overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-card"
            >
              <div className="relative aspect-[16/11] overflow-hidden">
                {item.image ? (
                  <Image
                    src={mediaUrl(item.image)}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-surface" />
                )}
              </div>
              <div className="p-4">
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
