import { useEffect, useState } from "react";
import { Plus, Trash2, ArrowLeftRight } from "lucide-react";
import api from "../lib/api";
import useOptions from "../hooks/useOptions";
import { Button, Card, Field, Input, Loading, PageHeader, Select, Toggle } from "../components/ui";
import PlaceSearch from "../components/PlaceSearch";
import { SaveBar } from "../components/FormBits";
import { useToast } from "../components/Toast";

const MODES = {
  oneWay: {
    title: "One way discounts",
    subtitle: "Discounts on one-way drops between two cities.",
    defaultTitle: "One Way Discount",
    tripTypes: [["oneWay", "One way"]],
    location: "pair",
  },
  roundTrip: {
    title: "Round trip discounts",
    subtitle: "Discounts on round trips that start from a city.",
    defaultTitle: "Round Trip Discount",
    tripTypes: [["roundTrip", "Round trip"]],
    location: "pickup",
  },
  local_airport: {
    title: "Local & airport discounts",
    subtitle: "Discounts on local rentals and airport transfers per service city.",
    defaultTitle: "Local / Airport Discount",
    tripTypes: [["local", "Local rental"], ["airport", "Airport transfer"]],
    location: "city",
  },
};

const blankRule = () => ({ pickup_city_name: "", pickup_city_place_id: "", drop_city_name: "", drop_city_place_id: "", is_bidirectional: false, city_id: "", disc: {} });

const fromApi = (city) => ({
  pickup_city_name: city.pickup_city_name || "",
  pickup_city_place_id: city.pickup_city_place_id || "",
  drop_city_name: city.drop_city_name || "",
  drop_city_place_id: city.drop_city_place_id || "",
  is_bidirectional: !!city.is_bidirectional,
  city_id: city.city_id ? String(city.city_id) : "",
  disc: Object.fromEntries(
    (city.discount_trip_types || []).map((t) => [t.trip_type, Object.fromEntries((t.discount_vehicles || []).map((v) => [v.vehicle_id, v.discount ?? ""]))])
  ),
});

export default function Discounts({ mode }) {
  const cfg = MODES[mode];
  const toast = useToast();
  const { data: vehicles } = useOptions("/vehicles");
  const { data: cities } = useOptions("/cities");
  const [meta, setMeta] = useState(null);
  const [rules, setRules] = useState([]);
  const [step, setStep] = useState("5");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMeta(null);
    api.get("/discount", { params: { slug: mode } })
      .then((r) => {
        const d = r.data;
        setMeta({ title: d.title || cfg.defaultTitle, overall_discount: d.overall_discount ?? 0, apply_overall_discount: !!d.apply_overall_discount, apply_citywise_discount: !!d.apply_citywise_discount });
        setRules((d.discount_cities || []).map(fromApi));
      })
      .catch(() => {
        setMeta({ title: cfg.defaultTitle, overall_discount: 0, apply_overall_discount: false, apply_citywise_discount: false });
        setRules([]);
      });
  }, [mode, cfg.defaultTitle]);

  const setRule = (i, patch) => setRules(rules.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const setDisc = (i, tt, vid, val) => setRule(i, { disc: { ...rules[i].disc, [tt]: { ...(rules[i].disc[tt] || {}), [vid]: val } } });

  const bulk = (sign) => {
    const n = Number(step);
    if (!(n > 0)) return toast.error("Enter a step above 0");
    setRules(rules.map((r) => ({
      ...r,
      disc: Object.fromEntries(Object.entries(r.disc).map(([tt, m]) => [tt, Object.fromEntries(Object.entries(m).map(([vid, v]) => [vid, String(v).trim() === "" ? v : String(Math.min(99, Math.max(0, Number(v) + sign * n)))]))])),
    })));
    toast.success(`${sign > 0 ? "Raised" : "Lowered"} every vehicle discount by ${n}%. Save to apply.`);
  };

  const validate = () => {
    const o = Number(meta.overall_discount);
    if (Number.isNaN(o) || o < 0 || o > 99) return "Overall discount must be between 0 and 99";
    const keys = new Set();
    for (const [i, r] of rules.entries()) {
      const n = `Rule ${i + 1}`;
      if (cfg.location === "pair" && (!r.pickup_city_place_id || !r.drop_city_place_id)) return `${n}: choose pickup and drop cities from the suggestions`;
      if (cfg.location === "pickup" && !r.pickup_city_place_id) return `${n}: choose a city from the suggestions`;
      if (cfg.location === "city" && !r.city_id) return `${n}: choose a city`;
      const key = cfg.location === "city" ? r.city_id : `${r.pickup_city_place_id}-${r.drop_city_place_id}`;
      if (keys.has(key)) return `${n}: the same city is already listed`;
      keys.add(key);
      for (const m of Object.values(r.disc)) {
        for (const v of Object.values(m)) {
          if (String(v).trim() === "") continue;
          const x = Number(v);
          if (Number.isNaN(x) || x < 0 || x > 99) return `${n}: discounts must be between 0 and 99`;
        }
      }
    }
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);
    const cityName = (id) => cities.find((c) => String(c.id) === String(id))?.name || "";
    const body = {
      slug: mode,
      title: meta.title.trim() || cfg.defaultTitle,
      overall_discount: Number(meta.overall_discount) || 0,
      apply_overall_discount: meta.apply_overall_discount,
      apply_citywise_discount: meta.apply_citywise_discount,
      discount_cities: rules.map((r) => ({
        pickup_city_name: cfg.location === "city" ? cityName(r.city_id) : r.pickup_city_name,
        pickup_city_place_id: cfg.location === "city" ? "" : r.pickup_city_place_id,
        drop_city_name: cfg.location === "pair" ? r.drop_city_name : "",
        drop_city_place_id: cfg.location === "pair" ? r.drop_city_place_id : "",
        is_bidirectional: cfg.location === "pair" ? r.is_bidirectional : false,
        city_id: cfg.location === "city" ? Number(r.city_id) : null,
        discount_trip_types: cfg.tripTypes.map(([tt]) => ({
          trip_type: tt,
          discount_vehicles: Object.entries(r.disc[tt] || {})
            .filter(([, v]) => String(v).trim() !== "")
            .map(([vehicle_id, v]) => ({ vehicle_id: Number(vehicle_id), discount: Number(v) })),
        })).filter((t) => t.discount_vehicles.length),
      })),
    };
    setSaving(true);
    try {
      const r = await api.post("/discount", body);
      toast.success(r.message);
    } catch (e2) { toast.error(e2); } finally { setSaving(false); }
  };

  if (!meta) return <Loading />;

  return (
    <form id="discount-form" onSubmit={submit}>
      <PageHeader title={cfg.title} subtitle={cfg.subtitle} />
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card title="How discounts apply">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Internal name"><Input value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} /></Field>
            <Field label="Overall discount (%)" hint="Applies to every booking of this type"><Input inputMode="decimal" value={meta.overall_discount} onChange={(e) => setMeta({ ...meta, overall_discount: e.target.value })} /></Field>
            <Toggle checked={meta.apply_overall_discount} onChange={(v) => setMeta({ ...meta, apply_overall_discount: v })} label="Apply overall discount" />
            <Toggle checked={meta.apply_citywise_discount} onChange={(v) => setMeta({ ...meta, apply_citywise_discount: v })} label="Apply city-wise discounts below" />
          </div>
        </Card>
        <Card title="Adjust all city discounts">
          <p className="mb-3 text-sm text-slate-500">Shift every filled-in vehicle discount below up or down at once.</p>
          <div className="flex items-end gap-2">
            <Field label="Step (%)" className="w-28"><Input inputMode="decimal" value={step} onChange={(e) => setStep(e.target.value)} /></Field>
            <Button type="button" variant="outline" onClick={() => bulk(1)}>Raise</Button>
            <Button type="button" variant="outline" onClick={() => bulk(-1)}>Lower</Button>
          </div>
        </Card>
      </div>

      <div className="mb-3 mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">City-wise discounts ({rules.length})</h2>
        <Button type="button" variant="outline" icon={Plus} onClick={() => setRules([blankRule(), ...rules])}>Add city</Button>
      </div>
      {rules.length === 0 && <Card><p className="text-sm text-slate-500">No city-wise discounts yet.</p></Card>}
      <div className="space-y-4">
        {rules.map((r, i) => (
          <Card key={i} bodyClass="p-0">
            <div className="flex flex-wrap items-end gap-3 border-b border-stone-200 p-4">
              {cfg.location === "city" ? (
                <Field label="City" className="w-full max-w-xs">
                  <Select value={r.city_id} onChange={(e) => setRule(i, { city_id: e.target.value })} placeholder="Choose city" options={cities.map((c) => ({ value: String(c.id), label: c.name }))} />
                </Field>
              ) : (
                <>
                  <Field label={cfg.location === "pair" ? "Pickup city" : "City"} className="w-full sm:flex-1">
                    <PlaceSearch value={r.pickup_city_name} placeId={r.pickup_city_place_id} onChange={(p) => setRule(i, { pickup_city_name: p.name, pickup_city_place_id: p.place_id })} />
                  </Field>
                  {cfg.location === "pair" && (
                    <>
                      <ArrowLeftRight className={`mb-3 hidden size-4 sm:block ${r.is_bidirectional ? "text-brand-500" : "text-slate-300"}`} />
                      <Field label="Drop city" className="w-full sm:flex-1">
                        <PlaceSearch value={r.drop_city_name} placeId={r.drop_city_place_id} onChange={(p) => setRule(i, { drop_city_name: p.name, drop_city_place_id: p.place_id })} />
                      </Field>
                    </>
                  )}
                </>
              )}
              <Button type="button" variant="ghost" size="icon" className="mb-1 ml-auto" onClick={() => setRules(rules.filter((_, j) => j !== i))} aria-label="Remove rule"><Trash2 className="size-4 text-red-600" /></Button>
              {cfg.location === "pair" && (
                <div className="w-full"><Toggle checked={r.is_bidirectional} onChange={(v) => setRule(i, { is_bidirectional: v })} label="Also apply on the return direction" /></div>
              )}
            </div>
            <div className={`grid gap-6 p-4 ${cfg.tripTypes.length > 1 ? "md:grid-cols-2" : ""}`}>
              {cfg.tripTypes.map(([tt, label]) => (
                <div key={tt}>
                  {cfg.tripTypes.length > 1 && <p className="mb-2 text-sm font-medium text-slate-700">{label}</p>}
                  <div className={`grid gap-x-6 gap-y-2 ${cfg.tripTypes.length > 1 ? "" : "sm:grid-cols-2 xl:grid-cols-3"}`}>
                    {vehicles.map((v) => (
                      <label key={v.id} className="grid grid-cols-[1fr_90px] items-center gap-3 text-sm">
                        <span className="truncate">{v.title}</span>
                        <div className="relative">
                          <Input inputMode="decimal" className="pr-7" placeholder="—" value={r.disc[tt]?.[v.id] ?? ""} onChange={(e) => setDisc(i, tt, v.id, e.target.value)} />
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <SaveBar formId="discount-form" saving={saving} label="Save discounts" />
    </form>
  );
}
