import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import {
  CALL_NUMBER,
  FALLBACK_IMG,
  Selection,
  TourPackage,
  activeHotels,
  activeVehicles,
  createTourBookingOrder,
  durationText,
  getTourBySlug,
  hotelTotal,
  inr,
  prettyDate,
  readSelection,
  selectionQuery,
  sendTourBookingOtp,
  tripTypeText,
  verifyTourBookingOtp,
  verifyTourBookingPayment,
} from "@/lib/tourPackage";
import { Panel } from "@/components/tour/TourBits";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const TERMS_PATH = "/terms-of-use";

type Props = { tour: TourPackage; sel: Selection };

export const getServerSideProps: GetServerSideProps<Props> = async ({ params, query }) => {
  const tour = await getTourBySlug(String(params?.slug || ""));
  if (!tour) return { notFound: true };

  const sel = readSelection(query);
  const vehicles = activeVehicles(tour);
  const hotels = activeHotels(tour);
  const vehicleOk = vehicles.length === 0 || vehicles.some((v) => v.idx === sel.v);
  const hotelOk =
    hotels.length === 0 ||
    (typeof sel.h === "number" && hotels.some((h) => h.idx === sel.h)) ||
    (sel.h === "none" && tour.hotel_optional);

  // incomplete / tampered selection -> back to the selection step
  if (!vehicleOk || !hotelOk || !sel.d) {
    return { redirect: { destination: `/tour/${tour.slug}/book?${selectionQuery(sel)}`, permanent: false } };
  }
  return { props: { tour, sel } };
};

/* ------------------------------------------------------------------ */
/* helpers                                                            */
/* ------------------------------------------------------------------ */

type Traveller = {
  pickup_address: string;
  pickup_date: string;
  pickup_time: string;
  return_date: string;
  return_time: string;
  name: string;
  mobile: string;
  email: string;
  notes: string;
  terms: boolean;
};

const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const time12 = (t: string) => {
  if (!/^\d{2}:\d{2}$/.test(t)) return t;
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
const cleanMobile = (v: string) => v.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">
      {children} {required && <span className="text-red-600">*</span>}
    </span>
  );
}

const inputCls = (err?: string) =>
  `h-11 w-full rounded-lg border bg-white px-3 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-100 ${
    err ? "border-red-500" : "border-slate-300 focus:border-red-500"
  }`;

const Err = ({ children }: { children?: string }) => (children ? <span className="mt-1 block text-[12px] text-red-600">{children}</span> : null);

function Card({ title, icon, action, children, id }: { title: string; icon: string; action?: React.ReactNode; children: React.ReactNode; id?: string }) {
  return (
    <Panel>
      <div id={id} className="scroll-mt-28" />
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="m-0 flex items-center gap-2 text-[16px] font-bold text-slate-900 sm:text-[18px]">
          <i className={`${icon} text-[15px] text-red-600`} />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* page                                                               */
/* ------------------------------------------------------------------ */

export default function TourSummaryPage({ tour, sel }: Props) {
  const router = useRouter();
  const vehicles = activeVehicles(tour);
  const hotels = activeHotels(tour);
  const vehicle = vehicles.find((v) => v.idx === sel.v) || null;
  const hotel = typeof sel.h === "number" ? hotels.find((h) => h.idx === sel.h) || null : null;
  const bookHref = `/tour/${tour.slug}/book?${selectionQuery(sel)}`;
  const isRound = tour.trip_type === "roundTrip";
  const storageKey = `tour-traveller:${tour.slug}`;

  const vehiclePrice = vehicle?.price || 0;
  const stayPrice = hotelTotal(hotel, sel.r);
  const total = vehiclePrice + stayPrice;
  const advance = Math.round((total * tour.booking_charge_percent) / 100);
  const balance = total - advance;
  const hotelOnRequest = !!hotel && hotel.priceOverride === null;

  const [form, setForm] = useState<Traveller>(() => ({
    pickup_address: "",
    pickup_date: sel.d,
    pickup_time: "08:00",
    return_date: isRound ? addDays(sel.d, Math.max(tour.days - 1, 0)) : "",
    return_time: "20:00",
    name: "",
    mobile: "",
    email: "",
    notes: "",
    terms: false,
  }));
  const [errors, setErrors] = useState<Partial<Record<keyof Traveller, string>>>({});
  const [minDate, setMinDate] = useState("");

  // ---------------- OTP + payment state ----------------
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpMobile, setOtpMobile] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [verifyToken, setVerifyToken] = useState("");
  const [verifiedMobile, setVerifiedMobile] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  // restore details typed earlier for this tour (not the terms tick)
  useEffect(() => {
    setMinDate(todayISO());
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || "null");
      if (saved && typeof saved === "object") {
        setForm((f) => ({
          ...f,
          pickup_address: saved.pickup_address || "",
          pickup_time: saved.pickup_time || f.pickup_time,
          return_time: saved.return_time || f.return_time,
          name: saved.name || "",
          mobile: saved.mobile || "",
          email: saved.email || "",
          notes: saved.notes || "",
        }));
      }
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  useEffect(() => {
    const rest: Partial<Traveller> = { ...form };
    delete rest.terms;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(rest));
    } catch {
      /* ignore */
    }
  }, [form, storageKey]);

  const set = <K extends keyof Traveller>(k: K, v: Traveller[K]) => {
    setForm((f) => {
      const next = { ...f, [k]: v };
      // keep return date in step when pickup date moves
      if (k === "pickup_date" && isRound && typeof v === "string" && v) {
        next.return_date = addDays(v, Math.max(tour.days - 1, 0));
      }
      return next;
    });
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e: Partial<Record<keyof Traveller, string>> = {};
    if (form.pickup_address.trim().length < 5) e.pickup_address = "Enter your full pickup address";
    if (!form.pickup_date) e.pickup_date = "Choose pickup date";
    else if (minDate && form.pickup_date < minDate) e.pickup_date = "Pickup date can't be in the past";
    if (!form.pickup_time) e.pickup_time = "Choose pickup time";
    if (isRound) {
      if (!form.return_date) e.return_date = "Choose return date";
      else if (form.return_date < form.pickup_date) e.return_date = "Return can't be before pickup";
      else if (form.return_date === form.pickup_date && form.return_time <= form.pickup_time) e.return_time = "Return time must be after pickup";
      if (!form.return_time) e.return_time = "Choose return time";
    }
    if (form.name.trim().length < 2) e.name = "Enter your full name";
    else if (!/^[\p{L} .'-]+$/u.test(form.name.trim())) e.name = "Use letters only";
    if (!/^[6-9]\d{9}$/.test(cleanMobile(form.mobile))) e.mobile = "Enter a valid 10-digit mobile number";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e.email = "Enter a valid email or leave it empty";
    if (!form.terms) e.terms = "Please accept the terms to continue";
    setErrors(e);
    return e;
  };

  const mobileClean = cleanMobile(form.mobile);

  const confirm = () => {
    const e = validate();
    const keys = Object.keys(e) as (keyof Traveller)[];
    if (keys.length) {
      const journey = ["pickup_address", "pickup_date", "pickup_time", "return_date", "return_time"];
      const target = keys.some((k) => journey.includes(k)) ? "sec-journey" : keys.some((k) => k !== "terms") ? "sec-traveller" : "sec-terms";
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    // already OTP-verified for this exact mobile -> go straight to payment
    if (verifyToken && verifiedMobile === mobileClean) {
      startPayment(verifyToken);
      return;
    }

    setOtpError("");
    setOtpCode("");
    setOtpMobile(mobileClean);
    setOtpOpen(true);
    sendOtp(mobileClean);
  };

  const sendOtp = async (mobile: string) => {
    setOtpSending(true);
    setOtpError("");
    try {
      await sendTourBookingOtp(mobile);
    } catch (err: any) {
      setOtpError(err?.message || "Failed to send OTP");
    } finally {
      setOtpSending(false);
    }
  };

  const verifyOtp = async () => {
    if (!/^\d{4}$/.test(otpCode)) {
      setOtpError("Enter the 4-digit OTP");
      return;
    }
    setOtpVerifying(true);
    setOtpError("");
    try {
      const res = await verifyTourBookingOtp(otpMobile, otpCode);
      const token = res.data.verify_token;
      setVerifyToken(token);
      setVerifiedMobile(otpMobile);
      setOtpOpen(false);
      try {
        localStorage.setItem("tour-booking-mobile", otpMobile);
      } catch {
        /* ignore */
      }
      startPayment(token);
    } catch (err: any) {
      setOtpError(err?.message || "Invalid OTP");
    } finally {
      setOtpVerifying(false);
    }
  };

  const startPayment = async (token: string) => {
    setPaying(true);
    setPayError("");
    try {
      const res = await createTourBookingOrder({
        verify_token: token,
        tour_package_id: tour.id,
        tour_title: tour.title,
        tour_slug: tour.slug,
        name: form.name.trim(),
        mobile: mobileClean,
        email: form.email.trim() || undefined,
        pickup_address: form.pickup_address.trim(),
        pickup_date: form.pickup_date,
        pickup_time: form.pickup_time,
        return_date: isRound ? form.return_date : undefined,
        return_time: isRound ? form.return_time : undefined,
        adults: sel.a,
        rooms: sel.r,
        vehicle_label: vehicle?.label,
        vehicle_price: vehiclePrice,
        hotel_name: hotel?.name,
        hotel_nights: hotel?.nights,
        hotel_price: hotelOnRequest ? 0 : stayPrice,
        notes: form.notes.trim() || undefined,
        total_amount: total,
        booking_charge_percent: tour.booking_charge_percent,
        advance_amount: advance,
      });

      const { order, booking_ref } = res.data;
      if (!window.Razorpay) throw new Error("Payment SDK not loaded, please refresh and try again");

      const rzp = new window.Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "TaxiSafar Tours",
        description: tour.title,
        prefill: { name: form.name.trim(), contact: mobileClean, email: form.email.trim() || undefined },
        theme: { color: "#dc2626" },
        handler: async (response: any) => {
          try {
            await verifyTourBookingPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            try {
              sessionStorage.removeItem(storageKey);
            } catch {
              /* ignore */
            }
            router.push(`/tour/booking-success?ref=${booking_ref}`);
          } catch (err: any) {
            setPayError(err?.message || "Payment verification failed. Contact support with your payment ID.");
          } finally {
            setPaying(false);
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      });
      rzp.open();
    } catch (err: any) {
      setPayError(err?.message || "Couldn't start payment");
      setPaying(false);
    }
  };

  return (
    <>
      <Head>
        <title>{`Booking summary · ${tour.title}`}</title>
        <meta name="robots" content="noindex" />
      </Head>

      <main className="mt-20 bg-slate-50 pb-32">
        <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6">
          <Link href={bookHref} className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-slate-600 no-underline hover:text-red-600">
            <i className="fa-solid fa-arrow-left" /> Change selection
          </Link>

          <ol className="m-0 mb-4 flex list-none items-center gap-2 p-0 text-[12px] font-semibold sm:text-[13px]">
            <li className="flex items-center gap-1.5 text-green-700">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-green-600 text-white"><i className="fa-solid fa-check text-[11px]" /></span>Select
            </li>
            <li className="h-px w-8 bg-slate-300" aria-hidden />
            <li className="flex items-center gap-1.5 text-red-600">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-red-600 text-white">2</span>Details &amp; Summary
            </li>
          </ol>

          {payError && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-[14px] text-red-800">
              <i className="fa-solid fa-circle-exclamation mt-0.5 text-[18px]" />
              <div>
                <p className="m-0 font-semibold">{payError}</p>
                <p className="m-0 mt-0.5">Need help? <a href={`tel:${CALL_NUMBER}`} className="font-semibold text-red-800">Call us</a>.</p>
              </div>
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
            {/* ================= left ================= */}
            <div className="min-w-0 space-y-4">
              {/* tour */}
              <Panel className="flex items-center gap-3 sm:gap-4">
                <img src={tour.cover_image || FALLBACK_IMG} alt="" className="h-16 w-20 shrink-0 rounded-lg object-cover sm:h-20 sm:w-28" />
                <div className="min-w-0">
                  <h1 className="m-0 line-clamp-2 text-[16px] font-bold leading-snug text-slate-900 sm:text-[20px]">{tour.title}</h1>
                  <p className="m-0 mt-1 text-[12px] font-semibold text-slate-600 sm:text-[13px]">{durationText(tour)} | {tripTypeText(tour)}</p>
                </div>
              </Panel>

              {/* vehicle */}
              {vehicle && (
                <Card
                  title="Selected Vehicle"
                  icon="fa-solid fa-car"
                  action={<Link href={bookHref} className="text-[13px] font-semibold text-blue-700 no-underline hover:underline">Change Vehicle</Link>}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <img src={vehicle.image || FALLBACK_IMG} alt="" className="h-14 w-20 shrink-0 rounded-md bg-slate-50 object-contain sm:h-16 sm:w-28" />
                    <div className="min-w-0 flex-1">
                      <p className="m-0 text-[16px] font-bold text-slate-900">{vehicle.label}</p>
                      <p className="m-0 mt-0.5 flex flex-wrap gap-x-3 text-[12px] text-slate-600 sm:text-[13px]">
                        {vehicle.seats && <span>{vehicle.seats}</span>}
                        {vehicle.suitcases && <span>{vehicle.suitcases}</span>}
                        {vehicle.ac && <span>AC</span>}
                      </p>
                      <p className="m-0 mt-1 text-[16px] font-extrabold text-red-600">{inr(vehiclePrice)} <span className="text-[11px] font-medium text-slate-500">All including</span></p>
                    </div>
                  </div>
                </Card>
              )}

              {/* hotel */}
              {hotels.length > 0 && (
                <Card
                  title={`Selected Hotel${hotel ? ` (${hotel.nights} Night${hotel.nights === 1 ? "" : "s"})` : ""}`}
                  icon="fa-solid fa-hotel"
                  action={<Link href={bookHref} className="text-[13px] font-semibold text-blue-700 no-underline hover:underline">{hotel ? "Change Hotel" : "Add Hotel"}</Link>}
                >
                  {hotel ? (
                    <div className="flex items-start gap-3 sm:gap-4">
                      <img src={hotel.images[0] || FALLBACK_IMG} alt="" className="h-16 w-20 shrink-0 rounded-md object-cover sm:h-20 sm:w-28" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="m-0 text-[15px] font-bold leading-snug text-slate-900 sm:text-[16px]">{hotel.name}</p>
                          <p className="m-0 shrink-0 text-[15px] font-extrabold text-red-600">{hotelOnRequest ? "On request" : inr(stayPrice)}</p>
                        </div>
                        {hotel.location && <p className="m-0 mt-0.5 text-[12px] text-slate-600 sm:text-[13px]">{hotel.location}</p>}
                        <p className="m-0 mt-1 text-[12px] text-slate-600 sm:text-[13px]">
                          {hotel.nights} Night{hotel.nights === 1 ? "" : "s"} | {sel.r} Room{sel.r === 1 ? "" : "s"} | {sel.a} Adult{sel.a === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="m-0 text-[14px] text-slate-600">No hotel required. You'll arrange your own stay.</p>
                  )}
                </Card>
              )}

              {/* journey */}
              <Card id="sec-journey" title="Journey Details" icon="fa-solid fa-route">
                <div className="space-y-4">
                  <label className="block">
                    <Label required>Pickup location</Label>
                    <div className="relative">
                      <i className="fa-solid fa-location-dot pointer-events-none absolute left-3 top-3.5 text-[14px] text-red-600" />
                      <textarea
                        rows={2}
                        value={form.pickup_address}
                        onChange={(e) => set("pickup_address", e.target.value)}
                        placeholder={`House / street / landmark, ${tour.from_city_name}`}
                        className={`${inputCls(errors.pickup_address)} h-auto min-h-[64px] resize-y py-2.5 pl-9`}
                      />
                    </div>
                    <Err>{errors.pickup_address}</Err>
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label required>Pickup date &amp; time</Label>
                      <div className="grid grid-cols-[1fr_120px] gap-2">
                        <input type="date" min={minDate || undefined} value={form.pickup_date} onChange={(e) => set("pickup_date", e.target.value)} className={inputCls(errors.pickup_date)} aria-label="Pickup date" />
                        <input type="time" value={form.pickup_time} onChange={(e) => set("pickup_time", e.target.value)} className={inputCls(errors.pickup_time)} aria-label="Pickup time" />
                      </div>
                      <Err>{errors.pickup_date || errors.pickup_time}</Err>
                    </div>
                    {isRound && (
                      <div>
                        <Label required>Return date &amp; time</Label>
                        <div className="grid grid-cols-[1fr_120px] gap-2">
                          <input type="date" min={form.pickup_date || minDate || undefined} value={form.return_date} onChange={(e) => set("return_date", e.target.value)} className={inputCls(errors.return_date)} aria-label="Return date" />
                          <input type="time" value={form.return_time} onChange={(e) => set("return_time", e.target.value)} className={inputCls(errors.return_time)} aria-label="Return time" />
                        </div>
                        <Err>{errors.return_date || errors.return_time}</Err>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* traveller */}
              <Card id="sec-traveller" title="Traveller Details" icon="fa-solid fa-user">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <Label required>Full name</Label>
                    <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Enter your full name" autoComplete="name" className={inputCls(errors.name)} />
                    <Err>{errors.name}</Err>
                  </label>
                  <label className="block">
                    <Label required>Mobile number</Label>
                    <div className="flex">
                      <span className="grid h-11 place-items-center rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 px-3 text-[14px] text-slate-600">+91</span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={14}
                        value={form.mobile}
                        onChange={(e) => set("mobile", e.target.value.replace(/[^\d+ ]/g, ""))}
                        placeholder="Enter mobile number"
                        autoComplete="tel-national"
                        className={`${inputCls(errors.mobile)} rounded-l-none`}
                      />
                    </div>
                    <Err>{errors.mobile}</Err>
                  </label>
                  <label className="block">
                    <Label>Email address (optional)</Label>
                    <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="Enter email address" autoComplete="email" className={inputCls(errors.email)} />
                    <Err>{errors.email}</Err>
                  </label>
                  <label className="block sm:col-span-2">
                    <Label>Special requests (optional)</Label>
                    <textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Senior citizens, child seat, extra luggage…" className={`${inputCls()} h-auto min-h-[64px] resize-y py-2.5`} />
                  </label>
                </div>
              </Card>
            </div>

            {/* ================= right: price ================= */}
            <aside>
              <div className="space-y-4 lg:sticky lg:top-24">
                <Panel>
                  <h2 className="mb-3 mt-0 flex items-center gap-2 text-[16px] font-bold text-slate-900 sm:text-[18px]">
                    <i className="fa-solid fa-receipt text-[15px] text-red-600" /> Price Summary
                  </h2>
                  <dl className="m-0 divide-y divide-slate-100 text-[14px]">
                    {vehicle && (
                      <div className="flex justify-between gap-3 py-2">
                        <dt className="text-slate-600">Cab charge ({vehicle.label})</dt>
                        <dd className="m-0 font-medium text-slate-900">{inr(vehiclePrice)}</dd>
                      </div>
                    )}
                    {hotel && (
                      <div className="flex justify-between gap-3 py-2">
                        <dt className="text-slate-600">
                          Hotel charge ({sel.r} room{sel.r === 1 ? "" : "s"} × {hotel.nights} night{hotel.nights === 1 ? "" : "s"})
                        </dt>
                        <dd className="m-0 font-medium text-slate-900">{hotelOnRequest ? "On request" : inr(stayPrice)}</dd>
                      </div>
                    )}
                    <div className="flex justify-between gap-3 py-2.5">
                      <dt className="font-bold text-slate-900">Total payable amount</dt>
                      <dd className="m-0 text-[18px] font-extrabold text-red-600">{inr(total)}</dd>
                    </div>
                  </dl>

                  <div className="mt-2 flex items-center justify-between gap-3 rounded-lg bg-green-50 px-3 py-2.5 text-green-800">
                    <span className="flex items-center gap-2 text-[13px] font-semibold">
                      <i className="fa-solid fa-circle-info" /> Cab booking charge ({tour.booking_charge_percent}%)
                    </span>
                    <span className="text-[17px] font-extrabold">{inr(advance)}</span>
                  </div>
                  <p className="mb-0 mt-2 text-[12px] text-slate-500">Remaining {inr(balance)} is paid to the driver during the trip.</p>
                  {hotelOnRequest && (
                    <p className="mb-0 mt-2 rounded-md bg-amber-50 px-3 py-2 text-[12px] text-amber-800">Hotel price will be confirmed by our team and added to your total.</p>
                  )}

                  <div id="sec-terms" className="scroll-mt-28" />
                  <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-[13px] text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.terms}
                      onChange={(e) => set("terms", e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-red-600"
                    />
                    <span>
                      I agree to the{" "}
                      <Link href={TERMS_PATH} target="_blank" className="font-semibold text-blue-700">Terms and Conditions</Link>{" "}
                      and cancellation policy.
                    </span>
                  </label>
                  <Err>{errors.terms}</Err>

                  <button type="button" onClick={confirm} disabled={paying} className="mt-4 hidden w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-[15px] font-semibold text-white hover:bg-red-700 disabled:opacity-60 lg:flex">
                    {paying ? <i className="fa-solid fa-circle-notch fa-spin text-[16px]" /> : <i className="fa-solid fa-lock text-[15px]" />}
                    {paying ? "Processing…" : `Pay ${inr(advance)} & Confirm`}
                  </button>
                  <a href={`tel:${CALL_NUMBER}`} className="mt-2 hidden items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-[14px] font-semibold text-slate-800 no-underline hover:border-slate-400 lg:flex">
                    <i className="fa-solid fa-phone" /> Call to Book
                  </a>
                </Panel>
              </div>
            </aside>
          </div>
        </div>

        {/* mobile / tablet bottom bar */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
            <div className="min-w-0 flex-1">
              <p className="m-0 text-[11px] font-medium text-slate-500">Pay now {inr(advance)}</p>
              <p className="m-0 text-[20px] font-extrabold leading-tight text-red-600">{inr(total)}</p>
            </div>
            <a href={`tel:${CALL_NUMBER}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-slate-300 text-slate-800 no-underline" aria-label="Call to book">
              <i className="fa-solid fa-phone" />
            </a>
            <button type="button" onClick={confirm} disabled={paying} className="flex shrink-0 items-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-[14px] font-semibold text-white hover:bg-red-700 disabled:opacity-60 sm:text-[15px]">
              {paying ? <i className="fa-solid fa-circle-notch fa-spin text-[16px]" /> : <i className="fa-solid fa-lock text-[15px]" />}
              {paying ? "Processing…" : "Pay & Confirm"}
            </button>
          </div>
        </div>
      </main>

      {otpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="m-0 text-[16px] font-bold text-slate-900">Verify mobile number</h3>
              <button type="button" onClick={() => { setOtpOpen(false); setPaying(false); }} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <p className="m-0 mb-3 text-[13px] text-slate-600">
              We've sent a 4-digit OTP to <span className="font-semibold text-slate-900">+91 {otpMobile}</span>.
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter OTP"
              autoFocus
              className="h-12 w-full rounded-lg border border-slate-300 px-3 text-center text-[20px] tracking-[6px] text-slate-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
            {otpError && <p className="mb-0 mt-2 text-[12px] text-red-600">{otpError}</p>}
            <button
              type="button"
              onClick={verifyOtp}
              disabled={otpVerifying || otpSending}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-[15px] font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {otpVerifying ? <i className="fa-solid fa-circle-notch fa-spin" /> : null}
              {otpVerifying ? "Verifying…" : "Verify & Pay"}
            </button>
            <button
              type="button"
              onClick={() => sendOtp(otpMobile)}
              disabled={otpSending}
              className="mt-2 w-full text-center text-[13px] font-semibold text-blue-700 disabled:opacity-60"
            >
              {otpSending ? "Sending…" : "Resend OTP"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}