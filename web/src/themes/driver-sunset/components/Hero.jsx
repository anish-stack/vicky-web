"use client";

import { useState, useEffect } from "react";
import { MapPin, Calendar, ArrowRight, Plus, X, Route, Ticket, Smile } from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  return date.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

export default function Hero() {
  const { website } = useWebsite();
  const [serviceType, setServiceType] = useState("outstation");
  const [tripType, setTripType] = useState("one-way");
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [breaks, setBreaks] = useState([]);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [error, setError] = useState("");

  const basicInfo = website?.basicInfo || {};
  const companyName = basicInfo.logo_name || basicInfo.name || "TaxiSafar";
  const city = basicInfo.city || "your city";

  useEffect(() => {
    if (tripType === "round-trip") {
      setDrop(pickup);
      setBreaks((prev) => (prev.length === 0 ? [""] : prev));
    } else {
      setBreaks([]);
    }
  }, [pickup, tripType]);

  const addBreak = () => setBreaks((prev) => [...prev, ""]);
  const removeBreak = (i) => setBreaks((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = () => {
    setError("");
    if (!pickup.trim()) return setError("Please enter pickup location");
    if (tripType !== "round-trip" && !drop.trim()) return setError("Please enter drop location");
    if (!pickupDate) return setError("Please select pickup date & time");
    if (tripType === "round-trip" && !returnDate) return setError("Please select return date & time");

    const whatsappNumber = basicInfo.whatsapp || basicInfo.phone || "919876543210";

    const message = `*New Trip Enquiry*

*${companyName}*

*Pickup Date & Time:*
${formatDateTime(pickupDate)}
${tripType === "round-trip" ? `*Return Date & Time:*\n${formatDateTime(returnDate)}` : ""}
*Service Type:* ${serviceType}
*Trip Type:* ${tripType === "round-trip" ? "Round Trip" : "One Way"}

*Pickup:* ${pickup}
*Drop:* ${drop || pickup}

*Stops:* ${breaks.filter(Boolean).length ? breaks.filter(Boolean).join(", ") : "No stops"}

*Total Estimate Amount:*
*Rs ..... (All Including)*

*Extra Parking Charges Applicable*`;

    window.open(`https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
    alert("Thanks For Enquiry! We Will Connect You Soon 😊");
  };

  return (
    <section id="home" className="relative overflow-hidden py-10 md:py-16">
      {/* Warm decorative shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 right-10 w-64 h-64 bg-amber-300/50 rounded-full blur-3xl" />
        <div className="absolute top-40 -left-24 w-80 h-80 bg-orange-300/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 right-1/4 w-72 h-72 bg-rose-200/50 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        {/* Left */}
        <div>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-orange-300 text-orange-700 text-xs font-black uppercase tracking-wide shadow-[3px_3px_0px_0px_rgba(251,146,60,0.5)]">
            <Smile size={14} /> Happy Journeys from {city}
          </span>

          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] text-stone-900">
            Pack Your Bags.
            <br />
            <span className="relative inline-block text-orange-600">
              We'll Drive.
              <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 200 10" fill="none" preserveAspectRatio="none">
                <path d="M2 7C50 2 150 2 198 7" stroke="#fb923c" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="mt-6 text-stone-600 text-base md:text-lg max-w-lg leading-relaxed">
            {companyName} makes travel simple — one-way drops, round trips and
            full tour packages with friendly drivers and honest, all-inclusive fares.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {["Fixed Fares", "AC Cabs", "Friendly Drivers", "24×7 Booking"].map((chip) => (
              <span key={chip} className="px-4 py-2 rounded-full bg-white border-2 border-orange-200 text-stone-700 text-xs font-bold">
                ✓ {chip}
              </span>
            ))}
          </div>
        </div>

        {/* Ticket-style booking card */}
        <div className="relative bg-white rounded-3xl border-2 border-orange-200 shadow-[8px_8px_0px_0px_rgba(251,146,60,0.35)] p-4 sm:p-6">
          {/* ticket notches */}
          <span className="absolute top-1/2 -left-3 w-6 h-6 bg-orange-50 border-2 border-orange-200 rounded-full" />
          <span className="absolute top-1/2 -right-3 w-6 h-6 bg-orange-50 border-2 border-orange-200 rounded-full" />

          <div className="flex items-center gap-2 mb-4">
            <Ticket size={20} className="text-orange-600" />
            <h3 className="text-lg font-black text-stone-900">Get Your Trip Ticket</h3>
          </div>

          <div className="flex bg-orange-100 rounded-2xl p-1 mb-4">
            {[
              { key: "outstation", label: "Outstation" },
              { key: "local", label: "Local / Airport" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setServiceType(item.key)}
                className={`flex-1 py-2 rounded-xl text-sm font-black transition ${
                  serviceType === item.key ? "bg-orange-600 text-white shadow" : "text-stone-600"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex gap-6 text-sm mb-4 text-stone-700 font-bold">
            {[
              { key: "one-way", label: "One Way" },
              { key: "round-trip", label: "Round Trip" },
            ].map((t) => (
              <label key={t.key} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={tripType === t.key} onChange={() => setTripType(t.key)} className="accent-orange-600" />
                {t.label}
              </label>
            ))}
          </div>

          <Field icon={MapPin} placeholder="Pickup location" value={pickup} onChange={setPickup} />

          {breaks.map((b, i) => (
            <div key={i} className="flex gap-2 mt-3">
              <input
                value={b}
                onChange={(e) => {
                  const copy = [...breaks];
                  copy[i] = e.target.value;
                  setBreaks(copy);
                }}
                placeholder={`Stop ${i + 1} (optional)`}
                className="flex-1 px-4 py-3 rounded-2xl bg-orange-50 border-2 border-orange-100 outline-none text-sm focus:border-orange-400 font-medium"
              />
              <button onClick={() => removeBreak(i)} className="p-2 rounded-xl hover:bg-orange-50 transition">
                <X className="text-orange-600" size={18} />
              </button>
            </div>
          ))}

          <button onClick={addBreak} className="mt-3 text-sm text-orange-700 font-black flex items-center gap-1 hover:underline">
            <Plus size={15} /> Add stop
          </button>

          <Field icon={MapPin} placeholder="Drop location" value={drop} onChange={setDrop} disabled={tripType === "round-trip"} />
          <DateField label="Pickup Date & Time" value={pickupDate} onChange={setPickupDate} />
          {tripType === "round-trip" && <DateField label="Return Date & Time" value={returnDate} onChange={setReturnDate} />}

          {error && <p className="mt-4 text-red-600 text-center text-sm font-bold">{error}</p>}

          <button
            onClick={handleSubmit}
            className="mt-6 w-full bg-orange-600 hover:bg-orange-700 text-white py-3.5 rounded-2xl font-black flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-[4px_4px_0px_0px_rgba(154,52,18,0.3)]"
          >
            <Route size={18} /> Send Enquiry <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

function Field({ icon: Icon, placeholder, value, onChange, disabled }) {
  return (
    <div className={`mt-3 flex items-center gap-3 bg-orange-50 border-2 border-orange-100 px-4 py-3 rounded-2xl focus-within:border-orange-400 ${disabled ? "opacity-60" : ""}`}>
      <Icon size={17} className="text-orange-500 flex-shrink-0" />
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`flex-1 bg-transparent outline-none text-sm font-medium ${disabled ? "cursor-not-allowed text-stone-400" : ""}`}
      />
    </div>
  );
}

function DateField({ label, value, onChange }) {
  return (
    <div className="mt-3">
      <label className="text-xs text-stone-500 font-bold mb-1 block">{label}</label>
      <div className="flex items-center gap-3 bg-orange-50 border-2 border-orange-100 px-4 py-3 rounded-2xl focus-within:border-orange-400">
        <Calendar size={17} className="text-orange-500 flex-shrink-0" />
        <input
          type="datetime-local"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent outline-none text-sm flex-1 font-medium"
        />
      </div>
    </div>
  );
}
