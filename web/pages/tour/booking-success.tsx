import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { CALL_NUMBER, TourBooking, getTourBookingByRef, inr, prettyDate } from "@/lib/tourPackage";
import { Panel } from "@/components/tour/TourBits";

export default function TourBookingSuccessPage() {
  const router = useRouter();
  const ref = typeof router.query.ref === "string" ? router.query.ref : "";
  const [booking, setBooking] = useState<TourBooking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ref) return;
    let alive = true;
    getTourBookingByRef(ref).then((b) => {
      if (alive) {
        setBooking(b);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [ref]);

  return (
    <>
      <Head>
        <title>Booking confirmed</title>
        <meta name="robots" content="noindex" />
      </Head>
      <main className="mt-20 min-h-[70vh] bg-slate-50 px-3 py-10 sm:px-6">
        <div className="mx-auto max-w-xl">
          {loading ? (
            <Panel className="text-center text-[14px] text-slate-500">Loading your booking…</Panel>
          ) : !booking ? (
            <Panel className="text-center">
              <p className="m-0 text-[15px] font-semibold text-slate-900">We couldn't find that booking.</p>
              <p className="m-0 mt-1 text-[13px] text-slate-600">
                If money was deducted, please <a href={`tel:${CALL_NUMBER}`} className="font-semibold text-red-600">call us</a> with your payment details.
              </p>
              <Link href="/" className="mt-4 inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-[14px] font-semibold text-white no-underline hover:bg-red-700">
                Go to homepage
              </Link>
            </Panel>
          ) : (
            <Panel>
              <div className="mb-4 flex flex-col items-center text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-green-100 text-green-700">
                  <i className="fa-solid fa-check text-[24px]" />
                </span>
                <h1 className="m-0 mt-3 text-[19px] font-extrabold text-slate-900">Booking confirmed!</h1>
                <p className="m-0 mt-1 text-[13px] text-slate-600">
                  Booking ref <span className="font-semibold text-slate-900">{booking.booking_ref}</span>. A confirmation will reach you on +91 {booking.mobile}.
                </p>
              </div>

              <dl className="m-0 divide-y divide-slate-100 text-[14px]">
                <div className="flex justify-between gap-3 py-2">
                  <dt className="text-slate-600">Tour</dt>
                  <dd className="m-0 text-right font-medium text-slate-900">{booking.tour_title}</dd>
                </div>
                <div className="flex justify-between gap-3 py-2">
                  <dt className="text-slate-600">Pickup</dt>
                  <dd className="m-0 text-right font-medium text-slate-900">{prettyDate(booking.pickup_date || "")} {booking.pickup_time}</dd>
                </div>
                {booking.return_date && (
                  <div className="flex justify-between gap-3 py-2">
                    <dt className="text-slate-600">Return</dt>
                    <dd className="m-0 text-right font-medium text-slate-900">{prettyDate(booking.return_date)} {booking.return_time}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-3 py-2">
                  <dt className="text-slate-600">Vehicle</dt>
                  <dd className="m-0 text-right font-medium text-slate-900">{booking.vehicle_label || "—"}</dd>
                </div>
                {booking.hotel_name && (
                  <div className="flex justify-between gap-3 py-2">
                    <dt className="text-slate-600">Hotel</dt>
                    <dd className="m-0 text-right font-medium text-slate-900">{booking.hotel_name}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-3 py-2.5">
                  <dt className="font-bold text-slate-900">Total amount</dt>
                  <dd className="m-0 text-[16px] font-extrabold text-slate-900">{inr(booking.total_amount)}</dd>
                </div>
                <div className="flex justify-between gap-3 py-2">
                  <dt className="text-green-700">Advance paid</dt>
                  <dd className="m-0 font-semibold text-green-700">{inr(booking.advance_amount)}</dd>
                </div>
                <div className="flex justify-between gap-3 py-2">
                  <dt className="text-slate-600">Balance (pay at trip)</dt>
                  <dd className="m-0 font-medium text-slate-900">{inr(booking.balance_amount)}</dd>
                </div>
              </dl>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Link href="/tour-bookings" className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-center text-[14px] font-semibold text-slate-800 no-underline hover:border-slate-400">
                  View my bookings
                </Link>
                <a href={`tel:${CALL_NUMBER}`} className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-center text-[14px] font-semibold text-white no-underline hover:bg-red-700">
                  Call support
                </a>
              </div>
            </Panel>
          )}
        </div>
      </main>
    </>
  );
}
