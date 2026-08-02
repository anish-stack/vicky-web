/** ₹1,23,456 — Indian digit grouping, no decimals. */
export const inr = (value: number | string | null | undefined) => {
  const n = Number(value || 0);
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

export const splitDate = (input: string | Date | null | undefined) => {
  if (!input) return { day: "--", month: "", year: "", time: "" };
  const d = new Date(input);
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: d.toLocaleString("en-US", { month: "long" }),
    monthShort: d.toLocaleString("en-US", { month: "short" }),
    year: String(d.getFullYear()),
    time: d.toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase(),
  };
};

/** Same whole-day rule the fare engine uses, so the UI never disagrees with the price. */
export const daysBetween = (from: any, to: any) => {
  if (!from || !to) return 1;
  const diff = new Date(to).getTime() - new Date(from).getTime();
  if (diff <= 0) return 1;
  return Math.ceil(diff / 86400000);
};

/** `datetime-local` needs `YYYY-MM-DDTHH:mm` in local time. */
export const toLocalInput = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Earliest allowed pickup: now + 3h, rounded to the next half hour. */
export const minPickup = () => {
  const d = new Date(Date.now() + 3 * 60 * 60 * 1000);
  d.setMinutes(d.getMinutes() > 30 ? 60 : 30, 0, 0);
  return d;
};

export const mediaUrl = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api\/?$/, "");
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
};
