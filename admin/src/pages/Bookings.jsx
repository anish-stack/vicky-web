import { useNavigate, useSearchParams } from "react-router-dom";
import useList from "../hooks/useList";
import useOptions from "../hooks/useOptions";
import { bookingCode, dateTime, inr, parsePlaces, STATUSES, statusLabel, tripTypeLabel } from "../lib/format";
import { Badge, Button, Card, Empty, Input, PageHeader, Pagination, SearchInput, Select, Table } from "../components/ui";

export default function Bookings() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const { data: vehicles } = useOptions("/vehicles");
  const list = useList("/transaction", {
    filter_tripstatus: sp.get("filter_tripstatus") || "",
    filter_vehicle_id: "",
    filter_start_pickup_date: "",
    filter_car_tab: "",
    userId: sp.get("userId") || "",
  });
  const p = list.params;
  const hasFilter = p.search || p.filter_tripstatus || p.filter_vehicle_id || p.filter_start_pickup_date || p.filter_car_tab || p.userId;

  return (
    <>
      <PageHeader title="Paid bookings" subtitle="Bookings where the customer paid the advance." />
      <Card bodyClass="p-0">
        <div className="grid gap-3 border-b border-stone-200 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <SearchInput value={p.search} onChange={(v) => list.setFilter("search", v)} placeholder="Booking id, name, phone" className="lg:col-span-2" />
          <Select value={p.filter_tripstatus} onChange={(e) => list.setFilter("filter_tripstatus", e.target.value)} placeholder="Any status" options={STATUSES} />
          <Select value={p.filter_vehicle_id} onChange={(e) => list.setFilter("filter_vehicle_id", e.target.value)} placeholder="Any vehicle" options={vehicles.map((v) => ({ value: v.id, label: v.title }))} />
          <Input type="date" value={p.filter_start_pickup_date} onChange={(e) => list.setFilter("filter_start_pickup_date", e.target.value)} aria-label="Pickup date" />
          <Select value={p.filter_car_tab} onChange={(e) => list.setFilter("filter_car_tab", e.target.value)} placeholder="All services" options={[{ value: "chardham", label: "Char Dham only" }]} />
          {hasFilter && (
            <Button variant="ghost" onClick={() => { ["search", "filter_tripstatus", "filter_vehicle_id", "filter_start_pickup_date", "filter_car_tab", "userId"].forEach((k) => list.setFilter(k, "")); navigate("/bookings", { replace: true }); }}>
              Clear filters
            </Button>
          )}
        </div>
        {list.error && <p className="px-5 pt-4 text-sm text-red-600">{list.error}</p>}
        <Table
          loading={list.loading}
          rows={list.rows}
          onRowClick={(r) => navigate(`/bookings/${r.id}`)}
          empty={<Empty title="No bookings found" text={hasFilter ? "Try clearing the filters." : "Paid bookings from the website will appear here."} />}
          columns={[
            { key: "code", label: "Booking", render: (r) => <><p className="font-medium text-slate-900">{bookingCode(r.trip_id)}</p><p className="text-xs text-slate-500">{dateTime(r.createdAt)}</p></> },
            { key: "cust", label: "Customer", render: (r) => <><p>{r.name || "—"}</p><p className="text-xs text-slate-500">{r.contact}</p></> },
            { key: "trip", label: "Trip", render: (r) => {
              const pl = parsePlaces(r.places);
              return (
                <div className="max-w-xs">
                  <p className="font-medium">{tripTypeLabel(r.trip_type, r.car_tab)} · {r.vehicle_name || "—"}</p>
                  <p className="truncate text-xs text-slate-500">
                    {r.car_tab === "chardham" ? `${r.dham_pickup_city_name || ""} → ${r.dham_package_name || ""}` : pl.map((x) => x.label).filter(Boolean).join(" → ")}
                  </p>
                </div>
              );
            } },
            { key: "pickup", label: "Pickup", render: (r) => <span className="whitespace-nowrap">{dateTime(r.departure_date)}</span> },
            { key: "fare", label: "Fare / paid", className: "text-right", render: (r) => <><p className="tnum font-medium">{inr(r.original_amount)}</p><p className="tnum text-xs text-slate-500">{inr(r.paid_amount)} paid</p></> },
            { key: "st", label: "Status", render: (r) => <Badge tone={r.trip_status}>{statusLabel(r.trip_status)}</Badge> },
          ]}
        />
        <Pagination pagination={list.pagination} onPage={(n) => list.setFilter("page", n)} />
      </Card>
    </>
  );
}
