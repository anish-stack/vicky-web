import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import api from "../lib/api";
import { dateTime, inr } from "../lib/format";
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  Loading,
  PageHeader,
  Select,
  Textarea,
} from "../components/ui";
import { useToast } from "../components/Toast";

const Row = ({ label, children }) => (
  <div className="grid grid-cols-[140px_1fr] gap-3 py-2 text-sm">
    <dt className="text-slate-500">{label}</dt>
    <dd className="text-slate-900">{children ?? "—"}</dd>
  </div>
);

const bookingTone = {
  pending: "reserved",
  confirmed: "active",
  completed: "completed",
  cancelled: "cancel",
};

const paymentTone = {
  pending: "reserved",
  partial: "active",
  paid: "completed",
  failed: "cancel",
  refunded: "neutral",
};

export default function TourBookingView() {
  const { id } = useParams();
  const toast = useToast();

  const [b, setB] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    booking_status: "",
    payment_status: "",
    admin_notes: "",
  });

  const [driverForm, setDriverForm] = useState({
    driver_name: "",
    driver_mobile: "",
    vehicle_number: "",
    vehicle_label: "",
  });

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
          vehicle_label:
            data.assigned_vehicle_label ||
            data.vehicle_label ||
            "",
        });
      })
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  const save = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      const r = await api.put(
        `/tour-booking/admin/${id}`,
        form
      );

      toast.success(
        r.message || "Booking updated"
      );

      load();
    } catch (err) {
      toast.error(err);
    } finally {
      setSaving(false);
    }
  };

  const sendDriverDetails = async (e) => {
    e.preventDefault();

    if (!driverForm.driver_name.trim()) {
      return toast.error("Driver name is required");
    }

    if (!/^[6-9]\d{9}$/.test(driverForm.driver_mobile)) {
      return toast.error(
        "Enter a valid 10-digit driver mobile number"
      );
    }

    if (!driverForm.vehicle_number.trim()) {
      return toast.error("Vehicle number is required");
    }

    if (!driverForm.vehicle_label.trim()) {
      return toast.error("Vehicle name is required");
    }

    setSendingDriver(true);

    try {
      const r = await api.put(
        `/tour-booking/admin/${id}/driver-details`,
        {
          driver_name:
            driverForm.driver_name.trim(),

          driver_mobile:
            driverForm.driver_mobile.trim(),

          vehicle_number:
            driverForm.vehicle_number.trim(),

          vehicle_label:
            driverForm.vehicle_label.trim(),
        }
      );

      toast.success(
        r.message ||
          "Driver details saved and sent successfully"
      );

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
        <p className="text-sm text-red-600">
          {error}
        </p>
      </Card>
    );
  }

  if (!b) return <Loading />;

  const tp = b.tourPackage;

  return (
    <>
      <PageHeader
        back={
          <Link
            to="/tour-packages/bookings"
            className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="size-4" />
            Tour bookings
          </Link>
        }
        title={`Booking ${b.booking_ref}`}
        subtitle={`Booked ${dateTime(b.created_at)}`}
        actions={
          <>
            <Badge
              tone={
                paymentTone[b.payment_status] ||
                "neutral"
              }
            >
              {b.payment_status}
            </Badge>

            <Badge
              tone={
                bookingTone[b.booking_status] ||
                "neutral"
              }
            >
              {b.booking_status}
            </Badge>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card title="Tour">
            <dl className="divide-y divide-stone-100">
              <Row label="Package">
                {b.tour_title}

                {tp ? (
                  <span className="ml-2 text-xs text-slate-500">
                    ({tp.days}D/{tp.nights}N)
                  </span>
                ) : null}
              </Row>

              <Row label="Vehicle">
                {b.vehicle_label} ·{" "}
                {inr(b.vehicle_price)}
              </Row>

              {b.hotel_name && (
                <Row label="Hotel">
                  {b.hotel_name} ·{" "}
                  {b.hotel_nights} night(s) ·{" "}
                  {inr(b.hotel_price)}
                </Row>
              )}

              <Row label="Travellers">
                {b.adults} adult(s), {b.rooms}{" "}
                room(s)
              </Row>
            </dl>
          </Card>

          <Card title="Journey">
            <dl className="divide-y divide-stone-100">
              <Row label="Pickup address">
                {b.pickup_address}
              </Row>

              <Row label="Pickup">
                {b.pickup_date} {b.pickup_time}
              </Row>

              {b.return_date && (
                <Row label="Return">
                  {b.return_date} {b.return_time}
                </Row>
              )}

              {b.notes && (
                <Row label="Notes">
                  {b.notes}
                </Row>
              )}
            </dl>
          </Card>

          <Card title="Traveller">
            <dl className="divide-y divide-stone-100">
              <Row label="Name">
                {b.name}
              </Row>

              <Row label="Mobile">
                +91 {b.mobile}
              </Row>

              {b.email && (
                <Row label="Email">
                  {b.email}
                </Row>
              )}
            </dl>
          </Card>

          <Card title="Payment">
            <dl className="divide-y divide-stone-100">
              <Row label="Total">
                {inr(b.total_amount)}
              </Row>

              <Row label="Advance paid">
                {inr(b.advance_amount)} (
                {b.booking_charge_percent}%)
              </Row>

              <Row label="Balance">
                {inr(b.balance_amount)}
              </Row>

              <Row label="Razorpay order">
                {b.razorpay_order_id}
              </Row>

              {b.razorpay_payment_id && (
                <Row label="Razorpay payment">
                  {b.razorpay_payment_id}
                </Row>
              )}
            </dl>
          </Card>

          {(b.driver_name ||
            b.driver_mobile ||
            b.vehicle_number ||
            b.assigned_vehicle_label) && (
            <Card title="Assigned driver">
              <dl className="divide-y divide-stone-100">
                <Row label="Driver">
                  {b.driver_name}
                </Row>

                <Row label="Driver mobile">
                  {b.driver_mobile
                    ? `+91 ${b.driver_mobile}`
                    : null}
                </Row>

                <Row label="Vehicle name">
                  {b.assigned_vehicle_label}
                </Row>

                <Row label="Vehicle number">
                  {b.vehicle_number}
                </Row>
              </dl>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card title="Manage booking">
            <form
              onSubmit={save}
              className="space-y-4"
            >
              <Field label="Booking status">
                <Select
                  value={form.booking_status}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      booking_status:
                        e.target.value,
                    }))
                  }
                  options={[
                    {
                      value: "pending",
                      label: "Pending",
                    },
                    {
                      value: "confirmed",
                      label: "Confirmed",
                    },
                    {
                      value: "completed",
                      label: "Completed",
                    },
                    {
                      value: "cancelled",
                      label: "Cancelled",
                    },
                  ]}
                />
              </Field>

              <Field label="Payment status">
                <Select
                  value={form.payment_status}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      payment_status:
                        e.target.value,
                    }))
                  }
                  options={[
                    {
                      value: "pending",
                      label: "Pending",
                    },
                    {
                      value: "partial",
                      label: "Partially paid",
                    },
                    {
                      value: "paid",
                      label: "Paid",
                    },
                    {
                      value: "failed",
                      label: "Failed",
                    },
                    {
                      value: "refunded",
                      label: "Refunded",
                    },
                  ]}
                />
              </Field>

              <Field label="Admin notes">
                <Textarea
                  rows={4}
                  value={form.admin_notes}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      admin_notes:
                        e.target.value,
                    }))
                  }
                  placeholder="Internal notes about this booking"
                />
              </Field>

              <Button
                type="submit"
                loading={saving}
                className="w-full"
              >
                Save changes
              </Button>
            </form>
          </Card>

          <Card title="Driver details">
            <form
              onSubmit={sendDriverDetails}
              className="space-y-4"
            >
              <Field label="Driver name" required>
                <Input
                  value={driverForm.driver_name}
                  onChange={(e) =>
                    setDriverForm((f) => ({
                      ...f,
                      driver_name:
                        e.target.value,
                    }))
                  }
                  placeholder="Rakesh Kumar"
                />
              </Field>

              <Field label="Driver mobile" required>
                <Input
                  inputMode="numeric"
                  maxLength={10}
                  value={driverForm.driver_mobile}
                  onChange={(e) =>
                    setDriverForm((f) => ({
                      ...f,
                      driver_mobile:
                        e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10),
                    }))
                  }
                  placeholder="9876543210"
                />
              </Field>

              <Field label="Vehicle name" required>
                <Input
                  value={driverForm.vehicle_label}
                  onChange={(e) =>
                    setDriverForm((f) => ({
                      ...f,
                      vehicle_label:
                        e.target.value,
                    }))
                  }
                  placeholder="Ertiga"
                />
              </Field>

              <Field label="Vehicle number" required>
                <Input
                  value={driverForm.vehicle_number}
                  onChange={(e) =>
                    setDriverForm((f) => ({
                      ...f,
                      vehicle_number:
                        e.target.value
                          .toUpperCase()
                          .replace(/\s+/g, ""),
                    }))
                  }
                  placeholder="DL08SCY6421"
                />
              </Field>

              <Button
                type="submit"
                loading={sendingDriver}
                icon={Send}
                className="w-full"
              >
                Save & Send on WhatsApp
              </Button>

              <p className="text-xs leading-5 text-slate-500">
                Driver details will be saved to
                this booking and sent to the
                customer on WhatsApp.
              </p>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}