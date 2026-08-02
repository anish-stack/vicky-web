export default function PriceTabs({
  taxIncluded,
  onChange,
}: {
  taxIncluded: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div role="tablist" aria-label="Price mode" className="grid grid-cols-2 gap-4">
      {[
        { id: false, label: "Best Price" },
        { id: true, label: "Toll, State Tax Inclusive Price" },
      ].map((t) => (
        <button
          key={String(t.id)}
          role="tab"
          aria-selected={taxIncluded === t.id}
          onClick={() => onChange(t.id as boolean)}
          className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
            taxIncluded === t.id ? "bg-ink text-white" : "bg-surface text-ink-soft hover:bg-line"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
