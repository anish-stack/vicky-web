import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import { mediaUrl } from "@/lib/format";

export default function PartnerCards({ section }: { section: any }) {
  const items = section?.items || [];
  if (!items.length) return null;

  return (
    <section className="section pt-0">
      <div className="container">
        <SectionHeading kicker={section.kicker} heading={section.heading} />

        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item: any, i: number) => (
            <article key={i} className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white">
              <div className="relative aspect-[16/10]">
                {item.image ? (
                  <Image
                    src={mediaUrl(item.image)}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-surface" />
                )}
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-ink-muted">{item.description}</p>
                <Link
                  href={item.href || "#"}
                  aria-label={item.title}
                  className="mt-5 grid h-9 w-9 place-items-center rounded-full border border-line text-ink transition-colors hover:border-brand-500 hover:text-brand-500"
                >
                  <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
