import { Car, Landmark, Building2 } from "lucide-react";
import { useRouter } from "next/router";
import TaxiForm from "./TaxiForm";
import DhamForm from "./DhamForm";
import HotelForm from "./HotelForm";

const TABS = [
  { id: "taxi", label: "Taxi", icon: Car, href: "/" },
  { id: "chardham", label: "Char Dham Yatra", icon: Landmark, href: "/chardham" },
  { id: "hotel", label: "Hotel", icon: Building2, href: "/hotel" },
] as const;

/** Hero search card. The active tab is the route, so each tab is its own SEO page. */
export default function BookingWidget({
  tab,
  bootstrap,
}: {
  tab: "taxi" | "chardham" | "hotel";
  bootstrap: any;
}) {
  const router = useRouter();

  return (
    <div className="w-full max-w-[340px] rounded-xl bg-white p-2.5 shadow-widget">
      <div className="mb-2.5 grid grid-cols-3 gap-1.5">
        {TABS.map(({ id, label, icon: Icon, href }) => (
          <button
            key={id}
            type="button"
            onClick={() => router.push(href)}
            aria-current={tab === id ? "page" : undefined}
            className={`flex flex-col items-center gap-0.5 rounded-md border px-1 py-1.5 text-[10px] font-medium leading-tight transition-colors ${
              tab === id
                ? "border-brand-500 bg-brand-500 text-white"
                : "border-line bg-surface text-ink-soft hover:border-ink-faint"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {tab === "taxi" ? <TaxiForm bootstrap={bootstrap} /> : null}
      {tab === "chardham" ? <DhamForm bootstrap={bootstrap} /> : null}
      {tab === "hotel" ? <HotelForm bootstrap={bootstrap} /> : null}
    </div>
  );
}
