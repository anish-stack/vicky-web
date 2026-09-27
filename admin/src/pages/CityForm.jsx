import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, Upload } from "lucide-react";
import api, { API_ORIGIN } from "../lib/api";
import useOptions, { clearOptions } from "../hooks/useOptions";
import { Button, Card, Field, Input, Loading, PageHeader, Select, Toggle } from "../components/ui";
import { BackLink, SaveBar } from "../components/FormBits";
import { useToast } from "../components/Toast";

export default function CityForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const fileRef = useRef(null);
  const { data: airports } = useOptions("/airport?items_per_page=1000");
  const { data: vehicles, loading: vLoading } = useOptions("/vehicles");
  const [form, setForm] = useState({ name: "", airport_id: "", distance: "", hotel: false });
  const [pincodes, setPincodes] = useState([]);
  const [limits, setLimits] = useState({}); // vehicle_id -> max_limit
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  const load = () =>
    api.get(`/cities/${id}`).then((r) => {
      const c = r.data;
      setForm({ name: c.name, airport_id: c.airport_id || "", distance: c.distance ?? "", hotel: !!c.hotel });
      setPincodes((c.Pincodes || []).map(({ id, pincode, area_name }) => ({ id, pincode: String(pincode), area_name })));
      setLimits(Object.fromEntries((c.booking_limits || []).map((b) => [b.vehicle_id, b.max_limit])));
    }).catch((e) => toast.error(e)).finally(() => setLoading(false));

  useEffect(() => { if (id) load(); /* eslint-disable-next-line */ }, [id]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (form.airport_id && (form.distance === "" || Number.isNaN(Number(form.distance)))) e.distance = "Enter distance in km";
    const seen = new Set();
    pincodes.forEach((p, i) => {
      if (!/^\d{6}$/.test(p.pincode)) e[`pin${i}`] = "Pincode must be 6 digits";
      else if (!p.area_name.trim()) e[`pin${i}`] = "Area name is required";
      else if (seen.has(p.pincode)) e[`pin${i}`] = "Duplicate pincode";
      seen.add(p.pincode);
    });
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return toast.error("Fix the highlighted fields");
    const body = {
      name: form.name.trim(),
      airport_id: form.airport_id ? Number(form.airport_id) : null,
      distance: form.airport_id ? Number(form.distance) : 0,
      hotel: form.hotel,
      Pincodes: pincodes.map((p) => ({ ...(p.id ? { id: p.id } : {}), pincode: p.pincode, area_name: p.area_name.trim() })),
      booking_limits: vehicles.map((v) => ({ vehicle_id: v.id, max_limit: Number(limits[v.id]) || 0 })),
    };
    setSaving(true);
    try {
      const r = id ? await api.put(`/cities/${id}`, body) : await api.post("/cities", body);
      clearOptions("/cities");
      toast.success(r.message);
      navigate("/cities");
    } catch (e) { toast.error(e); } finally { setSaving(false); }
  };

  const importFile = async (file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    setImporting(true);
    try {
      const r = await api.post(`/cities/import-pincodes/${id}`, fd);
      toast.success(r.message);
      if (r.errorFile) window.open(`${API_ORIGIN}${r.errorFile}`, "_blank");
      load();
    } catch (e) { toast.error(e); } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  if (loading) return <Loading />;
  const setPin = (i, k, v) => setPincodes(pincodes.map((p, j) => (j === i ? { ...p, [k]: v } : p)));

  return (
    <form id="city-form" onSubmit={submit}>
      <PageHeader back={<BackLink to="/cities">Cities</BackLink>} title={id ? `Edit ${form.name || "city"}` : "Add city"} />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-6">
          <Card title="City">
            <div className="space-y-4">
              <Field label="Name" required error={errors.name}><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Nearest airport" hint="Leave empty if the city has no airport transfers">
                <Select value={form.airport_id} onChange={(e) => setForm({ ...form, airport_id: e.target.value })} placeholder="No airport" options={airports.map((a) => ({ value: a.id, label: a.name }))} />
              </Field>
              {form.airport_id && (
                <Field label="Distance to airport (km)" required error={errors.distance}><Input inputMode="decimal" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} /></Field>
              )}
              <Toggle checked={form.hotel} onChange={(v) => setForm({ ...form, hotel: v })} label="Show in hotel booking" />
            </div>
          </Card>
          <Card title="Daily booking limit per vehicle">
            <p className="mb-4 text-sm text-slate-500">Maximum bookings per day from this city. Leave 0 for no limit. Set limits for specific dates from the city list.</p>
            {vLoading ? <Loading /> : (
              <div className="space-y-2">
                {vehicles.map((v) => (
                  <div key={v.id} className="grid grid-cols-[1fr_100px] items-center gap-3">
                    <span className="text-sm">{v.title}</span>
                    <Input inputMode="numeric" value={limits[v.id] ?? 0} onChange={(e) => setLimits({ ...limits, [v.id]: e.target.value.replace(/\D/g, "") })} aria-label={`Limit for ${v.title}`} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
        <Card
          title={`Pincodes (${pincodes.length})`}
          actions={
            <>
              {id && (
                <>
                  <a href={`${API_ORIGIN}/sample_import/sample_citywise_pincode_import.xlsx`} className="text-sm text-brand-600 hover:underline">Sample file</a>
                  <input ref={fileRef} type="file" accept=".xlsx,.xls" hidden onChange={(e) => importFile(e.target.files?.[0])} />
                  <Button type="button" size="sm" variant="outline" icon={Upload} loading={importing} onClick={() => fileRef.current?.click()}>Import Excel</Button>
                </>
              )}
              <Button type="button" size="sm" variant="outline" icon={Plus} onClick={() => setPincodes([{ pincode: "", area_name: "" }, ...pincodes])}>Add pincode</Button>
            </>
          }
        >
          {!id && <p className="mb-3 text-xs text-slate-500">Excel import is available after the city is saved.</p>}
          {pincodes.length === 0 ? (
            <p className="text-sm text-slate-500">No pincodes. Customers are matched to this city by pincode, so add the ones you serve.</p>
          ) : (
            <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
              {pincodes.map((p, i) => (
                <div key={p.id || `n${i}`}>
                  <div className="grid grid-cols-[110px_1fr_32px] gap-2">
                    <Input inputMode="numeric" maxLength={6} placeholder="Pincode" value={p.pincode} onChange={(e) => setPin(i, "pincode", e.target.value.replace(/\D/g, ""))} />
                    <Input placeholder="Area name" value={p.area_name} onChange={(e) => setPin(i, "area_name", e.target.value)} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => setPincodes(pincodes.filter((_, j) => j !== i))} aria-label="Remove"><Trash2 className="size-4 text-red-600" /></Button>
                  </div>
                  {errors[`pin${i}`] && <p className="mt-1 text-xs text-red-600">{errors[`pin${i}`]}</p>}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
      <SaveBar formId="city-form" saving={saving} label={id ? "Save city" : "Add city"} onCancel={() => navigate("/cities")} />
    </form>
  );
}
