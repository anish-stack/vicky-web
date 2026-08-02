import { Check, X, Info } from "lucide-react";

export default function InclusionLists({
  inclusions = [],
  exclusions = [],
  notes = [],
}: {
  inclusions: string[];
  exclusions: string[];
  notes: string[];
}) {
  return (
    <div className="space-y-6">
      {inclusions.length ? (
        <section>
          <h2 className="text-sm font-semibold">Package Inclusions</h2>
          <ul className="mt-3 space-y-2">
            {inclusions.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-xs">
                <Check size={14} className="shrink-0 text-[#16A34A]" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {exclusions.length ? (
        <section>
          <h2 className="text-sm font-semibold">Package Exclusions</h2>
          <ul className="mt-3 space-y-2">
            {exclusions.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-xs">
                <X size={14} className="shrink-0 text-brand-500" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {notes.length ? (
        <section className="rounded-xl bg-[#EFF6FF] p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1D4ED8]">
            <Info size={14} /> Important Notes
          </h2>
          <ul className="mt-2 space-y-1.5">
            {notes.map((item, i) => (
              <li key={i} className="text-xs leading-relaxed text-[#1E3A8A]">
                • {item}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
