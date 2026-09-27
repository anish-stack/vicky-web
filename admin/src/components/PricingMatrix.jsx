import { Plus, Trash2 } from "lucide-react";
import { Button, Input, Select } from "./ui";

/** flat [{id, city_id, vehicle_id, price}] -> [{city_id, prices: {vehicle_id: {id, price}}}] */
export const toGroups = (flat = []) => {
  const map = new Map();
  flat.forEach((p) => {
    const key = String(p.city_id);
    if (!map.has(key)) map.set(key, { city_id: key, prices: {} });
    map.get(key).prices[p.vehicle_id] = { id: p.id, price: p.price ?? "" };
  });
  return [...map.values()];
};

/** Back to the flat array the API expects. Blank prices are skipped. */
export const fromGroups = (groups) =>
  groups.flatMap((g) =>
    Object.entries(g.prices)
      .filter(([, v]) => String(v.price ?? "").trim() !== "")
      .map(([vehicle_id, v]) => ({ ...(v.id ? { id: v.id } : {}), city_id: Number(g.city_id), vehicle_id: Number(vehicle_id), price: String(v.price) }))
  );

export const validateGroups = (groups) => {
  const ids = groups.map((g) => g.city_id);
  if (ids.some((c) => !c)) return "Choose a city for every pricing block";
  if (new Set(ids).size !== ids.length) return "A city is listed twice";
  for (const g of groups) {
    for (const v of Object.values(g.prices)) {
      if (String(v.price ?? "").trim() !== "" && Number.isNaN(Number(v.price))) return "Prices must be numbers";
    }
  }
  return null;
};

export default function PricingMatrix({ groups, onChange, cities, vehicles, priceLabel = "Fare (₹)" }) {
  const update = (i, next) => onChange(groups.map((g, j) => (j === i ? next : g)));
  const used = new Set(groups.map((g) => String(g.city_id)));
  return (
    <div className="space-y-4">
      {groups.length === 0 && <p className="text-sm text-slate-500">No cities priced yet. Customers can't book this until at least one city has fares.</p>}
      {groups.map((g, i) => (
        <div key={i} className="rounded-lg border border-stone-200">
          <div className="flex items-center gap-3 border-b border-stone-200 bg-stone-50 px-4 py-2.5">
            <Select
              className="max-w-xs"
              value={g.city_id}
              onChange={(e) => update(i, { ...g, city_id: e.target.value })}
              placeholder="Choose city"
              options={cities.filter((c) => String(c.id) === String(g.city_id) || !used.has(String(c.id))).map((c) => ({ value: String(c.id), label: c.name }))}
            />
            <span className="flex-1 text-xs text-slate-500">Leave a fare empty if that vehicle isn't offered here.</span>
            <Button type="button" variant="ghost" size="icon" onClick={() => onChange(groups.filter((_, j) => j !== i))} aria-label="Remove city"><Trash2 className="size-4 text-red-600" /></Button>
          </div>
          <div className="grid gap-x-6 gap-y-2 p-4 sm:grid-cols-2">
            {vehicles.map((v) => (
              <label key={v.id} className="grid grid-cols-[1fr_120px] items-center gap-3 text-sm">
                <span className="truncate">{v.title}</span>
                <Input
                  inputMode="decimal"
                  placeholder={priceLabel}
                  value={g.prices[v.id]?.price ?? ""}
                  onChange={(e) => update(i, { ...g, prices: { ...g.prices, [v.id]: { ...g.prices[v.id], price: e.target.value } } })}
                />
              </label>
            ))}
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" icon={Plus} onClick={() => onChange([...groups, { city_id: "", prices: {} }])}>Add city</Button>
    </div>
  );
}
