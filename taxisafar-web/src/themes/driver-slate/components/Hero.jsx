"use client";

import { useState, useEffect } from "react";
import { MapPin, Calendar, ArrowRight, Plus, X, ShieldCheck, Clock, Star } from "lucide-react";
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
    <section id="home" className="relative overflow-hidden bg-gradient-to-b from-sky-100 via-sky-50 to-white">
      {/* Soft sky blobs */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-sky-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-32 -right-24 w-96 h-96 bg-amber-100/60 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy + tilted photos */}
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md shadow-sky-100 text-sky-700 text-xs font-extrabold uppercase tracking-widest">
              <Star size={13} className="text-amber-500 fill-amber-500" /> Trusted Cab Service In {city}
            </span>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] text-gray-900">
              Miles Of Smiles,
              <br />
              <span className="text-sky-600">One Ride</span> At A Time.
            </h1>

            <p className="mt-5 text-gray-500 text-base md:text-lg max-w-lg leading-relaxed font-medium">
              {companyName} — outstation tours, one-way drops and local rides.
              Clean AC cabs, friendly drivers and all-inclusive fares from {city}.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {[
                { icon: ShieldCheck, label: "Verified Drivers" },
                { icon: Clock, label: "24×7 Available" },
                { icon: MapPin, label: "All-India Trips" },
              ].map((f, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm text-sm font-bold text-gray-700"
                >
                  <f.icon size={15} className="text-sky-600" /> {f.label}
                </span>
              ))}
            </div>

            {/* Tilted travel snapshots */}
            <div className="mt-10 hidden sm:flex items-end gap-4">
              {[
                { src: "https://images.pexels.com/photos/21014/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600", rot: "-rotate-3", label: "Highways" },
                { src: "https://images.pexels.com/photos/386025/pexels-photo-386025.jpeg?auto=compress&cs=tinysrgb&w=600", rot: "rotate-2", label: "Comfort" },
                { src: "https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg?auto=compress&cs=tinysrgb&w=600", rot: "-rotate-2", label: "Adventures" },
              ].map((p, i) => (
                <div
                  key={i}
                  className={`${p.rot} bg-white p-2 pb-6 rounded-lg shadow-xl shadow-sky-900/10 hover:rotate-0 hover:-translate-y-2 transition-all relative`}
                >
                  <img src={p.src} alt={p.label} className="w-28 h-24 lg:w-36 lg:h-28 object-cover rounded" />
                  <p className="absolute bottom-1.5 left-0 right-0 text-center text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                    {p.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Booking card — highway sign style */}
          <div className="relative">
            <div className="bg-white rounded-3xl shadow-2xl shadow-sky-900/10 overflow-hidden">
              <div className="bg-sky-600 px-6 py-4 relative">
                <h3 className="text-white font-extrabold text-base">Book Your Ride</h3>
                <p className="text-sky-100 text-xs font-bold">Instant quote on WhatsApp</p>
                <span className="absolute right-5 top-1/2 -translate-y-1/2 bg-amber-400 text-gray-900 text-[10px] font-extrabold uppercase tracking-wide px-3 py-1.5 rounded-lg shadow">
                  No Hidden Cost
                </span>
              </div>
              <div className="h-1.5 bg-[repeating-linear-gradient(to_right,#fbbf24_0px,#fbbf24_14px,#0284c7_14px,#0284c7_28px)]" />

              <div className="p-2 sm:p-6">
                {/* Service type */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { key: "outstation", label: "Outstation" },
                    { key: "local", label: "Local / Airport" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setServiceType(item.key)}
                      className={`py-2.5 rounded-xl text-sm font-extrabold transition ${
                        serviceType === item.key
                          ? "bg-sky-600 text-white shadow-md shadow-sky-600/25"
                          : "bg-sky-50 text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Trip type */}
                <div className="flex gap-6 text-sm mb-4 text-gray-700 font-bold">
                  {[
                    { key: "one-way", label: "One Way" },
                    { key: "round-trip", label: "Round Trip" },
                  ].map((t) => (
                    <label key={t.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={tripType === t.key}
                        onChange={() => setTripType(t.key)}
                        className="accent-sky-600"
                      />
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
                      className="flex-1 px-4 py-3 rounded-xl bg-sky-50 text-gray-900 placeholder-gray-400 outline-none text-sm font-medium ring-1 ring-transparent focus:ring-sky-400 focus:bg-white"
                    />
                    <button onClick={() => removeBreak(i)} className="p-2 rounded-xl hover:bg-sky-50 transition">
                      <X className="text-sky-600" size={18} />
                    </button>
                  </div>
                ))}

                <button
                  onClick={addBreak}
                  className="mt-3 text-sm text-sky-700 font-extrabold flex items-center gap-1 hover:underline"
                >
                  <Plus size={15} /> Add stop
                </button>

                <Field
                  icon={MapPin}
                  placeholder="Drop location"
                  value={drop}
                  onChange={setDrop}
                  disabled={tripType === "round-trip"}
                />

                <DateField label="Pickup Date & Time" value={pickupDate} onChange={setPickupDate} />
                {tripType === "round-trip" && (
                  <DateField label="Return Date & Time" value={returnDate} onChange={setReturnDate} />
                )}

                {error && <p className="mt-4 text-red-500 text-center text-sm font-bold">{error}</p>}

                <button
                  onClick={handleSubmit}
                  className="mt-6 w-full bg-amber-400 hover:bg-amber-300 text-gray-900 py-3.5 rounded-xl font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-amber-400/30 hover:-translate-y-0.5 transition-all"
                >
                  Get Instant Quote <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ icon: Icon, placeholder, value, onChange, disabled }) {
  return (
    <div
      className={`mt-3 flex items-center gap-3 px-4 py-3 rounded-xl ring-1 ring-transparent focus-within:ring-sky-400 ${
        disabled ? "opacity-60 bg-gray-100" : "bg-sky-50 focus-within:bg-white"
      }`}
    >
      <Icon size={16} className="text-sky-600 flex-shrink-0" />
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`flex-1 bg-transparent outline-none text-sm font-medium text-gray-900 placeholder-gray-400 ${
          disabled ? "cursor-not-allowed" : ""
        }`}
      />
    </div>
  );
}

function DateField({ label, value, onChange }) {
  return (
    <div className="mt-3">
      <label className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 mb-1 block">{label}</label>
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sky-50 ring-1 ring-transparent focus-within:ring-sky-400 focus-within:bg-white">
        <Calendar size={16} className="text-sky-600 flex-shrink-0" />
        <input
          type="datetime-local"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent outline-none text-sm flex-1 text-gray-900 font-medium"
        />
      </div>
    </div>
  );
}
