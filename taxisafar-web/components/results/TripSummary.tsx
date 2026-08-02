import { useState } from "react";
import { ChevronDown, MapPin, Navigation, Circle } from "lucide-react";
import { splitDate, daysBetween } from "@/lib/format";

/** Pickup / drop header strip. Multi-stop routes collapse behind a toggle on mobile. */
export default function TripSummary({ session }: { session: any }) {
  const [open, setOpen] = useState(false);
  const pickup = splitDate(session.pickUpDate);
  const drop = splitDate(session.dropDate);

  const places = session.places || [];
  const first = places[0];
  const last = places.length > 1 ? places[places.length - 1] : null;
  const hasStops = places.length > 2;

  const label =
    session.car_tab === "chardham"
      ? `Minimum ${session.dhamPackageDays || 5} Days Tour`
      : session.tripType === "roundTrip"
      ? `Round Trip - ${daysBetween(session.pickUpDate, session.dropDate)} Days`
      : session.tripType === "oneWay"
      ? "One Way Trip"
      : session.tripType === "local"
      ? "Local Rental"
      : "Airport Transfer";

  return (
    <div className="card p-4 md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[11px] text-ink-muted">Pickup Date &amp; Time</p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="rounded-md bg-brand-50 px-2 py-0.5 font-display text-xl font-bold text-brand-500">
              {pickup.day}
            </span>
            <span className="text-sm">
              <span className="block text-ink-muted">{pickup.month}, {pickup.year}</span>
              <span className="block font-semibold">{pickup.time}</span>
            </span>
          </p>
        </div>

        <span className="self-center rounded-lg bg-surface px-4 py-2 text-xs font-medium">{label}</span>

        <div className="md:text-right">
          <p className="text-[11px] text-ink-muted">Drop Date &amp; Time</p>
          <p className="mt-1 flex items-baseline gap-2 md:justify-end">
            <span className="rounded-md bg-brand-50 px-2 py-0.5 font-display text-xl font-bold text-brand-500">
              {drop.day}
            </span>
            <span className="text-sm">
              <span className="block text-ink-muted">{drop.month}, {drop.year}</span>
              <span className="block font-semibold">{drop.time}</span>
            </span>
          </p>
        </div>
      </div>

      {places.length ? (
        <>
          {/* desktop: from ....... to */}
          <div className="mt-5 hidden items-center gap-4 md:flex">
            <span className="flex flex-1 items-center gap-2 rounded-lg bg-surface px-3 py-2.5 text-xs">
              <Navigation size={14} className="shrink-0 text-ink-muted" />
              <span className="truncate">{first?.label}</span>
            </span>
            <span className="h-px flex-1 border-t border-dashed border-line" aria-hidden="true" />
            {last ? (
              <span className="flex flex-1 items-center gap-2 rounded-lg bg-surface px-3 py-2.5 text-xs">
                <MapPin size={14} className="shrink-0 text-ink-muted" />
                <span className="truncate">{last.label}</span>
              </span>
            ) : null}
          </div>

          {/* mobile: collapsible stop list */}
          <div className="mt-4 md:hidden">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-ink py-2.5 text-sm font-medium"
            >
              {hasStops ? "View Multiple Points" : "View Route"}
              <ChevronDown size={15} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
            </button>

            {open ? (
              <ol className="mt-4 space-y-3">
                {places.map((p: any, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 shrink-0 text-ink-faint">
                      {i === 0 ? <Navigation size={14} /> : i === places.length - 1 ? <MapPin size={14} /> : <Circle size={10} />}
                    </span>
                    <span className="flex-1 rounded-lg bg-surface px-3 py-2 text-xs">{p.label}</span>
                  </li>
                ))}
              </ol>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
