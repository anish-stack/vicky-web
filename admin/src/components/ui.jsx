import { useEffect, useRef, useState } from "react";
import { Loader2, X, ChevronLeft, ChevronRight, Search } from "lucide-react";

const cx = (...c) => c.filter(Boolean).join(" ");
export { cx };

export function Button({ variant = "primary", size = "md", loading, className, children, icon: Icon, ...rest }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";
  const sizes = { sm: "h-8 px-3 text-sm", md: "h-10 px-4 text-sm", icon: "size-8" };
  const variants = {
    primary: "bg-brand-500 text-white hover:bg-brand-600",
    dark: "bg-road-800 text-white hover:bg-road-900",
    outline: "border border-stone-300 bg-white text-slate-700 hover:bg-stone-50",
    ghost: "text-slate-600 hover:bg-stone-200/70",
    danger: "bg-white border border-red-200 text-red-600 hover:bg-red-50",
  };
  return (
    <button className={cx(base, sizes[size], variants[variant], className)} disabled={loading || rest.disabled} {...rest}>
      {loading ? <Loader2 className="size-4 animate-spin" /> : Icon ? <Icon className="size-4" /> : null}
      {children}
    </button>
  );
}

export function Field({ label, error, hint, required, className, children }) {
  return (
    <label className={cx("block", className)}>
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          {label} {required && <span className="text-brand-500">*</span>}
        </span>
      )}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

const inputCls = "w-full rounded-md border border-stone-300 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-stone-100";

export const Input = ({ className, ...p }) => <input className={cx(inputCls, "h-10", className)} {...p} />;
export const Textarea = ({ className, ...p }) => <textarea className={cx(inputCls, "min-h-24 py-2", className)} {...p} />;
export function Select({ className, options = [], placeholder, ...p }) {
  return (
    <select className={cx(inputCls, "h-10 pr-8", className)} {...p}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function Toggle({ checked, onChange, label, disabled }) {
  return (
    <label className="flex w-full cursor-pointer select-none items-center gap-3 text-sm text-slate-700">
      <button
        type="button"
        role="switch"
        aria-checked={!!checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cx(
          "relative h-5 w-9 min-w-9 shrink-0 rounded-full transition-colors duration-200",
          checked ? "bg-brand-500" : "bg-stone-300",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <span
          className={cx(
            "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>

      <span className="min-w-0 leading-5">
        {label}
      </span>
    </label>
  );
}

export function Card({ title, actions, className, bodyClass, children }) {
  return (
    <section className={cx("rounded-xl border border-stone-200 bg-white", className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 px-5 py-3.5">
          {title && <h2 className="font-semibold text-slate-900">{title}</h2>}
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cx("p-5", bodyClass)}>{children}</div>
    </section>
  );
}

export function PageHeader({ title, subtitle, actions, back }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {back}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

const badgeTones = {
  reserved: "bg-amber-50 text-amber-800 ring-amber-200",
  active: "bg-sky-50 text-sky-800 ring-sky-200",
  completed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  cancel: "bg-red-50 text-red-700 ring-red-200",
  neutral: "bg-stone-100 text-slate-700 ring-stone-200",
  brand: "bg-brand-50 text-brand-700 ring-brand-100",
};
export function Badge({ tone = "neutral", children }) {
  return <span className={cx("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", badgeTones[tone] || badgeTones.neutral)}>{children}</span>;
}

export const Spinner = ({ className }) => <Loader2 className={cx("size-5 animate-spin text-slate-400", className)} />;

export function Loading({ text = "Loading…" }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
      <Spinner /> {text}
    </div>
  );
}

export function Empty({ title = "Nothing here yet", text, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <p className="font-medium text-slate-800">{title}</p>
      {text && <p className="max-w-sm text-sm text-slate-500">{text}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer, size = "md" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  const widths = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-road-900/50 p-4 sm:items-center" onMouseDown={onClose}>
      <div className={cx("w-full rounded-xl bg-white shadow-xl", widths[size])} onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3.5">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded p-1 text-slate-500 hover:bg-stone-100" aria-label="Close"><X className="size-4" /></button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-stone-200 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, title = "Are you sure?", text, confirmText = "Delete", onConfirm, onClose, loading }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Keep it</Button>
          <Button onClick={onConfirm} loading={loading}>{confirmText}</Button>
        </>
      }
    >
      <p className="text-sm text-slate-600">{text}</p>
    </Modal>
  );
}

export function SearchInput({ value, onChange, placeholder = "Search…", className }) {
  const [v, setV] = useState(value || "");
  const first = useRef(true);
  useEffect(() => setV(value || ""), [value]);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const t = setTimeout(() => onChange(v), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v]);
  return (
    <div className={cx("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <Input value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder} className="pl-9" />
    </div>
  );
}

export function Pagination({ pagination, onPage }) {
  if (!pagination || !pagination.total) return null;
  const { page = 1, last_page = 1, from, to, total } = pagination;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 px-5 py-3 text-sm text-slate-600">
      <span className="tnum">{from}–{to} of {total}</span>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page"><ChevronLeft className="size-4" /></Button>
        <span className="tnum px-2">Page {page} of {last_page || 1}</span>
        <Button variant="ghost" size="icon" disabled={page >= last_page} onClick={() => onPage(page + 1)} aria-label="Next page"><ChevronRight className="size-4" /></Button>
      </div>
    </div>
  );
}

/** columns: [{key, label, render?, className?}] */
export function Table({ columns, rows, loading, empty, rowKey = "id", onRowClick }) {
  if (loading) return <Loading />;
  if (!rows?.length) return empty || <Empty />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50 text-xs font-semibold text-slate-500">
            {columns.map((c) => (
              <th key={c.key} className={cx("whitespace-nowrap px-5 py-2.5", c.className)}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {rows.map((r, i) => (
            <tr key={r[rowKey] ?? i} className={cx("align-top hover:bg-stone-50/70", onRowClick && "cursor-pointer")} onClick={onRowClick ? () => onRowClick(r) : undefined}>
              {columns.map((c) => (
                <td key={c.key} className={cx("px-5 py-3", c.className)}>{c.render ? c.render(r, i) : r[c.key] ?? "—"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
