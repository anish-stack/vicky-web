import { useEffect, useState } from "react";
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
  getTourAvailability,
  getTourBySlug,
  hotelTotal,
  inr,
  readSelection,
  SIMILAR_TAXI_TEXT,
  selectionQuery,
  sendTourBookingOtp,
  tripTypeText,
  verifyTourBookingOtp,
  verifyTourBookingPayment,
  TourAvailability,
} from "@/lib/tourPackage";
import TourDatePicker from "@/components/tour/TourDatePicker";
import PlacesInput from "@/components/tour/PlacesInput";

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

  if (!vehicleOk || !hotelOk) {
    return { redirect: { destination: `/tour/${tour.slug}/book?${selectionQuery(sel)}`, permanent: false } };
  }
  return { props: { tour, sel } };
};

/* ------------------------------------------------------------------ */
/* helpers                                                            */
/* ------------------------------------------------------------------ */

type Geo = { lat: number; lng: number; placeId: string } | null;

type Traveller = {
  pickup_address: string;
  pickup_landmark: string;
  pickup_geo: Geo;
  pickup_date: string;
  pickup_time: string;
  return_time: string;
  name: string;
  mobile: string;
  terms: boolean;
};

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (s: string, n: number) => {
  const d = new Date(`${s}T00:00:00`);
  d.setDate(d.getDate() + n);
  return iso(d);
};
const todayISO = () => iso(new Date());
const niceDate = (s: string) =>
  new Date(`${s}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const cleanMobile = (v: string) => v.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span className="mb-1 block text-[12.5px] font-semibold text-slate-700">
      {children} 
    </span>
  );
}

const inputCls = (err?: string) =>
  `h-10 w-full rounded-lg border bg-white px-3 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-100 ${
    err ? "border-red-500" : "border-slate-300 focus:border-red-500"
  }`;

const Err = ({ children }: { children?: string }) => (children ? <span className="mt-1 block text-[12px] text-red-600">{children}</span> : null);

const Box = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
  <section className={`rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 ${className}`}>{children}</section>
);

function Card({ title, icon, action, children, id }: { title: string; icon: string; action?: React.ReactNode; children: React.ReactNode; id?: string }) {
  return (
    <Box>
      {id && <div id={id} className="scroll-mt-28" />}
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <h2 className="m-0 flex items-center gap-2 text-[15px] font-bold text-slate-900 sm:text-[16px]">
          <i className={`${icon} text-[14px] text-red-600`} />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </Box>
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
  const tripDays = Math.max(Number(tour.days) || 1, 1);
  const storageKey = `tour-traveller:${tour.slug}`;

  const vehiclePrice = vehicle?.price || 0;
  const stayPrice = hotelTotal(hotel, sel.r);
  const total = vehiclePrice + stayPrice;
  const advance = Math.round((total * tour.booking_charge_percent) / 100);
  const balance = total - advance;
  const hotelOnRequest = !!hotel && hotel.priceOverride === null;

  const [form, setForm] = useState<Traveller>({
    pickup_address: "",
    pickup_landmark: "",
    pickup_geo: null,
    pickup_date: "",
    pickup_time: "08:00",
    return_time: "20:00",
    name: "",
    mobile: "",
    terms: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Traveller, string>>>({});
  const [minDate, setMinDate] = useState("");
  const [avail, setAvail] = useState<TourAvailability | null>(null);

  // round trip: return date auto = pickup + (days - 1)
  const returnDate = isRound && form.pickup_date ? addDays(form.pickup_date, tripDays - 1) : "";

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

  useEffect(() => {
    const today = todayISO();
    setMinDate(today);
    getTourAvailability(tour.id).then((a) => {
      if (!a) return;
      setAvail(a);
      if (a.earliest_date) setMinDate(a.earliest_date);
      setForm((f) => (f.pickup_date && (f.pickup_date < a.earliest_date || a.sold_out.includes(f.pickup_date)) ? { ...f, pickup_date: "" } : f));
    });
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || "null");
      if (saved && typeof saved === "object") {
        setForm((f) => ({
          ...f,
          pickup_address: saved.pickup_address || "",
          pickup_landmark: saved.pickup_landmark || "",
          pickup_geo: saved.pickup_geo && typeof saved.pickup_geo.lat === "number" ? saved.pickup_geo : null,
          pickup_date: typeof saved.pickup_date === "string" && saved.pickup_date >= today ? saved.pickup_date : "",
          pickup_time: saved.pickup_time || f.pickup_time,
          return_time: saved.return_time || f.return_time,
          name: saved.name || "",
          mobile: saved.mobile || "",
        }));
      }
    } catch {
      /* ignore */
    }
  }, [storageKey, tour.id]);

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
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e: Partial<Record<keyof Traveller, string>> = {};
    if (form.pickup_address.trim().length < 5) e.pickup_address = "Search and select your pickup location";
    if (!form.pickup_date) e.pickup_date = "Choose pickup date";
    else if (minDate && form.pickup_date < minDate) e.pickup_date = "Pickup date can't be in the past";
    else if (avail?.sold_out.includes(form.pickup_date)) e.pickup_date = "Sold Out for this date. Please choose another date.";
    if (!form.pickup_time) e.pickup_time = "Choose pickup time";
    else if (avail && avail.min_advance_hours > 0 && form.pickup_date === avail.earliest_date && form.pickup_time < avail.earliest_time)
      e.pickup_time = `Needs ${avail.min_advance_hours}h advance booking. Earliest pickup today is ${avail.earliest_time}.`;
    if (isRound) {
      if (!form.return_time) e.return_time = "Choose return time";
      else if (tripDays === 1 && form.return_time <= form.pickup_time) e.return_time = "Return time must be after pickup";
    }
    if (form.name.trim().length < 2) e.name = "Enter your full name";
    else if (!/^[\p{L} .'-]+$/u.test(form.name.trim())) e.name = "Use letters only";
    if (!/^[6-9]\d{9}$/.test(cleanMobile(form.mobile))) e.mobile = "Enter a valid 10-digit mobile number";
    if (!form.terms) e.terms = "Please accept the terms to continue";
    setErrors(e);
    return e;
  };

  const mobileClean = cleanMobile(form.mobile);

  const confirm = () => {
    const e = validate();
    const keys = Object.keys(e) as (keyof Traveller)[];
    if (keys.length) {
      const journey: (keyof Traveller)[] = ["pickup_address", "pickup_landmark", "pickup_date", "pickup_time", "return_time"];
      const target = keys.some((k) => journey.includes(k)) ? "sec-journey" : keys.some((k) => k !== "terms") ? "sec-traveller" : "sec-terms";
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
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
      const geo = form.pickup_geo
        ? { pickup_lat: form.pickup_geo.lat, pickup_lng: form.pickup_geo.lng, pickup_place_id: form.pickup_geo.placeId }
        : {};
      const fullAddress = [form.pickup_landmark.trim(), form.pickup_address.trim()].filter(Boolean).join(", ");

      const res = await createTourBookingOrder({
        verify_token: token,
        tour_package_id: tour.id,
        tour_title: tour.title,
        tour_slug: tour.slug,
        name: form.name.trim(),
        mobile: mobileClean,
        pickup_address: fullAddress,
        ...geo,
        pickup_date: form.pickup_date,
        pickup_time: form.pickup_time,
        return_date: isRound ? returnDate : undefined,
        return_time: isRound ? form.return_time : undefined,
        adults: sel.a,
        rooms: sel.r,
        vehicle_label: vehicle?.label,
        vehicle_price: vehiclePrice,
        hotel_name: hotel?.name,
        hotel_nights: hotel?.nights,
        hotel_price: hotelOnRequest ? 0 : stayPrice,
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
        prefill: { name: form.name.trim(), contact: mobileClean },
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
      if (err?.code === "SOLD_OUT") {
        setForm((f) => ({ ...f, pickup_date: "" }));
        getTourAvailability(tour.id).then((a) => a && setAvail(a));
      }
      setPayError(err?.message || "Couldn't start payment");
      setPaying(false);
    }
  };

  const nightsTxt = (n: number) => `${n} Night${n === 1 ? "" : "s"}`;

  return (
    <>
      <Head>
        <title>{`Booking summary · ${tour.title}`}</title>
        <meta name="robots" content="noindex" />
      </Head>

      <main className="mt-20 bg-slate-50 pb-8">
        <div className="mx-auto max-w-6xl px-3 py-3 sm:px-5 sm:py-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <Link href={bookHref} className="inline-flex items-center gap-1.5 text-[13px] text-slate-600 no-underline hover:text-red-600">
              <i className="fa-solid fa-arrow-left" /> Change selection
            </Link>
            <ol className="m-0 flex list-none items-center gap-1.5 p-0 text-[12px] font-semibold">
              <li className="flex items-center gap-1 text-green-700">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-green-600 text-white"><i className="fa-solid fa-check text-[10px]" /></span>Select
              </li>
              <li className="h-px w-5 bg-slate-300" aria-hidden />
              <li className="flex items-center gap-1 text-red-600">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-red-600 text-[11px] text-white">2</span>Details
              </li>
            </ol>
          </div>

          {payError && (
            <div className="mb-3 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-[13px] text-red-800">
              <i className="fa-solid fa-circle-exclamation mt-0.5 text-[16px]" />
              <div>
                <p className="m-0 font-semibold">{payError}</p>
                <p className="m-0">Need help? <a href={`tel:${CALL_NUMBER}`} className="font-semibold text-red-800">Call us</a>.</p>
              </div>
            </div>
          )}

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-4">
            {/* ================= left ================= */}
            <div className="min-w-0 space-y-3">
              {/* tour */}
              <Box className="flex items-center gap-3">
                <img src={tour.cover_image || FALLBACK_IMG} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover sm:h-16 sm:w-24" />
                <div className="min-w-0">
                  <h1 className="m-0 line-clamp-2 text-[15px] font-bold leading-snug text-slate-900 sm:text-[18px]">{tour.title}</h1>
                  <p className="m-0 mt-0.5 text-[12px] font-semibold text-slate-600">{durationText(tour)} | {tripTypeText(tour)}</p>
                </div>
              </Box>

              {/* vehicle */}
              {vehicle && (
                <Card
                  title="Selected Vehicle"
                  icon="fa-solid fa-car"
                  action={<Link href={bookHref} className="text-[12.5px] font-semibold text-blue-700 no-underline hover:underline">Change</Link>}
                >
                  <div className="flex items-center gap-3">
                    <img src={vehicle.image || FALLBACK_IMG} alt="" className="h-12 w-20 shrink-0 rounded-md bg-slate-50 object-contain sm:w-24" />
                    <div className="min-w-0 flex-1">
                      <p className="m-0 text-[15px] font-bold text-slate-900">{vehicle.label}</p>
                      <p className="m-0 text-[11px] leading-tight text-slate-500">{SIMILAR_TAXI_TEXT}</p>
                      <p className="m-0 flex flex-wrap gap-x-3 text-[12px] text-slate-600">
                        {vehicle.seats && <span>{vehicle.seats}</span>}
                        {vehicle.suitcases && <span>{vehicle.suitcases}</span>}
                        {vehicle.ac && <span>AC</span>}
                      </p>
                    </div>
                    <p className="m-0 shrink-0 text-right text-[15px] font-extrabold text-red-600">
                      {inr(vehiclePrice)}
                      <span className="block text-[10.5px] font-medium text-slate-500">All inclusive</span>
                    </p>
                  </div>
                </Card>
              )}

              {/* hotel */}
              {hotels.length > 0 && (
                <Card
                  title={`Selected Hotel${hotel ? ` (${nightsTxt(hotel.nights)})` : ""}`}
                  icon="fa-solid fa-hotel"
                  action={<Link href={bookHref} className="text-[12.5px] font-semibold text-blue-700 no-underline hover:underline">{hotel ? "Change" : "Add Hotel"}</Link>}
                >
                  {hotel ? (
                    <div className="flex items-center gap-3">
                      <img src={hotel.images[0] || FALLBACK_IMG} alt="" className="h-12 w-20 shrink-0 rounded-md object-cover sm:w-24" />
                      <div className="min-w-0 flex-1">
                        <p className="m-0 text-[14px] font-bold leading-snug text-slate-900 sm:text-[15px]">{hotel.name}</p>
                        <p className="m-0 text-[12px] text-slate-600">
                          {hotel.location ? `${hotel.location} · ` : ""}
                          {nightsTxt(hotel.nights)} · {sel.r} Room{sel.r === 1 ? "" : "s"} · {sel.a} Adult{sel.a === 1 ? "" : "s"}
                        </p>
                      </div>
                      <p className="m-0 shrink-0 text-[15px] font-extrabold text-red-600">{hotelOnRequest ? "On request" : inr(stayPrice)}</p>
                    </div>
                  ) : (
                    <p className="m-0 text-[13px] text-slate-600">No hotel required. You'll arrange your own stay.</p>
                  )}
                </Card>
              )}

              {/* journey */}
              <Card id="sec-journey" title="Journey Details" icon="fa-solid fa-route">
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px]">
                    <div className="min-w-0">
                      <Label required>Pickup location</Label>
                      <PlacesInput
                        value={form.pickup_address}
                        onChange={(v) => {
                          setForm((f) => ({ ...f, pickup_address: v, pickup_geo: null }));
                          setErrors((e) => ({ ...e, pickup_address: undefined }));
                        }}
                        onPick={(p) => setForm((f) => ({ ...f, pickup_address: p.address, pickup_geo: { lat: p.lat, lng: p.lng, placeId: p.placeId } }))}
                        placeholder={`Search area / landmark in ${tour.from_city_name}`}
                        className={inputCls(errors.pickup_address)}
                      />
                      <Err>{errors.pickup_address}</Err>
                    </div>
                    <label className="block">
                      <Label>Flat / House no.</Label>
                      <input value={form.pickup_landmark} onChange={(e) => set("pickup_landmark", e.target.value)} placeholder="e.g. B-12, 2nd floor" className={inputCls()} />
                    </label>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label required>Pickup date &amp; time</Label>
                      <div className="grid grid-cols-[1fr_110px] gap-2">
                        <TourDatePicker
                          value={form.pickup_date}
                          min={minDate}
                          soldOut={avail?.sold_out || []}
                          invalid={!!errors.pickup_date}
                          onChange={(d) => set("pickup_date", d)}
                        />
                        <input type="time" value={form.pickup_time} onChange={(e) => set("pickup_time", e.target.value)} className={inputCls(errors.pickup_time)} aria-label="Pickup time" />
                      </div>
                      <Err>{errors.pickup_date || errors.pickup_time}</Err>
                      {avail && avail.min_advance_hours > 0 && !errors.pickup_date && !errors.pickup_time && (
                        <span className="mt-1 block text-[11.5px] text-slate-500">Book at least {avail.min_advance_hours} hour{avail.min_advance_hours === 1 ? "" : "s"} before pickup.</span>
                      )}
                      {avail && avail.sold_out.length > 0 && !errors.pickup_date && (
                        <span className="mt-1 block text-[11.5px] text-red-600">Dates marked Sold Out are full.</span>
                      )}
                    </div>

                    {isRound && (
                      <div>
                        <Label required>Return date &amp; time</Label>
                        <div className="grid grid-cols-[1fr_110px] gap-2">
                          <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-[13.5px] text-slate-700" aria-label="Return date">
                            <i className="fa-solid fa-lock text-[11px] text-slate-400" />
                            <span className="truncate">{returnDate ? niceDate(returnDate) : "Select pickup date"}</span>
                          </div>
                          <input type="time" value={form.return_time} onChange={(e) => set("return_time", e.target.value)} className={inputCls(errors.return_time)} aria-label="Return time" />
                        </div>
                        {errors.return_time ? (
                          <Err>{errors.return_time}</Err>
                        ) : (
                          <span className="mt-1 block text-[11.5px] text-slate-500">Auto set as per {durationText(tour)}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* traveller */}
              <Card id="sec-traveller" title="Traveller Details" icon="fa-solid fa-user">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <Label required>Full name</Label>
                    <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Enter your full name" autoComplete="name" className={inputCls(errors.name)} />
                    <Err>{errors.name}</Err>
                  </label>
                  <label className="block">
                    <Label required>Mobile number</Label>
                    <div className="flex">
                      <span className="grid h-10 place-items-center rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 px-2.5 text-[14px] text-slate-600">+91</span>
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
                </div>
              </Card>
            </div>

            {/* ================= right: price ================= */}
            <aside>
              <div className="lg:sticky lg:top-24">
                <Box>
                  <h2 className="m-0 mb-2 flex items-center gap-2 text-[15px] font-bold text-slate-900 sm:text-[16px]">
                    <i className="fa-solid fa-receipt text-[14px] text-red-600" /> Price Summary
                  </h2>
                  <dl className="m-0 divide-y divide-slate-100 text-[13.5px]">
                    {vehicle && (
                      <div className="flex justify-between gap-3 py-1.5">
                        <dt className="text-slate-600">Cab ({vehicle.label})</dt>
                        <dd className="m-0 font-medium text-slate-900">{inr(vehiclePrice)}</dd>
                      </div>
                    )}
                    {hotel && (
                      <div className="flex justify-between gap-3 py-1.5">
                        <dt className="text-slate-600">
                          Hotel ({sel.r} room{sel.r === 1 ? "" : "s"} × {hotel.nights} night{hotel.nights === 1 ? "" : "s"})
                        </dt>
                        <dd className="m-0 font-medium text-slate-900">{hotelOnRequest ? "On request" : inr(stayPrice)}</dd>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-3 py-2">
                      <dt className="font-bold text-slate-900">Total Amount</dt>
                      <dd className="m-0 text-[16px] font-bold text-slate-900">{inr(total)}</dd>
                    </div>
                  </dl>

                  <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2.5">
                    <p className="m-0 text-[13px] font-semibold text-green-800">
                      Cab Booking Advance Payment ({tour.booking_charge_percent}%)
                    </p>
                    <p className="m-0 mt-0.5 text-[28px] font-extrabold leading-tight text-green-700">{inr(advance)}</p>
                  </div>
                  <p className="m-0 mt-1.5 text-[11.5px] text-slate-500">Remaining {inr(balance)} is paid to the driver during the trip.</p>
                  {hotelOnRequest && (
                    <p className="m-0 mt-1.5 rounded-md bg-amber-50 px-2.5 py-1.5 text-[11.5px] text-amber-800">Hotel price will be confirmed by our team and added to your total.</p>
                  )}

                  <div id="sec-terms" className="scroll-mt-28" />
                  <label className="mt-3 flex cursor-pointer items-start gap-2 text-[12.5px] text-slate-700">
                    <input type="checkbox" checked={form.terms} onChange={(e) => set("terms", e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-red-600" />
                    <span>
                      I agree to the{" "}
                      <Link href={TERMS_PATH} target="_blank" className="font-semibold text-blue-700">Terms and Conditions</Link>{" "}
                      and cancellation policy.
                    </span>
                  </label>
                  <Err>{errors.terms}</Err>

                  <button type="button" onClick={confirm} disabled={paying} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-[16px] font-bold text-white hover:bg-red-700 disabled:opacity-60">
                    {paying ? <i className="fa-solid fa-circle-notch fa-spin" /> : <i className="fa-solid fa-lock text-[14px]" />}
                    {paying ? "Processing…" : `Pay ${inr(advance)} & Confirm`}
                  </button>
                  <a href={`tel:${CALL_NUMBER}`} className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-[13.5px] font-semibold text-slate-800 no-underline hover:border-slate-400">
                    <i className="fa-solid fa-phone" /> Call to Book
                  </a>
                </Box>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {otpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-4 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
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
              onKeyDown={(e) => e.key === "Enter" && verifyOtp()}
              placeholder="Enter OTP"
              autoFocus
              className="h-11 w-full rounded-lg border border-slate-300 px-3 text-center text-[20px] tracking-[6px] text-slate-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
            {otpError && <p className="m-0 mt-2 text-[12px] text-red-600">{otpError}</p>}
            <button
              type="button"
              onClick={verifyOtp}
              disabled={otpVerifying || otpSending}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-[15px] font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {otpVerifying && <i className="fa-solid fa-circle-notch fa-spin" />}
              {otpVerifying ? "Verifying…" : "Verify & Pay"}
            </button>
            <button type="button" onClick={() => sendOtp(otpMobile)} disabled={otpSending} className="mt-2 w-full text-center text-[13px] font-semibold text-blue-700 disabled:opacity-60">
              {otpSending ? "Sending…" : "Resend OTP"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}