import { useState } from "react";
import { Phone, Mail, MapPin } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/ui/Seo";
import { fetchServer, request } from "@/lib/api";

export default function ContactPage({ bootstrap }: any) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", subject: "", message: "" });
  const [state, setState] = useState<{ kind: "idle" | "busy" | "done" | "error"; message?: string }>({ kind: "idle" });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ kind: "busy" });
    try {
      const { message } = await request("post", "/enquiries", { type: "contact", ...form });
      setForm({ name: "", phone: "", email: "", subject: "", message: "" });
      setState({ kind: "done", message });
    } catch (err: any) {
      setState({ kind: "error", message: err.message });
    }
  };

  const settings = bootstrap?.settings || {};

  return (
    <Layout settings={settings}>
      <Seo
        title="Contact TaxiSafar — Call, WhatsApp or Email"
        description="Reach the TaxiSafar team for bookings, changes or support. We reply within a few hours, every day."
      />

      <div className="container max-w-4xl py-14">
        <h1 className="text-3xl">Contact us</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Booking question, change of plan, or something went wrong — tell us and we&apos;ll sort it.
        </p>

        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-xs text-ink-muted">
                Your name
              </label>
              <input id="name" required value={form.name} onChange={(e) => set("name", e.target.value)} className="field" />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1 block text-xs text-ink-muted">
                Mobile number
              </label>
              <input
                id="phone"
                required
                inputMode="numeric"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="field"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-xs text-ink-muted">
                Email <span className="text-ink-faint">(optional)</span>
              </label>
              <input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="field" />
            </div>
            <div>
              <label htmlFor="subject" className="mb-1 block text-xs text-ink-muted">
                Subject
              </label>
              <input id="subject" value={form.subject} onChange={(e) => set("subject", e.target.value)} className="field" />
            </div>
            <div>
              <label htmlFor="message" className="mb-1 block text-xs text-ink-muted">
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
                className="field resize-none"
              />
            </div>

            {state.message ? (
              <p className={`text-sm ${state.kind === "error" ? "text-brand-600" : "text-[#047857]"}`}>{state.message}</p>
            ) : null}

            <button type="submit" disabled={state.kind === "busy"} className="btn-primary w-full">
              {state.kind === "busy" ? "Sending…" : "Send message"}
            </button>
          </form>

          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-500">
                <Phone size={16} />
              </span>
              <div>
                <p className="text-sm font-medium">Call anytime</p>
                <a href={`tel:${settings.support_phone}`} className="text-sm text-ink-muted">
                  {settings.support_phone || "+91 78945 61230"}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-500">
                <Mail size={16} />
              </span>
              <div>
                <p className="text-sm font-medium">Email</p>
                <a href={`mailto:${settings.support_email}`} className="text-sm text-ink-muted">
                  {settings.support_email || "support@taxisafar.com"}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-500">
                <MapPin size={16} />
              </span>
              <div>
                <p className="text-sm font-medium">Service area</p>
                <p className="text-sm text-ink-muted">All India outstation, local and airport transfers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  const bootstrap = await fetchServer("/bootstrap", {});
  return { props: { bootstrap }, revalidate: 600 };
}
