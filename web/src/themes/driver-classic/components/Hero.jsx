"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { MapPin, Calendar, ArrowRight, Plus, X } from "lucide-react";
import heroImage from "./hero.jpg";
import axios from "axios";
import { useWebsite } from "@/context/WebsiteContext";

const API_URL = "https://www.driverwebiste.taxisafar.com/api";

const formatDateTime = (value) => {
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
  const { website } = useWebsite();
  const [serviceType, setServiceType] = useState("outstation");
  const [tripType, setTripType] = useState("one-way");
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [breaks, setBreaks] = useState([]);

  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (tripType === "round-trip") {
      setDrop(pickup);
      setBreaks((prev) => (prev.length === 0 ? [""] : prev));
    } else {
      setBreaks([]);
    }
  }, [pickup, tripType]);

  const addBreak = () => setBreaks((prev) => [...prev, ""]);
  const removeBreak = (i) =>
    setBreaks((prev) => prev.filter((_, idx) => idx !== i));

  // const handleSubmit = async () => {
  //   setError("")

  //   if (!pickup.trim()) {
  //     setError("Please enter pickup location")
  //     return
  //   }
  //   if (tripType !== "round-trip" && !drop.trim()) {
  //     setError("Please enter drop location")
  //     return
  //   }
  //   if (!pickupDate) {
  //     setError("Please select pickup date & time")
  //     return
  //   }
  //   if (tripType === "round-trip" && !returnDate) {
  //     setError("Please select return date & time")
  //     return
  //   }
  //   setLoading(true)

  //   try {
  //     const payload = {
  //       trip: serviceType,
  //       trip_type: tripType === "one-way" ? "one_way" : "round_trip",
  //       pickup,
  //       drop,
  //       stops: breaks.filter(Boolean),
  //       pickupDateAndTime: pickupDate,
  //       returnDateAndTime: tripType === "round-trip" ? returnDate : null,
  //       website
  //     }
  //     await axios.post(`${API_URL}/trip`, payload)
  //     setSubmitted(true)
  //     alert("Thanks For Enquiry We Will Connect You Soon Thankyou")
  //     setError("")
  //   } catch (err) {
  //     console.error(err)
  //     setError("Failed to submit enquiry. Please try again.")
  //   } finally {
  //     setLoading(false)
  //   }
  // }

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

${tripType === "round-trip" ? `📅 *Return Date & Time:* ${formatDateTime(returnDate)}` : ""}

🌐 *Website:* ${website?.basicInfo?.name || "TaxiSafar"}
  `;

    const whatsappURL = `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(
      message,
    )}`;

    window.open(whatsappURL, "_blank");

    setSubmitted(true);
    alert("Thanks For Enquiry! We Will Connect You Soon 😊");
  };

  return (
    <section id="home" className="relative bg-white overflow-hidden">
      {/* DESKTOP BG */}
      <div className="hidden lg:block absolute inset-0">
        <Image
          src={heroImage}
          alt="Taxi booking"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-0 sm:px-4 !py-0 lg:!py-6">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* FORM - centered on mobile */}
          <div className="bg-white rounded-2xl shadow-xl p-3 sm:p-6 md:p-5 w-full lg:max-w-md order-1">
            {/* SERVICE TYPE */}
            <div className="flex bg-gray-200 rounded-xl p-1 mb-3 sm:mb-3">
              {[
                { key: "outstation", label: "Outstation" },
                { key: "local", label: "Local / Airport" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setServiceType(item.key)}
                  className={`flex-1 py-1.5 rounded-lg text-sm sm:text-base font-semibold transition ${
                    serviceType === item.key
                      ? "bg-white text-red-600 shadow"
                      : "text-gray-600"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* TRIP TYPE */}
            <div className="flex gap-6 sm:gap-8 text-sm sm:text-base mb-3 sm:mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={tripType === "one-way"}
                  onChange={() => setTripType("one-way")}
                />
                One Way Trip
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
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
              <div key={i} className="flex gap-2 mt-3 sm:mt-4">
                <input
                  value={b}
                  onChange={(e) => {
                    const copy = [...breaks];
                    copy[i] = e.target.value;
                    setBreaks(copy);
                  }}
                  placeholder={`Stop ${i + 1} (optional)`}
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-200 outline-none text-sm sm:text-base"
                />
                <button
                  onClick={() => removeBreak(i)}
                  className="p-2 sm:p-3 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="text-red-500" size={18} />
                </button>
              </div>
            ))}

            <button
              onClick={addBreak}
              className="mt-3 sm:mt-3 text-sm sm:text-base text-red-600 font-medium flex items-center gap-1 hover:underline"
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
              <p className="mt-4 sm:mt-5 text-red-600 text-center text-sm sm:text-base">
                {error}
              </p>
            )}

            {/* CTA */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`mt-6 sm:mt-7 w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors ${loading ? "cursor-wait" : ""}`}
            >
              {loading ? "Submitting..." : "Enquiry"} <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE IMAGE - shown first on small screens */}
      <div className="lg:hidden w-full order-2">
        <Image
          src={heroImage}
          alt="Taxi booking"
          width={1200}
          height={400}
          className="w-full h-[220px] sm:h-[260px] md:h-[300px] object-cover"
          priority
        />
      </div>
    </section>
  );
}

/* ================= INPUT ================= */

function Input({
  icon: Icon,
  placeholder,
  value,
  onChange,
  disabled,
  disabledStyle,
}) {
  return (
    <div className="mt-3 sm:mt-3 flex items-center gap-2 sm:gap-3 bg-gray-200 px-4 py-2.5 rounded-xl">
      <Icon size={18} className="text-gray-400 flex-shrink-0" />
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`flex-1 bg-transparent outline-none text-sm sm:text-base ${disabledStyle ? "cursor-not-allowed text-gray-400" : ""}`}
      />
    </div>
  );
}

/* ================= DATE INPUT ================= */

function DateInput({ label, value, onChange }) {
  return (
    <div className="mt-3 sm:mt-3">
      <label className="text-xs sm:text-sm text-gray-500 mb-1 block">
        {label}
      </label>
      <div className="flex items-center gap-2 sm:gap-3 bg-gray-200 px-4 py-2.5 rounded-xl">
        <Calendar size={18} className="text-gray-400 flex-shrink-0" />
        <input
          type="datetime-local"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent outline-none text-sm sm:text-base flex-1"
        />
      </div>
    </div>
  );
}
