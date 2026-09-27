import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import api from "../lib/api";
import { Input, Spinner } from "./ui";

/** Google Places city search through the API proxy (/map/autocompletecity). */
export default function PlaceSearch({ value, placeId, onChange, placeholder = "Search city" }) {
  const [q, setQ] = useState(value || "");
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);
  const typed = useRef(false);

  useEffect(() => { setQ(value || ""); }, [value]);

  useEffect(() => {
    if (!typed.current || q.trim().length < 2) { setItems([]); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await api.get("/map/autocompletecity", { params: { query: q.trim(), city: 1 } });
        setItems(res.predictions || []);
        setOpen(true);
      } catch { setItems([]); } finally { setLoading(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const close = (e) => boxRef.current && !boxRef.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={boxRef} className="relative">
      <MapPin className={`pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 ${placeId ? "text-brand-500" : "text-slate-400"}`} />
      <Input
        className="pl-9"
        value={q}
        placeholder={placeholder}
        onChange={(e) => { typed.current = true; setQ(e.target.value); if (placeId) onChange({ name: "", place_id: "" }); }}
        onFocus={() => items.length && setOpen(true)}
      />
      {loading && <Spinner className="absolute right-3 top-1/2 size-4 -translate-y-1/2" />}
      {open && items.length > 0 && (
        <ul className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-stone-200 bg-white py-1 shadow-lg">
          {items.map((p) => (
            <li key={p.place_id}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-stone-100"
                onClick={() => { typed.current = false; setQ(p.description); setOpen(false); onChange({ name: p.description, place_id: p.place_id }); }}
              >
                {p.description}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
