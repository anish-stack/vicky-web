import { inr } from "@/lib/format";

export default function PriceSummary({ quote }: { quote: any }) {
  if (!quote) return null;

  return (
    <section className="mt-6">
      <h2 className="text-sm font-semibold">Price Summary</h2>

      <dl className="mt-3 space-y-2 text-xs">
        <div className="flex justify-between">
          <dt className="text-ink-muted">Cab Charge ({quote.vehicle?.label})</dt>
          <dd className="font-medium">{inr(quote.cabCharge)}</dd>
        </div>

        {quote.hotel ? (
          <div className="flex justify-between">
            <dt className="text-ink-muted">
              Hotel Charge ({quote.hotel.nights} Night{quote.hotel.rooms > 1 ? ` × ${quote.hotel.rooms} rooms` : ""})
            </dt>
            <dd className="font-medium">{inr(quote.hotelCharge)}</dd>
          </div>
        ) : null}

        <div className="flex justify-between border-t border-line pt-2">
          <dt className="font-semibold">Total Payable Amount</dt>
          <dd className="font-display text-sm font-bold text-brand-500">{inr(quote.totalPayable)}</dd>
        </div>
      </dl>

      <p className="mt-3 flex items-center justify-between rounded-lg bg-[#ECFDF5] px-3 py-2 text-xs text-[#047857]">
        <span>Cab booking charge ({quote.bookingChargePercent}%)</span>
        <span className="font-semibold">{inr(quote.bookingChargeAmount)}</span>
      </p>
      <p className="mt-1.5 text-[10px] text-ink-muted">
        Pay {inr(quote.bookingChargeAmount)} now to confirm. Balance {inr(quote.balanceDue)} is paid to the driver.
      </p>
    </section>
  );
}
