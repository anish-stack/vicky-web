import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, RotateCcw } from "lucide-react";
import api from "../lib/api";
import { Button, ConfirmDialog, Input, Loading, PageHeader, Textarea } from "../components/ui";
import { BackLink, SaveBar } from "../components/FormBits";
import { useToast } from "../components/Toast";
import { Err, RowTools, SectionCard, StringList, TOUR_API, move, newKey } from "./TourPackageForm";

/**
 * Default master: the highlights, inclusions, exclusions, important notes and FAQs
 * every NEW tour package starts with. Existing tours are never changed.
 */

const MASTER_API = `${TOUR_API}/default-master`;

/** icon names the website understands (web/lib/tourPackage.ts -> faIcon) */
const ICONS = [
  "car", "cab", "map-pin", "map", "route", "road", "calendar", "clock", "hotel", "temple", "ghat",
  "garden", "mountain", "food", "driver", "shield", "camera", "shopping", "star", "fort", "museum",
];

const LIST_LABEL = {
  highlights: "Highlights",
  inclusions: "Inclusions",
  exclusions: "Exclusions",
  important_notes: "Important notes",
  faqs: "FAQs",
};

const clean = (s) => String(s ?? "").trim();
const strs = (v) => (Array.isArray(v) ? v.map((s) => String(s ?? "")) : []);

const toForm = (d = {}) => ({
  highlights: (Array.isArray(d.highlights) ? d.highlights : []).map((h) => ({ _k: newKey(), icon: h?.icon ?? "", title: h?.title ?? "", subtitle: h?.subtitle ?? "" })),
  inclusions: strs(d.inclusions),
  exclusions: strs(d.exclusions),
  important_notes: strs(d.important_notes),
  faqs: (Array.isArray(d.faqs) ? d.faqs : []).map((q) => ({ _k: newKey(), question: q?.question ?? "", answer: q?.answer ?? "" })),
});

const toPayload = (f) => ({
  highlights: f.highlights.map(({ icon, title, subtitle }) => ({ icon: clean(icon), title: clean(title), subtitle: clean(subtitle) })),
  inclusions: f.inclusions.map(clean),
  exclusions: f.exclusions.map(clean),
  important_notes: f.important_notes.map(clean),
  faqs: f.faqs.map(({ question, answer }) => ({ question: clean(question), answer: clean(answer) })),
});

const validate = (f) => {
  const e = {};
  f.highlights.forEach((h, i) => {
    if (!clean(h.title)) e[`highlights.${i}.title`] = clean(h.icon) || clean(h.subtitle) ? "Title is required" : "Fill in or remove this highlight";
  });
  ["inclusions", "exclusions", "important_notes"].forEach((k) =>
    f[k].forEach((s, i) => {
      if (!clean(s)) e[`${k}.${i}`] = "Empty line: fill it in or remove it";
    })
  );
  f.faqs.forEach((q, i) => {
    if (!clean(q.question) && !clean(q.answer)) e[`faqs.${i}.question`] = "Fill in or remove this FAQ";
    else {
      if (!clean(q.question)) e[`faqs.${i}.question`] = "Question is required";
      if (!clean(q.answer)) e[`faqs.${i}.answer`] = "Answer is required";
    }
  });
  return e;
};

export default function TourDefaults() {
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState("");
  const [meta, setMeta] = useState({ template: null });
  const [errors, setErrors] = useState({});
  const [openSec, setOpenSec] = useState({ highlights: true, inclusions: true, exclusions: true, important_notes: true, faqs: true });
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [loadError, setLoadError] = useState("");

  const apply = (d) => {
    const f = toForm(d);
    setForm(f);
    setSaved(JSON.stringify(toPayload(f)));
    setErrors({});
  };

  useEffect(() => {
    let alive = true;
    api
      .get(MASTER_API)
      .then((r) => {
        if (!alive) return;
        apply(r.data || {});
        setMeta({ template: r.data?.template || null });
      })
      .catch((e) => alive && setLoadError(e.message));
    return () => { alive = false; };
  }, []);

  const dirty = useMemo(() => !!form && JSON.stringify(toPayload(form)) !== saved, [form, saved]);

  // warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (loadError)
    return (
      <>
        <PageHeader back={<BackLink to="/tour-packages">Tour packages</BackLink>} title="Default master" />
        <p className="rounded-xl border border-stone-200 bg-white p-5 text-sm text-red-600">{loadError}</p>
      </>
    );
  if (!form) return <Loading />;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setRow = (list, i, patch) => setForm((f) => ({ ...f, [list]: f[list].map((r, j) => (j === i ? { ...r, ...patch } : r)) }));
  const addRow = (list, row) => setForm((f) => ({ ...f, [list]: [...f[list], row] }));
  const removeRow = (list, i) => setForm((f) => ({ ...f, [list]: f[list].filter((_, j) => j !== i) }));
  const moveRow = (list) => (i, dir) => setForm((f) => ({ ...f, [list]: move(f[list], i, dir) }));
  const err = (k) => errors[k];
  const sec = (key) => ({ open: openSec[key], onToggle: () => setOpenSec((o) => ({ ...o, [key]: !o[key] })) });
  const listErrors = (k) => Object.fromEntries(form[k].map((_, i) => [i, err(`${k}.${i}`)]));

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate(form);
    setErrors(e);
    const keys = Object.keys(e);
    if (keys.length) {
      setOpenSec((o) => ({ ...o, ...Object.fromEntries(keys.map((k) => [k.split(".")[0], true])) }));
      toast.error(`Fix ${keys.length} highlighted field${keys.length > 1 ? "s" : ""} before saving`);
      setTimeout(() => document.querySelector("[data-invalid='true']")?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
      return;
    }
    setSaving(true);
    try {
      const r = await api.put(MASTER_API, toPayload(form));
      toast.success(r?.message || "Default master saved");
      apply(r.data || toPayload(form));
    } catch (e2) {
      toast.error(e2);
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    setBusy("reset");
    try {
      const r = await api.delete(MASTER_API);
      toast.success(r?.message || "Reset done");
      apply(r.data || {});
      setConfirmReset(false);
    } catch (e) {
      toast.error(e);
    } finally {
      setBusy("");
    }
  };

  const clearTemplate = async () => {
    setBusy("tpl");
    try {
      const r = await api.put(`${TOUR_API}/defaults`, { template_id: null });
      toast.success(r?.message || "Template removed");
      setMeta((m) => ({ ...m, template: null }));
    } catch (e) {
      toast.error(e);
    } finally {
      setBusy("");
    }
  };

  const tpl = meta.template;
  const tplLists = (tpl?.overrides || []).map((k) => LIST_LABEL[k] || k);

  return (
    <form id="tour-defaults-form" onSubmit={submit} noValidate>
      <PageHeader
        back={<BackLink to="/tour-packages">Tour packages</BackLink>}
        title="Default master"
        subtitle="Every new tour package starts with these highlights, inclusions, exclusions, notes and FAQs. Existing tours do not change."
        actions={
          <Button type="button" variant="outline" icon={RotateCcw} onClick={() => setConfirmReset(true)}>
            Reset to original
          </Button>
        }
      />

      {tpl && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span className="min-w-0 flex-1">
            Template tour <Link to={`/tour-packages/${tpl.id}`} className="font-medium underline">{tpl.title}</Link> is set as default.{" "}
            {tplLists.length ? <>New tours take <b>{tplLists.join(", ")}</b> from that tour instead of this master.</> : <>It has none of these lists, so this master is used for all of them.</>}
          </span>
          <Button type="button" size="sm" variant="outline" loading={busy === "tpl"} onClick={clearTemplate}>Remove template</Button>
        </div>
      )}
      <datalist id="tour-icon-names">{ICONS.map((i) => <option key={i} value={i} />)}</datalist>

      <div className="max-w-4xl space-y-6">
        <SectionCard
          n={4}
          title="Highlights"
          {...sec("highlights")}
          count={form.highlights.length}
          action={<Button type="button" size="sm" variant="outline" icon={Plus} onClick={() => addRow("highlights", { _k: newKey(), icon: "", title: "", subtitle: "" })}>Add highlight</Button>}
        >
          {form.highlights.length === 0 && <p className="text-sm text-slate-500">No default highlights. New tours start without any.</p>}
          <div className="space-y-3">
            {form.highlights.map((h, i) => (
              <div key={h._k} className="rounded-lg border border-stone-200 p-3">
                <div className="grid gap-3 sm:grid-cols-[130px_1fr_1fr_auto] sm:items-start">
                  <Input list="tour-icon-names" value={h.icon} onChange={(e) => setRow("highlights", i, { icon: e.target.value })} placeholder="Icon (car)" aria-label="Icon" />
                  <div data-invalid={err(`highlights.${i}.title`) ? "true" : undefined}>
                    <Input value={h.title} onChange={(e) => setRow("highlights", i, { title: e.target.value })} placeholder="Title" aria-label="Title" />
                    <Err>{err(`highlights.${i}.title`)}</Err>
                  </div>
                  <Input value={h.subtitle} onChange={(e) => setRow("highlights", i, { subtitle: e.target.value })} placeholder="Description" aria-label="Description" />
                  <RowTools index={i} total={form.highlights.length} onMove={moveRow("highlights")} onRemove={() => removeRow("highlights", i)} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">Icons: {ICONS.join(", ")}.</p>
        </SectionCard>

        <SectionCard n={7} title="Inclusions" {...sec("inclusions")} count={form.inclusions.length}>
          <div data-invalid={form.inclusions.some((_, i) => err(`inclusions.${i}`)) ? "true" : undefined}>
            <StringList items={form.inclusions} onChange={(v) => set("inclusions", v)} placeholder="Commercial AC Cab" addLabel="Add inclusion" errors={listErrors("inclusions")} />
          </div>
        </SectionCard>

        <SectionCard n={8} title="Exclusions" {...sec("exclusions")} count={form.exclusions.length}>
          <div data-invalid={form.exclusions.some((_, i) => err(`exclusions.${i}`)) ? "true" : undefined}>
            <StringList multiline items={form.exclusions} onChange={(v) => set("exclusions", v)} placeholder="Guide Charges" addLabel="Add exclusion" errors={listErrors("exclusions")} />
          </div>
        </SectionCard>

        <SectionCard n={9} title="Important notes" {...sec("important_notes")} count={form.important_notes.length}>
          <div data-invalid={form.important_notes.some((_, i) => err(`important_notes.${i}`)) ? "true" : undefined}>
            <StringList multiline items={form.important_notes} onChange={(v) => set("important_notes", v)} placeholder="Carry valid government ID proof." addLabel="Add note" errors={listErrors("important_notes")} />
          </div>
        </SectionCard>

        <SectionCard
          n={10}
          title="FAQs"
          {...sec("faqs")}
          count={form.faqs.length}
          action={<Button type="button" size="sm" variant="outline" icon={Plus} onClick={() => addRow("faqs", { _k: newKey(), question: "", answer: "" })}>Add FAQ</Button>}
        >
          {form.faqs.length === 0 && <p className="text-sm text-slate-500">No default FAQs. New tours start without any.</p>}
          <div className="space-y-3">
            {form.faqs.map((q, i) => (
              <div key={q._k} className="rounded-lg border border-stone-200 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">FAQ #{i + 1}</span>
                  <RowTools index={i} total={form.faqs.length} onMove={moveRow("faqs")} onRemove={() => removeRow("faqs", i)} />
                </div>
                <div className="space-y-3">
                  <div data-invalid={err(`faqs.${i}.question`) ? "true" : undefined}>
                    <Input value={q.question} onChange={(e) => setRow("faqs", i, { question: e.target.value })} placeholder="Question" aria-label="Question" />
                    <Err>{err(`faqs.${i}.question`)}</Err>
                  </div>
                  <div data-invalid={err(`faqs.${i}.answer`) ? "true" : undefined}>
                    <Textarea className="min-h-16" value={q.answer} onChange={(e) => setRow("faqs", i, { answer: e.target.value })} placeholder="Answer" aria-label="Answer" />
                    <Err>{err(`faqs.${i}.answer`)}</Err>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SaveBar formId="tour-defaults-form" saving={saving} label="Save default master" onCancel={() => navigate("/tour-packages")} />

      <ConfirmDialog
        open={confirmReset}
        title="Reset default master?"
        text="Your saved lists are replaced by the original 4 highlights, 10 inclusions, 11 exclusions and 8 FAQs. Existing tours are not affected."
        confirmText="Reset"
        loading={busy === "reset"}
        onConfirm={reset}
        onClose={() => setConfirmReset(false)}
      />
    </form>
  );
}
