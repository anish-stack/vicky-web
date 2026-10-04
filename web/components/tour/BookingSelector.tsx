"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FALLBACK_IMG,
  MAX_ROOMS,
  Selection,
  TourPackage,
  activeHotels,
  activeVehicles,
  hotelTotal,
  inr,
  SIMILAR_TAXI_TEXT,
  selectionQuery,
} from "@/lib/tourPackage";

const NO_SB = { scrollbarWidth: "none", msOverflowStyle: "none" } as const;

function Box({ id, icon, title, sub, children }: { id: string; icon: string; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-3 sm:rounded-2xl sm:p-5">
      <h2 className="m-0 flex items-center gap-2 text-[16px] font-bold text-slate-900 sm:text-[19px]">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-red-50 text-red-600">
          <i className={`${icon} text-[12px]`} />
        </span>
        {title}
      </h2>
      {sub && <p className="m-0 mt-1 text-[12px] text-slate-500 sm:text-[13px]">{sub}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Stepper({ value, min, max, onChange, label }: { value: number; min: number; max: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="inline-flex items-center rounded-lg border border-slate-300 bg-white" role="group" aria-label={label}>
      <button type="button" className="grid h-8 w-8 place-items-center text-slate-700 disabled:opacity-30" disabled={value <= min} onClick={() => onChange(value - 1)} aria-label={`Fewer ${label}`}>
        <i className="fa-solid fa-minus text-[11px]" />
      </button>
      <span className="w-7 text-center text-[14px] font-semibold tabular-nums">{value}</span>
      <button type="button" className="grid h-8 w-8 place-items-center text-slate-700 disabled:opacity-30" disabled={value >= max} onClick={() => onChange(value + 1)} aria-label={`More ${label}`}>
        <i className="fa-solid fa-plus text-[11px]" />
      </button>
    </div>
  );
}

export default function BookingSelector({ tour, initial }: { tour: TourPackage; initial: Selection }) {
  const router = useRouter();
  const vehicles = useMemo(() => activeVehicles(tour), [tour]);
  const hotels = useMemo(() => activeHotels(tour), [tour]);
const [sel, setSel] = useState<Selection>(() => ({
  ...initial,
  v: vehicles.some((v) => v.idx === initial.v)
    ? initial.v
    : null,
  h: "none",
}));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hotelPhoto, setHotelPhoto] = useState<Record<number, number>>({});

  const vehicle = vehicles.find((v) => v.idx === sel.v) || null;
  const hotel = typeof sel.h === "number" ? hotels.find((h) => h.idx === sel.h) || null : null;
  const total = (vehicle?.price || 0) + hotelTotal(hotel, sel.r);
  const hotelsExist = hotels.length > 0;

  const set = (patch: Partial<Selection>) => {
    setSel((s) => ({ ...s, ...patch }));
    setErrors((e) => {
      const n = { ...e };
      Object.keys(patch).forEach((k) => delete n[k]);
      return n;
    });
  };

const submit = () => {

  const e: Record<string, string> = {};

  if (sel.v === null) {
    e.v = "Please select a vehicle";
  }

  // if (hotelsExist && sel.h === null) {
  //   e.h = tour.hotel_optional
  //     ? "Select a hotel or choose No Hotel Required"
  //     : "Please select a hotel";
  // }

  setErrors(e);

  if (Object.keys(e).length) {
    const first = ["v", "h"].find((k) => e[k]);

    document
      .getElementById(`sec-${first}`)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    return;
  }

  const final: Selection = {
    ...sel,
    h: hotelsExist ? sel.h : "none",
    r: hotel ? sel.r : 1,
  };

  const query = selectionQuery(final);

  const url = `/tour/${tour.slug}/summary?${query}`;

  router.push(url);
};
  return (
    <main className="mt-20 bg-slate-50 pb-6 lg:pb-10">
      <div className="mx-auto max-w-6xl px-3 py-3 sm:px-6 sm:py-6">
        <Link href={`/tour/${tour.slug}`} className="mb-2 inline-flex items-center gap-1.5 text-[13px] text-slate-600 no-underline hover:text-red-600">
          <i className="fa-solid fa-arrow-left" /> Back to tour details
        </Link>

        {/* step indicator */}
        <ol className="m-0 mb-3 flex list-none items-center gap-2 p-0 text-[12px] font-semibold sm:mb-4 sm:text-[13px]">
          <li className="flex items-center gap-1.5 text-red-600"><span className="grid h-5 w-5 place-items-center rounded-full bg-red-600 text-[11px] text-white">1</span>Select</li>
          <li className="h-px w-8 bg-slate-300" aria-hidden />
          <li className="flex items-center gap-1.5 text-slate-400"><span className="grid h-5 w-5 place-items-center rounded-full bg-slate-200 text-[11px] text-slate-500">2</span>Summary</li>
        </ol>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6">
          <div className="min-w-0 space-y-3 sm:space-y-4">
            {/* vehicles */}
            <Box id="sec-v" icon="fa-solid fa-car" title="All Vehicle With luggage Carrier" sub="Choose your preferred vehicle for this tour">
              {errors.v && <p className="mb-2 mt-0 rounded-md bg-red-50 px-3 py-2 text-[13px] text-red-700">{errors.v}</p>}
              {vehicles.length === 0 ? (
                <p className="m-0 text-[14px] text-slate-500">Vehicles for this tour will be confirmed by our team.</p>
              ) : (
                <div className="space-y-2" role="radiogroup" aria-label="Vehicle">
                  {vehicles.map((v) => {
                    const on = sel.v === v.idx;
                    return (
                      <button
                        key={v.idx}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => set({ v: v.idx })}
                        className={`flex w-full items-center gap-2.5 rounded-xl  p-2.5 text-left transition-colors sm:gap-4 sm:p-3 ${on ? "border-red-600 bg-red-50/40" : "border-slate-200 bg-white hover:border-slate-300"}`}
                      >
                        <img src={v.image || FALLBACK_IMG} alt="" loading="lazy" className="h-16 w-24 shrink-0 rounded-md bg-slate-50 object-contain sm:h-24 sm:w-36" />
                        <div className="min-w-0 flex-1">
                          <p className="m-0 text-[14px] font-bold leading-tight text-slate-900 sm:text-[16px]">{v.label}</p>
                          <p className="m-0 text-[10.5px] leading-tight text-slate-500 sm:text-[11.5px]">{SIMILAR_TAXI_TEXT}</p>
                          <p className="m-0 mt-0.5 flex flex-wrap gap-x-2.5 gap-y-0.5 text-[11.5px] text-slate-600 sm:text-[13px]">
                            {v.seats && <span><i className="fa-solid fa-user mr-1 text-slate-400" />{v.seats}</span>}
                            {v.suitcases && <span><i className="fa-solid fa-suitcase mr-1 text-slate-400" />{v.suitcases}</span>}
                            {v.ac && <span><i className="fa-regular fa-snowflake mr-1 text-slate-400" />AC</span>}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="m-0 text-[15px] font-extrabold leading-tight text-red-600 sm:text-[18px]">{inr(v.price)}</p>
                          <p className="m-0 text-[10.5px] text-slate-500 sm:text-[11px]">All Including</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </Box>

            {/* hotels */}
            {hotelsExist && (
              <Box
                id="sec-h"
                icon="fa-solid fa-hotel"
                title={`Select Your Hotel${tour.nights > 0 ? ` (${tour.nights} Night${tour.nights === 1 ? "" : "s"})` : ""}`}
                sub="Choose your preferred hotel for this tour"
              >
                {errors.h && <p className="mb-2 mt-0 rounded-md bg-red-50 px-3 py-2 text-[13px] text-red-700">{errors.h}</p>}
                <div className="space-y-2" role="radiogroup" aria-label="Hotel">
                  {hotels.map((h) => {
                    const on = sel.h === h.idx;
                    const photos = h.images.length ? h.images : [FALLBACK_IMG];
                    const pi = Math.min(hotelPhoto[h.idx] || 0, photos.length - 1);
                    return (
                      <div key={h.idx} role="radio" aria-checked={on} onClick={() => set({ h: h.idx })} className={`cursor-pointer rounded-xl border-2 p-2.5 transition-colors sm:p-3 ${on ? "border-red-600 bg-red-50/40" : "border-slate-200 bg-white"}`}>
                        <div className="flex gap-2.5 sm:gap-4">
                          <div className="w-32 shrink-0 sm:w-52">
                            <img src={photos[pi]} alt={h.name} loading="lazy" className="aspect-[4/3] w-full rounded-md object-cover" />
                            {photos.length > 1 && (
                              <div className="mt-1 overflow-hidden">
                                <div className="-mb-6 flex gap-1 overflow-x-auto pb-6" style={NO_SB}>
                                  {photos.map((p, i) => (
                                    <button key={i} type="button" onClick={(e) => { e.stopPropagation(); setHotelPhoto((s) => ({ ...s, [h.idx]: i })); }} className={`shrink-0 overflow-hidden rounded ${i === pi ? "ring-2 ring-red-500" : "opacity-70"}`} aria-label={`Photo ${i + 1}`}>
                                      <img src={p} alt="" loading="lazy" className="h-6 w-8 object-cover sm:h-8 sm:w-10" />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => set({ h: h.idx })}
                            className="min-w-0 flex-1 border-none bg-transparent p-0 text-left outline-none focus:outline-none focus-visible:outline-none focus:ring-0"
                          >
                            <p className="m-0 text-[14px] border-none font-bold leading-snug text-slate-900 sm:text-[16px]">{h.name}</p>
                            {h.location && <p className="m-0 mt-0.5 border-none text-[11.5px] leading-snug text-slate-600 sm:text-[13px]"><i className="fa-solid fa-location-dot mr-1 text-slate-400" />{h.location}</p>}
                            <p className="m-0 mt-1 text-[15px]  border-none font-extrabold leading-tight text-red-600 sm:text-[17px]">
                              {h.priceOverride !== null ? inr(h.priceOverride) : "On request"}
                            </p>
                            <p className="m-0 text-[11.5px] border-none text-slate-500 sm:text-[13px]">
                              {h.nights} Night{h.nights === 1 ? "" : "s"}{h.priceOverride !== null ? " · per room / night" : ""}
                            </p>
                          </button>
                        </div>
                        {on && (
                          <div onClick={(e) => e.stopPropagation()} className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-2.5">
                            <span className="flex items-center gap-2.5 text-[13px] font-semibold text-slate-700">
                              Rooms <Stepper value={sel.r} min={1} max={MAX_ROOMS} onChange={(r) => set({ r })} label="rooms" />
                            </span>
                            {h.priceOverride !== null && (
                              <span className="text-[13px] text-slate-600">Hotel total <b className="text-slate-900">{inr(hotelTotal(h, sel.r))}</b></span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {tour.hotel_optional && (
                    <button
                      type="button"
                      role="radio"
                  
                      onClick={() => set({ h: "none" })}
                     className={`... ${
  sel.h === "none"
    ? "border-red-600 bg-red-50/40"
    : "border-slate-200 bg-white hover:border-slate-300"
}`}
                    >
                      <span className="text-[14px] font-semibold text-slate-900 sm:text-[15px]">No Hotel Required</span>
                      <span className="ml-auto text-[11.5px] text-slate-500 sm:text-[12px]">I&apos;ll arrange my own stay</span>
                    </button>
                  )}
                </div>
              </Box>
            )}

            {/* mobile / tablet: inline total + continue (not fixed) */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:hidden">
              <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="m-0 truncate text-[11.5px] text-slate-500">
                    {vehicle ? vehicle.label : "Select vehicle"}
                    {hotel ? ` + ${hotel.name}` : ""}
                  </p>
                  <p className="m-0 text-[22px] font-extrabold leading-tight text-red-600">{inr(total)}</p>
                </div>
                <p className="m-0 shrink-0 text-[11px] text-slate-500">Estimated total</p>
              </div>
              <div className="border-t border-slate-100 p-3">
                <button type="button" onClick={submit} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-[15px] font-semibold text-white hover:bg-red-700">
                  Continue to Summary <i className="fa-solid fa-arrow-right" />
                </button>
              </div>
            </div>
          </div>

          {/* desktop summary card */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="m-0 mb-3 text-[18px] font-bold text-slate-900">Your Selection</h2>
                <dl className="m-0 space-y-2 text-[14px]">
                  <div className="flex justify-between gap-3"><dt className="text-slate-500">Vehicle</dt><dd className="m-0 text-right font-medium">{vehicle ? vehicle.label : "—"}</dd></div>
                  {hotelsExist && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500">Hotel</dt>
                      <dd className="m-0 text-right font-medium">{hotel ? `${hotel.name} × ${sel.r}` : sel.h === "none" ? "Not required" : "—"}</dd>
                    </div>
                  )}
                </dl>
                <div className="mt-4 border-t border-slate-200 pt-3">
                  <p className="m-0 text-[13px] text-slate-500">Estimated total</p>
                  <p className="m-0 text-[28px] font-extrabold text-red-600">{inr(total)}</p>
                </div>
                <button type="button" onClick={submit} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-[15px] font-semibold text-white hover:bg-red-700">
                  Continue to Summary <i className="fa-solid fa-arrow-right" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}