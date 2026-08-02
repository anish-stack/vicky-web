import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/ui/Seo";
import Skeleton from "@/components/ui/Skeleton";
import { request, fetchServer } from "@/lib/api";
import { inr, splitDate } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { startRazorpay } from "@/lib/payment";

/** Confirm + pay screen for a taxi trip created from the results page. */
export default function TripBookingPage({ bootstrap }: any) {
  const router = useRouter();
  const { id } = router.query;
  const { user, openLogin, loading: authLoading } = useAuth();

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id || authLoading) return;
    if (!user) return openLogin();

    (async () => {
      try {
        const { data } = await request("get", `/trips/${id}`);
        setTrip(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user, authLoading, openLogin]);

  const pay = async () => {
    setBusy(true);
    setError("");
    try {
      await startRazorpay({
        payload: { trip: String(id) },
        user,
        onSuccess: (transaction: any) => router.push(`/booking-confirmed?invoice=${transaction.invoiceId}`),
        onFailure: (message: string) => setError(message),
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const pickup = splitDate(trip?.departureDate);
  const drop = splitDate(trip?.returnDate);
  const payable = trip?.discountedPrice > 0 ? trip.discountedPrice : trip?.quotedPrice;

  return (
    <Layout settings={bootstrap?.settings} compactHeader>
      <Seo title="Confirm your booking | TaxiSafar" description="Review your trip and pay to confirm." noIndex />

      <div className="container max-w-2xl py-6">
        <button
          onClick={() => router.back()}
          className="mb-5 flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-ink"
        >
          <ArrowLeft size={16} /> Go Back
        </button>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-40" />
          </div>
        ) : error && !trip ? (
          <div className="card p-8 text-center">
            <p className="text-sm text-ink-soft">{error}</p>
          </div>
        ) : trip ? (
          <>
            <h1 className="text-xl">Confirm your booking</h1>
            <p className="mt-1 text-sm text-ink-muted">Trip reference {trip.tripCode}</p>

            <section className="card mt-6 p-5">
              <h2 className="text-sm font-semibold">Trip Details</h2>
              <dl className="mt-3 space-y-2.5 text-xs">
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-muted">Vehicle</dt>
                  <dd className="text-right font-medium">{trip.vehicle?.title}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-muted">Pickup</dt>
                  <dd className="text-right font-medium">
                    {pickup.day} {pickup.monthShort}, {pickup.year} · {pickup.time}
                  </dd>
                </div>
                {trip.returnDate ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-muted">Return</dt>
                    <dd className="text-right font-medium">
                      {drop.day} {drop.monthShort}, {drop.year} · {drop.time}
                    </dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-muted">Route</dt>
                  <dd className="text-right font-medium">
                    {(trip.places || []).map((p: any) => p.label).join(" → ")}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-muted">Included Km</dt>
                  <dd className="text-right font-medium">{trip.includedKm}</dd>
                </div>
              </dl>
            </section>

            <section className="card mt-4 p-5">
              <h2 className="text-sm font-semibold">Price Summary</h2>
              <dl className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Trip fare</dt>
                  <dd className="font-medium">{inr(trip.quotedPrice)}</dd>
                </div>
                {trip.discount > 0 ? (
                  <div className="flex justify-between text-[#047857]">
                    <dt>Discount ({trip.discount}%)</dt>
                    <dd className="font-medium">-{inr(trip.quotedPrice - trip.discountedPrice)}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between border-t border-line pt-2">
                  <dt className="font-semibold">Total</dt>
                  <dd className="font-display text-sm font-bold">{inr(payable)}</dd>
                </div>
              </dl>

              {trip.advanceAmount > 0 ? (
                <p className="mt-3 flex items-center justify-between rounded-lg bg-[#ECFDF5] px-3 py-2 text-xs text-[#047857]">
                  <span>Pay now to confirm</span>
                  <span className="font-semibold">{inr(trip.advanceAmount)}</span>
                </p>
              ) : null}
            </section>

            {error ? <p className="mt-4 text-sm text-brand-600">{error}</p> : null}

            <button onClick={pay} disabled={busy} className="btn-primary mt-5 w-full">
              {busy ? "Opening payment…" : "Pay and confirm"} <ArrowRight size={15} />
            </button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-[#047857]">
              <ShieldCheck size={13} /> Secure &amp; Safe Booking
            </p>
          </>
        ) : null}
      </div>
    </Layout>
  );
}

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export async function getStaticProps() {
  const bootstrap = await fetchServer("/bootstrap", {});
  return { props: { bootstrap }, revalidate: 600 };
}
