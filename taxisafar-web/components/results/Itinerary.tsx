import { MapPin } from "lucide-react";

/** Day-by-day list shown under the Char Dham fare cards. */
export default function Itinerary({ stops = [] }: { stops: any[] }) {
  if (!stops.length) return null;

  return (
    <section className="mt-14">
      <h2 className="text-2xl">Your Itinerary</h2>

      <ol className="mt-7 space-y-5">
        {stops.map((stop: any, i: number) => (
          <li key={i} className="flex gap-5">
            <div className="flex shrink-0 flex-col items-center">
              <span className="grid h-12 w-12 place-items-center rounded-full border border-brand-200 bg-brand-50 text-center text-[10px] font-semibold leading-tight text-brand-600">
                DAY
                <br />
                {String(stop.day || i + 1).padStart(2, "0")}
              </span>
              {i < stops.length - 1 ? <span className="mt-1 w-px flex-1 bg-line" aria-hidden="true" /> : null}
            </div>

            <div className="flex-1 rounded-xl border border-line p-5">
              <h3 className="flex items-center gap-2 text-base font-semibold">
                <MapPin size={16} className="shrink-0 text-brand-500" />
                {stop.name}
                {stop.distance || stop.duration ? (
                  <span className="font-normal text-ink-muted">
                    ({[stop.distance, stop.duration].filter(Boolean).join(" / ")})
                  </span>
                ) : null}
              </h3>
              {stop.description ? (
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{stop.description}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
