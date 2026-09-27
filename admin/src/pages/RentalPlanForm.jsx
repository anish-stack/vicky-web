import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import useOptions from "../hooks/useOptions";
import { Card, Field, Input, Loading, PageHeader } from "../components/ui";
import PricingMatrix, { fromGroups, toGroups, validateGroups } from "../components/PricingMatrix";
import { BackLink, SaveBar } from "../components/FormBits";
import { useToast } from "../components/Toast";

export default function RentalPlanForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: cities } = useOptions("/cities");
  const { data: vehicles } = useOptions("/vehicles");
  const [form, setForm] = useState({ hours: "", km: "" });
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/localrentalplans/${id}`).then((r) => {
      setForm({ hours: r.data.hours, km: r.data.km });
      setGroups(toGroups(r.data.local_rental_pricings));
    }).catch((e) => toast.error(e)).finally(() => setLoading(false));
  }, [id, toast]);

  const submit = async (e) => {
    e.preventDefault();
    if (!/^\d+(\.\d+)?$/.test(String(form.hours)) || !/^\d+(\.\d+)?$/.test(String(form.km))) return toast.error("Hours and kilometres must be numbers");
    const err = validateGroups(groups);
    if (err) return toast.error(err);
    setSaving(true);
    try {
      const body = { hours: String(form.hours), km: String(form.km), local_rental_pricings: fromGroups(groups) };
      const r = id ? await api.put(`/localrentalplans/${id}`, body) : await api.post("/localrentalplans", body);
      toast.success(r.message);
      navigate("/rental-plans");
    } catch (e2) { toast.error(e2); } finally { setSaving(false); }
  };

  if (loading) return <Loading />;
  return (
    <form id="plan-form" onSubmit={submit}>
      <PageHeader back={<BackLink to="/rental-plans">Local rental plans</BackLink>} title={id ? "Edit rental plan" : "Add rental plan"} />
      <div className="space-y-6">
        <Card title="Package">
          <div className="grid max-w-lg gap-4 sm:grid-cols-2">
            <Field label="Hours" required><Input inputMode="decimal" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} placeholder="8" /></Field>
            <Field label="Kilometres" required><Input inputMode="decimal" value={form.km} onChange={(e) => setForm({ ...form, km: e.target.value })} placeholder="80" /></Field>
          </div>
        </Card>
        <Card title="Fares by city">
          <PricingMatrix groups={groups} onChange={setGroups} cities={cities} vehicles={vehicles} />
        </Card>
      </div>
      <SaveBar formId="plan-form" saving={saving} label={id ? "Save plan" : "Add plan"} onCancel={() => navigate("/rental-plans")} />
    </form>
  );
}
