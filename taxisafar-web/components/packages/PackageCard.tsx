import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Hotel, Car, BadgeCheck, Repeat, CalendarDays, Info } from "lucide-react";
import Stars from "@/components/ui/Stars";
import { inr, mediaUrl } from "@/lib/format";

const ICONS: Record<string, any> = {
  hotel: Hotel,
  car: Car,
  driver: BadgeCheck,
  route: Repeat,
  calendar: CalendarDays,
};

export default function PackageCard({ pkg }: { pkg: any }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-card">
      <div className="relative aspect-[16/10]">
        {pkg.coverImage ? (
          <Image
            src={mediaUrl(pkg.coverImage)}
            alt={pkg.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-surface" />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold leading-tight">
          {pkg.fromCityName} To {pkg.toCityName}
        </h3>

        <p className="mt-2 flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-md bg-brand-50 px-2 py-1 font-medium text-brand-600">{pkg.durationLabel}</span>
          <span className="rounded-md bg-surface px-2 py-1 text-ink-soft">
            {pkg.tripType === "roundTrip" ? "Round Trip" : "One Way"}
          </span>
        </p>

        <p className="mt-3 text-xs leading-relaxed text-ink-muted">{pkg.shortDescription}</p>

        {pkg.highlights?.length ? (
          <ul className="mt-4 grid grid-cols-5 gap-1 border-y border-line py-3">
            {pkg.highlights.slice(0, 5).map((h: any, i: number) => {
              const Icon = ICONS[h.icon] || CalendarDays;
              return (
                <li key={i} className="flex flex-col items-center gap-1 text-center">
                  <Icon size={16} className="text-brand-500" />
                  <span className="text-[9px] font-medium leading-tight">{h.title}</span>
                  <span className="text-[8px] leading-tight text-ink-faint">{h.subtitle}</span>
                </li>
              );
            })}
          </ul>
        ) : null}

        {pkg.hotelOptional ? (
          <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-[#EFF6FF] px-3 py-2 text-[11px] text-[#1D4ED8]">
            <Info size={13} className="mt-px shrink-0" />
            Hotel Include / Not Include options available
          </p>
        ) : null}

        <div className="mt-4 flex items-end justify-between border-t border-line pt-4">
          <div>
            <p className="text-[11px] text-ink-muted">Taxi Charge</p>
            <p className="font-display text-2xl font-bold text-brand-500">{inr(pkg.startingPrice)}</p>
            <p className="text-[10px] text-ink-muted">All Including</p>
          </div>
          <div className="text-right">
            <p className="flex items-center justify-end gap-1 text-xs font-medium">
              <span className="text-[#FFB020]">★</span> {pkg.rating}
              <span className="text-ink-muted">({pkg.reviewCount}+ Reviews)</span>
            </p>
            <div className="mt-1 flex justify-end">
              <Stars value={pkg.rating} size={12} />
            </div>
          </div>
        </div>

        <Link href={`/packages/${pkg.slug}`} className="btn-primary mt-4 w-full">
          View Details &amp; Book Now <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}
