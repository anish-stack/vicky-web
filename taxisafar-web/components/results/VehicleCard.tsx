import Image from "next/image";
import { inr, mediaUrl } from "@/lib/format";

type Row = { label: string; value: string };

/**
 * `variant="fare"` renders the fare breakdown table (outstation / dham results).
 * `variant="capacity"` renders the seats + luggage list used on the dham screen.
 */
export default function VehicleCard({
  vehicle,
  variant = "fare",
  onBook,
  busy,
}: {
  vehicle: any;
  variant?: "fare" | "capacity";
  onBook: (v: any) => void;
  busy?: boolean;
}) {
  const hasDiscount = vehicle.discount > 0 && vehicle.discountPrice > 0;
  const soldOut = vehicle.availability && vehicle.availability.remaining === 0;

  const fareRows: Row[] = [
    { label: "Included Km", value: vehicle.computedKm || "—" },
    { label: "Extra fare/Km", value: inr(vehicle.extra_fare_km) },
    { label: "Toll & State Tax", value: vehicle.tollIncluded ? "Included" : "Not Include" },
    { label: "Parking Charges", value: vehicle.parkingcharges || "Not Include" },
    { label: "Driver Charges", value: vehicle.drivercharges || "Included" },
    { label: "Night Charges", value: vehicle.nightcharges || "Included" },
    { label: "Fuel Charges", value: vehicle.fuelcharges || "Included" },
  ];

  const capacityRows: Row[] = [
    { label: `${vehicle.passengers} passengers`, value: "" },
    { label: `${vehicle.large_size_bag} large size bags`, value: "" },
    { label: `${vehicle.medium_size_bag} medium size bags`, value: "" },
    { label: `${vehicle.hand_bag} hand bags`, value: "" },
  ];

  const rows = variant === "fare" ? fareRows : capacityRows;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-surface p-2">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-white">
        {vehicle.image ? (
          <Image
            src={mediaUrl(vehicle.image)}
            alt={vehicle.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-contain p-3"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-2 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold leading-tight">{vehicle.title}</h3>
            <p className="mt-0.5 text-xs text-ink-muted">Any Other Similar Cabs</p>
          </div>
          <div className="shrink-0 text-right">
            {hasDiscount ? (
              <p className="text-xs text-ink-faint line-through">{inr(vehicle.computedPrice)}</p>
            ) : null}
            <p className="font-display text-lg font-bold text-brand-500">
              {inr(hasDiscount ? vehicle.discountPrice : vehicle.computedPrice)}
            </p>
          </div>
        </div>

        <dl className="mt-3 overflow-hidden rounded-lg border border-line bg-white">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={`flex items-center justify-between px-3 py-2.5 text-xs ${
                i ? "border-t border-line" : ""
              }`}
            >
              <dt className="text-ink-muted">{row.label}</dt>
              {row.value ? <dd className="font-medium">{row.value}</dd> : null}
            </div>
          ))}
        </dl>

        {soldOut ? (
          <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-center text-xs text-brand-600">
            Fully booked for this date
          </p>
        ) : null}

        <button
          type="button"
          disabled={busy || soldOut}
          onClick={() => onBook(vehicle)}
          className="btn-primary mt-3 w-full"
        >
          {busy ? "Please wait…" : "Book a Taxi"}
        </button>

        {variant === "capacity" ? (
          <button type="button" className="mt-2 text-center text-xs text-ink-muted underline">
            Other Terms
          </button>
        ) : null}
      </div>
    </article>
  );
}
