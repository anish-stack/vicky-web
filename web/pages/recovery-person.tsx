"use client";

import axios from "axios";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  MapPin,
  Phone,
  Mail,
  User,
  Building2,
  Wrench,
  Check,
  Clock,
  Shield,
  ArrowRight,
  ArrowLeft,
  Camera,
  CreditCard,
  AlertCircle,
  Loader2,
  IdCard,
  X,
  Image as ImageIcon,
} from "lucide-react";
import Swal from "sweetalert2";
import INDIAN_STATES_CITIES, { STATE_LIST } from "@/data/indianStatesCities";

const API_BASE = "http://localhost:5001/api/auth";
const DRAFT_KEY = "recovery_register_draft";
const OTP_LENGTH = 6;
const RESEND_COOLDOWN_MS = 60 * 1000;

const SERVICE_OPTIONS = [
  "Breakdown Recovery",
  "Accident Recovery",
  "Bike Recovery",
  "Jump Start Service",
  "Fuel Delivery",
  "Towing",
  "Flat Tyre"
];

const VEHICLE_TYPE_OPTIONS = [
  "Hatchback",
  "Sedan",
  "SUV",
  "MPV",
  "Luxury Cars",
  "Commercial"
];

type Address = {
  line1: string;
  city: string;
  state: string;
  pincode: string;
};

type FormState = {
  name: string;
  garageName: string;
  operatorName: string;
  phone: string;
  email: string;
  licenseNumber: string;
  experienceYears: string;
  startingPrice: string;
  serviceArea: string;
  tagline: string;
  about: string;
  availabilitySummary: string;
  address: Address;
  servicesOffered: string[];
  vehiclesRecoveredTypes: string[];
};

type Draft = {
  step: 1 | 2 | 3;
  formData: FormState;
  resendAvailableAt: number | null;
  providerId?: string;
};

const emptyForm: FormState = {
  name: "",
  garageName: "",
  operatorName: "",
  phone: "",
  email: "",
  licenseNumber: "",
  experienceYears: "",
  startingPrice: "",
  serviceArea: "",
  tagline: "Fast | Safe | Reliable",
  about: "",
  availabilitySummary: "24x7 (All Days)",
  address: { line1: "", city: "", state: "", pincode: "" },
  servicesOffered: ["Breakdown Recovery", "Accident Recovery", "Bike Recovery", "Jump Start Service", "Fuel Delivery"],
  vehiclesRecoveredTypes: ["Hatchback", "Sedan", "SUV", "MPV", "Luxury Cars", "Commercial"],
};

const loadDraft = (): Draft | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.formData) return null;
    return parsed as Draft;
  } catch {
    return null;
  }
};

const saveDraft = (draft: Draft) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
};

const clearDraft = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_KEY);
};

const phoneRegex = /^[6-9]\d{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const pincodeRegex = /^\d{6}$/;

const RecoveryVehicleRegister = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Gallery Images State
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(null);
  const [resendLeft, setResendLeft] = useState(0);
  const [resending, setResending] = useState(false);
  const [providerName, setProviderName] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const cities = formData.address.state ? INDIAN_STATES_CITIES[formData.address.state] || [] : [];

  const syncStepToUrl = useCallback(
    (n: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("step", String(n));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const goToStep = (n: 1 | 2 | 3, extra?: Partial<Draft>) => {
    setStep(n);
    syncStepToUrl(n);
    saveDraft({
      step: n,
      formData,
      resendAvailableAt,
      ...extra,
    });
  };

  useEffect(() => {
    const draft = loadDraft();
    const urlStep = parseInt(searchParams.get("step") || "1", 10) as 1 | 2 | 3;

    if (draft) {
      // Merge draft with default emptyForm to ensure array safety
      setFormData({
        ...emptyForm,
        ...draft.formData,
        servicesOffered: draft.formData.servicesOffered || emptyForm.servicesOffered,
        vehiclesRecoveredTypes: draft.formData.vehiclesRecoveredTypes || emptyForm.vehiclesRecoveredTypes,
        address: { ...emptyForm.address, ...(draft.formData.address || {}) }
      });
      if (draft.resendAvailableAt) setResendAvailableAt(draft.resendAvailableAt);
      if (draft.providerId) setProviderName(draft.formData.name);

      const effectiveStep = draft.step;
      setStep(effectiveStep);
      if (urlStep !== effectiveStep) syncStepToUrl(effectiveStep);
    } else if (urlStep !== 1) {
      syncStepToUrl(1);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!resendAvailableAt) {
      setResendLeft(0);
      return;
    }
    const tick = () => {
      const left = Math.max(0, Math.ceil((resendAvailableAt - Date.now()) / 1000));
      setResendLeft(left);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [resendAvailableAt]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      galleryPreviews.forEach((p) => URL.revokeObjectURL(p));
    };
  }, [imagePreview, galleryPreviews]);

  const updateField = (field: keyof FormState, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (hydrated) saveDraft({ step, formData: next, resendAvailableAt });
      return next;
    });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const updateAddress = (field: keyof Address, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, address: { ...prev.address, [field]: value } };
      if (hydrated) saveDraft({ step, formData: next, resendAvailableAt });
      return next;
    });
    if (errors[`address.${field}`]) setErrors((prev) => ({ ...prev, [`address.${field}`]: "" }));
  };

  const toggleServiceItem = (service: string) => {
    const currentList = formData.servicesOffered || [];
    const exists = currentList.includes(service);
    const updated = exists ? currentList.filter(s => s !== service) : [...currentList, service];
    updateField("servicesOffered", updated);
  };

  const toggleVehicleItem = (vehicle: string) => {
    const currentList = formData.vehiclesRecoveredTypes || [];
    const exists = currentList.includes(vehicle);
    const updated = exists ? currentList.filter(v => v !== vehicle) : [...currentList, vehicle];
    updateField("vehiclesRecoveredTypes", updated);
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      Swal.fire({ icon: "error", title: "Invalid file", text: "Please pick an image file." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: "error", title: "Too large", text: "Image must be under 5MB." });
      return;
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setProfileImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setProfileImage(null);
    setImagePreview(null);
  };

  const handleGalleryPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (galleryFiles.length + files.length > 8) {
      Swal.fire({ icon: "error", title: "Limit exceeded", text: "You can upload a maximum of 8 gallery images." });
      return;
    }

    const validFiles = files.filter(f => {
      if (!f.type.startsWith("image/")) return false;
      if (f.size > 5 * 1024 * 1024) return false;
      return true;
    });

    const newPreviews = validFiles.map(f => URL.createObjectURL(f));
    setGalleryFiles(prev => [...prev, ...validFiles]);
    setGalleryPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeGalleryImage = (index: number) => {
    URL.revokeObjectURL(galleryPreviews[index]);
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = "Name is required";
    if (!formData.garageName.trim()) e.garageName = "Garage name is required";
    if (!phoneRegex.test(formData.phone)) e.phone = "Enter a valid 10-digit mobile number";
    if (formData.email && !emailRegex.test(formData.email)) e.email = "Enter a valid email";
    if (formData.address.pincode && !pincodeRegex.test(formData.address.pincode)) {
      e["address.pincode"] = "Enter a valid 6-digit pincode";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmitDetails = async () => {
    if (!validateStep1()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", formData.name.trim());
      fd.append("garageName", formData.garageName.trim());
      fd.append("phone", formData.phone.trim());
      if (formData.email) fd.append("email", formData.email.trim());
      if (formData.operatorName) fd.append("operatorName", formData.operatorName.trim());
      if (formData.licenseNumber) fd.append("licenseNumber", formData.licenseNumber.trim());
      if (formData.experienceYears) fd.append("experienceYears", formData.experienceYears);
      if (formData.startingPrice) fd.append("startingPrice", formData.startingPrice);
      if (formData.serviceArea) fd.append("serviceArea", formData.serviceArea.trim());
      if (formData.tagline) fd.append("tagline", formData.tagline.trim());
      if (formData.about) fd.append("about", formData.about.trim());
      if (formData.availabilitySummary) fd.append("availabilitySummary", formData.availabilitySummary.trim());
      
      fd.append("address", JSON.stringify(formData.address));
      fd.append("servicesOffered", JSON.stringify(formData.servicesOffered || []));
      fd.append("vehiclesRecoveredTypes", JSON.stringify(formData.vehiclesRecoveredTypes || []));
      
      if (profileImage) fd.append("profileImage", profileImage);
      
      galleryFiles.forEach((file) => {
        fd.append("galleryImages", file);
      });

      await axios.post(`${API_BASE}/recovery-vehicle/register`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const resendAt = Date.now() + RESEND_COOLDOWN_MS;
      setResendAvailableAt(resendAt);
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      goToStep(2, { resendAvailableAt: resendAt });
      Swal.fire({ icon: "success", title: "OTP sent", text: `We've sent an OTP to ${formData.phone}`, timer: 1800, showConfirmButton: false });
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Something went wrong. Please try again.";
      Swal.fire({ icon: "error", title: "Registration failed", text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    setOtpError("");
    if (value && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!text) return;
    e.preventDefault();
    setOtpDigits(Array.from({ length: OTP_LENGTH }, (_, i) => text[i] || ""));
    otpRefs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerifyOtp = async () => {
    const otp = otpDigits.join("");
    if (otp.length !== OTP_LENGTH) {
      setOtpError(`Enter the full ${OTP_LENGTH}-digit OTP`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE}/recovery-vehicle/verify-otp`, {
        phone: formData.phone,
        otp,
      });
      const provider = res?.data?.data;
      setProviderName(provider?.name || formData.name);
      clearDraft();
      setStep(3);
      syncStepToUrl(3);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Invalid or expired OTP.";
      setOtpError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendLeft > 0 || resending) return;
    setResending(true);
    try {
      await axios.post(`${API_BASE}/recovery-vehicle/resend-otp`, { phone: formData.phone });
      const resendAt = Date.now() + RESEND_COOLDOWN_MS;
      setResendAvailableAt(resendAt);
      saveDraft({ step: 2, formData, resendAvailableAt: resendAt });
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      otpRefs.current[0]?.focus();
      Swal.fire({ icon: "success", title: "OTP resent", timer: 1500, showConfirmButton: false });
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Couldn't resend OTP. Try again.";
      Swal.fire({ icon: "error", title: "Failed", text: msg });
    } finally {
      setResending(false);
    }
  };

  const backToDetails = () => goToStep(1);

  if (!hydrated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500/10 mb-4">
            <Wrench className="w-7 h-7 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Become a Recovery Partner</h1>
          <p className="text-sm text-gray-500 mt-1">Register your recovery service in a few quick steps</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  step > s
                    ? "bg-orange-500 text-white"
                    : step === s
                    ? "bg-orange-500 text-white ring-4 ring-orange-100"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {i < 2 && <div className={`w-10 h-0.5 ${step > s ? "bg-orange-500" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name" icon={User} error={errors.name}>
                  <input
                    className={inputCls(!!errors.name)}
                    placeholder="Rohit Sharma"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                  />
                </Field>
                <Field label="Garage / Service Name" icon={Building2} error={errors.garageName}>
                  <input
                    className={inputCls(!!errors.garageName)}
                    placeholder="Sharma Recovery Service"
                    value={formData.garageName}
                    onChange={(e) => updateField("garageName", e.target.value)}
                  />
                </Field>
                <Field label="Operator Name" icon={User}>
                  <input
                    className={inputCls(false)}
                    placeholder="Rohit Sharma"
                    value={formData.operatorName}
                    onChange={(e) => updateField("operatorName", e.target.value)}
                  />
                </Field>
                <Field label="Mobile Number" icon={Phone} error={errors.phone}>
                  <input
                    className={inputCls(!!errors.phone)}
                    placeholder="9876543210"
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value.replace(/\D/g, ""))}
                  />
                </Field>
                <Field label="Email (optional)" icon={Mail} error={errors.email}>
                  <input
                    className={inputCls(!!errors.email)}
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </Field>
                <Field label="License Number (optional)" icon={IdCard}>
                  <input
                    className={inputCls(false)}
                    placeholder="UP14RT1234"
                    value={formData.licenseNumber}
                    onChange={(e) => updateField("licenseNumber", e.target.value)}
                  />
                </Field>
                <Field label="Experience (years)" icon={Clock}>
                  <input
                    className={inputCls(false)}
                    type="number"
                    min={0}
                    placeholder="6"
                    value={formData.experienceYears}
                    onChange={(e) => updateField("experienceYears", e.target.value)}
                  />
                </Field>
                <Field label="Starting Price (₹)" icon={CreditCard}>
                  <input
                    className={inputCls(false)}
                    type="number"
                    min={0}
                    placeholder="899"
                    value={formData.startingPrice}
                    onChange={(e) => updateField("startingPrice", e.target.value)}
                  />
                </Field>
                <Field label="Service Area" icon={MapPin}>
                  <input
                    className={inputCls(false)}
                    placeholder="Ghaziabad & Nearby"
                    value={formData.serviceArea}
                    onChange={(e) => updateField("serviceArea", e.target.value)}
                  />
                </Field>
                <Field label="Tagline" icon={Wrench}>
                  <input
                    className={inputCls(false)}
                    placeholder="Fast | Safe | Reliable"
                    value={formData.tagline}
                    onChange={(e) => updateField("tagline", e.target.value)}
                  />
                </Field>
                <Field label="Availability Summary" icon={Clock}>
                  <input
                    className={inputCls(false)}
                    placeholder="24x7 (All Days)"
                    value={formData.availabilitySummary}
                    onChange={(e) => updateField("availabilitySummary", e.target.value)}
                  />
                </Field>
              </div>

              {/* Services Offered Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Services Offered</label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_OPTIONS.map((opt) => {
                    const active = (formData.servicesOffered || []).includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleServiceItem(opt)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                          active
                            ? "bg-orange-500 text-white border-orange-500"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Vehicles Recovered Types Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Vehicles We Recover</label>
                <div className="flex flex-wrap gap-2">
                  {VEHICLE_TYPE_OPTIONS.map((opt) => {
                    const active = (formData.vehiclesRecoveredTypes || []).includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleVehicleItem(opt)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                          active
                            ? "bg-orange-500 text-white border-orange-500"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* About Section */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                  <Wrench className="w-3.5 h-3.5 text-gray-400" /> About Service / Garage
                </label>
                <textarea
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                  rows={3}
                  placeholder="We provide 24x7 fast and safe recovery service..."
                  value={formData.about}
                  onChange={(e) => updateField("about", e.target.value)}
                />
              </div>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Address</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Address Line" icon={MapPin}>
                    <input
                      className={inputCls(false)}
                      placeholder="Shop no, street"
                      value={formData.address.line1}
                      onChange={(e) => updateAddress("line1", e.target.value)}
                    />
                  </Field>
                  <Field label="Pincode" icon={MapPin} error={errors["address.pincode"]}>
                    <input
                      className={inputCls(!!errors["address.pincode"])}
                      placeholder="201001"
                      maxLength={6}
                      value={formData.address.pincode}
                      onChange={(e) => updateAddress("pincode", e.target.value.replace(/\D/g, ""))}
                    />
                  </Field>
                  <Field label="State" icon={MapPin}>
                    <select
                      className={inputCls(false)}
                      value={formData.address.state}
                      onChange={(e) => {
                        updateAddress("state", e.target.value);
                        updateAddress("city", "");
                      }}
                    >
                      <option value="">Select state</option>
                      {STATE_LIST.map((s: string) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="City" icon={MapPin}>
                    <select
                      className={inputCls(false)}
                      value={formData.address.city}
                      onChange={(e) => updateAddress("city", e.target.value)}
                      disabled={!formData.address.state}
                    >
                      <option value="">Select city</option>
                      {cities.map((c: string) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>

              {/* Images Section: Profile Photo & Gallery Images */}
              <div className="pt-2 border-t border-gray-100 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Profile Photo</p>
                  {imagePreview ? (
                    <div className="relative w-24 h-24">
                      <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-xl object-cover border border-gray-200" />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-3 border border-dashed border-gray-300 rounded-xl px-4 py-3 cursor-pointer hover:border-orange-400 transition-colors w-fit">
                      <Camera className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-500">Upload profile photo</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
                    </label>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Gallery Images (Max 8)</p>
                    <span className="text-xs text-gray-400">{galleryFiles.length}/8 uploaded</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {galleryPreviews.map((preview, index) => (
                      <div key={index} className="relative w-20 h-20">
                        <img src={preview} alt={`Gallery ${index}`} className="w-20 h-20 rounded-xl object-cover border border-gray-200" />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {galleryFiles.length < 8 && (
                      <label className="flex flex-col items-center justify-center w-20 h-20 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-400 transition-colors bg-gray-50">
                        <ImageIcon className="w-5 h-5 text-gray-400 mb-1" />
                        <span className="text-[10px] text-gray-500">Add Photo</span>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryPick} />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmitDetails}
                disabled={submitting}
                className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...
                  </>
                ) : (
                  <>
                    Continue <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <button onClick={backToDetails} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-4 h-4" /> Edit details
              </button>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/10 mb-3">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Verify your mobile number</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Enter the {OTP_LENGTH}-digit code sent to <span className="font-medium text-gray-700">+91 {formData.phone}</span>
                </p>
              </div>

              <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                {otpDigits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    value={d}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    inputMode="numeric"
                    maxLength={1}
                    className={`w-11 h-12 text-center text-lg font-semibold rounded-xl border ${
                      otpError ? "border-red-300" : "border-gray-200"
                    } focus:outline-none focus:ring-2 focus:ring-orange-400`}
                  />
                ))}
              </div>

              {otpError && (
                <p className="flex items-center justify-center gap-1.5 text-sm text-red-500">
                  <AlertCircle className="w-4 h-4" /> {otpError}
                </p>
              )}

              <button
                onClick={handleVerifyOtp}
                disabled={submitting}
                className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                  </>
                ) : (
                  "Verify & Continue"
                )}
              </button>

              <div className="text-center text-sm text-gray-500">
                {resendLeft > 0 ? (
                  <span>Resend OTP in {resendLeft}s</span>
                ) : (
                  <button onClick={handleResendOtp} disabled={resending} className="text-orange-600 font-medium disabled:opacity-60">
                    {resending ? "Resending..." : "Resend OTP"}
                  </button>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">You're all set, {providerName || "partner"}!</h2>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Your mobile number is verified and your recovery service profile has been created. Our team will review it shortly.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="mt-2 w-full sm:w-auto px-6 h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold inline-flex items-center justify-center gap-2 transition-colors"
              >
                Continue to Login <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const inputCls = (hasError: boolean) =>
  `w-full h-11 rounded-xl border ${
    hasError ? "border-red-300 focus:ring-red-400" : "border-gray-200 focus:ring-orange-400"
  } px-3.5 text-sm focus:outline-none focus:ring-2 bg-white`;

const Field = ({
  label,
  icon: Icon,
  error,
  children,
}: {
  label: string;
  icon: React.ElementType;
  error?: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
      <Icon className="w-3.5 h-3.5 text-gray-400" /> {label}
    </label>
    {children}
    {error && (
      <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
        <AlertCircle className="w-3 h-3" /> {error}
      </p>
    )}
  </div>
);

export default RecoveryVehicleRegister;