import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import useList from "../hooks/useList";
import { clearOptions } from "../hooks/useOptions";
import api from "../lib/api";
import { Button, Card, ConfirmDialog, Empty, PageHeader, Pagination, SearchInput, Table } from "../components/ui";
import { useToast } from "../components/Toast";

export default function Airports() {
  const navigate = useNavigate();
  const toast = useToast();
  const list = useList("/airport");
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);
  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/airport/${del.id}`);
      clearOptions("/airport?items_per_page=1000");
      toast.success(`Deleted ${del.name}`);
      setDel(null);
      list.reload();
    } catch (e) { toast.error(e); } finally { setBusy(false); }
  };
  return (
    <>
      <PageHeader title="Airports" subtitle="Airport transfer fares by city and vehicle." actions={<Link to="/airports/new"><Button icon={Plus}>Add airport</Button></Link>} />
      <Card bodyClass="p-0">
        <div className="border-b border-stone-200 p-4"><SearchInput value={list.params.search} onChange={(v) => list.setFilter("search", v)} placeholder="Search airports" className="max-w-sm" /></div>
        <Table
          loading={list.loading}
          rows={list.rows}
          onRowClick={(a) => navigate(`/airports/${a.id}`)}
          empty={<Empty title="No airports yet" />}
          columns={[
            { key: "name", label: "Airport", render: (a) => <span className="font-medium text-slate-900">{a.name}</span> },
            { key: "a", label: "", className: "text-right", render: (a) => (
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDel(a); }} aria-label="Delete"><Trash2 className="size-4 text-red-600" /></Button>
            ) },
          ]}
        />
        <Pagination pagination={list.pagination} onPage={(n) => list.setFilter("page", n)} />
      </Card>
      <ConfirmDialog open={!!del} onClose={() => setDel(null)} onConfirm={remove} loading={busy} title={`Delete ${del?.name}?`} text="Not possible while a city points to this airport." />
    </>
  );
}
