import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Trash2, CalendarRange } from "lucide-react";
import useList from "../hooks/useList";
import useOptions, { clearOptions } from "../hooks/useOptions";
import api from "../lib/api";
import { Badge, Button, Card, ConfirmDialog, Empty, PageHeader, Pagination, SearchInput, Select, Table } from "../components/ui";
import { useToast } from "../components/Toast";

export default function Cities() {
  const navigate = useNavigate();
  const toast = useToast();
  const list = useList("/cities", { hotel: "" });
  const { data: airports } = useOptions("/airport?items_per_page=1000");
  const airportName = (id) => airports.find((a) => a.id === id)?.name;
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/cities/${del.id}`);
      clearOptions("/cities");
      toast.success(`Deleted ${del.name}`);
      setDel(null);
      list.reload();
    } catch (e) { toast.error(e); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Cities" subtitle="Service cities, their pincodes, nearest airport and daily booking limits." actions={<Link to="/cities/new"><Button icon={Plus}>Add city</Button></Link>} />
      <Card bodyClass="p-0">
        <div className="flex flex-wrap gap-3 border-b border-stone-200 p-4">
          <SearchInput value={list.params.search} onChange={(v) => list.setFilter("search", v)} placeholder="Search cities" className="w-full max-w-sm" />
          <Select className="w-48" value={list.params.hotel} onChange={(e) => list.setFilter("hotel", e.target.value)} placeholder="All cities" options={[{ value: "1", label: "Hotel cities only" }]} />
        </div>
        <Table
          loading={list.loading}
          rows={list.rows}
          onRowClick={(c) => navigate(`/cities/${c.id}`)}
          empty={<Empty title="No cities yet" action={<Link to="/cities/new"><Button icon={Plus}>Add city</Button></Link>} />}
          columns={[
            { key: "name", label: "City", render: (c) => <span className="font-medium text-slate-900">{c.name}</span> },
            { key: "ap", label: "Nearest airport", render: (c) => (c.airport_id ? <>{airportName(c.airport_id) || `#${c.airport_id}`} <span className="text-xs text-slate-500">· {c.distance} km</span></> : "—") },
            { key: "hotel", label: "Hotels", render: (c) => (c.hotel ? <Badge tone="brand">Listed</Badge> : "—") },
            { key: "a", label: "", className: "text-right", render: (c) => (
              <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                <Link to={`/cities/${c.id}/limits`}><Button variant="ghost" size="sm" icon={CalendarRange}>Date limits</Button></Link>
                <Button variant="ghost" size="icon" onClick={() => setDel(c)} aria-label="Delete"><Trash2 className="size-4 text-red-600" /></Button>
              </div>
            ) },
          ]}
        />
        <Pagination pagination={list.pagination} onPage={(n) => list.setFilter("page", n)} />
      </Card>
      <ConfirmDialog open={!!del} onClose={() => setDel(null)} onConfirm={remove} loading={busy} title={`Delete ${del?.name}?`} text="Its pincodes and booking limits are removed too. Not possible while rental or airport pricing uses this city." />
    </>
  );
}
