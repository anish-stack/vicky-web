"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  ArrowRight,
  Plus,
  X,
  ShieldCheck,
  Star,
  Car,
  ChevronDown,
  CheckCircle2,
  Headphones,
} from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

const formatDateTime = (value: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const vehicleOptions = [
  "Sedan (4 Seater)",
  "Mini (WagonR)",
  "SUV (Ertiga)",
  "Prime SUV (Innova Crysta)",
];

const Hero: React.FC = () => {
  const { website } = useWebsite();

  const [serviceType, setServiceType] = useState<"outstation" | "local">(
    "outstation",
  );
  const [tripType, setTripType] = useState<"one-way" | "round-trip">("one-way");
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [breaks, setBreaks] = useState<string[]>([]);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [vehicleType, setVehicleType] = useState(vehicleOptions[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const companyName =
    website?.basicInfo?.logo_name || website?.basicInfo?.name || "TaxiSafar";

  useEffect(() => {
    if (tripType === "round-trip") {
      setDrop(pickup);
      setBreaks((prev) => (prev.length === 0 ? [""] : prev));
    } else {
      setBreaks([]);
    }
  }, [tripType, pickup]);

  const addBreak = () => setBreaks((prev) => [...prev, ""]);
  const removeBreak = (i: number) =>
    setBreaks((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!pickup.trim()) return setError("Please enter pickup location");
    if (tripType !== "round-trip" && !drop.trim())
      return setError("Please enter drop location");
    if (!pickupDate) return setError("Please select pickup date & time");
    if (tripType === "round-trip" && !returnDate)
      return setError("Please select return date & time");

    setLoading(true);

    const whatsappNumber =
      website?.basicInfo?.whatsapp ||
      website?.basicInfo?.phone ||
      "919876543210";

    const message = `*New Trip Enquiry*

*${companyName}*

*Pickup Date & Time:*
${formatDateTime(pickupDate)}
${
  tripType === "round-trip"
    ? `*Return Date & Time:*\n${formatDateTime(returnDate)}`
    : ""
}
*Service Type:* ${serviceType}
*Trip Type:* ${tripType === "round-trip" ? "Round Trip" : "One Way"}
*Vehicle:* ${vehicleType}

*Pickup:* ${pickup}
*Drop:* ${drop || pickup}

*Stops:* ${breaks.filter(Boolean).length ? breaks.filter(Boolean).join(", ") : "No stops"}

*Total Estimate Amount:*
*Rs ..... (All Including)*

*Extra Parking Charges Applicable*`;

    const whatsappURL = `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(
      message,
    )}`;

    window.open(whatsappURL, "_blank");
    setLoading(false);
    alert("Thanks For Enquiry! We Will Connect You Soon 😊");
  };

  return (
    <section
      style={{
        backgroundImage: `url('${isMobile ? "/mb.png" : "/bg.png"}')`,
        backgroundSize: "cover",
        backgroundPosition: isMobile ? "right" : "center",
        backgroundRepeat: "no-repeat",
      }}
      id="home"
      className="relative mb-1 overflow-hidden bg-gradient-to-b from-emerald-50/60 via-white to-white pt-8 pb-24 md:pt-14 md:pb-32"
    >
      {/* ===== Background depth layer ===== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-20 w-[420px] h-[420px] bg-emerald-200/40 rounded-full blur-[110px]" />
        <div className="absolute top-1/3 -right-24 w-[480px] h-[480px] bg-teal-200/40 rounded-full blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 w-[380px] h-[380px] bg-sky-100/60 rounded-full blur-[120px]" />
        {/* dotted route line */}
        <svg
          className="absolute top-24 left-[38%] w-40 h-24 text-amber-400/70 hidden lg:block"
          viewBox="0 0 160 100"
          fill="none"
        >
          <path
            d="M4 90C50 90 40 20 90 20C120 20 120 55 156 55"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="6 8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[55%_45%] gap-12 xl:gap-16 items-center">
          {/* ================= LEFT : STORY ================= */}
          <div className=" order-2 lg:order-1">
            <div className=" inline-flex items-center gap-2 bg-emerald-100/80 border border-emerald-200 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold mb-6">
              <ShieldCheck size={14} />
              Trusted by 50,000+ Happy Riders
            </div>

            <h1 className="text-[2.75rem] leading-[1.05] sm:text-6xl xl:text-7xl font-extrabold text-slate-900 tracking-tight mb-6">
              Your{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Journey
              </span>
              <br />
              Starts With{" "}
              <span className="bg-gradient-to-r from-teal-500 to-emerald-600 bg-clip-text text-transparent">
                Trust
              </span>
            </h1>

            <p className="text-lg text-gray-900 font-extrabold leading-relaxed max-w-lg mb-8">
              Verified drivers, transparent pricing and comfortable rides for
              every airport transfer, local trip and outstation journey.
            </p>

            <div className="flex flex-wrap gap-2 mb-9">
              {["Verified", "Best Price", "24×7 Support"].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-1.5 bg-white/70 backdrop-blur border border-slate-200 rounded-full px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700"
                >
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  {item}
                </div>
              ))}
            </div>

            {/* CTAs */}
    <div className="flex flex-row gap-3 mb-10 w-full lg:w-auto">
  <a
    href="#book"
    className="w-1/2 lg:w-auto bg-gradient-to-r from-emerald-600 to-green-500 text-white font-semibold px-5 lg:px-8 py-3 text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2"
  >
    Book Now
    <ArrowRight size={16} />
  </a>

  <a
    href="#services"
    className="w-1/2 lg:w-auto bg-white/60 backdrop-blur border border-slate-200 text-slate-800 font-semibold px-5 lg:px-8 py-3 text-sm sm:text-base rounded-2xl flex items-center justify-center"
  >
    Services
  </a>
</div>
            {/* Social proof */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[
                  "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&q=80",
                  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&q=80",
                  "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=100&q=80",
                  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80",
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Rider"
                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                  <span className="ml-1.5 font-bold text-slate-900 text-sm">
                    4.9/5
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  From 50,000+ Google reviews
                </p>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 max-w-lg">
              {[
                { icon: Car, value: "500+", label: "Verified Drivers" },
                { icon: Star, value: "4.9", label: "Google Rating" },
                { icon: Headphones, value: "24/7", label: "Support" },
                { icon: ShieldCheck, value: "100%", label: "Safe Travel" },
              ].map((s, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm px-3 py-4 text-center"
                >
                  <s.icon
                    size={18}
                    className="text-emerald-600 mx-auto mb-1.5"
                  />
                  <p className="text-lg font-extrabold text-slate-900 leading-none">
                    {s.value}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ================= BOOKING WIDGET ================= */}
          <div
            id="book"
            className="relative order-1 lg:order-2 mt-14 lg:mt-0 lg:absolute lg:top-0 lg:right-8 xl:right-16 w-full lg:w-[520px] xl:w-[540px] scroll-mt-24"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-[30px] border border-white shadow-2xl shadow-slate-300/40 p-6 sm:p-7">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-emerald-600 to-teal-500 p-3 rounded-2xl">
                  <Car size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                    Book Your Ride
                  </h3>
                  <p className="text-xs text-slate-500">
                    Quick, easy and hassle-free booking
                  </p>
                </div>
              </div>

              <div className="flex bg-slate-100 rounded-2xl p-1.5 mb-5">
                {[
                  { key: "outstation", label: "Outstation" },
                  { key: "local", label: "Local / Airport" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setServiceType(item.key as any)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      serviceType === item.key
                        ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-200"
                        : "text-slate-500"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-6 mb-5 text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="radio"
                    checked={tripType === "one-way"}
                    onChange={() => setTripType("one-way")}
                    className="accent-emerald-600"
                  />
                  One Way Trip
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="radio"
                    checked={tripType === "round-trip"}
                    onChange={() => setTripType("round-trip")}
                    className="accent-emerald-600"
                  />
                  Round Trip
                </label>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                    From
                  </label>
                  <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 focus-within:border-emerald-400 px-4 py-3 rounded-2xl transition-colors">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    <input
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      placeholder="Enter pickup location"
                      className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder-slate-400"
                    />
                    <MapPin
                      size={16}
                      className="text-slate-300 flex-shrink-0"
                    />
                  </div>
                </div>

                {breaks.map((b, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={b}
                      onChange={(e) => {
                        const copy = [...breaks];
                        copy[i] = e.target.value;
                        setBreaks(copy);
                      }}
                      placeholder={`Stop ${i + 1} (optional)`}
                      className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none text-sm text-slate-800 placeholder-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => removeBreak(i)}
                      className="p-3 hover:bg-slate-100 rounded-xl transition"
                    >
                      <X className="text-emerald-600" size={16} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addBreak}
                  className="text-xs text-emerald-700 font-semibold flex items-center gap-1 hover:underline"
                >
                  <Plus size={14} /> Add stop
                </button>

                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                    To
                  </label>
                  <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 focus-within:border-emerald-400 px-4 py-3 rounded-2xl transition-colors">
                    <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                    <input
                      value={drop}
                      disabled={tripType === "round-trip"}
                      onChange={(e) => setDrop(e.target.value)}
                      placeholder="Enter drop location"
                      className={`flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder-slate-400 ${
                        tripType === "round-trip"
                          ? "cursor-not-allowed text-slate-400"
                          : ""
                      }`}
                    />
                    <MapPin
                      size={16}
                      className="text-slate-300 flex-shrink-0"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                    Pickup Date &amp; Time
                  </label>
                  <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 focus-within:border-emerald-400 px-4 py-3 rounded-2xl transition-colors">
                    <Calendar
                      size={16}
                      className="text-slate-400 flex-shrink-0"
                    />
                    <input
                      type="datetime-local"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="bg-transparent outline-none text-sm text-slate-800 flex-1"
                    />
                  </div>
                </div>

                {tripType === "round-trip" && (
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                      Return Date &amp; Time
                    </label>
                    <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 focus-within:border-emerald-400 px-4 py-3 rounded-2xl transition-colors">
                      <Calendar
                        size={16}
                        className="text-slate-400 flex-shrink-0"
                      />
                      <input
                        type="datetime-local"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="bg-transparent outline-none text-sm text-slate-800 flex-1"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                    Select Vehicle Type
                  </label>
                  <div className="relative">
                    <Car
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full appearance-none pl-11 pr-9 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-emerald-400 outline-none text-sm text-slate-800 transition-colors"
                    >
                      {vehicleOptions.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-rose-600 text-center text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-all shadow-xl shadow-emerald-200"
                >
                  {loading ? "Submitting..." : "Find My Ride"}{" "}
                  <ArrowRight size={18} />
                </button>

                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 pt-1">
                  {[
                    "Instant Confirmation",
                    "No Hidden Charges",
                    "Secure Payment",
                  ].map((item) => (
                    <span
                      key={item}
                      className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium"
                    >
                      <CheckCircle2 size={12} className="text-emerald-600" />
                      {item}
                    </span>
                  ))}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
