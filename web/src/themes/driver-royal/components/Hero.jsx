"use client";

import { useState, useEffect } from "react";
import { MapPin, Calendar, ArrowRight, Plus, X, ShieldCheck, Clock, Star, BadgeCheck } from "lucide-react";
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
    <section id="home" className="relative overflow-hidden">
      {/* Car bg image merged with warm cream overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/386025/pexels-photo-386025.jpeg?auto=compress&cs=tinysrgb&w=1800"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#fffdf5]/[0.97] via-[#fffdf5]/90 to-green-50/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fffdf5] via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        {/* Left copy */}
        <div>
          {/* Horn OK Please style badge */}
          <span className="inline-flex items-center gap-2 md:px-5 px-3 py-2 rounded-full bg-green-700 text-white text-xs font-black uppercase tracking-[0.2em] shadow-[3px_3px_0px_0px_rgba(249,115,22,1)]">
            ✦ Straight Talk · Fair Rate ✦
          </span>

          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-[62px] font-black leading-[1.05] text-slate-900">
            Cab Ready,
            <br />
            <span className="text-green-700">Driver Ready.</span>
            <br />
            <span className="relative inline-block">
              <span className="relative z-10">Just Hop In!</span>
              <span className="absolute bottom-1.5 left-0 right-0 h-3.5 md:h-4 bg-orange-300/80 -z-0 -rotate-1" />
            </span>
          </h1>

          <p className="mt-5 text-slate-600 text-base md:text-lg max-w-lg leading-relaxed font-semibold">
            {companyName} — outstation tours, one-way drops, or local rides from {city}.
            Clean AC cars, experienced drivers, and fixed rates — toll tax all included.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {[
              { icon: ShieldCheck, label: "Verified Driver" },
              { icon: Clock, label: "24×7 Service" },
              { icon: BadgeCheck, label: "All India Permit" },
            ].map((f, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-green-700/20 shadow-sm text-sm font-black text-slate-700"
              >
                <f.icon size={15} className="text-green-700" /> {f.label}
              </span>
            ))}
          </div>

          {/* Rating strip — dhaba board style */}
          <div className="mt-8 inline-flex items-center gap-4 bg-white rounded-2xl border-2 border-green-700 md:px-5 px-2 py-3.5 shadow-[4px_4px_0px_0px_rgba(21,128,61,0.25)]">
            <div className="flex -space-x-2">
              {["bg-green-600", "bg-orange-500", "bg-emerald-700", "bg-amber-500"].map((c, i) => (
                <span key={i} className={`w-9 h-9 rounded-full ${c} border-2 border-white flex items-center justify-center text-white text-xs font-black`}>
                  {String.fromCharCode(65 + i)}
                </span>
              ))}
            </div>
            <div>
              <p className="flex items-center gap-1 text-sm font-black text-slate-900">
                4.9 <Star size={13} className="text-orange-500 fill-orange-500" /> · 5000+ Rides
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Happy Customers, Lasting Trust</p>
            </div>
          </div>
        </div>

        {/* Booking card — permit board style */}
        <div className="relative">
          <div className="bg-white rounded-2xl border-[3px] border-green-700 shadow-[8px_8px_0px_0px_rgba(21,128,61,0.9)] overflow-hidden">
            {/* Permit header */}
            <div className="bg-green-700 px-6 py-4 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-green-200">Booking Window</p>
                  <h3 className="text-white font-black text-lg uppercase tracking-wide">Book Your Cab</h3>
                </div>
                <span className="bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg -rotate-2 shadow">
                  Rate Fix
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[repeating-linear-gradient(to_right,#f97316_0px,#f97316_14px,#ffffff_14px,#ffffff_28px)]" />
            </div>

            <div className="p-2 sm:p-6">
              {/* Service type */}
              <div className="grid grid-cols-2 rounded-xl overflow-hidden border-2 border-green-700 mb-4">
                {[
                  { key: "outstation", label: "Outstation" },
                  { key: "local", label: "Local / Airport" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setServiceType(item.key)}
                    className={`py-2.5 text-xs font-black uppercase tracking-wide transition ${
                      serviceType === item.key ? "bg-green-700 text-white" : "bg-white text-slate-500 hover:text-green-700"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Trip type */}
              <div className="flex gap-6 text-sm mb-4 text-slate-700 font-black">
                {[
                  { key: "one-way", label: "One Way" },
                  { key: "round-trip", label: "Round Trip" },
                ].map((t) => (
                  <label key={t.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={tripType === t.key}
                      onChange={() => setTripType(t.key)}
                      className="accent-green-700"
                    />
                    {t.label}
                  </label>
                ))}
              </div>

              <Field icon={MapPin} label="From (Pickup)" placeholder="Pickup location" value={pickup} onChange={setPickup} />

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
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 bg-[#fffdf5] text-slate-900 placeholder-slate-400 outline-none text-sm font-bold focus:border-green-700"
                  />
                  <button onClick={() => removeBreak(i)} className="p-2 rounded-xl border-2 border-dashed border-slate-300 hover:border-orange-500 transition">
                    <X className="text-orange-500" size={18} />
                  </button>
                </div>
              ))}

              <button
                onClick={addBreak}
                className="mt-3 text-xs text-green-700 font-black uppercase tracking-wide flex items-center gap-1 hover:underline"
              >
                <Plus size={14} className="text-orange-500" /> Add a Stop
              </button>

              <Field
                icon={MapPin}
                label="To (Drop)"
                placeholder="Drop location"
                value={drop}
                onChange={setDrop}
                disabled={tripType === "round-trip"}
              />

              <DateField label="Pickup Date & Time" value={pickupDate} onChange={setPickupDate} />
              {tripType === "round-trip" && (
                <DateField label="Return Date & Time" value={returnDate} onChange={setReturnDate} />
              )}

              {error && <p className="mt-4 text-orange-600 text-center text-sm font-black">{error}</p>}

              <button
                onClick={handleSubmit}
                className="mt-6 w-full bg-green-700 hover:bg-green-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(249,115,22,1)] transition-all"
              >
                Ask Rate on WhatsApp <ArrowRight size={17} />
              </button>

              <p className="mt-4 text-center text-[11px] font-black text-slate-400 uppercase tracking-wide">
                ✓ Toll-Tax Included &nbsp;·&nbsp; ✓ No Hidden Charges
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ icon: Icon, label, placeholder, value, onChange, disabled }) {
  return (
    <div className="mt-3">
      <label className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-1 block">{label}</label>
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-slate-200 focus-within:border-green-700 ${
          disabled ? "opacity-60 bg-slate-100" : "bg-[#fffdf5]"
        }`}
      >
        <Icon size={16} className="text-green-700 flex-shrink-0" />
        <input
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 bg-transparent outline-none text-sm font-bold text-slate-900 placeholder-slate-400 ${
            disabled ? "cursor-not-allowed" : ""
          }`}
        />
      </div>
    </div>
  );
}

function DateField({ label, value, onChange }) {
  return (
    <div className="mt-3">
      <label className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-1 block">{label}</label>
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-slate-200 bg-[#fffdf5] focus-within:border-green-700">
        <Calendar size={16} className="text-green-700 flex-shrink-0" />
        <input
          type="datetime-local"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent outline-none text-sm flex-1 text-slate-900 font-bold"
        />
      </div>
    </div>
  );
}
