export const bookingCode = (tripId) => (tripId ? `TS${String(tripId).padStart(3, "0")}` : "—");

export const inr = (v) => {
  const n = Number(v);
  if (v === null || v === undefined || v === "" || Number.isNaN(n)) return "—";
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
};

export const dateTime = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
};

export const dateOnly = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

/** places is stored as JSON, sometimes double-encoded. Always returns [{label}] */
export const parsePlaces = (raw) => {
  let v = raw;
  for (let i = 0; i < 2 && typeof v === "string"; i++) {
    try { v = JSON.parse(v); } catch { return []; }
  }
  if (!Array.isArray(v)) return [];
  return v.map((p) => (typeof p === "string" ? { label: p } : { ...p, label: p?.label ?? p?.name ?? p?.description ?? "" }));
};

export const parseJSON = (raw) => {
  let v = raw;
  for (let i = 0; i < 2 && typeof v === "string"; i++) {
    try { v = JSON.parse(v); } catch { return raw; }
  }
  return v;
};

export const TRIP_TYPES = { oneWay: "One way", roundTrip: "Round trip", local: "Local rental", airport: "Airport" };
export const tripTypeLabel = (t, carTab) => (carTab === "chardham" ? "Char Dham" : TRIP_TYPES[t] || t || "—");

export const STATUSES = [
  { value: "reserved", label: "Reserved" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancel", label: "Cancelled" },
];
export const statusLabel = (s) => STATUSES.find((x) => x.value === s)?.label || s || "—";

export const cleanParams = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== "" && v !== null && v !== undefined));
