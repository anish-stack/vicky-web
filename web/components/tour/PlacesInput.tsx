import { useEffect, useRef, useState } from "react";

export type PickedPlace = { address: string; lat: number; lng: number; placeId: string };

const KEY = process.env.GOOGLE_MAP_API_KEY || "";
let placesLib: Promise<any> | null = null;

function loadPlaces(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("ssr"));
  const w = window as any;
  if (placesLib) return placesLib;
  placesLib = new Promise<void>((resolve, reject) => {
    if (w.google?.maps?.importLibrary) return resolve();
    if (!KEY) return reject(new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY missing"));
    const cb = "__tsPlacesInit";
    w[cb] = () => resolve();
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&libraries=places&loading=async&region=IN&language=en&callback=${cb}`;
    s.async = true;
    s.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(s);
  })
    .then(() => w.google.maps.importLibrary("places"))
    .catch((e) => {
      placesLib = null;
      throw e;
    });
  return placesLib;
}

type Props = {
  value: string;
  onChange: (v: string) => void;
  onPick: (p: PickedPlace) => void;
  placeholder?: string;
  className?: string;
};

export default function PlacesInput({ value, onChange, onPick, placeholder, className = "" }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const lib = useRef<any>(null);
  const token = useRef<any>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const reqId = useRef(0);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPlaces()
      .then((l) => {
        lib.current = l;
        token.current = new l.AutocompleteSessionToken();
      })
      .catch(() => {
        /* no key / blocked -> plain text input still works */
      });
    const close = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      clearTimeout(timer.current);
    };
  }, []);

  const search = (q: string) => {
    clearTimeout(timer.current);
    if (q.trim().length < 3 || !lib.current) {
      reqId.current++;
      setItems([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    timer.current = setTimeout(async () => {
      const id = ++reqId.current;
      setLoading(true);
      try {
        const { suggestions } = await lib.current.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: q,
          sessionToken: token.current,
          includedRegionCodes: ["in"],
        });
        if (id !== reqId.current) return;
        const list = (suggestions || []).map((s: any) => s.placePrediction).filter(Boolean);
        setItems(list);
        setOpen(list.length > 0);
        setActive(-1);
      } catch {
        if (id === reqId.current) setItems([]);
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    }, 250);
  };

  const pick = async (p: any) => {
    setOpen(false);
    setItems([]);
    const label = p.text?.toString() || "";
    onChange(label);
    try {
      const place = p.toPlace();
      await place.fetchFields({ fields: ["location"] });
      if (place.location) onPick({ address: label, lat: place.location.lat(), lng: place.location.lng(), placeId: place.id });
    } catch {
      /* keep typed label */
    }
    if (lib.current) token.current = new lib.current.AutocompleteSessionToken();
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || !items.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? items.length - 1 : a - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      pick(items[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={box} className="relative">
    
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          search(e.target.value);
        }}
        onFocus={() => items.length && setOpen(true)}
        onKeyDown={onKey}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        className={className}
        style={{ paddingLeft: 36, paddingRight: 36 }}
      />
      {loading && (
        <span className="pointer-events-none absolute inset-y-0 right-0 flex w-9 items-center justify-center">
          <i className="fa-solid fa-circle-notch fa-spin text-[13px] text-slate-400" />
        </span>
      )}
      {open && (
        <ul role="listbox" className="absolute inset-x-0 top-full z-30 m-0 mt-1 max-h-72 list-none overflow-auto rounded-lg border border-slate-200 bg-white p-0 py-1 shadow-lg">
          {items.map((p, i) => (
            <li key={p.placeId || i} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(p)}
                onMouseEnter={() => setActive(i)}
                className={`flex w-full items-start gap-2.5 px-3 py-2 text-left ${i === active ? "bg-red-50" : "hover:bg-slate-50"}`}
              >
                <i className="fa-solid fa-location-dot mt-1 text-[12px] text-slate-400" />
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold text-slate-900">{p.mainText?.toString() || p.text?.toString()}</span>
                  {p.secondaryText && <span className="block truncate text-[12px] text-slate-500">{p.secondaryText.toString()}</span>}
                </span>
              </button>
            </li>
          ))}
          <li className="px-3 pb-0.5 pt-1 text-right text-[10px] text-slate-400">powered by Google</li>
        </ul>
      )}
    </div>
  );
}