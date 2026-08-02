"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  ArrowRight,
  Plus,
  X,
  Car,
  Shield,
  Clock,
  LucideIcon,
  Search,
  Truck,
  Navigation,
} from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

/* ================= TYPES ================= */
type ServiceType = "outstation" | "local";
type TripType = "one-way" | "round-trip";
type VehicleType = "cars" | "vans" | "suv" | "jeep";

/* ================= FORMAT DATE ================= */
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

/* ================= VEHICLE ICONS ================= */
const VehicleIcons: Record<VehicleType, React.ReactNode> = {
  cars: (
    <svg viewBox="0 0 40 24" fill="currentColor" className="w-8 h-8">
      <path d="M38 10l-4-6H6L2 10H0v8h2l1 2h4l1-2h24l1 2h4l1-2h2v-8h-2zm-5.5 0H7.5l3-4h19l3 4zM6 16a2 2 0 110-4 2 2 0 010 4zm28 0a2 2 0 110-4 2 2 0 010 4z"/>
    </svg>
  ),
  vans: (
    <svg viewBox="0 0 44 24" fill="currentColor" className="w-8 h-8">
      <path d="M40 10l-6-8H4L1 10H0v10h4l1 2h4l1-2h22l1 2h4l1-2h4V10h-2zm-9 0H8l2-6h19l2 6zM7 18a2 2 0 110-4 2 2 0 010 4zm30 0a2 2 0 110-4 2 2 0 010 4z"/>
    </svg>
  ),
  suv: (
    <svg viewBox="0 0 44 26" fill="currentColor" className="w-8 h-8">
      <path d="M40 11l-5-9H9L4 11H0v11h4l1 2h6l1-2h20l1 2h6l1-2h4V11h-4zm-9.5 0H13.5l3-7h11l3 7zM8 20a2.5 2.5 0 110-5 2.5 2.5 0 010 5zm28 0a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/>
    </svg>
  ),
  jeep: (
    <svg viewBox="0 0 42 26" fill="currentColor" className="w-8 h-8">
      <path d="M38 10V6H4v4H0v12h4l1 2h6l1-2h18l1 2h6l1-2h4V10h-4zM8 2h26v4H8V2zm-1 18a2.5 2.5 0 110-5 2.5 2.5 0 010 5zm28 0a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/>
    </svg>
  ),
};

export default function Hero() {
  const { website } = useWebsite() as any;

  /* ===== STATES ===== */
  const [serviceType, setServiceType] = useState<ServiceType>("outstation");
  const [tripType, setTripType] = useState<TripType>("one-way");
  const [vehicleType, setVehicleType] = useState<VehicleType>("cars");
  const [pickup, setPickup] = useState<string>("");
  const [drop, setDrop] = useState<string>("");
  const [breaks, setBreaks] = useState<string[]>([]);
  const [pickupDate, setPickupDate] = useState<string>("");
  const [returnDate, setReturnDate] = useState<string>("");
  const [differentReturn, setDifferentReturn] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  /* ===== ROUND TRIP LOGIC ===== */
  useEffect(() => {
    if (tripType === "round-trip") {
      setDrop(pickup);
      setBreaks((prev) => (prev.length === 0 ? [""] : prev));
    } else {
      setBreaks([]);
    }
  }, [pickup, tripType]);

  const addBreak = () => setBreaks((prev) => [...prev, ""]);
  const removeBreak = (i: number) =>
    setBreaks((prev) => prev.filter((_, idx) => idx !== i));

  /* ===== SUBMIT ===== */
  const handleSubmit = async () => {
    setError("");
    if (!pickup.trim()) return setError("Please enter pickup location");
    if (tripType !== "round-trip" && !drop.trim()) return setError("Please enter drop location");
    if (!pickupDate) return setError("Please select pickup date & time");
    if (tripType === "round-trip" && !returnDate) return setError("Please select return date & time");

    setLoading(true);

    const whatsappNumber =
      website?.basicInfo?.whatsapp || website?.basicInfo?.phone || "919876543210";

    const message = `*New Trip Enquiry*

*${website?.basicInfo?.logo_name || "Rahul Tour & Travels"}*

*Vehicle Type:* ${vehicleType.toUpperCase()}
*Pickup Date & Time:*  
${formatDateTime(pickupDate)}
${tripType === "round-trip" ? `*Return Date & Time:*  \n${formatDateTime(returnDate)}` : ""}

*Service Type:* ${serviceType}
*Trip Type:* ${tripType === "round-trip" ? "Round Trip" : "One Way"}

*Pickup:* ${pickup}
*Drop:* ${drop || pickup}

*Stops:* ${breaks.filter(Boolean).length ? breaks.filter(Boolean).join(", ") : "No stops"}

*Total Estimate Amount:*  
*Rs ..... (All Including)*

*Extra Parking Charges Applicable*`;

    const whatsappURL = `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, "_blank");
    setLoading(false);
    alert("Thanks For Enquiry! We Will Connect You Soon 😊");
  };

  const vehicles: { key: VehicleType; label: string }[] = [
    { key: "cars", label: "Cars" },
    { key: "vans", label: "Vans" },
    { key: "suv", label: "SUV" },
    { key: "jeep", label: "Jeep" },
  ];

  /* ================= UI ================= */
  return (
    <section id="home" className="relative min-h-[600px] overflow-hidden flex items-center">
      {/* BG */}
      <div className="absolute inset-0">
        <img
          src="https://plus.unsplash.com/premium_photo-1661911000633-3320fe8b6901?q=80&w=1170&auto=format&fit=crop"
          className="w-full h-full object-cover"
          alt="Hero Background"
        />
        <div className="absolute inset-0 bg-black/65" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-12 w-full">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 items-center">

          {/* ===== LEFT CONTENT ===== */}
          <div className="text-white space-y-6 order-2 lg:order-1">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                Looking to hire<br />
                <span
                  className="relative inline-block"
                  style={{
                    background: "linear-gradient(90deg, #f97316, #fb923c)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  a vehicle?
                </span>
              </h1>
              {/* Orange underline */}
              <div className="w-40 h-1 bg-orange-500 rounded-full" />
              <p className="text-xl text-gray-200 font-medium">
                You've come to the right place.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-3 pt-2">
              {[
                "Free cancellations on most bookings",
                "500+ happy customers",
                "Customer support 24/7",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 12 10" fill="white" className="w-3 h-3">
                      <path d="M1 5l3 4L11 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <span className="text-gray-200 text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-4 border-t border-white/20">
              <div className="text-center">
                <p className="text-3xl font-extrabold text-orange-400">500+</p>
                <p className="text-gray-300 text-xs mt-1">Happy Customers</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-extrabold text-white">24/7</p>
                <p className="text-gray-300 text-xs mt-1">Service Available</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-extrabold text-orange-400">100%</p>
                <p className="text-gray-300 text-xs mt-1">On Time</p>
              </div>
            </div>
          </div>

          {/* ===== FORM ===== */}
          <div className="bg-white rounded-2xl shadow-2xl w-full order-1 lg:order-2 overflow-hidden">
            {/* Vehicle Type Tabs */}
            <div className="flex border-b border-gray-100">
              {vehicles.map((v) => (
                <button
                  key={v.key}
                  onClick={() => setVehicleType(v.key)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-4 px-2 text-xs font-semibold transition-all ${
                    vehicleType === v.key
                      ? "border-b-2 border-orange-500 text-orange-500 bg-orange-50"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <span
                    className={vehicleType === v.key ? "text-orange-500" : "text-gray-400"}
                  >
                    {VehicleIcons[v.key]}
                  </span>
                  {v.label}
                </button>
              ))}
            </div>

            <div className="p-5 space-y-4">
              {/* Service / Trip type row */}
              <div className="flex gap-3 flex-wrap">
                <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                  {(["outstation", "local"] as ServiceType[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setServiceType(s)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                        serviceType === s
                          ? "bg-white text-orange-500 shadow-sm"
                          : "text-gray-500"
                      }`}
                    >
                      {s === "local" ? "Local / Airport" : "Outstation"}
                    </button>
                  ))}
                </div>
                <div className="flex gap-4 items-center text-sm">
                  {(["one-way", "round-trip"] as TripType[]).map((t) => (
                    <label key={t} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={tripType === t}
                        onChange={() => setTripType(t)}
                        className="accent-orange-500"
                      />
                      <span className="text-gray-700 text-xs font-medium capitalize">
                        {t === "one-way" ? "One Way" : "Round Trip"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* PICK-UP label */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                  Pick-Up Location
                </p>
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-orange-400 transition-colors">
                  <Search size={16} className="text-gray-400 flex-shrink-0" />
                  <input
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    placeholder="Airport, city, postcode..."
                    className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
                  />
                  <Navigation size={16} className="text-orange-400 cursor-pointer" />
                </div>
              </div>

              {/* Different return toggle */}
              {tripType !== "round-trip" && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={differentReturn}
                    onChange={(e) => setDifferentReturn(e.target.checked)}
                    className="accent-orange-500 w-4 h-4"
                  />
                  <span className="text-sm text-gray-600">Choose a different return location</span>
                </label>
              )}

              {/* Drop field */}
              {(tripType !== "round-trip" && differentReturn) && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Drop Location
                  </p>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-orange-400">
                    <Search size={16} className="text-gray-400 flex-shrink-0" />
                    <input
                      value={drop}
                      onChange={(e) => setDrop(e.target.value)}
                      placeholder="Drop location..."
                      className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
                    />
                  </div>
                </div>
              )}

              {/* Stops */}
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
                    className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-orange-400 transition-colors"
                  />
                  <button onClick={() => removeBreak(i)} className="p-2 rounded-xl bg-red-50 hover:bg-red-100">
                    <X className="text-red-400" size={16} />
                  </button>
                </div>
              ))}

              <button
                onClick={addBreak}
                className="text-orange-500 flex items-center gap-1 text-sm font-medium hover:underline"
              >
                <Plus size={14} /> Add stop
              </button>

              {/* Date row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Date From
                  </p>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-orange-400 transition-colors">
                    <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                    <input
                      type="datetime-local"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="bg-transparent outline-none flex-1 text-xs text-gray-700"
                    />
                  </div>
                </div>
                {tripType === "round-trip" && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Date To
                    </p>
                    <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-orange-400 transition-colors">
                      <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                      <input
                        type="datetime-local"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="bg-transparent outline-none flex-1 text-xs text-gray-700"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Rental type */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Rental Type
                </p>
                <div className="flex gap-4">
                  {["Economy", "Check Payment", "Online Pay"].map((rt) => (
                    <label key={rt} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="rentalType"
                        defaultChecked={rt === "Economy"}
                        className="accent-orange-500"
                      />
                      <span className="text-xs text-gray-600">{rt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-center text-sm">{error}</p>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all text-white py-3 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-orange-200"
              >
                {loading ? "Submitting..." : "SUBMIT"}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}