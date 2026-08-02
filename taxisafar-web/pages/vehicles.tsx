import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/ui/Seo";
import Skeleton from "@/components/ui/Skeleton";
import TripSummary from "@/components/results/TripSummary";
import PriceTabs from "@/components/results/PriceTabs";
import VehicleCard from "@/components/results/VehicleCard";
import Itinerary from "@/components/results/Itinerary";
import RouteMap from "@/components/results/RouteMap";
import PartnerCards from "@/components/home/PartnerCards";
import { request, fetchServer } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function VehiclesPage({ bootstrap, partners }: any) {
  const router = useRouter();
  const { session: sessionId } = router.query;
  const { user, openLogin } = useAuth();

  const [taxIncluded, setTaxIncluded] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState("");

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await request("get", `/quote/${sessionId}`, { tax_included: taxIncluded });
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
  }, [sessionId, taxIncluded]);

  const bookVehicle = async (vehicle: any) => {
    if (!user) return openLogin();

    setBooking(vehicle.id);
    try {
      const session = quote.session;
      const { data: trip } = await request("post", "/trips", {
        sessionId: session.sessionId,
        vehicle: vehicle.id,
        customerName: user.name,
        customerPhone: session.phoneNo || user.phoneNumber,
        customerEmail: user.email,
        pickupAddress: session.places?.[0]?.label,
        quotedPrice: vehicle.computedPrice,
        discount: vehicle.discount,
        discountedPrice: vehicle.discountPrice,
        advanceAmount: vehicle.advancePrice,
        includedKm: vehicle.computedKm,
        taxInclusive: taxIncluded,
      });
      router.push(`/booking/${trip.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBooking("");
    }
  };

  const session = quote?.session;
  const isDham = session?.car_tab === "chardham";
  const stops = quote?.itinerary || [];

  return (
    <Layout settings={bootstrap?.settings} compactHeader>
      <Seo
        title="Your cab options and prices | TaxiSafar"
        description="Compare cab fares for your trip with a full breakdown of included kilometres, tolls, driver and fuel charges."
        noIndex
      />

      <div className="container py-6">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-ink"
        >
          <ArrowLeft size={16} /> Go Back
        </button>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-12" />
            <div className="grid gap-5 md:grid-cols-3">
              <Skeleton className="h-[430px]" />
              <Skeleton className="h-[430px]" />
              <Skeleton className="h-[430px]" />
            </div>
          </div>
        ) : error ? (
          <div className="card p-8 text-center">
            <p className="text-sm text-ink-soft">{error}</p>
            <Link href="/" className="btn-primary mt-4">
              Start a new search
            </Link>
          </div>
        ) : quote ? (
          <>
            <TripSummary session={session} />

            <div className="mt-8">
              <PriceTabs taxIncluded={taxIncluded} onChange={setTaxIncluded} />
            </div>

            {quote.vehicles?.length ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {quote.vehicles.map((v: any) => (
                  <VehicleCard
                    key={v.id}
                    vehicle={{ ...v, tollIncluded: taxIncluded }}
                    variant={isDham ? "capacity" : "fare"}
                    busy={booking === v.id}
                    onBook={bookVehicle}
                  />
                ))}
              </div>
            ) : (
              <div className="card mt-6 p-10 text-center">
                <p className="text-sm text-ink-soft">
                  No cabs are available for this route right now. Try a different date or pickup point.
                </p>
                <Link href="/" className="btn-primary mt-4">
                  Change search
                </Link>
              </div>
            )}

            {isDham ? <Itinerary stops={stops} /> : <RouteMap places={session.places || []} />}
          </>
        ) : null}
      </div>

      {partners ? <PartnerCards section={partners} /> : null}
    </Layout>
  );
}

export async function getStaticProps() {
  const [bootstrap, content] = await Promise.all([
    fetchServer("/bootstrap", {}),
    fetchServer("/content/home", null),
  ]);
  const partners = content?.sections?.find((s: any) => s.sectionType === "partnerCards") || null;
  return { props: { bootstrap, partners }, revalidate: 600 };
}
