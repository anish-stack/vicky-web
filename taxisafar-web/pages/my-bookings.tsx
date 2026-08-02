import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/ui/Seo";
import Skeleton from "@/components/ui/Skeleton";
import { fetchServer, request } from "@/lib/api";
import { inr, splitDate } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";

export default function MyBookings({ bootstrap }: any) {
  const { user, openLogin, loading: authLoading } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return openLogin();
    }

    Promise.all([
      request("get", "/trips").then((r) => r.data).catch(() => []),
      request("get", "/packages/bookings").then((r) => r.data).catch(() => []),
    ])
      .then(([t, p]) => {
        setTrips(t || []);
        setTours(p || []);
      })
      .finally(() => setLoading(false));
  }, [user, authLoading, openLogin]);

  const badge = (status: string) =>
    ({
      pending: "bg-[#FEF3C7] text-[#92400E]",
      confirmed: "bg-[#ECFDF5] text-[#047857]",
      ongoing: "bg-[#EFF6FF] text-[#1D4ED8]",
      completed: "bg-surface text-ink-soft",
      cancelled: "bg-brand-50 text-brand-600",
    }[status] || "bg-surface text-ink-soft");

  return (
    <Layout settings={bootstrap?.settings}>
      <Seo title="My bookings | TaxiSafar" description="Your trips and tour package bookings." noIndex />

      <div className="container max-w-3xl py-12">
        <h1 className="text-2xl">My bookings</h1>

        {loading ? (
          <div className="mt-8 space-y-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : !user ? (
          <p className="mt-8 text-sm text-ink-muted">Sign in to see your bookings.</p>
        ) : !trips.length && !tours.length ? (
          <div className="card mt-8 p-10 text-center">
            <p className="text-sm text-ink-soft">You haven&apos;t booked anything yet.</p>
            <Link href="/" className="btn-primary mt-4">
              Book a taxi
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {tours.length ? (
              <section>
                <h2 className="text-base font-semibold">Tour packages</h2>
                <ul className="mt-4 space-y-3">
                  {tours.map((b: any) => {
                    const d = splitDate(b.pickupDate);
                    return (
                      <li key={b.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                        <div>
                          <p className="text-sm font-medium">{b.packageTitle}</p>
                          <p className="mt-1 text-xs text-ink-muted">
                            {b.bookingCode} · {d.day} {d.monthShort} {d.year} · {b.vehicleLabel}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-display text-sm font-bold">{inr(b.totalPayable)}</span>
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${badge(b.status)}`}>
                            {b.status}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

            {trips.length ? (
              <section>
                <h2 className="text-base font-semibold">Taxi trips</h2>
                <ul className="mt-4 space-y-3">
                  {trips.map((t: any) => {
                    const d = splitDate(t.departureDate);
                    return (
                      <li key={t.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                        <div>
                          <p className="text-sm font-medium">
                            {(t.places || []).map((p: any) => p.label).join(" → ") || t.pickupAddress}
                          </p>
                          <p className="mt-1 text-xs text-ink-muted">
                            {t.tripCode} · {d.day} {d.monthShort} {d.year} · {t.vehicle?.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-display text-sm font-bold">
                            {inr(t.discountedPrice > 0 ? t.discountedPrice : t.quotedPrice)}
                          </span>
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${badge(t.trip_status)}`}>
                            {t.trip_status}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  const bootstrap = await fetchServer("/bootstrap", {});
  return { props: { bootstrap }, revalidate: 600 };
}
