"use client";

import axios from "axios";
import { useState, useRef, useEffect } from "react";
import {
  MapPin,
  Phone,
  Mail,
  User,
  Wrench,
  Car,
  Compass,
  ChevronDown,
  ChevronUp,
  Facebook,
  Instagram,
  Youtube,
  Globe,
  MessageCircle,
  CheckCircle2,
  Shield,
  ArrowRight,
  CreditCard,
  AlertCircle,
  Loader2,
  IdCard,
  X,
  Check,
  Map,
  Users,
  ImagePlus,
  RotateCcw,
} from "lucide-react";
import Swal from "sweetalert2";
import INDIAN_STATES_CITIES, { STATE_LIST } from "@/data/indianStatesCities";

const LOGO_SRC = "/logo-partner.png";

type Category = "tour_guide" | "rto_service" | "car_accessory";

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
] as const;

// field name (multipart) that each category's gallery images are appended under
const CATEGORY_IMAGE_FIELD: Record<Category, string> = {
  tour_guide: "tourImages",
  rto_service: "officeImages",
  car_accessory: "shopImages",
};

const MAX_CATEGORY_IMAGES = 6;

type FormState = {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  address: string;
  description: string;
  facebook: string;
  instagram: string;
  youtube: string;
  website: string;
  whatsapp: string;
  experienceYears: string;
  languages: string;
  servicesOffered: string;
  officeName: string;
  officeAddress: string;
  rtoOfficeCode: string;
  services: string;
  shopName: string;
  shopAddress: string;
  accessoryTypes: string;
  referralPhone: string;
  referralDriverId: string;
  referralDriverName: string;
};

const INIT: FormState = {
  name: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  address: "",
  description: "",
  facebook: "",
  instagram: "",
  youtube: "",
  website: "",
  whatsapp: "",
  experienceYears: "",
  languages: "",
  servicesOffered: "",
  officeName: "",
  officeAddress: "",
  rtoOfficeCode: "",
  services: "",
  shopName: "",
  shopAddress: "",
  accessoryTypes: "",
  referralPhone: "",
  referralDriverId: "",
  referralDriverName: "",
};

type FieldErrors = Record<string, string>;
type Step =
  | "form"
  | "otp"
  | "kyc-aadhaar"
  | "kyc-payment"
  | "kyc-otp"
  | "success";

const categoryLabelMap: Record<string, string> = {
  tour_guide: "Tour Guide",
  rto_service: "RTO Service",
  car_accessory: "Car Accessory",
};

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
      <Icon className="absolute left-1.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
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
        className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${disabled ? "text-gray-300" : "text-gray-400"}`}
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

/* ─── Image uploader (max N images, preview + remove, no external deps) ──── */
function ImageUploader({
  images,
  setImages,
  max = MAX_CATEGORY_IMAGES,
  label = "Photos",
}: {
  images: File[];
  setImages: (files: File[]) => void;
  max?: number;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = images.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [images]);

  const handleFiles = (files: FileList | null) => {
    if (!files || !files.length) return;
    const incoming = Array.from(files).filter((f) =>
      f.type.startsWith("image/"),
    );
    const merged = [...images, ...incoming].slice(0, max);
    setImages(merged);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeAt = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-2 sm:col-span-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.1em]">
          {label}
        </span>
        <span className="text-[11px] text-gray-400 font-medium">
          {images.length}/{max}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {previews.map((src, idx) => (
          <div
            key={idx}
            className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 group"
          >
            <img src={src} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(idx)}
              className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center"
            >
              <X className="w-2.5 h-2.5 text-white" />
            </button>
          </div>
        ))}

        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-0.5 text-gray-400 hover:border-[#E52710] hover:text-[#E52710] transition"
          >
            <ImagePlus className="w-4.5 h-4.5" />
            <span className="text-[9px] font-bold">Add</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

const KYC_API_BASE = "https://partners.taxisafar.com/api/auth";
const FEES_API_BASE = "https://partners.taxisafar.com/api/v1/fees/key";
const USER_API_BASE = "https://partners.taxisafar.com/api/auth/users";
const DRIVER_SEARCH_API = "https://authapi.taxisafar.com/api/v1/search-drivers";

const CATEGORY_TO_FEE_KEY: Record<string, string> = {
  tour_guide: "kyc_fee_for_guide",
  rto_service: "kyc_fee_for_rto",
  car_accessory: "kyc_fee_for_car_access",
};

// which field on the driver-search response indicates KYC completion.
// adjust this if the real API uses a different field name.
const isDriverKycVerified = (driver: any) =>
  !!driver &&
  (driver.kyc_status === "verified" ||
    driver.kyc_done === true ||
    driver.aadharVerified === true ||
    driver.isKycVerified === true ||
    driver.is_kyc_verified === true);

/* ─── Main component ────────────────────────────────────────────────────── */
export default function RegisterPage() {
  const [category, setCategory] = useState<Category | "">("");
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<FormState>(INIT);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // gallery images for whichever category is currently selected (max 6)
  const [categoryImages, setCategoryImages] = useState<File[]>([]);
  useEffect(() => {
    setCategoryImages([]);
  }, [category]);

  const [kycFee, setKycFee] = useState<number | null>(null);
  const [fetchingFee, setFetchingFee] = useState(false);
  const KYC_STORE_KEY = "taxisafar_kyc_state";
  const [userId, setUserId] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [aadhaarOtp, setAadhaarOtp] = useState("");
  const [payingKyc, setPayingKyc] = useState(false);
  const [sendingAadhaarOtp, setSendingAadhaarOtp] = useState(false);
  const [verifyingAadhaarOtp, setVerifyingAadhaarOtp] = useState(false);
  const [aadhaarResendTimer, setAadhaarResendTimer] = useState(0);

  // tracks whether the ₹ KYC fee has already been paid for this user, so a
  // restart / refresh never asks for payment twice
  const [feePaid, setFeePaid] = useState(false);

  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [referralOn, setReferralOn] = useState(false);
  const [referralInput, setReferralInput] = useState("");
  const [driverResult, setDriverResult] = useState<any>(null);
  const [driverError, setDriverError] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [driverSearching, setDriverSearching] = useState(false);

  // ── restore step/session on load ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("step") as Step | null;
    const phone = params.get("phone");
    const uid = params.get("uid");

    let restoredUserId = "";

    try {
      const raw = sessionStorage.getItem(KYC_STORE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.userId) {
          setUserId(saved.userId);
          restoredUserId = saved.userId;
        }
        if (saved.phone) setForm((p) => ({ ...p, phone: saved.phone }));
        if (saved.aadharNumber) setAadharNumber(saved.aadharNumber);
      }
    } catch (_) {}

    if (uid && !restoredUserId) {
      setUserId(uid);
      restoredUserId = uid;
    }

    if (s === "otp" && phone) {
      setForm((p) => ({ ...p, phone }));
      setStep("otp");
    } else if (s === "kyc-aadhaar") setStep("kyc-aadhaar");
    else if (s === "kyc-payment") setStep("kyc-payment");
    else if (s === "kyc-otp") setStep("kyc-otp");
    else if (s === "success") setStep("success");

    const needsHydration = restoredUserId && (!category || !form.phone);
    if (needsHydration) {
      fetchUserDetails(restoredUserId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (name: keyof FormState, value: string) => {
    setForm((p) => ({ ...p, [name]: value }));
  };

  const driverCode = (id?: string) =>
    id ? `#${id.slice(-6).toUpperCase()}` : "—";

  const cleanText = (v: any) => (typeof v === "string" ? v.trim() : "");

  // ── fetch full user details and re-hydrate form/category/step ──
  const fetchUserDetails = async (uid: string) => {
    try {
      const res = await axios.get(`${USER_API_BASE}/${uid}`);
      if (!res.data?.success) return;
      const user = res.data.data;

      setForm((p) => ({
        ...p,
        name: user.name || p.name,
        phone: user.phone || p.phone,
        city: user.city || p.city,
        state: user.state || p.state,
        address: user.address || p.address,
        description: user.description || p.description,
      }));

      if (user.category) setCategory(user.category);
      if (user.aadharNumber) setAadharNumber(user.aadharNumber);
      if (user.isKycFeeDone) setFeePaid(true);

      if (user.kycStatus === "kyc-success") {
        pushParams("success");
        setStep("success");
      } else if (user.isKycFeeDone) {
        // fee already paid in a previous session — skip straight to Aadhaar OTP
        pushParams("kyc-otp");
        setStep("kyc-otp");
      } else if (user.isMobileVerified) {
        pushParams("kyc-aadhaar");
        setStep("kyc-aadhaar");
      }
    } catch (err) {
      console.error("fetchUserDetails err:", err);
    }
  };

  // ── referral driver ──
  const toggleReferral = () => {
    setReferralOn((prev) => {
      const next = !prev;
      if (!next) {
        setReferralInput("");
        setDriverResult(null);
        setDriverError("");
        setSelectedDriver(null);
        update("referralPhone", "");
        update("referralDriverId", "");
        update("referralDriverName", "");
      }
      return next;
    });
  };

  const searchDriver = async (query: string) => {
    setDriverSearching(true);
    setDriverError("");
    setDriverResult(null);
    try {
      const res = await axios.get(DRIVER_SEARCH_API, {
        params: { phoneNumber: query },
      });
      const driver = res.data?.data?.[0];
      if (!driver) {
        setDriverError("No driver found with this number.");
        return;
      }
      setDriverResult(driver);
    } catch (err: any) {
      setDriverError(err?.response?.data?.message || "Driver not found.");
    } finally {
      setDriverSearching(false);
    }
  };

  // auto-search as the user types — full 10-digit number OR last 8 digits,
  // no manual "Search" button needed
  useEffect(() => {
    if (!referralOn || selectedDriver) return;
    if (referralInput.length !== 10 && referralInput.length !== 8) {
      setDriverResult(null);
      setDriverError("");
      return;
    }
    const t = setTimeout(() => searchDriver(referralInput), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referralInput, referralOn, selectedDriver]);

  const addReferralDriver = () => {
    if (!driverResult) return;
    if (!isDriverKycVerified(driverResult)) return;
    setSelectedDriver(driverResult);
    update(
      "referralPhone",
      driverResult.driver_contact_number || referralInput,
    );
    update("referralDriverId", driverResult._id);
    update("referralDriverName", driverResult.driver_name || "");
  };

  const removeReferralDriver = () => {
    setSelectedDriver(null);
    setDriverResult(null);
    setReferralInput("");
    update("referralPhone", "");
    update("referralDriverId", "");
    update("referralDriverName", "");
  };

  // ── persist crucial fields whenever they change ──
  useEffect(() => {
    if (!userId && !form.phone && !aadharNumber) return;
    try {
      sessionStorage.setItem(
        KYC_STORE_KEY,
        JSON.stringify({
          userId,
          phone: form.phone,
          aadharNumber,
        }),
      );
    } catch (_) {}
  }, [userId, form.phone, aadharNumber]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // ── kyc fee fetch (needed on the payment step) — skipped entirely if fee already paid ──
  useEffect(() => {
    if (step !== "kyc-payment") return;

    if (!category && userId) {
      fetchUserDetails(userId);
      return;
    }

    if (feePaid) {
      // fee was already paid in an earlier session — don't ask again,
      // go straight to sending the Aadhaar OTP
      sendAadhaarOtpHandler();
      return;
    }

    const feeKey = CATEGORY_TO_FEE_KEY[category] || "kyc_fee_for_guide";

    setFetchingFee(true);
    axios
      .get(`${FEES_API_BASE}/${feeKey}`)
      .then((res) => {
        if (res.data?.success) setKycFee(res.data.data.value);
      })
      .catch((err) => {
        console.error("fee fetch err:", err);
        setKycFee(null);
      })
      .finally(() => setFetchingFee(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, category, userId, feePaid]);

  // ── fetch profile details once KYC succeeds ──
  useEffect(() => {
    if (step !== "success" || !userId) return;
    setProfileLoading(true);
    axios
      .get(`${USER_API_BASE}/${userId}`)
      .then((res) => {
        if (res.data?.success) setProfileData(res.data.data);
      })
      .catch((err) => console.error("profile fetch err:", err))
      .finally(() => setProfileLoading(false));
  }, [step, userId]);

  useEffect(() => {
    if (aadhaarResendTimer <= 0) return;
    const t = setInterval(() => setAadhaarResendTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [aadhaarResendTimer]);

  const states = STATE_LIST;
  const cities = form.state ? INDIAN_STATES_CITIES[form.state] || [] : [];

  const pushParams = (s: Step, phone?: string) => {
    const p = new URLSearchParams();
    p.set("step", s);
    if (phone) p.set("phone", phone);
    if (userId) p.set("uid", userId);
    window.history.replaceState({}, "", `?${p.toString()}`);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target as any;

    if (name === "state") {
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
    }

    // category gallery images (max 6) — field name depends on the category
    if (category && categoryImages.length) {
      const fieldName = CATEGORY_IMAGE_FIELD[category];
      categoryImages.slice(0, MAX_CATEGORY_IMAGES).forEach((file) => {
        d.append(fieldName, file);
      });
    }

    if (form.referralPhone) d.append("referralPhone", form.referralPhone);
    if (form.referralDriverId)
      d.append("referralDriverId", form.referralDriverId);
    if (form.referralDriverName)
      d.append("referralDriverName", form.referralDriverName);

    return d;
  };
const restartFlow = () => {
  setOtp("");
  setAadhaarOtp("");
  setFieldErrors({});
  pushParams("form");
  setStep("form"); // userId/phone/aadharNumber stay in state, so resubmit resumes correctly
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
        url: "https://partners.taxisafar.com/api/auth/register",
        data: buildFD(),
        headers: { Accept: "application/json" },
        withCredentials: false,
        timeout: 15000,
        validateStatus: () => true,
      });
      if (res.data?.success) {
        const d = res.data.data;
        if (d?.userId) setUserId(d.userId);

        if (d?.kycStatus === "kyc-success") {
          pushParams("success");
          setStep("success");
        } else if (d?.isKycFeeDone) {
          setFeePaid(true);
          pushParams("kyc-otp");
          setStep("kyc-otp"); // fee already paid for this number — skip payment
        } else if (d?.isMobileVerified) {
          pushParams("kyc-aadhaar");
          setStep("kyc-aadhaar");
        } else {
          pushParams("otp", form.phone);
          setStep("otp");
        }
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
        "https://partners.taxisafar.com/api/auth/verify-register-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: form.phone, otp: otp.trim() }),
        },
      );
      const data = await res.json();
      if (data.success) {
        if (data?.data?.userId) setUserId(data.data.userId);
        pushParams("kyc-aadhaar");
        setStep("kyc-aadhaar");
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

  // ── Aadhaar number entry: local validation only — if fee is already paid
  // (restart/refresh scenario), skip the payment step entirely and go
  // straight to sending the Aadhaar OTP ──
  const proceedToPayment = async () => {
    if (!/^\d{12}$/.test(aadharNumber)) {
      Swal.fire({
        icon: "warning",
        title: "Enter valid 12-digit Aadhaar number",
        confirmButtonColor: "#E52710",
      });
      return;
    }

    if (feePaid) {
      await sendAadhaarOtpHandler();
      return;
    }

    pushParams("kyc-payment");
    setStep("kyc-payment");
  };

  // ── KYC payment ──
  const startKycPayment = async () => {
    if (!userId) {
      Swal.fire({
        icon: "error",
        title: "Profile not found",
        text: "Please try again.",
        confirmButtonColor: "#E52710",
      });
      return;
    }

    setPayingKyc(true);

    try {
      const res = await axios.post(
        `${KYC_API_BASE}/${userId}/kyc/create-order`,
      );
      const responseData = res?.data;
      const razorpayOrder = responseData?.order?.order;

      const order = {
        orderId: razorpayOrder?.id,
        amount: razorpayOrder?.amount,
        currency: razorpayOrder?.currency,
        key: responseData?.data?.key,
      };

      if (!order.orderId || !order.amount || !order.currency || !order.key) {
        Swal.fire({
          icon: "error",
          title: "Payment unavailable",
          text:
            responseData?.message ||
            "Unable to create a valid payment order. Please try again.",
          confirmButtonColor: "#E52710",
        });
        setPayingKyc(false);
        return;
      }

      if (!(window as any).Razorpay) {
        Swal.fire({
          icon: "error",
          title: "Payment gateway unavailable",
          text: "Razorpay could not be loaded. Please refresh the page and try again.",
          confirmButtonColor: "#E52710",
        });
        setPayingKyc(false);
        return;
      }

      const rzp = new (window as any).Razorpay({
        key: order.key,
        amount: Number(order.amount),
        currency: order.currency,
        order_id: order.orderId,
        name: "Taxi Safar",
        description: "Partner KYC Fee",
        prefill: {
          name: form.name || "",
          contact: form.phone || "",
          email: form.email || "",
        },
        theme: { color: "#E52710" },
        handler: async (paymentResponse: any) => {
          try {
            if (
              !paymentResponse?.razorpay_order_id ||
              !paymentResponse?.razorpay_payment_id ||
              !paymentResponse?.razorpay_signature
            ) {
              Swal.fire({
                icon: "error",
                title: "Payment verification failed",
                text: "Invalid payment response received. Please contact support.",
                confirmButtonColor: "#E52710",
              });
              setPayingKyc(false);
              return;
            }

            await axios.post(`${KYC_API_BASE}/${userId}/kyc/verify-payment`, {
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });

            setFeePaid(true);
            setPayingKyc(false);
            // payment done → immediately send Aadhaar OTP using the number captured earlier
            await sendAadhaarOtpHandler();
          } catch (err: any) {
            setPayingKyc(false);
            Swal.fire({
              icon: "error",
              title: "Payment verification failed",
              text:
                err?.response?.data?.message ||
                "We couldn't verify your payment. Please contact support.",
              confirmButtonColor: "#E52710",
            });
          }
        },
        modal: {
          ondismiss: () => setPayingKyc(false),
        },
      });

      rzp.on("payment.failed", (paymentFailedResponse: any) => {
        setPayingKyc(false);
        Swal.fire({
          icon: "error",
          title: "Payment failed",
          text:
            paymentFailedResponse?.error?.description ||
            "Your payment couldn't be completed. Please try again.",
          confirmButtonColor: "#E52710",
        });
      });

      rzp.open();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Couldn't start payment",
        text: err?.response?.data?.message || err?.message || "Try again",
        confirmButtonColor: "#E52710",
      });
      setPayingKyc(false);
    }
  };

  const sendAadhaarOtpHandler = async () => {
    if (!/^\d{12}$/.test(aadharNumber)) {
      Swal.fire({
        icon: "warning",
        title: "Enter valid 12-digit Aadhaar number",
        confirmButtonColor: "#E52710",
      });
      return;
    }
    setSendingAadhaarOtp(true);
    try {
      await axios.post(`${KYC_API_BASE}/${userId}/kyc/aadhaar/send-otp`, {
        aadharNumber,
      });
      pushParams("kyc-otp");
      setStep("kyc-otp");
      setAadhaarResendTimer(30);
      Swal.fire({
        icon: "success",
        title: "OTP sent",
        text: "Check your Aadhaar-linked mobile number",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Couldn't send OTP",
        text:
          err?.response?.data?.message || "Check Aadhaar number and try again",
        confirmButtonColor: "#E52710",
      });
    } finally {
      setSendingAadhaarOtp(false);
    }
  };

  const verifyAadhaarOtpHandler = async () => {
    if (aadhaarOtp.trim().length < 4) {
      Swal.fire({
        icon: "warning",
        title: "Enter OTP",
        confirmButtonColor: "#E52710",
      });
      return;
    }
    setVerifyingAadhaarOtp(true);
    try {
      await axios.post(`${KYC_API_BASE}/${userId}/kyc/aadhaar/verify-otp`, {
        otp: aadhaarOtp.trim(),
      });
      sessionStorage.removeItem(KYC_STORE_KEY);
      pushParams("success");
      setStep("success");
      Swal.fire({
        icon: "success",
        title: "KYC Verified!",
        text: "Your profile is now under review.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Aadhaar verification failed",
        text: err?.response?.data?.message || "Invalid or expired OTP",
        confirmButtonColor: "#E52710",
      });
    } finally {
      setVerifyingAadhaarOtp(false);
    }
  };

  const resendAadhaarOtp = async () => {
    if (aadhaarResendTimer > 0) return;
    await sendAadhaarOtpHandler();
  };

  const base =
    "w-full border rounded-xl px-4 h-12 text-[13px] focus:outline-none focus:ring-2 transition bg-white placeholder:text-gray-400";
  const inp = (err?: boolean) =>
    `${base} ${err ? "border-red-400 focus:ring-red-100 focus:border-red-400" : "border-gray-200 focus:ring-[#E52710]/15 focus:border-[#E52710]"}`;
  const sel = (err?: boolean) =>
    `${base} appearance-none cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed ${
      err
        ? "border-red-400 focus:ring-red-100 focus:border-red-400"
        : "border-gray-200 focus:ring-[#E52710]/15 focus:border-[#E52710]"
    }`;

  const Header = (
    <div className="bg-white border-b sticky top-0 z-10">
    <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
      <div className="w-16" />
      <img
        src={LOGO_SRC}
        alt="TaxiSafar"
        className="h-16 w-auto object-contain"
      />
      <button
        onClick={restartFlow}
        className="h-9 px-3 rounded-xl border border-gray-300 text-gray-600 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-gray-50 shrink-0"
      >
        <RotateCcw className="w-3.5 h-3.5" /> Restart
      </button>
    </div>
  </div>
  );

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
        .scroll-pane::-webkit-scrollbar { width: 5px; }
        .scroll-pane::-webkit-scrollbar-thumb { background: #e9e9e9; border-radius: 4px; }
        select option { color: #111827; }
      `}</style>

      <div className="min-h-screen w-full bg-gray-50">
        {Header}

        <main className="flex-1 md:h-screen md:overflow-y-auto scroll-pane">
          <div className="w-full max-w-3xl mx-auto px-4 sm:px-8 lg:px-10 py-8 sm:py-12">
            {/* ── FORM ── */}
            {step === "form" && (
              <form
                onSubmit={submitForm}
                className="space-y-8 fsu pb-28 sm:pb-0"
              >
                {/* Basic info */}
                <Section label="Basic Information">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field err={fieldErrors.name}>
                      <IconInp
                        icon={User}
                        name="name"
                        placeholder="Full Name "
                        value={form.name}
                        onChange={handleChange}
                        err={!!fieldErrors.name}
                        inp={inp}
                      />
                    </Field>
                    <Field err={fieldErrors.phone}>
                      <IconInp
                        icon={Phone}
                        name="phone"
                        type="phone"
                        placeholder="10-digit Mobile "
                        value={form.phone}
                        onChange={handleChange}
                        err={!!fieldErrors.phone}
                        inp={inp}
                        maxLength={10}
                        inputMode="numeric"
                      />
                    </Field>

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
                </Section>

                {/* Category */}
                <Section label="Service Category ">
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3">
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
                            className={`cat-btn rounded-2xl p-4 flex items-center gap-3 text-left border w-full ${
                              active
                                ? "cat-active"
                                : "border-gray-150 bg-gray-50"
                            }`}
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
                              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                active
                                  ? `bg-gradient-to-br ${gradient} shadow`
                                  : "bg-white border border-gray-200"
                              }`}
                            >
                              <Icon
                                className={`${active ? "text-white" : "text-gray-400"}`}
                                style={{ width: 18, height: 18 }}
                              />
                            </div>
                            <span
                              className="font-bold text-[13px] leading-tight"
                              style={{ color: active ? textColor : "#374151" }}
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
                          placeholder="Experience (Years)"
                          value={form.experienceYears}
                          className={inp(!!fieldErrors.experienceYears)}
                          onChange={handleChange}
                          required
                        />
                      </Field>
                      <Field err={fieldErrors.languages}>
                        <input
                          name="languages"
                          placeholder="Languages (Hindi, English)"
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
                      <ImageUploader
                        images={categoryImages}
                        setImages={setCategoryImages}
                        label="Tour Photos (up to 6)"
                      />
                    </div>
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
                          placeholder="Office Name "
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
                        placeholder="Office Address"
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
                      <ImageUploader
                        images={categoryImages}
                        setImages={setCategoryImages}
                        label="Office Photos (up to 6)"
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
                          placeholder="Shop Name "
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
                      <ImageUploader
                        images={categoryImages}
                        setImages={setCategoryImages}
                        label="Shop Photos (up to 6)"
                      />
                    </div>
                  </div>
                )}

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

                {/* Referral Driver */}
                <div className="rounded-2xl border border-gray-200 p-3.5 bg-gray-50/60">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-white border flex items-center justify-center shrink-0">
                        <Users className="w-4.5 h-4.5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-red-600 leading-tight">
                          Referral Driver Number
                        </p>
                        <p className="text-[11px] text-gray-400">
                          Optional — if a TaxiSafar driver referred you
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={toggleReferral}
                      className={`relative w-14 h-7 rounded-full shrink-0 transition ${referralOn ? "bg-red-600" : "bg-gray-300"}`}
                    >
                      <span
                        className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ${referralOn ? "left-7" : "left-0.5"}`}
                      />
                      <span
                        className={`absolute text-[10px] font-bold text-white top-1.5 ${referralOn ? "left-2" : "right-1.5 text-gray-600"}`}
                      >
                        {referralOn ? "ON" : "OFF"}
                      </span>
                    </button>
                  </div>

                  {referralOn && (
                    <div className="mt-3">
                      {!selectedDriver && (
                        <div className="relative">
                          <span className="absolute left-0 top-0 h-11 px-3 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-sm text-gray-500 flex items-center">
                            +91
                          </span>
                          <input
                            value={referralInput}
                            onChange={(e) =>
                              setReferralInput(
                                e.target.value.replace(/\D/g, "").slice(0, 10),
                              )
                            }
                            placeholder="Full number or last 8 digits"
                            inputMode="numeric"
                            className="w-full h-11 pl-14 pr-10 rounded-xl border border-gray-300 bg-white text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                          />
                          {driverSearching && (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                          )}
                        </div>
                      )}

                      {driverError && !selectedDriver && (
                        <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {driverError}
                        </p>
                      )}

                      {driverResult && !selectedDriver && (
                        <div className="mt-3 rounded-xl border border-gray-200 bg-white overflow-hidden">
                          <div className="p-3 flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                              {driverResult.profile_photo?.url ? (
                                <img
                                  src={driverResult.profile_photo.url}
                                  alt={driverResult.driver_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-gray-900 truncate">
                                {driverResult.driver_name || "Driver"}
                              </p>
                              <p className="text-xs text-gray-500">
                                Driver ID: {driverCode(driverResult._id)}
                              </p>
                              {cleanText(driverResult.address) && (
                                <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
                                  <MapPin className="w-3 h-3 shrink-0" />{" "}
                                  {cleanText(driverResult.address)}
                                </p>
                              )}
                              {isDriverKycVerified(driverResult) ? (
                                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="w-3 h-3" /> KYC
                                  Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                  <AlertCircle className="w-3 h-3" /> Non-KYC
                                  Verified
                                </span>
                              )}
                            </div>
                          </div>
                          {isDriverKycVerified(driverResult) ? (
                            <button
                              type="button"
                              onClick={addReferralDriver}
                              className="w-full h-10 bg-gray-900 text-white text-sm font-semibold"
                            >
                              Add
                            </button>
                          ) : (
                            <div className="w-full py-2.5 bg-amber-50 text-amber-700 text-[11px] text-center font-medium border-t border-amber-100">
                              This driver hasn't completed KYC yet — can't be
                              added as referral.
                            </div>
                          )}
                        </div>
                      )}

                      {selectedDriver && (
                        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-white overflow-hidden shrink-0 flex items-center justify-center">
                            {selectedDriver.profile_photo?.url ? (
                              <img
                                src={selectedDriver.profile_photo.url}
                                alt={selectedDriver.driver_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-gray-900 truncate">
                              {selectedDriver.driver_name || "Driver"}
                            </p>
                            <p className="text-xs text-gray-500">
                              +91 {selectedDriver.driver_contact_number} ·{" "}
                              {driverCode(selectedDriver._id)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={removeReferralDriver}
                            className="w-7 h-7 rounded-full bg-white border flex items-center justify-center shrink-0"
                          >
                            <X className="w-3.5 h-3.5 text-gray-500" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div
                  className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur border-t border-gray-100 p-4
                             sm:static sm:z-auto sm:bg-transparent sm:backdrop-blur-0 sm:border-0 sm:p-0"
                  style={{
                    paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)",
                  }}
                >
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full max-w-3xl mx-auto sm:mx-0 bg-[#E52710] text-white h-14 rounded-2xl font-extrabold text-[13px] hover:opacity-90 active:scale-[.98] transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-[#E52710]/20"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
                      </>
                    ) : (
                      <>
                        Register Now <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ── MOBILE OTP ── */}
            {step === "otp" && (
              <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 max-w-xs mx-auto text-center fsu">
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
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying…
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

            {/* ── AADHAAR NUMBER INPUT (before payment now) ── */}
            {step === "kyc-aadhaar" && (
              <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 max-w-xs mx-auto text-center fsu">
                <div className="w-20 h-20 bg-[#E52710]/10 rounded-3xl flex items-center justify-center">
                  <IdCard className="w-9 h-9 text-[#E52710]" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">
                    Enter Aadhaar Number
                  </h2>
                  <p className="text-gray-400 text-[13px] mt-1.5">
                    {feePaid
                      ? "Required for identity verification. OTP will be sent right away."
                      : "Required for identity verification. OTP will be sent after the KYC fee is paid."}
                  </p>
                </div>
                <input
                  value={aadharNumber}
                  onChange={(e) =>
                    setAadharNumber(
                      e.target.value.replace(/\D/g, "").slice(0, 12),
                    )
                  }
                  placeholder="XXXX XXXX XXXX"
                  inputMode="numeric"
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 text-center text-lg font-bold tracking-widest focus:outline-none focus:border-[#E52710] transition bg-white"
                />
                <button
                  onClick={proceedToPayment}
                  disabled={sendingAadhaarOtp}
                  className="w-full bg-[#E52710] text-white h-14 rounded-2xl font-extrabold text-[13px] hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-[#E52710]/20"
                >
                  {sendingAadhaarOtp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Sending OTP…
                    </>
                  ) : (
                    <>
                      Continue <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ── KYC PAYMENT (skipped automatically if fee already paid) ── */}
            {step === "kyc-payment" && (
              <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 max-w-xs mx-auto text-center fsu">
                <div className="w-20 h-20 bg-[#E52710]/10 rounded-3xl flex items-center justify-center">
                  <CreditCard className="w-9 h-9 text-[#E52710]" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">
                    Complete KYC Fee
                  </h2>
                  <p className="text-gray-400 text-[13px] mt-1.5">
                    Pay a one-time KYC fee to send the Aadhaar OTP
                  </p>
                </div>
                <div className="w-full bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-gray-100">
                  <span className="text-[13px] text-gray-500 font-semibold">
                    KYC Verification Fee
                  </span>
                  <span className="text-lg font-extrabold text-gray-900">
                    {fetchingFee ? (
                      <Loader2 className="w-4 h-4 animate-spin inline-block" />
                    ) : kycFee !== null ? (
                      `₹${kycFee}`
                    ) : (
                      "—"
                    )}
                  </span>
                </div>
                <button
                  onClick={startKycPayment}
                  disabled={
                    payingKyc ||
                    fetchingFee ||
                    kycFee === null ||
                    sendingAadhaarOtp
                  }
                  className="w-full bg-[#E52710] text-white h-14 rounded-2xl font-extrabold text-[13px] hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-[#E52710]/20"
                >
                  {payingKyc ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Opening
                      Razorpay…
                    </>
                  ) : sendingAadhaarOtp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Sending OTP…
                    </>
                  ) : (
                    <>
                      Pay {kycFee !== null ? `₹${kycFee}` : ""} & Continue{" "}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ── AADHAAR OTP VERIFY ── */}
            {step === "kyc-otp" && (
              <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 max-w-xs mx-auto text-center fsu">
                <div className="w-20 h-20 bg-[#E52710]/10 rounded-3xl flex items-center justify-center ping">
                  <Shield className="w-9 h-9 text-[#E52710]" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">
                    Verify Aadhaar OTP
                  </h2>
                  <p className="text-gray-400 text-[13px] mt-1.5">
                    Enter the 6-digit code sent to your Aadhaar-linked mobile
                  </p>
                </div>
                <input
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 text-center text-2xl font-extrabold tracking-[.4em] focus:outline-none focus:border-[#E52710] transition bg-white"
                  placeholder="• • • • • •"
                  maxLength={6}
                  inputMode="numeric"
                  value={aadhaarOtp}
                  onChange={(e) => setAadhaarOtp(e.target.value)}
                />
                <button
                  onClick={verifyAadhaarOtpHandler}
                  disabled={verifyingAadhaarOtp}
                  className="w-full bg-[#E52710] text-white h-14 rounded-2xl font-extrabold text-[13px] hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-[#E52710]/20"
                >
                  {verifyingAadhaarOtp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying…
                    </>
                  ) : (
                    <>
                      Verify & Activate <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-gray-400">
                  Didn't get it?{" "}
                  <button
                    type="button"
                    onClick={resendAadhaarOtp}
                    disabled={sendingAadhaarOtp || aadhaarResendTimer > 0}
                    className="text-[#E52710] font-bold hover:underline disabled:text-gray-400 disabled:no-underline"
                  >
                    {aadhaarResendTimer > 0
                      ? `Resend in ${aadhaarResendTimer}s`
                      : "Resend OTP"}
                  </button>
                </p>
              </div>
            )}

            {/* ── SUCCESS — shows Aadhaar-verified profile ── */}
            {step === "success" && (
              <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 max-w-sm mx-auto text-center py-8 fsu">
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

                {profileLoading ? (
                  <Loader2 className="w-6 h-6 text-[#E52710] animate-spin" />
                ) : profileData ? (
                  <div className="w-full rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white text-left">
                    <div className="pt-5 pb-3 flex flex-col items-center border-b border-gray-100">
                      {profileData.profileImage ? (
                        <img
                          src={profileData.profileImage}
                          alt=""
                          className="w-20 h-20 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="divide-y divide-gray-100">
                      <div className="flex justify-between px-5 py-2.5">
                        <span className="text-[12px] text-gray-500">Name</span>
                        <span className="text-[13px] font-semibold">
                          {profileData.name}
                        </span>
                      </div>
                      <div className="flex justify-between px-5 py-2.5">
                        <span className="text-[12px] text-gray-500">
                          Mobile
                        </span>
                        <span className="text-[13px] font-semibold">
                          +91 {profileData.phone}
                        </span>
                      </div>
                      <div className="flex justify-between px-5 py-2.5">
                        <span className="text-[12px] text-gray-500">
                          Aadhaar No.
                        </span>
                        <span className="text-[13px] font-semibold">
                          XXXX XXXX{" "}
                          {String(profileData.aadharNumber || "").slice(-4)}
                        </span>
                      </div>
                      <div className="flex justify-between px-5 py-2.5">
                        <span className="text-[12px] text-gray-500">
                          Category
                        </span>
                        <span className="text-[13px] font-semibold">
                          {categoryLabelMap[profileData.category] ||
                            profileData.category}
                        </span>
                      </div>
                      <div className="flex justify-between px-5 py-2.5">
                        <span className="text-[12px] text-gray-500">
                          Status
                        </span>
                        <span className="text-[13px] font-bold text-amber-600">
                          Under Review
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="w-full bg-[#E52710]/5 border border-[#E52710]/15 rounded-2xl p-4">
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    <span className="font-bold text-[#E52710]">Next:</span>{" "}
                    Watch your WhatsApp for the Taxi Safar team message with
                    your verification status and deposit link.
                  </p>
                </div>

                <button
                  onClick={() => {
                    sessionStorage.removeItem(KYC_STORE_KEY);
                    window.location.href = window.location.pathname;
                  }}
                  className="text-[13px] text-[#E52710] font-bold hover:underline"
                >
                  + Register another provider
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
