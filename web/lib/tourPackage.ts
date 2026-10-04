// Shared types + data helpers for the tour package pages.

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://webapi.taxisafar.com").replace(/\/+$/, "");
export const FALLBACK_IMG = "/images/tour-placeholder.jpg";
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919412222722"; // 91XXXXXXXXXX
export const CALL_NUMBER = process.env.NEXT_PUBLIC_CALL_NUMBER || "+919412222722";

/** Social profiles shown on the tour pages (same as the site footer). */
export const SOCIAL_LINKS = [
  { key: "facebook", label: "Facebook", icon: "fa-brands fa-facebook-f", href: process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://www.facebook.com/Taxisafar22", color: "#1877f2" },
  { key: "youtube", label: "YouTube", icon: "fa-brands fa-youtube", href: process.env.NEXT_PUBLIC_YOUTUBE_URL || "https://www.youtube.com/@taxisafar_com", color: "#ff0000" },
  { key: "instagram", label: "Instagram", icon: "fa-brands fa-instagram", href: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/taxisafar_/", color: "#e1306c" },
  { key: "whatsapp", label: "WhatsApp", icon: "fa-brands fa-whatsapp", href: `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}`, color: "#25d366" },
] as const;

/** Any uploaded-file URL is served from the API origin (fixes http://, old hosts). */
export const fixUploadUrl = (u?: string | null): string | null => {
  if (!u || typeof u !== "string") return null;
  const m = u.match(/^(?:https?:)?\/\/[^/]+(\/uploads\/.*)$/i);
  if (m) return `${API_URL}${m[1]}`;
  if (u.startsWith("/uploads/")) return `${API_URL}${u}`;
  return u;
};

export type Highlight = { icon?: string; title?: string; subtitle?: string };
export type ItineraryItem = { title?: string; description?: string };
export type ItineraryDay = {
  day?: number;
  title?: string;
  distance?: string;
  duration?: string;
  summary?: string;
  image?: string | null;
  items?: ItineraryItem[];
};
export type Place = { name?: string; icon?: string; image?: string | null };
export type Faq = { question?: string; answer?: string };
export type VehicleOption = {
  vehicle?: number | null;
  label: string;
  image?: string | null;
  seats?: string;
  suitcases?: string;
  ac?: boolean;
  price: number;
  sortOrder?: number;
  isActive?: boolean;
};
export type HotelOption = {
  hotel?: number | null;
  name: string;
  location?: string;
  images: string[];
  priceOverride: number | null;
  nights: number;
  sortOrder?: number;
  isActive?: boolean;
};
export type Seo = { title?: string; description?: string; keywords?: string; canonical?: string };
 
export type TourPackage = {
  id: number;
  title: string;
  slug: string;
  from_city_name: string;
  to_city_name: string;
  cover_image: string | null;
  gallery: string[];
  days: number;
  nights: number;
  duration_label: string | null;
  trip_type: "roundTrip" | "oneWay";
  short_description: string;
  description: string;
  highlights: Highlight[];
  hotel_optional: boolean;
  itinerary: ItineraryDay[];
  places_covered: Place[];
  inclusions: string[];
  exclusions: string[];
  important_notes: string[];
  faqs: Faq[];
  vehicle_options: VehicleOption[];
  hotel_options: HotelOption[];
  booking_charge_percent: number;
  rating: number;
  review_count: number;
  startingPrice: number;
  daily_booking_limit: number;
  min_advance_hours: number;
  status: "live" | "new" | "duplicate";
  seo: Seo;
};
 
/* ---------- normalizing (MariaDB may return JSON columns as strings) ---------- */
 
const parse = (v: unknown): unknown => {
  let x = v;
  for (let i = 0; i < 2 && typeof x === "string"; i++) {
    try {
      x = JSON.parse(x);
    } catch {
      return v;
    }
  }
  return x;
};
const arr = <T,>(v: unknown): T[] => {
  const x = parse(v);
  return Array.isArray(x) ? (x as T[]) : [];
};
const num = (v: unknown, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};
const bool = (v: unknown, d: boolean) =>
  v === undefined || v === null || v === "" ? d : v === true || v === 1 || v === "1" || v === "true";
 
export function normalizeTour(raw: any): TourPackage {
  const seo = parse(raw?.seo);
  return {
    id: num(raw?.id),
    title: raw?.title || "",
    slug: raw?.slug || "",
    from_city_name: raw?.from_city_name || "",
    to_city_name: raw?.to_city_name || "",
    cover_image: fixUploadUrl(raw?.cover_image),
    gallery: arr<string>(raw?.gallery).map((g) => fixUploadUrl(g)).filter(Boolean) as string[],
    days: num(raw?.days, 1),
    nights: num(raw?.nights, 0),
    duration_label: raw?.duration_label || null,
    trip_type: raw?.trip_type === "oneWay" ? "oneWay" : "roundTrip",
    short_description: raw?.short_description || "",
    description: raw?.description || "",
    highlights: arr<Highlight>(raw?.highlights),
    hotel_optional: bool(raw?.hotel_optional, true),
    itinerary: arr<ItineraryDay>(raw?.itinerary).map((d) => ({ ...d, image: fixUploadUrl(d?.image), items: arr<ItineraryItem>(d?.items) })),
    places_covered: arr<Place>(raw?.places_covered).map((p) => ({ ...p, image: fixUploadUrl(p?.image) })),
    inclusions: arr<string>(raw?.inclusions).filter(Boolean),
    exclusions: arr<string>(raw?.exclusions).filter(Boolean),
    important_notes: arr<string>(raw?.important_notes).filter(Boolean),
    faqs: arr<Faq>(raw?.faqs).filter((f) => f?.question),
    vehicle_options: arr<any>(raw?.vehicle_options).map((v) => ({
      ...v,
      image: fixUploadUrl(v?.image),
      label: v?.label || "Vehicle",
      price: num(v?.price),
      ac: v?.ac !== false,
      isActive: v?.isActive !== false,
      sortOrder: num(v?.sortOrder),
    })),
    hotel_options: arr<any>(raw?.hotel_options).map((h) => ({
      ...h,
      name: h?.name || "Hotel",
      images: arr<string>(h?.images).map((i) => fixUploadUrl(i)).filter(Boolean) as string[],
      priceOverride: h?.priceOverride === null || h?.priceOverride === undefined || h?.priceOverride === "" ? null : num(h.priceOverride),
      nights: Math.max(num(h?.nights, 1), 1),
      isActive: h?.isActive !== false,
      sortOrder: num(h?.sortOrder),
    })),
    booking_charge_percent: num(raw?.booking_charge_percent, 10),
    rating: num(raw?.rating, 0),
    review_count: num(raw?.review_count, 0),
    startingPrice: num(raw?.startingPrice, 0),
    daily_booking_limit: Math.max(num(raw?.daily_booking_limit, 0), 0),
    min_advance_hours: Math.max(num(raw?.min_advance_hours, 0), 0),
    status: raw?.status === "new" ? "new" : raw?.status === "duplicate" ? "duplicate" : "live",
    seo: seo && typeof seo === "object" && !Array.isArray(seo) ? (seo as Seo) : {},
  };
}
 
/* ---------- fetching ---------- */
 
export async function getTourBySlug(slug: string): Promise<TourPackage | null> {
  const opts = { next: { revalidate: 60 } } as RequestInit;
  try {
    // 1) dedicated slug endpoint (controller: getTourPackageBySlug)
    const res = await fetch(`${API_URL}/api/tour-package/slug/${encodeURIComponent(slug)}`, opts);
    if (res.ok) {
      const json = await res.json();
      if (json?.data) return normalizeTour(json.data);
    }
  } catch {
    /* fall through */
  }
  try {
    // 2) fallback: list search, exact slug match
    const res = await fetch(`${API_URL}/api/tour-package?is_active=1&all=1&search=${encodeURIComponent(slug)}`, opts);
    if (!res.ok) return null;
    const json = await res.json();
    const hit = (json?.data || []).find((t: any) => t?.slug === slug);
    return hit ? normalizeTour(hit) : null;
  } catch {
    return null;
  }
}
 
/* ---------- selection helpers (shared by book + summary) ---------- */
 
export type IndexedVehicle = VehicleOption & { idx: number };
export type IndexedHotel = HotelOption & { idx: number };
 
/**
 * Active vehicles in EXACTLY the order the admin arranged them (array order).
 * `idx` is the position in the original JSON array (stable id for URLs).
 * (sortOrder is no longer used for display: old records could hold stale numbers.)
 */
export const activeVehicles = (t: TourPackage): IndexedVehicle[] =>
  t.vehicle_options.map((v, idx) => ({ ...v, idx })).filter((v) => v.isActive !== false);
 
export const activeHotels = (t: TourPackage): IndexedHotel[] =>
  t.hotel_options.map((h, idx) => ({ ...h, idx })).filter((h) => h.isActive !== false);
 
/** Small subtitle shown under every vehicle name. */
export const SIMILAR_TAXI_TEXT = "Any other similar taxi";
 
export const startingPrice = (t: TourPackage) => {
  if (t.startingPrice > 0) return t.startingPrice;
  const p = activeVehicles(t).map((v) => v.price).filter((n) => n > 0);
  return p.length ? Math.min(...p) : 0;
};
 
export const hotelTotal = (h: HotelOption | null | undefined, rooms: number) =>
  h && h.priceOverride !== null ? h.priceOverride * Math.max(rooms, 1) * Math.max(h.nights, 1) : 0;
 
export type Selection = { v: number | null; h: number | "none" | null; r: number; d: string; a: number };
 
export const MAX_ROOMS = 5;
export const MAX_ADULTS = 20;
 
export function readSelection(sp: Record<string, string | string[] | undefined>): Selection {
  const one = (k: string) => (Array.isArray(sp[k]) ? (sp[k] as string[])[0] : (sp[k] as string | undefined));
  const vRaw = one("v");
  const hRaw = one("h");
  const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);
  return {
    v: vRaw !== undefined && /^\d+$/.test(vRaw) ? Number(vRaw) : null,
    h: hRaw === "none" ? "none" : hRaw !== undefined && /^\d+$/.test(hRaw) ? Number(hRaw) : null,
    r: clamp(Number(one("r")) || 1, 1, MAX_ROOMS),
    d: /^\d{4}-\d{2}-\d{2}$/.test(one("d") || "") ? (one("d") as string) : "",
    a: clamp(Number(one("a")) || 2, 1, MAX_ADULTS),
  };
}
 
export const selectionQuery = (s: Selection) => {
  const q = new URLSearchParams();
  if (s.v !== null) q.set("v", String(s.v));
  if (s.h !== null) q.set("h", String(s.h));
  q.set("r", String(s.r));
  q.set("a", String(s.a));
  if (s.d) q.set("d", s.d);
  return q.toString();
};
 
/* ---------- formatting ---------- */
 
export const inr = (n: number) => "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");
 
export const durationText = (t: TourPackage) =>
  t.duration_label ||
  `${t.days} Day${t.days === 1 ? "" : "s"} / ${t.nights} Night${t.nights === 1 ? "" : "s"} Tour`;
 
export const tripTypeText = (t: TourPackage) => (t.trip_type === "oneWay" ? "One Way" : "Round Trip");
 
export const prettyDate = (iso: string) => {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
};
 
/** Font Awesome class for the free-text icon names used in the admin (calendar, car, temple…). */
export const faIcon = (name?: string) => {
  const map: Record<string, string> = {
    calendar: "fa-regular fa-calendar",
    car: "fa-solid fa-car",
    cab: "fa-solid fa-taxi",
    taxi: "fa-solid fa-taxi",
    hotel: "fa-solid fa-hotel",
    temple: "fa-solid fa-place-of-worship",
    mandir: "fa-solid fa-place-of-worship",
    ghat: "fa-solid fa-water",
    river: "fa-solid fa-water",
    garden: "fa-solid fa-tree",
    tree: "fa-solid fa-tree",
    mountain: "fa-solid fa-mountain",
    food: "fa-solid fa-utensils",
    meal: "fa-solid fa-utensils",
    driver: "fa-solid fa-user-shield",
    shield: "fa-solid fa-shield-halved",
    camera: "fa-solid fa-camera",
    shopping: "fa-solid fa-bag-shopping",
    star: "fa-solid fa-star",
    map: "fa-solid fa-map-location-dot",
    clock: "fa-regular fa-clock",
    fort: "fa-brands fa-fort-awesome",
    museum: "fa-solid fa-building-columns",
  };
  const key = String(name || "").toLowerCase().trim();
  return map[key] || (key.startsWith("fa-") ? `fa-solid ${key}` : "fa-solid fa-location-dot");
};
 
/* ---------- booking: otp + payment + my-bookings ---------- */
 
export type TourBooking = {
  id: number;
  booking_ref: string;
  tour_package_id: number;
  tour_title: string | null;
  tour_slug: string | null;
  name: string;
  mobile: string;
  email: string | null;
  pickup_address: string | null;
  pickup_date: string | null;
  pickup_time: string | null;
  return_date: string | null;
  return_time: string | null;
  adults: number;
  rooms: number;
  vehicle_label: string | null;
  vehicle_price: number;
  hotel_name: string | null;
  hotel_nights: number | null;
  hotel_price: number;
  notes: string | null;
  total_amount: number;
  coupon_code?: string | null;
  discount_amount?: number;
  booking_charge_percent: number;
  advance_amount: number;
  balance_amount: number;
  payment_status: "pending" | "partial" | "paid" | "failed" | "refunded";
  booking_status: "pending" | "confirmed" | "cancelled" | "completed";
  created_at: string;
};
 
async function postJSON(path: string, body: unknown) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.status === false) {
    const err: any = new Error(json?.message || "Something went wrong");
    err.code = json?.code;
    throw err;
  }
  return json;
}
 
export const sendTourBookingOtp = (mobile: string) =>
  postJSON("/api/tour-booking/send-otp", { mobile });
 
export const verifyTourBookingOtp = (mobile: string, otp: string) =>
  postJSON("/api/tour-booking/verify-otp", { mobile, otp }) as Promise<{ status: true; data: { verify_token: string; name: string } }>;
 
export type CreateOrderPayload = {
  verify_token: string;
  tour_package_id: number;
  tour_title: string;
  tour_slug: string;
  name: string;
  mobile: string;
  email?: string;
  pickup_address: string;
  pickup_date: string;
  pickup_time: string;
  return_date?: string;
  return_time?: string;
  adults: number;
  rooms: number;
  vehicle_label?: string;
  vehicle_price: number;
  hotel_name?: string;
  hotel_nights?: number;
  hotel_price: number;
  notes?: string;
  total_amount: number;
  booking_charge_percent: number;
  advance_amount: number;
  coupon_code?: string;
};
 
export const createTourBookingOrder = (payload: CreateOrderPayload) =>
  postJSON("/api/tour-booking/create-order", payload) as Promise<{
    status: true;
    data: {
      booking_id: number;
      booking_ref: string;
      order: { id: string; amount: number; currency: string; key: string };
      discount_amount?: number;
      total_amount?: number;
      advance_amount?: number;
    };
  }>;
 
export const verifyTourBookingPayment = (data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => postJSON("/api/tour-booking/verify-payment", data) as Promise<{ status: true; data: { booking_id: number; booking_ref: string } }>;
 
export type TourAvailability = {
  limit: number;
  min_advance_hours: number;
  earliest_date: string;
  earliest_time: string;
  sold_out: string[];
};
 
export async function getTourAvailability(tourId: number, days = 120): Promise<TourAvailability | null> {
  try {
    const res = await fetch(`${API_URL}/api/tour-booking/availability?tour_package_id=${tourId}&days=${days}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}
 
export async function getTourBookingByRef(ref: string): Promise<TourBooking | null> {
  try {
    const res = await fetch(`${API_URL}/api/tour-booking/booking-ref/${encodeURIComponent(ref)}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}
 
export async function getMyTourBookings(mobile: string): Promise<TourBooking[]> {
  try {
    const res = await fetch(`${API_URL}/api/tour-booking/my?mobile=${encodeURIComponent(mobile)}`);
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : [];
  } catch {
    return [];
  }
}
 
/* ---------- coupons ---------- */
 
export type TourCouponOffer = {
  code: string;
  title: string | null;
  description: string | null;
  discount_type: "percent" | "flat";
  discount_value: number;
  max_discount: number | null;
  min_order_amount: number;
  end_date: string | null;
};
 
export type AppliedCoupon = {
  code: string;
  title: string | null;
  discount_amount: number;
};
 
export const couponOfferText = (c: TourCouponOffer) =>
  c.discount_type === "percent"
    ? `${c.discount_value}% off${c.max_discount ? ` up to ${inr(c.max_discount)}` : ""}`
    : `${inr(c.discount_value)} off`;
 
export async function getTourCoupons(tourId: number): Promise<TourCouponOffer[]> {
  try {
    const res = await fetch(`${API_URL}/api/tour-booking/coupons?tour_package_id=${tourId}`);
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : [];
  } catch {
    return [];
  }
}
 
export const validateTourCoupon = (payload: { code: string; tour_package_id: number; total_amount: number; mobile?: string }) =>
  postJSON("/api/tour-booking/coupon/validate", payload) as Promise<{
    status: true;
    data: { code: string; title: string | null; discount_amount: number; total_after_discount: number };
  }>;
 