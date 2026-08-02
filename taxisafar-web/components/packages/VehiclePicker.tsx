import Image from "next/image";
import { Snowflake } from "lucide-react";
import { inr, mediaUrl } from "@/lib/format";

export default function VehiclePicker({
  options = [],
  value,
  onChange,
}: {
  options: any[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <fieldset className="mt-8">
      <legend className="text-sm font-semibold">Select Your Vehicle</legend>
      <p className="mt-1 text-xs text-ink-muted">Choose your preferred vehicle for this tour</p>

      <div className="mt-4 space-y-2.5">
        {options.map((opt) => {
          const selected = value === opt._id;
          return (
            <label
              key={opt._id}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                selected ? "border-brand-500 bg-brand-50/50" : "border-line bg-white"
              }`}
            >
              <input
                type="radio"
                name="vehicleOption"
                checked={selected}
                onChange={() => onChange(opt._id)}
                className="h-4 w-4 shrink-0 accent-brand-500"
              />

              <span className="relative h-11 w-16 shrink-0 overflow-hidden rounded-md bg-surface">
                {opt.image ? (
                  <Image src={mediaUrl(opt.image)} alt="" fill sizes="64px" className="object-contain p-1" />
                ) : null}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{opt.label}</span>
                <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[10px] text-ink-muted">
                  <span>{opt.seats}</span>
                  <span aria-hidden="true">·</span>
                  <span>{opt.suitcases}</span>
                  {opt.ac ? (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-0.5">
                        <Snowflake size={9} /> AC
                      </span>
                    </>
                  ) : null}
                </span>
              </span>

              <span className="shrink-0 text-right">
                <span className="block font-display text-sm font-bold text-brand-500">{inr(opt.price)}</span>
                <span className="block text-[9px] text-ink-muted">All Including</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
