"use client";

import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  MapPin, Phone, User, Building2, Compass, CheckCircle2, Map, Upload, X,
  CreditCard, AlertCircle, Loader2, IdCard, Check, FileImage, Users, Search,
  BadgeCheck, ShieldCheck, Calendar,
} from "lucide-react";
import Swal from "sweetalert2";
import INDIAN_STATES_CITIES, { STATE_LIST } from "@/data/indianStatesCities";

const API_BASE = "https://partners.taxisafar.com/api/auth/mechanic";
const FEE_API = "https://partners.taxisafar.com/api/v1/fees/key/kyc_fee_for_car_mechanic";
const DRIVER_SEARCH_API = "https://authapi.taxisafar.com/api/v1/search-drivers";
const DRAFT_KEY = "mechanic_register_draft";
const MECH_ID_KEY = "mechanic_register_id";

const LOGO_SRC = "/taxisafar-logo.jpg";
const TERMS_URL = "https://taxisafar.com/terms-of-use";
const PRIVACY_URL = "https://taxisafar.com/privacy-policy";

const MAX_GALLERY = 6;

type Driver = {
  _id: string;
  driver_name?: string;
  driver_contact_number?: string;
  address?: string;
  profile_photo?: { url?: string };
  aadhar_verified?: boolean;
  kyc_status?: string;
};

type FormState = {
  name: string;
  phone: string;
  garageName: string;
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
  referralPhone: string;
  agreedToTerms: boolean;
};

const initialForm: FormState = {
  name: "", phone: "", garageName: "", addressLine1: "",
  city: "", state: "", pincode: "", referralPhone: "", agreedToTerms: false,
};

const STEPS = ["Your Details", "Verify OTP", "Aadhaar KYC"] as const;

const cleanText = (v?: string) => (v || "").replace(/^"+|"+$/g, "").trim();
const driverCode = (id?: string) => (id ? `TS${id.slice(-5).toUpperCase()}` : "—");

export default function CarMechanicRegister() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const stepFromUrl = Math.min(Math.max(parseInt(searchParams.get("step") || "0", 10) || 0, 0), STEPS.length - 1);
  const [step, setStepState] = useState(stepFromUrl);

  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  // ── referral driver ──
  const [referralOn, setReferralOn] = useState(false);
  const [referralInput, setReferralInput] = useState("");
  const [driverSearching, setDriverSearching] = useState(false);
  const [driverResult, setDriverResult] = useState<Driver | null>(null);
  const [driverError, setDriverError] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  // ── garage photos ──
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [mechanicId, setMechanicId] = useState<string>("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendTimer, setResendTimer] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  // kyc: aadhaar-input -> payment -> aadhaar-otp -> done
  const [kycStage, setKycStage] = useState<"aadhaar-input" | "payment" | "aadhaar-otp" | "done">("aadhaar-input");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [aadhaarOtp, setAadhaarOtp] = useState(["", "", "", "", "", ""]);
  const aadhaarOtpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [payingKyc, setPayingKyc] = useState(false);
  const [sendingAadhaarOtp, setSendingAadhaarOtp] = useState(false);
  const [verifyingAadhaarOtp, setVerifyingAadhaarOtp] = useState(false);
  const [aadhaarResendTimer, setAadhaarResendTimer] = useState(0);

  const [kycFee, setKycFee] = useState<number>(99);
  const [kycFeeLoading, setKycFeeLoading] = useState(true);

  // ── final profile ──
  const [userData, setUserData] = useState<any>(null);
  const [userDataLoading, setUserDataLoading] = useState(false);

  // ── fee ──
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(FEE_API);
        setKycFee(res.data?.data?.value ?? 99);
      } catch (err) {
        console.error("fee fetch err:", err);
      } finally {
        setKycFeeLoading(false);
      }
    })();
  }, []);

  // ── razorpay sdk ──
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  // ── restore draft ──
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setForm((f) => ({ ...f, ...saved }));
        if (saved?.referralPhone) {
          setReferralOn(true);
          setReferralInput(saved.referralPhone);
        }
      }
      const savedId = sessionStorage.getItem(MECH_ID_KEY) || searchParams.get("mid") || "";
      if (savedId) setMechanicId(savedId);
    } catch (_) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form)); } catch (_) {}
  }, [form]);

  useEffect(() => {
    if (!mechanicId) return;
    try { sessionStorage.setItem(MECH_ID_KEY, mechanicId); } catch (_) {}
    const params = new URLSearchParams(searchParams.toString());
    params.set("mid", mechanicId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mechanicId]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  useEffect(() => {
    if (aadhaarResendTimer <= 0) return;
    const t = setInterval(() => setAadhaarResendTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [aadhaarResendTimer]);

  // ── auto search driver at exactly 10 digits ──
  useEffect(() => {
    if (!referralOn) return;
    if (referralInput.length !== 10) {
      setDriverResult(null);
      setDriverError("");
      return;
    }
    if (selectedDriver?.driver_contact_number === referralInput) return;
    const t = setTimeout(() => { searchDriver(referralInput); }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referralInput, referralOn]);

  const searchDriver = async (phoneNumber: string) => {
    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      setDriverError("Enter valid 10-digit driver number");
      setDriverResult(null);
      return;
    }
    setDriverSearching(true);
    setDriverError("");
    setDriverResult(null);
    try {
      const res = await axios.get(DRIVER_SEARCH_API, { params: { phoneNumber } });
      const d: Driver | undefined = res.data?.data?.[0];
      if (!d) {
        setDriverError("No KYC-verified driver found with this number");
        return;
      }
      setDriverResult(d);
    } catch (err: any) {
      console.error("driver search err:", err);
      setDriverError(err?.response?.data?.message || "Couldn't search right now. Try again.");
    } finally {
      setDriverSearching(false);
    }
  };

  const addReferralDriver = () => {
    if (!driverResult) return;
    setSelectedDriver(driverResult);
    update("referralPhone", driverResult.driver_contact_number || referralInput);
    setDriverResult(null);
  };

  const removeReferralDriver = () => {
    setSelectedDriver(null);
    setReferralInput("");
    update("referralPhone", "");
  };

  const toggleReferral = () => {
    const next = !referralOn;
    setReferralOn(next);
    if (!next) {
      setSelectedDriver(null);
      setDriverResult(null);
      setDriverError("");
      setReferralInput("");
      update("referralPhone", "");
    }
  };

  const setStep = (s: number) => {
    setStepState(s);
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", String(s));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const update = (key: keyof FormState, value: any) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const cities = form.state ? INDIAN_STATES_CITIES[form.state] || [] : [];

  // ── photo pickers ──
  const onPickGallery = (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files).slice(0, MAX_GALLERY - galleryFiles.length);
    setGalleryFiles((g) => [...g, ...list]);
    setGalleryPreviews((p) => [...p, ...list.map((f) => URL.createObjectURL(f))]);
  };
  const removeGalleryImg = (idx: number) => {
    setGalleryFiles((g) => g.filter((_, i) => i !== idx));
    setGalleryPreviews((p) => p.filter((_, i) => i !== idx));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name required";
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = "Enter valid 10-digit phone";
    if (!form.garageName.trim()) e.garageName = "Workshop name required";
    if (!form.addressLine1.trim()) e.addressLine1 = "Address required";
    if (!form.state) e.state = "Select state";
    if (!form.city) e.city = "Select city";
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Enter valid 6-digit pincode";
    if (!form.agreedToTerms) e.agreedToTerms = "Please accept the terms to continue";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitRegistration = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("phone", form.phone);
      fd.append("garageName", form.garageName);
      fd.append("address", JSON.stringify({
        line1: form.addressLine1,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        location: { type: "Point", coordinates: [0, 0] },
      }));
      if (form.referralPhone) {
        fd.append("referralPhone", form.referralPhone);
        if (selectedDriver?._id) fd.append("referralDriverId", selectedDriver._id);
        if (selectedDriver?.driver_name) fd.append("referralDriverName", selectedDriver.driver_name);
      }
      galleryFiles.forEach((f) => fd.append("galleryImages", f));

      const res = await axios.post(`${API_BASE}/`, fd, { headers: { "Content-Type": "multipart/form-data" } });

      const newId = res.data?.data?._id;
      setMechanicId(newId);
      setStep(1);

      Swal.fire({ icon: "success", title: "OTP sent", text: `OTP sent to ${form.phone}`, timer: 1800, showConfirmButton: false });
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Registration failed", text: err?.response?.data?.message || "Something went wrong" });
    } finally {
      setSubmitting(false);
    }
  };

  // ── phone otp ──
  const onOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };
  const onOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const verifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      Swal.fire({ icon: "warning", title: "Enter full 6-digit OTP" });
      return;
    }
    setVerifying(true);
    try {
      await axios.post(`${API_BASE}/verify-otp`, { phone: form.phone, otp: code });
      Swal.fire({ icon: "success", title: "Phone Verified!", text: "Now complete Aadhaar KYC.", timer: 1600, showConfirmButton: false });
      setStep(2);
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Verification failed", text: err?.response?.data?.message || "Invalid or expired OTP" });
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
      Swal.fire({ icon: "success", title: "OTP resent", timer: 1500, showConfirmButton: false });
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Failed to resend", text: err?.response?.data?.message || "Try again" });
    } finally {
      setResending(false);
    }
  };

  // ── kyc ──
  const confirmAadhaarNumber = () => {
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      Swal.fire({ icon: "warning", title: "Enter valid 12-digit Aadhaar number" });
      return;
    }
    setKycStage("payment");
  };

  const startKycPayment = async () => {
    setPayingKyc(true);
    try {
      const orderRes = await axios.post(`${API_BASE}/${mechanicId}/kyc/create-order`);
      const responseData = orderRes?.data;
      const razorpayOrder = responseData?.order?.order;
      const orderId = razorpayOrder?.id;
      const amount = razorpayOrder?.amount;
      const currency = razorpayOrder?.currency;
      const key = responseData?.data?.key;

      if (!orderId || !amount || !currency || !key) throw new Error("Invalid Razorpay order response");
      if (!(window as any).Razorpay) throw new Error("Razorpay SDK not loaded");

      const rzp = new (window as any).Razorpay({
        key, amount, currency, order_id: orderId,
        name: "TaxiSafar", description: "Mechanic KYC Fee",
        prefill: { name: form.name || "", contact: form.phone || "" },
        theme: { color: "#dc2626" },
        handler: async (response: any) => {
          try {
            await axios.post(`${API_BASE}/${mechanicId}/kyc/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            await sendAadhaarOtpHandler();
          } catch (err: any) {
            Swal.fire({ icon: "error", title: "Payment verification failed", text: err?.response?.data?.message || "Please contact support" });
          } finally {
            setPayingKyc(false);
          }
        },
        modal: { ondismiss: () => setPayingKyc(false) },
      });
      rzp.open();
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Couldn't start payment", text: err?.response?.data?.message || err?.message || "Try again" });
      setPayingKyc(false);
    }
  };

  const sendAadhaarOtpHandler = async () => {
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      Swal.fire({ icon: "warning", title: "Enter valid 12-digit Aadhaar number" });
      setKycStage("aadhaar-input");
      return;
    }
    setSendingAadhaarOtp(true);
    try {
      await axios.post(`${API_BASE}/${mechanicId}/kyc/aadhaar/send-otp`, { aadhaarNumber });
      setKycStage("aadhaar-otp");
      setAadhaarResendTimer(30);
      Swal.fire({ icon: "success", title: "OTP sent", text: "Check your Aadhaar-linked mobile number", timer: 1800, showConfirmButton: false });
    } catch (err: any) {
      console.error("aadhaar otp send err:", err);
      Swal.fire({ icon: "error", title: "Couldn't send OTP", text: err?.response?.data?.message || "Check Aadhaar number and try again" });
    } finally {
      setSendingAadhaarOtp(false);
    }
  };

  const onAadhaarOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...aadhaarOtp];
    next[idx] = val;
    setAadhaarOtp(next);
    if (val && idx < 5) aadhaarOtpRefs.current[idx + 1]?.focus();
  };
  const onAadhaarOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !aadhaarOtp[idx] && idx > 0) aadhaarOtpRefs.current[idx - 1]?.focus();
  };

  const fetchUserData = async (id: string) => {
    if (!id) return;
    setUserDataLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/${id}`);
      setUserData(res.data?.data || null);
    } catch (err) {
      console.error("user fetch err:", err);
    } finally {
      setUserDataLoading(false);
    }
  };

  const verifyAadhaarOtpHandler = async () => {
    const code = aadhaarOtp.join("");
    if (code.length !== 6) {
      Swal.fire({ icon: "warning", title: "Enter full 6-digit OTP" });
      return;
    }
    setVerifyingAadhaarOtp(true);
    try {
      await axios.post(`${API_BASE}/${mechanicId}/kyc/aadhaar/verify-otp`, { otp: code });
      setKycStage("done");
      await fetchUserData(mechanicId);
      setRegistered(true);
      sessionStorage.removeItem(DRAFT_KEY);
      sessionStorage.removeItem(MECH_ID_KEY);
      Swal.fire({ icon: "success", title: "KYC Verified!", text: "Your workshop profile is live.", timer: 1800, showConfirmButton: false });
    } catch (err: any) {
      console.error("aadhaar verify err:", err);
      Swal.fire({ icon: "error", title: "Aadhaar verification failed", text: err?.response?.data?.message || "Invalid or expired OTP" });
    } finally {
      setVerifyingAadhaarOtp(false);
    }
  };

  const resendAadhaarOtp = async () => {
    if (aadhaarResendTimer > 0) return;
    await sendAadhaarOtpHandler();
  };

  const Header = (
    <div className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 py-3 flex flex-col items-center">
        <img src={LOGO_SRC} alt="TaxiSafar" className="h-16 w-auto object-contain" />
      </div>
    </div>
  );

  // ── success + profile ──
  if (registered) {
    const ad = userData?.aadharData?.aadharData || userData?.aadharData || {};
    const vd = ad?.verifiedData || {};
    const adr = userData?.address || {};
    const aadhaarMasked = ad?.aadhaarNumber ? `XXXX XXXX ${String(ad.aadhaarNumber).slice(-4)}` : "";

    return (
      <div className="min-h-screen bg-gray-50 pb-10">
        {Header}
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-9 h-9 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Registration Complete</h2>
            <p className="text-sm text-gray-500 mt-1">Your workshop is listed. Our team will call you to finish the remaining profile details.</p>
          </div>

          {userDataLoading ? (
            <div className="bg-white rounded-2xl border shadow-sm p-10 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : userData ? (
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="p-5 flex items-center gap-4 border-b">
                <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shrink-0 border-2 border-red-50">
                  {userData.profileImage
                    ? <img src={userData.profileImage} alt={userData.name} className="w-full h-full object-cover" />
                    : <User className="w-7 h-7 text-gray-400" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-gray-900 truncate">{userData.name}</h3>
                    {userData.isVerifiedMechanic && <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0" />}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{userData.garageName}</p>
                  <p className="text-xs text-gray-400">+91 {userData.phone}</p>
                </div>
              </div>

              <div className="p-5 space-y-3 text-sm">
                <Row icon={<ShieldCheck className="w-4 h-4" />} label="KYC Status"
                  value={<span className={`font-semibold ${userData.kycStatus === "kyc-success" ? "text-emerald-600" : "text-amber-500"}`}>
                    {userData.kycStatus === "kyc-success" ? "Verified" : userData.kycStatus}
                  </span>} />
                <Row icon={<CreditCard className="w-4 h-4" />} label="KYC Fee"
                  value={<span className="font-semibold text-gray-900">₹{userData.howMuchItsPaid || 0} paid</span>} />
                {aadhaarMasked && <Row icon={<IdCard className="w-4 h-4" />} label="Aadhaar" value={<span className="tracking-wider text-gray-900">{aadhaarMasked}</span>} />}
                {vd.full_name && <Row icon={<User className="w-4 h-4" />} label="Aadhaar Name" value={<span className="text-gray-900">{vd.full_name}</span>} />}
                {vd.dob && <Row icon={<Calendar className="w-4 h-4" />} label="DOB" value={<span className="text-gray-900">{vd.dob}</span>} />}
                {form.referralPhone && <Row icon={<Users className="w-4 h-4" />} label="Referred By" value={<span className="text-gray-900">+91 {form.referralPhone}</span>} />}
              </div>

              <div className="px-5 pb-5">
                <p className="text-xs font-semibold text-gray-700 mb-1">Workshop Address</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {adr.line1}{adr.line1 ? ", " : ""}{adr.city}, {adr.state} — {adr.pincode}
                </p>
                {vd.address && (
                  <>
                    <p className="text-xs font-semibold text-gray-700 mt-3 mb-1">Aadhaar Address</p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {[vd.address.house, vd.address.loc, vd.address.vtc, vd.address.dist, vd.address.state, vd.address.country].filter(Boolean).join(", ")}
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border shadow-sm p-6 text-center text-sm text-gray-500">
              Profile saved. Details will appear in your partner dashboard.
            </div>
          )}

          <button onClick={() => (window.location.href = pathname)} className="w-full h-11 mt-5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {Header}

      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1 flex flex-col items-center relative">
              {i !== 0 && <div className={`absolute top-4 right-1/2 w-full h-0.5 -z-10 ${i <= step ? "bg-red-600" : "bg-gray-200"}`} />}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 ${
                i < step ? "bg-red-600 border-red-600 text-white" : i === step ? "border-red-600 text-red-600 bg-white" : "border-gray-300 text-gray-400 bg-white"
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className="text-[10px] mt-1 text-gray-500 text-center">{label}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-5 sm:p-6">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Your Details</h2>
              <p className="text-sm text-gray-400 mb-4">Takes less than a minute</p>

       
              <Field label="Full Name" icon={<User className="w-4 h-4" />} error={errors.name}>
                <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Rohit Sharma" className={inputCls(errors.name)} />
              </Field>

              <Field label="Phone Number" icon={<Phone className="w-4 h-4" />} error={errors.phone}>
                <input value={form.phone} onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="9876543210" inputMode="numeric" className={inputCls(errors.phone)} />
              </Field>

              <Field label="Workshop / Shop Name" icon={<Building2 className="w-4 h-4" />} error={errors.garageName}>
                <input value={form.garageName} onChange={(e) => update("garageName", e.target.value)} placeholder="Auto Care Garage" className={inputCls(errors.garageName)} />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="State" icon={<Compass className="w-4 h-4" />} error={errors.state}>
                  <select value={form.state} onChange={(e) => { update("state", e.target.value); update("city", ""); }} className={inputCls(errors.state)}>
                    <option value="">Select State</option>
                    {STATE_LIST.map((s: string) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>

                <Field label="City" icon={<MapPin className="w-4 h-4" />} error={errors.city}>
                  <select value={form.city} onChange={(e) => update("city", e.target.value)} disabled={!form.state} className={inputCls(errors.city) + (!form.state ? " opacity-50 cursor-not-allowed" : "")}>
                    <option value="">Select City</option>
                    {cities.map((c: string) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Address Line" icon={<MapPin className="w-4 h-4" />} error={errors.addressLine1}>
                <input value={form.addressLine1} onChange={(e) => update("addressLine1", e.target.value)} placeholder="Plot No. 45, Industrial Area, Sahibabad" className={inputCls(errors.addressLine1)} />
              </Field>

              <Field label="Pincode" icon={<Map className="w-4 h-4" />} error={errors.pincode}>
                <input value={form.pincode} onChange={(e) => update("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="201010" inputMode="numeric" className={inputCls(errors.pincode)} />
              </Field>

              {/* ── workshop photos ── */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5"><FileImage className="w-4 h-4" /> Workshop Photos</label>
                  <span className="text-[11px] text-gray-400">Optional</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {galleryPreviews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                      <img src={src} className="w-full h-full object-cover" alt={`workshop-${i}`} />
                      <button type="button" onClick={() => removeGalleryImg(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {galleryFiles.length < MAX_GALLERY && (
                    <div onClick={() => galleryInputRef.current?.click()} className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer bg-gray-50">
                      <Upload className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
                <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onPickGallery(e.target.files)} />
                <p className="text-[11px] text-gray-400 mt-1.5">Up to {MAX_GALLERY} photos. Your profile photo is taken from Aadhaar automatically.</p>
              </div>
                         {/* ── referral driver ── */}
              <div className="rounded-2xl border border-gray-200 p-3.5 bg-gray-50/60">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white border flex items-center justify-center shrink-0">
                      <Users className="w-4.5 h-4.5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-red-600 leading-tight">Referral Driver Number</p>
                      <p className="text-[11px] text-gray-400">Optional — if a TaxiSafar driver referred you</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={toggleReferral}
                    className={`relative w-14 h-7 rounded-full shrink-0 transition ${referralOn ? "bg-red-600" : "bg-gray-300"}`}
                  >
                    <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ${referralOn ? "left-7" : "left-0.5"}`} />
                    <span className={`absolute text-[10px] font-bold text-white top-1.5 ${referralOn ? "left-2" : "right-1.5 text-gray-600"}`}>
                      {referralOn ? "ON" : "OFF"}
                    </span>
                  </button>
                </div>

                {referralOn && (
                  <div className="mt-3">
                    {!selectedDriver && (
                      <div className="flex gap-2">
                        <span className="h-11 px-3 rounded-xl border border-gray-300 bg-white text-sm text-gray-500 flex items-center shrink-0">+91</span>
                        <input
                          value={referralInput}
                          onChange={(e) => { setReferralInput(e.target.value.replace(/\D/g, "").slice(0, 10)); }}
                          placeholder="Enter driver number"
                          inputMode="numeric"
                          className="flex-1 h-11 px-3.5 rounded-xl border border-gray-300 bg-white text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        />
                        <button
                          type="button"
                          onClick={() => searchDriver(referralInput)}
                          disabled={driverSearching || referralInput.length !== 10}
                          className="h-11 px-4 rounded-xl bg-red-600 text-white text-sm font-semibold flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                        >
                          {driverSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Search
                        </button>
                      </div>
                    )}

                    {driverError && !selectedDriver && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {driverError}</p>
                    )}

                    {driverResult && !selectedDriver && (
                      <div className="mt-3 rounded-xl border border-gray-200 bg-white overflow-hidden">
                        <div className="p-3 flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                            {driverResult.profile_photo?.url
                              ? <img src={driverResult.profile_photo.url} alt={driverResult.driver_name} className="w-full h-full object-cover" />
                              : <User className="w-5 h-5 text-gray-400" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-gray-900 truncate">{driverResult.driver_name || "Driver"}</p>
                            <p className="text-xs text-gray-500">Driver ID: {driverCode(driverResult._id)}</p>
                            {cleanText(driverResult.address) && (
                              <p className="text-xs text-gray-400 flex items-center gap-1 truncate"><MapPin className="w-3 h-3 shrink-0" /> {cleanText(driverResult.address)}</p>
                            )}
                          </div>
                          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                        <button type="button" onClick={addReferralDriver} className="w-full h-10 bg-gray-900 text-white text-sm font-semibold">Add</button>
                      </div>
                    )}

                    {selectedDriver && (
                      <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-white overflow-hidden shrink-0 flex items-center justify-center">
                          {selectedDriver.profile_photo?.url
                            ? <img src={selectedDriver.profile_photo.url} alt={selectedDriver.driver_name} className="w-full h-full object-cover" />
                            : <User className="w-5 h-5 text-gray-400" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-900 truncate">{selectedDriver.driver_name || "Driver"}</p>
                          <p className="text-xs text-gray-500">+91 {selectedDriver.driver_contact_number} · {driverCode(selectedDriver._id)}</p>
                        </div>
                        <button type="button" onClick={removeReferralDriver} className="w-7 h-7 rounded-full bg-white border flex items-center justify-center shrink-0">
                          <X className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <label className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
                <input type="checkbox" checked={form.agreedToTerms} onChange={(e) => update("agreedToTerms", e.target.checked)} className="mt-0.5" />
                <span>
                  I confirm the details are accurate and agree to TaxiSafar's{" "}
                  <a href={TERMS_URL} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-red-600 font-medium underline underline-offset-2">Terms &amp; Conditions</a>
                  {" "}and{" "}
                  <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-red-600 font-medium underline underline-offset-2">Privacy Policy</a>.
                </span>
              </label>
              {errors.agreedToTerms && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.agreedToTerms}</p>}

              <button onClick={submitRegistration} disabled={submitting} className="w-full h-12 rounded-xl bg-red-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} {submitting ? "Submitting..." : "Submit & Get OTP"}
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto"><Phone className="w-7 h-7 text-red-600" /></div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Verify your phone</h2>
                <p className="text-sm text-gray-400 mt-1">Enter the 6-digit code sent to <span className="font-medium text-gray-600">{form.phone}</span></p>
              </div>
              <div className="flex justify-center gap-2">
                {otp.map((d, i) => (
                  <input key={i} ref={(el) => (otpRefs.current[i] = el)} value={d} onChange={(e) => onOtpChange(i, e.target.value)} onKeyDown={(e) => onOtpKeyDown(i, e)} maxLength={1} inputMode="numeric" className="w-11 h-12 text-center text-lg font-semibold rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none" />
                ))}
              </div>
              <button onClick={verifyOtp} disabled={verifying} className="w-full h-12 rounded-xl bg-red-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} {verifying ? "Verifying..." : "Verify & Continue"}
              </button>
              <button onClick={resendOtp} disabled={resending || resendTimer > 0} className="text-sm text-red-600 font-medium disabled:text-gray-400">
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : resending ? "Resending..." : "Resend OTP"}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto"><IdCard className="w-7 h-7 text-red-600" /></div>

              {kycStage === "aadhaar-input" && (
                <>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Enter Aadhaar Number</h2>
                    <p className="text-sm text-gray-400 mt-1">Your photo, name and address are pulled from Aadhaar automatically</p>
                  </div>
                  <input value={aadhaarNumber} onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, "").slice(0, 12))} placeholder="XXXX XXXX XXXX" inputMode="numeric" className={inputCls() + " text-center tracking-widest"} />
                  <button onClick={confirmAadhaarNumber} className="w-full h-12 rounded-xl bg-red-600 text-white font-semibold flex items-center justify-center gap-2">
                    <IdCard className="w-4 h-4" /> Continue
                  </button>
                </>
              )}

              {kycStage === "payment" && (
                <>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Pay KYC Fee</h2>
                    <p className="text-sm text-gray-400 mt-1">One-time fee. OTP is sent to your Aadhaar-linked mobile right after payment.</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Aadhaar</span>
                      <span className="text-sm font-medium text-gray-900 tracking-wider">XXXX XXXX {aadhaarNumber.slice(-4)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">KYC Verification Fee</span>
                      <span className="text-lg font-bold text-gray-900">{kycFeeLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : `₹${kycFee}`}</span>
                    </div>
                  </div>
                  <button onClick={startKycPayment} disabled={payingKyc || kycFeeLoading} className="w-full h-12 rounded-xl bg-red-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                    {payingKyc ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                    {payingKyc ? "Processing..." : `Pay ₹${kycFee} & Send OTP`}
                  </button>
                  <button onClick={() => setKycStage("aadhaar-input")} disabled={payingKyc} className="text-sm text-gray-500 font-medium disabled:text-gray-300">Change Aadhaar number</button>
                </>
              )}

              {kycStage === "aadhaar-otp" && (
                <>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Verify Aadhaar OTP</h2>
                    <p className="text-sm text-gray-400 mt-1">Enter the 6-digit code sent to your Aadhaar-linked mobile</p>
                  </div>
                  <div className="flex justify-center gap-2">
                    {aadhaarOtp.map((d, i) => (
                      <input key={i} ref={(el) => (aadhaarOtpRefs.current[i] = el)} value={d} onChange={(e) => onAadhaarOtpChange(i, e.target.value)} onKeyDown={(e) => onAadhaarOtpKeyDown(i, e)} maxLength={1} inputMode="numeric" className="w-11 h-12 text-center text-lg font-semibold rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none" />
                    ))}
                  </div>
                  <button onClick={verifyAadhaarOtpHandler} disabled={verifyingAadhaarOtp} className="w-full h-12 rounded-xl bg-red-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                    {verifyingAadhaarOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} {verifyingAadhaarOtp ? "Verifying..." : "Verify & Activate Account"}
                  </button>
                  <button onClick={resendAadhaarOtp} disabled={sendingAadhaarOtp || aadhaarResendTimer > 0} className="text-sm text-red-600 font-medium disabled:text-gray-400">
                    {aadhaarResendTimer > 0 ? `Resend OTP in ${aadhaarResendTimer}s` : sendingAadhaarOtp ? "Resending..." : "Resend OTP"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-gray-500 flex items-center gap-1.5">{icon} {label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function Field({ label, icon, error, children }: { label: string; icon?: React.ReactNode; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">{icon}{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</p>}
    </div>
  );
}

function inputCls(error?: string) {
  return `w-full h-11 px-3.5 rounded-xl border text-sm outline-none transition ${error ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"}`;
}