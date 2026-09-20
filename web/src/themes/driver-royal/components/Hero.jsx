"use client";

import { useState } from "react";
import {
  MapPin,
  CalendarDays,
  Car,
  Zap,
  ShieldCheck,
  Headphones,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

const tabs = [
  { key: "ride", label: "Book a Ride" },
  { key: "outstation", label: "Outstation" },
  { key: "airport", label: "Airport" },
];

const vehicles = ["Any", "Mini", "Sedan", "SUV", "Prime SUV"];

const highlights = [
  {
    icon: Zap,
    label: "Instant Booking",
  },
  {
    icon: ShieldCheck,
    label: "Verified Drivers",
  },
  {
    icon: Headphones,
    label: "24/7 Support",
  },
];

export default function Hero() {
  const { website } = useWebsite();

  const basicInfo = website?.basicInfo || {};

  const name =
    basicInfo.logo_name ||
    basicInfo.name ||
    "QuickRide";

  const whatsapp =
    basicInfo.whatsapp ||
    basicInfo.phone ||
    "919876543210";

  const city = basicInfo.city?.trim();

  const [tab, setTab] = useState("ride");
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [vehicle, setVehicle] = useState("Any");
  const [error, setError] = useState("");

  const handleFindCabs = () => {
    setError("");

    if (!pickup.trim()) {
      setError("Please enter pickup location");
      return;
    }

    if (!drop.trim()) {
      setError("Please enter drop location");
      return;
    }

    const selectedTab =
      tabs.find((item) => item.key === tab)?.label || "Book a Ride";

    const message = `*New Ride Enquiry*

*${name}*

*Type:* ${selectedTab}
*Pickup:* ${pickup}
*Drop:* ${drop}
*Date & Time:* ${dateTime || "Not specified"}
*Vehicle:* ${vehicle}`;

    const cleanNumber = whatsapp
      .toString()
      .replace(/\D/g, "")
      .replace(/^91(?=\d{10}$)/, "");

    window.open(
      `https://wa.me/91${cleanNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-[#fffaf6]"
    >
      {/* ================= BACKGROUND ================= */}

      {/* ================= BACKGROUND ================= */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=90&w=2000&auto=format&fit=crop"
          alt="City skyline"
          className="h-full w-full object-cover object-center"
        />

        {/* Very light overall tint */}
        <div className="absolute inset-0 bg-white/5" />

        {/* Light overlay only on left for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#fffaf6]/90 via-[#fffaf6]/40 to-transparent" />

        {/* Small bottom blend */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#fffaf6]/60 to-transparent" />
      </div>
      {/* Decorative glows */}
      <div className="pointer-events-none absolute -left-28 top-24 h-80 w-80 rounded-full bg-orange-200/30 blur-3xl" />

      <div className="pointer-events-none absolute right-[30%] top-10 h-80 w-80 rounded-full bg-orange-100/30 blur-3xl" />

      {/* ================= CONTENT ================= */}

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="grid min-h-[650px] grid-cols-1 items-center gap-10 py-12 lg:grid-cols-[1.1fr_0.8fr] lg:gap-12 lg:py-16">

          {/* ================================================= */}
          {/* LEFT SIDE */}
          {/* ================================================= */}

          <div className="relative z-20 max-w-[660px]">

            {/* Badge */}
            <div className="mb-5">
              <span className="inline-flex items-center rounded-full border border-orange-200 bg-[#fff1e8] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-orange-600">
                Safe
                <span className="mx-2 text-orange-300">•</span>
                Affordable
                <span className="mx-2 text-orange-300">•</span>
                Always On Time

                {city && (
                  <>
                    <span className="mx-2 text-orange-300">
                      •
                    </span>

                    {city}
                  </>
                )}
              </span>
            </div>

            {/* Heading */}
            <h1 className="max-w-[620px] text-[45px] font-extrabold leading-[0.98] tracking-[-0.045em] text-[#071936] sm:text-[58px] lg:text-[68px] xl:text-[74px]">
              Your Ride
              <br />

              Anytime,
              <br />

              <span className="text-[#ff641a]">
                Anywhere.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 max-w-[510px] text-[15px] font-medium leading-7 text-slate-600 sm:text-[16px]">
              Book a cab in seconds and travel comfortably
              across your city and beyond.
            </p>

            {/* Benefits */}
            <div className="mt-9 flex flex-wrap gap-x-8 gap-y-6">
              {highlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white bg-white/80 shadow-[0_10px_35px_rgba(15,23,42,0.08)] backdrop-blur-md">
                      <Icon
                        size={20}
                        strokeWidth={2.2}
                        className="text-[#071936]"
                      />
                    </div>

                    <span className="text-[13px] font-bold text-[#071936]">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================================================= */}
          {/* BOOKING CARD */}
          {/* ================================================= */}

          <div className="relative z-30 mx-auto w-full max-w-[460px] lg:ml-auto">

            <div className="rounded-[24px] border border-white/70 bg-white/95 p-4 shadow-[0_28px_80px_rgba(15,23,42,0.20)] backdrop-blur-xl sm:p-5">

              {/* Tabs */}
              <div className="grid grid-cols-3 rounded-xl bg-[#f3f5f8] p-1">
                {tabs.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setTab(item.key)}
                    className={`rounded-[9px] px-2 py-3 text-[11px] font-bold transition-all duration-300 sm:text-xs ${tab === item.key
                        ? "bg-[#071936] text-white shadow-md"
                        : "text-slate-500 hover:text-[#071936]"
                      }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Form */}
              <div className="mt-5 space-y-4">

                <Field
                  icon={MapPin}
                  label="Pickup Location"
                  placeholder="Enter pickup location"
                  value={pickup}
                  onChange={setPickup}
                />

                <Field
                  icon={MapPin}
                  label="Drop Location"
                  placeholder="Enter drop location"
                  value={drop}
                  onChange={setDrop}
                />

                {/* Date */}
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.04em] text-[#071936]">
                    Date & Time
                  </label>

                  <div className="flex h-[54px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition-all focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100">
                    <CalendarDays
                      size={18}
                      className="shrink-0 text-slate-400"
                    />

                    <input
                      type="datetime-local"
                      value={dateTime}
                      onChange={(e) =>
                        setDateTime(e.target.value)
                      }
                      className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-slate-700 outline-none"
                    />
                  </div>
                </div>

                {/* Vehicle */}
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.04em] text-[#071936]">
                    Select Vehicle
                  </label>

                  <div className="relative flex h-[54px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition-all focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100">
                    <Car
                      size={18}
                      className="shrink-0 text-slate-400"
                    />

                    <select
                      value={vehicle}
                      onChange={(e) =>
                        setVehicle(e.target.value)
                      }
                      className="min-w-0 flex-1 appearance-none bg-transparent pr-7 text-[13px] font-medium text-slate-700 outline-none"
                    >
                      {vehicles.map((item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-4 text-slate-400"
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-semibold text-red-500">
                    {error}
                  </div>
                )}

                {/* CTA */}
                <button
                  type="button"
                  onClick={handleFindCabs}
                  className="group flex h-[56px] w-full items-center justify-center gap-2 rounded-xl bg-[#ff641a] text-sm font-bold text-white shadow-[0_12px_30px_rgba(255,100,26,0.30)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e95712] hover:shadow-[0_16px_35px_rgba(255,100,26,0.38)] active:scale-[0.98]"
                >
                  Find Cabs

                  <ArrowRight
                    size={17}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* OPTIONAL CAR IMAGE */}
      {/* ================================================= */}

      <div className="pointer-events-none absolute bottom-0 left-[53%] z-20 hidden -translate-x-1/2 lg:block">
        <img
          src="/images/hero-car.png"
          alt=""
          className="w-[480px] xl:w-[540px] drop-shadow-[0_25px_25px_rgba(15,23,42,0.20)]"
        />
      </div>

      {/* Bottom fade */}
    </section>
  );
}

/* ================================================= */
/* FIELD COMPONENT */
/* ================================================= */

function Field({
  icon: Icon,
  label,
  placeholder,
  value,
  onChange,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.04em] text-[#071936]">
        {label}
      </label>

      <div className="flex h-[54px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition-all focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100">
        <Icon
          size={18}
          className="shrink-0 text-slate-400"
        />

        <input
          type="text"
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-slate-700 outline-none placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}