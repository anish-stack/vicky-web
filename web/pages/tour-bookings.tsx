import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { CALL_NUMBER, TourBooking, getMyTourBookings, inr, prettyDate } from "@/lib/tourPackage";
import { useCustomerContext } from "@/context/userContext";

const cleanMobile = (v: string) => v.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");

const statusPill = (s: string) => {
  const map: Record<string, string> = {
    pending: "bg-amber-50 text-amber-800",
    confirmed: "bg-sky-50 text-sky-800",
    completed: "bg-green-50 text-green-800",
    cancelled: "bg-red-50 text-red-700",
  };
  return map[s] || "bg-slate-100 text-slate-700";
};

export default function TourBookingsPage() {
  const { customerDetail } = useCustomerContext();
  const loginMobile = cleanMobile(String(customerDetail?.phone_number || ""));
  const loggedIn = /^[6-9]\d{9}$/.test(loginMobile);

  const [mobile, setMobile] = useState("");
  const [input, setInput] = useState("");
  const [bookings, setBookings] = useState<TourBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // logged-in customer: use the account number, no typing needed
  useEffect(() => {
    if (loggedIn) {
      setMobile(loginMobile);
      return;
    }
    try {
      const saved = localStorage.getItem("tour-booking-mobile") || "";
      if (saved) {
        setMobile(saved);
        setInput(saved);
      }
    } catch {
      /* ignore */
    }
  }, [loggedIn, loginMobile]);

  useEffect(() => {
    if (!/^[6-9]\d{9}$/.test(mobile)) return;
    let alive = true;
    setLoading(true);
    getMyTourBookings(mobile).then((rows) => {
      if (alive) {
        setBookings(rows);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [mobile]);

  const submit = () => {
    const m = cleanMobile(input);
    if (!/^[6-9]\d{9}$/.test(m)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setError("");
    setMobile(m);
    try {
      localStorage.setItem("tour-booking-mobile", m);
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <Head>
        <title>My Tour Bookings</title>
        <meta name="robots" content="noindex" />
      </Head>
      <main className="mt-20 min-h-[70vh] bg-slate-50 px-3 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h1 className="m-0 text-[19px] font-extrabold text-slate-900 sm:text-[22px]">My Tour Bookings</h1>
            {mobile && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[12.5px] font-semibold text-slate-700 ring-1 ring-slate-200">
                <i className="fa-solid fa-phone text-[10px] text-red-600" /> +91 {mobile}
              </span>
            )}
          </div>

          {/* only for visitors who are not logged in */}
          {!loggedIn && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="mb-3 rounded-xl border border-slate-200 bg-white p-3"
            >
              <label className="mb-1 block text-[12.5px] font-semibold text-slate-700">Find bookings by mobile number</label>
              <div className="flex gap-2">
                <div className="flex min-w-0 flex-1">
                  <span className="grid h-10 place-items-center rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 px-2.5 text-[13.5px] text-slate-600">+91</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={input}
                    onChange={(e) => setInput(e.target.value.replace(/\D/g, ""))}
                    placeholder="10-digit mobile number"
                    className="h-10 w-full min-w-0 rounded-r-lg border border-slate-300 px-3 text-[14px] text-slate-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
                  />
                </div>
                <button type="submit" className="h-10 shrink-0 rounded-lg bg-red-600 px-4 text-[13.5px] font-semibold text-white hover:bg-red-700">
                  Show bookings
                </button>
              </div>
              {error && <p className="mb-0 mt-1.5 text-[12px] text-red-600">{error}</p>}
            </form>
          )}

          {loading && <div className="rounded-xl border border-slate-200 bg-white p-4 text-center text-[14px] text-slate-500">Loading your bookings…</div>}

          {!loading && mobile && bookings.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <p className="m-0 text-[14px] text-slate-600">No tour bookings found for +91 {mobile}.</p>
              <Link href="/tours" className="mt-2 inline-block text-[13px] font-semibold text-red-600 no-underline hover:underline">Browse tour packages</Link>
            </div>
          )}

          <div className="space-y-2.5">
            {bookings.map((b) => (
              <section key={b.id} className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="m-0 truncate text-[14.5px] font-bold text-slate-900">{b.tour_title}</p>
                    <p className="m-0 mt-0.5 text-[12px] text-slate-500">Booking ID {b.booking_ref} · {prettyDate(b.created_at?.slice(0, 10) || "")}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusPill(b.booking_status)}`}>
                    {b.booking_status[0].toUpperCase() + b.booking_status.slice(1)}
                  </span>
                </div>
                <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-2 text-[13px] text-slate-700 sm:grid-cols-4">
                  <div>
                    <p className="m-0 text-[11px] text-slate-500">Pickup</p>
                    <p className="m-0 font-medium">{b.pickup_date ? prettyDate(b.pickup_date) : "—"}</p>
                  </div>
                  <div>
                    <p className="m-0 text-[11px] text-slate-500">Vehicle</p>
                    <p className="m-0 font-medium">{b.vehicle_label || "—"}</p>
                  </div>
                  <div>
                    <p className="m-0 text-[11px] text-slate-500">Total</p>
                    <p className="m-0 font-medium">{inr(b.total_amount)}</p>
                  </div>
                  <div>
                    <p className="m-0 text-[11px] text-slate-500">Advance paid</p>
                    <p className="m-0 font-medium text-green-700">{inr(b.advance_amount)}</p>
                  </div>
                </div>
                <div className="mt-2.5 flex gap-4 border-t border-slate-100 pt-2.5">
                  <Link href={`/tour/booking-success?ref=${b.booking_ref}`} className="text-[13px] font-semibold text-blue-700 no-underline hover:underline">
                    Booking details
                  </Link>
                  {b.tour_slug && (
                    <Link href={`/tour/${b.tour_slug}`} className="text-[13px] font-semibold text-blue-700 no-underline hover:underline">
                      Tour page
                    </Link>
                  )}
                </div>
              </section>
            ))}
          </div>

          {!mobile && (
            <p className="mt-3 text-center text-[13px] text-slate-500">
              Need help? <a href={`tel:${CALL_NUMBER}`} className="font-semibold text-red-600">Call us</a>.
            </p>
          )}
        </div>
      </main>
    </>
  );
}
