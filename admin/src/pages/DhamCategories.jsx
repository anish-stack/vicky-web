import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import useList from "../hooks/useList";
import { clearOptions } from "../hooks/useOptions";
import api from "../lib/api";
import { Button, Card, ConfirmDialog, Empty, Field, Input, Modal, PageHeader, Pagination, Table } from "../components/ui";
import { useToast } from "../components/Toast";

export default function DhamCategories() {
  const toast = useToast();
  const list = useList("/dham_category", {}, 50);
  const [edit, setEdit] = useState(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);

  const open = (c) => { setEdit(c || {}); setName(c?.name || ""); };
  const save = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Enter a name");
    setSaving(true);
    try {
      const r = edit.id ? await api.put(`/dham_category/${edit.id}`, { name: name.trim() }) : await api.post("/dham_category", { name: name.trim() });
      clearOptions("/dham_category");
      toast.success(r.message);
      setEdit(null);
      list.reload();
    } catch (e2) { toast.error(e2); } finally { setSaving(false); }
  };
  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/dham_category/${del.id}`);
      clearOptions("/dham_category");
      toast.success(`Deleted ${del.name}`);
      setDel(null);
      list.reload();
    } catch (e) { toast.error(e); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Dham categories" subtitle="Groups such as 1 Dham, 2 Dham or 4 Dham yatra." actions={<Button icon={Plus} onClick={() => open(null)}>Add category</Button>} />
      <Card bodyClass="p-0">
        <Table
          loading={list.loading}
          rows={list.rows}
          empty={<Empty title="No categories yet" />}
          columns={[
            { key: "name", label: "Name", render: (c) => <span className="font-medium text-slate-900">{c.name}</span> },
            { key: "a", label: "", className: "text-right", render: (c) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" onClick={() => open(c)} aria-label="Edit"><Pencil className="size-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setDel(c)} aria-label="Delete"><Trash2 className="size-4 text-red-600" /></Button>
              </div>
            ) },
          ]}
        />
        <Pagination pagination={list.pagination} onPage={(n) => list.setFilter("page", n)} />
      </Card>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? "Edit category" : "Add category"} size="sm"
        footer={<><Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button><Button form="cat-form" type="submit" loading={saving}>Save</Button></>}>
        <form id="cat-form" onSubmit={save}><Field label="Name" required><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="4 Dham" autoFocus /></Field></form>
      </Modal>
      <ConfirmDialog open={!!del} onClose={() => setDel(null)} onConfirm={remove} loading={busy} title={`Delete ${del?.name}?`} text="Not possible while packages use this category." />
    </>
  );
}
