"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://webapi.taxisafar.com";
const LIST_URL = `${API_URL}/api/tour-package`;
const DETAIL_PATH = (slug: string) => `/tour/${slug}`;
const FALLBACK_IMG = "/images/tour-placeholder.jpg";
const HERO_IMG = "https://i.ibb.co/ksx3YMDc/d89fc405-9df4-41a4-8624-14e711575c99.png";
const PER_PAGE = 9;

type VehicleOption = { price?: number | string; isActive?: boolean };

type TourPackage = {
    id: number;
    title: string;
    slug: string;
    short_description?: string;
    cover_image?: string | null;
    trip_type: "roundTrip" | "oneWay";
    hotel_optional: boolean;
    days: number;
    nights: number;
    rating: string | number;
    review_count: number;
    startingPrice?: number;
    vehicle_options?: VehicleOption[];
    from_city_name?: string;
    to_city_name?: string;
};

type Pagination = {
    page: number;
    items_per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
    has_prev: boolean;
    has_next: boolean;
    prev_page: number | null;
    next_page: number | null;
};

type ApiListResponse = {
    success: boolean;
    data: Partial<TourPackage>[];
    pagination?: Pagination;
    message?: string;
};

type City = { id: number; name: string };

const inr = (n: number) => "₹" + Number(n || 0).toLocaleString("en-IN");

const priceOf = (t: TourPackage) => {
    if (t.startingPrice && t.startingPrice > 0) return t.startingPrice;
    const prices = (t.vehicle_options || [])
        .filter((v) => v?.isActive !== false)
        .map((v) => Number(v.price))
        .filter((p) => Number.isFinite(p) && p > 0);
    return prices.length ? Math.min(...prices) : 0;
};

const reviewsText = (n: number) =>
    n >= 1000 ? `${Math.floor(n / 1000)}k+` : n >= 50 ? `${Math.floor(n / 50) * 50}+` : `${n}`;

function isValidTour(t: Partial<TourPackage>): t is TourPackage {
    return Boolean(t && t.id && t.slug && t.title);
}

/* ---------------- Hero / Search section ---------------- */

type Filters = {
    from_city_id: string;
    search: string;
    trip_type: "" | "roundTrip" | "oneWay";
};

const TRIP_TYPE_LABELS: Record<Filters["trip_type"], string> = {
    "": "All Packages",
    roundTrip: "Round Trip",
    oneWay: "One Way",
};

function HeroSearch({
    cities,
    filters,
    onApply,
}: {
    cities: City[];
    filters: Filters;
    onApply: (f: Filters) => void;
}) {
    const [draft, setDraft] = useState<Filters>(filters);
    const [tripMenuOpen, setTripMenuOpen] = useState(false);
    const tripMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => setDraft(filters), [filters]);

    // Close the trip-type dropdown when clicking outside it
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (tripMenuRef.current && !tripMenuRef.current.contains(e.target as Node)) {
                setTripMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        // NOTE: no overflow-hidden here — that was clipping the dropdown menu.
        <section className="relative rounded-2xl sm:rounded-3xl">
            {/* Background image, clipped to rounded corners in its own layer */}
            <div
                className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden"
                style={{
                    backgroundImage: `linear-gradient(90deg, rgba(15,23,42,0.75) 0%, rgba(15,23,42,0.35) 55%, rgba(15,23,42,0.05) 100%), url(${HERO_IMG})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            />

            <div className="relative px-5 py-8 sm:px-10 sm:py-12 lg:py-14">
                <span className="inline-block rounded-md bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white sm:text-xs">
                    Outstation Taxi
                </span>

                <h1 className="mt-3 text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
                    Tour Packages
                </h1>
                <p className="mt-1.5 text-base font-medium text-slate-100 sm:text-lg">
                    Safe Journey, Happy Memories
                </p>

                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-white">
                    {[
                        { icon: "fa-solid fa-shield-halved", label: "Verified Drivers" },
                        { icon: "fa-solid fa-car-side", label: "Well Maintained Vehicles" },
                        { icon: "fa-solid fa-headset", label: "24x7 Support" },
                    ].map((b) => (
                        <div key={b.label} className="flex items-center gap-2 text-[13px] font-medium sm:text-sm">
                            <i className={`${b.icon} text-emerald-400`} />
                            {b.label}
                        </div>
                    ))}
                </div>

                {/* Search bar */}
                <div className="relative z-10 mt-6 grid grid-cols-1 gap-2 rounded-2xl bg-white p-2.5 shadow-xl sm:grid-cols-[1fr_1fr_1fr_auto] sm:gap-0 sm:p-2">
                    <label className="flex flex-col gap-1 rounded-xl px-3 py-2 sm:border-r sm:border-slate-200">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Pickup City
                        </span>
                        <select
                            className="appearance-none bg-transparent text-sm font-semibold text-slate-900 outline-none focus:outline-none"
                            value={draft.from_city_id}
                            onChange={(e) => setDraft((d) => ({ ...d, from_city_id: e.target.value }))}
                        >
                            <option value="">Select city</option>
                            {cities.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="flex flex-col gap-1 rounded-xl px-3 py-2 sm:border-r sm:border-slate-200">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Tour Destination
                        </span>
                        <input
                            type="text"
                            placeholder="Any Destination"
                            className="bg-transparent text-sm font-semibold text-slate-900 outline-none focus:outline-none placeholder:text-slate-400 placeholder:font-medium"
                            value={draft.search}
                            onChange={(e) => setDraft((d) => ({ ...d, search: e.target.value }))}
                        />
                    </label>

                    <div ref={tripMenuRef} className="relative flex flex-col gap-1 rounded-xl px-3 py-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Tour Packages
                        </span>
                        <button
                            type="button"
                            onClick={() => setTripMenuOpen((v) => !v)}
                            className="flex items-center justify-between rounded-md text-left text-sm font-semibold text-slate-900 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                        >
                            {TRIP_TYPE_LABELS[draft.trip_type]}
                            <i
                                className={`fa-solid fa-chevron-down ml-2 text-[10px] text-slate-400 transition-transform ${tripMenuOpen ? "rotate-180" : ""
                                    }`}
                            />
                        </button>

                        {tripMenuOpen && (
                            <div className="absolute left-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-2xl">
                                {(Object.keys(TRIP_TYPE_LABELS) as Filters["trip_type"][]).map((key) => (
                                    <button
                                        key={key || "all"}
                                        type="button"
                                        onClick={() => {
                                            setDraft((d) => ({ ...d, trip_type: key }));
                                            setTripMenuOpen(false);
                                        }}
                                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-slate-700 outline-none transition-colors hover:bg-slate-50 focus:outline-none"
                                    >
                                        {TRIP_TYPE_LABELS[key]}
                                        {draft.trip_type === key && <i className="fa-solid fa-check text-red-600" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setTripMenuOpen(false);
                            onApply(draft);
                        }}
                        className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white outline-none transition-colors hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 sm:m-1"
                    >
                        View Packages <i className="fa-solid fa-arrow-right" />
                    </button>
                </div>
            </div>
        </section>
    );
}

/* ---------------- Cards ---------------- */

function Stars({ value }: { value: number }) {
    return (
        <div className="flex gap-1" aria-label={`${value} out of 5`}>
            {[1, 2, 3, 4, 5].map((i) => {
                const cls =
                    value >= i ? "fa-solid fa-star" : value >= i - 0.5 ? "fa-solid fa-star-half-stroke" : "fa-regular fa-star";
                return <i key={i} className={`${cls} text-[14px] text-amber-400 sm:text-[16px]`} />;
            })}
        </div>
    );
}

function Feature({
  icon,
  label,
  tone,
}: {
  icon: string;
  label: string;
  tone: string;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1 px-1 py-1 text-center">
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full sm:h-9 sm:w-9 ${tone}`}
      >
        <i className={`${icon} text-[13px] sm:text-[15px]`} />
      </span>

      <span className="max-w-[84px] text-[9px] font-medium leading-[1.15] text-slate-700 sm:max-w-[96px] sm:text-[10px] lg:text-[11px]">
        {label}
      </span>
    </div>
  );
}

function TourCard({ tour }: { tour: TourPackage }) {
    const price = priceOf(tour);
    const rating = Number(tour.rating) || 0;
    const href = DETAIL_PATH(tour.slug);

    return (
        <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
            <a href={href} className="block overflow-hidden">
                <img
                    src={tour.cover_image || FALLBACK_IMG}
                    alt={tour.title}
                    loading="lazy"
                    onError={(e) => ((e.currentTarget as HTMLImageElement).src = FALLBACK_IMG)}
                    className="aspect-[16/10] w-full object-cover transition-transform duration-500 hover:scale-105"
                />
            </a>

            <div className="flex flex-1 flex-col p-3.5 sm:p-4">
                <a href={href} className="text-inherit no-underline">
                    <h4 className="m-0 line-clamp-2 text-[17px] font-bold leading-snug text-slate-900 sm:text-[20px]">
                        {tour.title}
                    </h4>
                </a>
                {tour.short_description && (
                    <p className="mb-0 mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-slate-600 sm:text-[14px]">
                        {tour.short_description}
                    </p>
                )}
<div className="mt-3 grid grid-cols-3 gap-y-3 rounded-xl border border-slate-200 bg-white px-2 py-2 sm:grid-cols-5 sm:divide-x sm:divide-slate-200">
  <Feature
    label="Hotel Option"
    tone="bg-orange-50 text-orange-500"
    icon="fa-solid fa-hotel"
  />

  <Feature
    label="Commercial Vehicle"
    tone="bg-blue-50 text-blue-600"
    icon="fa-solid fa-car"
  />

  <Feature
    label="Verified Driver"
    tone="bg-green-50 text-green-600"
    icon="fa-solid fa-user-shield"
  />

  <Feature
    label={tour.trip_type === "oneWay" ? "One Way" : "Round Trip"}
    tone="bg-violet-50 text-violet-600"
    icon={`fa-solid ${
      tour.trip_type === "oneWay"
        ? "fa-arrow-right"
        : "fa-rotate"
    }`}
  />

  <Feature
    label={`${tour.days}D / ${tour.nights}N`}
    tone="bg-red-50 text-red-600"
    icon="fa-regular fa-clock"
  />
</div>
                <div className="mt-3.5 flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2 text-[12px] leading-snug text-blue-800 sm:text-[13px]">
                    <i className="fa-solid fa-circle-info mt-0.5" />
                    <span>
                        {tour.hotel_optional ? "Hotel Include / Not Include options available" : "Hotel stay included in package"}
                    </span>
                </div>

                <div className="mt-auto flex items-center border-t border-slate-100 pt-3.5">
                    <div className="min-w-0 flex-1 pr-3">
                        <p className="m-0 text-[13px] font-semibold text-slate-800">Taxi Charge</p>
                        <p className="m-0 text-[24px] font-extrabold leading-tight text-red-600 sm:text-[28px]">
                            {price ? inr(price) : "On request"}
                        </p>
                        <p className="m-0 text-[12px] font-medium text-slate-700">All Including</p>
                    </div>
                    <div className="flex-1 border-l border-slate-200 pl-3 sm:pl-4">
                        <div className="flex flex-wrap items-center gap-x-1.5">

                            <span className="text-[16px] font-bold text-slate-900 sm:text-[18px]">{rating.toFixed(1)}</span>
                            {tour.review_count > 0 && (
                                <span className="text-[11px] text-slate-600 sm:text-[13px]">({reviewsText(tour.review_count)} Reviews)</span>
                            )}
                        </div>
                        <div className="mt-1.5">
                            <Stars value={rating} />
                        </div>
                    </div>
                </div>
                <a

                    href={href}
                    className="mt-3.5 flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-[15px] font-semibold text-white no-underline transition-colors hover:bg-red-700 hover:text-white sm:py-3 sm:text-[16px]"
                >
                    View Details &amp; Book Now <i className="fa-solid fa-arrow-right" />
                </a>
            </div>
        </article>
    );
}

function CardSkeleton() {
    return (
        <div className="h-full animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="aspect-[16/10] bg-slate-200" />
            <div className="space-y-3 p-4">
                <div className="h-5 w-3/4 rounded bg-slate-200" />
                <div className="h-4 w-full rounded bg-slate-100" />
                <div className="h-12 rounded bg-slate-100" />
                <div className="h-10 rounded bg-slate-200" />
            </div>
        </div>
    );
}

/* ---------------- Pagination ---------------- */

function Pagination({ pagination, onPageChange }: { pagination: Pagination; onPageChange: (p: number) => void }) {
    const { page, last_page, has_prev, has_next, prev_page, next_page, from, to, total } = pagination;

    const pageNumbers = useMemo(() => {
        const span = 1;
        const nums = new Set<number>([1, last_page, page]);
        for (let i = page - span; i <= page + span; i++) {
            if (i > 0 && i <= last_page) nums.add(i);
        }
        return Array.from(nums).sort((a, b) => a - b);
    }, [page, last_page]);

    if (last_page <= 1) return null;

    let prevShown = 0;

    return (
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row">
            <p className="text-sm text-slate-500">
                Showing <span className="font-semibold text-slate-700">{from}</span>–
                <span className="font-semibold text-slate-700">{to}</span> of{" "}
                <span className="font-semibold text-slate-700">{total}</span> packages
            </p>

            <nav className="flex items-center gap-1" aria-label="Pagination">
                <button
                    type="button"
                    disabled={!has_prev}
                    onClick={() => prev_page && onPageChange(prev_page)}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Previous page"
                >
                    <i className="fa-solid fa-chevron-left text-xs" />
                </button>

                {pageNumbers.map((n) => {
                    const showEllipsis = n - prevShown > 1;
                    prevShown = n;
                    return (
                        <React.Fragment key={n}>
                            {showEllipsis && <span className="px-1 text-slate-400">…</span>}
                            <button
                                type="button"
                                onClick={() => onPageChange(n)}
                                aria-current={n === page ? "page" : undefined}
                                className={`h-9 min-w-9 rounded-lg px-3 text-sm font-semibold transition-colors ${n === page
                                        ? "bg-red-600 text-white"
                                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                {n}
                            </button>
                        </React.Fragment>
                    );
                })}

                <button
                    type="button"
                    disabled={!has_next}
                    onClick={() => next_page && onPageChange(next_page)}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Next page"
                >
                    <i className="fa-solid fa-chevron-right text-xs" />
                </button>
            </nav>
        </div>
    );
}

/* ---------------- Page ---------------- */

const Tours = () => {
    const [tours, setTours] = useState<TourPackage[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [cities, setCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<Filters>({ from_city_id: "", search: "", trip_type: "" });

    useEffect(() => {
        fetch(`${API_URL}/api/cities?items_per_page=200`)
            .then((r) => r.json())
            .then((j) => {
                const list = Array.isArray(j?.data) ? j.data : [];
                setCities(
                    list.map((c: any) => ({
                        id: c.id,
                        name: String(c.name || "").trim(),
                    }))
                );
            })
            .catch(() => setCities([]));
    }, []);

    useEffect(() => {
        let ignore = false;

        async function load() {
            try {
                setLoading(true);
                setError(null);

                const params = new URLSearchParams({
                    page: String(page),
                    items_per_page: String(PER_PAGE),
                    sort: "sort_order",
                    is_active: "true",
                });
                if (filters.search.trim()) params.set("search", filters.search.trim());
                if (filters.trip_type) params.set("trip_type", filters.trip_type);
                if (filters.from_city_id) params.set("from_city_id", filters.from_city_id);

                const res = await fetch(`${LIST_URL}?${params.toString()}`);
                if (!res.ok) throw new Error(`Request failed (${res.status})`);

                const json: ApiListResponse = await res.json();
                if (!json.success) throw new Error(json.message || "Failed to load tour packages");

                if (!ignore) {
                    setTours((json.data || []).filter(isValidTour));
                    setPagination(json.pagination || null);
                }
            } catch (err) {
                if (!ignore) setError(err instanceof Error ? err.message : "Something went wrong");
            } finally {
                if (!ignore) setLoading(false);
            }
        }

        load();
        return () => {
            ignore = true;
        };
    }, [page, filters]);

    const handleApplyFilters = (f: Filters) => {
        setPage(1);
        setFilters(f);
    };

    const handlePageChange = (p: number) => {
        setPage(p);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <HeroSearch cities={cities} filters={filters} onApply={handleApplyFilters} />

            <div className="mb-6 mt-10 flex items-end justify-between">
                <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Popular Tour Packages</h2>
                {pagination && !loading && (
                    <span className="hidden text-sm text-slate-500 sm:block">{pagination.total} packages found</span>
                )}
            </div>

            {error && (
                <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {loading
                    ? Array.from({ length: PER_PAGE }).map((_, i) => <CardSkeleton key={i} />)
                    : tours.map((tour) => <TourCard key={tour.id} tour={tour} />)}
            </div>

            {!loading && !error && tours.length === 0 && (
                <p className="mt-10 text-center text-slate-500">No tours match your search — try clearing a filter.</p>
            )}

            {!loading && pagination && (
                <Pagination pagination={pagination} onPageChange={handlePageChange} />
            )}
        </div>
    );
};

export default Tours;