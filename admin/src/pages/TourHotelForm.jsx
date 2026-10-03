import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import { clearOptions } from "../hooks/useOptions";
import { IMG_SPECS } from "../lib/imageTools";
import { Card, Field, Input, Loading, PageHeader, Toggle } from "../components/ui";
import { BackLink, SaveBar } from "../components/FormBits";
import { useToast } from "../components/Toast";
import { MultiImage } from "./TourPackageForm";
import { HOTEL_API } from "./TourHotels";

const isOn = (v) => v === true || v === 1 || v === "1" || v === "true";

export default function TourHotelForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ name: "", location: "", price_per_night: "", sort_order: 0, is_default: false, is_active: true, images: [] });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    api
      .get(`${HOTEL_API}/${id}`)
      .then((r) => {
        if (!alive) return;
        const h = r.data || {};
        setForm({
          name: h.name || "",
          location: h.location || "",
          price_per_night: h.price_per_night ?? "",
          sort_order: h.sort_order ?? 0,
          is_default: isOn(h.is_default),
          is_active: h.is_active === undefined ? true : isOn(h.is_active),
          images: Array.isArray(h.images) ? h.images : [],
        });
      })
      .catch((e) => toast.error(e))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (!form.name.trim()) e.name = "Hotel name is required";
    if (String(form.price_per_night).trim() !== "" && (Number.isNaN(Number(form.price_per_night)) || Number(form.price_per_night) < 0)) e.price_per_night = "0 or more";
    setErrors(e);
    if (Object.keys(e).length) return toast.error("Fix the highlighted fields");

    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("location", form.location.trim());
    fd.append("price_per_night", form.price_per_night === "" ? "" : String(form.price_per_night));
    fd.append("sort_order", form.sort_order === "" ? "0" : String(form.sort_order));
    fd.append("is_default", String(!!form.is_default));
    fd.append("is_active", String(!!form.is_active));
    fd.append("images", JSON.stringify(form.images));
    files.forEach((f) => fd.append("images", f));

    setSaving(true);
    try {
      const r = id ? await api.put(`${HOTEL_API}/${id}`, fd) : await api.post(HOTEL_API, fd);
      clearOptions();
      toast.success(r?.message || "Saved");
      navigate("/tour-hotels");
    } catch (e2) {
      toast.error(e2);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <form id="hotel-form" onSubmit={submit} noValidate>
      <PageHeader back={<BackLink to="/tour-hotels">Hotels</BackLink>} title={id ? `Edit ${form.name || "hotel"}` : "Add hotel"} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card title="Hotel details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Hotel name" required error={errors.name} className="sm:col-span-2">
                <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Hotel Brijwasi Royal" />
              </Field>
              <Field label="Location">
                <Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Mathura" />
              </Field>
              <Field label="Price per room / night (₹)" hint="Default price. A tour can override it. Empty = “On request”." error={errors.price_per_night}>
                <Input inputMode="decimal" value={form.price_per_night} onChange={(e) => set("price_per_night", e.target.value)} placeholder="1800" />
              </Field>
            </div>
          </Card>
          <Card title="Photos">
            <MultiImage
              paths={form.images}
              files={files}
              spec={IMG_SPECS.hotel}
              toast={toast}
              onPaths={(p) => set("images", p)}
              onFiles={setFiles}
              hint="4–5 photos work best. First photo is the main one; use ‹ › to reorder saved photos."
            />
          </Card>
        </div>
        <aside className="space-y-6">
          <Card title="Settings">
            <div className="space-y-4">
              <Toggle checked={form.is_active} onChange={(v) => set("is_active", v)} label="Active (usable in tours)" />
              <Toggle checked={form.is_default} onChange={(v) => set("is_default", v)} label="Add automatically to every new tour" />
              <Field label="Order in lists" hint="Lower shows first">
                <Input inputMode="numeric" value={form.sort_order} onChange={(e) => set("sort_order", e.target.value.replace(/[^\d-]/g, ""))} />
              </Field>
            </div>
          </Card>
        </aside>
      </div>
      <SaveBar formId="hotel-form" saving={saving} label={id ? "Save hotel" : "Add hotel"} onCancel={() => navigate("/tour-hotels")} />
    </form>
  );
}
