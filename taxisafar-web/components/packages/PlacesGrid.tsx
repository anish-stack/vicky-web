import { Landmark, Waves, Trees, Mountain } from "lucide-react";

const ICONS: Record<string, any> = { temple: Landmark, ghat: Waves, garden: Trees, hill: Mountain };

export default function PlacesGrid({ places = [] }: { places: any[] }) {
  if (!places.length) return null;

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">Places We Cover</h2>

      <ul className="mt-5 grid grid-cols-4 gap-x-3 gap-y-6">
        {places.map((p: any, i: number) => {
          const Icon = ICONS[p.icon] || Landmark;
          return (
            <li key={i} className="flex flex-col items-center gap-2 text-center">
              <Icon size={20} className="text-[#2563EB]" />
              <span className="text-[10px] font-medium leading-tight">{p.name}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
