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
};

type FieldErrors = Record<string, string>;
type Step =
  | "form"
  | "otp"
  | "kyc-payment"
  | "kyc-aadhaar"
  | "kyc-otp"
  | "success";

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

const STEPS = [
  { id: "form", label: "Fill Details", num: 1 },
  { id: "otp", label: "Verify OTP", num: 2 },
  { id: "kyc-payment", label: "KYC Fee", num: 3 },
  { id: "kyc-aadhaar", label: "Aadhaar KYC", num: 4 },
  { id: "kyc-otp", label: "Verify Aadhaar", num: 5 },
  { id: "success", label: "Under Review", num: 6 },
] as const;

const KYC_API_BASE = "https://partners.taxisafar.com/api/auth";
const FEES_API_BASE = "https://partners.taxisafar.com/api/v1/fees/key";
const USER_API_BASE = "https://partners.taxisafar.com/api/auth/users";
const CATEGORY_TO_FEE_KEY: Record<string, string> = {
  tour_guide: "kyc_fee_for_guide",
  rto_service: "kyc_fee_for_rto",
  car_accessory: "kyc_fee_for_car_access",
};
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
  // ── add near top, after INIT ──
  const [kycFee, setKycFee] = useState<number | null>(null);
  const [fetchingFee, setFetchingFee] = useState(false);
  const KYC_STORE_KEY = "taxisafar_kyc_state";
  const [userId, setUserId] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [kycOrder, setKycOrder] = useState<{
    orderId: string;
    amount: number;
    currency: string;
    key: string;
  } | null>(null);
  const [kycRequestId, setKycRequestId] = useState("");
  const [aadhaarOtp, setAadhaarOtp] = useState("");
  const [payingKyc, setPayingKyc] = useState(false);
  const [sendingAadhaarOtp, setSendingAadhaarOtp] = useState(false);
  const [verifyingAadhaarOtp, setVerifyingAadhaarOtp] = useState(false);
  const [aadhaarResendTimer, setAadhaarResendTimer] = useState(0);
  const profileRef = useRef<HTMLInputElement>(null);
  const aadharFrontRef = useRef<HTMLInputElement>(null);
  const aadharBackRef = useRef<HTMLInputElement>(null);
  const panRef = useRef<HTMLInputElement>(null);
// ── update restore-from-URL/session effect: fetch user details if userId present but session data missing ──
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
      if (saved.kycRequestId) setKycRequestId(saved.kycRequestId);
    }
  } catch (_) {}

  // URL uid wins if sessionStorage was cleared/missing
  if (uid && !restoredUserId) {
    setUserId(uid);
    restoredUserId = uid;
  }

  if (s === "otp" && phone) {
    setForm((p) => ({ ...p, phone }));
    setStep("otp");
  } else if (s === "kyc-payment") setStep("kyc-payment");
  else if (s === "kyc-aadhaar") setStep("kyc-aadhaar");
  else if (s === "kyc-otp") setStep("kyc-otp");
  else if (s === "success") setStep("success");

  // session data (category/phone) may be gone even though userId survived via URL —
  // hydrate everything crucial from the backend in that case
  const needsHydration = restoredUserId && (!category || !form.phone);
  if (needsHydration) {
    fetchUserDetails(restoredUserId);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


// ── new: fetch full user details and re-hydrate form/category/step ──
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

    // resume at the right step based on backend status
    if (user.kycStatus === "kyc-success") {
      pushParams("success");
      setStep("success");
    } else if (user.isKycFeeDone) {
      pushParams("kyc-aadhaar");
      setStep("kyc-aadhaar");
    } else if (user.isMobileVerified) {
      pushParams("kyc-payment");
      setStep("kyc-payment");
    }
    // else: leave step as-is (likely otp / form) — nothing else to restore
  } catch (err) {
    console.error("fetchUserDetails err:", err);
  }
};
  // ── new: persist crucial fields whenever they change ──
  useEffect(() => {
    if (!userId && !form.phone && !aadharNumber && !kycRequestId) return;
    try {
      sessionStorage.setItem(
        KYC_STORE_KEY,
        JSON.stringify({
          userId,
          phone: form.phone,
          aadharNumber,
          kycRequestId,
        }),
      );
    } catch (_) {}
  }, [userId, form.phone, aadharNumber, kycRequestId]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

// ── also call this as a safety-net inside the kyc-payment fee-fetch effect,
//    in case category is still empty when we land here directly via uid ──
useEffect(() => {
  if (step !== "kyc-payment") return;

  if (!category && userId) {
    fetchUserDetails(userId);
    return; // will re-run this effect once category is set
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
}, [step, category, userId]);

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
        url: "https://partners.taxisafar.com/api/auth/register",
        data: buildFD(),
        headers: { Accept: "application/json" },
        withCredentials: false,
        timeout: 15000,
        validateStatus: () => true,
      });
      if (res.data?.success) {
        if (res.data?.data?.userId) setUserId(res.data.data.userId);
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

  // ── update verifyOTP: capture userId if present, go to kyc-payment instead of success ──
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
        pushParams("kyc-payment");
        setStep("kyc-payment");
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

  // ── new handlers: KYC payment + aadhaar otp flow ──
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

      // Backend response:
      //
      // {
      //   success: true,
      //   order: {
      //     order: {
      //       id,
      //       amount,
      //       currency
      //     },
      //     fee: {...}
      //   },
      //   data: {
      //     key
      //   }
      // }

      const razorpayOrder = responseData?.order?.order;

      const order = {
        orderId: razorpayOrder?.id,
        amount: razorpayOrder?.amount,
        currency: razorpayOrder?.currency,
        key: responseData?.data?.key,
      };

      // Validate Razorpay order details
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

      setKycOrder(order);

      // Make sure Razorpay SDK is loaded
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

        theme: {
          color: "#E52710",
        },

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

            Swal.fire({
              icon: "success",
              title: "Payment successful",
              text: "Now enter your Aadhaar number",
              timer: 1500,
              showConfirmButton: false,
            });

            pushParams("kyc-aadhaar");
            setStep("kyc-aadhaar");
          } catch (err: any) {
            Swal.fire({
              icon: "error",
              title: "Payment verification failed",
              text:
                err?.response?.data?.message ||
                "We couldn't verify your payment. Please contact support.",
              confirmButtonColor: "#E52710",
            });
          } finally {
            setPayingKyc(false);
          }
        },

        modal: {
          ondismiss: () => {
            setPayingKyc(false);
          },
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
      const res = await axios.post(
        `${KYC_API_BASE}/${userId}/kyc/aadhaar/send-otp`,
        { aadharNumber },
      );
      setKycRequestId(res.data.data.request_id);
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

  // ── also clear on successful KYC verify (so refresh-after-success doesn't restore stale data) ──
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
      sessionStorage.removeItem(KYC_STORE_KEY); // ← clear crucial data, flow done
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
        .scroll-pane::-webkit-scrollbar { width: 5px; }
        .scroll-pane::-webkit-scrollbar-thumb { background: #e9e9e9; border-radius: 4px; }
        select option { color: #111827; }
      `}</style>

      {/* Full viewport, edge-to-edge layout — no floating card, no max-w cap */}
      <div className="min-h-screen w-full bg-gray-50 md:flex">
        {/* ── Left brand rail ──────────────────────────────────────────── */}
        <aside className="md:w-[300px] lg:w-[340px] md:flex-shrink-0 md:h-screen md:sticky md:top-0 bg-[#E52710] relative overflow-hidden">
          <div className="absolute -top-14 -right-14 w-44 h-44 bg-white/5 rounded-full" />
          <div className="absolute -bottom-16 -left-8 w-56 h-56 bg-black/10 rounded-full hidden md:block" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px,white 1px,transparent 0)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* Mobile: compact header only */}
          <div className="relative z-10 md:hidden px-4 pt-6 pb-5">
            <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-[11px] font-bold px-3 py-1.5 rounded-full mb-3">
              <Star className="w-3 h-3 fill-white" /> Taxi Safar Partner Network
            </span>
            <h1 className="text-xl font-extrabold text-white leading-snug">
              Join as a Service Provider
            </h1>
            <p className="text-white/70 text-[12px] mt-1">
              Register once · Get customers forever
            </p>

            <div className="flex items-center mt-5">
              {STEPS.map((s, i) => (
                <div
                  key={s.id}
                  className="flex items-center flex-1 last:flex-initial"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-all duration-300 ${
                      i < stepIdx
                        ? "bg-white text-[#E52710]"
                        : i === stepIdx
                          ? "bg-white text-[#E52710] ping"
                          : "bg-white/20 text-white/70"
                    }`}
                  >
                    {i < stepIdx ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 transition-all duration-500 ${i < stepIdx ? "bg-white" : "bg-white/25"}`}
                    />
                  )}
                </div>
              ))}
            </div>
            <p className="text-white text-[11px] font-semibold mt-2">
              {STEPS[stepIdx].label}
            </p>
          </div>

          {/* Desktop: full rail */}
          <div className="relative z-10 hidden md:flex md:flex-col md:justify-between h-full p-7">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-[11px] font-bold px-3 py-1.5 rounded-full">
                <Star className="w-3 h-3 fill-white" /> Taxi Safar Partner
                Network
              </span>
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

            <div className="bg-white/10 rounded-2xl p-4 mt-6">
              <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.14em] mb-2">
                Process
              </p>
              {STEPS.map((s, i) => (
                <div
                  key={s.id}
                  className={`flex items-center gap-2 py-1.5 text-[11px] ${
                    i === stepIdx
                      ? "text-white font-bold"
                      : i < stepIdx
                        ? "text-white/35 line-through"
                        : "text-white/30"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center flex-shrink-0 ${
                      i < stepIdx
                        ? "bg-white/25"
                        : i === stepIdx
                          ? "bg-white text-[#E52710] font-extrabold"
                          : "bg-white/10"
                    }`}
                  >
                    {i < stepIdx ? "✓" : s.num}
                  </span>
                  {s.label}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Right content pane ───────────────────────────────────────── */}
        <main className="flex-1 md:h-screen md:overflow-y-auto scroll-pane">
          <div className="w-full max-w-3xl mx-auto px-4 sm:px-8 lg:px-10 py-8 sm:py-12">
            {/* ── FORM ── */}
            {step === "form" && (
              <form
                onSubmit={submitForm}
                className="space-y-8 fsu pb-28 sm:pb-0"
              >
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
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
                    <div className="hidden sm:block" />

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
                      onClear={() => setForm((p) => ({ ...p, panCard: null }))}
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

            {/* ── OTP ── */}
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
            {/* ── KYC PAYMENT ── add right after the "otp" step block, before "success" block ── */}
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
                    Pay a one-time KYC fee to continue
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
                  disabled={payingKyc || fetchingFee || kycFee === null}
                  className="w-full bg-[#E52710] text-white h-14 rounded-2xl font-extrabold text-[13px] hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-[#E52710]/20"
                >
                  {payingKyc ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Opening
                      Razorpay…
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
            {/* ── AADHAAR NUMBER INPUT ── */}
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
                    We'll send an OTP to your Aadhaar-linked mobile
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
                  onClick={sendAadhaarOtpHandler}
                  disabled={sendingAadhaarOtp}
                  className="w-full bg-[#E52710] text-white h-14 rounded-2xl font-extrabold text-[13px] hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-[#E52710]/20"
                >
                  {sendingAadhaarOtp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Sending OTP…
                    </>
                  ) : (
                    <>
                      Send Aadhaar OTP <ArrowRight className="w-4 h-4" />
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
            {/* ── SUCCESS ── */}
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
                      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${ic}`} />
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
                    setUserId("");
                    setAadharNumber("");
                    setKycRequestId("");
                    setAadhaarOtp("");
                    sessionStorage.removeItem(KYC_STORE_KEY);
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
        </main>
      </div>
    </>
  );
}
