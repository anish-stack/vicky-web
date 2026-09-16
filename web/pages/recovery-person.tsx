"use client";

import axios from "axios";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  MapPin,
  Phone,
  User,
  Building2,
  Check,
  Clock,
  Shield,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  RotateCcw,
  AlertCircle,
  Loader2,
  IdCard,
  X,
  Image as ImageIcon,
  Users,
  Search,
} from "lucide-react";
import Swal from "sweetalert2";
import INDIAN_STATES_CITIES, { STATE_LIST } from "@/data/indianStatesCities";

const API_BASE = "https://partners.taxisafar.com/api/auth";
const USER_API = "https://partners.taxisafar.com/api/auth/recovery-vehicle";
const DRIVER_SEARCH_API = "https://authapi.taxisafar.com/api/v1/search-drivers";
const FEE_API =
  "https://partners.taxisafar.com/api/v1/fees/key/kyc_fee_for_recovery_vehicle";
const DRAFT_KEY = "recovery_register_draft";
const PROVIDER_ID_KEY = "recovery_provider_id";
const OTP_LENGTH = 6;
const AADHAAR_OTP_LENGTH = 6;
const RESEND_COOLDOWN_MS = 60 * 1000;
const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
const LOGO_SRC = "/logo-partner.png";
const TERMS_URL = "https://taxisafar.com/terms-of-use";
const PRIVACY_URL = "https://taxisafar.com/privacy-policy";
const MIN_REFERRAL_DIGITS = 8;


type Address = { line1: string; city: string; state: string; pincode: string };
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
  garageName: string;
  phone: string;
  experienceYears: string;
  address: Address;
  agreedToTerms: boolean;
  referralPhone: string;
  referralDriverId: string;
  referralDriverName: string;
};

type KycStage = "aadhaar-input" | "payment" | "aadhaar-otp";

type Draft = {
  step: 1 | 2 | 3 | 4;
  formData: FormState;
  resendAvailableAt: number | null;
  providerId?: string;
  kycStage?: KycStage;
  aadhaarNumber?: string;
};



const isDriverKycDone = (d?: Driver | null) =>
  !!d && (d.kyc_status === "kyc-success" || d.aadhar_verified === true);


const emptyForm: FormState = {
  name: "",
  garageName: "",
  phone: "",
  experienceYears: "",
  address: { line1: "", city: "", state: "", pincode: "" },
  agreedToTerms: false,
  referralPhone: "",
  referralDriverId: "",
  referralDriverName: "",
};

const loadDraft = (): Draft | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      sessionStorage.getItem(DRAFT_KEY) || localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.formData) return null;
    return parsed as Draft;
  } catch {
    return null;
  }
};

const maskAadhaar = (num?: string) => {
  if (!num || num.length < 4) return "—";
  const last4 = num.slice(-4);
  return `XXXX XXXX ${last4}`;
};

const formatDob = (dob?: string) => {
  if (!dob) return "—";
  const d = new Date(dob);
  if (isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
};

const statusLabel = (profileStatus?: string) => {
  if (profileStatus === "active") return "Active";
  if (profileStatus === "rejected") return "Rejected";
  return "Under Review";
};

const saveDraft = (draft: Draft) => {
  if (typeof window === "undefined") return;
  const s = JSON.stringify(draft);
  sessionStorage.setItem(DRAFT_KEY, s);
  localStorage.setItem(DRAFT_KEY, s);
  if (draft.providerId)
    sessionStorage.setItem(PROVIDER_ID_KEY, draft.providerId);
};

const clearDraft = () => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(DRAFT_KEY);
  localStorage.removeItem(DRAFT_KEY);
  sessionStorage.removeItem(PROVIDER_ID_KEY);
};

const loadRazorpayScript = () =>
  new Promise<boolean>((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as any).Razorpay) return resolve(true);
    const existing = document.querySelector(
      `script[src="${RAZORPAY_SCRIPT_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const phoneRegex = /^[6-9]\d{9}$/;
const pincodeRegex = /^\d{6}$/;
const cleanText = (t?: string) => (t && t.trim() ? t.trim() : undefined);
const driverCode = (id?: string) => (id ? id.slice(-6).toUpperCase() : "");

const RecoveryVehicleRegister = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [formData, setFormData] = useState<FormState>(emptyForm);

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(
    Array(OTP_LENGTH).fill(""),
  );
  const [otpError, setOtpError] = useState("");
  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(
    null,
  );
  const [resendLeft, setResendLeft] = useState(0);
  const [resending, setResending] = useState(false);
  const [providerName, setProviderName] = useState("");
  const [providerId, setProviderId] = useState<string | undefined>(undefined);
  const [hydrated, setHydrated] = useState(false);

  const [userData, setUserData] = useState<any>(null);
  const [userDataLoading, setUserDataLoading] = useState(false);

  const [kycFee, setKycFee] = useState<number>(99);
  const [kycFeeLoading, setKycFeeLoading] = useState(true);

  const [kycStage, setKycStage] = useState<KycStage>("aadhaar-input");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [savingAadhaar, setSavingAadhaar] = useState(false);
  const [payingKyc, setPayingKyc] = useState(false);
  const [sendingAadhaarOtp, setSendingAadhaarOtp] = useState(false);
  const [aadhaarOtpDigits, setAadhaarOtpDigits] = useState<string[]>(
    Array(AADHAAR_OTP_LENGTH).fill(""),
  );
  const [aadhaarOtpError, setAadhaarOtpError] = useState("");
  const [verifyingAadhaarOtp, setVerifyingAadhaarOtp] = useState(false);
  const [aadhaarResendAt, setAadhaarResendAt] = useState<number | null>(null);
  const [aadhaarResendLeft, setAadhaarResendLeft] = useState(0);

  // ── referral driver ──
  const [referralOn, setReferralOn] = useState(false);
  const [referralInput, setReferralInput] = useState("");
  const [driverSearching, setDriverSearching] = useState(false);
  const [driverResult, setDriverResult] = useState<Driver | null>(null);
  const [driverError, setDriverError] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const aadhaarOtpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const cities = formData.address.state
    ? INDIAN_STATES_CITIES[formData.address.state] || []
    : [];

  const fetchUserData = async (id: string) => {
    if (!id) return;
    setUserDataLoading(true);
    try {
      const res = await axios.get(`${USER_API}/${id}`);
      setUserData(res.data?.data || null);
    } catch (err) {
      console.error("user fetch err:", err);
    } finally {
      setUserDataLoading(false);
    }
  };
  const changeAadhaarAfterPayment = () => {
    setAadhaarOtpDigits(Array(AADHAAR_OTP_LENGTH).fill(""));
    setAadhaarOtpError("");
    setAadhaarResendAt(null);
    setKycStage("aadhaar-input");
    saveDraft({
      step: 3,
      formData,
      resendAvailableAt,
      providerId,
      kycStage: "aadhaar-input",
      aadhaarNumber,
    });
  };

  const restartRegistration = () => {
    Swal.fire({
      icon: "warning",
      title: "Restart Registration?",
      text: "This will clear your current progress and start over.",
      showCancelButton: true,
      confirmButtonText: "Yes, Restart",
      confirmButtonColor: "#dc2626",
    }).then((res) => {
      if (!res.isConfirmed) return;
      clearDraft();
      window.location.href = pathname;
    });
  };

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

  const syncStepToUrl = useCallback(
    (n: number, extraId?: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("step", String(n));
      const id = extraId || providerId;
      if (id) params.set("pid", id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams, providerId],
  );

  const goToStep = (n: 1 | 2 | 3 | 4, extra?: Partial<Draft>) => {
    setStep(n);
    syncStepToUrl(n, extra?.providerId);
    saveDraft({
      step: n,
      formData,
      resendAvailableAt,
      providerId,
      kycStage,
      aadhaarNumber,
      ...extra,
    });
  };

  useEffect(() => {
    const draft = loadDraft();
    const urlStep = parseInt(searchParams.get("step") || "1", 10) as
      | 1
      | 2
      | 3
      | 4;
    const urlPid =
      searchParams.get("pid") || sessionStorage.getItem(PROVIDER_ID_KEY) || "";

    if (draft) {
      setFormData({
        ...emptyForm,
        ...draft.formData,
        address: { ...emptyForm.address, ...(draft.formData.address || {}) },
      });
      if (draft.resendAvailableAt)
        setResendAvailableAt(draft.resendAvailableAt);
      if (draft.aadhaarNumber) setAadhaarNumber(draft.aadhaarNumber);
      const finalPid = draft.providerId || urlPid;
      if (finalPid) {
        setProviderId(finalPid);
        setProviderName(draft.formData.name);
        fetchUserData(finalPid);
      }
      if (draft.kycStage) setKycStage(draft.kycStage);

      const effectiveStep = draft.step;
      setStep(effectiveStep);
      if (urlStep !== effectiveStep) syncStepToUrl(effectiveStep, finalPid);
    } else if (urlPid) {
      setProviderId(urlPid);
      fetchUserData(urlPid);
      if (urlStep !== 1) setStep(urlStep);
    } else if (urlStep !== 1) {
      syncStepToUrl(1);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!resendAvailableAt) {
      setResendLeft(0);
      return;
    }
    const tick = () =>
      setResendLeft(
        Math.max(0, Math.ceil((resendAvailableAt - Date.now()) / 1000)),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [resendAvailableAt]);

  useEffect(() => {
    if (!aadhaarResendAt) {
      setAadhaarResendLeft(0);
      return;
    }
    const tick = () =>
      setAadhaarResendLeft(
        Math.max(0, Math.ceil((aadhaarResendAt - Date.now()) / 1000)),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [aadhaarResendAt]);

  useEffect(() => {
    return () => {
      galleryPreviews.forEach((p) => URL.revokeObjectURL(p));
    };
  }, [galleryPreviews]);

  const update = (field: keyof FormState, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (hydrated)
        saveDraft({
          step,
          formData: next,
          resendAvailableAt,
          providerId,
          kycStage,
          aadhaarNumber,
        });
      return next;
    });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const updateAddress = (field: keyof Address, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, address: { ...prev.address, [field]: value } };
      if (hydrated)
        saveDraft({
          step,
          formData: next,
          resendAvailableAt,
          providerId,
          kycStage,
          aadhaarNumber,
        });
      return next;
    });
    if (errors[`address.${field}`])
      setErrors((prev) => ({ ...prev, [`address.${field}`]: "" }));
  };

  const handleGalleryPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (galleryFiles.length + files.length > 8) {
      Swal.fire({
        icon: "error",
        title: "Limit exceeded",
        text: "You can upload a maximum of 8 gallery images.",
      });
      return;
    }
    const validFiles = files.filter(
      (f) => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024,
    );
    const newPreviews = validFiles.map((f) => URL.createObjectURL(f));
    setGalleryFiles((prev) => [...prev, ...validFiles]);
    setGalleryPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeGalleryImage = (index: number) => {
    URL.revokeObjectURL(galleryPreviews[index]);
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
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



  useEffect(() => {
    if (!referralOn) return;
    if (referralInput.length < MIN_REFERRAL_DIGITS) {
      setDriverResult(null);
      setDriverError("");
      return;
    }
    if (selectedDriver?.driver_contact_number === referralInput) return;
    const t = setTimeout(() => { searchDriver(referralInput); }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referralInput, referralOn]);

  const searchDriver = async (phone: string) => {
    if (!/^\d{8,10}$/.test(phone)) {
      setDriverError(`Enter at least ${MIN_REFERRAL_DIGITS} digits`);
      setDriverResult(null);
      return;
    }
    setDriverSearching(true);
    setDriverError("");
    setDriverResult(null);
    try {
      const res = await axios.get(DRIVER_SEARCH_API, {
        params: { phoneNumber: phone },
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

  const addReferralDriver = () => {
    if (!driverResult) return;
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

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = "Name is required";
    if (!formData.garageName.trim()) e.garageName = "Garage name is required";
    if (!phoneRegex.test(formData.phone))
      e.phone = "Enter a valid 10-digit mobile number";
    if (
      formData.address.pincode &&
      !pincodeRegex.test(formData.address.pincode)
    )
      e["address.pincode"] = "Enter a valid 6-digit pincode";
    if (!formData.agreedToTerms)
      e.agreedToTerms = "Please accept Terms & Privacy Policy";
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
      if (formData.experienceYears)
        fd.append("experienceYears", formData.experienceYears);
      fd.append("address", JSON.stringify(formData.address));
      if (formData.referralPhone)
        fd.append("referralPhone", formData.referralPhone);
      if (formData.referralDriverId)
        fd.append("referralDriverId", formData.referralDriverId);
      if (formData.referralDriverName)
        fd.append("referralDriverName", formData.referralDriverName);
      galleryFiles.forEach((file) => fd.append("galleryImages", file));

      const res = await axios.post(
        `${API_BASE}/recovery-vehicle/register`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      const newProviderId = res?.data?.data?.id;
      if (newProviderId) {
        setProviderId(newProviderId);
        fetchUserData(newProviderId);
      }

      const resendAt = Date.now() + RESEND_COOLDOWN_MS;
      setResendAvailableAt(resendAt);
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      goToStep(2, { resendAvailableAt: resendAt, providerId: newProviderId });
      Swal.fire({
        icon: "success",
        title: "OTP sent",
        text: `We've sent an OTP to ${formData.phone}`,
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Registration failed",
        text:
          err?.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
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

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0)
      otpRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
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
      const verifiedProviderId = provider?._id || provider?.id || providerId;
      setProviderId(verifiedProviderId);
      if (verifiedProviderId) fetchUserData(verifiedProviderId);
      setKycStage("aadhaar-input");
      goToStep(3, {
        providerId: verifiedProviderId,
        kycStage: "aadhaar-input",
      });
    } catch (err: any) {
      setOtpError(err?.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendLeft > 0 || resending) return;
    setResending(true);
    try {
      await axios.post(`${API_BASE}/recovery-vehicle/resend-otp`, {
        phone: formData.phone,
      });
      const resendAt = Date.now() + RESEND_COOLDOWN_MS;
      setResendAvailableAt(resendAt);
      saveDraft({
        step: 2,
        formData,
        resendAvailableAt: resendAt,
        providerId,
        kycStage,
        aadhaarNumber,
      });
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      otpRefs.current[0]?.focus();
      Swal.fire({
        icon: "success",
        title: "OTP resent",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err?.response?.data?.message || "Couldn't resend OTP. Try again.",
      });
    } finally {
      setResending(false);
    }
  };

  const backToDetails = () => goToStep(1);

  // STAGE 1 of KYC: capture aadhaar number, then move to payment
  const proceedToPayment = () => {
    if (aadhaarNumber.length !== 12) {
      Swal.fire({
        icon: "error",
        title: "Invalid Aadhaar",
        text: "Enter a valid 12-digit Aadhaar number.",
      });
      return;
    }
    setKycStage("payment");
    saveDraft({
      step: 3,
      formData,
      resendAvailableAt,
      providerId,
      kycStage: "payment",
      aadhaarNumber,
    });
  };

  // STAGE 3: send aadhaar otp (after payment done)
  const sendAadhaarOtpHandler = async () => {
    if (!providerId) return;
    setSendingAadhaarOtp(true);
    try {
      await axios.post(
        `${API_BASE}/recovery-vehicle/${providerId}/kyc/aadhaar/send-otp`,
        { aadhaarNumber },
      );
      setKycStage("aadhaar-otp");
      setAadhaarOtpDigits(Array(AADHAAR_OTP_LENGTH).fill(""));
      setAadhaarOtpError("");
      const resendAt = Date.now() + RESEND_COOLDOWN_MS;
      setAadhaarResendAt(resendAt);
      saveDraft({
        step: 3,
        formData,
        resendAvailableAt,
        providerId,
        kycStage: "aadhaar-otp",
        aadhaarNumber,
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          err?.response?.data?.message ||
          "Couldn't send OTP. Please check the Aadhaar number and try again.",
      });
    } finally {
      setSendingAadhaarOtp(false);
    }
  };

  const resendAadhaarOtp = () => {
    if (aadhaarResendLeft > 0 || sendingAadhaarOtp) return;
    sendAadhaarOtpHandler();
  };

  const startKycPayment = async () => {
    if (!providerId) {
      Swal.fire({
        icon: "error",
        title: "Missing profile",
        text: "We couldn't find your profile. Please verify your mobile number again.",
      });
      return;
    }
    setPayingKyc(true);
    try {
      const response = await axios.post(
        `${API_BASE}/recovery-vehicle/${providerId}/kyc/create-order`,
      );
      const responseData = response?.data;

      if (responseData?.alreadyPaid) {
        setPayingKyc(false);
        await sendAadhaarOtpHandler();
        return;
      }

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
          title: "Payment order unavailable",
          text:
            responseData?.message ||
            "Server did not return a valid Razorpay order.",
        });
        setPayingKyc(false);
        return;
      }

      const scriptOk = await loadRazorpayScript();
      if (!scriptOk || !(window as any).Razorpay) {
        Swal.fire({
          icon: "error",
          title: "Payment gateway unavailable",
          text: "Razorpay checkout could not be loaded. Please check your internet connection and try again.",
        });
        setPayingKyc(false);
        return;
      }

      const rzp = new (window as any).Razorpay({
        key: order.key,
        amount: Number(order.amount),
        currency: order.currency,
        order_id: order.orderId,
        name: "Recovery Partner KYC",
        description: "One-time KYC verification fee",
        prefill: { name: formData.name || "", contact: formData.phone || "" },
        theme: { color: "#dc2626" },
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
                text: "Razorpay returned an incomplete payment response.",
              });
              setPayingKyc(false);
              return;
            }
            await axios.post(
              `${API_BASE}/recovery-vehicle/${providerId}/kyc/verify-payment`,
              {
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
              },
            );
            setPayingKyc(false);
            await sendAadhaarOtpHandler();
          } catch (err: any) {
            setPayingKyc(false);
            Swal.fire({
              icon: "error",
              title: "Verification failed",
              text:
                err?.response?.data?.message ||
                "We couldn't verify your payment. Please contact support.",
            });
          }
        },
        modal: { ondismiss: () => setPayingKyc(false) },
      });

      rzp.on("payment.failed", (paymentFailedResponse: any) => {
        setPayingKyc(false);
        Swal.fire({
          icon: "error",
          title: "Payment failed",
          text:
            paymentFailedResponse?.error?.description ||
            "Your payment couldn't be completed. Please try again.",
        });
      });

      rzp.open();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          err?.response?.data?.message ||
          err?.message ||
          "Couldn't start the payment. Please try again.",
      });
      setPayingKyc(false);
    }
  };

  const onAadhaarOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    setAadhaarOtpDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    setAadhaarOtpError("");
    if (value && index < AADHAAR_OTP_LENGTH - 1)
      aadhaarOtpRefs.current[index + 1]?.focus();
  };

  const onAadhaarOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !aadhaarOtpDigits[index] && index > 0)
      aadhaarOtpRefs.current[index - 1]?.focus();
  };

  const verifyAadhaarOtpHandler = async () => {
    const otp = aadhaarOtpDigits.join("");
    if (otp.length !== AADHAAR_OTP_LENGTH) {
      setAadhaarOtpError(`Enter the full ${AADHAAR_OTP_LENGTH}-digit OTP`);
      return;
    }
    if (!providerId) return;
    setVerifyingAadhaarOtp(true);
    try {
      await axios.post(
        `${API_BASE}/recovery-vehicle/${providerId}/kyc/aadhaar/verify-otp`,
        { otp },
      );
      await fetchUserData(providerId);
      clearDraft();
      setStep(4);
      syncStepToUrl(4, providerId);
    } catch (err: any) {
      setAadhaarOtpError(
        err?.response?.data?.message || "OTP verification failed or timed out.",
      );
    } finally {
      setVerifyingAadhaarOtp(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white">
        <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
      </div>
    );
  }

  const showStickyBar = step === 1;
  const profileImgUrl = userData?.profileImage ? userData.profileImage : null;

  return (
    <div className="min-h-screen bg-white ">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <img
            src={LOGO_SRC}
            alt="TaxiSafar"
            className="h-12 w-auto object-contain"
          />
          <button
            onClick={restartRegistration}
            className="h-9 px-3 rounded-xl border border-gray-300 text-gray-600 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-gray-50 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restart
          </button>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div
          className={`max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10 ${showStickyBar ? "pb-28 md:pb-10" : ""}`}
        >
          {step === 1 && (
            <div className="space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <Field label="Full Name" icon={User} error={errors.name}>
                  <input
                    className={inputCls(!!errors.name)}
                    placeholder="Rohit Sharma"
                    value={formData.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                </Field>
                <Field
                  label="Recovery Service Name"
                  icon={Building2}
                  error={errors.garageName}
                >
                  <input
                    className={inputCls(!!errors.garageName)}
                    placeholder="Sharma Recovery Service"
                    value={formData.garageName}
                    onChange={(e) => update("garageName", e.target.value)}
                  />
                </Field>
                <Field label="Mobile Number" icon={Phone} error={errors.phone}>
                  <input
                    className={inputCls(!!errors.phone)}
                    placeholder="9876543210"
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) =>
                      update("phone", e.target.value.replace(/\D/g, ""))
                    }
                  />
                </Field>
                <Field label="Experience (years)" icon={Clock}>
                  <input
                    className={inputCls(false)}
                    type="number"
                    min={0}
                    placeholder="6"
                    value={formData.experienceYears}
                    onChange={(e) => update("experienceYears", e.target.value)}
                  />
                </Field>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Address
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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
                  <Field label="Address Line" icon={MapPin}>
                    <input
                      className={inputCls(false)}
                      placeholder="Shop no, street"
                      value={formData.address.line1}
                      onChange={(e) => updateAddress("line1", e.target.value)}
                    />
                  </Field>
                  <Field
                    label="Pincode"
                    icon={MapPin}
                    error={errors["address.pincode"]}
                  >
                    <input
                      className={inputCls(!!errors["address.pincode"])}
                      placeholder="201001"
                      maxLength={6}
                      value={formData.address.pincode}
                      onChange={(e) =>
                        updateAddress(
                          "pincode",
                          e.target.value.replace(/\D/g, ""),
                        )
                      }
                    />
                  </Field>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Gallery Images (Max 8)
                    </p>
                    <span className="text-xs text-gray-400">
                      {galleryFiles.length}/8 uploaded
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {galleryPreviews.map((preview, index) => (
                      <div key={index} className="relative w-20 h-20">
                        <img
                          src={preview}
                          alt={`Gallery ${index}`}
                          className="w-20 h-20 rounded-xl object-cover border border-gray-200"
                        />
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
                      <label className="flex flex-col items-center justify-center w-20 h-20 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-red-400 transition-colors bg-gray-50">
                        <ImageIcon className="w-5 h-5 text-gray-400 mb-1" />
                        <span className="text-[10px] text-gray-500">
                          Add Photo
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleGalleryPick}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

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
                {/* ── referral driver block — updated (no Search button) ── */}
                {referralOn && (
                  <div className="mt-3">
                    {!selectedDriver && (
                      <div className="flex gap-2">
                        <span className="h-11 px-3 rounded-xl border border-gray-300 bg-white text-sm text-gray-500 flex items-center shrink-0">
                          +91
                        </span>
                        <div className="relative flex-1">
                          <input
                            value={referralInput}
                            onChange={(e) =>
                              setReferralInput(
                                e.target.value.replace(/\D/g, "").slice(0, 10),
                              )
                            }
                            placeholder="Full number or last 8 digits"
                            inputMode="numeric"
                            className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-white text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                          />
                          {driverSearching && (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                          )}
                        </div>
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
                                <MapPin className="w-3 h-3 shrink-0" /> {cleanText(driverResult.address)}
                              </p>
                            )}
                            <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isDriverKycDone(driverResult) ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                              }`}>
                              {isDriverKycDone(driverResult) ? <Shield className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                              {isDriverKycDone(driverResult) ? "KYC Verified" : "Non-KYC Verified"}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={addReferralDriver}
                          className="w-full h-10 bg-gray-900 text-white text-sm font-semibold"
                        >
                          Add
                        </button>
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
                            +91 {selectedDriver.driver_contact_number} · {driverCode(selectedDriver._id)}
                          </p>
                          <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isDriverKycDone(selectedDriver) ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                            }`}>
                            {isDriverKycDone(selectedDriver) ? <Shield className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {isDriverKycDone(selectedDriver) ? "KYC Verified" : "Non-KYC Verified"}
                          </span>
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

              <div>
                <label className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
                  <input
                    type="checkbox"
                    checked={formData.agreedToTerms}
                    onChange={(e) => update("agreedToTerms", e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>
                    I confirm the details are accurate and agree to TaxiSafar's{" "}
                    <a
                      href={TERMS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-red-600 font-medium underline underline-offset-2"
                    >
                      Terms &amp; Conditions
                    </a>{" "}
                    and{" "}
                    <a
                      href={PRIVACY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-red-600 font-medium underline underline-offset-2"
                    >
                      Privacy Policy
                    </a>
                    .
                  </span>
                </label>
                {errors.agreedToTerms && (
                  <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.agreedToTerms}
                  </p>
                )}
              </div>

              <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100 p-3 md:static md:border-0 md:p-0 md:bg-transparent">
                <button
                  onClick={handleSubmitDetails}
                  disabled={submitting}
                  className="w-full max-w-3xl mx-auto h-12 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Sending
                      OTP...
                    </>
                  ) : (
                    <>
                      Continue <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 max-w-md mx-auto">
              <button
                onClick={backToDetails}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-4 h-4" /> Edit details
              </button>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mb-3">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Verify your mobile number
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Enter the {OTP_LENGTH}-digit code sent to{" "}
                  <span className="font-medium text-gray-700">
                    +91 {formData.phone}
                  </span>
                </p>
              </div>
              <div
                className="flex justify-center gap-1.5 sm:gap-2"
                onPaste={handleOtpPaste}
              >
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
                    className={`w-9 h-11 sm:w-11 sm:h-12 text-center text-base sm:text-lg font-semibold rounded-xl border ${otpError ? "border-red-300" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-red-400`}
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
                className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
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
                  <button
                    onClick={handleResendOtp}
                    disabled={resending}
                    className="text-red-600 font-medium disabled:opacity-60"
                  >
                    {resending ? "Resending..." : "Resend OTP"}
                  </button>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center max-w-md mx-auto">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                <IdCard className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" />
              </div>

              {kycStage === "aadhaar-input" && (
                <>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Enter Aadhaar Number
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                      Required for identity verification. OTP will be sent after
                      payment.
                    </p>
                  </div>
                  <input
                    value={aadhaarNumber}
                    onChange={(e) =>
                      setAadhaarNumber(
                        e.target.value.replace(/\D/g, "").slice(0, 12),
                      )
                    }
                    placeholder="XXXX XXXX XXXX"
                    inputMode="numeric"
                    className={
                      inputCls(false) +
                      " text-center tracking-widest text-base sm:text-lg"
                    }
                  />
                  <button
                    onClick={proceedToPayment}
                    className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {kycStage === "payment" && (
                <>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Complete KYC Fee
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                      Pay a one-time KYC fee to send Aadhaar OTP
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      KYC Verification Fee
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {kycFeeLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin inline" />
                      ) : (
                        `₹${kycFee}`
                      )}
                    </span>
                  </div>
                  <button
                    onClick={startKycPayment}
                    disabled={payingKyc || kycFeeLoading || sendingAadhaarOtp}
                    className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
                  >
                    {payingKyc || sendingAadhaarOtp ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                    {payingKyc
                      ? "Opening Razorpay..."
                      : sendingAadhaarOtp
                        ? "Sending OTP..."
                        : `Pay ₹${kycFee} & Continue`}
                  </button>
                </>
              )}

              {kycStage === "aadhaar-otp" && (
                <>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Verify Aadhaar OTP
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                      Enter the 6-digit code sent to your Aadhaar-linked mobile
                    </p>
                  </div>
                  <div className="flex justify-center gap-1.5 sm:gap-2">
                    {aadhaarOtpDigits.map((d, i) => (
                      <input
                        key={i}
                        ref={(el) => {
                          aadhaarOtpRefs.current[i] = el;
                        }}
                        value={d}
                        onChange={(e) => onAadhaarOtpChange(i, e.target.value)}
                        onKeyDown={(e) => onAadhaarOtpKeyDown(i, e)}
                        maxLength={1}
                        inputMode="numeric"
                        className={`w-9 h-11 sm:w-11 sm:h-12 text-center text-base sm:text-lg font-semibold rounded-xl border ${aadhaarOtpError ? "border-red-300" : "border-gray-300"} focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none`}
                      />
                    ))}
                  </div>
                  {aadhaarOtpError && (
                    <p className="flex items-center justify-center gap-1.5 text-sm text-red-500">
                      <AlertCircle className="w-4 h-4" /> {aadhaarOtpError}
                    </p>
                  )}
                  <button
                    onClick={verifyAadhaarOtpHandler}
                    disabled={verifyingAadhaarOtp}
                    className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
                  >
                    {verifyingAadhaarOtp ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    {verifyingAadhaarOtp
                      ? "Verifying..."
                      : "Verify & Activate Account"}
                  </button>
                  <div className="text-sm">
                    {aadhaarResendLeft > 0 ? (
                      <span className="text-gray-400">
                        Resend OTP in {aadhaarResendLeft}s
                      </span>
                    ) : (
                      <button
                        onClick={resendAadhaarOtp}
                        disabled={sendingAadhaarOtp}
                        className="text-red-600 font-medium disabled:text-gray-400"
                      >
                        {sendingAadhaarOtp ? "Resending..." : "Resend OTP"}
                      </button>
                    )}
                    <span className="text-gray-300 mx-2">|</span>
                    <button
                      onClick={changeAadhaarAfterPayment}
                      disabled={sendingAadhaarOtp || verifyingAadhaarOtp}
                      className="text-gray-500 font-medium disabled:text-gray-300"
                    >
                      Change Aadhaar Number
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="max-w-md mx-auto">
              {userDataLoading && !userData ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
                </div>
              ) : (
                <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white">
                  <div className="pt-6 pb-4 px-6 text-center border-b border-gray-100">
                    {profileImgUrl ? (
                      <img
                        src={profileImgUrl}
                        alt=""
                        className="w-20 h-20 rounded-full object-cover mx-auto border"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-100 mx-auto flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center mx-auto -mt-5 border-4 border-white relative">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mt-2">
                      Your registration request is submitted
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Your request has been successfully sent. Please wait for
                      approval.
                    </p>
                  </div>

                  <div className="divide-y divide-gray-100">
                    <DetailRow label="Full Name" value={userData?.name} />
                    <DetailRow
                      label="Mobile Number"
                      value={
                        userData?.phone ? `+91 ${userData.phone}` : undefined
                      }
                    />
                    <DetailRow
                      label="Aadhaar Name"
                      value={userData?.aadharData?.verifiedData?.full_name}
                    />
                    <DetailRow
                      label="Aadhaar Number"
                      value={maskAadhaar(userData?.aadharData?.aadhaarNumber)}
                    />
                    <DetailRow
                      label="Date of Birth"
                      value={formatDob(userData?.aadharData?.verifiedData?.dob)}
                    />
                    <DetailRow
                      label="Address"
                      value={
                        userData?.address
                          ? [
                            userData.address.line1,
                            userData.address.city,
                            userData.address.state,
                          ]
                            .filter(Boolean)
                            .join(", ")
                          : undefined
                      }
                    />
                    <DetailRow
                      label="Status"
                      value={statusLabel(userData?.profileStatus)}
                      bold
                    />
                  </div>

                  <div className="px-6 pt-3 pb-5 text-center">
                    <p className="text-xs text-gray-500 mb-4">
                      Please wait — our team will verify your details. Your
                      listing/app access will be activated after approval.
                    </p>
                    <button
                      onClick={() => router.push("/")}
                      className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const inputCls = (hasError: boolean) =>
  `w-full h-11 rounded-xl border ${hasError ? "border-red-300 focus:ring-red-400" : "border-gray-200 focus:ring-red-400"} px-3.5 text-sm focus:outline-none focus:ring-2 bg-white`;

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

const DetailRow = ({
  label,
  value,
  bold,
}: {
  label: string;
  value?: string;
  bold?: boolean;
}) => (
  <div className="flex items-start justify-between gap-4 px-6 py-3">
    <span className="text-sm text-gray-500 shrink-0">{label}:</span>
    <span
      className={`text-sm text-right ${bold ? "font-bold text-gray-900" : "text-gray-800"}`}
    >
      {value || "—"}
    </span>
  </div>
);
export default RecoveryVehicleRegister;
