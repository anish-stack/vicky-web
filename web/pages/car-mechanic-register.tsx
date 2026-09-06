"use client";

import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  MapPin,
  Phone,
  Mail,
  User,
  Building2,
  Wrench,
  Car,
  Compass,
  Upload,
  ChevronDown,
  ChevronUp,
  Facebook,
  Instagram,
  Youtube,
  Globe,
  MessageCircle,
  CheckCircle2,
  Clock,
  Shield,
  Star,
  ArrowRight,
  ArrowLeft,
  Camera,
  CreditCard,
  AlertCircle,
  Loader2,
  IdCard,
  FileImage,
  X,
  Check,
  Map,
  LocateFixed,
} from "lucide-react";
import Swal from "sweetalert2";
import INDIAN_STATES_CITIES, { STATE_LIST } from "@/data/indianStatesCities";

const API_BASE = "http://localhost:5001/api/auth/mechanic";
const DRAFT_KEY = "mechanic_register_draft";
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

// add near top, after DAYS constant
const ABOUT_TEMPLATES = [
  "{garage} is a trusted local garage known for honest work and quick service. We fix cars right the first time, using genuine parts and fair pricing.",
  "At {garage}, we have been serving customers with reliable car repair and maintenance. Our team works hard to keep your vehicle running smooth and safe.",
  "{garage} is a multi-brand car service center offering quality repairs at affordable rates. Customer satisfaction is our top priority, every single time.",
  "Welcome to {garage} — your neighborhood garage for all car problems. We believe in honest diagnosis, fair rates and quick turnaround for every customer.",
];

const WHY_CHOOSE_POOL = [
  "Honest & Fair Pricing",
  "Experienced Mechanics",
  "Genuine Spare Parts",
  "Quick Service",
  "Customer Satisfaction Guaranteed",
  "Doorstep Service Available",
  "All Brands Serviced",
  "Trusted by Local Customers",
  "Affordable Rates",
  "On-Time Delivery",
];

const generateAbout = (garageName: string) => {
  const name = garageName.trim() || "Our Garage";
  const template =
    ABOUT_TEMPLATES[Math.floor(Math.random() * ABOUT_TEMPLATES.length)];
  return template.replace("{garage}", name);
};

const generateWhyChooseUs = () => {
  const shuffled = [...WHY_CHOOSE_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
};

type Option = { title: string; image: string };

type WorkingHour = {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

type FormState = {
  name: string;
  phone: string;
  email: string;
  password: string;
  garageName: string;
  experienceYears: string;
  specialty: string;
  about: string;
  whyChooseUs: string[];
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
  latitude: string;
  longitude: string;
  workingHours: WorkingHour[];
  servicesOffered: string[];
  brandsServiced: string[];
  vehicleTypesServiced: string[];
  facilities: string[];
  agreedToTerms: boolean;
};

const defaultWorkingHours = (): WorkingHour[] =>
  DAYS.map((day) => ({
    day,
    isOpen: day !== "Sun",
    openTime: "09:00",
    closeTime: "20:00",
  }));

const initialForm: FormState = {
  name: "",
  phone: "",
  email: "",
  password: "",
  garageName: "",
  experienceYears: "",
  specialty: "",
  about: "",
  whyChooseUs: ["", "", ""],
  addressLine1: "",
  city: "",
  state: "",
  pincode: "",
  latitude: "",
  longitude: "",
  workingHours: defaultWorkingHours(),
  servicesOffered: [],
  brandsServiced: [],
  vehicleTypesServiced: [],
  facilities: [],
  agreedToTerms: false,
};

const STEPS = [
  "Basic Info",
  "Address",
  "Working Hours",
  "Services & Brands",
  "Photos",
  "Verify OTP",
] as const;

export default function CarMechanicRegister() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const stepFromUrl = Math.min(
    Math.max(parseInt(searchParams.get("step") || "0", 10) || 0, 0),
    STEPS.length - 1,
  );
  const [step, setStepState] = useState(stepFromUrl);

  const setStep = (s: number) => {
    setStepState(s);
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", String(s));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const [form, setForm] = useState<FormState>(initialForm);
  const [options, setOptions] = useState<{
    services: Option[];
    brands: Option[];
    vehicleTypes: Option[];
    facilities: Option[];
  } | null>(null);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [locating, setLocating] = useState(false);

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string>("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const [mechanicId, setMechanicId] = useState<string>("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendTimer, setResendTimer] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registered, setRegistered] = useState(false);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // restore draft (images can't be persisted across refresh, only text fields + phone for OTP step)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        setForm((f) => ({ ...f, ...draft }));
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    } catch (_) {}
  }, [form]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/options/all`);
        setOptions(res.data.data);
      } catch (err) {
        console.error("options fetch err:", err);
      } finally {
        setOptionsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  const update = (key: keyof FormState, value: any) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const toggleMulti = (key: keyof FormState, value: string) => {
    setForm((f) => {
      const arr = f[key] as string[];
      const next = arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value];
      return { ...f, [key]: next };
    });
  };

  const setAllMulti = (
    key: keyof FormState,
    items: Option[],
    selectAll: boolean,
  ) => {
    update(key, selectAll ? items.map((i) => i.title) : []);
  };
  const updateWorkingHour = (
    day: string,
    key: keyof WorkingHour,
    value: any,
  ) => {
    setForm((f) => ({
      ...f,
      workingHours: f.workingHours.map((wh) =>
        wh.day === day ? { ...wh, [key]: value } : wh,
      ),
    }));
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire({
        icon: "warning",
        title: "Location not supported on this device",
      });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update("latitude", String(pos.coords.latitude));
        update("longitude", String(pos.coords.longitude));
        setLocating(false);
      },
      () => {
        Swal.fire({
          icon: "error",
          title: "Couldn't get location",
          text: "Please allow location access or enter address manually",
        });
        setLocating(false);
      },
    );
  };

  const cities = form.state ? INDIAN_STATES_CITIES[form.state] || [] : [];

  const validateStep = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!form.name.trim()) e.name = "Name required";
      if (!/^[6-9]\d{9}$/.test(form.phone))
        e.phone = "Enter valid 10-digit phone";
      if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
        e.email = "Invalid email";
      if (!form.password || form.password.length < 6)
        e.password = "Min 6 characters";
      if (!form.garageName.trim()) e.garageName = "Garage name required";
    }
    if (s === 1) {
      if (!form.addressLine1.trim()) e.addressLine1 = "Address required";
      if (!form.state) e.state = "Select state";
      if (!form.city) e.city = "Select city";
      if (!/^\d{6}$/.test(form.pincode))
        e.pincode = "Enter valid 6-digit pincode";
    }
    if (s === 3) {
      if (form.servicesOffered.length === 0)
        e.servicesOffered = "Select at least 1 service";
      if (form.brandsServiced.length === 0)
        e.brandsServiced = "Select at least 1 brand";
    }
    if (s === 4) {
      if (!form.agreedToTerms)
        e.agreedToTerms = "Please accept the terms to continue";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep(Math.min(step + 1, STEPS.length - 1));
  };
  const goBack = () => setStep(Math.max(step - 1, 0));

  const onPickProfile = (f: File | null) => {
    setProfileImage(f);
    setProfilePreview(f ? URL.createObjectURL(f) : "");
  };
  const onPickCover = (f: File | null) => {
    setCoverImage(f);
    setCoverPreview(f ? URL.createObjectURL(f) : "");
  };
  const onPickGallery = (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files).slice(0, 10 - galleryFiles.length);
    setGalleryFiles((g) => [...g, ...list]);
    setGalleryPreviews((p) => [
      ...p,
      ...list.map((f) => URL.createObjectURL(f)),
    ]);
  };
  const removeGalleryImg = (idx: number) => {
    setGalleryFiles((g) => g.filter((_, i) => i !== idx));
    setGalleryPreviews((p) => p.filter((_, i) => i !== idx));
  };

  const submitRegistration = async () => {
    if (!validateStep(4)) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("phone", form.phone);
      if (form.email) fd.append("email", form.email);
      fd.append("password", form.password);
      fd.append("garageName", form.garageName);
      fd.append("experienceYears", form.experienceYears || "0");
      fd.append(
        "specialty",
        form.specialty || "All Types of Car Repair & Service",
      );
      if (form.about) fd.append("about", form.about);
      fd.append(
        "whyChooseUs",
        JSON.stringify(form.whyChooseUs.filter((v) => v.trim())),
      );
      fd.append(
        "address",
        JSON.stringify({
          line1: form.addressLine1,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          location: {
            type: "Point",
            coordinates: [
              parseFloat(form.longitude) || 0,
              parseFloat(form.latitude) || 0,
            ],
          },
        }),
      );
      fd.append("workingHours", JSON.stringify(form.workingHours));
      fd.append("servicesOffered", JSON.stringify(form.servicesOffered));
      fd.append("brandsServiced", JSON.stringify(form.brandsServiced));
      fd.append(
        "vehicleTypesServiced",
        JSON.stringify(form.vehicleTypesServiced),
      );
      fd.append("facilities", JSON.stringify(form.facilities));

      if (profileImage) fd.append("profileImage", profileImage);
      if (coverImage) fd.append("coverImage", coverImage);
      galleryFiles.forEach((f) => fd.append("galleryImages", f));

      const res = await axios.post(`${API_BASE}/`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMechanicId(res.data.data._id);
      setStep(5);
      Swal.fire({
        icon: "success",
        title: "OTP sent",
        text: `OTP sent to ${form.phone}`,
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err: any) {
      console.error("register err:", err);
      Swal.fire({
        icon: "error",
        title: "Registration failed",
        text: err?.response?.data?.message || "Something went wrong",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };
  const onOtpKeyDown = (
    idx: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0)
      otpRefs.current[idx - 1]?.focus();
  };

  const verifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      Swal.fire({ icon: "warning", title: "Enter full 6-digit OTP" });
      return;
    }
    setVerifying(true);
    try {
      await axios.post(`${API_BASE}/verify-otp`, {
        phone: form.phone,
        otp: code,
      });
      setRegistered(true);
      sessionStorage.removeItem(DRAFT_KEY);
      Swal.fire({
        icon: "success",
        title: "Verified!",
        text: "Your garage profile is live.",
      });
    } catch (err: any) {
      console.error("verify err:", err);
      Swal.fire({
        icon: "error",
        title: "Verification failed",
        text: err?.response?.data?.message || "Invalid or expired OTP",
      });
    } finally {
      setVerifying(false);
    }
  };

  const resendOtp = async () => {
    if (resendTimer > 0) return;
    setResending(true);
    try {
      await axios.post(`${API_BASE}/resend-otp`, { phone: form.phone });
      setResendTimer(30);
      Swal.fire({
        icon: "success",
        title: "OTP resent",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      console.error("resend err:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to resend",
        text: err?.response?.data?.message || "Try again",
      });
    } finally {
      setResending(false);
    }
  };

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Registration Complete
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Your garage <span className="font-medium">{form.garageName}</span>{" "}
            is now listed. Our team will verify your profile shortly.
          </p>
          <button
            onClick={() => (window.location.href = pathname)}
            className="w-full h-11 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold">
            TS
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">
              Register as Mechanic Partner
            </h1>
            <p className="text-xs text-gray-400">TaxiSafar Auto Care Network</p>
          </div>
        </div>
      </div>

      {/* stepper */}
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className="flex-1 flex flex-col items-center relative"
            >
              {i !== 0 && (
                <div
                  className={`absolute top-4 right-1/2 w-full h-0.5 -z-10 ${
                    i <= step ? "bg-red-600" : "bg-gray-200"
                  }`}
                />
              )}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 ${
                  i < step
                    ? "bg-red-600 border-red-600 text-white"
                    : i === step
                      ? "border-red-600 text-red-600 bg-white"
                      : "border-gray-300 text-gray-400 bg-white"
                }`}
              >
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className="text-[10px] mt-1 text-gray-500 text-center hidden sm:block">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          {/* STEP 0: BASIC INFO */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                Basic Information
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Tell us about you and your garage
              </p>

              <Field
                label="Full Name"
                icon={<User className="w-4 h-4" />}
                error={errors.name}
              >
                <input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Rohit Sharma"
                  className={inputCls(errors.name)}
                />
              </Field>

              <Field
                label="Phone Number"
                icon={<Phone className="w-4 h-4" />}
                error={errors.phone}
              >
                <input
                  value={form.phone}
                  onChange={(e) =>
                    update(
                      "phone",
                      e.target.value.replace(/\D/g, "").slice(0, 10),
                    )
                  }
                  placeholder="9876543210"
                  className={inputCls(errors.phone)}
                />
              </Field>

              <Field
                label="Email (optional)"
                icon={<Mail className="w-4 h-4" />}
                error={errors.email}
              >
                <input
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="you@example.com"
                  className={inputCls(errors.email)}
                />
              </Field>

              <Field
                label="Password"
                icon={<Shield className="w-4 h-4" />}
                error={errors.password}
              >
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="Min 6 characters"
                  className={inputCls(errors.password)}
                />
              </Field>

              <Field
                label="Garage / Shop Name"
                icon={<Building2 className="w-4 h-4" />}
                error={errors.garageName}
              >
                <input
                  value={form.garageName}
                  onChange={(e) => update("garageName", e.target.value)}
                  placeholder="Auto Care Garage"
                  className={inputCls(errors.garageName)}
                />
              </Field>

              <Field
                label="Experience (years)"
                icon={<Star className="w-4 h-4" />}
              >
                <input
                  type="number"
                  min={0}
                  value={form.experienceYears}
                  onChange={(e) => update("experienceYears", e.target.value)}
                  placeholder="8"
                  className={inputCls()}
                />
              </Field>

              <Field label="Specialty" icon={<Wrench className="w-4 h-4" />}>
                <input
                  value={form.specialty}
                  onChange={(e) => update("specialty", e.target.value)}
                  placeholder="All Types of Car Repair & Service"
                  className={inputCls()}
                />
              </Field>

              <Field
                label="About your garage"
                icon={<Building2 className="w-4 h-4" />}
              >
                <div className="flex gap-2 mb-1.5">
                  <textarea
                    value={form.about}
                    onChange={(e) => update("about", e.target.value)}
                    rows={3}
                    placeholder="Trusted multi-brand car service center..."
                    className={inputCls() + " resize-none"}
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    update("about", generateAbout(form.garageName))
                  }
                  className="text-xs text-red-600 font-medium flex items-center gap-1"
                >
                  ✨ Auto-generate
                </button>
              </Field>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 block">
                    Why choose you? (up to 3)
                  </label>
                  <button
                    type="button"
                    onClick={() => update("whyChooseUs", generateWhyChooseUs())}
                    className="text-xs text-red-600 font-medium flex items-center gap-1"
                  >
                    ✨ Auto-generate
                  </button>
                </div>
                {form.whyChooseUs.map((v, i) => (
                  <input
                    key={i}
                    value={v}
                    onChange={(e) => {
                      const next = [...form.whyChooseUs];
                      next[i] = e.target.value;
                      update("whyChooseUs", next);
                    }}
                    placeholder={`Reason ${i + 1}`}
                    className={inputCls() + " mb-2"}
                  />
                ))}
              </div>
            </div>
          )}

          {/* STEP 1: ADDRESS */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                Garage Address
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Where can customers find you
              </p>

              <Field
                label="Address Line"
                icon={<MapPin className="w-4 h-4" />}
                error={errors.addressLine1}
              >
                <input
                  value={form.addressLine1}
                  onChange={(e) => update("addressLine1", e.target.value)}
                  placeholder="Plot No. 45, Industrial Area, Sahibabad"
                  className={inputCls(errors.addressLine1)}
                />
              </Field>

              <Field
                label="State"
                icon={<Compass className="w-4 h-4" />}
                error={errors.state}
              >
                <select
                  value={form.state}
                  onChange={(e) => {
                    update("state", e.target.value);
                    update("city", "");
                  }}
                  className={inputCls(errors.state)}
                >
                  <option value="">Select State</option>
                  {STATE_LIST.map((s: string) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="City"
                icon={<MapPin className="w-4 h-4" />}
                error={errors.city}
              >
                <select
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  disabled={!form.state}
                  className={
                    inputCls(errors.city) +
                    (!form.state ? " opacity-50 cursor-not-allowed" : "")
                  }
                >
                  <option value="">Select City</option>
                  {cities.map((c: string) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Pincode"
                icon={<Map className="w-4 h-4" />}
                error={errors.pincode}
              >
                <input
                  value={form.pincode}
                  onChange={(e) =>
                    update(
                      "pincode",
                      e.target.value.replace(/\D/g, "").slice(0, 6),
                    )
                  }
                  placeholder="201010"
                  className={inputCls(errors.pincode)}
                />
              </Field>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <LocateFixed className="w-4 h-4" /> Garage Location (for map
                  pin)
                </label>
                <div className="flex gap-2">
                  <input
                    value={form.latitude}
                    onChange={(e) => update("latitude", e.target.value)}
                    placeholder="Latitude"
                    className={inputCls()}
                  />
                  <input
                    value={form.longitude}
                    onChange={(e) => update("longitude", e.target.value)}
                    placeholder="Longitude"
                    className={inputCls()}
                  />
                  <button
                    type="button"
                    onClick={useCurrentLocation}
                    disabled={locating}
                    className="h-11 px-3 rounded-xl border border-gray-300 text-xs font-medium flex items-center gap-1.5 shrink-0 disabled:opacity-60"
                  >
                    {locating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <LocateFixed className="w-3.5 h-3.5" />
                    )}
                    Use Current
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Helps customers find your exact garage on the map
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: WORKING HOURS */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                Working Hours
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Set the days and hours your garage is open
              </p>

              <div className="space-y-2">
                {form.workingHours.map((wh) => (
                  <div
                    key={wh.day}
                    className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-200"
                  >
                    <span className="w-10 text-sm font-medium text-gray-700">
                      {wh.day}
                    </span>
                    <label className="flex items-center gap-1.5 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={wh.isOpen}
                        onChange={(e) =>
                          updateWorkingHour(wh.day, "isOpen", e.target.checked)
                        }
                      />
                      Open
                    </label>
                    <input
                      type="time"
                      value={wh.openTime}
                      disabled={!wh.isOpen}
                      onChange={(e) =>
                        updateWorkingHour(wh.day, "openTime", e.target.value)
                      }
                      className="h-9 px-2 rounded-lg border border-gray-300 text-xs disabled:opacity-40"
                    />
                    <span className="text-xs text-gray-400">to</span>
                    <input
                      type="time"
                      value={wh.closeTime}
                      disabled={!wh.isOpen}
                      onChange={(e) =>
                        updateWorkingHour(wh.day, "closeTime", e.target.value)
                      }
                      className="h-9 px-2 rounded-lg border border-gray-300 text-xs disabled:opacity-40"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: SERVICES / BRANDS / VEHICLES / FACILITIES */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Services & Coverage
                </h2>
                <p className="text-sm text-gray-400">
                  Select what your garage offers
                </p>
              </div>

              {optionsLoading ? (
                <div className="flex items-center justify-center py-12 text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <>
                  <MultiSelectGrid
                    title="Services Offered"
                    items={options?.services || []}
                    selected={form.servicesOffered}
                    onToggle={(v) => toggleMulti("servicesOffered", v)}
                    onSelectAll={(v) =>
                      setAllMulti("servicesOffered", options?.services || [], v)
                    }
                    error={errors.servicesOffered}
                  />
                  <MultiSelectGrid
                    title="Brands Serviced"
                    items={options?.brands || []}
                    selected={form.brandsServiced}
                    onToggle={(v) => toggleMulti("brandsServiced", v)}
                    onSelectAll={(v) =>
                      setAllMulti("brandsServiced", options?.brands || [], v)
                    }
                    error={errors.brandsServiced}
                  />
                  <MultiSelectGrid
                    title="Vehicle Types Serviced"
                    items={options?.vehicleTypes || []}
                    selected={form.vehicleTypesServiced}
                    onToggle={(v) => toggleMulti("vehicleTypesServiced", v)}
                    onSelectAll={(v) =>
                      setAllMulti(
                        "vehicleTypesServiced",
                        options?.vehicleTypes || [],
                        v,
                      )
                    }
                  />
                  <MultiSelectGrid
                    title="Facilities"
                    items={options?.facilities || []}
                    selected={form.facilities}
                    onToggle={(v) => toggleMulti("facilities", v)}
                    onSelectAll={(v) =>
                      setAllMulti("facilities", options?.facilities || [], v)
                    }
                  />
                </>
              )}
            </div>
          )}

          {/* STEP 4: PHOTOS + TERMS */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Garage Photos
                </h2>
                <p className="text-sm text-gray-400">
                  Profile & garage photos help build trust
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div
                  onClick={() => profileInputRef.current?.click()}
                  className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer bg-gray-50 relative shrink-0"
                >
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      className="w-full h-full object-cover"
                      alt="profile"
                    />
                  ) : (
                    <Camera className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Profile Photo
                  </p>
                  <p className="text-xs text-gray-400">
                    Mechanic / owner photo
                  </p>
                </div>
                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onPickProfile(e.target.files?.[0] || null)}
                />
              </div>

              <div
                onClick={() => coverInputRef.current?.click()}
                className="h-36 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer bg-gray-50 relative"
              >
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    className="w-full h-full object-cover"
                    alt="cover"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <FileImage className="w-6 h-6 mx-auto mb-1" />
                    <p className="text-xs">Garage cover photo</p>
                  </div>
                )}
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onPickCover(e.target.files?.[0] || null)}
                />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Gallery (up to 10)
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {galleryPreviews.map((src, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-lg overflow-hidden group"
                    >
                      <img
                        src={src}
                        className="w-full h-full object-cover"
                        alt={`gallery-${i}`}
                      />
                      <button
                        onClick={() => removeGalleryImg(i)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {galleryFiles.length < 10 && (
                    <div
                      onClick={() => galleryInputRef.current?.click()}
                      className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer bg-gray-50"
                    >
                      <Upload className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => onPickGallery(e.target.files)}
                />
              </div>

              <label className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
                <input
                  type="checkbox"
                  checked={form.agreedToTerms}
                  onChange={(e) => update("agreedToTerms", e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  I confirm the details provided are accurate and I agree to
                  TaxiSafar's Partner Terms & Conditions and Privacy Policy.
                </span>
              </label>
              {errors.agreedToTerms && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.agreedToTerms}
                </p>
              )}
            </div>
          )}

          {/* STEP 5: OTP */}
          {step === 5 && (
            <div className="space-y-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                <Phone className="w-7 h-7 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Verify your phone
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Enter the 6-digit code sent to{" "}
                  <span className="font-medium text-gray-600">
                    {form.phone}
                  </span>
                </p>
              </div>

              <div className="flex justify-center gap-2">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    value={d}
                    onChange={(e) => onOtpChange(i, e.target.value)}
                    onKeyDown={(e) => onOtpKeyDown(i, e)}
                    maxLength={1}
                    inputMode="numeric"
                    className="w-11 h-12 text-center text-lg font-semibold rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
                  />
                ))}
              </div>

              <button
                onClick={verifyOtp}
                disabled={verifying}
                className="w-full h-12 rounded-xl bg-red-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {verifying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {verifying ? "Verifying..." : "Verify & Continue"}
              </button>

              <button
                onClick={resendOtp}
                disabled={resending || resendTimer > 0}
                className="text-sm text-red-600 font-medium disabled:text-gray-400"
              >
                {resendTimer > 0
                  ? `Resend OTP in ${resendTimer}s`
                  : resending
                    ? "Resending..."
                    : "Resend OTP"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* footer nav */}
      {step < 5 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="max-w-2xl mx-auto flex gap-3">
            {step > 0 && (
              <button
                onClick={goBack}
                className="h-12 px-5 rounded-xl border border-gray-300 text-gray-700 font-medium flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            {step < 4 ? (
              <button
                onClick={goNext}
                className="flex-1 h-12 rounded-xl bg-red-600 text-white font-semibold flex items-center justify-center gap-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={submitRegistration}
                disabled={submitting}
                className="flex-1 h-12 rounded-xl bg-red-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {submitting ? "Submitting..." : "Submit & Get OTP"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}

function inputCls(error?: string) {
  return `w-full h-11 px-3.5 rounded-xl border text-sm outline-none transition ${
    error
      ? "border-red-400 focus:ring-2 focus:ring-red-100"
      : "border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
  }`;
}

function MultiSelectGrid({
  title,
  items,
  selected,
  onToggle,
  onSelectAll,
  error,
}: {
  title: string;
  items: Option[];
  selected: string[];
  onToggle: (v: string) => void;
  onSelectAll: (all: boolean) => void;
  error?: string;
}) {
  const allSelected = items.length > 0 && selected.length === items.length;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            {selected.length} selected
          </span>
          <button
            type="button"
            onClick={() => onSelectAll(!allSelected)}
            className="text-xs text-red-600 font-medium"
          >
            {allSelected ? "Clear All" : "Select All"}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {items.map((item) => {
          const active = selected.includes(item.title);
          return (
            <button
              key={item.title}
              type="button"
              onClick={() => onToggle(item.title)}
              className={`relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center transition ${
                active ? "border-red-500 bg-red-50" : "border-gray-200 bg-white"
              }`}
            >
              {active && (
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
              <img
                src={item.image}
                alt={item.title}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-[11px] font-medium text-gray-700 leading-tight">
                {item.title}
              </span>
            </button>
          );
        })}
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}
