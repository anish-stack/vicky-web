import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const remove = useCallback((id) => setItems((l) => l.filter((t) => t.id !== id)), []);
  const push = useCallback((type, message) => {
    const id = Math.random().toString(36).slice(2);
    setItems((l) => [...l, { id, type, message }]);
    setTimeout(() => remove(id), type === "error" ? 6000 : 3500);
  }, [remove]);
  const toast = useMemo(() => ({
    success: (m) => push("success", m),
    error: (m) => push("error", typeof m === "string" ? m : m?.message || "Something went wrong"),
    info: (m) => push("info", m),
  }), [push]);
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex w-[min(92vw,380px)] flex-col gap-2" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className="flex items-start gap-3 rounded-lg bg-road-900 px-4 py-3 text-sm text-white shadow-lg">
            {t.type === "success" || t.type === "info" ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" /> : <XCircle className="mt-0.5 size-4 shrink-0 text-brand-500" />}
            <p className="flex-1">{t.message}</p>
            <button onClick={() => remove(t.id)} className="text-white/60 hover:text-white" aria-label="Dismiss"><X className="size-4" /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
