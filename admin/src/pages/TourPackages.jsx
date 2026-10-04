import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowDown, ArrowUp, ArrowUpToLine, Copy, ListOrdered, Plus, Pencil, Trash2, Star, Trophy } from "lucide-react";
import useList from "../hooks/useList";
import api from "../lib/api";
import { dateOnly, inr, parseJSON } from "../lib/format";
import { Badge, Button, Card, ConfirmDialog, Empty, Loading, PageHeader, Pagination, SearchInput, Select, Table, Toggle, cx } from "../components/ui";
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

const STATUS_TONE = { live: "brand", new: "active", duplicate: "reserved" };
const STATUS_LABEL = { live: "Live", new: "New", duplicate: "Duplicate" };

const moveItem = (list, from, to) => {
  if (to < 0 || to >= list.length || from === to) return list;
  const next = [...list];
  const [it] = next.splice(from, 1);
  next.splice(to, 0, it);
  return next;
};

/** Arrange the website order (All / View Tours): first row = top-left on the site. */
function ArrangeOrder({ onClose, onSaved }) {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let alive = true;
    api
      .get(TOUR_API, { params: { all: 1, sort: "sort_order" } })
      .then((r) => alive && setItems(r.data || []))
      .catch((e) => {
        toast.error(e);
        onClose();
      });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const change = (next) => {
    setItems(next);
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const r = await api.post(`${TOUR_API}/reorder`, { ids: items.map((t) => t.id) });
      toast.success(r?.message || "Order saved");
      onSaved();
    } catch (e) {
      toast.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card
      title="Arrange tour order"
      className="mb-6"
      actions={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} loading={saving} disabled={!dirty}>Save order</Button>
        </>
      }
    >
      <p className="mb-4 text-sm text-slate-500">
        Row 1 shows first on the website (top / left in <b>All Tours</b>), row 2 next, and so on. Use the arrows or type a position number.
        Drafts (Duplicate) stay hidden on the website even when listed here.
      </p>
      {!items ? (
        <Loading />
      ) : (
        <ol className="space-y-2">
          {items.map((t, i) => (
            <li key={t.id} className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-2.5">
              <input
                aria-label={`Position of ${t.title}`}
                className="tnum h-8 w-12 rounded-md border border-stone-300 text-center text-sm"
                defaultValue={i + 1}
                key={`${t.id}-${i}`}
                inputMode="numeric"
                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                onBlur={(e) => {
                  const n = parseInt(e.target.value, 10);
                  if (Number.isNaN(n)) return (e.target.value = i + 1);
                  const to = Math.min(Math.max(n, 1), items.length) - 1;
                  if (to !== i) change(moveItem(items, i, to));
                }}
              />
              {t.cover_image ? (
                <img src={imgSrc(t.cover_image)} alt="" className="h-10 w-16 shrink-0 rounded bg-stone-100 object-cover" />
              ) : (
                <div className="grid h-10 w-16 shrink-0 place-items-center rounded bg-stone-100 text-[10px] text-slate-400">No image</div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{t.title}</p>
                <p className="truncate text-xs text-slate-500">{durationText(t.days, t.nights)} · {t.from_city_name} → {t.to_city_name}</p>
              </div>
              <Badge tone={STATUS_TONE[t.status] || "neutral"}>{STATUS_LABEL[t.status] || "Live"}</Badge>
              <div className="flex items-center gap-0.5">
                <Button variant="ghost" size="icon" disabled={i === 0} onClick={() => change(moveItem(items, i, 0))} aria-label="Move to top"><ArrowUpToLine className="size-4" /></Button>
                <Button variant="ghost" size="icon" disabled={i === 0} onClick={() => change(moveItem(items, i, i - 1))} aria-label="Move up"><ArrowUp className="size-4" /></Button>
                <Button variant="ghost" size="icon" disabled={i === items.length - 1} onClick={() => change(moveItem(items, i, i + 1))} aria-label="Move down"><ArrowDown className="size-4" /></Button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

export default function TourPackages() {
  const navigate = useNavigate();
  const toast = useToast();
  const tours = useList(TOUR_API, { is_active: "", is_featured: "", trip_type: "", status: "", category: "", sort: "sort_order" });
  const [del, setDel] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(null); // `${id}:${field}`
  const [arrange, setArrange] = useState(false);
  const [duping, setDuping] = useState(null);

  const p = tours.params;
  const hasFilter = p.search || p.is_active !== "" || p.is_featured !== "" || p.trip_type || p.status || p.category;

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

  const duplicate = async (row) => {
    setDuping(row.id);
    try {
      const r = await api.post(`${TOUR_API}/${row.id}/duplicate`);
      toast.success(r?.message || "Duplicate created");
      navigate(`/tour-packages/${r.data.id}`);
    } catch (e) {
      toast.error(e);
    } finally {
      setDuping(null);
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
        actions={
          <>
            <Link to="/tour-packages/top"><Button variant="outline" icon={Trophy}>Top 3 on home</Button></Link>
            <Button variant="outline" icon={ListOrdered} onClick={() => setArrange((v) => !v)}>Arrange order</Button>
            <Link to="/tour-packages/new"><Button icon={Plus}>Add tour package</Button></Link>
          </>
        }
      />
      {arrange && <ArrangeOrder onClose={() => setArrange(false)} onSaved={() => { setArrange(false); tours.reload(); }} />}
      <Card bodyClass="p-0">
        <div className="grid gap-3 border-b border-stone-200 p-4 sm:grid-cols-2 lg:grid-cols-7">
          <SearchInput value={p.search} onChange={(v) => tours.setFilter("search", v)} placeholder="Title, city or slug" className="lg:col-span-2" />
          <Select value={p.is_active} onChange={(e) => tours.setFilter("is_active", e.target.value)} placeholder="Active and inactive" options={[{ value: "1", label: "Active" }, { value: "0", label: "Inactive" }]} />
          <Select value={p.is_featured} onChange={(e) => tours.setFilter("is_featured", e.target.value)} placeholder="Featured or not" options={[{ value: "1", label: "Featured" }, { value: "0", label: "Not featured" }]} />
          <Select value={p.trip_type} onChange={(e) => tours.setFilter("trip_type", e.target.value)} placeholder="Any trip type" options={[{ value: "roundTrip", label: "Round trip" }, { value: "oneWay", label: "One way" }]} />
          <Select value={p.status} onChange={(e) => tours.setFilter("status", e.target.value)} placeholder="Any status" options={[{ value: "live", label: "Live" }, { value: "new", label: "New" }, { value: "duplicate", label: "Duplicate (draft)" }]} />
          <Select value={p.category} onChange={(e) => tours.setFilter("category", e.target.value)} placeholder="Any tab" options={[{ value: "taxi", label: "Taxi" }, { value: "chardham", label: "Char Dham Yatra" }]} />
          {hasFilter && (
            <Button variant="ghost" onClick={() => ["search", "is_active", "is_featured", "trip_type", "status", "category"].forEach((k) => tours.setFilter(k, ""))}>Clear filters</Button>
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
            { key: "cat", label: "Tab", render: (t) => <Badge tone={t.category === "chardham" ? "reserved" : "neutral"}>{t.category === "chardham" ? "Char Dham" : "Taxi"}</Badge> },
            { key: "st", label: "Status", render: (t) => <Badge tone={STATUS_TONE[t.status] || "neutral"}>{STATUS_LABEL[t.status] || "Live"}</Badge> },
            { key: "status", label: "Active", render: (t) => (
              <div onClick={(e) => e.stopPropagation()}>
                <Toggle checked={isOn(t.is_active)} disabled={busy === `${t.id}:is_active` || t.status === "duplicate"} onChange={() => flip(t, "is_active")} />
              </div>
            ) },
            { key: "sort", label: "Order", className: "text-center", render: (t) => <Badge>{t.sort_order ?? 0}</Badge> },
            { key: "updated", label: "Updated", render: (t) => <span className="whitespace-nowrap text-slate-600">{dateOnly(t.updated_at || t.updatedAt)}</span> },
            { key: "a", label: "", className: "text-right", render: (t) => (
              <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" onClick={() => navigate(`/tour-packages/${t.id}`)} aria-label="Edit"><Pencil className="size-4" /></Button>
                <Button variant="ghost" size="icon" loading={duping === t.id} onClick={() => duplicate(t)} aria-label="Duplicate" title="Duplicate"><Copy className="size-4" /></Button>
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
