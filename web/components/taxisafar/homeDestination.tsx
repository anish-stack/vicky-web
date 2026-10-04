import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://webapi.taxisafar.com";
const LIST_URL = `${API_URL}/api/tour-package`;
const DETAIL_PATH = (slug: string) => `/tour/${slug}`;
const VIEW_ALL_PATH = "/tours";
const FALLBACK_IMG = "/images/tour-placeholder.jpg";
const HOME_LIMIT = 3; // cards on home page (use 6 for two rows)

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
    <div className="flex min-w-0 flex-col items-center gap-1.5 px-0.5 text-center">
      <span className={`grid h-9 w-9 place-items-center rounded-full sm:h-11 sm:w-11 ${tone}`}>
        <i className={`${icon} text-[15px] sm:text-[18px]`} />
      </span>
      <span className="text-[10px] font-medium leading-tight text-slate-700 sm:text-[12px]">{label}</span>
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
          src={tour?.cover_image}
          alt={tour.title}
          loading="lazy"
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

        <div className="mt-3.5 grid grid-cols-5 divide-x divide-slate-200">
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

const HomeDestination = () => {
  const [tours, setTours] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    axios
      .get(LIST_URL, {
        params: { is_active: 1, is_featured: 1, items_per_page: HOME_LIMIT, sort: "sort_order" },
      })
      .then((res) => alive && setTours(res.data?.data || []))
      .catch(() => alive && setTours([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  if (!loading && tours.length === 0) return null;

  return (
    <Container>
      <div className="taxisafar-section">
        <div className="taxisafar-destination">
          <h3 className="taxisafar-title text-center">Popular Tour Packages</h3>
          <p className="taxisafar-description mx-auto mt-3 max-w-2xl text-center">
            Handpicked road trips with private cabs, verified drivers and optional hotel stays.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-6 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: HOME_LIMIT }).map((_, i) => <CardSkeleton key={i} />)
              : tours.map((t) => <TourCard key={t.id} tour={t} />)}
          </div>

          <div className="mt-6 text-center sm:mt-8">
                <a
              href={VIEW_ALL_PATH}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-red-600 px-6 py-2.5 text-[15px] font-semibold text-red-600 no-underline transition-colors hover:bg-red-600 hover:text-white sm:w-auto"
            >
              View All Tour Packages <i className="fa-solid fa-arrow-right" />
            </a>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default HomeDestination;