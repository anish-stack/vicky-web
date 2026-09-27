import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import useList from "../hooks/useList";
import api from "../lib/api";
import { bookingCode, dateTime, parsePlaces, STATUSES, statusLabel, tripTypeLabel } from "../lib/format";
import { Badge, Card, Empty, PageHeader, Pagination, SearchInput, Select, Table, Toggle } from "../components/ui";
import { useToast } from "../components/Toast";

export default function Leads() {
  const [sp] = useSearchParams();
  const toast = useToast();
  const [busy, setBusy] = useState(null);
  const list = useList("/trip", { paid: sp.get("paid") || "", converted: sp.get("converted") || "", tripStatus: "", trip_type: "" });
  const p = list.params;

  const toggleConverted = async (t) => {
    setBusy(t.id);
    try {
      const r = await api.patch(`/trip/${t.id}/${t.is_converted_post ? "unconvert" : "convert"}`);
      toast.success(r.message);
      list.reload();
    } catch (e) { toast.error(e); } finally { setBusy(null); }
  };
  const changeStatus = async (t, status) => {
    setBusy(t.id);
    try {
      const r = await api.patch(`/trip/${t.id}/status`, { status });
      toast.success(r.message);
      list.reload();
    } catch (e) { toast.error(e); } finally { setBusy(null); }
  };

  return (
    <>
      <PageHeader title="Leads & trips" subtitle="Every trip request, paid or not. Unpaid ones are leads to call back; mark them followed up once handled." />
      <Card bodyClass="p-0">
        <div className="grid gap-3 border-b border-stone-200 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <SearchInput value={p.search} onChange={(v) => list.setFilter("search", v)} placeholder="Trip id, name, phone" className="lg:col-span-2" />
          <Select value={p.paid} onChange={(e) => list.setFilter("paid", e.target.value)} placeholder="Paid and unpaid" options={[{ value: "0", label: "Unpaid (leads)" }, { value: "1", label: "Paid" }]} />
          <Select value={p.converted} onChange={(e) => list.setFilter("converted", e.target.value)} placeholder="Any follow-up" options={[{ value: "0", label: "Not followed up" }, { value: "1", label: "Followed up" }]} />
          <Select value={p.trip_type} onChange={(e) => list.setFilter("trip_type", e.target.value)} placeholder="Any trip type" options={[
            { value: "oneWay", label: "One way" }, { value: "roundTrip", label: "Round trip" }, { value: "local", label: "Local rental" }, { value: "airport", label: "Airport" },
          ]} />
        </div>
        {list.error && <p className="px-5 pt-4 text-sm text-red-600">{list.error}</p>}
        <Table
          loading={list.loading}
          rows={list.rows}
          empty={<Empty title="No trips match" />}
          columns={[
            { key: "id", label: "Trip", render: (t) => <><p className="font-medium">{bookingCode(t.id)}</p><p className="text-xs text-slate-500">{dateTime(t.createdAt)}</p></> },
            { key: "user", label: "Customer", render: (t) => <><p>{t.users?.name || "—"}</p>{t.users?.phone_number && <a href={`tel:${t.users.phone_number}`} className="text-xs text-brand-600 hover:underline">{t.users.phone_number}</a>}</> },
            { key: "trip", label: "Trip", render: (t) => {
              const pl = parsePlaces(t.places);
              return (
                <div className="max-w-xs">
                  <p className="font-medium">{tripTypeLabel(t.trip_type, t.car_tab)} · {t.Vehicle?.title || "—"}</p>
                  <p className="truncate text-xs text-slate-500">{t.car_tab === "chardham" ? `${t.dham_pickup_city_name || ""} → ${t.dham_package_name || ""}` : pl.map((x) => x.label).filter(Boolean).join(" → ")}</p>
                </div>
              );
            } },
            { key: "date", label: "Pickup", render: (t) => <span className="whitespace-nowrap">{dateTime(t.departure_date)}</span> },
            { key: "paid", label: "Payment", render: (t) => (t.Transactions?.length ? <Badge tone="completed">Paid</Badge> : <Badge>Unpaid</Badge>) },
            { key: "status", label: "Status", render: (t) => (
              <Select
                className="h-8 w-32 text-xs"
                value={t.trip_status}
                disabled={busy === t.id || ["completed", "cancel"].includes(t.trip_status)}
                onChange={(e) => changeStatus(t, e.target.value)}
                options={STATUSES.map((s) => ({ ...s, label: s.label }))}
                aria-label={`Status of ${statusLabel(t.trip_status)}`}
              />
            ) },
            { key: "conv", label: "Followed up", render: (t) => <Toggle checked={t.is_converted_post} disabled={busy === t.id} onChange={() => toggleConverted(t)} /> },
          ]}
        />
        <Pagination pagination={list.pagination} onPage={(n) => list.setFilter("page", n)} />
      </Card>
    </>
  );
}
