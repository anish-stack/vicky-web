import { useEffect, useRef, useState } from "react";
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
    <section id={id} className={`scroll-mt-32 rounded-xl border border-slate-200 bg-white p-3 sm:rounded-2xl sm:p-6 ${className}`}>
      <h2 className="mb-3 mt-0 flex items-center gap-2 text-[16px] font-bold text-slate-900 sm:mb-4 sm:gap-2.5 sm:text-[21px]">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-red-50 text-red-600 sm:h-8 sm:w-8">
          <i className={`${icon} text-[12px] sm:text-[14px]`} />
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Acc({
  title,
  tone = "default",
  defaultOpen = false,
  children,
}: {
  title: string;
  tone?: "default" | "yes" | "no";
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const titleColor = tone === "yes" ? "text-green-800" : tone === "no" ? "text-red-700" : "text-slate-900";
  const bg = tone === "yes" ? "bg-green-50/60 border-green-100" : tone === "no" ? "bg-red-50/60 border-red-100" : "bg-white border-slate-200";
  return (
    <details open={defaultOpen} className={`group rounded-xl border px-3 py-2.5 ${bg} [&_summary::-webkit-details-marker]:hidden`}>
      <summary className={`flex cursor-pointer list-none items-center justify-between gap-3 text-[14px] font-semibold ${titleColor}`}>
        {title}
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/80 transition-transform group-open:rotate-45">
          <i className="fa-solid fa-plus text-[10px] text-slate-600" />
        </span>
      </summary>
      <div className="mt-2.5">{children}</div>
    </details>
  );
}

function MobileSlider({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ on: false, x: 0, left: 0, moved: false });

  const onScroll = () => {
    const el = trackRef.current;
    if (!el || !el.clientWidth) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== active) setActive(i);
  };

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    setActive(i);
  };

  /* mouse drag (touch swipe is native) */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = trackRef.current;
    if (!el) return;
    drag.current = { on: true, x: e.clientX, left: el.scrollLeft, moved: false };
    el.style.scrollSnapType = "none";
    el.style.scrollBehavior = "auto";
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el || !drag.current.on) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 3) drag.current.moved = true;
    el.scrollLeft = drag.current.left - dx;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el || !drag.current.on) return;
    drag.current.on = false;
    try { el.releasePointerCapture(e.pointerId); } catch {}
    const w = el.clientWidth || 1;
    const dx = e.clientX - drag.current.x;
    let i = Math.round(el.scrollLeft / w);
    if (Math.abs(dx) > 40) i = dx < 0 ? Math.ceil(drag.current.left / w) + (drag.current.left % w === 0 ? 1 : 0) : Math.floor(drag.current.left / w) - (drag.current.left % w === 0 ? 1 : 0);
    i = Math.max(0, Math.min(images.length - 1, i));
    el.style.scrollSnapType = "";
    el.style.scrollBehavior = "";
    goTo(i);
  };

  useEffect(() => {
    const t = thumbsRef.current?.children[active] as HTMLElement | undefined;
    t?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [active]);

  return (
    <div>
      <div className="relative">
        <div
          ref={trackRef}
          onScroll={onScroll}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="no-sb flex cursor-grab snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-xl active:cursor-grabbing"
          style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {images.map((p, i) => (
            <img
              key={i}
              src={p}
              alt={i === 0 ? title : `${title} ${i + 1}`}
              draggable={false}
              loading={i === 0 ? "eager" : "lazy"}
              className="aspect-[16/10] w-full shrink-0 select-none snap-center snap-always object-cover"
            />
          ))}
        </div>
        {images.length > 1 && (
          <span className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            {active + 1} / {images.length}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="-mx-3 mt-1.5 overflow-hidden">
        <div ref={thumbsRef} className="no-sb -mb-6 flex gap-1.5 overflow-x-auto px-3 pb-6" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {images.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Photo ${i + 1}`}
              className={`shrink-0 overflow-hidden rounded-lg border-2 transition ${i === active ? "border-red-600" : "border-transparent opacity-70"}`}
            >
              <img src={p} alt="" draggable={false} loading="lazy" className="h-14 w-20 object-cover" />
            </button>
          ))}
        </div>
        </div>
      )}
    </div>
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
      if (e.key === "ArrowRight") onIndex((index + 1) % images.length);
      if (e.key === "ArrowLeft") onIndex((index - 1 + images.length) % images.length);
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
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full bg-white text-black shadow-lg transition hover:scale-105 hover:bg-gray-100 sm:right-6 sm:top-6"
        aria-label="Close"
      >
        <i className="fa-solid fa-xmark text-xl" />
      </button>

      <div className="absolute left-4 top-4 z-20 rounded-full bg-black/60 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm sm:left-6 sm:top-6">
        {index + 1} / {images.length}
      </div>

      <div
        className="relative flex h-full max-h-[88vh] w-full max-w-[1200px] items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[index]}
          alt={`Gallery image ${index + 1}`}
          className="max-h-[80vh] max-w-[90vw] rounded-xl object-contain shadow-2xl sm:max-h-[82vh] sm:max-w-[85vw] lg:max-h-[78vh] lg:max-w-[1100px]"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => onIndex((index - 1 + images.length) % images.length)}
              className="absolute left-1 grid h-10 w-10 place-items-center rounded-full bg-black/65 text-white shadow-lg backdrop-blur-sm transition hover:scale-105 hover:bg-black/80 sm:left-4 sm:h-12 sm:w-12"
              aria-label="Previous photo"
            >
              <i className="fa-solid fa-chevron-left" />
            </button>

            <button
              type="button"
              onClick={() => onIndex((index + 1) % images.length)}
              className="absolute right-1 grid h-10 w-10 place-items-center rounded-full bg-black/65 text-white shadow-lg backdrop-blur-sm transition hover:scale-105 hover:bg-black/80 sm:right-4 sm:h-12 sm:w-12"
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

      <style jsx global>{`
        .no-sb {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .no-sb::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>

      <main className="mt-20 bg-slate-50 pb-6 lg:pb-12">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          {/* breadcrumb */}
          <nav className="py-2 text-[12px] text-slate-500 sm:py-3 sm:text-[13px]" aria-label="Breadcrumb">
            <Link href="/" className="text-slate-500 no-underline hover:text-red-600">Home</Link>
            <span className="mx-1">/</span>
            <Link href="/tours" className="text-slate-500 no-underline hover:text-red-600">Tour Packages</Link>
            <span className="mx-1">/</span>
            <span className="text-slate-800">{tour.title}</span>
          </nav>

          {/* ================= header ================= */}
          <header className="mb-3 flex flex-col gap-2 sm:mb-5 sm:gap-3 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <h1 className="m-0 text-[21px] font-extrabold leading-tight text-slate-900 sm:text-[32px] lg:text-[36px]">{tour.title}</h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-slate-600 sm:mt-2 sm:gap-x-4 sm:text-[14px]">
                <span><i className="fa-solid fa-route mr-1.5 text-red-600" />{tour.from_city_name} → {tour.to_city_name}</span>
                <span><i className="fa-regular fa-calendar mr-1.5 text-red-600" />{durationText(tour)}</span>
                {tour.rating > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Stars value={tour.rating} size="text-[12px]" />
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
          <div className="relative mb-3 sm:mb-6">
            {/* mobile: slider + thumbs */}
            <div className="md:hidden">
              <MobileSlider images={photos} title={tour.title} />
            </div>

            {/* desktop: mosaic + lightbox */}
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
          <nav className="sticky top-16 md:top-20 z-30 -mx-3 mb-3 border-b border-slate-200 bg-slate-50/95 px-3 backdrop-blur sm:-mx-6 sm:mb-5 sm:px-6 lg:-mx-8 lg:px-8" aria-label="Sections">
            <div className="overflow-hidden">
            <ul className="no-sb m-0 -mb-6 flex list-none gap-0 overflow-x-auto p-0 pb-6 sm:gap-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {tabs.map((t) => (
                <li key={t.id} className="shrink-0">
                  <a href={`#${t.id}`} className="block border-b-2 border-transparent px-2.5 py-2 text-[12.5px] font-semibold text-slate-600 no-underline hover:border-red-600 hover:text-red-600 sm:px-4 sm:py-3 sm:text-[14px]">
                    {t.label}
                  </a>
                </li>
              ))}
            </ul>
            </div>
          </nav>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
            {/* ================= main column ================= */}
            <div className="min-w-0 space-y-3 sm:space-y-5">
              {/* overview */}
              <Section id="overview" title="Overview" icon="fa-solid fa-compass">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5">
                  {facts.map((f) => (
                    <div key={f.label} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2 sm:gap-3 sm:rounded-xl sm:p-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-red-600 shadow-sm sm:h-9 sm:w-9">
                        <i className={`${f.icon} text-[13px] sm:text-[14px]`} />
                      </span>
                      <div className="min-w-0">
                        <p className="m-0 text-[11px] leading-tight text-slate-500">{f.label}</p>
                        <p className="m-0 truncate text-[13px] font-semibold leading-tight text-slate-900 sm:text-[14px]">{f.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {tour.short_description && (
                  <p className="mb-0 mt-3 text-[14px] font-medium leading-relaxed text-slate-800 sm:mt-5 sm:text-[16px]">{tour.short_description}</p>
                )}
                {tour.description && (
                  <div
                    className="mt-2 text-[13.5px] leading-relaxed text-slate-600 sm:mt-3 sm:text-[15px] [&_p]:mb-2 sm:[&_p]:mb-3"
                    dangerouslySetInnerHTML={{ __html: tour.description.includes("<") ? tour.description : tour.description.replace(/\n/g, "<br/>") }}
                  />
                )}

                {tour.highlights.length > 0 && (
                  <div className="mt-3 grid gap-2 sm:mt-5 sm:grid-cols-2 sm:gap-3">
                    {tour.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50/40 p-2.5 sm:gap-3 sm:p-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-red-600 shadow-sm sm:h-10 sm:w-10">
                          <i className={`${faIcon(h.icon)} text-[14px] sm:text-[15px]`} />
                        </span>
                        <div className="min-w-0">
                          <p className="m-0 text-[14px] font-semibold leading-snug text-slate-900">{h.title}</p>
                          {h.subtitle && <p className="m-0 text-[12.5px] leading-snug text-slate-600 sm:text-[13px]">{h.subtitle}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tour.hotel_optional && hotels.length > 0 && (
                  <p className="mb-0 mt-3 flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2 text-[12.5px] text-blue-800 sm:mt-4 sm:text-[13px]">
                    <i className="fa-solid fa-circle-info mt-0.5" /> Hotel is optional. Choose a stay or book the cab only on the next step.
                  </p>
                )}
              </Section>

              {/* itinerary */}
              {tour.itinerary.length > 0 && (
                <Section className="p-0" id="itinerary" title="Day-wise Itinerary" icon="fa-solid fa-map-location-dot">
                  <ol className="m-0 list-none space-y-2 p-0 sm:space-y-3">
                    {tour.itinerary.map((d, i) => (
                      <li key={i}>
                        <details open={i === 0} className="group overflow-hidden rounded-xl border-[0.5px] border-slate-200 bg-white [&_summary::-webkit-details-marker]:hidden">
                          <summary className="flex cursor-pointer list-none items-start justify-between gap-3 p-3 sm:p-4">
                            <div className="min-w-0">
                   
                              <h3 className="m-0 text-[14.5px] font-bold leading-snug text-slate-900 sm:text-[17px]">{d.title || `Day ${d.day ?? i + 1}`}</h3>
                              {(d.distance || d.duration || (d.items?.length ?? 0) > 0) && (
                                <p className="m-0 mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[12px] text-slate-500 sm:gap-x-4 sm:text-[13px]">
                                  {d.distance && <span><i className="fa-solid fa-road mr-1" />{d.distance}</span>}
                                  {d.duration && <span><i className="fa-regular fa-clock mr-1" />{d.duration}</span>}
                                  {(d.items?.length ?? 0) > 0 && <span><i className="fa-solid fa-list-check mr-1" />{d.items!.length} stops</span>}
                                </p>
                              )}
                            </div>
                            <i className="fa-solid fa-chevron-down mt-1.5 text-[12px] text-slate-400 transition-transform group-open:rotate-180" />
                          </summary>

                          <div className="border-t border-slate-100 p-3 sm:p-4">
                            <div className={`grid gap-3 sm:gap-4 ${d.image ? "md:grid-cols-[minmax(0,1fr)_240px]" : ""}`}>
                              {d.image && (
                                <img src={d.image} alt={d.title || ""} loading="lazy" className="aspect-[16/9] w-full rounded-lg object-cover md:order-2 md:aspect-[3/4]" />
                              )}
                              <div className="min-w-0 md:order-1">
                                {d.summary && <p className="mb-2 mt-0 text-[13.5px] leading-relaxed text-slate-700 sm:mb-3 sm:text-[14px]">{d.summary}</p>}
                                {d.items && d.items.length > 0 && (
                                  <ul className="m-0 list-none space-y-2 p-0 sm:space-y-3">
                                    {d.items.map((it, j) => (
                                      <li key={j} className="flex gap-2.5 sm:gap-3">
                                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-600" />
                                        <div className="min-w-0">
                                          <p className="m-0 text-[13.5px] font-semibold leading-snug text-slate-900 sm:text-[14px]">{it.title}</p>
                                          {it.description && <p className="m-0 mt-0.5 text-[12.5px] leading-relaxed text-slate-600 sm:text-[13px]">{it.description}</p>}
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
                  <div className="-mx-3 overflow-hidden sm:mx-0 sm:overflow-visible">
                  <div className="no-sb -mb-6 flex gap-2.5 overflow-x-auto px-3 pb-6 sm:mb-0 sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                    {tour.places_covered.map((p, i) => (
                      <figure key={i} className="m-0 w-32 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white sm:w-auto">
                        {p.image ? (
                          <img src={p.image} alt={p.name || ""} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                        ) : (
                          <div className="grid aspect-[4/3] w-full place-items-center bg-red-50 text-red-600">
                            <i className={`${faIcon(p.icon)} text-[24px]`} />
                          </div>
                        )}
                        <figcaption className="px-2 py-1.5 text-[12.5px] font-semibold leading-tight text-slate-800 sm:px-2.5 sm:py-2 sm:text-[13px]">{p.name}</figcaption>
                      </figure>
                    ))}
                  </div>
                  </div>
                </Section>
              )}

              {/* inclusions / exclusions */}
              {(tour.inclusions.length > 0 || tour.exclusions.length > 0) && (
                <Section id="inclusions" title="What's Included" icon="fa-solid fa-clipboard-check">
                  {/* mobile: accordion */}
                  <div className="space-y-2 sm:hidden">
                    {tour.inclusions.length > 0 && (
                      <Acc title="Inclusions" tone="yes">
                        <CheckList items={tour.inclusions} tone="yes" />
                      </Acc>
                    )}
                    {tour.exclusions.length > 0 && (
                      <Acc title="Exclusions" tone="no">
                        <CheckList items={tour.exclusions} tone="no" />
                      </Acc>
                    )}
                  </div>

                  {/* sm+: two columns */}
                  <div className="hidden gap-5 sm:grid sm:grid-cols-2">
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
                  <Acc title={`${tour.important_notes.length} important notes`}>
                    <ul className="m-0 list-none space-y-2 p-0">
                      {tour.important_notes.map((n, i) => (
                        <li key={i} className="flex gap-2.5 text-[13.5px] leading-relaxed text-slate-700 sm:gap-3 sm:text-[14px]">
                          <i className="fa-solid fa-triangle-exclamation mt-1 text-[12px] text-amber-500" />
                          <span>{n}</span>
                        </li>
                      ))}
                    </ul>
                  </Acc>
                </Section>
              )}

              {/* faqs */}
              {tour.faqs.length > 0 && (
                <Section id="faqs" title="Frequently Asked Questions" icon="fa-regular fa-circle-question">
                  <div className="space-y-2 sm:space-y-2.5">
                    {tour.faqs.map((f, i) => (
                      <details key={i} className="group rounded-xl border border-slate-200 bg-white px-3 py-2.5 open:border-red-200 open:bg-red-50/30 sm:px-4 sm:py-3 [&_summary::-webkit-details-marker]:hidden">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[13.5px] font-semibold text-slate-900 sm:text-[15px]">
                          {f.question}
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 transition-transform group-open:rotate-45 sm:h-7 sm:w-7">
                            <i className="fa-solid fa-plus text-[10px] text-slate-600 sm:text-[11px]" />
                          </span>
                        </summary>
                        <p className="mb-0 mt-2 text-[13.5px] leading-relaxed text-slate-600 sm:text-[14px]">{f.answer}</p>
                      </details>
                    ))}
                  </div>
                </Section>
              )}

              {/* mobile / tablet booking card (after FAQs, not fixed) */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:hidden">
                <div className="flex items-center justify-between gap-3 bg-gradient-to-br from-red-600 to-red-700 px-4 py-3 text-white">
                  <div className="min-w-0">
                    <p className="m-0 text-[11px] opacity-90">Starting from</p>
                    <p className="m-0 text-[24px] font-extrabold leading-tight">{from ? inr(from) : "On request"}</p>
                  </div>
                  <p className="m-0 text-right text-[11.5px] leading-snug opacity-90">
                    {tour.days}D / {tour.nights}N<br />{tripTypeText(tour)}
                  </p>
                </div>
                <div className="flex items-center gap-2 p-3">
                  <a href={whatsapp} target="_blank" rel="noreferrer" className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-slate-300 text-green-600 no-underline" aria-label="Ask on WhatsApp">
                    <i className="fa-brands fa-whatsapp text-[20px]" />
                  </a>
                  <Link href={bookHref} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-[14px] font-semibold text-white no-underline hover:bg-red-700 hover:text-white">
                    Select Vehicle &amp; Hotel <i className="fa-solid fa-arrow-right" />
                  </Link>
                </div>
              </div>
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
      </main>

      {photo !== null && <Lightbox images={photos} index={photo} onClose={() => setPhoto(null)} onIndex={setPhoto} />}
    </>
  );
}