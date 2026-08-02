import { useEffect, useRef, useState } from "react";
import { request } from "@/lib/api";

type Suggestion = { label: string; value: string };

/**
 * Autocomplete backed by the API's Google Maps proxy, so the Maps key
 * never reaches the browser.
 */
export default function PlaceInput({
  value,
  onSelect,
  placeholder,
  icon,
  citiesOnly = false,
  id,
}: {
  value?: Suggestion | null;
  onSelect: (s: Suggestion | null) => void;
  placeholder: string;
  icon?: React.ReactNode;
  citiesOnly?: boolean;
  id: string;
}) {
  const [query, setQuery] = useState(value?.label || "");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => setQuery(value?.label || ""), [value?.label]);

  useEffect(() => {
    if (query.length < 3 || query === value?.label) {
      setItems([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const { data } = await request("get", "/maps/autocomplete", {
          input: query,
          cities: citiesOnly ? "true" : undefined,
        });
        setItems(data || []);
        setOpen(true);
      } catch {
        setItems([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query, citiesOnly, value?.label]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const pick = (s: Suggestion) => {
    onSelect(s);
    setQuery(s.label);
    setOpen(false);
    setActive(-1);
  };

  return (
    <div ref={boxRef} className="relative">
      <div className="flex items-center gap-2 rounded-lg border border-line bg-white px-3">
        <input
          id={id}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!e.target.value) onSelect(null);
          }}
          onFocus={() => items.length && setOpen(true)}
          onKeyDown={(e) => {
            if (!open) return;
            if (e.key === "ArrowDown") setActive((i) => Math.min(i + 1, items.length - 1));
            if (e.key === "ArrowUp") setActive((i) => Math.max(i - 1, 0));
            if (e.key === "Enter" && active >= 0) {
              e.preventDefault();
              pick(items[active]);
            }
          }}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-ink-faint"
        />
        {icon ? <span className="shrink-0 text-ink-faint">{icon}</span> : null}
      </div>

      {open && items.length > 0 ? (
        <ul
          id={`${id}-list`}
          role="listbox"
          className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-line bg-white py-1 shadow-pop"
        >
          {items.map((s, i) => (
            <li key={s.value}>
              <button
                type="button"
                role="option"
                aria-selected={i === active}
                onClick={() => pick(s)}
                className={`block w-full px-3 py-2 text-left text-sm ${i === active ? "bg-surface" : ""} hover:bg-surface`}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
