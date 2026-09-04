"use client";

import axios from "axios";
import { useState, useRef, useEffect } from "react";
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
  Camera,
  CreditCard,
  AlertCircle,
  Loader2,
  IdCard,
  FileImage,
  X,
  Check,
  Map,
} from "lucide-react";
import Swal from "sweetalert2";
import INDIAN_STATES_CITIES, { STATE_LIST } from "@/data/indianStatesCities";

type Category = "tour_guide" | "rto_service" | "car_accessory" | "car_mechanic";

const CATEGORIES = [
  {
    value: "tour_guide" as Category,
    label: "Tour Guide",
    icon: Compass,
    gradient: "from-amber-400 to-orange-500",
    light: "#FFF8F0",
    border: "#FDE68A",
    textColor: "#92400E",
  },
  {
    value: "rto_service" as Category,
    label: "RTO Service",
    icon: Car,
    gradient: "from-blue-400 to-indigo-500",
    light: "#EFF6FF",
    border: "#BFDBFE",
    textColor: "#1E40AF",
  },
  {
    value: "car_accessory" as Category,
    label: "Car Accessory",
    icon: Wrench,
    gradient: "from-emerald-400 to-teal-500",
    light: "#F0FDF4",
    border: "#A7F3D0",
    textColor: "#065F46",
  },
  {
    value: "car_mechanic" as Category,
    label: "Car Mechanic",
    icon: Building2,
    gradient: "from-purple-400 to-violet-500",
    light: "#FAF5FF",
    border: "#DDD6FE",
    textColor: "#4C1D95",
  },
] as const;

type DocFile = { file: File; preview: string } | null;

type FormState = {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  address: string;
  description: string;
  profileImage: File | null;
  facebook: string;
  instagram: string;
  youtube: string;
  website: string;
  whatsapp: string;
  aadharFront: DocFile;
  aadharBack: DocFile;
  panCard: DocFile;
  experienceYears: string;
  languages: string;
  servicesOffered: string;
  tourImages: FileList | null;
  officeName: string;
  officeAddress: string;
  rtoOfficeCode: string;
  services: string;
  shopName: string;
  shopAddress: string;
  accessoryTypes: string;
  shopImages: FileList | null;
  garageName: string;
  garageAddress: string;
  mechanicExperience: string;
  specialization: string;
  garageImages: FileList | null;
};

const INIT: FormState = {
  name: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  address: "",
  description: "",
  profileImage: null,
  facebook: "",
  instagram: "",
  youtube: "",
  website: "",
  whatsapp: "",
  aadharFront: null,
  aadharBack: null,
  panCard: null,
  experienceYears: "",
  languages: "",
  servicesOffered: "",
  tourImages: null,
  officeName: "",
  officeAddress: "",
  rtoOfficeCode: "",
  services: "",
  shopName: "",
  shopAddress: "",
  accessoryTypes: "",
  shopImages: null,
  garageName: "",
  garageAddress: "",
  mechanicExperience: "",
  specialization: "",
  garageImages: null,
};

type FieldErrors = Record<string, string>;
type Step = "form" | "otp" | "success";

/* ─── Section wrapper (uniform spacing) ─────────────────────────────────── */
function Section({
  label,
  hint,
  icon: Icon,
  children,
}: {
  label: string;
  hint?: string;
  icon?: any;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
        <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.12em]">
          {label}
        </h3>
        {hint && (
          <span className="text-[11px] text-gray-300 font-medium normal-case tracking-normal">
            {hint}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

/* ─── Doc upload tile ───────────────────────────────────────────────────── */
function DocTile({
  label,
  hint,
  icon: Icon,
  iconBg,
  iconColor,
  value,
  name,
  onClear,
  inputRef,
  onChange,
}: {
  label: string;
  hint: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  value: DocFile;
  name: string;
  onClear: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/*,.pdf"
        className="hidden"
        onChange={onChange}
      />
      {value ? (
        <div className="border border-green-300 bg-green-50/70 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-white border border-green-200">
            <img
              src={value.preview}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-green-700 flex items-center gap-1">
              <Check className="w-3 h-3" />
              {label}
            </p>
            <p className="text-[11px] text-green-600 truncate">
              {value.file.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="w-7 h-7 bg-white border border-green-200 rounded-full flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition flex-shrink-0"
          >
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border border-dashed border-gray-250 bg-gray-50/70 rounded-2xl p-3 flex items-center gap-3 hover:border-[#E52710] hover:bg-red-50/20 transition group text-left"
          style={{ borderColor: "#e2e5e9" }}
        >
          <div
            className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}
          >
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-gray-700 group-hover:text-[#E52710] transition">
              {label}
            </p>
            <p className="text-[11px] text-gray-400">{hint}</p>
          </div>
          <Upload className="w-4 h-4 text-gray-300 group-hover:text-[#E52710] ml-auto flex-shrink-0 transition" />
        </button>
      )}
    </div>
  );
}

/* ─── Multi-image upload ────────────────────────────────────────────────── */
function MultiImgUpload({
  label,
  name,
  onChange,
}: {
  label: string;
  name: string;
  onChange: any;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.12em]">
        {label}
      </p>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="w-full flex items-center gap-2.5 border border-dashed rounded-xl px-4 h-11 bg-white hover:border-[#E52710] hover:bg-red-50/10 transition group text-left"
        style={{ borderColor: "#e2e5e9" }}
      >
        <FileImage className="w-4 h-4 text-gray-400 group-hover:text-[#E52710] flex-shrink-0" />
        <span className="text-[13px] text-gray-500">
          {count > 0
            ? `${count} photo${count > 1 ? "s" : ""} selected ✓`
            : "Upload multiple photos"}
        </span>
      </button>
      <input
        ref={ref}
        type="file"
        name={name}
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          setCount(e.target.files?.length || 0);
          onChange(e);
        }}
      />
    </div>
  );
}

function Field({ err, children }: { err?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      {children}
      {err && (
        <p className="text-red-500 text-[11px] flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {err}
        </p>
      )}
    </div>
  );
}

function IconInp({
  icon: Icon,
  name,
  placeholder,
  onChange,
  err,
  inp,
  type = "text",
  maxLength,
  inputMode,
  value,
}: any) {
  return (
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        onChange={onChange}
        maxLength={maxLength}
        inputMode={inputMode}
        value={value}
        className={inp(err) + " pl-10"}
      />
    </div>
  );
}

/* ─── Styled native select ──────────────────────────────────────────────── */
function IconSelect({
  icon: Icon,
  name,
  value,
  onChange,
  disabled,
  placeholder,
  options,
  err,
  sel,
}: any) {
  return (
    <div className="relative">
      <Icon
        className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${disabled ? "text-gray-300" : "text-gray-400"}`}
      />
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={
          sel(err) +
          " pl-10 pr-9" +
          (value ? " text-gray-900" : " text-gray-400")
        }
      >
        <option value="">{placeholder}</option>
        {options.map((o: string) => (
          <option key={o} value={o} className="text-gray-900">
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${disabled ? "text-gray-300" : "text-gray-400"}`}
      />
    </div>
  );
}

function SecHead({
  icon: Icon,
  label,
  color,
}: {
  icon: any;
  label: string;
  color: string;
}) {
  return (
    <div className={`flex items-center gap-2 font-bold text-[13px] ${color}`}>
      <Icon className="w-4 h-4" />
      {label}
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────────────── */
export default function RegisterPage() {
  const [category, setCategory] = useState<Category | "">("");
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<FormState>(INIT);
  const [otp, setOtp] = useState("");
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const profileRef = useRef<HTMLInputElement>(null);
  const aadharFrontRef = useRef<HTMLInputElement>(null);
  const aadharBackRef = useRef<HTMLInputElement>(null);
  const panRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("step") as Step | null;
    const phone = params.get("phone");
    if (s === "otp" && phone) {
      setForm((p) => ({ ...p, phone }));
      setStep("otp");
    } else if (s === "success") setStep("success");
  }, []);

  const states = STATE_LIST;
  const cities = form.state ? INDIAN_STATES_CITIES[form.state] || [] : [];

  const pushParams = (s: Step, phone?: string) => {
    const p = new URLSearchParams();
    p.set("step", s);
    if (phone) p.set("phone", phone);
    window.history.replaceState({}, "", `?${p.toString()}`);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target as any;
    const files = (e.target as HTMLInputElement).files;

    if (files?.length) {
      const file = files[0];
      const mkDoc = (f: File): DocFile => ({
        file: f,
        preview: URL.createObjectURL(f),
      });
      if (name === "profileImage") {
        setForm((p) => ({ ...p, profileImage: file }));
        setProfilePreview(URL.createObjectURL(file));
      } else if (name === "aadharFront")
        setForm((p) => ({ ...p, aadharFront: mkDoc(file) }));
      else if (name === "aadharBack")
        setForm((p) => ({ ...p, aadharBack: mkDoc(file) }));
      else if (name === "panCard")
        setForm((p) => ({ ...p, panCard: mkDoc(file) }));
      else if (name === "tourImages")
        setForm((p) => ({ ...p, tourImages: files }));
      else if (name === "shopImages")
        setForm((p) => ({ ...p, shopImages: files }));
      else if (name === "garageImages")
        setForm((p) => ({ ...p, garageImages: files }));
      // reset so same file can trigger again
      (e.target as HTMLInputElement).value = "";
    } else if (name === "state") {
      // changing state clears the selected city
      setForm((p) => ({ ...p, state: value, city: "" }));
      if (fieldErrors.state)
        setFieldErrors((p) => {
          const n = { ...p };
          delete n.state;
          return n;
        });
    } else {
      setForm((p) => ({ ...p, [name]: value }));
      if (fieldErrors[name])
        setFieldErrors((p) => {
          const n = { ...p };
          delete n[name];
          return n;
        });
    }
  };

  const buildFD = (): FormData => {
    const d = new FormData();
    d.append("name", form.name);
    d.append("email", form.email);
    d.append("phone", form.phone);
    d.append("category", category);
    if (form.description) d.append("description", form.description);
    if (form.city) d.append("city", form.city);
    if (form.state) d.append("state", form.state);
    if (form.address) d.append("address", form.address);
    if (form.profileImage) d.append("profileImage", form.profileImage);
    if (form.aadharFront) d.append("aadharFront", form.aadharFront.file);
    if (form.aadharBack) d.append("aadharBack", form.aadharBack.file);
    if (form.panCard) d.append("panCard", form.panCard.file);
    if (form.facebook) d.append("facebook", form.facebook);
    if (form.instagram) d.append("instagram", form.instagram);
    if (form.youtube) d.append("youtube", form.youtube);
    if (form.website) d.append("website", form.website);
    if (form.whatsapp) d.append("whatsapp", form.whatsapp);
    if (category === "tour_guide") {
      d.append("experienceYears", form.experienceYears);
      d.append("languages", form.languages);
      if (form.servicesOffered)
        d.append("servicesOffered", form.servicesOffered);
      if (form.tourImages)
        for (let i = 0; i < form.tourImages.length; i++)
          d.append("tourImages", form.tourImages[i]);
    }
    if (category === "rto_service") {
      d.append("officeName", form.officeName);
      d.append("officeAddress", form.officeAddress);
      if (form.rtoOfficeCode) d.append("rtoOfficeCode", form.rtoOfficeCode);
      if (form.services) d.append("services", form.services);
    }
    if (category === "car_accessory") {
      d.append("shopName", form.shopName);
      if (form.shopAddress) d.append("shopAddress", form.shopAddress);
      if (form.accessoryTypes) d.append("accessoryTypes", form.accessoryTypes);
      if (form.shopImages)
        for (let i = 0; i < form.shopImages.length; i++)
          d.append("shopImages", form.shopImages[i]);
    }
    if (category === "car_mechanic") {
      d.append("garageName", form.garageName);
      if (form.garageAddress) d.append("garageAddress", form.garageAddress);
      if (form.mechanicExperience)
        d.append("mechanicExperience", form.mechanicExperience);
      if (form.specialization) d.append("specialization", form.specialization);
      if (form.garageImages)
        for (let i = 0; i < form.garageImages.length; i++)
          d.append("garageImages", form.garageImages[i]);
    }
    return d;
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      Swal.fire({
        icon: "warning",
        title: "Select Category",
        text: "Please choose a service category.",
        confirmButtonColor: "#E52710",
      });
      return;
    }
    setLoading(true);
    setFieldErrors({});
    try {
      const res = await axios({
        method: "post",
        url: "http://localhost:5001/api/auth/register",
        data: buildFD(),
        headers: { Accept: "application/json" },
        withCredentials: false,
        timeout: 15000,
        validateStatus: () => true,
      });
      if (res.data?.success) {
        pushParams("otp", form.phone);
        setStep("otp");
      } else if (res.data?.errors?.length) {
        const errs: FieldErrors = {};
        res.data.errors.forEach((e: { field: string; message: string }) => {
          errs[e.field] = e.message;
        });
        setFieldErrors(errs);
        Swal.fire({
          icon: "error",
          title: "Please fix errors",
          html: res.data.errors
            .map(
              (e: any) =>
                `<div style="text-align:left;padding:2px 0">• ${e.message}</div>`,
            )
            .join(""),
          confirmButtonColor: "#E52710",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: res.data?.message || "Something went wrong.",
          confirmButtonColor: "#E52710",
        });
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Connection Error",
        text: err.message || "Please check your internet.",
        confirmButtonColor: "#E52710",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otp.trim().length < 4) {
      Swal.fire({
        icon: "warning",
        title: "Enter OTP",
        text: "Please enter the OTP from WhatsApp.",
        confirmButtonColor: "#E52710",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        "http://localhost:5001/api/auth/verify-register-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: form.phone, otp: otp.trim() }),
        },
      );
      const data = await res.json();
      if (data.success) {
        pushParams("success");
        setStep("success");
      } else
        Swal.fire({
          icon: "error",
          title: "Invalid OTP",
          text: data.message || "Incorrect OTP.",
          confirmButtonColor: "#E52710",
        });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Verification failed. Try again.",
        confirmButtonColor: "#E52710",
      });
    } finally {
      setLoading(false);
    }
  };

  const base =
    "w-full border rounded-xl px-4 h-12 text-[13px] focus:outline-none focus:ring-2 transition bg-white placeholder:text-gray-400";
  const inp = (err?: boolean) =>
    `${base} ${err ? "border-red-400 focus:ring-red-100 focus:border-red-400" : "border-gray-200 focus:ring-[#E52710]/15 focus:border-[#E52710]"}`;
  const sel = (err?: boolean) =>
    `${base} appearance-none cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed ${err ? "border-red-400 focus:ring-red-100 focus:border-red-400" : "border-gray-200 focus:ring-[#E52710]/15 focus:border-[#E52710]"}`;

  const STEPS = [
    { id: "form", label: "Fill Details", num: 1 },
    { id: "otp", label: "Verify OTP", num: 2 },
    { id: "success", label: "Under Review", num: 3 },
  ];
  const stepIdx = STEPS.findIndex((s) => s.id === step);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, body { font-family: 'Plus Jakarta Sans', sans-serif !important; }
        .cat-btn { transition: all .18s cubic-bezier(.4,0,.2,1); }
        .cat-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(0,0,0,.07); }
        .cat-active { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(229,39,16,.15) !important; }
        @keyframes fsu { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .fsu { animation: fsu .4s ease forwards; }
        @keyframes popIn { 0%{transform:scale(.6);opacity:0} 70%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
        .pop { animation: popIn .5s ease forwards; }
        @keyframes ping2 { 0%{box-shadow:0 0 0 0 rgba(229,39,16,.4)} 80%{box-shadow:0 0 0 12px rgba(229,39,16,0)} 100%{box-shadow:0 0 0 0 rgba(229,39,16,0)} }
        .ping { animation: ping2 2s ease infinite; }
        .scroll-pane::-webkit-scrollbar { width: 4px; }
        .scroll-pane::-webkit-scrollbar-thumb { background: #e9e9e9; border-radius: 4px; }
        select option { color: #111827; }
        @media (max-width: 400px) { .cat-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50/30 flex items-start justify-center px-3 sm:px-5 pt-12 sm:pt-16 pb-14">
        <div className="w-full max-w-5xl">
          {/* Header */}
          <div className="text-center mb-7 fsu">
            <span className="inline-flex items-center gap-1.5 bg-[#E52710]/10 text-[#E52710] text-[11px] font-bold px-3.5 py-1.5 rounded-full mb-3">
              <Star className="w-3 h-3 fill-[#E52710]" /> Taxi Safar Partner
              Network
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Join as a Service Provider
            </h1>
            <p className="text-gray-400 text-[13px] mt-1.5">
              Register once · Get customers forever
            </p>
          </div>

          {/* Step bar */}
          <div className="flex items-center justify-center mb-7 fsu">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300
                    ${i < stepIdx ? "bg-[#E52710] text-white" : i === stepIdx ? "bg-[#E52710] text-white ping" : "bg-gray-100 text-gray-400"}`}
                  >
                    {i < stepIdx ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span
                    className={`text-[11px] font-semibold whitespace-nowrap ${i <= stepIdx ? "text-[#E52710]" : "text-gray-400"}`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-10 sm:w-20 h-0.5 mb-5 mx-2 transition-all duration-500 ${i < stepIdx ? "bg-[#E52710]" : "bg-gray-200"}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden fsu">
            <div className="flex flex-col md:flex-row">
              {/* Left panel */}
              <div className="hidden md:flex md:w-64 lg:w-72 bg-[#E52710] relative overflow-hidden flex-col justify-between p-7 flex-shrink-0">
                <div className="absolute -top-14 -right-14 w-44 h-44 bg-white/5 rounded-full" />
                <div className="absolute -bottom-16 -left-8 w-56 h-56 bg-black/10 rounded-full" />
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 2px 2px,white 1px,transparent 0)",
                    backgroundSize: "20px 20px",
                  }}
                />

                <div className="relative z-10 space-y-6">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-white leading-snug">
                      Grow Your
                      <br />
                      Business With Us
                    </h2>
                    <p className="text-white/60 text-[11px] mt-2 leading-relaxed">
                      Thousands of providers already earning through Taxi Safar.
                    </p>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      [Star, "Verified badge on profile"],
                      [Phone, "Direct customer calls"],
                      [MapPin, "Local search visibility"],
                      [Shield, "Secure trusted platform"],
                    ].map(([Icon, text]: any) => (
                      <div
                        key={text}
                        className="flex items-center gap-2.5 text-[11px] text-white/75"
                      >
                        <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-3 h-3 text-white" />
                        </div>
                        {text}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 bg-white/10 rounded-2xl p-4 mt-6">
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.14em] mb-2">
                    Process
                  </p>
                  {STEPS.map((s, i) => (
                    <div
                      key={s.id}
                      className={`flex items-center gap-2 py-1.5 text-[11px] ${i === stepIdx ? "text-white font-bold" : i < stepIdx ? "text-white/35 line-through" : "text-white/30"}`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center flex-shrink-0 ${i < stepIdx ? "bg-white/25" : i === stepIdx ? "bg-white text-[#E52710] font-extrabold" : "bg-white/10"}`}
                      >
                        {i < stepIdx ? "✓" : s.num}
                      </span>
                      {s.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right content */}
              <div
                className="flex-1 p-5 sm:p-8 overflow-y-auto scroll-pane"
                style={{ maxHeight: "90vh" }}
              >
                {/* ── FORM ── */}
                {step === "form" && (
                  <form onSubmit={submitForm} className="space-y-8">
                    <div>
                      <h2 className="text-lg font-extrabold text-gray-900">
                        Provider Registration
                      </h2>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Fields marked * are required
                      </p>
                    </div>

                    {/* Profile photo */}
                    <Section label="Profile Photo">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => profileRef.current?.click()}
                          className="rounded-2xl bg-gray-50 border border-dashed border-gray-200 overflow-hidden flex items-center justify-center hover:border-[#E52710] transition group flex-shrink-0"
                          style={{ width: 68, height: 68 }}
                        >
                          {profilePreview ? (
                            <img
                              src={profilePreview}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Camera className="w-6 h-6 text-gray-300 group-hover:text-[#E52710] transition" />
                          )}
                        </button>
                        <div className="space-y-1.5">
                          <button
                            type="button"
                            onClick={() => profileRef.current?.click()}
                            className="flex items-center gap-1.5 text-[13px] text-[#E52710] font-bold border border-[#E52710]/30 rounded-xl px-4 h-10 hover:bg-red-50 transition"
                          >
                            <Upload className="w-3.5 h-3.5" /> Upload Photo
                          </button>
                          <p className="text-[11px] text-gray-400">
                            JPG / PNG · max 5MB
                          </p>
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
                    </Section>

                    {/* Basic info */}
                    <Section label="Basic Information">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field err={fieldErrors.name}>
                          <IconInp
                            icon={User}
                            name="name"
                            placeholder="Full Name *"
                            value={form.name}
                            onChange={handleChange}
                            err={!!fieldErrors.name}
                            inp={inp}
                          />
                        </Field>
                        <Field err={fieldErrors.email}>
                          <IconInp
                            icon={Mail}
                            name="email"
                            type="email"
                            placeholder="Email Address *"
                            value={form.email}
                            onChange={handleChange}
                            err={!!fieldErrors.email}
                            inp={inp}
                          />
                        </Field>
                        <Field err={fieldErrors.phone}>
                          <IconInp
                            icon={Phone}
                            name="phone"
                            placeholder="10-digit Mobile *"
                            value={form.phone}
                            onChange={handleChange}
                            err={!!fieldErrors.phone}
                            inp={inp}
                            maxLength={10}
                            inputMode="numeric"
                          />
                        </Field>
                        <div />

                        {/* State dropdown */}
                        <Field err={fieldErrors.state}>
                          <IconSelect
                            icon={Map}
                            name="state"
                            value={form.state}
                            onChange={handleChange}
                            placeholder="Select State"
                            options={states}
                            err={!!fieldErrors.state}
                            sel={sel}
                          />
                        </Field>

                        {/* City dropdown (depends on state) */}
                        <Field err={fieldErrors.city}>
                          <IconSelect
                            icon={MapPin}
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                            disabled={!form.state}
                            placeholder={
                              form.state ? "Select City" : "Select State first"
                            }
                            options={cities}
                            err={!!fieldErrors.city}
                            sel={sel}
                          />
                        </Field>

                        <input
                          name="address"
                          placeholder="Full Address"
                          value={form.address}
                          className={`${inp()} sm:col-span-2`}
                          onChange={handleChange}
                        />
                      </div>
                      <textarea
                        name="description"
                        placeholder="Tell customers about yourself or your business..."
                        rows={3}
                        value={form.description}
                        className={`${inp()} h-auto py-3 resize-none leading-relaxed`}
                        onChange={handleChange}
                      />
                    </Section>

                    {/* Category */}
                    <Section label="Service Category *">
                      <div className="cat-grid grid grid-cols-2 gap-3">
                        {CATEGORIES.map(
                          ({
                            value,
                            label,
                            icon: Icon,
                            gradient,
                            light,
                            border,
                            textColor,
                          }) => {
                            const active = category === value;
                            return (
                              <button
                                key={value}
                                type="button"
                                onClick={() => setCategory(value)}
                                className={`cat-btn rounded-2xl p-4 flex items-center gap-3 text-left border w-full ${active ? "cat-active" : "border-gray-150 bg-gray-50"}`}
                                style={
                                  active
                                    ? {
                                        backgroundColor: light,
                                        borderColor: border,
                                      }
                                    : { borderColor: "#ededf0" }
                                }
                              >
                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${active ? `bg-gradient-to-br ${gradient} shadow` : "bg-white border border-gray-200"}`}
                                >
                                  <Icon
                                    className={`w-4.5 h-4.5 ${active ? "text-white" : "text-gray-400"}`}
                                    style={{ width: 18, height: 18 }}
                                  />
                                </div>
                                <span
                                  className="font-bold text-[13px] leading-tight"
                                  style={{
                                    color: active ? textColor : "#374151",
                                  }}
                                >
                                  {label}
                                </span>
                                {active && (
                                  <Check
                                    className="w-3.5 h-3.5 ml-auto flex-shrink-0"
                                    style={{ color: textColor }}
                                  />
                                )}
                              </button>
                            );
                          },
                        )}
                      </div>
                    </Section>

                    {/* Tour Guide */}
                    {category === "tour_guide" && (
                      <div className="space-y-4 p-5 bg-amber-50/60 rounded-2xl border border-amber-100">
                        <SecHead
                          icon={Compass}
                          label="Tour Guide Details"
                          color="text-amber-700"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Field err={fieldErrors.experienceYears}>
                            <input
                              name="experienceYears"
                              type="number"
                              placeholder="Experience (Years) *"
                              value={form.experienceYears}
                              className={inp(!!fieldErrors.experienceYears)}
                              onChange={handleChange}
                              required
                            />
                          </Field>
                          <Field err={fieldErrors.languages}>
                            <input
                              name="languages"
                              placeholder="Languages (Hindi, English) *"
                              value={form.languages}
                              className={inp(!!fieldErrors.languages)}
                              onChange={handleChange}
                              required
                            />
                          </Field>
                          <input
                            name="servicesOffered"
                            placeholder="Services (Trekking, City Tour)"
                            value={form.servicesOffered}
                            className={`${inp()} sm:col-span-2`}
                            onChange={handleChange}
                          />
                        </div>
                        <MultiImgUpload
                          label="Tour Photos"
                          name="tourImages"
                          onChange={handleChange}
                        />
                      </div>
                    )}

                    {/* RTO */}
                    {category === "rto_service" && (
                      <div className="space-y-4 p-5 bg-blue-50/60 rounded-2xl border border-blue-100">
                        <SecHead
                          icon={Car}
                          label="RTO Service Details"
                          color="text-blue-700"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Field err={fieldErrors.officeName}>
                            <input
                              name="officeName"
                              placeholder="Office Name *"
                              value={form.officeName}
                              className={inp(!!fieldErrors.officeName)}
                              onChange={handleChange}
                              required
                            />
                          </Field>
                          <input
                            name="rtoOfficeCode"
                            placeholder="RTO Office Code (e.g. MH-12)"
                            value={form.rtoOfficeCode}
                            className={inp()}
                            onChange={handleChange}
                          />
                          <input
                            name="officeAddress"
                            placeholder="Office Address *"
                            value={form.officeAddress}
                            className={`${inp(!!fieldErrors.officeAddress)} sm:col-span-2`}
                            onChange={handleChange}
                            required
                          />
                          <input
                            name="services"
                            placeholder="Services (DL, RC Transfer…)"
                            value={form.services}
                            className={`${inp()} sm:col-span-2`}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    )}

                    {/* Car Accessory */}
                    {category === "car_accessory" && (
                      <div className="space-y-4 p-5 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                        <SecHead
                          icon={Wrench}
                          label="Car Accessory Shop"
                          color="text-emerald-700"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Field err={fieldErrors.shopName}>
                            <input
                              name="shopName"
                              placeholder="Shop Name *"
                              value={form.shopName}
                              className={inp(!!fieldErrors.shopName)}
                              onChange={handleChange}
                              required
                            />
                          </Field>
                          <input
                            name="shopAddress"
                            placeholder="Shop Address"
                            value={form.shopAddress}
                            className={inp()}
                            onChange={handleChange}
                          />
                          <input
                            name="accessoryTypes"
                            placeholder="Types (Seat Cover, Music System)"
                            value={form.accessoryTypes}
                            className={`${inp()} sm:col-span-2`}
                            onChange={handleChange}
                          />
                        </div>
                        <MultiImgUpload
                          label="Shop Photos"
                          name="shopImages"
                          onChange={handleChange}
                        />
                      </div>
                    )}

                    {/* Car Mechanic */}
                    {category === "car_mechanic" && (
                      <div className="space-y-4 p-5 bg-purple-50/60 rounded-2xl border border-purple-100">
                        <SecHead
                          icon={Building2}
                          label="Garage Details"
                          color="text-purple-700"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Field err={fieldErrors.garageName}>
                            <input
                              name="garageName"
                              placeholder="Garage Name *"
                              value={form.garageName}
                              className={inp(!!fieldErrors.garageName)}
                              onChange={handleChange}
                              required
                            />
                          </Field>
                          <input
                            name="garageAddress"
                            placeholder="Garage Address"
                            value={form.garageAddress}
                            className={inp()}
                            onChange={handleChange}
                          />
                          <input
                            name="mechanicExperience"
                            type="number"
                            placeholder="Experience (Years)"
                            value={form.mechanicExperience}
                            className={inp()}
                            onChange={handleChange}
                          />
                          <input
                            name="specialization"
                            placeholder="Specialization (Engine, Electrical)"
                            value={form.specialization}
                            className={inp()}
                            onChange={handleChange}
                          />
                        </div>
                        <MultiImgUpload
                          label="Garage Photos"
                          name="garageImages"
                          onChange={handleChange}
                        />
                      </div>
                    )}

                    {/* Identity docs */}
                    <Section label="Identity Verification" icon={Shield}>
                      <div className="space-y-2.5">
                        <DocTile
                          label="Aadhar Card – Front"
                          hint="Upload front side (JPG / PDF)"
                          icon={IdCard}
                          iconBg="bg-blue-100"
                          iconColor="text-blue-600"
                          value={form.aadharFront}
                          name="aadharFront"
                          onClear={() =>
                            setForm((p) => ({ ...p, aadharFront: null }))
                          }
                          inputRef={aadharFrontRef}
                          onChange={handleChange}
                        />
                        <DocTile
                          label="Aadhar Card – Back"
                          hint="Upload back side (JPG / PDF)"
                          icon={IdCard}
                          iconBg="bg-blue-50"
                          iconColor="text-blue-500"
                          value={form.aadharBack}
                          name="aadharBack"
                          onClear={() =>
                            setForm((p) => ({ ...p, aadharBack: null }))
                          }
                          inputRef={aadharBackRef}
                          onChange={handleChange}
                        />
                        <DocTile
                          label="PAN Card"
                          hint="Upload PAN card (JPG / PDF)"
                          icon={CreditCard}
                          iconBg="bg-orange-100"
                          iconColor="text-orange-600"
                          value={form.panCard}
                          name="panCard"
                          onClear={() =>
                            setForm((p) => ({ ...p, panCard: null }))
                          }
                          inputRef={panRef}
                          onChange={handleChange}
                        />
                        <p className="text-[11px] text-gray-400 flex items-center gap-1.5 pt-1">
                          <Shield className="w-3 h-3 text-green-500 flex-shrink-0" />{" "}
                          Encrypted · used only for identity verification
                        </p>
                      </div>
                    </Section>

                    {/* Social links */}
                    <div className="border border-gray-100 rounded-2xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setShowSocial(!showSocial)}
                        className="w-full flex items-center justify-between px-5 h-14 bg-gray-50 hover:bg-gray-100 transition"
                      >
                        <span className="flex items-center gap-2 text-[13px] font-bold text-gray-600">
                          <Globe className="w-4 h-4 text-gray-400" /> Social &
                          Online Links
                          <span className="text-gray-400 font-normal text-[11px]">
                            (optional)
                          </span>
                        </span>
                        {showSocial ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      {showSocial && (
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-gray-100">
                          {[
                            {
                              name: "facebook",
                              icon: Facebook,
                              ph: "Facebook URL",
                              c: "text-blue-600",
                            },
                            {
                              name: "instagram",
                              icon: Instagram,
                              ph: "Instagram URL",
                              c: "text-pink-500",
                            },
                            {
                              name: "youtube",
                              icon: Youtube,
                              ph: "YouTube URL",
                              c: "text-red-500",
                            },
                            {
                              name: "website",
                              icon: Globe,
                              ph: "Website URL",
                              c: "text-gray-400",
                            },
                            {
                              name: "whatsapp",
                              icon: MessageCircle,
                              ph: "WhatsApp Number",
                              c: "text-green-600",
                            },
                          ].map(({ name, icon: Icon, ph, c }) => (
                            <div key={name} className="relative">
                              <Icon
                                className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${c}`}
                              />
                              <input
                                name={name}
                                placeholder={ph}
                                className={inp() + " pl-10"}
                                onChange={handleChange}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#E52710] text-white h-14 rounded-2xl font-extrabold text-[13px] hover:opacity-90 active:scale-[.98] transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-[#E52710]/20"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />{" "}
                          Submitting…
                        </>
                      ) : (
                        <>
                          Register Now <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* ── OTP ── */}
                {step === "otp" && (
                  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 max-w-xs mx-auto text-center">
                    <div className="w-20 h-20 bg-[#E52710]/10 rounded-3xl flex items-center justify-center ping">
                      <Phone className="w-9 h-9 text-[#E52710]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-gray-900">
                        Verify Your Number
                      </h2>
                      <p className="text-gray-400 text-[13px] mt-1.5">
                        OTP sent to WhatsApp
                      </p>
                      <p className="font-extrabold text-gray-800 mt-1">
                        {form.phone}
                      </p>
                    </div>
                    <input
                      className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 text-center text-2xl font-extrabold tracking-[.4em] focus:outline-none focus:border-[#E52710] transition bg-white"
                      placeholder="• • • • • •"
                      maxLength={6}
                      inputMode="numeric"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                    <button
                      onClick={verifyOTP}
                      disabled={loading}
                      className="w-full bg-[#E52710] text-white h-14 rounded-2xl font-extrabold text-[13px] hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-[#E52710]/20"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />{" "}
                          Verifying…
                        </>
                      ) : (
                        <>
                          Verify OTP <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-gray-400">
                      Didn't get it?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setStep("form");
                          window.history.replaceState(
                            {},
                            "",
                            window.location.pathname,
                          );
                        }}
                        className="text-[#E52710] font-bold hover:underline"
                      >
                        Go back
                      </button>
                    </p>
                  </div>
                )}

                {/* ── SUCCESS ── */}
                {step === "success" && (
                  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 max-w-sm mx-auto text-center py-8">
                    <div className="pop w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl flex items-center justify-center shadow-xl shadow-green-200">
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-gray-900">
                        You're Registered! 🎉
                      </h2>
                      <p className="text-gray-400 text-[13px] mt-1.5">
                        Your profile is now under review.
                      </p>
                    </div>
                    <div className="w-full space-y-2.5 text-left">
                      {[
                        {
                          icon: Clock,
                          bg: "bg-amber-50 border-amber-200",
                          ic: "text-amber-500",
                          title: "24–48 hours review",
                          desc: "Our team will verify your documents and details.",
                        },
                        {
                          icon: MessageCircle,
                          bg: "bg-green-50 border-green-200",
                          ic: "text-green-500",
                          title: "WhatsApp deposit link",
                          desc: "After review, you'll receive a security deposit link via WhatsApp.",
                        },
                        {
                          icon: Star,
                          bg: "bg-red-50 border-[#E52710]/20",
                          ic: "text-[#E52710]",
                          title: "Go live on Taxi Safar App",
                          desc: "Once deposit is confirmed, your profile appears in the app.",
                        },
                      ].map(({ icon: Icon, bg, ic, title, desc }) => (
                        <div
                          key={title}
                          className={`flex items-start gap-3 border rounded-2xl p-4 ${bg}`}
                        >
                          <Icon
                            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${ic}`}
                          />
                          <div>
                            <p className="text-[13px] font-bold text-gray-800">
                              {title}
                            </p>
                            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                              {desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="w-full bg-[#E52710]/5 border border-[#E52710]/15 rounded-2xl p-4">
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        <span className="font-bold text-[#E52710]">Next:</span>{" "}
                        Watch your WhatsApp for the Taxi Safar team message with
                        your verification status and deposit link.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setStep("form");
                        setForm(INIT);
                        setProfilePreview(null);
                        setOtp("");
                        setCategory("");
                        window.history.replaceState(
                          {},
                          "",
                          window.location.pathname,
                        );
                      }}
                      className="text-[13px] text-[#E52710] font-bold hover:underline"
                    >
                      + Register another provider
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
