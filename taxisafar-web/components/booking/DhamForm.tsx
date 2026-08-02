import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import WhatsAppField from "./WhatsAppField";
import { request } from "@/lib/api";
import { minPickup, toLocalInput } from "@/lib/format";

export default function DhamForm({ bootstrap }: { bootstrap: any }) {
  const router = useRouter();
  const categories = bootstrap.dhamCategories || [];
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [packageId, setPackageId] = useState("");
  const [pickupCityId, setPickupCityId] = useState("");
  const [pickUpDate, setPickUpDate] = useState(toLocalInput(minPickup()));
  const [dropDate, setDropDate] = useState(toLocalInput(new Date(minPickup().getTime() + 864e5)));
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const packages = useMemo(
    () => (bootstrap.dhamPackages || []).filter((p: any) => String(p.category) === String(categoryId)),
    [bootstrap.dhamPackages, categoryId]
  );

  const pickupCities = useMemo(
    () => packages.find((p: any) => p.id === packageId)?.pickupCities || [],
    [packages, packageId]
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (!packageId || !pickupCityId) throw new Error("Pick a package and a pickup city.");
      const city = pickupCities.find((c: any) => c._id === pickupCityId || c.id === pickupCityId);

      const { data: session } = await request("post", "/sessions", {
        car_tab: "chardham",
        phoneNo: phone,
        pickUpDate,
        dropDate,
        dhamCategory: categoryId,
        dhamPackage: packageId,
        dhamPickupCityId: pickupCityId,
        dhamPackageDays: city?.days || null,
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
        All India Char Dham Yatra Service
      </p>

      <div className="grid grid-cols-3 gap-2">
        {categories.map((c: any) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setCategoryId(c.id);
              setPackageId("");
              setPickupCityId("");
            }}
            className={`rounded-md border py-2 text-[11px] font-medium ${
              categoryId === c.id ? "border-brand-500 bg-brand-50 text-brand-600" : "border-line text-ink-muted"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div>
        <p className="mb-1.5 text-[11px] font-medium text-ink-soft">Select Package</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          {packages.map((p: any) => (
            <label key={p.id} className="flex cursor-pointer items-center gap-1.5 text-[11px] text-ink-soft">
              <input
                type="radio"
                name="dhamPackage"
                checked={packageId === p.id}
                onChange={() => {
                  setPackageId(p.id);
                  setPickupCityId("");
                }}
                className="h-3.5 w-3.5 accent-brand-500"
              />
              <span className="truncate">{p.name}</span>
            </label>
          ))}
          {!packages.length ? <p className="text-[11px] text-ink-faint">No packages in this category yet.</p> : null}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[11px] font-medium text-ink-soft">Select Pickup City</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          {pickupCities.map((c: any) => (
            <label key={c._id || c.id} className="flex cursor-pointer items-center gap-1.5 text-[11px] text-ink-soft">
              <input
                type="radio"
                name="pickupCity"
                checked={pickupCityId === (c._id || c.id)}
                onChange={() => setPickupCityId(c._id || c.id)}
                className="h-3.5 w-3.5 accent-brand-500"
              />
              <span className="truncate">
                {c.name} <span className="text-ink-faint">({c.days}d)</span>
              </span>
            </label>
          ))}
          {!pickupCities.length ? <p className="text-[11px] text-ink-faint">Select a package first.</p> : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="dham-pickup" className="mb-1 block text-[11px] text-ink-muted">
            Pickup Date &amp; Time
          </label>
          <input
            id="dham-pickup"
            type="datetime-local"
            required
            min={toLocalInput(minPickup())}
            value={pickUpDate}
            onChange={(e) => setPickUpDate(e.target.value)}
            className="field px-2 py-2 text-xs"
          />
        </div>
        <div>
          <label htmlFor="dham-drop" className="mb-1 block text-[11px] text-ink-muted">
            Drop Date &amp; Time
          </label>
          <input
            id="dham-drop"
            type="datetime-local"
            min={pickUpDate}
            value={dropDate}
            onChange={(e) => setDropDate(e.target.value)}
            className="field px-2 py-2 text-xs"
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
