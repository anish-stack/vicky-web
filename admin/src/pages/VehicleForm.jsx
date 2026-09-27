import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import api, { fileUrl } from "../lib/api";
import { clearOptions } from "../hooks/useOptions";
import { Button, Card, Field, Input, Loading, PageHeader, Textarea, Toggle } from "../components/ui";
import { BackLink, SaveBar } from "../components/FormBits";
import { useToast } from "../components/Toast";

const blank = {
  title: "", priceperkm: "", minimum_price: "", minimum_price_range: "", extra_fare_km: "", driver_expences: "",
  additional_time_charge: "0", perdaystatetaxcharges: "0", passengers: "", large_size_bag: "", medium_size_bag: "", hand_bag: "",
  fuelcharges: false, drivercharges: false, nightcharges: false, parkingcharges: false, ac_cab: true, luggage: false,
  terms: "", one_way_trip_pricings: [],
};
const BOOLS = [
  ["fuelcharges", "Fuel included"], ["drivercharges", "Driver allowance included"], ["nightcharges", "Night charges included"],
  ["parkingcharges", "Parking included"], ["ac_cab", "Air conditioned"], ["luggage", "Roof carrier"],
];
const REQUIRED = ["title", "priceperkm", "minimum_price", "minimum_price_range", "extra_fare_km", "driver_expences", "terms"];

export default function VehicleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(blank);
  const [image, setImage] = useState(null);
  const [current, setCurrent] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/vehicles/${id}`).then((r) => {
      const v = r.data;
      const next = { ...blank };
      Object.keys(blank).forEach((k) => { if (v[k] !== null && v[k] !== undefined) next[k] = typeof blank[k] === "boolean" ? !!v[k] : v[k]; });
      next.one_way_trip_pricings = (v.one_way_trip_pricings || []).map(({ from, to, price_per_km }) => ({ from, to, price_per_km }));
      setForm(next);
      setCurrent(v.image);
    }).catch((e) => toast.error(e)).finally(() => setLoading(false));
  }, [id, toast]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setSlab = (i, k, val) => setForm({ ...form, one_way_trip_pricings: form.one_way_trip_pricings.map((s, j) => (j === i ? { ...s, [k]: val } : s)) });
  const addSlab = () => {
    const last = form.one_way_trip_pricings.at(-1);
    const from = last ? Number(last.to) + 1 || "" : 0;
    setForm({ ...form, one_way_trip_pricings: [...form.one_way_trip_pricings, { from, to: "", price_per_km: "" }] });
  };

  const validate = () => {
    const e = {};
    REQUIRED.forEach((k) => { if (String(form[k] ?? "").trim() === "") e[k] = "Required"; });
    ["priceperkm", "minimum_price", "minimum_price_range", "additional_time_charge", "perdaystatetaxcharges"].forEach((k) => {
      if (form[k] !== "" && Number.isNaN(Number(form[k]))) e[k] = "Enter a number";
    });
    if (!id && !image) e.image = "Upload a vehicle image";
    form.one_way_trip_pricings.forEach((s, i) => {
      if (s.from === "" || s.to === "" || s.price_per_km === "") e[`slab${i}`] = "Fill from, to and rate";
      else if (Number(s.to) < Number(s.from)) e[`slab${i}`] = "'To' must be greater than 'from'";
    });
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return toast.error("Fix the highlighted fields");
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === "one_way_trip_pricings") return;
      if (v === "" || v === null || v === undefined) return;
      fd.append(k, typeof v === "boolean" ? String(v) : v);
    });
    fd.append("one_way_trip_pricings", JSON.stringify(form.one_way_trip_pricings.map((s) => ({ from: Number(s.from), to: Number(s.to), price_per_km: String(s.price_per_km) }))));
    if (image) fd.append("image", image);
    setSaving(true);
    try {
      const r = id ? await api.put(`/vehicles/${id}`, fd) : await api.post("/vehicles", fd);
      clearOptions("/vehicles");
      toast.success(r.message);
      navigate("/vehicles");
    } catch (e) { toast.error(e); } finally { setSaving(false); }
  };

  if (loading) return <Loading />;
  const num = (k, label, props = {}) => (
    <Field label={label} required={REQUIRED.includes(k)} error={errors[k]} hint={props.hint}>
      <Input inputMode="decimal" value={form[k]} onChange={set(k)} placeholder={props.placeholder} />
    </Field>
  );

  return (
    <form id="vehicle-form" onSubmit={submit}>
      <PageHeader back={<BackLink to="/vehicles">Vehicles</BackLink>} title={id ? `Edit ${form.title || "vehicle"}` : "Add vehicle"} />
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Card title="Basics">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" required error={errors.title} className="sm:col-span-2"><Input value={form.title} onChange={set("title")} placeholder="Sedan (Dzire, Etios or similar)" /></Field>
              {num("passengers", "Passengers")}
              {num("hand_bag", "Hand bags")}
              {num("large_size_bag", "Large bags")}
              {num("medium_size_bag", "Medium bags")}
            </div>
          </Card>
          <Card title="Fares">
            <div className="grid gap-4 sm:grid-cols-2">
              {num("priceperkm", "Rate per km (₹)")}
              {num("extra_fare_km", "Extra km rate (₹)", { hint: "Charged beyond the booked distance" })}
              {num("minimum_price", "Minimum fare (₹)")}
              {num("minimum_price_range", "Minimum fare covers (km)")}
              {num("driver_expences", "Driver allowance per day (₹)")}
              {num("additional_time_charge", "Extra hour charge (₹)")}
              {num("perdaystatetaxcharges", "State tax per day (₹)")}
            </div>
          </Card>
          <Card title="One-way distance slabs" actions={<Button type="button" size="sm" variant="outline" icon={Plus} onClick={addSlab}>Add slab</Button>}>
            {form.one_way_trip_pricings.length === 0 ? (
              <p className="text-sm text-slate-500">No slabs. One-way trips use the base rate per km.</p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-[1fr_1fr_1fr_32px] gap-3 text-xs font-medium text-slate-500"><span>From km</span><span>To km</span><span>Rate per km (₹)</span></div>
                {form.one_way_trip_pricings.map((s, i) => (
                  <div key={i}>
                    <div className="grid grid-cols-[1fr_1fr_1fr_32px] items-center gap-3">
                      <Input inputMode="numeric" value={s.from} onChange={(e) => setSlab(i, "from", e.target.value)} />
                      <Input inputMode="numeric" value={s.to} onChange={(e) => setSlab(i, "to", e.target.value)} />
                      <Input inputMode="decimal" value={s.price_per_km} onChange={(e) => setSlab(i, "price_per_km", e.target.value)} />
                      <Button type="button" variant="ghost" size="icon" onClick={() => setForm({ ...form, one_way_trip_pricings: form.one_way_trip_pricings.filter((_, j) => j !== i) })} aria-label="Remove slab"><Trash2 className="size-4 text-red-600" /></Button>
                    </div>
                    {errors[`slab${i}`] && <p className="mt-1 text-xs text-red-600">{errors[`slab${i}`]}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card title="Terms shown to customers">
            <Field error={errors.terms}><Textarea rows={6} value={form.terms} onChange={set("terms")} placeholder="One point per line" /></Field>
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Image">
            <div className="grid place-items-center rounded-lg border border-dashed border-stone-300 bg-stone-50 p-4">
              {image || current ? (
                <img src={image ? URL.createObjectURL(image) : fileUrl("vehicle", current)} alt="" className="h-36 object-contain" />
              ) : (
                <p className="py-10 text-sm text-slate-500">No image yet</p>
              )}
            </div>
            <Field error={errors.image} hint="JPG, PNG or WebP" className="mt-3">
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setImage(e.target.files?.[0] || null)} className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-road-800 file:px-3 file:py-2 file:text-sm file:text-white" />
            </Field>
          </Card>
          <Card title="Included in fare">
            <div className="space-y-3">
              {BOOLS.map(([k, l]) => <div key={k}><Toggle checked={form[k]} onChange={(v) => setForm({ ...form, [k]: v })} label={l} /></div>)}
            </div>
          </Card>
        </div>
      </div>
      <SaveBar formId="vehicle-form" saving={saving} label={id ? "Save vehicle" : "Add vehicle"} onCancel={() => navigate("/vehicles")} />
    </form>
  );
}
