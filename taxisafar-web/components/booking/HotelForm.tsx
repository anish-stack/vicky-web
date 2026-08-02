import { useState } from "react";
import { useRouter } from "next/router";
import { MapPin, Users, Baby, DoorClosed } from "lucide-react";
import WhatsAppField from "./WhatsAppField";
import { request } from "@/lib/api";
import { minPickup, toLocalInput } from "@/lib/format";

export default function HotelForm({ bootstrap }: { bootstrap: any }) {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [checkIn, setCheckIn] = useState(toLocalInput(minPickup()));
  const [checkOut, setCheckOut] = useState(toLocalInput(new Date(minPickup().getTime() + 864e5)));
  const [adult, setAdult] = useState(1);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const hotelCities = (bootstrap.cities || []).filter((c: any) => c.hotel);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { data: session } = await request("post", "/sessions", {
        car_tab: "hotel",
        phoneNo: phone,
        hotelCity: city,
        check_in: checkIn,
        check_out: checkOut,
        adult,
        children,
        rooms,
      });
      router.push(`/hotels/search?session=${session.sessionId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const counter = (id: string, label: string, value: number, set: (n: number) => void, icon: React.ReactNode, min = 0) => (
    <div>
      <label htmlFor={id} className="mb-1 block text-[11px] text-ink-muted">
        {label}
      </label>
      <div className="flex items-center gap-1 rounded-lg border border-line bg-white px-2">
        <input
          id={id}
          type="number"
          min={min}
          value={value}
          onChange={(e) => set(Math.max(min, Number(e.target.value)))}
          className="min-w-0 flex-1 bg-transparent py-2 text-xs outline-none"
        />
        <span className="shrink-0 text-ink-faint">{icon}</span>
      </div>
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-2.5">
      <p className="rounded-md bg-ink py-1.5 text-center text-[11px] font-medium text-white">
        All India Hotel Service
      </p>

      <div className="flex items-center gap-2 rounded-lg border border-line bg-white px-3">
        <label htmlFor="hotel-city" className="sr-only">
          City
        </label>
        <select
          id="hotel-city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none"
        >
          <option value="">Please search city here*</option>
          {hotelCities.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <MapPin size={15} className="shrink-0 text-ink-faint" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="check-in" className="mb-1 block text-[11px] text-ink-muted">
            Checkin Date &amp; Time
          </label>
          <input
            id="check-in"
            type="datetime-local"
            required
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="field px-2 py-2 text-xs"
          />
        </div>
        <div>
          <label htmlFor="check-out" className="mb-1 block text-[11px] text-ink-muted">
            CheckOut Date &amp; Time
          </label>
          <input
            id="check-out"
            type="datetime-local"
            required
            min={checkIn}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="field px-2 py-2 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {counter("adult", "Adult", adult, setAdult, <Users size={14} />, 1)}
        {counter("children", "Children", children, setChildren, <Baby size={14} />)}
        {counter("rooms", "Room", rooms, setRooms, <DoorClosed size={14} />, 1)}
      </div>

      <WhatsAppField value={phone} onChange={setPhone} />
      {error ? <p className="text-xs text-brand-600">{error}</p> : null}

      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? "Checking prices…" : "Check Prices"}
      </button>
    </form>
  );
}
