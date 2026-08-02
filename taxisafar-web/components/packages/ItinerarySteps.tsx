import Image from "next/image";
import { mediaUrl } from "@/lib/format";

export default function ItinerarySteps({ day }: { day: any }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold">{day.title}</h2>
      {day.distance || day.duration ? (
        <p className="mt-1 text-xs text-ink-muted">{[day.distance, day.duration].filter(Boolean).join(" · ")}</p>
      ) : null}

      <ol className="mt-5 space-y-5 border-l border-line pl-5">
        {(day.items || []).map((item: any, i: number) => (
          <li key={i} className="relative">
            <span
              className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#2563EB] ring-4 ring-white"
              aria-hidden="true"
            />
            <h3 className="text-sm font-semibold">{item.title}</h3>
            {item.description ? <p className="mt-1 text-xs text-ink-muted">{item.description}</p> : null}
          </li>
        ))}
      </ol>

      {day.image ? (
        <div className="relative mt-6 aspect-[16/10] overflow-hidden rounded-xl">
          <Image src={mediaUrl(day.image)} alt="" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
        </div>
      ) : null}
    </section>
  );
}
