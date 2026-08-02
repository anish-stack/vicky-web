import { useState } from "react";
import { useRouter } from "next/router";
import { Navigation, MapPin, Plus, Anchor, X } from "lucide-react";
import PlaceInput from "./PlaceInput";
import WhatsAppField from "./WhatsAppField";
import { request } from "@/lib/api";
import { minPickup, toLocalInput } from "@/lib/format";

type Place = { label: string; value: string } | null;

export default function TaxiForm({ bootstrap }: { bootstrap: any }) {
  const router = useRouter();
  const [category, setCategory] = useState<"outstation" | "localairport">("outstation");
  const [tripType, setTripType] = useState<"oneWay" | "roundTrip" | "local" | "airport">("roundTrip");

  const [pickup, setPickup] = useState<Place>(null);
  const [drop, setDrop] = useState<Place>(null);
  const [stops, setStops] = useState<Place[]>([]);

  const [city, setCity] = useState("");
  const [plan, setPlan] = useState("");
  const [airport, setAirport] = useState("");
  const [airportFromTo, setAirportFromTo] = useState<"from" | "to">("from");

  const [pickUpDate, setPickUpDate] = useState(toLocalInput(minPickup()));
  const [dropDate, setDropDate] = useState(toLocalInput(new Date(minPickup().getTime() + 864e5)));
  const [phone, setPhone] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const isOutstation = category === "outstation";
  const isRound = isOutstation && tripType === "roundTrip";

  const setCategoryTab = (next: "outstation" | "localairport") => {
    setCategory(next);
    setTripType(next === "outstation" ? "roundTrip" : "local");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      let distance: number | null = null;
      let places: any[] = [];

      if (isOutstation) {
        if (!pickup || !drop) throw new Error("Add both a pickup and a drop location.");
        const ordered = [pickup, ...stops.filter(Boolean), drop] as { label: string; value: string }[];
        places = ordered.map((p, i) => ({ label: p.label, value: p.value, order: i }));

        const { data } = await request("post", "/maps/route", { places: places.map((p) => p.value) });
        distance = data.distanceKm;
      } else if (tripType === "local") {
        if (!city || !plan) throw new Error("Pick a city and a rental package.");
        const selected = bootstrap.localRentalPlans.find((p: any) => p.id === plan);
        distance = selected?.km || 0;
      } else {
        if (!airport || !city) throw new Error("Pick an airport and a city.");
        distance = 1;
      }

      const { data: session } = await request("post", "/sessions", {
        car_tab: "taxi",
        category,
        tripType,
        distance,
        places,
        phoneNo: phone,
        pickUpDate,
        dropDate: isRound ? dropDate : null,
        city: !isOutstation ? city : undefined,
        localRentalPlan: tripType === "local" ? plan : undefined,
        time: tripType === "local" ? bootstrap.localRentalPlans.find((p: any) => p.id === plan)?.hours : undefined,
        airport: tripType === "airport" ? airport : undefined,
        airportCity: tripType === "airport" ? city : undefined,
        airportFromTo: tripType === "airport" ? airportFromTo : undefined,
      });

      router.push(`/vehicles?session=${session.sessionId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-2.5">
      <p className="rounded-md bg-ink py-1.5 text-center text-[11px] font-medium text-white">
        All India Cab Service
      </p>

      <div className="grid grid-cols-2 gap-2">
        {(["outstation", "localairport"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategoryTab(c)}
            className={`rounded-md border py-2 text-xs font-medium transition-colors ${
              category === c ? "border-brand-500 bg-brand-50 text-brand-600" : "border-line text-ink-muted"
            }`}
          >
            {c === "outstation" ? "Outstation" : "Local / Airport"}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-5 px-1 py-0.5">
        {(isOutstation
          ? [
              { id: "oneWay", label: "One Way Trip" },
              { id: "roundTrip", label: "Round Trip" },
            ]
          : [
              { id: "local", label: "Local Rental" },
              { id: "airport", label: "Airport" },
            ]
        ).map((t) => (
          <label key={t.id} className="flex cursor-pointer items-center gap-1.5 text-xs text-ink-soft">
            <input
              type="radio"
              name="tripType"
              checked={tripType === t.id}
              onChange={() => setTripType(t.id as any)}
              className="h-3.5 w-3.5 accent-brand-500"
            />
            {t.label}
          </label>
        ))}
      </div>

      {isOutstation ? (
        <>
          <PlaceInput
            id="pickup"
            value={pickup}
            onSelect={setPickup}
            placeholder="Pickup Address"
            icon={<Navigation size={15} />}
          />

          {stops.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex-1">
                <PlaceInput
                  id={`stop-${i}`}
                  value={s}
                  onSelect={(v) => setStops((prev) => prev.map((p, idx) => (idx === i ? v : p)))}
                  placeholder={`Stop ${i + 1}`}
                  icon={<MapPin size={15} />}
                />
              </div>
              <button
                type="button"
                onClick={() => setStops((prev) => prev.filter((_, idx) => idx !== i))}
                aria-label={`Remove stop ${i + 1}`}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line text-ink-faint"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          <PlaceInput
            id="drop"
            value={drop}
            onSelect={setDrop}
            placeholder="Destination Address"
            icon={<MapPin size={15} />}
          />

          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => setStops((prev) => [...prev, null])}
              className="flex items-center gap-1 text-xs font-medium text-brand-500"
            >
              <Plus size={13} /> Add more city
            </button>
            <Anchor size={14} className="text-ink-faint" />
          </div>
        </>
      ) : (
        <>
          <label htmlFor="city" className="sr-only">
            City
          </label>
          <select id="city" value={city} onChange={(e) => setCity(e.target.value)} required className="field">
            <option value="">Select city</option>
            {bootstrap.cities?.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {tripType === "local" ? (
            <>
              <label htmlFor="plan" className="sr-only">
                Rental package
              </label>
              <select id="plan" value={plan} onChange={(e) => setPlan(e.target.value)} required className="field">
                <option value="">Select package</option>
                {bootstrap.localRentalPlans?.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
              <label htmlFor="airport" className="sr-only">
                Airport
              </label>
              <select
                id="airport"
                value={airport}
                onChange={(e) => setAirport(e.target.value)}
                required
                className="field"
              >
                <option value="">Select airport</option>
                {bootstrap.airports?.map((a: any) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                {(["from", "to"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setAirportFromTo(d)}
                    className={`rounded-md border py-2 text-xs font-medium ${
                      airportFromTo === d ? "border-brand-500 bg-brand-50 text-brand-600" : "border-line text-ink-muted"
                    }`}
                  >
                    {d === "from" ? "From airport" : "To airport"}
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="pickUpDate" className="mb-1 block text-[11px] text-ink-muted">
            Pickup Date &amp; Time
          </label>
          <input
            id="pickUpDate"
            type="datetime-local"
            required
            min={toLocalInput(minPickup())}
            value={pickUpDate}
            onChange={(e) => setPickUpDate(e.target.value)}
            className="field px-2 py-2 text-xs"
          />
        </div>
        <div>
          <label htmlFor="dropDate" className="mb-1 block text-[11px] text-ink-muted">
            Drop Date &amp; Time
          </label>
          <input
            id="dropDate"
            type="datetime-local"
            disabled={!isRound}
            min={pickUpDate}
            value={dropDate}
            onChange={(e) => setDropDate(e.target.value)}
            className="field px-2 py-2 text-xs disabled:bg-surface disabled:text-ink-faint"
          />
        </div>
      </div>

      <WhatsAppField value={phone} onChange={setPhone} />

      {error ? <p className="text-xs text-brand-600">{error}</p> : null}

      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? "Checking prices…" : "Check Prices"}
      </button>
    </form>
  );
}
