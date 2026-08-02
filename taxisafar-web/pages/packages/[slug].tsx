import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Heart, Hotel, Car, BadgeCheck, Repeat, CalendarDays } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/ui/Seo";
import ItinerarySteps from "@/components/packages/ItinerarySteps";
import PlacesGrid from "@/components/packages/PlacesGrid";
import FaqList from "@/components/packages/FaqList";
import InclusionLists from "@/components/packages/InclusionLists";
import VehiclePicker from "@/components/packages/VehiclePicker";
import HotelPicker from "@/components/packages/HotelPicker";
import PackageCard from "@/components/packages/PackageCard";
import { fetchServer } from "@/lib/api";
import { buildSeo, packageJsonLd, faqJsonLd } from "@/lib/seo";
import { mediaUrl } from "@/lib/format";

const ICONS: Record<string, any> = {
  hotel: Hotel,
  car: Car,
  driver: BadgeCheck,
  route: Repeat,
  calendar: CalendarDays,
};

/** Three-step detail flow: overview → itinerary → prices, then the booking page. */
export default function PackageDetail({ pkg, related, bootstrap }: any) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [vehicleOptionId, setVehicleOptionId] = useState(pkg?.vehicleOptions?.[0]?._id || "");
  const [hotelOptionId, setHotelOptionId] = useState("");
  const [rooms, setRooms] = useState(1);

  const days = pkg?.itinerary || [];

  const seo = buildSeo(pkg?.seo, {
    title: `${pkg?.title} | ${pkg?.durationLabel} | TaxiSafar`,
    description: pkg?.shortDescription || pkg?.description || "",
    path: `/packages/${pkg?.slug}`,
  });

  const goBook = () => {
    const params = new URLSearchParams({ vehicle: vehicleOptionId, rooms: String(rooms) });
    if (hotelOptionId) params.set("hotel", hotelOptionId);
    router.push(`/packages/${pkg.slug}/book?${params.toString()}`);
  };

  const steps = useMemo(
    () => [
      { id: 0, label: "Overview" },
      { id: 1, label: "Itinerary" },
      { id: 2, label: "Prices" },
    ],
    []
  );

  if (!pkg) return null;

  return (
    <Layout settings={bootstrap?.settings}>
      <Seo
        {...seo}
        image={mediaUrl(pkg.coverImage)}
        jsonLd={[packageJsonLd(pkg), ...(pkg.faqs?.length ? [faqJsonLd(pkg.faqs)] : [])]}
      />

      <div className="container max-w-3xl py-6">
        <div className="mb-5 flex items-center justify-between">
          <button
            onClick={() => (step === 0 ? router.back() : setStep((s) => s - 1))}
            className="flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-ink"
          >
            <ArrowLeft size={16} /> {step === 0 ? "Go Back" : "Back"}
          </button>
          <button aria-label="Save this tour" className="text-ink-faint hover:text-brand-500">
            <Heart size={18} />
          </button>
        </div>

        <nav aria-label="Tour details steps" className="mb-6 flex gap-2">
          {steps.map((s) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              aria-current={step === s.id ? "step" : undefined}
              className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
                step === s.id ? "bg-ink text-white" : "bg-surface text-ink-muted"
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>

        {/* ---------- step 1: overview ---------- */}
        {step === 0 ? (
          <>
            <h1 className="text-2xl leading-tight">{pkg.title}</h1>

            <p className="mt-3 flex flex-wrap gap-2 text-[11px]">
              <span className="rounded-md bg-brand-50 px-2 py-1 font-medium text-brand-600">{pkg.durationLabel}</span>
              <span className="rounded-md bg-surface px-2 py-1 text-ink-soft">
                {pkg.tripType === "roundTrip" ? "Round Trip" : "One Way"}
              </span>
            </p>

            <p className="mt-4 text-sm leading-relaxed text-ink-muted">{pkg.description || pkg.shortDescription}</p>

            {pkg.highlights?.length ? (
              <ul className="mt-6 grid grid-cols-5 gap-2 border-y border-line py-4">
                {pkg.highlights.map((h: any, i: number) => {
                  const Icon = ICONS[h.icon] || CalendarDays;
                  return (
                    <li key={i} className="flex flex-col items-center gap-1.5 text-center">
                      <Icon size={20} className="text-brand-500" />
                      <span className="text-[10px] font-medium leading-tight">{h.title}</span>
                      <span className="text-[9px] leading-tight text-ink-faint">{h.subtitle}</span>
                    </li>
                  );
                })}
              </ul>
            ) : null}

            {days[0] ? <ItinerarySteps day={days[0]} /> : null}

            <button onClick={() => setStep(1)} className="btn-primary mt-8 w-full">
              Next: Itinerary <ArrowRight size={15} />
            </button>
          </>
        ) : null}

        {/* ---------- step 2: itinerary + places + faqs ---------- */}
        {step === 1 ? (
          <>
            {days.slice(1).map((day: any) => (
              <ItinerarySteps key={day.day} day={day} />
            ))}
            <PlacesGrid places={pkg.placesCovered} />
            <FaqList faqs={pkg.faqs} />

            <button onClick={() => setStep(2)} className="btn-primary mt-8 w-full">
              Next: Prices <ArrowRight size={15} />
            </button>
          </>
        ) : null}

        {/* ---------- step 3: inclusions + pickers ---------- */}
        {step === 2 ? (
          <>
            <InclusionLists
              inclusions={pkg.inclusions}
              exclusions={pkg.exclusions}
              notes={pkg.importantNotes}
            />

            <VehiclePicker options={pkg.vehicleOptions} value={vehicleOptionId} onChange={setVehicleOptionId} />

            <HotelPicker
              options={pkg.hotelOptions}
              value={hotelOptionId}
              rooms={rooms}
              onChange={setHotelOptionId}
              onRooms={setRooms}
              nights={pkg.nights}
              adults={2}
              childCount={1}
            />

            <button onClick={goBook} disabled={!vehicleOptionId} className="btn-primary mt-8 w-full">
              Next: Booking Details <ArrowRight size={15} />
            </button>
          </>
        ) : null}
      </div>

      {related?.length ? (
        <section className="border-t border-line bg-surface py-14">
          <div className="container">
            <h2 className="text-xl">More tours you may like</h2>
            <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.slice(0, 3).map((r: any) => (
                <PackageCard key={r.id} pkg={r} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/packages" className="btn-outline">
                View all packages
              </Link>
            </div>
          </div>
        </section>
      ) : null}
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

  const [related, bootstrap] = await Promise.all([
    fetchServer(`/packages/${params.slug}/related`, []),
    fetchServer("/bootstrap", {}),
  ]);

  return { props: { pkg, related, bootstrap }, revalidate: 300 };
}
