"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FALLBACK_IMG,
  MAX_ADULTS,
  MAX_ROOMS,
  Selection,
  TourPackage,
  activeHotels,
  activeVehicles,
  durationText,
  hotelTotal,
  inr,
  selectionQuery,
  tripTypeText,
} from "@/lib/tourPackage";
import { BottomBar, CheckList, Chip, Panel, SectionTitle } from "./TourBits";

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function Stepper({ value, min, max, onChange, label }: { value: number; min: number; max: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="inline-flex items-center rounded-lg border border-slate-300" role="group" aria-label={label}>
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

function Radio({ checked }: { checked: boolean }) {
  return (
    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${checked ? "border-red-600" : "border-slate-300"}`}>
      {checked && <span className="h-2.5 w-2.5 rounded-full bg-red-600" />}
    </span>
  );
}

export default function BookingSelector({ tour, initial }: { tour: TourPackage; initial: Selection }) {
  const router = useRouter();
  const vehicles = useMemo(() => activeVehicles(tour), [tour]);
  const hotels = useMemo(() => activeHotels(tour), [tour]);

  const [sel, setSel] = useState<Selection>(() => ({
    ...initial,
    v: vehicles.some((v) => v.idx === initial.v) ? initial.v : null,
    h:
      initial.h === "none" && tour.hotel_optional
        ? "none"
        : hotels.some((h) => h.idx === initial.h)
        ? initial.h
        : null,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hotelPhoto, setHotelPhoto] = useState<Record<number, number>>({});
  const [minDate, setMinDate] = useState("");
  useEffect(() => setMinDate(todayISO()), []);

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
    if (sel.v === null) e.v = "Please select a vehicle";
    if (hotelsExist && sel.h === null) e.h = tour.hotel_optional ? "Select a hotel or choose No Hotel Required" : "Please select a hotel";
    if (!sel.d) e.d = "Please choose your travel date";
    else if (minDate && sel.d < minDate) e.d = "Travel date can't be in the past";
    setErrors(e);
    if (Object.keys(e).length) {
      const first = ["d", "v", "h"].find((k) => e[k]);
      document.getElementById(`sec-${first}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const final: Selection = { ...sel, h: hotelsExist ? sel.h : "none", r: hotel ? sel.r : 1 };
    router.push(`/tour/${tour.slug}/summary?${selectionQuery(final)}`);
  };

  return (
    <main className="mt-20 bg-slate-50 pb-32">
      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6">
        <Link href={`/tour/${tour.slug}`} className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-slate-600 no-underline hover:text-red-600">
          <i className="fa-solid fa-arrow-left" /> Back to tour details
        </Link>

        {/* step indicator */}
        <ol className="m-0 mb-4 flex list-none items-center gap-2 p-0 text-[12px] font-semibold sm:text-[13px]">
          <li className="flex items-center gap-1.5 text-red-600"><span className="grid h-6 w-6 place-items-center rounded-full bg-red-600 text-white">1</span>Select</li>
          <li className="h-px w-8 bg-slate-300" aria-hidden />
          <li className="flex items-center gap-1.5 text-slate-400"><span className="grid h-6 w-6 place-items-center rounded-full bg-slate-200 text-slate-500">2</span>Summary</li>
        </ol>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6">
          <div className="min-w-0 space-y-4 sm:space-y-5">
            {/* tour strip */}
            <Panel className="flex items-center gap-3 sm:gap-4">
              <img src={tour.cover_image || FALLBACK_IMG} alt="" className="h-16 w-20 shrink-0 rounded-lg object-cover sm:h-20 sm:w-28" />
              <div className="min-w-0">
                <h1 className="m-0 line-clamp-2 text-[16px] font-bold leading-snug text-slate-900 sm:text-[20px]">{tour.title}</h1>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Chip>{durationText(tour)}</Chip>
                  <Chip>{tripTypeText(tour)}</Chip>
                </div>
              </div>
            </Panel>

            {/* trip details */}
            <Panel>
              <div id="sec-d" className="scroll-mt-24" />
              <SectionTitle icon="fa-regular fa-calendar">Trip Details</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Travel date <span className="text-red-600">*</span></span>
                  <input
                    type="date"
                    min={minDate || undefined}
                    value={sel.d}
                    onChange={(e) => set({ d: e.target.value })}
                    className={`h-11 w-full rounded-lg border px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-red-100 ${errors.d ? "border-red-500" : "border-slate-300 focus:border-red-500"}`}
                  />
                  {errors.d && <span className="mt-1 block text-[12px] text-red-600">{errors.d}</span>}
                </label>
                <div>
                  <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Travellers (adults)</span>
                  <div className="flex h-11 items-center">
                    <Stepper value={sel.a} min={1} max={MAX_ADULTS} onChange={(a) => set({ a })} label="adults" />
                  </div>
                </div>
              </div>
            </Panel>

            {/* inclusions / exclusions / notes (compact) */}
            {(tour.inclusions.length > 0 || tour.exclusions.length > 0) && (
              <Panel>
                <div className="grid gap-5 sm:grid-cols-2">
                  {tour.inclusions.length > 0 && (
                    <div>
                      <SectionTitle>Package Inclusions</SectionTitle>
                      <CheckList items={tour.inclusions} tone="yes" />
                    </div>
                  )}
                  {tour.exclusions.length > 0 && (
                    <div>
                      <SectionTitle>Package Exclusions</SectionTitle>
                      <CheckList items={tour.exclusions} tone="no" />
                    </div>
                  )}
                </div>
              </Panel>
            )}
            {tour.important_notes.length > 0 && (
              <section className="rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:p-5">
                <SectionTitle icon="fa-solid fa-circle-info">Important Notes</SectionTitle>
                <ul className="m-0 list-disc space-y-1 pl-5 text-[13px] text-slate-700 sm:text-[14px]">
                  {tour.important_notes.map((n, i) => <li key={i}>{n}</li>)}
                </ul>
              </section>
            )}

            {/* vehicles */}
            <Panel>
              <div id="sec-v" className="scroll-mt-24" />
              <SectionTitle icon="fa-solid fa-car">Select Your Vehicle</SectionTitle>
              <p className="-mt-2 mb-3 text-[13px] text-slate-500">Choose your preferred vehicle for this tour</p>
              {errors.v && <p className="mb-3 mt-0 rounded-md bg-red-50 px-3 py-2 text-[13px] text-red-700">{errors.v}</p>}
              {vehicles.length === 0 ? (
                <p className="m-0 text-[14px] text-slate-500">Vehicles for this tour will be confirmed by our team.</p>
              ) : (
                <div className="space-y-3" role="radiogroup" aria-label="Vehicle">
                  {vehicles.map((v) => {
                    const on = sel.v === v.idx;
                    return (
                      <button
                        key={v.idx}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => set({ v: v.idx })}
                        className={`flex w-full items-center gap-3 rounded-xl border-2 bg-white p-3 text-left transition-colors sm:gap-4 ${on ? "border-red-600 bg-red-50/40" : "border-slate-200 hover:border-slate-300"}`}
                      >
                        <Radio checked={on} />
                        <img src={v.image || FALLBACK_IMG} alt="" loading="lazy" className="h-14 w-20 shrink-0 rounded-md bg-slate-50 object-contain sm:h-16 sm:w-28" />
                        <div className="min-w-0 flex-1">
                          <p className="m-0 text-[15px] font-bold text-slate-900 sm:text-[16px]">{v.label}</p>
                          <p className="m-0 mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[12px] text-slate-600 sm:text-[13px]">
                            {v.seats && <span><i className="fa-solid fa-user mr-1 text-slate-400" />{v.seats}</span>}
                            {v.suitcases && <span><i className="fa-solid fa-suitcase mr-1 text-slate-400" />{v.suitcases}</span>}
                            {v.ac && <span><i className="fa-regular fa-snowflake mr-1 text-slate-400" />AC</span>}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="m-0 text-[16px] font-extrabold text-red-600 sm:text-[18px]">{inr(v.price)}</p>
                          <p className="m-0 text-[11px] text-slate-500">All Including</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </Panel>

            {/* hotels */}
            {hotelsExist && (
              <Panel>
                <div id="sec-h" className="scroll-mt-24" />
                <SectionTitle icon="fa-solid fa-hotel">
                  Select Your Hotel{tour.nights > 0 ? ` (${tour.nights} Night${tour.nights === 1 ? "" : "s"})` : ""}
                </SectionTitle>
                <p className="-mt-2 mb-3 text-[13px] text-slate-500">Choose your preferred hotel for this tour</p>
                {errors.h && <p className="mb-3 mt-0 rounded-md bg-red-50 px-3 py-2 text-[13px] text-red-700">{errors.h}</p>}
                <div className="space-y-3" role="radiogroup" aria-label="Hotel">
                  {hotels.map((h) => {
                    const on = sel.h === h.idx;
                    const photos = h.images.length ? h.images : [FALLBACK_IMG];
                    const pi = Math.min(hotelPhoto[h.idx] || 0, photos.length - 1);
                    return (
                      <div key={h.idx} className={`rounded-xl border-2 bg-white p-3 transition-colors ${on ? "border-red-600 bg-red-50/40" : "border-slate-200"}`}>
                        <div className="flex gap-3 sm:gap-4">
                          <button type="button" role="radio" aria-checked={on} onClick={() => set({ h: h.idx })} className="mt-1 self-start" aria-label={`Select ${h.name}`}>
                            <Radio checked={on} />
                          </button>
                          <div className="w-24 shrink-0 sm:w-36">
                            <img src={photos[pi]} alt={h.name} loading="lazy" className="aspect-[4/3] w-full rounded-md object-cover" />
                            {photos.length > 1 && (
                              <div className="mt-1 flex gap-1 overflow-x-auto">
                                {photos.map((p, i) => (
                                  <button key={i} type="button" onClick={() => setHotelPhoto((s) => ({ ...s, [h.idx]: i }))} className={`shrink-0 overflow-hidden rounded ${i === pi ? "ring-2 ring-red-500" : "opacity-70"}`} aria-label={`Photo ${i + 1}`}>
                                    <img src={p} alt="" loading="lazy" className="h-6 w-8 object-cover sm:h-8 sm:w-10" />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <button type="button" onClick={() => set({ h: h.idx })} className="min-w-0 flex-1 text-left">
                            <div className="flex items-start justify-between gap-2">
                              <p className="m-0 text-[15px] font-bold leading-snug text-slate-900 sm:text-[16px]">{h.name}</p>
                              <p className="m-0 shrink-0 text-[15px] font-extrabold text-red-600 sm:text-[17px]">
                                {h.priceOverride !== null ? inr(h.priceOverride) : "On request"}
                              </p>
                            </div>
                            {h.location && <p className="m-0 mt-0.5 text-[12px] text-slate-600 sm:text-[13px]"><i className="fa-solid fa-location-dot mr-1 text-slate-400" />{h.location}</p>}
                            <p className="m-0 mt-1 text-[12px] text-slate-500 sm:text-[13px]">
                              {h.nights} Night{h.nights === 1 ? "" : "s"}{h.priceOverride !== null ? " · per room / night" : ""}
                            </p>
                          </button>
                        </div>
                        {on && (
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3">
                            <span className="flex items-center gap-3 text-[13px] font-semibold text-slate-700">
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
                      aria-checked={sel.h === "none"}
                      onClick={() => set({ h: "none" })}
                      className={`flex w-full items-center gap-3 rounded-xl border-2 bg-white p-3 text-left ${sel.h === "none" ? "border-red-600 bg-red-50/40" : "border-slate-200 hover:border-slate-300"}`}
                    >
                      <Radio checked={sel.h === "none"} />
                      <span className="text-[15px] font-semibold text-slate-900">No Hotel Required</span>
                      <span className="ml-auto text-[12px] text-slate-500">I'll arrange my own stay</span>
                    </button>
                  )}
                </div>
              </Panel>
            )}
          </div>

          {/* desktop summary card */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <Panel>
                <SectionTitle>Your Selection</SectionTitle>
                <dl className="m-0 space-y-2 text-[14px]">
                  <div className="flex justify-between gap-3"><dt className="text-slate-500">Vehicle</dt><dd className="m-0 text-right font-medium">{vehicle ? vehicle.label : "—"}</dd></div>
                  {hotelsExist && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500">Hotel</dt>
                      <dd className="m-0 text-right font-medium">{hotel ? `${hotel.name} × ${sel.r}` : sel.h === "none" ? "Not required" : "—"}</dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-3"><dt className="text-slate-500">Date</dt><dd className="m-0 font-medium">{sel.d || "—"}</dd></div>
                </dl>
                <div className="mt-4 border-t border-slate-200 pt-3">
                  <p className="m-0 text-[13px] text-slate-500">Estimated total</p>
                  <p className="m-0 text-[28px] font-extrabold text-red-600">{inr(total)}</p>
                </div>
                <button type="button" onClick={submit} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-[15px] font-semibold text-white hover:bg-red-700">
                  Continue to Summary <i className="fa-solid fa-arrow-right" />
                </button>
              </Panel>
            </div>
          </aside>
        </div>
      </div>

      <BottomBar>
        <div className="min-w-0 flex-1">
          <p className="m-0 truncate text-[11px] font-medium text-slate-500 sm:text-[12px]">
            {vehicle ? vehicle.label : "Select vehicle"}
            {hotel ? ` + ${hotel.name}` : ""}
          </p>
          <p className="m-0 text-[20px] font-extrabold leading-tight text-red-600 sm:text-[24px]">{inr(total)}</p>
        </div>
        <button
          type="button"
          onClick={submit}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-[14px] font-semibold text-white hover:bg-red-700 sm:px-7 sm:text-[16px]"
        >
          Continue <i className="fa-solid fa-arrow-right" />
        </button>
      </BottomBar>
    </main>
  );
}
