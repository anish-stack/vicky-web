import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Copy, ExternalLink, MapPin, Send } from "lucide-react";
import api from "../lib/api";
import { dateTime, inr } from "../lib/format";
import { Badge, Button, Card, Field, Input, Loading, PageHeader, Select, Textarea } from "../components/ui";
import { useToast } from "../components/Toast";

const Row = ({ label, children }) => (
  <div className="grid grid-cols-[140px_1fr] gap-3 py-2 text-sm">
    <dt className="text-slate-500">{label}</dt>
    <dd className="min-w-0 break-words text-slate-900">{children ?? "—"}</dd>
  </div>
);

const bookingTone = { pending: "reserved", confirmed: "active", completed: "completed", cancelled: "cancel" };
const paymentTone = { pending: "reserved", partial: "active", paid: "completed", failed: "cancel", refunded: "neutral" };

const hasCoords = (b) => b.pickup_lat != null && b.pickup_lng != null && b.pickup_lat !== "" && b.pickup_lng !== "";

const mapUrl = (b) => {
  if (b.pickup_map_url) return b.pickup_map_url;
  if (hasCoords(b)) {
    return `https://www.google.com/maps/search/?api=1&query=${b.pickup_lat},${b.pickup_lng}${b.pickup_place_id ? `&query_place_id=${b.pickup_place_id}` : ""
      }`;
  }
  return b.pickup_address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.pickup_address)}` : null;
};

// advance (online Razorpay) status
const advanceStatus = (b) => {
  if (b.payment_status === "refunded") return { label: "Refunded", tone: "neutral", note: "Advance refunded to customer" };
  if (b.payment_status === "failed") return { label: "Failed", tone: "cancel", note: "Razorpay payment failed / signature mismatch" };
  if (b.razorpay_payment_id && ["partial", "paid"].includes(b.payment_status))
    return { label: "Paid", tone: "completed", note: "Received online via Razorpay" };
  if (["partial", "paid"].includes(b.payment_status))
    return { label: "Paid", tone: "completed", note: "Marked paid by admin (no Razorpay payment ID)" };
  return { label: "Not paid", tone: "reserved", note: "Customer has not completed the Razorpay payment" };
};

// balance (paid to driver) status
const balanceStatus = (b) => {
  if (Number(b.balance_amount) <= 0 || b.payment_status === "paid") return { label: "Paid", tone: "completed" };
  if (b.payment_status === "refunded") return { label: "—", tone: "neutral" };
  return { label: "Due", tone: "reserved" };
};

export default function TourBookingView() {
  const { id } = useParams();
  const toast = useToast();

  const [b, setB] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ booking_status: "", payment_status: "", admin_notes: "" });
  const [driverForm, setDriverForm] = useState({ driver_name: "", driver_mobile: "", vehicle_number: "", vehicle_label: "" });
  const [saving, setSaving] = useState(false);
  const [sendingDriver, setSendingDriver] = useState(false);

  const load = () =>
    api
      .get(`/tour-booking/admin/${id}`)
      .then((r) => {
        const data = r.data;
        setB(data);
        setForm({
          booking_status: data.booking_status,
          payment_status: data.payment_status,
          admin_notes: data.admin_notes || "",
        });
        setDriverForm({
          driver_name: data.driver_name || "",
          driver_mobile: data.driver_mobile || "",
          vehicle_number: data.vehicle_number || "",
          vehicle_label: data.assigned_vehicle_label || data.vehicle_label || "",
        });
      })
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  const copy = async (text, msg = "Copied") => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(msg);
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await api.put(`/tour-booking/admin/${id}`, form);
      toast.success(r.message || "Booking updated");
      load();
    } catch (err) {
      toast.error(err);
    } finally {
      setSaving(false);
    }
  };

  const sendDriverDetails = async (e) => {
    e.preventDefault();
    if (!driverForm.driver_name.trim()) return toast.error("Driver name is required");
    if (!/^[6-9]\d{9}$/.test(driverForm.driver_mobile)) return toast.error("Enter a valid 10-digit driver mobile number");
    if (!driverForm.vehicle_number.trim()) return toast.error("Vehicle number is required");
    if (!driverForm.vehicle_label.trim()) return toast.error("Vehicle name is required");

    setSendingDriver(true);
    try {
      const r = await api.put(`/tour-booking/admin/${id}/driver-details`, {
        driver_name: driverForm.driver_name.trim(),
        driver_mobile: driverForm.driver_mobile.trim(),
        vehicle_number: driverForm.vehicle_number.trim(),
        vehicle_label: driverForm.vehicle_label.trim(),
      });
      toast.success(r.message || "Driver details saved and sent successfully");
      load();
    } catch (err) {
      toast.error(err);
    } finally {
      setSendingDriver(false);
    }
  };

  if (error) {
    return (
      <Card>
        <p className="text-sm text-red-600">{error}</p>
      </Card>
    );
  }

  if (!b) return <Loading />;

  const tp = b.tourPackage;
  const pickupMap = mapUrl(b);
  const coords = hasCoords(b) ? `${Number(b.pickup_lat).toFixed(6)}, ${Number(b.pickup_lng).toFixed(6)}` : null;
  const adv = advanceStatus(b);
  const bal = balanceStatus(b);
  const advPaid = adv.label === "Paid";

  return (
    <>
      <PageHeader
        back={
          <Link to="/tour-packages/bookings" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
            <ArrowLeft className="size-4" />
            Tour bookings
          </Link>
        }
        title={`Booking ${b.booking_ref}`}
        subtitle={`Booked ${dateTime(b.created_at)}`}
        actions={
          <>
            <Badge tone={adv.tone}>Advance {adv.label.toLowerCase()}</Badge>
            <Badge tone={paymentTone[b.payment_status] || "neutral"}>{b.payment_status}</Badge>
            <Badge tone={bookingTone[b.booking_status] || "neutral"}>{b.booking_status}</Badge>
          </>
        }
      />

      {!advPaid && adv.label !== "Refunded" && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>Advance {inr(b.advance_amount)} not received.</strong> {adv.note}. Confirm payment before assigning a driver.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card title="Tour">
            <dl className="divide-y divide-stone-100">
              <Row label="Package">
                {b.tour_title}
                {tp ? <span className="ml-2 text-xs text-slate-500">({tp.days}D/{tp.nights}N)</span> : null}
              </Row>
              <Row label="Vehicle">
                {b.vehicle_label} · {inr(b.vehicle_price)}
              </Row>
              {b.hotel_name && (
                <Row label="Hotel">
                  {b.hotel_name} · {b.hotel_nights} night(s) · {inr(b.hotel_price)}
                </Row>
              )}
              <Row label="Travellers">
                {b.adults} adult(s), {b.rooms} room(s)
              </Row>
            </dl>
          </Card>

          <Card title="Journey">
            <dl className="divide-y divide-stone-100">
              <Row label="Pickup address">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-red-600" />
                  <span>{b.pickup_address || "—"}</span>
                </div>
                {pickupMap && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <a
                      href={pickupMap}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-slate-50"
                    >
                      <ExternalLink className="size-3.5" /> Open in Google Maps
                    </a>
                    <button
                      type="button"
                      onClick={() => copy(pickupMap, "Map link copied")}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Copy className="size-3.5" /> Copy map link
                    </button>
                  </div>
                )}
              </Row>

              <Row label="Coordinates">
                {coords ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="font-mono text-xs">{coords}</span>
                    <button type="button" onClick={() => copy(coords, "Coordinates copied")} className="text-slate-400 hover:text-slate-700" aria-label="Copy coordinates">
                      <Copy className="size-3.5" />
                    </button>
                  </span>
                ) : (
                  <span className="text-xs text-amber-700">Not captured (typed manually)</span>
                )}
              </Row>

              {b.pickup_place_id && (
                <Row label="Google Place ID">
                  <span className="break-all font-mono text-xs text-slate-600">{b.pickup_place_id}</span>
                </Row>
              )}

              <Row label="Pickup">
                {b.pickup_date} {b.pickup_time}
              </Row>
              {b.return_date && (
                <Row label="Return">
                  {b.return_date} {b.return_time}
                </Row>
              )}
              {b.notes && <Row label="Notes">{b.notes}</Row>}
            </dl>
          </Card>

          <Card title="Traveller">
            <dl className="divide-y divide-stone-100">
              <Row label="Name">{b.name}</Row>
              <Row label="Mobile">+91 {b.mobile}</Row>
              {b.email && <Row label="Email">{b.email}</Row>}
            </dl>
          </Card>

          <Card title="Payment">
            <dl className="divide-y divide-stone-100">
              {b.coupon_code && (
                <Row label="Coupon">
                  <span className="font-mono font-semibold">{b.coupon_code}</span>{" "}
                  <span className="text-green-700">(− {inr(b.discount_amount)})</span>
                </Row>
              )}
              <Row label="Total">{inr(b.total_amount)}</Row>

              <Row label={`Advance (${Number(b.booking_charge_percent)}%)`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{inr(b.advance_amount)}</span>
                  <Badge tone={adv.tone}>{adv.label}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">{adv.note}</p>
              </Row>

              <Row label="Balance (to driver)">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{inr(b.balance_amount)}</span>
                  <Badge tone={bal.tone}>{bal.label}</Badge>
                </div>
              </Row>

              <Row label="Razorpay order">
                <span className="font-mono text-xs">{b.razorpay_order_id}</span>
              </Row>

              <Row label="Razorpay payment">
                {b.razorpay_payment_id ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="font-mono text-xs">{b.razorpay_payment_id}</span>
                    <button type="button" onClick={() => copy(b.razorpay_payment_id, "Payment ID copied")} className="text-slate-400 hover:text-slate-700" aria-label="Copy payment ID">
                      <Copy className="size-3.5" />
                    </button>
                  </span>
                ) : (
                  <span className="text-xs text-amber-700">No payment received</span>
                )}
              </Row>
            </dl>
          </Card>

          {(b.driver_name || b.driver_mobile || b.vehicle_number || b.assigned_vehicle_label) && (
            <Card title="Assigned driver">
              <dl className="divide-y divide-stone-100">
                <Row label="Driver">{b.driver_name}</Row>
                <Row label="Driver mobile">{b.driver_mobile ? `+91 ${b.driver_mobile}` : null}</Row>
                <Row label="Vehicle name">{b.assigned_vehicle_label}</Row>
                <Row label="Vehicle number">{b.vehicle_number}</Row>
              </dl>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card title="Manage booking">
            <form onSubmit={save} className="space-y-4">
              <Field label="Booking status">
                <Select
                  value={form.booking_status}
                  onChange={(e) => setForm((f) => ({ ...f, booking_status: e.target.value }))}
                  options={[
                    { value: "pending", label: "Pending" },
                    { value: "confirmed", label: "Confirmed" },
                    { value: "completed", label: "Completed" },
                    { value: "cancelled", label: "Cancelled" },
                  ]}
                />
              </Field>

              <Field label="Payment status">
                <Select
                  value={form.payment_status}
                  onChange={(e) => setForm((f) => ({ ...f, payment_status: e.target.value }))}
                  options={[
                    { value: "pending", label: "Pending (advance not paid)" },
                    { value: "partial", label: "Advance paid" },
                    { value: "paid", label: "Fully paid" },
                    { value: "failed", label: "Failed" },
                    { value: "refunded", label: "Refunded" },
                  ]}
                />
              </Field>

              <Field label="Admin notes">
                <Textarea
                  rows={4}
                  value={form.admin_notes}
                  onChange={(e) => setForm((f) => ({ ...f, admin_notes: e.target.value }))}
                  placeholder="Internal notes about this booking"
                />
              </Field>

              <Button type="submit" loading={saving} className="w-full">
                Save changes
              </Button>
            </form>
          </Card>

          <Card title="Driver details">
            <form onSubmit={sendDriverDetails} className="space-y-4">
              <Field label="Driver name" required>
                <Input
                  value={driverForm.driver_name}
                  onChange={(e) => setDriverForm((f) => ({ ...f, driver_name: e.target.value }))}
                  placeholder="Rakesh Kumar"
                />
              </Field>

              <Field label="Driver mobile" required>
                <Input
                  inputMode="numeric"
                  maxLength={10}
                  value={driverForm.driver_mobile}
                  onChange={(e) => setDriverForm((f) => ({ ...f, driver_mobile: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                  placeholder="9876543210"
                />
              </Field>

              <Field label="Vehicle name" required>
                <Input
                  value={driverForm.vehicle_label}
                  onChange={(e) => setDriverForm((f) => ({ ...f, vehicle_label: e.target.value }))}
                  placeholder="Ertiga"
                />
              </Field>

              <Field label="Vehicle number" required>
                <Input
                  value={driverForm.vehicle_number}
                  onChange={(e) => setDriverForm((f) => ({ ...f, vehicle_number: e.target.value.toUpperCase().replace(/\s+/g, "") }))}
                  placeholder="DL08SCY6421"
                />
              </Field>

              <Button type="submit" loading={sendingDriver} icon={Send} className="w-full">
                Save & Send on WhatsApp
              </Button>

              <p className="text-xs leading-5 text-slate-500">
                Driver details will be saved to this booking and sent to the customer on WhatsApp.
              </p>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}