import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import useList from "../hooks/useList";
import api from "../lib/api";
import { dateOnly } from "../lib/format";
import { Button, Card, ConfirmDialog, Empty, Field, Input, Modal, PageHeader, Pagination, SearchInput, Select, Table } from "../components/ui";
import { useToast } from "../components/Toast";

const blank = { name: "", email: "", phone_number: "", password: "", city: "", address: "", pin_code: "", gender: "" };

export default function Users({ role }) {
  const toast = useToast();
  const isDriver = role === "driver";
  const noun = isDriver ? "driver" : "customer";
  const list = useList("/users", { role });
  const [edit, setEdit] = useState(null); // null | {} | user
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [del, setDel] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const open = (u) => {
    setEdit(u || {});
    setForm(u ? { ...blank, ...Object.fromEntries(Object.keys(blank).map((k) => [k, u[k] ?? ""])), password: "" } : blank);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone_number.trim()) return toast.error("Name and phone are required");
    if (!edit.id && isDriver && form.password.length < 6) return toast.error("Set a password of at least 6 characters");
    if (form.password && form.password.length < 6) return toast.error("Password must be at least 6 characters");
    setSaving(true);
    try {
      const body = { ...form, role };
      if (!body.password) delete body.password;
      const r = edit.id ? await api.put(`/users/${edit.id}`, body) : await api.post("/users", body);
      toast.success(edit.id ? "Saved" : r.message || "Added");
      setEdit(null);
      list.reload();
    } catch (err) { toast.error(err); } finally { setSaving(false); }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await api.delete(`/users/${del.id}`);
      toast.success(`Deleted ${del.name}`);
      setDel(null);
      list.reload();
    } catch (e) { toast.error(e); } finally { setDeleting(false); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <PageHeader
        title={isDriver ? "Drivers" : "Customers"}
        subtitle={isDriver ? "Driver accounts that can sign in with a password." : "People who signed up on the website with their phone number."}
        actions={<Button icon={Plus} onClick={() => open(null)}>Add {noun}</Button>}
      />
      <Card bodyClass="p-0">
        <div className="border-b border-stone-200 p-4">
          <SearchInput value={list.params.search} onChange={(v) => list.setFilter("search", v)} placeholder="Name, phone or email" className="max-w-sm" />
        </div>
        {list.error && <p className="px-5 pt-4 text-sm text-red-600">{list.error}</p>}
        <Table
          loading={list.loading}
          rows={list.rows}
          empty={<Empty title={`No ${noun}s found`} />}
          columns={[
            { key: "name", label: "Name", render: (u) => <p className="font-medium text-slate-900">{u.name}</p> },
            { key: "phone_number", label: "Phone" },
            { key: "email", label: "Email", render: (u) => u.email || "—" },
            { key: "city", label: "City", render: (u) => u.city || "—" },
            { key: "createdAt", label: "Joined", render: (u) => dateOnly(u.createdAt) },
            { key: "a", label: "", className: "text-right", render: (u) => (
              <div className="flex justify-end gap-1">
                {!isDriver && <Link to={`/bookings?userId=${u.id}`} className="inline-flex h-8 items-center px-2 text-sm text-brand-600 hover:underline">Bookings</Link>}
                <Button variant="ghost" size="icon" onClick={() => open(u)} aria-label="Edit"><Pencil className="size-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setDel(u)} aria-label="Delete"><Trash2 className="size-4 text-red-600" /></Button>
              </div>
            ) },
          ]}
        />
        <Pagination pagination={list.pagination} onPage={(n) => list.setFilter("page", n)} />
      </Card>

      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.id ? `Edit ${noun}` : `Add ${noun}`}
        footer={<><Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button><Button form="user-form" type="submit" loading={saving}>{edit?.id ? "Save changes" : `Add ${noun}`}</Button></>}
      >
        <form id="user-form" onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" required><Input value={form.name} onChange={set("name")} /></Field>
          <Field label="Phone" required><Input value={form.phone_number} onChange={set("phone_number")} placeholder="+91…" /></Field>
          <Field label="Email"><Input type="email" value={form.email} onChange={set("email")} /></Field>
          <Field label="Gender"><Select value={form.gender} onChange={set("gender")} placeholder="—" options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }]} /></Field>
          <Field label="City"><Input value={form.city} onChange={set("city")} /></Field>
          <Field label="PIN code"><Input value={form.pin_code} onChange={set("pin_code")} /></Field>
          <Field label="Address" className="sm:col-span-2"><Input value={form.address} onChange={set("address")} /></Field>
          {(isDriver || edit?.id) && (
            <Field label={edit?.id ? "New password" : "Password"} required={!edit?.id && isDriver} hint={edit?.id ? "Leave blank to keep the current password" : "At least 6 characters"} className="sm:col-span-2">
              <Input type="password" autoComplete="new-password" value={form.password} onChange={set("password")} />
            </Field>
          )}
        </form>
      </Modal>

      <ConfirmDialog open={!!del} onClose={() => setDel(null)} onConfirm={remove} loading={deleting} title={`Delete ${del?.name}?`} text="Their account is removed. Past bookings stay in the records." />
    </>
  );
}
