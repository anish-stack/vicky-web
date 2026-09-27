import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import {
  FALLBACK_IMG,
  TourPackage,
  WHATSAPP_NUMBER,
  activeHotels,
  activeVehicles,
  durationText,
  faIcon,
  getTourBySlug,
  inr,
  startingPrice,
  tripTypeText,
} from "@/lib/tourPackage";
import { CheckList, Stars } from "@/components/tour/TourBits";

type Props = { tour: TourPackage };

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
  const tour = await getTourBySlug(String(params?.slug || ""));
  if (!tour) return { notFound: true };
  return { props: { tour } };
};

/* ------------------------------------------------------------------ */
/* local pieces                                                       */
/* ------------------------------------------------------------------ */

function Section({ id, title, icon, children, className = "" }: { id: string; title: string; icon: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`scroll-mt-36 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 ${className}`}>
      <h2 className="mb-4 mt-0 flex items-center gap-2.5 text-[18px] font-bold text-slate-900 sm:text-[21px]">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-600">
          <i className={`${icon} text-[14px]`} />
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Lightbox({
  images,
  index,
  onClose,
  onIndex,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();

      if (e.key === "ArrowRight") {
        onIndex((index + 1) % images.length);
      }

      if (e.key === "ArrowLeft") {
        onIndex((index - 1 + images.length) % images.length);
      }
    };

    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, images.length, onClose, onIndex]);

  if (!images.length) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="
          absolute right-4 top-4 z-20
          grid h-11 w-11 place-items-center
          rounded-full
          bg-white text-black
          shadow-lg
          transition
          hover:scale-105 hover:bg-gray-100
          sm:right-6 sm:top-6
        "
        aria-label="Close"
      >
        <i className="fa-solid fa-xmark text-xl" />
      </button>

      {/* Counter */}
      <div
        className="
          absolute left-4 top-4 z-20
          rounded-full bg-black/60
          px-3 py-1.5
          text-sm font-medium text-white
          backdrop-blur-sm
          sm:left-6 sm:top-6
        "
      >
        {index + 1} / {images.length}
      </div>

      {/* Image Area */}
      <div
        className="
          relative flex
          h-full w-full
          max-h-[88vh]
          max-w-[1200px]
          items-center justify-center
        "
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[index]}
          alt={`Gallery image ${index + 1}`}
          className="
            max-h-[80vh]
            max-w-[90vw]
            rounded-xl
            object-contain
            shadow-2xl

            sm:max-h-[82vh]
            sm:max-w-[85vw]

            lg:max-h-[78vh]
            lg:max-w-[1100px]
          "
        />

        {images.length > 1 && (
          <>
            {/* Previous */}
            <button
              type="button"
              onClick={() =>
                onIndex(
                  (index - 1 + images.length) %
                    images.length
                )
              }
              className="
                absolute left-1
                grid h-10 w-10
                place-items-center
                rounded-full
                bg-black/65
                text-white
                shadow-lg
                backdrop-blur-sm
                transition
                hover:scale-105 hover:bg-black/80

                sm:left-4
                sm:h-12 sm:w-12
              "
              aria-label="Previous photo"
            >
              <i className="fa-solid fa-chevron-left" />
            </button>

            {/* Next */}
            <button
              type="button"
              onClick={() =>
                onIndex(
                  (index + 1) %
                    images.length
                )
              }
              className="
                absolute right-1
                grid h-10 w-10
                place-items-center
                rounded-full
                bg-black/65
                text-white
                shadow-lg
                backdrop-blur-sm
                transition
                hover:scale-105 hover:bg-black/80

                sm:right-4
                sm:h-12 sm:w-12
              "
              aria-label="Next photo"
            >
              <i className="fa-solid fa-chevron-right" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* page                                                               */
/* ------------------------------------------------------------------ */

export default function TourDetailPage({ tour }: Props) {
  const [photo, setPhoto] = useState<number | null>(null);

  const from = startingPrice(tour);
  const bookHref = `/tour/${tour.slug}/book`;
  const vehicles = activeVehicles(tour);
  const hotels = activeHotels(tour);
  const photos = [tour.cover_image || FALLBACK_IMG, ...tour.gallery].filter(Boolean) as string[];
  const seoTitle = tour.seo.title || tour.title;
  const seoDesc = tour.seo.description || tour.short_description;
  const whatsapp = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi, I'd like details for the tour: ${tour.title}`)}`;

  const tabs = [
    { id: "overview", label: "Overview", show: true },
    { id: "itinerary", label: "Itinerary", show: tour.itinerary.length > 0 },
    { id: "places", label: "Places", show: tour.places_covered.length > 0 },
    { id: "inclusions", label: "Inclusions", show: tour.inclusions.length + tour.exclusions.length > 0 },
    { id: "notes", label: "Notes", show: tour.important_notes.length > 0 },
    { id: "faqs", label: "FAQs", show: tour.faqs.length > 0 },
  ].filter((t) => t.show);

  const facts = [
    { icon: "fa-regular fa-clock", label: "Duration", value: `${tour.days}D / ${tour.nights}N` },
    { icon: `fa-solid ${tour.trip_type === "oneWay" ? "fa-arrow-right" : "fa-rotate"}`, label: "Trip type", value: tripTypeText(tour) },
    { icon: "fa-solid fa-location-dot", label: "Pickup", value: tour.from_city_name },
    { icon: "fa-solid fa-car", label: "Vehicles", value: `${vehicles.length} options` },
    { icon: "fa-solid fa-hotel", label: "Hotel", value: hotels.length ? (tour.hotel_optional ? "Optional" : "Included") : "Not included" },
    { icon: "fa-solid fa-user-shield", label: "Driver", value: "Verified" },
  ];

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        {seoDesc && <meta name="description" content={seoDesc} />}
        {tour.seo.keywords && <meta name="keywords" content={tour.seo.keywords} />}
        <link rel="canonical" href={tour.seo.canonical || `/tour/${tour.slug}`} />
        <meta property="og:title" content={seoTitle} />
        {seoDesc && <meta property="og:description" content={seoDesc} />}
        {tour.cover_image && <meta property="og:image" content={tour.cover_image} />}
      </Head>

      <main className="mt-20 bg-slate-50 pb-28 lg:pb-12">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          {/* breadcrumb */}
          <nav className="py-3 text-[12px] text-slate-500 sm:text-[13px]" aria-label="Breadcrumb">
            <Link href="/" className="text-slate-500 no-underline hover:text-red-600">Home</Link>
            <span className="mx-1.5">/</span>
            <Link href="/tours" className="text-slate-500 no-underline hover:text-red-600">Tour Packages</Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-800">{tour.title}</span>
          </nav>

          {/* ================= header ================= */}
          <header className="mb-4 flex flex-col gap-3 sm:mb-5 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <h1 className="m-0 text-[24px] font-extrabold leading-tight text-slate-900 sm:text-[32px] lg:text-[36px]">{tour.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-slate-600 sm:text-[14px]">
                <span><i className="fa-solid fa-route mr-1.5 text-red-600" />{tour.from_city_name} → {tour.to_city_name}</span>
                <span><i className="fa-regular fa-calendar mr-1.5 text-red-600" />{durationText(tour)}</span>
                {tour.rating > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Stars value={tour.rating} size="text-[13px]" />
                    <b className="text-slate-900">{tour.rating.toFixed(1)}</b>
                    {tour.review_count > 0 && <span>({tour.review_count} reviews)</span>}
                  </span>
                )}
              </div>
            </div>
            <a href={whatsapp} target="_blank" rel="noreferrer" className="hidden shrink-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-[14px] font-semibold text-slate-800 no-underline hover:border-green-500 hover:text-green-700 md:inline-flex">
              <i className="fa-brands fa-whatsapp text-[17px] text-green-600" /> Ask on WhatsApp
            </a>
          </header>

          {/* ================= gallery ================= */}
          <div className="relative mb-5 sm:mb-6">
            {/* mobile/tablet: big cover + scrollable thumbs */}
            <div className="md:hidden">
              <button type="button" onClick={() => setPhoto(0)} className="block w-full overflow-hidden rounded-2xl">
                <img src={photos[0]} alt={tour.title} className="aspect-[16/10] w-full object-cover" />
              </button>
              {photos.length > 1 && (
                <div className="-mx-3 mt-2 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none]">
                  {photos.slice(1).map((p, i) => (
                    <button key={i} type="button" onClick={() => setPhoto(i + 1)} className="shrink-0 overflow-hidden rounded-xl">
                      <img src={p} alt="" loading="lazy" className="h-20 w-28 object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* desktop: mosaic */}
            <div className={`hidden gap-2 overflow-hidden rounded-2xl md:grid ${photos.length > 1 ? "md:h-[380px] md:grid-cols-4 md:grid-rows-2 lg:h-[440px]" : "md:h-[420px]"}`}>
              {photos.slice(0, 5).map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPhoto(i)}
                  className={`group relative overflow-hidden ${i === 0 ? (photos.length > 1 ? "col-span-2 row-span-2" : "col-span-4 row-span-2") : ""} ${photos.length === 2 && i === 1 ? "col-span-2 row-span-2" : ""} ${photos.length === 3 && i > 0 ? "col-span-2" : ""}`}
                >
                  <img src={p} alt="" loading={i ? "lazy" : "eager"} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  {i === 4 && photos.length > 5 && (
                    <span className="absolute inset-0 grid place-items-center bg-black/50 text-[16px] font-semibold text-white">+{photos.length - 5} photos</span>
                  )}
                </button>
              ))}
            </div>

            {photos.length > 1 && (
              <button type="button" onClick={() => setPhoto(0)} className="absolute bottom-3 right-3 hidden items-center gap-2 rounded-lg bg-white/95 px-3 py-1.5 text-[13px] font-semibold text-slate-800 shadow md:inline-flex">
                <i className="fa-regular fa-images" /> View all {photos.length} photos
              </button>
            )}
          </div>

          {/* ================= sticky section tabs ================= */}
          <nav className="sticky top-20 z-30 -mx-3 mb-5 border-b border-slate-200 bg-slate-50/95 px-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8" aria-label="Sections">
            <ul className="m-0 flex list-none gap-1 overflow-x-auto p-0 [scrollbar-width:none]">
              {tabs.map((t) => (
                <li key={t.id} className="shrink-0">
                  <a href={`#${t.id}`} className="block border-b-2 border-transparent px-3 py-3 text-[13px] font-semibold text-slate-600 no-underline hover:border-red-600 hover:text-red-600 sm:px-4 sm:text-[14px]">
                    {t.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
            {/* ================= main column ================= */}
            <div className="min-w-0 space-y-5">
              {/* overview */}
              <Section id="overview" title="Overview" icon="fa-solid fa-compass">
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {facts.map((f) => (
                    <div key={f.label} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-red-600 shadow-sm">
                        <i className={`${f.icon} text-[14px]`} />
                      </span>
                      <div className="min-w-0">
                        <p className="m-0 text-[11px] text-slate-500">{f.label}</p>
                        <p className="m-0 truncate text-[13px] font-semibold text-slate-900 sm:text-[14px]">{f.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {tour.short_description && (
                  <p className="mb-0 mt-5 text-[15px] font-medium leading-relaxed text-slate-800 sm:text-[16px]">{tour.short_description}</p>
                )}
                {tour.description && (
                  <div
                    className="mt-3 text-[14px] leading-relaxed text-slate-600 sm:text-[15px] [&_p]:mb-3"
                    dangerouslySetInnerHTML={{ __html: tour.description.includes("<") ? tour.description : tour.description.replace(/\n/g, "<br/>") }}
                  />
                )}

                {tour.highlights.length > 0 && (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {tour.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/40 p-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-red-600 shadow-sm">
                          <i className={`${faIcon(h.icon)} text-[15px]`} />
                        </span>
                        <div className="min-w-0">
                          <p className="m-0 text-[14px] font-semibold text-slate-900">{h.title}</p>
                          {h.subtitle && <p className="m-0 text-[13px] text-slate-600">{h.subtitle}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tour.hotel_optional && hotels.length > 0 && (
                  <p className="mb-0 mt-4 flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2.5 text-[13px] text-blue-800">
                    <i className="fa-solid fa-circle-info mt-0.5" /> Hotel is optional. Choose a stay or book the cab only on the next step.
                  </p>
                )}
              </Section>

              {/* itinerary */}
              {tour.itinerary.length > 0 && (
                <Section id="itinerary" title="Day-wise Itinerary" icon="fa-solid fa-map-location-dot">
                  <ol className="m-0 list-none space-y-4 p-0">
                    {tour.itinerary.map((d, i) => (
                      <li key={i} className="relative pl-12 sm:pl-16">
                        {/* rail */}
                        {i < tour.itinerary.length - 1 && <span className="absolute bottom-[-16px] left-[19px] top-10 w-0.5 bg-red-100 sm:left-[27px]" aria-hidden />}
                        <span className="absolute left-0 top-0 grid h-10 w-10 place-items-center rounded-full bg-red-600 text-center text-[11px] font-bold leading-none text-white shadow sm:h-14 sm:w-14 sm:text-[13px]">
                          Day<br />{d.day ?? i + 1}
                        </span>

                        <details open={i === 0} className="group overflow-hidden rounded-xl border border-slate-200 bg-white [&_summary::-webkit-details-marker]:hidden">
                          <summary className="flex cursor-pointer list-none items-start justify-between gap-3 p-3 sm:p-4">
                            <div className="min-w-0">
                              <h3 className="m-0 text-[15px] font-bold leading-snug text-slate-900 sm:text-[17px]">{d.title || `Day ${d.day ?? i + 1}`}</h3>
                              {(d.distance || d.duration || (d.items?.length ?? 0) > 0) && (
                                <p className="m-0 mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[12px] text-slate-500 sm:text-[13px]">
                                  {d.distance && <span><i className="fa-solid fa-road mr-1" />{d.distance}</span>}
                                  {d.duration && <span><i className="fa-regular fa-clock mr-1" />{d.duration}</span>}
                                  {(d.items?.length ?? 0) > 0 && <span><i className="fa-solid fa-list-check mr-1" />{d.items!.length} stops</span>}
                                </p>
                              )}
                            </div>
                            <i className="fa-solid fa-chevron-down mt-1.5 text-[12px] text-slate-400 transition-transform group-open:rotate-180" />
                          </summary>

                          <div className="border-t border-slate-100 p-3 sm:p-4">
                            <div className={`grid gap-4 ${d.image ? "md:grid-cols-[minmax(0,1fr)_240px]" : ""}`}>
                              {d.image && (
                                <img src={d.image} alt={d.title || ""} loading="lazy" className="aspect-[16/10] w-full rounded-lg object-cover md:order-2 md:aspect-[3/4]" />
                              )}
                              <div className="min-w-0 md:order-1">
                                {d.summary && <p className="mb-3 mt-0 text-[14px] leading-relaxed text-slate-700">{d.summary}</p>}
                                {d.items && d.items.length > 0 && (
                                  <ul className="m-0 list-none space-y-3 p-0">
                                    {d.items.map((it, j) => (
                                      <li key={j} className="flex gap-3">
                                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-600" />
                                        <div className="min-w-0">
                                          <p className="m-0 text-[14px] font-semibold text-slate-900">{it.title}</p>
                                          {it.description && <p className="m-0 mt-0.5 text-[13px] leading-relaxed text-slate-600">{it.description}</p>}
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </div>
                        </details>
                      </li>
                    ))}
                  </ol>
                </Section>
              )}

              {/* places */}
              {tour.places_covered.length > 0 && (
                <Section id="places" title="Places We Cover" icon="fa-solid fa-place-of-worship">
                  <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-4">
                    {tour.places_covered.map((p, i) => (
                      <figure key={i} className="m-0 w-36 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white sm:w-auto">
                        {p.image ? (
                          <img src={p.image} alt={p.name || ""} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                        ) : (
                          <div className="grid aspect-[4/3] w-full place-items-center bg-red-50 text-red-600">
                            <i className={`${faIcon(p.icon)} text-[26px]`} />
                          </div>
                        )}
                        <figcaption className="px-2.5 py-2 text-[13px] font-semibold leading-tight text-slate-800">{p.name}</figcaption>
                      </figure>
                    ))}
                  </div>
                </Section>
              )}

              {/* inclusions / exclusions */}
              {(tour.inclusions.length > 0 || tour.exclusions.length > 0) && (
                <Section id="inclusions" title="What's Included" icon="fa-solid fa-clipboard-check">
                  <div className="grid gap-5 sm:grid-cols-2">
                    {tour.inclusions.length > 0 && (
                      <div className="rounded-xl bg-green-50/60 p-4">
                        <p className="mb-3 mt-0 text-[14px] font-bold text-green-800">Inclusions</p>
                        <CheckList items={tour.inclusions} tone="yes" />
                      </div>
                    )}
                    {tour.exclusions.length > 0 && (
                      <div className="rounded-xl bg-red-50/60 p-4">
                        <p className="mb-3 mt-0 text-[14px] font-bold text-red-700">Exclusions</p>
                        <CheckList items={tour.exclusions} tone="no" />
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {/* notes */}
              {tour.important_notes.length > 0 && (
                <Section id="notes" title="Important Notes" icon="fa-solid fa-circle-info">
                  <ul className="m-0 list-none space-y-2.5 p-0">
                    {tour.important_notes.map((n, i) => (
                      <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-slate-700">
                        <i className="fa-solid fa-triangle-exclamation mt-1 text-[12px] text-amber-500" />
                        <span>{n}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* faqs */}
              {tour.faqs.length > 0 && (
                <Section id="faqs" title="Frequently Asked Questions" icon="fa-regular fa-circle-question">
                  <div className="space-y-2.5">
                    {tour.faqs.map((f, i) => (
                      <details key={i} className="group rounded-xl border border-slate-200 bg-white px-4 py-3 open:border-red-200 open:bg-red-50/30 [&_summary::-webkit-details-marker]:hidden">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[14px] font-semibold text-slate-900 sm:text-[15px]">
                          {f.question}
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 transition-transform group-open:rotate-45">
                            <i className="fa-solid fa-plus text-[11px] text-slate-600" />
                          </span>
                        </summary>
                        <p className="mb-0 mt-2 text-[14px] leading-relaxed text-slate-600">{f.answer}</p>
                      </details>
                    ))}
                  </div>
                </Section>
              )}
            </div>

            {/* ================= booking sidebar (desktop) ================= */}
            <aside className="hidden lg:block">
              <div className="sticky top-36 space-y-4">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="bg-gradient-to-br from-red-600 to-red-700 p-5 text-white">
                    <p className="m-0 text-[13px] opacity-90">Taxi charge starts from</p>
                    <p className="m-0 mt-0.5 text-[34px] font-extrabold leading-tight">{from ? inr(from) : "On request"}</p>
                    <p className="m-0 text-[13px] opacity-90">All including · {tour.days}D / {tour.nights}N · {tripTypeText(tour)}</p>
                  </div>

                  <div className="p-5">
                    {vehicles.length > 0 && (
                      <>
                        <p className="mb-2 mt-0 text-[13px] font-bold text-slate-900">Vehicle options</p>
                        <ul className="m-0 list-none divide-y divide-slate-100 p-0">
                          {vehicles.map((v) => (
                            <li key={v.idx}>
                              <Link href={`${bookHref}?v=${v.idx}`} className="flex items-center gap-3 py-2.5 text-inherit no-underline hover:text-red-600">
                                <img src={v.image || FALLBACK_IMG} alt="" loading="lazy" className="h-9 w-14 shrink-0 rounded bg-slate-50 object-contain" />
                                <span className="min-w-0 flex-1">
                                  <span className="block text-[14px] font-semibold text-slate-900">{v.label}</span>
                                  <span className="block truncate text-[12px] text-slate-500">{[v.seats, v.suitcases].filter(Boolean).join(" · ")}</span>
                                </span>
                                <span className="shrink-0 text-[14px] font-bold text-slate-900">{inr(v.price)}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    <Link href={bookHref} className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-[15px] font-semibold text-white no-underline hover:bg-red-700 hover:text-white">
                      Select Vehicle &amp; Hotel <i className="fa-solid fa-arrow-right" />
                    </Link>
                    <a href={whatsapp} target="_blank" rel="noreferrer" className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-[14px] font-semibold text-slate-800 no-underline hover:border-green-500 hover:text-green-700">
                      <i className="fa-brands fa-whatsapp text-[16px] text-green-600" /> Ask a question
                    </a>

                    <ul className="m-0 mt-4 list-none space-y-2 border-t border-slate-100 p-0 pt-4 text-[13px] text-slate-600">
                      <li><i className="fa-solid fa-check mr-2 text-green-600" />Pay only {tour.booking_charge_percent}% now to confirm</li>
                      {hotels.length > 0 && <li><i className="fa-solid fa-check mr-2 text-green-600" />{hotels.length} hotel choices{tour.hotel_optional ? " (optional)" : ""}</li>}
                      <li><i className="fa-solid fa-check mr-2 text-green-600" />Verified, experienced drivers</li>
                    </ul>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* ================= mobile / tablet bottom bar ================= */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
            <div className="min-w-0 flex-1">
              <p className="m-0 text-[11px] font-medium text-slate-500">Starting from</p>
              <p className="m-0 text-[20px] font-extrabold leading-tight text-red-600 sm:text-[22px]">{from ? inr(from) : "On request"}</p>
            </div>
            <a href={whatsapp} target="_blank" rel="noreferrer" className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-slate-300 text-green-600 no-underline" aria-label="Ask on WhatsApp">
              <i className="fa-brands fa-whatsapp text-[20px]" />
            </a>
            <Link href={bookHref} className="flex shrink-0 items-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-[14px] font-semibold text-white no-underline hover:bg-red-700 hover:text-white sm:px-6 sm:text-[15px]">
              Select Vehicle &amp; Hotel <i className="fa-solid fa-arrow-right" />
            </Link>
          </div>
        </div>
      </main>

      {photo !== null && <Lightbox images={photos} index={photo} onClose={() => setPhoto(null)} onIndex={setPhoto} />}
    </>
  );
}