import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import useList from "../hooks/useList";
import useOptions from "../hooks/useOptions";
import api, { fileUrl } from "../lib/api";
import { Badge, Button, Card, ConfirmDialog, Empty, PageHeader, Pagination, SearchInput, Select, Table } from "../components/ui";
import { useToast } from "../components/Toast";

export default function DhamPackages() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: cats } = useOptions("/dham_category");
  const list = useList("/dham_package", { dham_category_id: "" });
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);
  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/dham_package/${del.id}`);
      toast.success(`Deleted ${del.name}`);
      setDel(null);
      list.reload();
    } catch (e) { toast.error(e); } finally { setBusy(false); }
  };
  return (
    <>
      <PageHeader title="Char Dham packages" subtitle="Yatra packages with pickup cities, stops and vehicle fares." actions={<Link to="/dham/packages/new"><Button icon={Plus}>Add package</Button></Link>} />
      <Card bodyClass="p-0">
        <div className="flex flex-wrap gap-3 border-b border-stone-200 p-4">
          <SearchInput value={list.params.search} onChange={(v) => list.setFilter("search", v)} placeholder="Search packages" className="w-full max-w-sm" />
          <Select className="w-48" value={list.params.dham_category_id} onChange={(e) => list.setFilter("dham_category_id", e.target.value)} placeholder="All categories" options={cats.map((c) => ({ value: c.id, label: c.name }))} />
        </div>
        <Table
          loading={list.loading}
          rows={list.rows}
          onRowClick={(p) => navigate(`/dham/packages/${p.id}`)}
          empty={<Empty title="No packages yet" />}
          columns={[
            { key: "p", label: "Package", render: (p) => (
              <div className="flex items-center gap-3">
                <img src={fileUrl("dham", p.image)} alt="" className="h-10 w-16 rounded bg-stone-100 object-cover" loading="lazy" />
                <span className="font-medium text-slate-900">{p.name}</span>
              </div>
            ) },
            { key: "c", label: "Category", render: (p) => (p.dham_category_name ? <Badge tone="brand">{p.dham_category_name}</Badge> : "—") },
            { key: "d", label: "Distance", render: (p) => (p.distance ? `${p.distance} km` : "—") },
            { key: "a", label: "", className: "text-right", render: (p) => (
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDel(p); }} aria-label="Delete"><Trash2 className="size-4 text-red-600" /></Button>
            ) },
          ]}
        />
        <Pagination pagination={list.pagination} onPage={(n) => list.setFilter("page", n)} />
      </Card>
      <ConfirmDialog open={!!del} onClose={() => setDel(null)} onConfirm={remove} loading={busy} title={`Delete ${del?.name}?`} text="Pickup cities, stops and fares of this package are removed too." />
    </>
  );
}
