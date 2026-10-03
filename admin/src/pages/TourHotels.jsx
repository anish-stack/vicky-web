import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import useList from "../hooks/useList";
import api from "../lib/api";
import { clearOptions } from "../hooks/useOptions";
import { inr } from "../lib/format";
import { Badge, Button, Card, ConfirmDialog, Empty, PageHeader, Pagination, SearchInput, Table, Toggle } from "../components/ui";
import { useToast } from "../components/Toast";
import { imgSrc } from "./TourPackageForm";

export const HOTEL_API = "/tour-hotel";
const isOn = (v) => v === true || v === 1 || v === "1" || v === "true";

export default function TourHotels() {
  const navigate = useNavigate();
  const toast = useToast();
  const hotels = useList(HOTEL_API, {});
  const [del, setDel] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(null);

  const flip = async (row, field) => {
    setBusy(`${row.id}:${field}`);
    try {
      const fd = new FormData();
      fd.append(field, String(!isOn(row[field])));
      await api.put(`${HOTEL_API}/${row.id}`, fd);
      clearOptions();
      hotels.reload();
    } catch (e) {
      toast.error(e);
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      const r = await api.delete(`${HOTEL_API}/${del.id}`);
      toast.success(r?.message || "Deleted");
      clearOptions();
      setDel(null);
      hotels.reload();
    } catch (e) {
      toast.error(e);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Hotels (master data)"
        subtitle="Add a hotel once, then pick it in any tour package. Edit it here and every tour updates."
        actions={<Link to="/tour-hotels/new"><Button icon={Plus}>Add hotel</Button></Link>}
      />
      <Card bodyClass="p-0">
        <div className="border-b border-stone-200 p-4">
          <SearchInput value={hotels.params.search} onChange={(v) => hotels.setFilter("search", v)} placeholder="Hotel name or location" className="max-w-sm" />
        </div>
        {hotels.error && <p className="px-5 pt-4 text-sm text-red-600">{hotels.error}</p>}
        <Table
          loading={hotels.loading}
          rows={hotels.rows}
          onRowClick={(h) => navigate(`/tour-hotels/${h.id}`)}
          empty={<Empty title="No hotels yet" text="Add your regular hotels once and reuse them in every tour." action={<Link to="/tour-hotels/new"><Button icon={Plus}>Add hotel</Button></Link>} />}
          columns={[
            { key: "img", label: "", className: "w-24", render: (h) => (
              h.images?.[0]
                ? <img src={imgSrc(h.images[0])} alt="" className="h-12 w-20 rounded-md bg-stone-100 object-cover" loading="lazy" />
                : <div className="grid h-12 w-20 place-items-center rounded-md bg-stone-100 text-[10px] text-slate-400">No photo</div>
            ) },
            { key: "name", label: "Hotel", render: (h) => (
              <div className="max-w-xs">
                <p className="font-medium text-slate-900">{h.name}</p>
                <p className="truncate text-xs text-slate-500">{h.location || "—"}</p>
              </div>
            ) },
            { key: "photos", label: "Photos", render: (h) => <span className="tnum text-slate-600">{h.images?.length || 0}</span> },
            { key: "price", label: "Per room / night", className: "text-right", render: (h) => <span className="tnum whitespace-nowrap font-medium">{h.price_per_night === null ? "—" : inr(h.price_per_night)}</span> },
            { key: "default", label: "Auto-add to new tours", render: (h) => (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); flip(h, "is_default"); }}
                disabled={busy === `${h.id}:is_default`}
                className="rounded p-1 hover:bg-stone-100 disabled:opacity-50"
                title={isOn(h.is_default) ? "Added to every new tour" : "Not auto-added"}
                aria-label="Toggle auto-add"
              >
                <Star className={isOn(h.is_default) ? "size-4 fill-amber-400 text-amber-500" : "size-4 text-slate-300"} />
              </button>
            ) },
            { key: "active", label: "Active", render: (h) => (
              <div onClick={(e) => e.stopPropagation()}>
                <Toggle checked={isOn(h.is_active)} disabled={busy === `${h.id}:is_active`} onChange={() => flip(h, "is_active")} />
              </div>
            ) },
            { key: "a", label: "", className: "text-right", render: (h) => (
              <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" onClick={() => navigate(`/tour-hotels/${h.id}`)} aria-label="Edit"><Pencil className="size-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setDel(h)} aria-label="Delete"><Trash2 className="size-4 text-red-600" /></Button>
              </div>
            ) },
          ]}
        />
        <Pagination pagination={hotels.pagination} onPage={(n) => hotels.setFilter("page", n)} />
      </Card>
      <p className="mt-3 text-xs text-slate-500"><Badge>Tip</Badge> Hotels marked with ★ are added automatically when you create a new tour package.</p>

      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={remove}
        loading={deleting}
        title={`Delete ${del?.name}?`}
        text="The hotel is removed from the master list. Tours that already use it keep their saved copy."
      />
    </>
  );
}
