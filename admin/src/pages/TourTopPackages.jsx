import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import api from "../lib/api";
import { Button, Card, Loading, PageHeader, Select } from "../components/ui";
import { BackLink } from "../components/FormBits";
import { useToast } from "../components/Toast";
import { TOUR_API } from "./TourPackageForm";

const LIMIT = 3;

const TABS = [
  { key: "taxi", title: "Taxi tab", hint: "Shown on the Taxi home page" },
  { key: "chardham", title: "Char Dham Yatra tab", hint: "Shown on the Char Dham Yatra home page" },
];

function TopPicker({ tab, tours, ids, onChange, onSave, saving, dirty }) {
  const mine = useMemo(() => tours.filter((t) => (t.category === "chardham" ? "chardham" : "taxi") === tab.key), [tours, tab.key]);
  const byId = useMemo(() => new Map(tours.map((t) => [Number(t.id), t])), [tours]);

  const setAt = (i, v) => {
    const next = [...ids];
    if (v === "") next.splice(i, 1);
    else next[i] = Number(v);
    onChange([...new Set(next)].slice(0, LIMIT));
  };
  const move = (i, to) => {
    const next = [...ids];
    const [x] = next.splice(i, 1);
    next.splice(to, 0, x);
    onChange(next);
  };

  return (
    <Card title={tab.title}>
      <p className="mb-4 text-xs text-slate-500">{tab.hint}. Choose up to {LIMIT} tours; the order here is the order on the website.</p>
      <div className="space-y-3">
        {Array.from({ length: LIMIT }).map((_, i) => {
          const id = ids[i];
          const taken = new Set(ids.filter((_, j) => j !== i));
          const options = mine
            .filter((t) => !taken.has(Number(t.id)))
            .map((t) => ({ value: String(t.id), label: `${t.title}${t.is_active ? "" : " (inactive)"}` }));
          // keep a selected tour visible even if its category changed afterwards
          if (id && !options.some((o) => o.value === String(id))) {
            const t = byId.get(id);
            options.unshift({ value: String(id), label: `${t?.title || `Tour #${id}`} (check category)` });
          }
          const locked = i > ids.length; // fill slots in order
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-red-50 text-sm font-bold text-red-600">{i + 1}</span>
              <Select
                className="min-w-0 flex-1"
                value={id ? String(id) : ""}
                disabled={locked}
                onChange={(e) => setAt(i, e.target.value)}
                placeholder={locked ? "Fill the previous slot first" : "Select a tour package"}
                options={options}
              />
              <Button variant="ghost" size="icon" disabled={!id || i === 0} onClick={() => move(i, i - 1)} aria-label="Move up"><ArrowUp className="size-4" /></Button>
              <Button variant="ghost" size="icon" disabled={!id || i >= ids.length - 1} onClick={() => move(i, i + 1)} aria-label="Move down"><ArrowDown className="size-4" /></Button>
              <Button variant="ghost" size="icon" disabled={!id} onClick={() => setAt(i, "")} aria-label="Clear slot"><X className="size-4 text-red-600" /></Button>
            </div>
          );
        })}
      </div>
      {mine.length === 0 && (
        <p className="mt-3 text-sm text-amber-700">
          No tours are marked for this tab yet. Open a tour and set <b>Website tab</b> in “Status &amp; visibility”.
        </p>
      )}
      {ids.length === 0 && mine.length > 0 && (
        <p className="mt-3 text-xs text-slate-500">Nothing selected: the website falls back to the featured ★ tours of this tab.</p>
      )}
      <div className="mt-4 flex justify-end">
        <Button onClick={onSave} loading={saving} disabled={!dirty}>Save {tab.key === "taxi" ? "Taxi" : "Char Dham"} top {LIMIT}</Button>
      </div>
    </Card>
  );
}

export default function TourTopPackages() {
  const toast = useToast();
  const [tours, setTours] = useState([]);
  const [saved, setSaved] = useState({ taxi: [], chardham: [] });
  const [ids, setIds] = useState({ taxi: [], chardham: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all([api.get(`${TOUR_API}?all=1&is_active=1`), api.get(`${TOUR_API}/top-settings`)])
      .then(([t, s]) => {
        if (!alive) return;
        const rows = (t.data || []).filter((x) => x.status !== "duplicate");
        const cur = { taxi: s.data?.taxi || [], chardham: s.data?.chardham || [] };
        setTours(rows);
        setSaved(cur);
        setIds(cur);
      })
      .catch((e) => toast.error(e))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async (key) => {
    setSaving(key);
    try {
      const r = await api.put(`${TOUR_API}/top`, { category: key, ids: ids[key] });
      toast.success(r?.message || "Saved");
      setSaved((s) => ({ ...s, [key]: ids[key] }));
    } catch (e) {
      toast.error(e);
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <>
      <PageHeader
        back={<BackLink to="/tour-packages">Tour packages</BackLink>}
        title="Top 3 tour packages on home"
        subtitle="Choose which 3 tours the website shows under each tab, and their order. “View all” opens the rest of that tab."
        actions={<Link to="/tour-packages"><Button variant="outline">Tour list</Button></Link>}
      />
      <div className="grid gap-6 xl:grid-cols-2">
        {TABS.map((tab) => (
          <TopPicker
            key={tab.key}
            tab={tab}
            tours={tours}
            ids={ids[tab.key]}
            onChange={(v) => setIds((s) => ({ ...s, [tab.key]: v }))}
            onSave={() => save(tab.key)}
            saving={saving === tab.key}
            dirty={JSON.stringify(ids[tab.key]) !== JSON.stringify(saved[tab.key])}
          />
        ))}
      </div>
    </>
  );
}
