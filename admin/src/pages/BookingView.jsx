import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileDown } from "lucide-react";
import api, { API_ORIGIN } from "../lib/api";
import { bookingCode, dateTime, inr, parseJSON, parsePlaces, STATUSES, statusLabel, tripTypeLabel } from "../lib/format";
import { Badge, Button, Card, Field, Input, Loading, PageHeader, Select } from "../components/ui";
import { useToast } from "../components/Toast";

const Row = ({ label, children }) => (
  <div className="grid grid-cols-[140px_1fr] gap-3 py-2 text-sm">
    <dt className="text-slate-500">{label}</dt>
    <dd className="text-slate-900">{children ?? "—"}</dd>
  </div>
);
const yes = (v) => (v === true || v === 1 || v === "1" || v === "true" ? "Included" : "Not included");

export default function BookingView() {
  const { id } = useParams();
  const toast = useToast();
  const [b, setB] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ trip_status: "", additional_kilometers: 0, additional_time: 0 });
  const [saving, setSaving] = useState(false);

  const load = () =>
    api.get(`/transaction/${id}`).then((r) => {
      setB(r.data);
      setForm({ trip_status: r.data.trip_status, additional_kilometers: r.data.additional_kilometers || 0, additional_time: r.data.additional_time || 0 });
    }).catch((e) => setError(e.message));

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await api.put(`/transaction/${id}`, form);
      toast.success(r.message);
      load();
    } catch (err) {
      toast.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (error) return <Card><p className="text-sm text-red-600">{error}</p></Card>;
  if (!b) return <Loading />;

  const places = parsePlaces(b.places);
  const isDham = b.car_tab === "chardham";
  const upi = parseJSON(b.upi);
  const card = parseJSON(b.card);
  const invoiceUrl = `${API_ORIGIN}/api/transaction/pdf/${b.id}`;

  return (
    <>
      <PageHeader
        back={<Link to="/bookings" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="size-4" /> Bookings</Link>}
        title={`Booking ${bookingCode(b.trip_id)}`}
        subtitle={`Booked ${dateTime(b.createdAt)} · Invoice ${b.invoice_id}`}
        actions={
          <>
            <Badge tone={b.trip_status}>{statusLabel(b.trip_status)}</Badge>
            <a href={invoiceUrl} target="_blank" rel="noreferrer"><Button variant="outline" icon={FileDown}>Invoice PDF</Button></a>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card title="Trip">
            <dl className="divide-y divide-stone-100">
              <Row label="Service">{tripTypeLabel(b.trip_type, b.car_tab)}</Row>
              {isDham ? (
                <>
                  <Row label="Package">{b.dham_package_name}</Row>
                  <Row label="Category">{b.dham_category_name}</Row>
                  <Row label="Pickup city">{b.dham_pickup_city_name}</Row>
                  <Row label="Days">{b.dham_package_days}</Row>
                </>
              ) : (
                <Row label="Route">
                  <ol className="space-y-1">
                    {places.map((p, i) => (
                      <li key={i} className="flex gap-2"><span className="tnum w-5 shrink-0 text-slate-400">{i + 1}.</span>{p.label || "—"}</li>
                    ))}
                  </ol>
                </Row>
              )}
              {b.airport_from_to && <Row label="Airport">{b.airport_from_to}</Row>}
              <Row label="Pickup address">{b.pickup_address}</Row>
              <Row label="Pickup">{dateTime(b.departure_date)}</Row>
              {b.return_date && <Row label="Return">{dateTime(b.return_date)}</Row>}
              <Row label="Distance">{b.distance ? `${b.distance} km` : "—"}</Row>
              <Row label="Vehicle">{b.vehicle_name || b.Vehicle?.title}</Row>
              <Row label="Extra km rate">{b.extra_km ? `₹${b.extra_km}/km` : "—"}</Row>
            </dl>
          </Card>
          <Card title="Charges included">
            <div className="grid gap-x-6 sm:grid-cols-2">
              <Row label="Toll tax">{yes(b.toll_tax)}</Row>
              <Row label="Parking">{yes(b.parking_charges)}</Row>
              <Row label="Driver">{yes(b.driver_charges)}</Row>
              <Row label="Night">{yes(b.night_charges)}</Row>
              <Row label="Fuel">{yes(b.fuel_charges)}</Row>
            </div>
          </Card>
          <Card title="Payment">
            <dl className="divide-y divide-stone-100">
              <Row label="Total fare"><span className="tnum font-semibold">{inr(b.original_amount)}</span></Row>
              <Row label="Advance paid"><span className="tnum">{inr(b.paid_amount)}</span> {b.currency}</Row>
              <Row label="Balance due"><span className="tnum">{inr(Number(b.original_amount || 0) - Number(b.paid_amount || 0))}</span></Row>
              <Row label="Razorpay status">{b.status}</Row>
              <Row label="Method">{b.method}{b.bank ? ` · ${b.bank}` : ""}{b.wallet ? ` · ${b.wallet}` : ""}{upi?.vpa ? ` · ${upi.vpa}` : ""}{card?.last4 ? ` · •••• ${card.last4}` : ""}</Row>
              <Row label="Payment id"><span className="break-all">{b.payment_id}</span></Row>
              <Row label="Order id"><span className="break-all">{b.order_id}</span></Row>
              {b.error_description && <Row label="Error">{b.error_description}</Row>}
            </dl>
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Customer">
            <dl className="divide-y divide-stone-100">
              <Row label="Name">{b.name}</Row>
              <Row label="Phone">{b.contact ? <a className="text-brand-600 hover:underline" href={`tel:${b.contact}`}>{b.contact}</a> : "—"}</Row>
              <Row label="Email">{b.email}</Row>
            </dl>
            <Link to={`/bookings?userId=${b.user_id}`} className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline">All bookings by this customer</Link>
          </Card>
          <Card title="Update trip">
            <form onSubmit={save} className="space-y-4">
              <Field label="Trip status">
                <Select value={form.trip_status} onChange={(e) => setForm({ ...form, trip_status: e.target.value })} options={STATUSES} />
              </Field>
              <Field label="Additional kilometres" hint="Driven beyond the booked distance">
                <Input type="number" min="0" value={form.additional_kilometers} onChange={(e) => setForm({ ...form, additional_kilometers: e.target.value })} />
              </Field>
              <Field label="Additional time (hours)">
                <Input type="number" min="0" value={form.additional_time} onChange={(e) => setForm({ ...form, additional_time: e.target.value })} />
              </Field>
              <Button type="submit" loading={saving} className="w-full">Save trip</Button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
