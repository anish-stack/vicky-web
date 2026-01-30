"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { MapPin, Calendar, ArrowRight, Plus, X } from "lucide-react"
import heroImage from './hero.jpg'
/* ================= HERO ================= */

export default function Hero() {
  const [serviceType, setServiceType] = useState("outstation")
  const [tripType, setTripType] = useState("one-way")
  const [pickup, setPickup] = useState("")
  const [drop, setDrop] = useState("")

  // one-way = no stop, round-trip = one stop
  const [breaks, setBreaks] = useState([])

  useEffect(() => {
    if (tripType === "round-trip") {
      setDrop(pickup)
      setBreaks(prev => (prev.length === 0 ? [""] : prev))
    } else {
      setBreaks([])
    }
  }, [pickup, tripType])

  const addBreak = () => setBreaks(prev => [...prev, ""])
  const removeBreak = i => setBreaks(prev => prev.filter((_, idx) => idx !== i))

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

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* FORM */}
          <div className="bg-white rounded-2xl shadow-xl p-5 md:p-6 w-full lg:max-w-md">
            {/* SERVICE TYPE */}
            <div className="flex bg-gray-200 rounded-xl p-1 mb-4">
              {[
                { key: "outstation", label: "Outstation" },
                { key: "local", label: "Local / Airport" }
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => setServiceType(item.key)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${serviceType === item.key
                      ? "bg-white text-red-600 shadow"
                      : "text-gray-600"
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* TRIP TYPE */}
            <div className="flex gap-6 text-sm mb-5">
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
              <div key={i} className="flex gap-2 mt-3">
                <input
                  value={b}
                  onChange={e => {
                    const copy = [...breaks]
                    copy[i] = e.target.value
                    setBreaks(copy)
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
              onClick={addBreak}
              className="mt-3 text-sm text-red-600 font-medium flex items-center gap-1"
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
            <DateInput label="Pickup Date & Time" />

            {/* RETURN DATE */}
            {tripType === "round-trip" && (
              <DateInput label="Return Date & Time" />
            )}

            {/* CTA */}
            <button className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
              Enquiry <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE IMAGE */}
      <div className="lg:hidden w-full">
        <Image
          src="/images/hero.jpg"
          alt="Taxi booking"
          width={1200}
          height={300}
          className="w-full h-[250px] object-cover"
        />
      </div>
    </section>
  )
}

/* ================= INPUT ================= */

function Input({
  icon: Icon,
  placeholder,
  value,
  onChange,
  disabled,
  disabledStyle
}) {
  return (
    <div className="mt-4 flex items-center gap-2 bg-gray-200 px-4 py-3 rounded-xl">
      <Icon size={18} className="text-gray-400" />
      <input
        value={value}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`flex-1 bg-transparent outline-none text-sm ${disabledStyle ? "cursor-not-allowed text-gray-400" : ""
          }`}
      />
    </div>
  )
}

/* ================= DATE INPUT ================= */

function DateInput({ label }) {
  return (
    <div className="mt-4">
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <div className="flex items-center gap-2 bg-gray-200 px-4 py-3 rounded-xl">
        <Calendar size={18} className="text-gray-400" />
        <input
          type="datetime-local"
          className="bg-transparent outline-none text-sm flex-1"
        />
      </div>
    </div>
  )
}
