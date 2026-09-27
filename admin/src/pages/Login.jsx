import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Field, Input } from "../components/ui";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) return setError("Enter your email and password");
    setLoading(true);
    try {
      await login(form.email.trim(), form.password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message === "Not Registered!!" ? "No account with this email" : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <div className="relative hidden overflow-hidden bg-road-900 lg:block">
        <div className="absolute inset-y-0 left-1/2 w-3 -translate-x-1/2 bg-[repeating-linear-gradient(to_bottom,#f5f5f4_0_48px,transparent_48px_96px)] opacity-80" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <span className="grid size-10 place-items-center rounded-lg bg-brand-500 text-lg font-bold">
            <img src="https://i.ibb.co/Mk3cwgmS/image.png" />
          </span>
          <div className="max-w-sm rounded-xl bg-road-900/90 p-6">
            <p className="text-3xl font-bold leading-tight">Every ride, fare and route in one place.</p>
            <p className="mt-3 text-stone-400">Manage bookings, pricing, discounts and Char Dham packages for TaxiSafar.</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
            <p className="mt-1 text-sm text-slate-500">Admin accounts only.</p>
          </div>
          <Field label="Email">
            <Input type="email" autoComplete="username" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoFocus />
          </Field>
          <Field label="Password">
            <Input type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">Sign in</Button>
        </form>
      </div>
    </div>
  );
}
