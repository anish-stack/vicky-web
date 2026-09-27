import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Trash2, Users as UsersIcon, Briefcase } from "lucide-react";
import useList from "../hooks/useList";
import api, { fileUrl } from "../lib/api";
import { clearOptions } from "../hooks/useOptions";
import { inr } from "../lib/format";
import { Badge, Button, Card, ConfirmDialog, Empty, PageHeader, Pagination, SearchInput, Table } from "../components/ui";
import { useToast } from "../components/Toast";

export default function Vehicles() {
  const navigate = useNavigate();
  const toast = useToast();
  const list = useList("/vehicles");
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/vehicles/${del.id}`);
      clearOptions("/vehicles");
      toast.success(`Deleted ${del.title}`);
      setDel(null);
      list.reload();
    } catch (e) { toast.error(e); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Vehicles" subtitle="Cab categories customers can book, with per-km fares." actions={<Link to="/vehicles/new"><Button icon={Plus}>Add vehicle</Button></Link>} />
      <Card bodyClass="p-0">
        <div className="border-b border-stone-200 p-4"><SearchInput value={list.params.search} onChange={(v) => list.setFilter("search", v)} placeholder="Search vehicles" className="max-w-sm" /></div>
        <Table
          loading={list.loading}
          rows={list.rows}
          onRowClick={(v) => navigate(`/vehicles/${v.id}`)}
          empty={<Empty title="No vehicles yet" action={<Link to="/vehicles/new"><Button icon={Plus}>Add vehicle</Button></Link>} />}
          columns={[
            { key: "v", label: "Vehicle", render: (v) => (
              <div className="flex items-center gap-3">
                <img src={fileUrl("vehicle", v.image)} alt="" className="h-10 w-16 rounded bg-stone-100 object-contain" loading="lazy" />
                <div>
                  <p className="font-medium text-slate-900">{v.title}</p>
                  <p className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1"><UsersIcon className="size-3" />{v.passengers ?? "—"}</span>
                    <span className="inline-flex items-center gap-1"><Briefcase className="size-3" />{(v.large_size_bag || 0) + (v.medium_size_bag || 0)}</span>
                    {v.ac_cab && <span>AC</span>}
                  </p>
                </div>
              </div>
            ) },
            { key: "km", label: "Per km", render: (v) => <span className="tnum">{inr(v.priceperkm)}</span> },
            { key: "min", label: "Minimum fare", render: (v) => <span className="tnum">{inr(v.minimum_price)} <span className="text-xs text-slate-500">up to {v.minimum_price_range} km</span></span> },
            { key: "slabs", label: "One-way slabs", render: (v) => <Badge>{v.one_way_trip_pricings?.length || 0}</Badge> },
            { key: "a", label: "", className: "text-right", render: (v) => (
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDel(v); }} aria-label="Delete"><Trash2 className="size-4 text-red-600" /></Button>
            ) },
          ]}
        />
        <Pagination pagination={list.pagination} onPage={(n) => list.setFilter("page", n)} />
      </Card>
      <ConfirmDialog open={!!del} onClose={() => setDel(null)} onConfirm={remove} loading={busy} title={`Delete ${del?.title}?`} text="Only possible when no rental, airport or dham pricing uses this vehicle." />
    </>
  );
}
