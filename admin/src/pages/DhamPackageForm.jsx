import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import api, { fileUrl } from "../lib/api";
import useOptions from "../hooks/useOptions";
import { Button, Card, Field, Input, Loading, PageHeader, Select, Textarea } from "../components/ui";
import { BackLink, SaveBar } from "../components/FormBits";
import { useToast } from "../components/Toast";

const newCity = () => ({ name: "", days: "", dham_stops: [], prices: {} });

export default function DhamPackageForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: cats } = useOptions("/dham_category");
  const { data: vehicles } = useOptions("/vehicles");
  const [form, setForm] = useState({ name: "", dham_category_id: "", distance: "" });
  const [cities, setCities] = useState([newCity()]);
  const [image, setImage] = useState(null);
  const [current, setCurrent] = useState("");
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/dham_package/${id}`).then((r) => {
      const p = r.data;
      setForm({ name: p.name || "", dham_category_id: p.dham_category_id || "", distance: p.distance || "" });
      setCurrent(p.image);
      setCities((p.dham_pickup_cities || []).map((c) => ({
        id: c.id,
        name: c.name,
        days: c.days,
        dham_stops: (c.dham_stops || []).map(({ id, name, description }) => ({ id, name, description: description || "" })),
        prices: Object.fromEntries((c.dham_pricings || []).map((pr) => [pr.vehicle_id, { id: pr.id, price: pr.price, discount: pr.discount ?? 0 }])),
      })));
    }).catch((e) => toast.error(e)).finally(() => setLoading(false));
  }, [id, toast]);

  const setCity = (i, patch) => setCities(cities.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  const setStop = (ci, si, patch) => setCity(ci, { dham_stops: cities[ci].dham_stops.map((s, j) => (j === si ? { ...s, ...patch } : s)) });
  const setPrice = (ci, vid, patch) => setCity(ci, { prices: { ...cities[ci].prices, [vid]: { discount: 0, ...cities[ci].prices[vid], ...patch } } });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Enter the package name");
    if (!form.dham_category_id) return toast.error("Choose a category");
    if (!id && !image) return toast.error("Upload a package image");
    for (const [i, c] of cities.entries()) {
      if (!c.name.trim() || !(Number(c.days) > 0)) return toast.error(`Pickup city ${i + 1}: name and number of days are required`);
      if (c.dham_stops.some((s) => !s.name.trim())) return toast.error(`Pickup city ${i + 1}: every stop needs a name`);
      const priced = Object.values(c.prices).filter((p) => String(p.price ?? "").trim() !== "");
      if (!priced.length) return toast.error(`Pickup city ${i + 1}: add a fare for at least one vehicle`);
      if (priced.some((p) => Number.isNaN(Number(p.price)) || Number.isNaN(Number(p.discount || 0)))) return toast.error(`Pickup city ${i + 1}: fares and discounts must be numbers`);
    }
    const names = cities.map((c) => c.name.trim().toLowerCase());
    if (new Set(names).size !== names.length) return toast.error("Two pickup cities have the same name");

    const payload = cities.map((c) => ({
      ...(c.id ? { id: c.id } : {}),
      name: c.name.trim(),
      days: Number(c.days),
      dham_stops: c.dham_stops.map((s) => ({ ...(s.id ? { id: s.id } : {}), name: s.name.trim(), description: s.description })),
      dham_pricings: Object.entries(c.prices)
        .filter(([, p]) => String(p.price ?? "").trim() !== "")
        .map(([vehicle_id, p]) => ({ ...(p.id ? { id: p.id } : {}), vehicle_id: Number(vehicle_id), price: String(p.price), discount: Number(p.discount) || 0 })),
    }));

    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("dham_category_id", form.dham_category_id);
    fd.append("distance", form.distance);
    fd.append("dham_pickup_cities", JSON.stringify(payload));
    if (image) fd.append("image", image);
    setSaving(true);
    try {
      const r = id ? await api.put(`/dham_package/${id}`, fd) : await api.post("/dham_package", fd);
      toast.success(r.message);
      navigate("/dham/packages");
    } catch (e2) { toast.error(e2); } finally { setSaving(false); }
  };

  if (loading) return <Loading />;
  return (
    <form id="dham-form" onSubmit={submit}>
      <PageHeader back={<BackLink to="/dham/packages">Char Dham packages</BackLink>} title={id ? `Edit ${form.name || "package"}` : "Add package"} />
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card title="Package">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" required className="sm:col-span-2"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Kedarnath & Badrinath Yatra" /></Field>
            <Field label="Category" required><Select value={form.dham_category_id} onChange={(e) => setForm({ ...form, dham_category_id: e.target.value })} placeholder="Choose category" options={cats.map((c) => ({ value: c.id, label: c.name }))} /></Field>
            <Field label="Total distance (km)"><Input inputMode="decimal" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} /></Field>
          </div>
        </Card>
        <Card title="Image">
          <div className="flex items-center gap-4">
            {(image || current) && <img src={image ? URL.createObjectURL(image) : fileUrl("dham", current)} alt="" className="h-20 w-28 rounded-md object-cover" />}
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setImage(e.target.files?.[0] || null)} className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-road-800 file:px-3 file:py-2 file:text-sm file:text-white" />
          </div>
        </Card>
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-900">Pickup cities</h2>
      <div className="space-y-6">
        {cities.map((c, ci) => (
          <Card key={c.id || `n${ci}`} title={c.name || `Pickup city ${ci + 1}`}
            actions={cities.length > 1 && <Button type="button" variant="danger" size="sm" icon={Trash2} onClick={() => setCities(cities.filter((_, j) => j !== ci))}>Remove city</Button>}>
            <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
              <Field label="City name" required><Input value={c.name} onChange={(e) => setCity(ci, { name: e.target.value })} placeholder="Haridwar" /></Field>
              <Field label="Days" required><Input inputMode="numeric" value={c.days} onChange={(e) => setCity(ci, { days: e.target.value.replace(/\D/g, "") })} /></Field>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">Itinerary stops</p>
                  <Button type="button" size="sm" variant="ghost" icon={Plus} onClick={() => setCity(ci, { dham_stops: [...c.dham_stops, { name: "", description: "" }] })}>Add stop</Button>
                </div>
                {c.dham_stops.length === 0 && <p className="text-sm text-slate-500">No stops listed.</p>}
                <ol className="space-y-3">
                  {c.dham_stops.map((s, si) => (
                    <li key={s.id || `s${si}`} className="rounded-lg border border-stone-200 p-3">
                      <div className="flex items-center gap-2">
                        <span className="tnum w-6 text-sm text-slate-400">{si + 1}.</span>
                        <Input value={s.name} onChange={(e) => setStop(ci, si, { name: e.target.value })} placeholder="Stop name" />
                        <Button type="button" variant="ghost" size="icon" onClick={() => setCity(ci, { dham_stops: c.dham_stops.filter((_, j) => j !== si) })} aria-label="Remove stop"><Trash2 className="size-4 text-red-600" /></Button>
                      </div>
                      <Textarea className="mt-2 min-h-16" value={s.description} onChange={(e) => setStop(ci, si, { description: e.target.value })} placeholder="What happens on this stop (optional)" />
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Fares by vehicle</p>
                <div className="grid grid-cols-[1fr_100px_80px] gap-2 text-xs text-slate-500"><span>Vehicle</span><span>Fare (₹)</span><span>Discount %</span></div>
                <div className="mt-1 space-y-2">
                  {vehicles.map((v) => (
                    <div key={v.id} className="grid grid-cols-[1fr_100px_80px] items-center gap-2">
                      <span className="truncate text-sm">{v.title}</span>
                      <Input inputMode="decimal" value={c.prices[v.id]?.price ?? ""} onChange={(e) => setPrice(ci, v.id, { price: e.target.value })} />
                      <Input inputMode="decimal" value={c.prices[v.id]?.discount ?? ""} onChange={(e) => setPrice(ci, v.id, { discount: e.target.value })} disabled={!String(c.prices[v.id]?.price ?? "").trim()} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
        <Button type="button" variant="outline" icon={Plus} onClick={() => setCities([...cities, newCity()])}>Add pickup city</Button>
      </div>
      <SaveBar formId="dham-form" saving={saving} label={id ? "Save package" : "Add package"} onCancel={() => navigate("/dham/packages")} />
    </form>
  );
}
