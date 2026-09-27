import { useEffect, useState } from "react";
import api from "../lib/api";
import { Button, Card, Field, Input, Loading, PageHeader } from "../components/ui";
import { useToast } from "../components/Toast";

export default function Settings() {
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/advance_payment")
      .then((r) => setForm({ percentage: r.data.percentage ?? "", toll_tax: r.data.toll_tax ?? "", roundtrip_toll_tax: r.data.roundtrip_toll_tax ?? "" }))
      .catch(() => setForm({ percentage: "", toll_tax: "", roundtrip_toll_tax: "" }));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const p = Number(form.percentage);
    if (form.percentage === "" || Number.isNaN(p) || p < 0 || p > 100) return toast.error("Advance must be between 0 and 100");
    if ([form.toll_tax, form.roundtrip_toll_tax].some((v) => v !== "" && Number.isNaN(Number(v)))) return toast.error("Toll amounts must be numbers");
    setSaving(true);
    try {
      const r = await api.post("/advance_payment", { percentage: p, toll_tax: form.toll_tax, roundtrip_toll_tax: form.roundtrip_toll_tax });
      toast.success(r.message);
    } catch (err) { toast.error(err); } finally { setSaving(false); }
  };

  if (!form) return <Loading />;
  return (
    <>
      <PageHeader title="Payment settings" subtitle="Advance collected at booking and default toll charges." />
      <Card className="max-w-xl">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Advance payment (%)" required hint="Share of the fare the customer pays online to confirm a booking">
            <Input inputMode="decimal" value={form.percentage} onChange={(e) => setForm({ ...form, percentage: e.target.value })} />
          </Field>
          <Field label="One-way toll tax (₹)"><Input inputMode="decimal" value={form.toll_tax} onChange={(e) => setForm({ ...form, toll_tax: e.target.value })} /></Field>
          <Field label="Round-trip toll tax (₹)"><Input inputMode="decimal" value={form.roundtrip_toll_tax} onChange={(e) => setForm({ ...form, roundtrip_toll_tax: e.target.value })} /></Field>
          <Button type="submit" loading={saving}>Save settings</Button>
        </form>
      </Card>
    </>
  );
}
