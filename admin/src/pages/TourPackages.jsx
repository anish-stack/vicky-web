import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import useList from "../hooks/useList";
import api from "../lib/api";
import { dateOnly, inr, parseJSON } from "../lib/format";
import { Badge, Button, Card, ConfirmDialog, Empty, PageHeader, Pagination, SearchInput, Select, Table, Toggle, cx } from "../components/ui";
import { useToast } from "../components/Toast";
import { TOUR_API, buildTourFormData, imgSrc, normalizeTour } from "./TourPackageForm";

const list = (v) => {
  const x = parseJSON(v);
  return Array.isArray(x) ? x : [];
};
const isOn = (v) => v === true || v === 1 || v === "1" || v === "true";

export const startingPrice = (vehicleOptions) => {
  const prices = list(vehicleOptions)
    .filter((v) => v && v.isActive !== false && v.isActive !== 0 && v.isActive !== "false")
    .map((v) => Number(v.price))
    .filter((n) => Number.isFinite(n) && n >= 0);
  return prices.length ? Math.min(...prices) : null;
};

const durationText = (d, n) => {
  if (!d && d !== 0) return "—";
  return `${d} Day${Number(d) === 1 ? "" : "s"} / ${n ?? 0} Night${Number(n) === 1 ? "" : "s"}`;
};

export default function TourPackages() {
  const navigate = useNavigate();
  const toast = useToast();
  const tours = useList(TOUR_API, { is_active: "", is_featured: "", trip_type: "" });
  const [del, setDel] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(null); // `${id}:${field}`

  const p = tours.params;
  const hasFilter = p.search || p.is_active !== "" || p.is_featured !== "" || p.trip_type;

  // Toggle by re-saving the full record, so no JSON field is lost even if the list row is trimmed.
  const flip = async (row, field) => {
    setBusy(`${row.id}:${field}`);
    try {
      const full = await api.get(`${TOUR_API}/${row.id}`);
      const form = normalizeTour(full.data || {});
      form[field] = !isOn(row[field]);
      const r = await api.put(`${TOUR_API}/${row.id}`, buildTourFormData(form));
      toast.success(r?.message || "Saved");
      tours.reload();
    } catch (e) {
      toast.error(e);
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      const r = await api.delete(`${TOUR_API}/${del.id}`);
      toast.success(r?.message || `Deleted ${del.title}`);
      setDel(null);
      tours.reload();
    } catch (e) {
      toast.error(e);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Tour packages"
        subtitle="Multi-day tours with itinerary, vehicle and hotel options."
        actions={<Link to="/tour-packages/new"><Button icon={Plus}>Add tour package</Button></Link>}
      />
      <Card bodyClass="p-0">
        <div className="grid gap-3 border-b border-stone-200 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <SearchInput value={p.search} onChange={(v) => tours.setFilter("search", v)} placeholder="Title, city or slug" className="lg:col-span-2" />
          <Select value={p.is_active} onChange={(e) => tours.setFilter("is_active", e.target.value)} placeholder="Active and inactive" options={[{ value: "1", label: "Active" }, { value: "0", label: "Inactive" }]} />
          <Select value={p.is_featured} onChange={(e) => tours.setFilter("is_featured", e.target.value)} placeholder="Featured or not" options={[{ value: "1", label: "Featured" }, { value: "0", label: "Not featured" }]} />
          <Select value={p.trip_type} onChange={(e) => tours.setFilter("trip_type", e.target.value)} placeholder="Any trip type" options={[{ value: "roundTrip", label: "Round trip" }, { value: "oneWay", label: "One way" }]} />
          {hasFilter && (
            <Button variant="ghost" onClick={() => ["search", "is_active", "is_featured", "trip_type"].forEach((k) => tours.setFilter(k, ""))}>Clear filters</Button>
          )}
        </div>
        {tours.error && (
          <div className="flex items-center justify-between gap-3 px-5 pt-4 text-sm text-red-600">
            <span>{tours.error}</span>
            <Button size="sm" variant="outline" onClick={tours.reload}>Retry</Button>
          </div>
        )}
        <Table
          loading={tours.loading}
          rows={tours.rows}
          onRowClick={(t) => navigate(`/tour-packages/${t.id}`)}
          empty={
            <Empty
              title={hasFilter ? "No tour packages match" : "No tour packages yet"}
              text={hasFilter ? "Try clearing the filters." : "Create your first package with route, itinerary and vehicle prices."}
              action={!hasFilter && <Link to="/tour-packages/new"><Button icon={Plus}>Add tour package</Button></Link>}
            />
          }
          columns={[
            { key: "cover", label: "", className: "w-24", render: (t) => (
              t.cover_image
                ? <img src={imgSrc(t.cover_image)} alt="" className="h-12 w-20 rounded-md bg-stone-100 object-cover" loading="lazy" />
                : <div className="grid h-12 w-20 place-items-center rounded-md bg-stone-100 text-[10px] text-slate-400">No image</div>
            ) },
            { key: "title", label: "Package", render: (t) => (
              <div className="max-w-xs">
                <p className="font-medium text-slate-900">{t.title}</p>
                <p className="truncate text-xs text-slate-500">/{t.slug}</p>
              </div>
            ) },
            { key: "route", label: "Route", render: (t) => (
              <div className="max-w-[220px]">
                <p>{t.from_city_name} → {t.to_city_name}</p>
                <p className="text-xs text-slate-500">{t.trip_type === "oneWay" ? "One way" : "Round trip"}</p>
              </div>
            ) },
            { key: "dur", label: "Duration", render: (t) => <span className="whitespace-nowrap">{durationText(t.days, t.nights)}</span> },
            { key: "price", label: "From", className: "text-right", render: (t) => {
              const price = startingPrice(t.vehicle_options);
              return <span className="tnum whitespace-nowrap font-medium">{price === null ? "—" : inr(price)}</span>;
            } },
            { key: "counts", label: "Vehicles / hotels", render: (t) => (
              <span className="tnum whitespace-nowrap text-slate-600">{list(t.vehicle_options).length} / {list(t.hotel_options).length}</span>
            ) },
            { key: "featured", label: "Featured", render: (t) => (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); flip(t, "is_featured"); }}
                disabled={busy === `${t.id}:is_featured`}
                className="rounded p-1 hover:bg-stone-100 disabled:opacity-50"
                aria-label={isOn(t.is_featured) ? "Remove from featured" : "Mark as featured"}
                title={isOn(t.is_featured) ? "Featured" : "Not featured"}
              >
                <Star className={cx("size-4", isOn(t.is_featured) ? "fill-amber-400 text-amber-500" : "text-slate-300")} />
              </button>
            ) },
            { key: "status", label: "Active", render: (t) => (
              <div onClick={(e) => e.stopPropagation()}>
                <Toggle checked={isOn(t.is_active)} disabled={busy === `${t.id}:is_active`} onChange={() => flip(t, "is_active")} />
              </div>
            ) },
            { key: "sort", label: "Order", className: "text-center", render: (t) => <Badge>{t.sort_order ?? 0}</Badge> },
            { key: "updated", label: "Updated", render: (t) => <span className="whitespace-nowrap text-slate-600">{dateOnly(t.updated_at || t.updatedAt)}</span> },
            { key: "a", label: "", className: "text-right", render: (t) => (
              <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" onClick={() => navigate(`/tour-packages/${t.id}`)} aria-label="Edit"><Pencil className="size-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setDel(t)} aria-label="Delete"><Trash2 className="size-4 text-red-600" /></Button>
              </div>
            ) },
          ]}
        />
        <Pagination pagination={tours.pagination} onPage={(n) => tours.setFilter("page", n)} />
      </Card>

      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={remove}
        loading={deleting}
        title={`Delete ${del?.title}?`}
        text="The package and its itinerary, vehicle and hotel options are removed. Customers can no longer open its page."
      />
    </>
  );
}
