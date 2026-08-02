import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { inr, mediaUrl } from "@/lib/format";

export default function HotelPicker({
  options = [],
  value,
  rooms,
  onChange,
  onRooms,
  nights,
  adults,
  childCount,
}: {
  options: any[];
  value: string;
  rooms: number;
  onChange: (id: string) => void;
  onRooms: (n: number) => void;
  nights: number;
  adults: number;
  childCount: number;
}) {
  if (!options.length) return null;

  return (
    <fieldset className="mt-8">
      <legend className="text-sm font-semibold">
        Select Your Hotel {nights ? <span className="font-normal text-ink-muted">({nights} Night)</span> : null}
      </legend>
      <p className="mt-1 text-xs text-ink-muted">Choose your preferred hotel for this tour</p>

      <div className="mt-4 space-y-2.5">
        {options.map((opt) => {
          const selected = value === opt._id;
          return (
            <label
              key={opt._id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                selected ? "border-brand-500 bg-brand-50/50" : "border-line bg-white"
              }`}
            >
              <input
                type="radio"
                name="hotelOption"
                checked={selected}
                onChange={() => onChange(opt._id)}
                className="mt-1 h-4 w-4 shrink-0 accent-brand-500"
              />

              <span className="relative h-14 w-16 shrink-0 overflow-hidden rounded-md bg-surface">
                {opt.hotel?.image ? (
                  <Image src={mediaUrl(opt.hotel.image)} alt="" fill sizes="64px" className="object-cover" />
                ) : null}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span className="block text-sm font-medium">{opt.hotel?.name}</span>
                  <span className="shrink-0 font-display text-sm font-bold text-brand-500">{inr(opt.price)}</span>
                </span>
                <span className="block text-[10px] text-ink-muted">{opt.hotel?.roomType}</span>
                <span className="mt-1 block text-[10px] text-ink-muted">
                  Check-in: {opt.hotel?.checkInTime} · Check-out: {opt.hotel?.checkOutTime}
                </span>
                <span className="block text-[10px] text-ink-muted">
                  {opt.nights || nights} Night · {adults} Adults{childCount ? `, ${childCount} Children` : ""}
                </span>

                {selected ? (
                  <span className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-ink-muted">Room:</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        onRooms(Math.max(1, rooms - 1));
                      }}
                      aria-label="Remove a room"
                      className="grid h-6 w-6 place-items-center rounded border border-line"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="w-4 text-center text-xs font-medium">{rooms}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        onRooms(rooms + 1);
                      }}
                      aria-label="Add a room"
                      className="grid h-6 w-6 place-items-center rounded border border-line"
                    >
                      <Plus size={11} />
                    </button>
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}

        <label
          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
            !value ? "border-brand-500 bg-brand-50/50" : "border-line bg-white"
          }`}
        >
          <input
            type="radio"
            name="hotelOption"
            checked={!value}
            onChange={() => onChange("")}
            className="h-4 w-4 shrink-0 accent-brand-500"
          />
          <span className="text-sm font-medium">No Hotel Required</span>
        </label>
      </div>
    </fieldset>
  );
}
