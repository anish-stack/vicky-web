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

const API_BASE = "https://partners.taxisafar.com/api/auth";
const DRAFT_KEY = "recovery_register_draft";
const OTP_LENGTH = 6;
const AADHAAR_OTP_LENGTH = 6;
const RESEND_COOLDOWN_MS = 60 * 1000;
const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

const SERVICE_OPTIONS = [
  "Breakdown Recovery",
  "Accident Recovery",
  "Bike Recovery",
  "Jump Start Service",
  "Fuel Delivery",
  "Towing",
  "Flat Tyre",
];

const VEHICLE_TYPE_OPTIONS = ["Hatchback", "Sedan", "SUV", "MPV", "Luxury Cars", "Commercial"];

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

type KycStage = "payment" | "aadhaar-input" | "aadhaar-otp";

type Draft = {
  step: 1 | 2 | 3 | 4;
  formData: FormState;
  resendAvailableAt: number | null;
  providerId?: string;
  kycStage?: KycStage;
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

const loadRazorpayScript = () =>
  new Promise<boolean>((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as any).Razorpay) return resolve(true);
    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`);
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
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const pincodeRegex = /^\d{6}$/;

const RecoveryVehicleRegister = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
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
  const [providerId, setProviderId] = useState<string | undefined>(undefined);
  const [hydrated, setHydrated] = useState(false);

  // KYC state
  const [kycStage, setKycStage] = useState<KycStage>("payment");
  const [payingKyc, setPayingKyc] = useState(false);
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [sendingAadhaarOtp, setSendingAadhaarOtp] = useState(false);
  const [aadhaarOtpDigits, setAadhaarOtpDigits] = useState<string[]>(Array(AADHAAR_OTP_LENGTH).fill(""));
  const [aadhaarOtpError, setAadhaarOtpError] = useState("");
  const [verifyingAadhaarOtp, setVerifyingAadhaarOtp] = useState(false);
  const [aadhaarResendAt, setAadhaarResendAt] = useState<number | null>(null);
  const [aadhaarResendLeft, setAadhaarResendLeft] = useState(0);

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const aadhaarOtpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const cities = formData.address.state ? INDIAN_STATES_CITIES[formData.address.state] || [] : [];

  const syncStepToUrl = useCallback(
    (n: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("step", String(n));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const goToStep = (n: 1 | 2 | 3 | 4, extra?: Partial<Draft>) => {
    setStep(n);
    syncStepToUrl(n);
    saveDraft({
      step: n,
      formData,
      resendAvailableAt,
      providerId,
      kycStage,
      ...extra,
    });
  };

  useEffect(() => {
    const draft = loadDraft();
    const urlStep = parseInt(searchParams.get("step") || "1", 10) as 1 | 2 | 3 | 4;

    if (draft) {
      // Merge draft with default emptyForm to ensure array safety
      setFormData({
        ...emptyForm,
        ...draft.formData,
        servicesOffered: draft.formData.servicesOffered || emptyForm.servicesOffered,
        vehiclesRecoveredTypes: draft.formData.vehiclesRecoveredTypes || emptyForm.vehiclesRecoveredTypes,
        address: { ...emptyForm.address, ...(draft.formData.address || {}) },
      });
      if (draft.resendAvailableAt) setResendAvailableAt(draft.resendAvailableAt);
      if (draft.providerId) {
        setProviderId(draft.providerId);
        setProviderName(draft.formData.name);
      }
      if (draft.kycStage) setKycStage(draft.kycStage);

      const effectiveStep = draft.step;
      setStep(effectiveStep);
      if (urlStep !== effectiveStep) syncStepToUrl(effectiveStep);
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
    const tick = () => setResendLeft(Math.max(0, Math.ceil((resendAvailableAt - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [resendAvailableAt]);

  useEffect(() => {
    if (!aadhaarResendAt) {
      setAadhaarResendLeft(0);
      return;
    }
    const tick = () => setAadhaarResendLeft(Math.max(0, Math.ceil((aadhaarResendAt - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [aadhaarResendAt]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      galleryPreviews.forEach((p) => URL.revokeObjectURL(p));
    };
  }, [imagePreview, galleryPreviews]);

  const updateField = (field: keyof FormState, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (hydrated) saveDraft({ step, formData: next, resendAvailableAt, providerId, kycStage });
      return next;
    });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const updateAddress = (field: keyof Address, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, address: { ...prev.address, [field]: value } };
      if (hydrated) saveDraft({ step, formData: next, resendAvailableAt, providerId, kycStage });
      return next;
    });
    if (errors[`address.${field}`]) setErrors((prev) => ({ ...prev, [`address.${field}`]: "" }));
  };

  const toggleServiceItem = (service: string) => {
    const currentList = formData.servicesOffered || [];
    const exists = currentList.includes(service);
    const updated = exists ? currentList.filter((s) => s !== service) : [...currentList, service];
    updateField("servicesOffered", updated);
  };

  const toggleVehicleItem = (vehicle: string) => {
    const currentList = formData.vehiclesRecoveredTypes || [];
    const exists = currentList.includes(vehicle);
    const updated = exists ? currentList.filter((v) => v !== vehicle) : [...currentList, vehicle];
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

    const validFiles = files.filter((f) => {
      if (!f.type.startsWith("image/")) return false;
      if (f.size > 5 * 1024 * 1024) return false;
      return true;
    });

    const newPreviews = validFiles.map((f) => URL.createObjectURL(f));
    setGalleryFiles((prev) => [...prev, ...validFiles]);
    setGalleryPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeGalleryImage = (index: number) => {
    URL.revokeObjectURL(galleryPreviews[index]);
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
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

      const res = await axios.post(`${API_BASE}/recovery-vehicle/register`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newProviderId = res?.data?.data?.id;
      if (newProviderId) setProviderId(newProviderId);

      const resendAt = Date.now() + RESEND_COOLDOWN_MS;
      setResendAvailableAt(resendAt);
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      goToStep(2, { resendAvailableAt: resendAt, providerId: newProviderId });
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
      const verifiedProviderId = provider?._id || provider?.id || providerId;
      setProviderId(verifiedProviderId);
      setKycStage("payment");
      goToStep(3, { providerId: verifiedProviderId, kycStage: "payment" });
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
      saveDraft({ step: 2, formData, resendAvailableAt: resendAt, providerId, kycStage });
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

  /* ---------------- KYC: fee payment ---------------- */

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
        `${API_BASE}/recovery-vehicle/${providerId}/kyc/create-order`
      );

      const responseData = response?.data;
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
          text: responseData?.message || "Server did not return a valid Razorpay order.",
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

        prefill: {
          name: formData.name || "",
          contact: formData.phone || "",
          email: formData.email || undefined,
        },

        theme: {
          color: "#dc2626",
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
              }
            );

            setKycStage("aadhaar-input");

            saveDraft({
              step: 3,
              formData,
              resendAvailableAt,
              providerId,
              kycStage: "aadhaar-input",
            });

            Swal.fire({
              icon: "success",
              title: "Payment successful",
              text: "KYC payment completed. Please continue with Aadhaar verification.",
              confirmButtonColor: "#dc2626",
            });
          } catch (err: any) {
            const message =
              err?.response?.data?.message || "We couldn't verify your payment. Please contact support.";
            Swal.fire({ icon: "error", title: "Verification failed", text: message });
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
          text: paymentFailedResponse?.error?.description || "Your payment couldn't be completed. Please try again.",
        });
      });

      rzp.open();
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Couldn't start the payment. Please try again.";
      Swal.fire({ icon: "error", title: "Failed", text: message });
      setPayingKyc(false);
    }
  };

  /* ---------------- KYC: Aadhaar OTP ---------------- */

  const sendAadhaarOtpHandler = async () => {
    if (aadhaarNumber.length !== 12) {
      Swal.fire({ icon: "error", title: "Invalid Aadhaar", text: "Enter a valid 12-digit Aadhaar number." });
      return;
    }
    if (!providerId) return;
    setSendingAadhaarOtp(true);
    try {
      await axios.post(`${API_BASE}/recovery-vehicle/${providerId}/kyc/aadhaar/send-otp`, { aadhaarNumber });
      setKycStage("aadhaar-otp");
      setAadhaarOtpDigits(Array(AADHAAR_OTP_LENGTH).fill(""));
      setAadhaarOtpError("");
      const resendAt = Date.now() + RESEND_COOLDOWN_MS;
      setAadhaarResendAt(resendAt);
      saveDraft({ step: 3, formData, resendAvailableAt, providerId, kycStage: "aadhaar-otp" });
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Couldn't send OTP. Please check the Aadhaar number and try again.";
      Swal.fire({ icon: "error", title: "Failed", text: msg });
    } finally {
      setSendingAadhaarOtp(false);
    }
  };

  const resendAadhaarOtp = () => {
    if (aadhaarResendLeft > 0 || sendingAadhaarOtp) return;
    sendAadhaarOtpHandler();
  };

  const onAadhaarOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    setAadhaarOtpDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    setAadhaarOtpError("");
    if (value && index < AADHAAR_OTP_LENGTH - 1) aadhaarOtpRefs.current[index + 1]?.focus();
  };

  const onAadhaarOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !aadhaarOtpDigits[index] && index > 0) {
      aadhaarOtpRefs.current[index - 1]?.focus();
    }
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
      await axios.post(`${API_BASE}/recovery-vehicle/${providerId}/kyc/aadhaar/verify-otp`, { otp });
      clearDraft();
      setStep(4);
      syncStepToUrl(4);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "OTP verification failed or timed out.";
      setAadhaarOtpError(msg);
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

  const STEP_LABELS = ["Details", "Verify", "KYC", "Done"];
  const showStickyBar = step === 1;

  const RAIL_FEATURES = [
    { icon: Shield, text: "Verified partner network" },
    { icon: Clock, text: "Get leads within 24-48 hrs" },
    { icon: CreditCard, text: "Transparent one-time KYC fee" },
    { icon: Wrench, text: "Manage jobs from your phone" },
  ];

  return (
    <div className="min-h-screen bg-white md:flex">
      {/* Left rail - desktop: pinned sidebar. mobile: compact header */}
      <aside className="md:w-[300px] lg:w-[340px] md:shrink-0 md:sticky md:top-0 md:h-screen md:overflow-y-auto bg-white border-b md:border-b-0 md:border-r border-gray-100">
        {/* Desktop rail content */}
        <div className="hidden md:flex md:flex-col md:h-full px-8 py-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-50 mb-5">
            <Wrench className="w-6 h-6 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 leading-snug">Become a Recovery Partner</h1>
          <p className="text-sm text-gray-500 mt-2">Register your recovery service in a few quick steps</p>

          <div className="mt-8 space-y-4">
            {RAIL_FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                  <f.icon className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-sm text-gray-600">{f.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-10">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Progress</p>
            <div className="space-y-4">
              {STEP_LABELS.map((label, i) => {
                const s = i + 1;
                return (
                  <div key={label} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                        step > s
                          ? "bg-red-600 text-white"
                          : step === s
                          ? "bg-red-600 text-white ring-4 ring-red-100"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {step > s ? <Check className="w-4 h-4" /> : s}
                    </div>
                    <span className={`text-sm ${step === s ? "font-semibold text-gray-900" : "text-gray-500"}`}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile compact header */}
        <div className="md:hidden pt-16 pb-4 px-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-red-50 shrink-0">
              <Wrench className="w-4.5 h-4.5 text-red-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-gray-900 truncate">Become a Recovery Partner</h1>
              <p className="text-xs text-gray-500 truncate">{STEP_LABELS[step - 1]} — Step {step} of 4</p>
            </div>
          </div>

          {/* Slim horizontal step bar */}
          <div className="flex items-center gap-1.5 mt-3">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${step >= s ? "bg-red-600" : "bg-gray-200"}`}
              />
            ))}
          </div>
        </div>
      </aside>

      {/* Main content - scrolls beside the pinned rail */}
      <div className="flex-1 min-w-0">
        <div className={`max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10 ${showStickyBar ? "pb-28 md:pb-10" : ""}`}>
        {step === 1 && (
          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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
                        active ? "bg-red-600 text-white border-red-600" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
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
                        active ? "bg-red-600 text-white border-red-600" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
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
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                rows={3}
                placeholder="We provide 24x7 fast and safe recovery service..."
                value={formData.about}
                onChange={(e) => updateField("about", e.target.value)}
              />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Address</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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
            <div className="pt-4 border-t border-gray-100 space-y-5">
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
                  <label className="flex items-center gap-3 border border-dashed border-gray-300 rounded-xl px-4 py-3 cursor-pointer hover:border-red-400 transition-colors w-fit">
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
                    <label className="flex flex-col items-center justify-center w-20 h-20 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-red-400 transition-colors bg-gray-50">
                      <ImageIcon className="w-5 h-5 text-gray-400 mb-1" />
                      <span className="text-[10px] text-gray-500">Add Photo</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryPick} />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Continue button: sticky/fixed on mobile, inline on desktop */}
            <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100 p-3 md:static md:border-0 md:p-0 md:bg-transparent">
              <button
                onClick={handleSubmitDetails}
                disabled={submitting}
                className="w-full max-w-3xl mx-auto h-12 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold flex items-center justify-center gap-2 transition-colors"
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
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 max-w-md mx-auto">
            <button onClick={backToDetails} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-4 h-4" /> Edit details
            </button>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mb-3">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Verify your mobile number</h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter the {OTP_LENGTH}-digit code sent to <span className="font-medium text-gray-700">+91 {formData.phone}</span>
              </p>
            </div>

            <div className="flex justify-center gap-1.5 sm:gap-2" onPaste={handleOtpPaste}>
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
                  className={`w-9 h-11 sm:w-11 sm:h-12 text-center text-base sm:text-lg font-semibold rounded-xl border ${
                    otpError ? "border-red-300" : "border-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-red-400`}
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
                <button onClick={handleResendOtp} disabled={resending} className="text-red-600 font-medium disabled:opacity-60">
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

            {kycStage === "payment" && (
              <>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Complete KYC Fee</h2>
                  <p className="text-sm text-gray-400 mt-1">Pay a one-time ₹99 KYC fee to unlock Aadhaar verification</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-sm text-gray-600">KYC Verification Fee</span>
                  <span className="text-lg font-bold text-gray-900">₹99</span>
                </div>
                <button
                  onClick={startKycPayment}
                  disabled={payingKyc}
                  className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
                >
                  {payingKyc ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                  {payingKyc ? "Opening Razorpay..." : "Pay ₹99 & Continue"}
                </button>
              </>
            )}

            {kycStage === "aadhaar-input" && (
              <>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Enter Aadhaar Number</h2>
                  <p className="text-sm text-gray-400 mt-1">We'll send an OTP to your Aadhaar-linked mobile number</p>
                </div>
                <input
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
                  placeholder="XXXX XXXX XXXX"
                  inputMode="numeric"
                  className={inputCls(false) + " text-center tracking-widest text-base sm:text-lg"}
                />
                <button
                  onClick={sendAadhaarOtpHandler}
                  disabled={sendingAadhaarOtp}
                  className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
                >
                  {sendingAadhaarOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : <IdCard className="w-4 h-4" />}
                  {sendingAadhaarOtp ? "Sending OTP..." : "Send Aadhaar OTP"}
                </button>
              </>
            )}

            {kycStage === "aadhaar-otp" && (
              <>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Verify Aadhaar OTP</h2>
                  <p className="text-sm text-gray-400 mt-1">Enter the 6-digit code sent to your Aadhaar-linked mobile</p>
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
                      className={`w-9 h-11 sm:w-11 sm:h-12 text-center text-base sm:text-lg font-semibold rounded-xl border ${
                        aadhaarOtpError ? "border-red-300" : "border-gray-300"
                      } focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none`}
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
                  {verifyingAadhaarOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {verifyingAadhaarOtp ? "Verifying..." : "Verify & Activate Account"}
                </button>

                <div className="text-sm">
                  {aadhaarResendLeft > 0 ? (
                    <span className="text-gray-400">Resend OTP in {aadhaarResendLeft}s</span>
                  ) : (
                    <button onClick={resendAadhaarOtp} disabled={sendingAadhaarOtp} className="text-red-600 font-medium disabled:text-gray-400">
                      {sendingAadhaarOtp ? "Resending..." : "Resend OTP"}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-4 sm:py-6 space-y-4 max-w-md mx-auto">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-500/10">
              <Check className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">You're all set, {providerName || "partner"}!</h2>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Your mobile number and KYC are verified, and your recovery service profile has been created. Our team will review it shortly.
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

const inputCls = (hasError: boolean) =>
  `w-full h-11 rounded-xl border ${
    hasError ? "border-red-300 focus:ring-red-400" : "border-gray-200 focus:ring-red-400"
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