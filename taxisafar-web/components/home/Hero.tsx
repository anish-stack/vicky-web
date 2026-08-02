import Image from "next/image";
import BookingWidget from "@/components/booking/BookingWidget";
import { mediaUrl } from "@/lib/format";

const FALLBACK: Record<string, string> = {
  taxi: "/images/hero-taxi.svg",
  chardham: "/images/hero-chardham.svg",
  hotel: "/images/hero-hotel.svg",
};

export default function Hero({
  section,
  tab,
  bootstrap,
}: {
  section: any;
  tab: "taxi" | "chardham" | "hotel";
  bootstrap: any;
}) {
  const image = mediaUrl(section?.image) || FALLBACK[tab];

  return (
    <section className="relative bg-ink">
      <div className="absolute inset-0">
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/40 to-transparent md:from-ink/70" />
      </div>

      <div className="container relative flex min-h-[440px] items-center py-8 md:min-h-[520px]">
        <BookingWidget tab={tab} bootstrap={bootstrap} />
      </div>

      {section?.heading ? <h1 className="sr-only">{section.heading}</h1> : null}
    </section>
  );
}
