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
} from "lucide-react";
import { useWebsite } from "@/context/WebsiteContext";

/* ================= TYPES ================= */

type ServiceType = "outstation" | "local";
type TripType = "one-way" | "round-trip";

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

export default function Hero() {
  const { website } = useWebsite() as any;
  // const website = [];

  /* ===== STATES ===== */

  const [serviceType, setServiceType] = useState<ServiceType>("outstation");

  const [tripType, setTripType] = useState<TripType>("one-way");

  const [pickup, setPickup] = useState<string>("");
  const [drop, setDrop] = useState<string>("");
  const [breaks, setBreaks] = useState<string[]>([]);

  const [pickupDate, setPickupDate] = useState<string>("");
  const [returnDate, setReturnDate] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

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

    if (!pickup.trim()) {
      setError("Please enter pickup location");
      return;
    }

    if (tripType !== "round-trip" && !drop.trim()) {
      setError("Please enter drop location");
      return;
    }

    if (!pickupDate) {
      setError("Please select pickup date & time");
      return;
    }

    if (tripType === "round-trip" && !returnDate) {
      setError("Please select return date & time");
      return;
    }

    setLoading(true);

    const whatsappNumber =
      website?.basicInfo?.whatsapp ||
      website?.basicInfo?.phone ||
      "919876543210";

    const message = `
🚖 *New Trip Enquiry*

🔹 *Service Type:* ${serviceType}
🔹 *Trip Type:* ${tripType}

📍 *Pickup:* ${pickup}
📍 *Drop:* ${drop || pickup}

🛑 *Stops:* ${
      breaks.filter(Boolean).length
        ? breaks.filter(Boolean).join(", ")
        : "No stops"
    }

📅 *Pickup Date & Time:* ${formatDateTime(pickupDate)}

${
  tripType === "round-trip"
    ? `📅 *Return Date & Time:* ${formatDateTime(returnDate)}`
    : ""
}

🌐 *Website:* ${website?.basicInfo?.name || "TaxiSafar"}
`;

    const whatsappURL = `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(
      message,
    )}`;

    window.open(whatsappURL, "_blank");

    setSubmitted(true);
    setLoading(false);

    alert("Thanks For Enquiry! We Will Connect You Soon 😊");
  };

  /* ================= UI ================= */

  return (
    <section className="relative overflow-hidden">
      {/* BG */}
      <div className="absolute inset-0">
        <img
          src="https://plus.unsplash.com/premium_photo-1661911000633-3320fe8b6901?q=80&w=1170&auto=format&fit=crop"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-10">
          {/* ================= FORM ================= */}
          <div className="bg-white rounded-2xl shadow-xl p-3 sm:p-6 md:p-5 w-full order-1">
            {/* SERVICE TYPE */}
            <div className="flex bg-gray-200 rounded-xl p-1 mb-3">
              {[
                { key: "outstation", label: "Outstation" },
                { key: "local", label: "Local / Airport" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setServiceType(item.key as ServiceType)}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-semibold ${
                    serviceType === item.key
                      ? "bg-white text-[#EAB308] shadow"
                      : "text-gray-600"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* TRIP TYPE */}
            <div className="flex gap-6 text-sm mb-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={tripType === "one-way"}
                  onChange={() => setTripType("one-way")}
                />
                One Way Trip
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={tripType === "round-trip"}
                  onChange={() => setTripType("round-trip")}
                />
                Round Trip
              </label>
            </div>

            {/* PICKUP */}
            <Input
              icon={MapPin}
              placeholder="Pickup location"
              value={pickup}
              onChange={setPickup}
            />

            {/* STOPS */}
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
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-200 outline-none"
                />
                <button onClick={() => removeBreak(i)}>
                  <X className="text-red-500" size={18} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addBreak}
              className="mt-3 text-[#EAB308] flex items-center gap-1 text-sm font-medium hover:underline"
            >
              <Plus size={16} /> Add stop
            </button>

            {/* DROP */}
            <Input
              icon={MapPin}
              placeholder="Drop location"
              value={drop}
              onChange={setDrop}
              disabled={tripType === "round-trip"}
              disabledStyle={tripType === "round-trip"}
            />

            {/* PICKUP DATE */}
            <DateInput
              label="Pickup Date & Time"
              value={pickupDate}
              onChange={setPickupDate}
            />

            {/* RETURN DATE */}
            {tripType === "round-trip" && (
              <DateInput
                label="Return Date & Time"
                value={returnDate}
                onChange={setReturnDate}
              />
            )}

            {error && (
              <p className="text-[#EAB308] text-center text-sm mt-3">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-6 w-full bg-[#EAB308] hover:bg-[#c99702] text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Enquiry"}
              <ArrowRight size={18} />
            </button>
          </div>

          {/* ================= RIGHT CONTENT ================= */}
          <div className="text-white space-y-6 order-2 flex flex-col justify-center h-full">
            <div className="space-y-4">
              <h1 className="text-3xl lg:text-5xl font-bold leading-tight">
                Explore with <span className="text-yellow-400">{website?.basicInfo?.name}</span>
              </h1>

              <p className="text-xl text-gray-200 leading-relaxed max-w-lg">
                Safe and secure taxi service with quality and reliable service.
                Your journey starts here.
              </p>
            </div>

            <div className="flex flex-wrap gap-8 pt-8">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-500/20 p-3 rounded-full">
                  <Car className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">500+</p>
                  <p className="text-gray-300 text-sm">Happy Customers</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-gray-500/20 p-3 rounded-full">
                  <Shield className="h-6 w-6 text-gray-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">24/7</p>
                  <p className="text-gray-300 text-sm">Service Available</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-yellow-600/20 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">100%</p>
                  <p className="text-gray-300 text-sm">On Time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= INPUT ================= */

type InputProps = {
  icon: LucideIcon;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  disabledStyle?: boolean;
};

function Input({
  icon: Icon,
  placeholder,
  value,
  onChange,
  disabled,
  disabledStyle,
}: InputProps) {
  return (
    <div className="mt-3 flex items-center gap-2 bg-gray-200 px-4 py-2.5 rounded-xl">
      <Icon size={18} className="text-gray-400" />
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`flex-1 bg-transparent outline-none ${
          disabledStyle ? "cursor-not-allowed text-gray-400" : ""
        }`}
      />
    </div>
  );
}

/* ================= DATE ================= */

type DateInputProps = {
  label: string;
  value: string;
  onChange: (val: string) => void;
};

function DateInput({ label, value, onChange }: DateInputProps) {
  return (
    <div className="mt-3">
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <div className="flex items-center gap-2 bg-gray-200 px-4 py-2.5 rounded-xl">
        <Calendar size={18} className="text-gray-400" />
        <input
          type="datetime-local"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent outline-none flex-1"
        />
      </div>
    </div>
  );
}

/* ================= STAT ================= */

type StatProps = {
  icon: LucideIcon;
  text: string;
};

function Stat({ icon: Icon, text }: StatProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-yellow-500/20 p-3 rounded-full">
        <Icon className="text-yellow-400" />
      </div>
      <p>{text}</p>
    </div>
  );
}
