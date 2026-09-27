import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import api from "../lib/api";
import useOptions from "../hooks/useOptions";
import { Button, Card, Input, Loading, PageHeader, Select } from "../components/ui";
import { BackLink, SaveBar } from "../components/FormBits";
import { useToast } from "../components/Toast";

export default function CityLimits() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: vehicles } = useOptions("/vehicles");
  const [city, setCity] = useState(null);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/booking_limit/${id}`).then((r) => {
      setCity(r.data);
      setRows((r.data.booking_limits || []).map(({ id, vehicle_id, limit_date, max_limit }) => ({ id, vehicle_id, limit_date: String(limit_date).slice(0, 10), max_limit })));
    }).catch((e) => setError(e.message));
  }, [id]);

  const setRow = (i, k, v) => setRows(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));

  const submit = async (e) => {
    e.preventDefault();
    const bad = rows.findIndex((r) => !r.vehicle_id || !r.limit_date || !(Number(r.max_limit) >= 1));
    if (bad !== -1) return toast.error(`Row ${bad + 1}: choose vehicle, date and a limit of at least 1`);
    const keys = rows.map((r) => `${r.vehicle_id}-${r.limit_date}`);
    if (new Set(keys).size !== keys.length) return toast.error("Same vehicle is listed twice for one date");
    setSaving(true);
    try {
      const r = await api.put(`/booking_limit/${id}`, {
        id: Number(id),
        booking_limits: rows.map((r) => ({ ...(r.id ? { id: r.id } : {}), vehicle_id: Number(r.vehicle_id), limit_date: r.limit_date, max_limit: Number(r.max_limit) })),
      });
      toast.success(r.message);
      navigate("/cities");
    } catch (err) { toast.error(err); } finally { setSaving(false); }
  };

  if (error) return <Card><p className="text-sm text-red-600">{error}</p></Card>;
  if (!city) return <Loading />;

  return (
    <form id="limits-form" onSubmit={submit}>
      <PageHeader back={<BackLink to="/cities">Cities</BackLink>} title={`Date limits · ${city.name}`} subtitle="Override the daily booking limit for busy dates, festivals or holidays." />
      <Card title="Limits by date" actions={<Button type="button" size="sm" variant="outline" icon={Plus} onClick={() => setRows([...rows, { vehicle_id: "", limit_date: "", max_limit: 1 }])}>Add date</Button>}>
        {rows.length === 0 ? (
          <p className="text-sm text-slate-500">No date-specific limits. The city's default limits apply every day.</p>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-[1.4fr_1fr_110px_32px] gap-3 text-xs font-medium text-slate-500"><span>Vehicle</span><span>Date</span><span>Max bookings</span></div>
            {rows.map((r, i) => (
              <div key={r.id || `n${i}`} className="grid grid-cols-[1.4fr_1fr_110px_32px] items-center gap-3">
                <Select value={r.vehicle_id} onChange={(e) => setRow(i, "vehicle_id", e.target.value)} placeholder="Choose vehicle" options={vehicles.map((v) => ({ value: v.id, label: v.title }))} />
                <Input type="date" value={r.limit_date} onChange={(e) => setRow(i, "limit_date", e.target.value)} />
                <Input inputMode="numeric" value={r.max_limit} onChange={(e) => setRow(i, "max_limit", e.target.value.replace(/\D/g, ""))} />
                <Button type="button" variant="ghost" size="icon" onClick={() => setRows(rows.filter((_, j) => j !== i))} aria-label="Remove"><Trash2 className="size-4 text-red-600" /></Button>
              </div>
            ))}
          </div>
        )}
      </Card>
      <SaveBar formId="limits-form" saving={saving} label="Save limits" onCancel={() => navigate("/cities")} />
    </form>
  );
}
