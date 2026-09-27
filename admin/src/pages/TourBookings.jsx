import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  IndianRupee,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";

import useList from "../hooks/useList";
import { dateTime, inr } from "../lib/format";

import {
  Badge,
  Card,
  Empty,
  PageHeader,
  Pagination,
  Select,
  SearchInput,
  Table,
} from "../components/ui";

const BOOKING_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_STATUSES = [
  { value: "pending", label: "Payment pending" },
  { value: "partial", label: "Partially paid" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

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

const prettyStatus = (value = "") =>
  String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());

export default function TourBookings() {
  const navigate = useNavigate();

  const list = useList("/tour-booking/admin/list", {
    booking_status: "",
    payment_status: "",
  });

  const p = list.params;

  const hasFilter =
    p.search ||
    p.booking_status ||
    p.payment_status;

  return (
    <>
      <PageHeader
        title="Tour package bookings"
        subtitle="Manage customer bookings, advance payments, trip status and driver assignment."
      />

      <Card bodyClass="p-0 overflow-hidden">
        {/* Filters */}
        <div className="border-b border-stone-200 bg-stone-50/70 p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr]">
            <SearchInput
              value={p.search}
              onChange={(value) =>
                list.setFilter("search", value)
              }
              placeholder="Search booking ref, customer, phone or tour"
            />

            <Select
              value={p.booking_status}
              onChange={(e) =>
                list.setFilter(
                  "booking_status",
                  e.target.value
                )
              }
              placeholder="Any booking status"
              options={BOOKING_STATUSES}
            />

            <Select
              value={p.payment_status}
              onChange={(e) =>
                list.setFilter(
                  "payment_status",
                  e.target.value
                )
              }
              placeholder="Any payment status"
              options={PAYMENT_STATUSES}
            />
          </div>
        </div>

        {list.error && (
          <div className="border-b border-red-100 bg-red-50 px-5 py-3">
            <p className="text-sm text-red-600">
              {list.error}
            </p>
          </div>
        )}

        <Table
          loading={list.loading}
          rows={list.rows}
          onRowClick={(row) =>
            navigate(
              `/tour-packages/bookings/${row.id}`
            )
          }
          empty={
            <Empty
              title="No bookings found"
              text={
                hasFilter
                  ? "No bookings match your current filters."
                  : "Tour package bookings from the website will appear here."
              }
            />
          }
          columns={[
            {
              key: "booking",
              label: "Booking",
              render: (r) => (
                <div className="min-w-[145px]">
                  <p className="font-semibold text-slate-900">
                    {r.booking_ref}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {dateTime(r.created_at)}
                  </p>
                </div>
              ),
            },

            {
              key: "customer",
              label: "Customer",
              render: (r) => (
                <div className="min-w-[180px]">
                  <div className="flex items-start gap-2.5">
                    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-stone-100 text-slate-500">
                      <UserRound className="size-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">
                        {r.name || "—"}
                      </p>

                      <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <Phone className="size-3" />
                        <span>
                          +91 {r.mobile || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ),
            },

            {
              key: "tour",
              label: "Tour",
              render: (r) => (
                <div className="min-w-[220px] max-w-[300px]">
                  <p
                    className="truncate font-medium text-slate-900"
                    title={r.tour_title}
                  >
                    {r.tour_title || "—"}
                  </p>

                  {r.vehicle_label && (
                    <p className="mt-1 text-xs text-slate-500">
                      {r.vehicle_label}
                    </p>
                  )}
                </div>
              ),
            },

            {
              key: "pickup",
              label: "Pickup",
              render: (r) => (
                <div className="min-w-[175px]">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="size-4 shrink-0 text-slate-400" />

                    <div>
                      <p className="whitespace-nowrap text-sm font-medium text-slate-800">
                        {r.pickup_date || "—"}
                      </p>

                      {r.pickup_time && (
                        <p className="text-xs text-slate-500">
                          {r.pickup_time}
                        </p>
                      )}
                    </div>
                  </div>

                  {r.pickup_address && (
                    <div className="mt-2 flex max-w-[220px] items-start gap-1.5 text-xs text-slate-500">
                      <MapPin className="mt-0.5 size-3 shrink-0" />

                      <span
                        className="truncate"
                        title={r.pickup_address}
                      >
                        {r.pickup_address}
                      </span>
                    </div>
                  )}
                </div>
              ),
            },

            {
              key: "amount",
              label: "Payment summary",
              className: "text-right",
              render: (r) => (
                <div className="min-w-[150px] text-right">
                  <div className="flex items-center justify-end gap-1 font-semibold text-slate-900">
                    <IndianRupee className="size-3.5" />
                    <span className="tnum">
                      {inr(r.total_amount)}
                    </span>
                  </div>

                  <p className="tnum mt-1 text-xs font-medium text-emerald-700">
                    {inr(r.advance_amount)} paid
                  </p>

                  <p className="tnum mt-0.5 text-xs text-slate-500">
                    {inr(r.balance_amount)} balance
                  </p>
                </div>
              ),
            },

            {
              key: "payment_status",
              label: "Payment",
              render: (r) => (
                <div className="min-w-[115px]">
                  <Badge
                    tone={
                      paymentTone[
                      r.payment_status
                      ] || "neutral"
                    }
                  >
                    {prettyStatus(
                      r.payment_status
                    )}
                  </Badge>
                </div>
              ),
            },

            {
              key: "booking_status",
              label: "Status",
              render: (r) => (
                <div className="min-w-[105px]">
                  <Badge
                    tone={
                      bookingTone[
                      r.booking_status
                      ] || "neutral"
                    }
                  >
                    {prettyStatus(
                      r.booking_status
                    )}
                  </Badge>
                </div>
              ),
            },
          ]}
        />

        <Pagination
          pagination={list.pagination}
          onPage={(page) =>
            list.setFilter("page", page)
          }
        />
      </Card>
    </>
  );
}