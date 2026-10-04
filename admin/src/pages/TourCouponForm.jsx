import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import useOptions from "../hooks/useOptions";
import { Card, Field, Input, Loading, PageHeader, Select, Textarea, Toggle } from "../components/ui";
import { BackLink, SaveBar } from "../components/FormBits";
import { useToast } from "../components/Toast";
import { COUPON_API } from "./TourCoupons";

const isOn = (v) => v === true || v === 1 || v === "1" || v === "true";
const digits = (v) => String(v).replace(/[^\d.]/g, "");

export default function TourCouponForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: tours } = useOptions("/tour-package?all=1");
  const [form, setForm] = useState({
    code: "",
    title: "",
    description: "",
    discount_type: "percent",
    discount_value: "",
    max_discount: "",
    min_order_amount: "",
    tour_package_ids: [],
    start_date: "",
    end_date: "",
    usage_limit: "",
    per_mobile_limit: "1",
    is_public: true,
    is_active: true,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [used, setUsed] = useState(0);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    api
      .get(`${COUPON_API}/${id}`)
      .then((r) => {
        if (!alive) return;
        const c = r.data || {};
        setUsed(c.used_count || 0);
        setForm({
          code: c.code || "",
          title: c.title || "",
          description: c.description || "",
          discount_type: c.discount_type || "percent",
          discount_value: c.discount_value ?? "",
          max_discount: c.max_discount ?? "",
          min_order_amount: Number(c.min_order_amount) > 0 ? c.min_order_amount : "",
          tour_package_ids: Array.isArray(c.tour_package_ids) ? c.tour_package_ids : [],
          start_date: c.start_date || "",
          end_date: c.end_date || "",
          usage_limit: c.usage_limit ?? "",
          per_mobile_limit: String(c.per_mobile_limit ?? 1),
          is_public: isOn(c.is_public),
          is_active: c.is_active === undefined ? true : isOn(c.is_active),
        });
      })
      .catch((e) => toast.error(e))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleTour = (tid) =>
    set("tour_package_ids", form.tour_package_ids.includes(tid) ? form.tour_package_ids.filter((x) => x !== tid) : [...form.tour_package_ids, tid]);

  const submit = async (ev) => {
    ev.preventDefault();
    const e = {};
    const code = form.code.trim().toUpperCase().replace(/\s+/g, "");
    if (!/^[A-Z0-9_-]{3,40}$/.test(code)) e.code = "3-40 characters: letters, numbers, - or _";
    const val = Number(form.discount_value);
    if (!(val > 0)) e.discount_value = "Enter a value above 0";
    else if (form.discount_type === "percent" && val > 100) e.discount_value = "Max 100%";
    if (form.start_date && form.end_date && form.end_date < form.start_date) e.end_date = "End date is before start date";
    setErrors(e);
    if (Object.keys(e).length) return toast.error("Fix the highlighted fields");

    const body = {
      code,
      title: form.title.trim(),
      description: form.description.trim(),
      discount_type: form.discount_type,
      discount_value: val,
      max_discount: form.discount_type === "percent" ? form.max_discount : "",
      min_order_amount: form.min_order_amount === "" ? 0 : Number(form.min_order_amount),
      tour_package_ids: form.tour_package_ids,
      start_date: form.start_date,
      end_date: form.end_date,
      usage_limit: form.usage_limit,
      per_mobile_limit: form.per_mobile_limit === "" ? 1 : Number(form.per_mobile_limit),
      is_public: form.is_public,
      is_active: form.is_active,
    };

    setSaving(true);
    try {
      const r = id ? await api.put(`${COUPON_API}/${id}`, body) : await api.post(COUPON_API, body);
      toast.success(r?.message || "Saved");
      navigate("/tour-coupons");
    } catch (e2) {
      toast.error(e2);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  const pct = form.discount_type === "percent";

  return (
    <form id="coupon-form" onSubmit={submit} noValidate>
      <PageHeader back={<BackLink to="/tour-coupons">Coupons</BackLink>} title={id ? `Edit ${form.code || "coupon"}` : "Add coupon"} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card title="Coupon">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Coupon code" required error={errors.code} hint="Customers type this. Capital letters, no spaces.">
                <Input value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))} placeholder="WELCOME10" className="font-mono uppercase" maxLength={40} />
              </Field>
              <Field label="Title" hint="Shown to the customer">
                <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="10% off your tour" maxLength={150} />
              </Field>
              <Field label="Description" className="sm:col-span-2">
                <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Valid on all Mathura Vrindavan tours" maxLength={500} />
              </Field>
            </div>
          </Card>

          <Card title="Discount">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Type">
                <Select
                  value={form.discount_type}
                  onChange={(e) => set("discount_type", e.target.value)}
                  options={[{ value: "percent", label: "Percentage (%)" }, { value: "flat", label: "Flat amount (₹)" }]}
                />
              </Field>
              <Field label={pct ? "Percent off" : "Amount off (₹)"} required error={errors.discount_value}>
                <Input inputMode="decimal" value={form.discount_value} onChange={(e) => set("discount_value", digits(e.target.value))} placeholder={pct ? "10" : "300"} />
              </Field>
              {pct && (
                <Field label="Max discount (₹)" hint="Optional cap. Empty = no cap.">
                  <Input inputMode="decimal" value={form.max_discount} onChange={(e) => set("max_discount", digits(e.target.value))} placeholder="500" />
                </Field>
              )}
              <Field label="Minimum booking amount (₹)" hint="Trip total (cab + hotel) before discount. Empty = no minimum.">
                <Input inputMode="decimal" value={form.min_order_amount} onChange={(e) => set("min_order_amount", digits(e.target.value))} placeholder="2000" />
              </Field>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              The discount is taken off the trip total, and the advance (booking %) is calculated on the discounted total.
            </p>
          </Card>

          <Card title="Applicable tours">
            <p className="mb-2 text-xs text-slate-500">Leave all unchecked to allow this coupon on every tour.</p>
            <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-stone-200 p-2">
              {(tours || []).length === 0 && <p className="p-2 text-sm text-slate-500">No tours found.</p>}
              {(tours || []).map((t) => (
                <label key={t.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-stone-50">
                  <input type="checkbox" className="size-4 accent-red-600" checked={form.tour_package_ids.includes(Number(t.id))} onChange={() => toggleTour(Number(t.id))} />
                  <span className="min-w-0 truncate">{t.title}</span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">{form.tour_package_ids.length ? `${form.tour_package_ids.length} tour(s) selected` : "All tours"}</p>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card title="Validity & limits">
            <div className="space-y-4">
              <Field label="Start date" hint="Empty = starts now">
                <Input type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} />
              </Field>
              <Field label="End date" hint="Empty = never expires" error={errors.end_date}>
                <Input type="date" value={form.end_date} min={form.start_date || undefined} onChange={(e) => set("end_date", e.target.value)} />
              </Field>
              <Field label="Total uses allowed" hint={id ? `Used so far: ${used}. Empty = unlimited.` : "Empty = unlimited"}>
                <Input inputMode="numeric" value={form.usage_limit} onChange={(e) => set("usage_limit", e.target.value.replace(/\D/g, ""))} placeholder="100" />
              </Field>
              <Field label="Uses per mobile number" hint="0 = unlimited">
                <Input inputMode="numeric" value={form.per_mobile_limit} onChange={(e) => set("per_mobile_limit", e.target.value.replace(/\D/g, ""))} />
              </Field>
            </div>
          </Card>
          <Card title="Settings">
            <div className="space-y-4">
              <Toggle checked={form.is_active} onChange={(v) => set("is_active", v)} label="Active" />
              <Toggle checked={form.is_public} onChange={(v) => set("is_public", v)} label="Show in offers list on summary page" />
              {!form.is_public && <p className="text-xs text-slate-500">Hidden coupons still work when the customer types the code.</p>}
            </div>
          </Card>
        </aside>
      </div>
      <SaveBar formId="coupon-form" saving={saving} label={id ? "Save coupon" : "Add coupon"} onCancel={() => navigate("/tour-coupons")} />
    </form>
  );
}
