"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  ArrowRight,
  Plus,
  X,
} from "lucide-react";
// import { useWebsite } from "@/context/WebsiteContext";

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

const Hero: React.FC = () => {
  // const { website } = useWebsite();
  const website = {
    basicInfo: {
      name: "TaxiSafar",
      phone: "9876543210",
      whatsapp: "9876543210",
    },
  };

  /* ================= STATES (Same as Old Component) ================= */

  const [serviceType, setServiceType] = useState<"outstation" | "local">(
    "outstation"
  );
  const [tripType, setTripType] = useState<"one-way" | "round-trip">(
    "one-way"
  );

  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [breaks, setBreaks] = useState<string[]>([]);

  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const [error, setError] = useState("");

  /* ================= ROUND TRIP LOGIC ================= */

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

  /* ================= SUBMIT ================= */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      message
    )}`;

    window.open(whatsappURL, "_blank");
  };

  /* ================= UI ================= */

  return (
    <section className="pt-16 min-h-screen flex items-center bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
      <div className="max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-2 gap-12">

        {/* LEFT CONTENT */}
        <div className="max-w-xl">
            <div className="inline-flex items-center bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <div className="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse"></div>
              Premium Taxi Service
            </div>
            
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-dark-900 dark:text-white leading-tight mb-6">
              Your Trusted
              <span className="text-primary-600 dark:text-primary-500 block"> Ride Partner</span>
            </h1>
            
            <p className="text-xl text-dark-600 dark:text-dark-300 mb-8 leading-relaxed">
              Experience premium taxi services with professional drivers, modern vehicles, and unmatched comfort for all your travel needs.
            </p>
            
            <div className="flex flex-wrap gap-6 mb-8">
              <div className="flex items-center text-dark-600 dark:text-dark-300">
                <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                <span className="font-medium">24/7 Available</span>
              </div>
              <div className="flex items-center text-dark-600 dark:text-dark-300">
                <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                <span className="font-medium">Verified Drivers</span>
              </div>
              <div className="flex items-center text-dark-600 dark:text-dark-300">
                <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                <span className="font-medium">Best Rates</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-soft hover:shadow-soft-lg transform hover:-translate-y-0.5">
                Book Ride Now
              </button>
              <button className="border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200">
                View Services
              </button>
            </div>
          </div>

        {/* BOOKING FORM */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border">

          {/* SERVICE TYPE */}
          <div className="flex bg-gray-200 rounded-xl p-1 mb-4">
            {[
              { key: "outstation", label: "Outstation" },
              { key: "local", label: "Local / Airport" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setServiceType(item.key as any)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                  serviceType === item.key
                    ? "bg-primary-600 text-white"
                    : "text-gray-600"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* TRIP TYPE */}
          <div className="flex gap-6 mb-4">
            <label>
              <input
                type="radio"
                checked={tripType === "one-way"}
                onChange={() => setTripType("one-way")}
              />{" "}
              One Way
            </label>
            <label>
              <input
                type="radio"
                checked={tripType === "round-trip"}
                onChange={() => setTripType("round-trip")}
              />{" "}
              Round Trip
            </label>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Pickup */}
            <input
              type="text"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="Pickup location"
              className="w-full p-4 rounded-xl border"
            />

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
                  placeholder={`Stop ${i + 1}`}
                  className="flex-1 p-4 rounded-xl border"
                />
                <button type="button" onClick={() => removeBreak(i)}>
                  <X />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addBreak}
              className="text-primary-600 flex items-center gap-1"
            >
              <Plus size={16} /> Add Stop
            </button>

            {/* Drop */}
            <input
              type="text"
              value={drop}
              disabled={tripType === "round-trip"}
              onChange={(e) => setDrop(e.target.value)}
              placeholder="Drop location"
              className="w-full p-4 rounded-xl border"
            />

            {/* Pickup Date */}
            <input
              type="datetime-local"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full p-4 rounded-xl border"
            />

            {/* Return Date */}
            {tripType === "round-trip" && (
              <input
                type="datetime-local"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full p-4 rounded-xl border"
              />
            )}

            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2"
            >
              Enquiry
              <ArrowRight size={18} />
            </button>

          </form>
        </div>
      </div>
    </section>
  );
};

export default Hero;
