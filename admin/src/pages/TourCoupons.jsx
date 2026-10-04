import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";
import useList from "../hooks/useList";
import api from "../lib/api";
import { inr } from "../lib/format";
import { Badge, Button, Card, ConfirmDialog, Empty, PageHeader, Pagination, SearchInput, Table, Toggle } from "../components/ui";
import { useToast } from "../components/Toast";

export const COUPON_API = "/tour-coupon";
const isOn = (v) => v === true || v === 1 || v === "1" || v === "true";

export const couponValueText = (c) =>
  c.discount_type === "percent"
    ? `${Number(c.discount_value)}% off${c.max_discount ? ` (max ${inr(c.max_discount)})` : ""}`
    : `${inr(c.discount_value)} off`;

export default function TourCoupons() {
  const navigate = useNavigate();
  const toast = useToast();
  const list = useList(COUPON_API, {});
  const [del, setDel] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(null);

  const flip = async (row, field) => {
    setBusy(`${row.id}:${field}`);
    try {
      await api.put(`${COUPON_API}/${row.id}`, { [field]: !isOn(row[field]) });
      list.reload();
    } catch (e) {
      toast.error(e);
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      const r = await api.delete(`${COUPON_API}/${del.id}`);
      toast.success(r?.message || "Deleted");
      setDel(null);
      list.reload();
    } catch (e) {
      toast.error(e);
    } finally {
      setDeleting(false);
    }
  };

  const validity = (c) => {
    if (!c.start_date && !c.end_date) return "Always";
    return `${c.start_date || "…"} → ${c.end_date || "…"}`;
  };

  return (
    <>
      <PageHeader
        title="Tour coupons"
        subtitle="Customers apply these on the tour booking summary page."
        actions={<Link to="/tour-coupons/new"><Button icon={Plus}>Add coupon</Button></Link>}
      />
      <Card bodyClass="p-0">
        <div className="border-b border-stone-200 p-4">
          <SearchInput value={list.params.search} onChange={(v) => list.setFilter("search", v)} placeholder="Code or title" className="max-w-sm" />
        </div>
        {list.error && <p className="px-5 pt-4 text-sm text-red-600">{list.error}</p>}
        <Table
          loading={list.loading}
          rows={list.rows}
          onRowClick={(c) => navigate(`/tour-coupons/${c.id}`)}
          empty={<Empty title="No coupons yet" text="Create a coupon code customers can apply on the summary page." action={<Link to="/tour-coupons/new"><Button icon={Plus}>Add coupon</Button></Link>} />}
          columns={[
            { key: "code", label: "Code", render: (c) => (
              <div>
                <p className="font-mono text-sm font-semibold tracking-wide text-slate-900">{c.code}</p>
                <p className="max-w-[220px] truncate text-xs text-slate-500">{c.title || "—"}</p>
              </div>
            ) },
            { key: "value", label: "Discount", render: (c) => <span className="whitespace-nowrap font-medium">{couponValueText(c)}</span> },
            { key: "min", label: "Min. amount", className: "text-right", render: (c) => <span className="tnum">{Number(c.min_order_amount) > 0 ? inr(c.min_order_amount) : "—"}</span> },
            { key: "tours", label: "Tours", render: (c) => <span className="text-slate-600">{c.tour_package_ids?.length ? `${c.tour_package_ids.length} selected` : "All tours"}</span> },
            { key: "valid", label: "Validity", render: (c) => <span className="whitespace-nowrap text-xs text-slate-600">{validity(c)}</span> },
            { key: "used", label: "Used", className: "text-right", render: (c) => <span className="tnum">{c.used_count}{c.usage_limit ? ` / ${c.usage_limit}` : ""}</span> },
            { key: "public", label: "Listed", render: (c) => (isOn(c.is_public) ? <Badge tone="active">Public</Badge> : <Badge>Hidden</Badge>) },
            { key: "active", label: "Active", render: (c) => (
              <div onClick={(e) => e.stopPropagation()}>
                <Toggle checked={isOn(c.is_active)} disabled={busy === `${c.id}:is_active`} onChange={() => flip(c, "is_active")} />
              </div>
            ) },
            { key: "a", label: "", className: "text-right", render: (c) => (
              <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" onClick={() => navigate(`/tour-coupons/${c.id}`)} aria-label="Edit"><Pencil className="size-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setDel(c)} aria-label="Delete"><Trash2 className="size-4 text-red-600" /></Button>
              </div>
            ) },
          ]}
        />
        <Pagination pagination={list.pagination} onPage={(n) => list.setFilter("page", n)} />
      </Card>

      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={remove}
        loading={deleting}
        title={`Delete ${del?.code}?`}
        text="Past bookings keep the discount they already got. Customers can no longer use this code."
      />
    </>
  );
}
