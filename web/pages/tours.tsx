"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { SocialLinks } from "@/components/tour/TourBits";

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
    hotel_options?: unknown[];
    days: number;
    nights: number;
    rating: string | number;
    review_count: number;
    is_featured?: boolean;
    startingPrice?: number;
    vehicle_options?: VehicleOption[];
    from_city_id?: number | string | null;
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

const durationShort = (t: TourPackage) => {
    const d = Number(t.days) || 1;
    const n = Number(t.nights) || 0;
    if (d === 1 && n === 0) return "1 Day Trip";
    return `${d} Day${d === 1 ? "" : "s"} / ${n} Night${n === 1 ? "" : "s"}`;
};

const hasHotel = (t: TourPackage) =>
    Boolean(t.hotel_optional) || (Array.isArray(t.hotel_options) && t.hotel_options.length > 0);

const badgeOf = (t: TourPackage): { text: string; cls: string } | null => {
    if (Number(t.review_count) >= 200 && Number(t.rating) >= 4.8) return { text: "Best Seller", cls: "bg-red-600" };
    if (t.is_featured) return { text: "Popular", cls: "bg-emerald-600" };
    return null;
};

function isValidTour(t: Partial<TourPackage>): t is TourPackage {
    return Boolean(t && t.id && t.slug && t.title);
}

/* ---------------- Hero / Filter section ---------------- */

type Filters = {
    city: string; // from_city_id (or city name when no id)
    duration: string; // "days-nights"
    pkg: string; // tour id
};

const EMPTY_FILTERS: Filters = { city: "", duration: "", pkg: "" };

type Opt = { value: string; label: string };

const cityKey = (t: TourPackage) => String(t.from_city_id || t.from_city_name || "").trim();
const durKey = (t: TourPackage) => `${Number(t.days) || 1}-${Number(t.nights) || 0}`;
const durLabel = (key: string) => {
    const [d, n] = key.split("-").map(Number);
    if (!n) return d <= 1 ? "Same Day" : `${d} Days`;
    return `${n} Night${n === 1 ? "" : "s"} ${d} Day${d === 1 ? "" : "s"}`;
};

/** Small dropdown with an optional search box (looks like the approved design). */
function FilterSelect({
    label,
    value,
    options,
    placeholder,
    searchPlaceholder,
    onChange,
    disabled,
}: {
    label: string;
    value: string;
    options: Opt[];
    placeholder: string;
    searchPlaceholder: string;
    onChange: (v: string) => void;
    disabled?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const off = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", off);
        return () => document.removeEventListener("mousedown", off);
    }, [open]);

    const current = options.find((o) => o.value === value);
    const shown = options.filter((o) => o.label.toLowerCase().includes(q.trim().toLowerCase()));

    return (
        <div ref={ref} className="relative min-w-0">
            <button
                type="button"
                disabled={disabled}
                onClick={() => {
                    setOpen((v) => !v);
                    setQ("");
                }}
                aria-haspopup="listbox"
                aria-expanded={open}
                className={`flex h-full w-full min-w-0 flex-col gap-0.5 rounded-xl border bg-white px-3 py-2 text-left shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-red-300 disabled:cursor-not-allowed disabled:opacity-60 ${
                    open ? "border-red-400" : "border-slate-200"
                }`}
            >
                <span className="truncate text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-[11px]">{label}</span>
                <span className="flex min-w-0 items-center justify-between gap-1">
                    <span className={`truncate text-[13px] font-semibold sm:text-sm ${current ? "text-slate-900" : "text-slate-500"}`}>
                        {current ? current.label : placeholder}
                    </span>
                    <i className={`fa-solid fa-chevron-down shrink-0 text-[10px] text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
                </span>
            </button>

            {open && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                    {options.length > 5 && (
                        <div className="border-b border-slate-100 p-2">
                            <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5">
                                <i className="fa-solid fa-magnifying-glass text-[12px] text-slate-400" />
                                <input
                                    autoFocus
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder={searchPlaceholder}
                                    className="h-9 w-full min-w-0 bg-transparent text-[13px] text-slate-900 outline-none placeholder:text-slate-400"
                                />
                            </div>
                        </div>
                    )}
                    <ul role="listbox" className="m-0 max-h-60 list-none overflow-y-auto p-1">
                        <li>
                            <button
                                type="button"
                                onClick={() => {
                                    onChange("");
                                    setOpen(false);
                                }}
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[13px] font-medium ${
                                    !value ? "bg-red-50 text-red-600" : "text-slate-600 hover:bg-slate-50"
                                }`}
                            >
                                {placeholder}
                                {!value && <i className="fa-solid fa-check" />}
                            </button>
                        </li>
                        {shown.map((o) => (
                            <li key={o.value}>
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={o.value === value}
                                    onClick={() => {
                                        onChange(o.value);
                                        setOpen(false);
                                    }}
                                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-medium ${
                                        o.value === value ? "bg-red-50 text-red-600" : "text-slate-800 hover:bg-slate-50"
                                    }`}
                                >
                                    <span className="min-w-0">{o.label}</span>
                                    {o.value === value && <i className="fa-solid fa-check shrink-0" />}
                                </button>
                            </li>
                        ))}
                        {shown.length === 0 && <li className="px-3 py-3 text-center text-[13px] text-slate-500">No match</li>}
                    </ul>
                </div>
            )}
        </div>
    );
}

function HeroSearch({
    all,
    filters,
    onChange,
    heading,
}: {
    all: TourPackage[];
    filters: Filters;
    onChange: (f: Filters) => void;
    heading: string;
}) {
    // Only values that really exist: city -> durations of that city -> packages of both.
    const cityOptions = useMemo<Opt[]>(() => {
        const seen = new Map<string, string>();
        all.forEach((t) => {
            const k = cityKey(t);
            if (k && !seen.has(k)) seen.set(k, t.from_city_name || k);
        });
        return Array.from(seen, ([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
    }, [all]);

    const byCity = useMemo(() => (filters.city ? all.filter((t) => cityKey(t) === filters.city) : all), [all, filters.city]);

    const durationOptions = useMemo<Opt[]>(() => {
        const seen = new Set<string>();
        byCity.forEach((t) => seen.add(durKey(t)));
        return Array.from(seen)
            .sort((a, b) => {
                const [da, na] = a.split("-").map(Number);
                const [db, nb] = b.split("-").map(Number);
                return da - db || na - nb;
            })
            .map((value) => ({ value, label: durLabel(value) }));
    }, [byCity]);

    const packageOptions = useMemo<Opt[]>(
        () => byCity.filter((t) => !filters.duration || durKey(t) === filters.duration).map((t) => ({ value: String(t.id), label: t.title })),
        [byCity, filters.duration]
    );

    return (
        <section className="relative sm:rounded-3xl">
            {/* banner bg: tablet/desktop only */}
            <div
                className="absolute inset-0 hidden overflow-hidden rounded-3xl sm:block"
                style={{
                    backgroundImage: `linear-gradient(90deg, rgba(15,23,42,0.75) 0%, rgba(15,23,42,0.35) 55%, rgba(15,23,42,0.05) 100%), url(${HERO_IMG})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            />

            <div className="relative sm:px-10 sm:py-12 lg:py-14">
                {/* banner text: tablet/desktop only */}
                <div className="hidden sm:block">
                    <span className="inline-block rounded-md bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                        Outstation Taxi
                    </span>
                    <h1 className="mt-3 text-4xl font-extrabold leading-tight text-white lg:text-5xl">{heading}</h1>
                    <p className="mt-1.5 text-lg font-medium text-slate-100">Safe Journey, Happy Memories</p>
                    <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-white">
                        {[
                            { icon: "fa-solid fa-shield-halved", label: "Verified Drivers" },
                            { icon: "fa-solid fa-car-side", label: "Well Maintained Vehicles" },
                            { icon: "fa-solid fa-headset", label: "24x7 Support" },
                        ].map((b) => (
                            <div key={b.label} className="flex items-center gap-2 text-sm font-medium">
                                <i className={`${b.icon} text-emerald-400`} />
                                {b.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* filters: pickup city -> duration -> package (no search button; applies instantly) */}
                <div className="relative z-20 grid grid-cols-3 gap-1.5 sm:mt-6 sm:gap-3 sm:rounded-2xl sm:bg-white/95 sm:p-3 sm:shadow-xl">
                    <FilterSelect
                        label="Pickup City"
                        value={filters.city}
                        options={cityOptions}
                        placeholder="All cities"
                        searchPlaceholder="Search city"
                        onChange={(city) => onChange({ city, duration: "", pkg: "" })}
                    />
                    <FilterSelect
                        label="Tour Duration"
                        value={filters.duration}
                        options={durationOptions}
                        placeholder="Any duration"
                        searchPlaceholder="Search duration"
                        onChange={(duration) => onChange({ ...filters, duration, pkg: "" })}
                    />
                    <FilterSelect
                        label="Tour Package"
                        value={filters.pkg}
                        options={packageOptions}
                        placeholder="All packages"
                        searchPlaceholder="Search package"
                        onChange={(pkg) => onChange({ ...filters, pkg })}
                    />
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

function Feature({ icon, label, tone }: { icon: string; label: string; tone: string }) {
    return (
        <div className="flex min-w-0 flex-col items-center gap-1 px-1 py-1 text-center">
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full sm:h-9 sm:w-9 ${tone}`}>
                <i className={`${icon} text-[13px] sm:text-[15px]`} />
            </span>
            <span className="max-w-[84px] text-[9px] font-medium leading-[1.15] text-slate-700 sm:max-w-[96px] sm:text-[10px] lg:text-[11px]">
                {label}
            </span>
        </div>
    );
}

/* ----- mobile compact card (2 per row) ----- */
function TourCardCompact({ tour }: { tour: TourPackage }) {
    const price = priceOf(tour);
    const rating = Number(tour.rating) || 0;
    const href = DETAIL_PATH(tour.slug);
    const badge = badgeOf(tour);
    const hotel = hasHotel(tour);

    return (
        <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <a href={href} className="relative block overflow-hidden">
                <img
                    src={tour.cover_image || FALLBACK_IMG}
                    alt={tour.title}
                    loading="lazy"
                    onError={(e) => ((e.currentTarget as HTMLImageElement).src = FALLBACK_IMG)}
                    className="aspect-[4/3] w-full object-cover"
                />
               
            </a>

            <div className="flex flex-1 flex-col p-2">
                <a href={href} className="text-inherit no-underline">
                    <h4 className="m-0 line-clamp-2 text-[13px] font-bold leading-snug text-slate-900">{tour.title}</h4>
                </a>
                <p className="m-0 mt-0.5 text-[11px] text-slate-600">{durationShort(tour)}</p>

                <div className="mt-1.5 flex flex-wrap gap-x-2.5 gap-y-1 text-[10px] text-slate-600">
                    <span className="inline-flex items-center gap-1">
                        <i className={`fa-solid ${tour.trip_type === "oneWay" ? "fa-arrow-right" : "fa-car-side"} text-[10px] text-slate-500`} />
                        {tour.trip_type === "oneWay" ? "One Way" : "Round Trip"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <i className={`fa-solid ${hotel ? "fa-hotel" : "fa-bed"} text-[10px] text-slate-500`} />
                        {hotel ? "Hotel Available" : "No Hotel"}
                    </span>
                </div>

                <div className="mt-auto flex items-end justify-between gap-1 pt-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-800">
                        <i className="fa-solid fa-star text-[10px] text-amber-400" />
                        {rating.toFixed(1)}
                        {tour.review_count > 0 && (
                            <span className="text-[9.5px] font-normal text-slate-500">({reviewsText(tour.review_count)})</span>
                        )}
                    </span>
                    <span className="text-right leading-none">
                        {price ? (
                            <>
                                <span className="text-[10px] font-semibold text-slate-700">From </span>
                                <span className="text-[14px] font-extrabold text-red-600">{inr(price)}</span>
                            </>
                        ) : (
                            <span className="text-[11px] font-bold text-red-600">On request</span>
                        )}
                    </span>
                </div>
                <a

                    href={href}
                    className="mt-2 flex items-center justify-center gap-1.5 rounded-md border border-red-500 px-2 py-1.5 text-[11.5px] font-semibold text-red-600 no-underline transition-colors hover:bg-red-600 hover:text-white"
                >
                    View Details <i className="fa-solid fa-arrow-right text-[10px]" />
                </a>
            </div>
        </article>
    );
}

/* ----- tablet / desktop card ----- */
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
                    <h4 className="m-0 line-clamp-2 text-[17px] font-bold leading-snug text-slate-900 sm:text-[20px]">{tour.title}</h4>
                </a>
                {tour.short_description && (
                    <p className="mb-0 mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-slate-600 sm:text-[14px]">
                        {tour.short_description}
                    </p>
                )}
                <div className="mt-3 grid grid-cols-3 gap-y-3 rounded-xl border border-slate-200 bg-white px-2 py-2 sm:grid-cols-5 sm:divide-x sm:divide-slate-200">
                    <Feature label="Hotel Option" tone="bg-orange-50 text-orange-500" icon="fa-solid fa-hotel" />
                    <Feature label="Commercial Vehicle" tone="bg-blue-50 text-blue-600" icon="fa-solid fa-car" />
                    <Feature label="Verified Driver" tone="bg-green-50 text-green-600" icon="fa-solid fa-user-shield" />
                    <Feature
                        label={tour.trip_type === "oneWay" ? "One Way" : "Round Trip"}
                        tone="bg-violet-50 text-violet-600"
                        icon={`fa-solid ${tour.trip_type === "oneWay" ? "fa-arrow-right" : "fa-rotate"}`}
                    />
                    <Feature label={`${tour.days}D / ${tour.nights}N`} tone="bg-red-50 text-red-600" icon="fa-regular fa-clock" />
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
        <div className="h-full animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white sm:rounded-2xl">
            <div className="aspect-[4/3] bg-slate-200 sm:aspect-[16/10]" />
            <div className="space-y-2 p-2 sm:space-y-3 sm:p-4">
                <div className="h-4 w-3/4 rounded bg-slate-200 sm:h-5" />
                <div className="h-3 w-1/2 rounded bg-slate-100 sm:h-4 sm:w-full" />
                <div className="hidden h-12 rounded bg-slate-100 sm:block" />
                <div className="h-7 rounded bg-slate-200 sm:h-10" />
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
                                className={`h-9 min-w-9 rounded-lg px-3 text-sm font-semibold transition-colors ${n === page ? "bg-red-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
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
    const router = useRouter();
    const category = router.query.category === "chardham" ? "chardham" : router.query.category === "taxi" ? "taxi" : "";

    const [all, setAll] = useState<TourPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

    // one request: every live tour (optionally of one tab). Filter dropdowns are built from this list,
    // so a city / duration / package without a created tour never shows up.
    useEffect(() => {
        if (!router.isReady) return;
        let ignore = false;

        async function load() {
            try {
                setLoading(true);
                setError(null);

                const params = new URLSearchParams({ all: "1", sort: "sort_order", is_active: "true" });
                if (category) params.set("category", category);

                const res = await fetch(`${LIST_URL}?${params.toString()}`);
                if (!res.ok) throw new Error(`Request failed (${res.status})`);

                const json: ApiListResponse = await res.json();
                if (!json.success) throw new Error(json.message || "Failed to load tour packages");

                if (!ignore) setAll((json.data || []).filter(isValidTour));
            } catch (err) {
                if (!ignore) setError(err instanceof Error ? err.message : "Something went wrong");
            } finally {
                if (!ignore) setLoading(false);
            }
        }

        setFilters(EMPTY_FILTERS);
        setPage(1);
        load();
        return () => {
            ignore = true;
        };
    }, [router.isReady, category]);

    const filtered = useMemo(
        () =>
            all.filter(
                (t) =>
                    (!filters.city || cityKey(t) === filters.city) &&
                    (!filters.duration || durKey(t) === filters.duration) &&
                    (!filters.pkg || String(t.id) === filters.pkg)
            ),
        [all, filters]
    );

    const total = filtered.length;
    const lastPage = Math.max(Math.ceil(total / PER_PAGE), 1);
    const cur = Math.min(page, lastPage);
    const tours = filtered.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);
    const pagination: Pagination = {
        page: cur,
        items_per_page: PER_PAGE,
        total,
        last_page: lastPage,
        from: total ? (cur - 1) * PER_PAGE + 1 : 0,
        to: Math.min(cur * PER_PAGE, total),
        has_prev: cur > 1,
        has_next: cur < lastPage,
        prev_page: cur > 1 ? cur - 1 : null,
        next_page: cur < lastPage ? cur + 1 : null,
    };

    const hasFilter = Boolean(filters.city || filters.duration || filters.pkg);

    const handleFilters = (f: Filters) => {
        setPage(1);
        setFilters(f);
    };

    const handlePageChange = (p: number) => {
        setPage(p);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const heading = category === "chardham" ? "Char Dham Yatra Packages" : "Tour Packages";

    return (
        <div className="mx-auto max-w-7xl px-2 pb-10 pt-20 sm:px-6 sm:py-24 lg:px-8">
            <HeroSearch all={all} filters={filters} onChange={handleFilters} heading={heading} />

            <div className="mb-3 mt-4 flex items-end justify-between gap-3 px-0.5 sm:mb-6 sm:mt-10 sm:px-0">
                <div className="min-w-0">
                    <h2 className="m-0 text-xl font-bold text-slate-900 sm:text-3xl">
                        {category === "chardham" ? "Popular Char Dham Packages" : "Popular Tour Packages"}
                    </h2>
                    <p className="m-0 mt-1 text-[12px] text-slate-500 sm:text-sm">
                        Handpicked packages for a comfortable and memorable journey
                    </p>
                    <span className="mt-2 block h-0.5 w-10 rounded bg-red-600" />
                </div>
                <div className="flex shrink-0 items-center gap-3">
                    {!loading && !error && (
                        <span className="hidden text-sm text-slate-500 sm:block">{total} package{total === 1 ? "" : "s"} found</span>
                    )}
                    {hasFilter && (
                        <button
                            type="button"
                            onClick={() => handleFilters(EMPTY_FILTERS)}
                            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-red-600 hover:underline sm:text-sm"
                        >
                            <i className="fa-solid fa-rotate-right" /> Clear Filter
                        </button>
                    )}
                </div>
            </div>

            {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <div className="grid grid-cols-2 gap-2 sm:gap-5 lg:grid-cols-3">
                {loading
                    ? Array.from({ length: PER_PAGE }).map((_, i) => <CardSkeleton key={i} />)
                    : tours.map((tour) => (
                        <React.Fragment key={tour.id}>
                            <div className="sm:hidden">
                                <TourCardCompact tour={tour} />
                            </div>
                            <div className="hidden sm:block">
                                <TourCard tour={tour} />
                            </div>
                        </React.Fragment>
                    ))}
            </div>

            {!loading && !error && tours.length === 0 && (
                <p className="mt-10 text-center text-slate-500">No tours match your selection — try clearing a filter.</p>
            )}

            {!loading && !error && total > 0 && <Pagination pagination={pagination} onPageChange={handlePageChange} />}

            <div className="mt-8 border-t border-slate-200 pt-6">
                <SocialLinks title="Follow us & chat with us" />
            </div>
        </div>
    );
};

export default Tours;