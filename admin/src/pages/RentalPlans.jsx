import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import api from "../lib/api";
import { Button, Card, ConfirmDialog, Empty, PageHeader, Table } from "../components/ui";
import { useToast } from "../components/Toast";

export default function RentalPlans() {
  const navigate = useNavigate();
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/localrentalplans").then((r) => setRows(r.data || [])).catch((e) => toast.error(e)).finally(() => setLoading(false));
  };
  useEffect(load, []); // eslint-disable-line

  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/localrentalplans/${del.id}`);
      toast.success("Plan deleted");
      setDel(null);
      load();
    } catch (e) { toast.error(e); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Local rental plans" subtitle="Hour and kilometre packages for in-city rentals." actions={<Link to="/rental-plans/new"><Button icon={Plus}>Add plan</Button></Link>} />
      <Card bodyClass="p-0">
        <Table
          loading={loading}
          rows={rows}
          onRowClick={(p) => navigate(`/rental-plans/${p.id}`)}
          empty={<Empty title="No rental plans yet" action={<Link to="/rental-plans/new"><Button icon={Plus}>Add plan</Button></Link>} />}
          columns={[
            { key: "plan", label: "Plan", render: (p) => <span className="font-medium text-slate-900">{p.hours} hours · {p.km} km</span> },
            { key: "a", label: "", className: "text-right", render: (p) => (
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDel(p); }} aria-label="Delete"><Trash2 className="size-4 text-red-600" /></Button>
            ) },
          ]}
        />
      </Card>
      <ConfirmDialog open={!!del} onClose={() => setDel(null)} onConfirm={remove} loading={busy} title={`Delete ${del?.hours} hr / ${del?.km} km?`} text="All city fares for this plan are removed too." />
    </>
  );
}
