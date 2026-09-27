import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { bookingCode, dateTime, inr, statusLabel, tripTypeLabel } from "../lib/format";
import { Badge, Card, Loading, PageHeader, Table } from "../components/ui";

function Stat({ label, value, sub, to }) {
  const body = (
    <div className="rounded-xl border border-stone-200 bg-white p-5 transition-colors hover:border-stone-300">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="tnum mt-1 text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
  return to ? <Link to={to}>{body}</Link> : body;
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/dashboard").then((r) => setData(r.data)).catch((e) => setError(e.message));
  }, []);

  if (error) return <Card><p className="text-sm text-red-600">{error}</p></Card>;
  if (!data) return <Loading />;

  const max = Math.max(1, ...data.daily.map((d) => d.count));
  const s = data.bookings.byStatus;

  return (
    <>
      <PageHeader title="Dashboard" subtitle={new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Bookings today" value={data.bookings.today} sub={`${data.bookings.total} paid bookings in total`} to="/bookings" />
        <Stat label="Fare booked this month" value={inr(data.revenue.monthFare)} sub={`${inr(data.revenue.monthPaid)} collected as advance`} />
        <Stat label="Open leads" value={data.trips.openLeads} sub="Unpaid trips not yet followed up" to="/leads?paid=0&converted=0" />
        <Stat label="Customers" value={data.counts.customers} sub={`${data.counts.drivers} drivers`} to="/customers" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card title="Bookings, last 14 days">
          <div className="flex h-44 items-end gap-1.5">
            {data.daily.map((d) => (
              <div key={d.day} className="group flex flex-1 flex-col items-center gap-1.5">
                <span className="tnum text-xs text-slate-500 opacity-0 group-hover:opacity-100">{d.count}</span>
                <div className="w-full rounded-t bg-brand-500/85" style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count ? 4 : 2, opacity: d.count ? 1 : 0.25 }} title={`${d.day}: ${d.count}`} />
                <span className="text-[10px] text-slate-400">{new Date(d.day).getDate()}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Trip status">
          <ul className="space-y-3 text-sm">
            {["reserved", "active", "completed", "cancel"].map((k) => (
              <li key={k} className="flex items-center justify-between">
                <Badge tone={k}>{statusLabel(k)}</Badge>
                <Link to={`/bookings?filter_tripstatus=${k}`} className="tnum font-semibold text-slate-800 hover:text-brand-600">{s[k] || 0}</Link>
              </li>
            ))}
          </ul>
          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-stone-200 pt-4 text-center text-sm">
            <div><p className="tnum font-semibold">{data.counts.vehicles}</p><p className="text-xs text-slate-500">Vehicles</p></div>
            <div><p className="tnum font-semibold">{data.counts.cities}</p><p className="text-xs text-slate-500">Cities</p></div>
            <div><p className="tnum font-semibold">{data.counts.dhamPackages}</p><p className="text-xs text-slate-500">Dham packages</p></div>
          </div>
        </Card>
      </div>

      <Card title="Latest bookings" className="mt-6" bodyClass="p-0" actions={<Link to="/bookings" className="text-sm font-medium text-brand-600 hover:underline">View all</Link>}>
        <Table
          rows={data.recent}
          onRowClick={(r) => navigate(`/bookings/${r.id}`)}
          columns={[
            { key: "code", label: "Booking", render: (r) => <span className="font-medium">{bookingCode(r.trip_id)}</span> },
            { key: "name", label: "Customer", render: (r) => <><p>{r.name || "—"}</p><p className="text-xs text-slate-500">{r.contact}</p></> },
            { key: "type", label: "Trip", render: (r) => tripTypeLabel(r.trip_type, r.car_tab) },
            { key: "vehicle_name", label: "Vehicle" },
            { key: "date", label: "Pickup", render: (r) => dateTime(r.departure_date) },
            { key: "fare", label: "Fare", className: "text-right", render: (r) => <span className="tnum">{inr(r.original_amount)}</span> },
            { key: "st", label: "Status", render: (r) => <Badge tone={r.trip_status}>{statusLabel(r.trip_status)}</Badge> },
          ]}
        />
      </Card>
    </>
  );
}
