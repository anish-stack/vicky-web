import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/ui/Seo";
import Skeleton from "@/components/ui/Skeleton";
import PriceSummary from "@/components/packages/PriceSummary";
import { fetchServer, request } from "@/lib/api";
import { mediaUrl, minPickup, toLocalInput } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { startRazorpay } from "@/lib/payment";

export default function BookPackagePage({ pkg, bootstrap }: any) {
  const router = useRouter();
  const { user, openLogin } = useAuth();
  const { vehicle: vehicleOptionId, hotel: hotelOptionId, rooms: roomsParam } = router.query;

  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    mobileNumber: "",
    email: "",
    pickupLocation: pkg?.fromCityName || "",
    pickupAddress: "",
    pickupDate: toLocalInput(minPickup()),
    returnDate: toLocalInput(new Date(minPickup().getTime() + (pkg?.days || 1) * 864e5)),
    adults: 2,
    children: 0,
    termsAccepted: false,
  });

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      fullName: f.fullName || user.name || "",
      mobileNumber: f.mobileNumber || user.phoneNumber || "",
      email: f.email || user.email || "",
    }));
  }, [user]);

  useEffect(() => {
    if (!pkg?.slug || !vehicleOptionId) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const { data } = await request("post", "/packages/quote", {
          packageSlug: pkg.slug,
          vehicleOptionId,
          hotelOptionId: hotelOptionId || null,
          rooms: Number(roomsParam) || 1,
        });
        if (!cancelled) setQuote(data);
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pkg?.slug, vehicleOptionId, hotelOptionId, roomsParam]);

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return openLogin();

    setError("");
    setBusy(true);
    try {
      const { data: booking } = await request("post", "/packages/book", {
        packageSlug: pkg.slug,
        vehicleOptionId,
        hotelOptionId: hotelOptionId || null,
        rooms: Number(roomsParam) || 1,
        ...form,
      });

      await startRazorpay({
        payload: { tourBooking: booking.id },
        user,
        onSuccess: (transaction: any) =>
          router.push(`/booking-confirmed?invoice=${transaction.invoiceId}`),
        onFailure: (message: string) => setError(message),
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!pkg) return null;

  return (
    <Layout settings={bootstrap?.settings} compactHeader>
      <Seo title={`Book ${pkg.title} | TaxiSafar`} description={pkg.shortDescription || ""} noIndex />

      <div className="container max-w-2xl py-6">
        <button
          onClick={() => router.back()}
          className="mb-5 flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-ink"
        >
          <ArrowLeft size={16} /> Booking Details
        </button>

        {/* selected package */}
        <div className="flex items-center gap-3 rounded-xl border border-line p-3">
          <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-surface">
            {pkg.coverImage ? (
              <Image src={mediaUrl(pkg.coverImage)} alt="" fill sizes="80px" className="object-cover" />
            ) : null}
          </span>
          <span>
            <span className="block text-sm font-semibold">{pkg.title}</span>
            <span className="mt-1 block text-[11px] text-ink-muted">
              {pkg.durationLabel} · {pkg.tripType === "roundTrip" ? "Round Trip" : "One Way"}
            </span>
          </span>
        </div>

        {loading ? (
          <div className="mt-6 space-y-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-56" />
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6">
            {/* selected vehicle */}
            {quote?.vehicle ? (
              <section className="rounded-xl border border-line p-3">
                <h2 className="text-xs font-semibold text-ink-muted">Selected Vehicle</h2>
                <div className="mt-2 flex items-center gap-3">
                  <span className="relative h-11 w-16 shrink-0 overflow-hidden rounded-md bg-surface">
                    {quote.vehicle.image ? (
                      <Image src={mediaUrl(quote.vehicle.image)} alt="" fill sizes="64px" className="object-contain p-1" />
                    ) : null}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium">{quote.vehicle.label}</span>
                    <span className="block text-[10px] text-ink-muted">
                      {quote.vehicle.seats} · {quote.vehicle.suitcases} {quote.vehicle.ac ? "· AC" : ""}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => router.push(`/packages/${pkg.slug}`)}
                    className="shrink-0 text-[11px] text-[#2563EB] underline"
                  >
                    Change Vehicle
                  </button>
                </div>
              </section>
            ) : null}

            {/* selected hotel */}
            {quote?.hotel ? (
              <section className="mt-4 rounded-xl border border-line p-3">
                <h2 className="text-xs font-semibold text-ink-muted">
                  Selected Hotel ({quote.hotel.nights} Night)
                </h2>
                <div className="mt-2 flex items-center gap-3">
                  <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-surface">
                    {quote.hotel.image ? (
                      <Image src={mediaUrl(quote.hotel.image)} alt="" fill sizes="64px" className="object-cover" />
                    ) : null}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium">{quote.hotel.name}</span>
                    <span className="block text-[10px] text-ink-muted">{quote.hotel.roomType}</span>
                    <span className="block text-[10px] text-ink-muted">
                      Check-in: {quote.hotel.checkIn} · Check-out: {quote.hotel.checkOut}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => router.push(`/packages/${pkg.slug}`)}
                    className="shrink-0 text-[11px] text-[#2563EB] underline"
                  >
                    Change Hotel
                  </button>
                </div>
              </section>
            ) : null}

            {/* journey */}
            <section className="mt-6">
              <h2 className="text-sm font-semibold">Journey Details</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="pickupLocation" className="mb-1 block text-[11px] text-ink-muted">
                    Pickup Location
                  </label>
                  <input
                    id="pickupLocation"
                    required
                    value={form.pickupLocation}
                    onChange={(e) => set("pickupLocation", e.target.value)}
                    className="field"
                  />
                </div>
                <div>
                  <label htmlFor="pickupAddress" className="mb-1 block text-[11px] text-ink-muted">
                    Pickup Address
                  </label>
                  <input
                    id="pickupAddress"
                    value={form.pickupAddress}
                    onChange={(e) => set("pickupAddress", e.target.value)}
                    placeholder="Add full pickup address"
                    className="field"
                  />
                </div>
                <div>
                  <label htmlFor="pickupDate" className="mb-1 block text-[11px] text-ink-muted">
                    Pickup Date &amp; Time
                  </label>
                  <input
                    id="pickupDate"
                    type="datetime-local"
                    required
                    min={toLocalInput(minPickup())}
                    value={form.pickupDate}
                    onChange={(e) => set("pickupDate", e.target.value)}
                    className="field"
                  />
                </div>
                <div>
                  <label htmlFor="returnDate" className="mb-1 block text-[11px] text-ink-muted">
                    Return Date &amp; Time
                  </label>
                  <input
                    id="returnDate"
                    type="datetime-local"
                    min={form.pickupDate}
                    value={form.returnDate}
                    onChange={(e) => set("returnDate", e.target.value)}
                    className="field"
                  />
                </div>
              </div>
            </section>

            {/* traveller */}
            <section className="mt-6">
              <h2 className="text-sm font-semibold">Traveller Details</h2>
              <div className="mt-3 space-y-3">
                <div>
                  <label htmlFor="fullName" className="mb-1 block text-[11px] text-ink-muted">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    required
                    autoComplete="name"
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    placeholder="Enter your full name"
                    className="field"
                  />
                </div>
                <div>
                  <label htmlFor="mobileNumber" className="mb-1 block text-[11px] text-ink-muted">
                    Mobile Number
                  </label>
                  <input
                    id="mobileNumber"
                    required
                    inputMode="numeric"
                    autoComplete="tel"
                    pattern="[6-9][0-9]{9}"
                    value={form.mobileNumber}
                    onChange={(e) => set("mobileNumber", e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="Enter mobile number"
                    className="field"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-1 block text-[11px] text-ink-muted">
                    Email Address <span className="text-ink-faint">(optional)</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="Enter email address"
                    className="field"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="adults" className="mb-1 block text-[11px] text-ink-muted">
                      Adults
                    </label>
                    <input
                      id="adults"
                      type="number"
                      min={1}
                      value={form.adults}
                      onChange={(e) => set("adults", Number(e.target.value))}
                      className="field"
                    />
                  </div>
                  <div>
                    <label htmlFor="children" className="mb-1 block text-[11px] text-ink-muted">
                      Children
                    </label>
                    <input
                      id="children"
                      type="number"
                      min={0}
                      value={form.children}
                      onChange={(e) => set("children", Number(e.target.value))}
                      className="field"
                    />
                  </div>
                </div>
              </div>
            </section>

            <PriceSummary quote={quote} />

            <label className="mt-5 flex items-start gap-2 text-xs">
              <input
                type="checkbox"
                required
                checked={form.termsAccepted}
                onChange={(e) => set("termsAccepted", e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-brand-500"
              />
              <span>
                I agree to the{" "}
                <Link href="/terms-of-use" className="text-[#2563EB] underline">
                  Terms and Conditions
                </Link>
                .
              </span>
            </label>

            {error ? <p className="mt-3 text-sm text-brand-600">{error}</p> : null}

            <button type="submit" disabled={busy || !quote} className="btn-primary mt-5 w-full">
              {busy ? "Opening payment…" : "Book to Continue"} <ArrowRight size={15} />
            </button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-[#047857]">
              <ShieldCheck size={13} /> Secure &amp; Safe Booking
            </p>
          </form>
        )}
      </div>
    </Layout>
  );
}

export async function getStaticPaths() {
  const slugs = await fetchServer<any[]>("/packages/slugs", []);
  return {
    paths: (slugs || []).map((s: any) => ({ params: { slug: s.slug } })),
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }: any) {
  const pkg = await fetchServer(`/packages/${params.slug}`, null);
  if (!pkg) return { notFound: true, revalidate: 60 };
  const bootstrap = await fetchServer("/bootstrap", {});
  return { props: { pkg, bootstrap }, revalidate: 300 };
}
