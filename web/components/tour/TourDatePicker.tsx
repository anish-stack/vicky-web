import React, { useEffect, useMemo, useRef, useState } from "react";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const parse = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return { y, m: m - 1, d };
};
const todayStr = () => {
  const n = new Date();
  return iso(n.getFullYear(), n.getMonth(), n.getDate());
};
const pretty = (s: string) =>
  new Date(`${s}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

type Props = {
  value: string;
  onChange: (iso: string) => void;
  /** earliest selectable date (YYYY-MM-DD) */
  min: string;
  /** dates that are full - shown as "Sold Out" and not selectable */
  soldOut?: string[];
  invalid?: boolean;
  placeholder?: string;
};

/** Small calendar that marks full dates as Sold Out (a native date input can't do that). */
export default function TourDatePicker({ value, onChange, min, soldOut = [], invalid, placeholder = "Select date" }: Props) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  // never fall back to a past date: min may arrive late (after mount)
  const floor = min && min > todayStr() ? min : todayStr();
  const effMin = min || floor;
  const start = parse(value || effMin);
  const [view, setView] = useState({ y: start.y, m: start.m });
  const sold = useMemo(() => new Set(soldOut), [soldOut]);

  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", off);
    return () => document.removeEventListener("mousedown", off);
  }, [open]);

  useEffect(() => {
    if (value) {
      const p = parse(value);
      setView({ y: p.y, m: p.m });
    } else {
      const p = parse(effMin);
      setView({ y: p.y, m: p.m });
    }
  }, [value, effMin]);

  const first = new Date(view.y, view.m, 1).getDay();
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];

  const minP = parse(effMin);
  const canPrev = !minP || view.y > minP.y || (view.y === minP.y && view.m > minP.m);
  const go = (delta: number) => {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };

  const valueSold = value && sold.has(value);

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`flex h-10 w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 text-left text-[14px] focus:outline-none focus:ring-2 focus:ring-red-100 ${
          invalid ? "border-red-500" : "border-slate-300 focus:border-red-500"
        }`}
      >
        <span className={`truncate ${value ? "text-slate-900" : "text-slate-400"}`}>{value ? pretty(value) : placeholder}</span>
        {valueSold ? (
          <span className="shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-700">Sold Out</span>
        ) : (
          <i className="fa-regular fa-calendar shrink-0 text-slate-400" />
        )}
      </button>

      {open && (
        <div role="dialog" aria-label="Choose date" className="absolute left-0 z-30 mt-1 w-[292px] max-w-[92vw] rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <button type="button" disabled={!canPrev} onClick={() => go(-1)} className="grid h-8 w-8 place-items-center rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30" aria-label="Previous month">
              <i className="fa-solid fa-chevron-left text-[12px]" />
            </button>
            <p className="m-0 text-[14px] font-bold text-slate-900">{MONTHS[view.m]} {view.y}</p>
            <button type="button" onClick={() => go(1)} className="grid h-8 w-8 place-items-center rounded-full text-slate-600 hover:bg-slate-100" aria-label="Next month">
              <i className="fa-solid fa-chevron-right text-[12px]" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-y-1 text-center">
            {DOW.map((d) => (
              <span key={d} className="text-[10.5px] font-semibold text-slate-400">{d}</span>
            ))}
            {cells.map((d, i) => {
              if (d === null) return <span key={`e${i}`} />;
              const key = iso(view.y, view.m, d);
              const past = key < effMin;
              const isSold = sold.has(key);
              const on = key === value;
              const disabled = past || isSold;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange(key);
                    setOpen(false);
                  }}
                  title={isSold ? "Sold Out" : undefined}
                  className={`mx-auto flex h-10 w-10 flex-col items-center justify-center rounded-lg text-[13px] leading-none ${
                    on
                      ? "bg-red-600 font-bold text-white"
                      : isSold
                        ? "cursor-not-allowed bg-red-50 text-red-400"
                        : past
                          ? "cursor-not-allowed text-slate-300"
                          : "text-slate-800 hover:bg-red-50"
                  }`}
                >
                  <span className={isSold ? "line-through" : ""}>{d}</span>
                  {isSold && <span className="mt-0.5 text-[7.5px] font-bold uppercase tracking-tight">Sold out</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}