import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/** Two-step WhatsApp OTP sign-in. No password anywhere in the customer flow. */
export default function LoginModal() {
  const { loginOpen, closeLogin, sendOtp, verifyOtp } = useAuth();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loginOpen) {
      setStep("phone");
      setOtp("");
      setError("");
      setSeconds(0);
    }
  }, [loginOpen]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeLogin();
    if (loginOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [loginOpen, closeLogin]);

  if (!loginOpen) return null;

  const submitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await sendOtp(phone);
      setStep("otp");
      setSeconds(30);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await verifyOtp(phone, otp, name ? { name } : {});
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
      onMouseDown={(e) => e.target === e.currentTarget && closeLogin()}
    >
      <div ref={dialogRef} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-widget">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 id="login-title" className="text-lg">
              {step === "phone" ? "Sign in to TaxiSafar" : "Enter the code"}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              {step === "phone"
                ? "We'll send a one-time code to your WhatsApp."
                : `Sent to +91 ${phone}`}
            </p>
          </div>
          <button onClick={closeLogin} aria-label="Close" className="text-ink-faint hover:text-ink">
            <X size={18} />
          </button>
        </div>

        {step === "phone" ? (
          <form onSubmit={submitPhone} className="space-y-3">
            <label htmlFor="login-phone" className="block text-sm font-medium">
              Mobile number
            </label>
            <div className="flex items-center gap-2">
              <span className="rounded-lg border border-line px-3 py-2.5 text-sm text-ink-muted">+91</span>
              <input
                id="login-phone"
                inputMode="numeric"
                autoComplete="tel"
                required
                pattern="[6-9][0-9]{9}"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="98765 43210"
                className="field"
              />
            </div>
            {error ? <p className="text-sm text-brand-600">{error}</p> : null}
            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? "Sending…" : "Send code"}
            </button>
          </form>
        ) : (
          <form onSubmit={submitOtp} className="space-y-3">
            <label htmlFor="login-otp" className="block text-sm font-medium">
              6-digit code
            </label>
            <input
              id="login-otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              className="field text-center text-lg tracking-[0.4em]"
            />
            <label htmlFor="login-name" className="block text-sm font-medium">
              Your name <span className="font-normal text-ink-faint">(first time only)</span>
            </label>
            <input
              id="login-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="field"
            />
            {error ? <p className="text-sm text-brand-600">{error}</p> : null}
            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? "Verifying…" : "Verify and continue"}
            </button>
            <button
              type="button"
              disabled={seconds > 0}
              onClick={submitPhone}
              className="w-full text-sm text-ink-muted disabled:opacity-60"
            >
              {seconds > 0 ? `Resend code in ${seconds}s` : "Resend code"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
