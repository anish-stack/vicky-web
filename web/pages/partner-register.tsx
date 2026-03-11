"use client";

import { useState, useRef } from "react";

type Category = "tour_guide" | "rto_service" | "car_accessory" | "car_mechanic";

const CATEGORIES = [
  { value: "tour_guide", label: "Tour Guide", icon: "🧭" },
  { value: "rto_service", label: "RTO Service", icon: "🚗" },
  { value: "car_accessory", label: "Car Accessory", icon: "🔧" },
  { value: "car_mechanic", label: "Car Mechanic", icon: "⚙️" },
] as const;

type FormState = {
  // Basic
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  address: string;
  description: string;
  profileImage: File | null;

  // Social
  facebook: string;
  instagram: string;
  youtube: string;
  website: string;
  whatsapp: string;

  // Tour Guide
  experienceYears: string;
  languages: string;
  guideLicenseNumber: string;
  servicesOffered: string;
  tourImages: FileList | null;

  // RTO
  officeName: string;
  officeAddress: string;
  services: string;

  // Car Accessory
  shopName: string;
  shopAddress: string;
  accessoryTypes: string;
  shopImages: FileList | null;

  // Car Mechanic
  garageName: string;
  garageAddress: string;
  mechanicExperience: string;
  specialization: string;
  garageImages: FileList | null;
};

const INITIAL_FORM: FormState = {
  name: "", email: "", phone: "", city: "", state: "", address: "", description: "",
  profileImage: null,
  facebook: "", instagram: "", youtube: "", website: "", whatsapp: "",
  experienceYears: "", languages: "", guideLicenseNumber: "", servicesOffered: "", tourImages: null,
  officeName: "", officeAddress: "", services: "",
  shopName: "", shopAddress: "", accessoryTypes: "", shopImages: null,
  garageName: "", garageAddress: "", mechanicExperience: "", specialization: "", garageImages: null,
};

export default function RegisterPage() {
  const [category, setCategory] = useState<Category | "">("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [otp, setOtp] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const profileRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const files = (e.target as HTMLInputElement).files;

    if (files && name === "profileImage") {
      setForm({ ...form, profileImage: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else if (files && name === "tourImages") {
      setForm({ ...form, tourImages: files });
    } else if (files && name === "shopImages") {
      setForm({ ...form, shopImages: files });
    } else if (files && name === "garageImages") {
      setForm({ ...form, garageImages: files });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const buildFormData = (): FormData => {
    const data = new FormData();

    // Basic fields
    data.append("name", form.name);
    data.append("email", form.email);
    data.append("phone", form.phone);
    data.append("category", category);
    if (form.description) data.append("description", form.description);
    if (form.city) data.append("city", form.city);
    if (form.state) data.append("state", form.state);
    if (form.address) data.append("address", form.address);

    // Profile image
    if (form.profileImage) data.append("profileImage", form.profileImage);

    // Social links
    if (form.facebook) data.append("facebook", form.facebook);
    if (form.instagram) data.append("instagram", form.instagram);
    if (form.youtube) data.append("youtube", form.youtube);
    if (form.website) data.append("website", form.website);
    if (form.whatsapp) data.append("whatsapp", form.whatsapp);

    // Category-specific fields
    if (category === "tour_guide") {
      data.append("experienceYears", form.experienceYears);
      data.append("languages", form.languages);
      if (form.guideLicenseNumber) data.append("guideLicenseNumber", form.guideLicenseNumber);
      if (form.servicesOffered) data.append("servicesOffered", form.servicesOffered);
      if (form.tourImages) {
        for (let i = 0; i < form.tourImages.length; i++) {
          data.append("tourImages", form.tourImages[i]);
        }
      }
    }

    if (category === "rto_service") {
      data.append("officeName", form.officeName);
      data.append("officeAddress", form.officeAddress);
      if (form.services) data.append("services", form.services);
    }

    if (category === "car_accessory") {
      data.append("shopName", form.shopName);
      if (form.shopAddress) data.append("shopAddress", form.shopAddress);
      if (form.accessoryTypes) data.append("accessoryTypes", form.accessoryTypes);
      if (form.shopImages) {
        for (let i = 0; i < form.shopImages.length; i++) {
          data.append("shopImages", form.shopImages[i]);
        }
      }
    }

    if (category === "car_mechanic") {
      data.append("garageName", form.garageName);
      if (form.garageAddress) data.append("garageAddress", form.garageAddress);
      if (form.mechanicExperience) data.append("mechanicExperience", form.mechanicExperience);
      if (form.specialization) data.append("specialization", form.specialization);
      if (form.garageImages) {
        for (let i = 0; i < form.garageImages.length; i++) {
          data.append("garageImages", form.garageImages[i]);
        }
      }
    }

    return data;
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return alert("Please select a category.");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        body: buildFormData(),
      });

      const result = await res.json();

      if (result.success) {
        setStep("otp");
      } else {
        alert(result.message);
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp.trim()) return alert("Please enter OTP.");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-register-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone, otp: otp.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Registration Completed! Your profile is under review.");
      } else {
        alert(data.message);
      }
    } catch {
      alert("OTP verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E52710]/30 focus:border-[#E52710] transition bg-gray-50 placeholder:text-gray-400";
  const labelCls = "block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-red-50 mt-16 flex items-center justify-center p-4 pt-20">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden">

        <div className="grid md:grid-cols-[340px_1fr]">

          {/* LEFT PANEL */}
          <div className="bg-[#E52710] text-white p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/10 rounded-full" />
            <div className="absolute -bottom-20 -right-10 w-72 h-72 bg-black/10 rounded-full" />

            <div className="relative z-10">
              {/* <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl mb-8">🚀</div> */}
              <h1 className="text-3xl font-bold leading-tight mb-4">
                Join Our<br />Service Network
              </h1>
              <p className="text-white/80 text-sm leading-relaxed">
                Register as a service provider and start receiving customers directly from our platform.
              </p>

              <div className="mt-10 space-y-4">
                {["Get more customers", "Increase your visibility", "Grow your business"].map((t) => (
                  <div key={t} className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">✔</div>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {step === "form" && (
              <div className="relative z-10 mt-10">
                <div className="bg-white/10 rounded-2xl p-4 text-sm">
                  <div className="font-semibold mb-2">Registration Steps</div>
                  <div className="space-y-2 text-white/70">
                    <div className={`flex gap-2 items-center ${step === "form" ? "text-white font-medium" : ""}`}>
                      <span className="w-5 h-5 rounded-full bg-white/30 text-xs flex items-center justify-center">1</span>
                      Fill Details
                    </div>
                    <div className="flex gap-2 items-center text-white/40">
                      <span className="w-5 h-5 rounded-full bg-white/20 text-xs flex items-center justify-center">2</span>
                      Verify OTP
                    </div>
                    <div className="flex gap-2 items-center text-white/40">
                      <span className="w-5 h-5 rounded-full bg-white/20 text-xs flex items-center justify-center">3</span>
                      Admin Review
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT FORM */}
          <div className="p-8 overflow-y-auto max-h-[90vh]">

            {/* ========= STEP: FORM ========= */}
            {step === "form" && (
              <form onSubmit={submitForm} className="space-y-7">

                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Provider Registration</h2>
                  <p className="text-sm text-gray-400 mt-1">Fill all required fields to complete your profile</p>
                </div>

                {/* PROFILE IMAGE */}
                <div>
                  <label className={labelCls}>Profile Photo</label>
                  <div className="flex items-center gap-4">
                    <div
                      onClick={() => profileRef.current?.click()}
                      className="w-20 h-20 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center cursor-pointer hover:border-[#E52710] transition"
                    >
                      {preview
                        ? <img src={preview} className="w-full h-full object-cover" />
                        : <span className="text-2xl">📷</span>
                      }
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => profileRef.current?.click()}
                        className="text-sm text-[#E52710] font-semibold border border-[#E52710]/30 rounded-lg px-4 py-2 hover:bg-red-50 transition"
                      >
                        Upload Photo
                      </button>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
                    </div>
                    <input
                      ref={profileRef}
                      type="file"
                      name="profileImage"
                      accept="image/*"
                      onChange={handleChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* BASIC INFO */}
                <div>
                  <label className={labelCls}>Basic Information</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input name="name" placeholder="Full Name *" className={inputCls} onChange={handleChange} required />
                    </div>
                    <div>
                      <input name="email" type="email" placeholder="Email Address *" className={inputCls} onChange={handleChange} required />
                    </div>
                    <div>
                      <input name="phone" placeholder="Phone Number *" className={inputCls} onChange={handleChange} required />
                    </div>
                    <div>
                      <input name="city" placeholder="City" className={inputCls} onChange={handleChange} />
                    </div>
                    <div>
                      <input name="state" placeholder="State" className={inputCls} onChange={handleChange} />
                    </div>
                    <div>
                      <input name="address" placeholder="Address" className={inputCls} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <textarea
                      name="description"
                      placeholder="About yourself / your business..."
                      rows={3}
                      className={inputCls + " resize-none"}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* CATEGORY SELECT */}
                <div>
                  <label className={labelCls}>Select Category *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {CATEGORIES.map(({ value, label, icon }) => (
                      <div
                        key={value}
                        onClick={() => setCategory(value)}
                        className={`border-2 rounded-xl p-4 cursor-pointer transition flex items-center gap-3
                          ${category === value
                            ? "border-[#E52710] bg-red-50 text-[#E52710]"
                            : "border-gray-200 hover:border-gray-300 text-gray-700"
                          }`}
                      >
                        <span className="text-xl">{icon}</span>
                        <span className="font-medium text-sm">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ---- TOUR GUIDE FIELDS ---- */}
                {category === "tour_guide" && (
                  <div className="space-y-3 p-5 bg-orange-50 rounded-2xl border border-orange-100">
                    <label className={labelCls + " text-orange-700"}>🧭 Tour Guide Details</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        name="experienceYears"
                        type="number"
                        placeholder="Experience Years *"
                        className={inputCls}
                        onChange={handleChange}
                        required
                      />
                      <input
                        name="languages"
                        placeholder="Languages (e.g. Hindi, English) *"
                        className={inputCls}
                        onChange={handleChange}
                        required
                      />
                      <input
                        name="guideLicenseNumber"
                        placeholder="Guide License Number"
                        className={inputCls}
                        onChange={handleChange}
                      />
                      <input
                        name="servicesOffered"
                        placeholder="Services (e.g. Trekking, City Tour)"
                        className={inputCls}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Tour Images</label>
                      <input
                        type="file"
                        name="tourImages"
                        multiple
                        accept="image/*"
                        onChange={handleChange}
                        className="text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#E52710] file:text-white hover:file:opacity-90"
                      />
                      <p className="text-xs text-gray-400 mt-1">Comma-separated for languages/services (e.g. Hindi, English)</p>
                    </div>
                  </div>
                )}

                {/* ---- RTO SERVICE FIELDS ---- */}
                {category === "rto_service" && (
                  <div className="space-y-3 p-5 bg-blue-50 rounded-2xl border border-blue-100">
                    <label className={labelCls + " text-blue-700"}>🚗 RTO Service Details</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        name="officeName"
                        placeholder="Office Name *"
                        className={inputCls}
                        onChange={handleChange}
                        required
                      />
                      <input
                        name="officeAddress"
                        placeholder="Office Address *"
                        className={inputCls}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <input
                      name="services"
                      placeholder="Services offered (e.g. Driving License, RC Transfer)"
                      className={inputCls}
                      onChange={handleChange}
                    />
                    <p className="text-xs text-gray-400">Comma-separated services</p>
                  </div>
                )}

                {/* ---- CAR ACCESSORY FIELDS ---- */}
                {category === "car_accessory" && (
                  <div className="space-y-3 p-5 bg-green-50 rounded-2xl border border-green-100">
                    <label className={labelCls + " text-green-700"}>🔧 Car Accessory Shop Details</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        name="shopName"
                        placeholder="Shop Name *"
                        className={inputCls}
                        onChange={handleChange}
                        required
                      />
                      <input
                        name="shopAddress"
                        placeholder="Shop Address"
                        className={inputCls}
                        onChange={handleChange}
                      />
                    </div>
                    <input
                      name="accessoryTypes"
                      placeholder="Accessory Types (e.g. Seat Cover, Music System)"
                      className={inputCls}
                      onChange={handleChange}
                    />
                    <div>
                      <label className={labelCls}>Shop Images</label>
                      <input
                        type="file"
                        name="shopImages"
                        multiple
                        accept="image/*"
                        onChange={handleChange}
                        className="text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#E52710] file:text-white hover:file:opacity-90"
                      />
                    </div>
                    <p className="text-xs text-gray-400">Comma-separated accessory types</p>
                  </div>
                )}

                {/* ---- CAR MECHANIC FIELDS ---- */}
                {category === "car_mechanic" && (
                  <div className="space-y-3 p-5 bg-purple-50 rounded-2xl border border-purple-100">
                    <label className={labelCls + " text-purple-700"}>⚙️ Car Mechanic / Garage Details</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        name="garageName"
                        placeholder="Garage Name *"
                        className={inputCls}
                        onChange={handleChange}
                        required
                      />
                      <input
                        name="garageAddress"
                        placeholder="Garage Address"
                        className={inputCls}
                        onChange={handleChange}
                      />
                      <input
                        name="mechanicExperience"
                        type="number"
                        placeholder="Experience (years)"
                        className={inputCls}
                        onChange={handleChange}
                      />
                      <input
                        name="specialization"
                        placeholder="Specialization (e.g. Engine, Electrical)"
                        className={inputCls}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Garage Images</label>
                      <input
                        type="file"
                        name="garageImages"
                        multiple
                        accept="image/*"
                        onChange={handleChange}
                        className="text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#E52710] file:text-white hover:file:opacity-90"
                      />
                    </div>
                    <p className="text-xs text-gray-400">Comma-separated specializations</p>
                  </div>
                )}

                {/* SOCIAL LINKS - Collapsible */}
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowSocial(!showSocial)}
                    className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition text-sm font-semibold text-gray-700"
                  >
                    <span>🔗 Social Links <span className="text-gray-400 font-normal">(optional)</span></span>
                    <span className="text-gray-400">{showSocial ? "▲" : "▼"}</span>
                  </button>

                  {showSocial && (
                    <div className="p-5 grid grid-cols-2 gap-3">
                      <input name="facebook" placeholder="Facebook URL" className={inputCls} onChange={handleChange} />
                      <input name="instagram" placeholder="Instagram URL" className={inputCls} onChange={handleChange} />
                      <input name="youtube" placeholder="YouTube URL" className={inputCls} onChange={handleChange} />
                      <input name="website" placeholder="Website URL" className={inputCls} onChange={handleChange} />
                      <input name="whatsapp" placeholder="WhatsApp Number" className={inputCls} onChange={handleChange} />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#E52710] text-white py-4 rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-60 tracking-wide"
                >
                  {loading ? "Registering..." : "Register Now →"}
                </button>

              </form>
            )}

            {/* ========= STEP: OTP ========= */}
            {step === "otp" && (
              <div className="flex flex-col justify-center h-full space-y-6 py-10">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-3xl mx-auto">
                  📱
                </div>

                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-800">Verify Your Number</h2>
                  <p className="text-gray-500 text-sm mt-2">
                    OTP sent to your WhatsApp: <span className="font-semibold text-gray-700">{form.phone}</span>
                  </p>
                </div>

                <div>
                  <label className={labelCls + " text-center block"}>Enter OTP</label>
                  <input
                    className={inputCls + " text-center text-2xl tracking-[0.5em] font-bold"}
                    placeholder="• • • • • •"
                    maxLength={6}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>

                <button
                  onClick={verifyOTP}
                  disabled={loading}
                  className="w-full bg-[#E52710] text-white py-4 rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-60"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <p className="text-center text-xs text-gray-400">
                  Didn't receive OTP? Check your WhatsApp or{" "}
                  <button
                    type="button"
                    onClick={() => setStep("form")}
                    className="text-[#E52710] font-semibold hover:underline"
                  >
                    go back
                  </button>
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}