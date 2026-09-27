import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import useOptions, { clearOptions } from "../hooks/useOptions";
import { Card, Field, Input, Loading, PageHeader } from "../components/ui";
import PricingMatrix, { fromGroups, toGroups, validateGroups } from "../components/PricingMatrix";
import { BackLink, SaveBar } from "../components/FormBits";
import { useToast } from "../components/Toast";

export default function AirportForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: cities } = useOptions("/cities");
  const { data: vehicles } = useOptions("/vehicles");
  const [name, setName] = useState("");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/airport/${id}`).then((r) => {
      setName(r.data.name);
      setGroups(toGroups(r.data.airport_pricings));
    }).catch((e) => toast.error(e)).finally(() => setLoading(false));
  }, [id, toast]);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Enter the airport name");
    const err = validateGroups(groups);
    if (err) return toast.error(err);
    setSaving(true);
    try {
      const body = { name: name.trim(), airport_pricings: fromGroups(groups) };
      const r = id ? await api.put(`/airport/${id}`, body) : await api.post("/airport", body);
      clearOptions("/airport?items_per_page=1000");
      toast.success(r.message);
      navigate("/airports");
    } catch (e2) { toast.error(e2); } finally { setSaving(false); }
  };

  if (loading) return <Loading />;
  return (
    <form id="airport-form" onSubmit={submit}>
      <PageHeader back={<BackLink to="/airports">Airports</BackLink>} title={id ? `Edit ${name || "airport"}` : "Add airport"} />
      <div className="space-y-6">
        <Card title="Airport">
          <Field label="Name" required className="max-w-lg"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Indira Gandhi International Airport, Delhi" /></Field>
        </Card>
        <Card title="Transfer fares">
          <p className="mb-4 text-sm text-slate-500">Fixed fare for a transfer between each city and this airport.</p>
          <PricingMatrix groups={groups} onChange={setGroups} cities={cities} vehicles={vehicles} />
        </Card>
      </div>
      <SaveBar formId="airport-form" saving={saving} label={id ? "Save airport" : "Add airport"} onCancel={() => navigate("/airports")} />
    </form>
  );
}
