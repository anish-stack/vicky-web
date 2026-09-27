import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, ImagePlus, Plus, Trash2, X } from "lucide-react";
import api, { API_ORIGIN } from "../lib/api";
import useOptions from "../hooks/useOptions";
import { parseJSON } from "../lib/format";
import { Button, Card, Field, Input, Loading, PageHeader, Select, Textarea, Toggle, cx } from "../components/ui";
import { BackLink, SaveBar } from "../components/FormBits";
import { useToast } from "../components/Toast";

/* ------------------------------------------------------------------ */
/* constants & helpers                                                */
/* ------------------------------------------------------------------ */

export const TOUR_API = "/tour-package";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_MB = 5;

const blank = {
  title: "",
  slug: "",
  from_city_name: "",
  to_city_name: "",
  from_city_id: "",
  cover_image: null,
  gallery: [],
  days: 2,
  nights: 1,
  duration_label: "",
  trip_type: "roundTrip",
  short_description: "",
  description: "",
  highlights: [],
  hotel_optional: true,
  itinerary: [],
  places_covered: [],
  inclusions: [],
  exclusions: [],
  important_notes: [],
  faqs: [],
  vehicle_options: [],
  hotel_options: [],
  booking_charge_percent: 10,
  rating: 4.8,
  review_count: 0,
  is_featured: false,
  is_active: true,
  sort_order: 0,
  seo: { title: "", description: "", keywords: "", canonical: "" },
};

let keySeq = 0;
const newKey = () => `k${Date.now().toString(36)}${(keySeq++).toString(36)}`;

export const slugify = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);

const durationFor = (d, n) => `${d} Days / ${n} Night${Number(n) === 1 ? "" : "s"} Tour`;

/** Stored paths are relative ("/uploads/tours/x.webp"); preview them against the API origin. */
export const imgSrc = (path) => {
  if (!path) return "";
  if (/^(https?:|blob:|data:)/i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
};

const arr = (v) => {
  const x = parseJSON(v);
  return Array.isArray(x) ? x : [];
};
const obj = (v) => {
  const x = parseJSON(v);
  return x && typeof x === "object" && !Array.isArray(x) ? x : {};
};
const bool = (v, d) => (v === undefined || v === null || v === "" ? d : v === true || v === 1 || v === "1" || v === "true");
const numOrEmpty = (v) => (v === null || v === undefined || v === "" ? "" : v);
const strList = (v) => arr(v).map((s) => (typeof s === "string" ? s : String(s ?? "")));

const move = (list, i, dir) => {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

/** API record -> form state. Every repeatable row gets a client-only `_k` so files follow the row when rows move. */
export const normalizeTour = (t = {}) => ({
  ...blank,
  title: t.title ?? "",
  slug: t.slug ?? "",
  from_city_name: t.from_city_name ?? "",
  to_city_name: t.to_city_name ?? "",
  from_city_id: t.from_city_id ? String(t.from_city_id) : "",
  cover_image: t.cover_image || null,
  gallery: strList(t.gallery).filter(Boolean),
  days: numOrEmpty(t.days ?? blank.days),
  nights: numOrEmpty(t.nights ?? blank.nights),
  duration_label: t.duration_label ?? "",
  trip_type: t.trip_type === "oneWay" ? "oneWay" : "roundTrip",
  short_description: t.short_description ?? "",
  description: t.description ?? "",
  highlights: arr(t.highlights).map((h) => ({ _k: newKey(), icon: h?.icon ?? "", title: h?.title ?? "", subtitle: h?.subtitle ?? "" })),
  hotel_optional: bool(t.hotel_optional, true),
  itinerary: arr(t.itinerary).map((d, i) => ({
    _k: newKey(),
    day: numOrEmpty(d?.day ?? i + 1),
    title: d?.title ?? "",
    distance: d?.distance ?? "",
    duration: d?.duration ?? "",
    summary: d?.summary ?? "",
    image: d?.image || null,
    items: arr(d?.items).map((it) => ({ _k: newKey(), title: it?.title ?? "", description: it?.description ?? "" })),
  })),
  places_covered: arr(t.places_covered).map((p) => ({ _k: newKey(), name: p?.name ?? "", icon: p?.icon ?? "", image: p?.image || null })),
  inclusions: strList(t.inclusions),
  exclusions: strList(t.exclusions),
  important_notes: strList(t.important_notes),
  faqs: arr(t.faqs).map((f) => ({ _k: newKey(), question: f?.question ?? "", answer: f?.answer ?? "" })),
  vehicle_options: arr(t.vehicle_options).map((v, i) => ({
    _k: newKey(),
    vehicle: v?.vehicle ? String(v.vehicle) : "",
    label: v?.label ?? "",
    image: v?.image || null,
    seats: v?.seats ?? "",
    suitcases: v?.suitcases ?? "",
    ac: bool(v?.ac, true),
    price: numOrEmpty(v?.price),
    sortOrder: numOrEmpty(v?.sortOrder ?? i + 1),
    isActive: bool(v?.isActive, true),
  })),
  hotel_options: arr(t.hotel_options).map((h, i) => ({
    _k: newKey(),
    hotel: h?.hotel ? String(h.hotel) : "",
    name: h?.name ?? "",
    location: h?.location ?? "",
    images: strList(h?.images).filter(Boolean),
    priceOverride: numOrEmpty(h?.priceOverride),
    nights: numOrEmpty(h?.nights ?? 1),
    sortOrder: numOrEmpty(h?.sortOrder ?? i + 1),
    isActive: bool(h?.isActive, true),
  })),
  booking_charge_percent: numOrEmpty(t.booking_charge_percent ?? blank.booking_charge_percent),
  rating: numOrEmpty(t.rating ?? blank.rating),
  review_count: numOrEmpty(t.review_count ?? 0),
  is_featured: bool(t.is_featured, false),
  is_active: bool(t.is_active, true),
  sort_order: numOrEmpty(t.sort_order ?? 0),
  seo: { ...blank.seo, ...obj(t.seo) },
});

const toNum = (v, fallback = null) => (v === "" || v === null || v === undefined || Number.isNaN(Number(v)) ? fallback : Number(v));
const clean = (s) => String(s ?? "").trim();

/** Form state -> JSON payloads exactly as stored in MySQL (no `_k`, no File objects). */
const serializeJson = (f) => ({
  highlights: f.highlights.map(({ icon, title, subtitle }) => ({ icon: clean(icon), title: clean(title), subtitle: clean(subtitle) })),
  itinerary: f.itinerary.map((d) => ({
    day: toNum(d.day),
    title: clean(d.title),
    distance: clean(d.distance),
    duration: clean(d.duration),
    summary: clean(d.summary),
    image: d.image || null,
    items: d.items
      .filter((it) => clean(it.title) || clean(it.description))
      .map((it) => ({ title: clean(it.title), description: clean(it.description) })),
  })),
  places_covered: f.places_covered.map((p) => ({ name: clean(p.name), icon: clean(p.icon), image: p.image || null })),
  inclusions: f.inclusions.map(clean).filter(Boolean),
  exclusions: f.exclusions.map(clean).filter(Boolean),
  important_notes: f.important_notes.map(clean).filter(Boolean),
  faqs: f.faqs.filter((q) => clean(q.question) || clean(q.answer)).map((q) => ({ question: clean(q.question), answer: clean(q.answer) })),
  vehicle_options: f.vehicle_options.map((v) => ({
    vehicle: toNum(v.vehicle),
    label: clean(v.label),
    image: v.image || null,
    seats: clean(v.seats),
    suitcases: clean(v.suitcases),
    ac: !!v.ac,
    price: toNum(v.price, 0),
    sortOrder: toNum(v.sortOrder, 0),
    isActive: !!v.isActive,
  })),
  hotel_options: f.hotel_options.map((h) => ({
    hotel: toNum(h.hotel),
    name: clean(h.name),
    location: clean(h.location),
    images: h.images.filter(Boolean),
    priceOverride: toNum(h.priceOverride),
    nights: toNum(h.nights, 1),
    sortOrder: toNum(h.sortOrder, 0),
    isActive: !!h.isActive,
  })),
  seo: { title: clean(f.seo.title), description: clean(f.seo.description), keywords: clean(f.seo.keywords), canonical: clean(f.seo.canonical) },
});

/**
 * Build the multipart body. File keys use the row's CURRENT index, so they always match the JSON array order.
 * `files` = { cover, gallery: File[], byKey: { [rowKey]: File | File[] } }
 */
export const buildTourFormData = (f, files = {}) => {
  const fd = new FormData();
  const scalars = {
    title: clean(f.title),
    slug: clean(f.slug),
    from_city_name: clean(f.from_city_name),
    to_city_name: clean(f.to_city_name),
    from_city_id: f.from_city_id,
    days: f.days,
    nights: f.nights,
    duration_label: clean(f.duration_label),
    trip_type: f.trip_type,
    short_description: f.short_description ?? "",
    description: f.description ?? "",
    hotel_optional: String(!!f.hotel_optional),
    booking_charge_percent: f.booking_charge_percent,
    rating: f.rating,
    review_count: f.review_count,
    is_featured: String(!!f.is_featured),
    is_active: String(!!f.is_active),
    sort_order: f.sort_order === "" ? 0 : f.sort_order,
  };
  Object.entries(scalars).forEach(([k, v]) => {
    if (v === "" && (k === "from_city_id")) return; // nullable FK: omit when empty
    fd.append(k, v ?? "");
  });

  // cover_image: new File when replaced, otherwise the retained path ("" = removed)
  if (!files.cover) fd.append("cover_image", f.cover_image || "");

  const json = serializeJson(f);
  Object.entries(json).forEach(([k, v]) => fd.append(k, JSON.stringify(v)));
  // retained gallery paths (JSON text field) + new gallery files share the "gallery" key;
  // multer keeps text fields in req.body.gallery and files in req.files
  fd.append("gallery", JSON.stringify(f.gallery.filter(Boolean)));

  const byKey = files.byKey || {};
  if (files.cover) fd.append("cover_image", files.cover);
  (files.gallery || []).forEach((file) => fd.append("gallery", file));
  f.itinerary.forEach((d, i) => byKey[d._k] instanceof File && fd.append(`itinerary_${i}_image`, byKey[d._k]));
  f.places_covered.forEach((p, i) => byKey[p._k] instanceof File && fd.append(`place_${i}_image`, byKey[p._k]));
  f.vehicle_options.forEach((v, i) => byKey[v._k] instanceof File && fd.append(`vehicle_${i}_image`, byKey[v._k]));
  f.hotel_options.forEach((h, i) => (Array.isArray(byKey[h._k]) ? byKey[h._k] : []).forEach((file) => fd.append(`hotel_${i}_images`, file)));
  return fd;
};

const checkImage = (file) => {
  if (!IMAGE_TYPES.includes(file.type)) return `${file.name}: only JPG, PNG or WebP images are allowed`;
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) return `${file.name}: image must be under ${MAX_IMAGE_MB} MB`;
  return null;
};

/* ------------------------------------------------------------------ */
/* small building blocks                                              */
/* ------------------------------------------------------------------ */

const useObjectUrl = (file) => {
  const url = useMemo(() => (file instanceof File ? URL.createObjectURL(file) : ""), [file]);
  useEffect(() => () => url && URL.revokeObjectURL(url), [url]);
  return url;
};

const Err = ({ children }) => (children ? <p className="mt-1 text-xs text-red-600">{children}</p> : null);

function SectionCard({ n, title, count, action, children }) {
  return (
    <Card
      title={
        <span className="flex items-center gap-2.5">
          <span className="grid size-6 place-items-center rounded-full bg-road-800 text-xs font-semibold text-white">{n}</span>
          {title}
          {count !== undefined && <span className="tnum text-sm font-normal text-slate-500">({count})</span>}
        </span>
      }
      actions={action}
    >
      {children}
    </Card>
  );
}

function RowTools({ index, total, onMove, onRemove, removeLabel = "Remove" }) {
  return (
    <div className="flex items-center gap-0.5">
      <Button type="button" variant="ghost" size="icon" disabled={index === 0} onClick={() => onMove(index, -1)} aria-label="Move up"><ArrowUp className="size-4" /></Button>
      <Button type="button" variant="ghost" size="icon" disabled={index === total - 1} onClick={() => onMove(index, 1)} aria-label="Move down"><ArrowDown className="size-4" /></Button>
      <Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label={removeLabel}><Trash2 className="size-4 text-red-600" /></Button>
    </div>
  );
}

/** One image: existing path OR newly picked file. */
function SingleImage({ path, file, onPick, onRemove, onError, label = "Image", aspect = "aspect-video" }) {
  const inputRef = useRef(null);
  const blobUrl = useObjectUrl(file);
  const src = blobUrl || imgSrc(path);
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-slate-700">{label}</p>
      <div className={cx("relative grid w-full place-items-center overflow-hidden rounded-lg border border-dashed border-stone-300 bg-stone-50", aspect)}>
        {src ? (
          <>
            <img src={src} alt="" className="size-full object-cover" />
            {file && <span className="absolute left-2 top-2 rounded bg-brand-500 px-1.5 py-0.5 text-[10px] font-medium text-white">New</span>}
          </>
        ) : (
          <button type="button" onClick={() => inputRef.current?.click()} className="flex flex-col items-center gap-1 p-4 text-sm text-slate-500 hover:text-slate-800">
            <ImagePlus className="size-5" /> Upload image
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={IMAGE_TYPES.join(",")}
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          const err = checkImage(f);
          if (err) return onError(err);
          onPick(f);
        }}
      />
      {src && (
        <div className="mt-2 flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()}>Replace</Button>
          <Button type="button" size="sm" variant="ghost" onClick={onRemove}>Remove</Button>
        </div>
      )}
    </div>
  );
}

function Thumb({ src, isNew, onRemove, onLeft, onRight }) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-md border border-stone-200 bg-stone-100">
      <img src={src} alt="" className="size-full object-cover" loading="lazy" />
      {isNew && <span className="absolute left-1 top-1 rounded bg-brand-500 px-1 py-0.5 text-[10px] font-medium text-white">New</span>}
      <button type="button" onClick={onRemove} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80" aria-label="Remove image"><X className="size-3" /></button>
      {(onLeft || onRight) && (
        <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <button type="button" disabled={!onLeft} onClick={onLeft} className="rounded bg-black/60 px-1.5 text-xs text-white disabled:opacity-30" aria-label="Move left">‹</button>
          <button type="button" disabled={!onRight} onClick={onRight} className="rounded bg-black/60 px-1.5 text-xs text-white disabled:opacity-30" aria-label="Move right">›</button>
        </div>
      )}
    </div>
  );
}

function NewThumb({ file, onRemove }) {
  const url = useObjectUrl(file);
  return <Thumb src={url} isNew onRemove={onRemove} />;
}

/** Many images: existing paths (reorderable) + pending new files. */
function MultiImage({ paths, files, onPaths, onFiles, onError, label, hint }) {
  const inputRef = useRef(null);
  return (
    <div>
      {label && <p className="mb-1.5 text-sm font-medium text-slate-700">{label}</p>}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
        {paths.map((p, i) => (
          <Thumb
            key={p}
            src={imgSrc(p)}
            onRemove={() => onPaths(paths.filter((_, j) => j !== i))}
            onLeft={i > 0 ? () => onPaths(move(paths, i, -1)) : null}
            onRight={i < paths.length - 1 ? () => onPaths(move(paths, i, 1)) : null}
          />
        ))}
        {files.map((f, i) => (
          <NewThumb key={`${f.name}-${f.lastModified}-${i}`} file={f} onRemove={() => onFiles(files.filter((_, j) => j !== i))} />
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed border-stone-300 text-xs text-slate-500 hover:border-slate-400 hover:text-slate-800"
        >
          <ImagePlus className="size-5" /> Add
        </button>
      </div>
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
      <input
        ref={inputRef}
        type="file"
        hidden
        multiple
        accept={IMAGE_TYPES.join(",")}
        onChange={(e) => {
          const picked = Array.from(e.target.files || []);
          e.target.value = "";
          const ok = [];
          for (const f of picked) {
            const err = checkImage(f);
            if (err) onError(err);
            else ok.push(f);
          }
          if (ok.length) onFiles([...files, ...ok]);
        }}
      />
    </div>
  );
}

function StringList({ items, onChange, placeholder, addLabel, errors = {}, multiline }) {
  return (
    <div className="space-y-2">
      {items.length === 0 && <p className="text-sm text-slate-500">Nothing added yet.</p>}
      {items.map((s, i) => (
        <div key={i}>
          <div className="flex items-start gap-2">
            <span className="tnum mt-2.5 w-5 shrink-0 text-right text-sm text-slate-400">{i + 1}.</span>
            {multiline ? (
              <Textarea className="min-h-16" value={s} placeholder={placeholder} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
            ) : (
              <Input value={s} placeholder={placeholder} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
            )}
            <RowTools index={i} total={items.length} onMove={(idx, dir) => onChange(move(items, idx, dir))} onRemove={() => onChange(items.filter((_, j) => j !== i))} />
          </div>
          <Err>{errors[i]}</Err>
        </div>
      ))}
      <Button type="button" size="sm" variant="outline" icon={Plus} onClick={() => onChange([...items, ""])}>{addLabel}</Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* validation                                                         */
/* ------------------------------------------------------------------ */

const isInt = (v) => /^-?\d+$/.test(String(v).trim());
const isNum = (v) => String(v).trim() !== "" && !Number.isNaN(Number(v));

const validate = (f, byKey) => {
  const e = {};
  if (!clean(f.title)) e.title = "Title is required";
  if (!clean(f.slug)) e.slug = "Slug is required";
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(clean(f.slug))) e.slug = "Use lowercase letters, numbers and single hyphens";
  if (!clean(f.from_city_name)) e.from_city_name = "From city is required";
  if (!clean(f.to_city_name)) e.to_city_name = "To city is required";
  if (!isInt(f.days) || Number(f.days) < 1) e.days = "At least 1 day";
  if (!isInt(f.nights) || Number(f.nights) < 0) e.nights = "0 or more nights";
  if (!["roundTrip", "oneWay"].includes(f.trip_type)) e.trip_type = "Choose a trip type";
  if (!isNum(f.booking_charge_percent) || Number(f.booking_charge_percent) < 0 || Number(f.booking_charge_percent) > 100) e.booking_charge_percent = "Between 0 and 100";
  if (!isNum(f.rating) || Number(f.rating) < 0 || Number(f.rating) > 5) e.rating = "Between 0 and 5";
  if (!isInt(f.review_count) || Number(f.review_count) < 0) e.review_count = "Whole number, 0 or more";
  if (String(f.sort_order).trim() !== "" && !isInt(f.sort_order)) e.sort_order = "Whole number";

  f.highlights.forEach((h, i) => {
    if (!clean(h.title) && (clean(h.icon) || clean(h.subtitle))) e[`highlights.${i}.title`] = "Title is required";
    else if (!clean(h.title)) e[`highlights.${i}.title`] = "Fill in or remove this highlight";
  });

  f.itinerary.forEach((d, i) => {
    if (!isInt(d.day) || Number(d.day) < 1) e[`itinerary.${i}.day`] = "Day number required";
    if (!clean(d.title)) e[`itinerary.${i}.title`] = "Title is required";
    d.items.forEach((it, j) => {
      if (clean(it.description) && !clean(it.title)) e[`itinerary.${i}.items.${j}.title`] = "Activity title is required";
    });
  });
  const dayNums = f.itinerary.map((d) => String(d.day).trim()).filter(Boolean);
  dayNums.forEach((d, i) => {
    if (dayNums.indexOf(d) !== i) e[`itinerary.${i}.day`] = `Day ${d} is listed twice`;
  });

  f.places_covered.forEach((p, i) => {
    if (!clean(p.name)) e[`places.${i}.name`] = "Place name is required";
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

  f.vehicle_options.forEach((v, i) => {
    if (!clean(v.label)) e[`vehicles.${i}.label`] = "Label is required";
    if (!isNum(v.price) || Number(v.price) < 0) e[`vehicles.${i}.price`] = "Price is required (0 or more)";
    if (String(v.sortOrder).trim() !== "" && !isInt(v.sortOrder)) e[`vehicles.${i}.sortOrder`] = "Whole number";
  });

  f.hotel_options.forEach((h, i) => {
    if (!clean(h.name)) e[`hotels.${i}.name`] = "Hotel name is required";
    if (!isInt(h.nights) || Number(h.nights) < 1) e[`hotels.${i}.nights`] = "At least 1 night";
    if (String(h.priceOverride).trim() !== "" && (!isNum(h.priceOverride) || Number(h.priceOverride) < 0)) e[`hotels.${i}.priceOverride`] = "Leave empty or 0 or more";
    if (String(h.hotel).trim() !== "" && !isInt(h.hotel)) e[`hotels.${i}.hotel`] = "Hotel ID must be a number";
    if (String(h.sortOrder).trim() !== "" && !isInt(h.sortOrder)) e[`hotels.${i}.sortOrder`] = "Whole number";
    const total = h.images.length + (Array.isArray(byKey[h._k]) ? byKey[h._k].length : 0);
    if (total > 12) e[`hotels.${i}.images`] = "Up to 12 images per hotel";
  });

  const seo = f.seo;
  if (clean(seo.canonical) && !/^(\/|https?:\/\/)/i.test(clean(seo.canonical))) e["seo.canonical"] = "Start with / or https://";
  return e;
};

/* ------------------------------------------------------------------ */
/* page                                                               */
/* ------------------------------------------------------------------ */

export default function TourPackageForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: vehicles } = useOptions("/vehicles");
  const { data: cities } = useOptions("/cities");

  const [form, setForm] = useState(blank);
  const [slugTouched, setSlugTouched] = useState(false);
  const [durationTouched, setDurationTouched] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  // new files keyed by the row's `_k` (itinerary / place / vehicle -> File, hotel -> File[])
  const [rowFiles, setRowFiles] = useState({});
  const [collapsed, setCollapsed] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(!!id);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    api
      .get(`${TOUR_API}/${id}`)
      .then((r) => {
        if (!alive) return;
        const t = normalizeTour(r.data || {});
        setForm(t);
        setSlugTouched(true);
        setDurationTouched(!!t.duration_label);
        // long lists start collapsed on edit
        const c = {};
        [...t.itinerary, ...t.vehicle_options, ...t.hotel_options].forEach((x) => (c[x._k] = true));
        setCollapsed(c);
      })
      .catch((e) => alive && setLoadError(e.message))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id]);

  /* ---------- state helpers ---------- */
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setSeo = (k, v) => setForm((f) => ({ ...f, seo: { ...f.seo, [k]: v } }));
  const setRow = (list, i, patch) => setForm((f) => ({ ...f, [list]: f[list].map((r, j) => (j === i ? { ...r, ...patch } : r)) }));
  const addRow = (list, row) => setForm((f) => ({ ...f, [list]: [...f[list], row] }));
  const removeRow = (list, i) =>
    setForm((f) => {
      const row = f[list][i];
      if (row?._k) setRowFiles((rf) => { const n = { ...rf }; delete n[row._k]; return n; });
      return { ...f, [list]: f[list].filter((_, j) => j !== i) };
    });
  const moveRow = (list) => (i, dir) => setForm((f) => ({ ...f, [list]: move(f[list], i, dir) }));
  const setFile = (key, file) => setRowFiles((rf) => ({ ...rf, [key]: file }));
  const toggle = (key) => setCollapsed((c) => ({ ...c, [key]: !c[key] }));
  const err = (k) => errors[k];

  const onTitle = (v) =>
    setForm((f) => ({ ...f, title: v, slug: slugTouched ? f.slug : slugify(v), seo: f.seo }));
  const onDays = (k, v) =>
    setForm((f) => {
      const next = { ...f, [k]: v };
      if (!durationTouched && isInt(next.days) && isInt(next.nights)) next.duration_label = durationFor(next.days, next.nights);
      return next;
    });

  useEffect(() => {
    if (!id && !durationTouched) setForm((f) => ({ ...f, duration_label: durationFor(f.days, f.nights) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickVehicle = (i, vehicleId) => {
    const v = vehicles.find((x) => String(x.id) === String(vehicleId));
    setForm((f) => ({
      ...f,
      vehicle_options: f.vehicle_options.map((row, j) => {
        if (j !== i) return row;
        if (!v) return { ...row, vehicle: vehicleId };
        const bags = (Number(v.large_size_bag) || 0) + (Number(v.medium_size_bag) || 0);
        return {
          ...row,
          vehicle: String(v.id),
          label: row.label || v.title || "",
          image: row.image || (v.image ? `/vehicle/${v.image}` : null),
          seats: row.seats || (v.passengers ? `${v.passengers}+1 Seats` : ""),
          suitcases: row.suitcases || (bags ? `${bags} Suitcases` : ""),
          ac: v.ac_cab === undefined ? row.ac : !!v.ac_cab,
        };
      }),
    }));
  };

  const pickFromCity = (cityId) => {
    const c = cities.find((x) => String(x.id) === String(cityId));
    setForm((f) => ({ ...f, from_city_id: cityId, from_city_name: c && !clean(f.from_city_name) ? c.name : f.from_city_name }));
  };

  /* ---------- submit ---------- */
  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate(form, rowFiles);
    setErrors(e);
    if (Object.keys(e).length) {
      // open collapsed cards that contain errors
      const open = {};
      [["itinerary", "itinerary"], ["vehicle_options", "vehicles"], ["hotel_options", "hotels"]].forEach(([list, prefix]) =>
        form[list].forEach((r, i) => Object.keys(e).some((k) => k.startsWith(`${prefix}.${i}.`)) && (open[r._k] = false))
      );
      setCollapsed((c) => ({ ...c, ...open }));
      toast.error(`Fix ${Object.keys(e).length} highlighted field${Object.keys(e).length > 1 ? "s" : ""} before saving`);
      requestAnimationFrame(() => document.querySelector("[data-invalid='true']")?.scrollIntoView({ behavior: "smooth", block: "center" }));
      return;
    }
    const fd = buildTourFormData(form, { cover: coverFile, gallery: galleryFiles, byKey: rowFiles });
    setSaving(true);
    try {
      const r = id ? await api.put(`${TOUR_API}/${id}`, fd) : await api.post(TOUR_API, fd);
      toast.success(r?.message || (id ? "Tour package saved" : "Tour package added"));
      navigate("/tour-packages");
    } catch (e2) {
      toast.error(e2);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;
  if (loadError)
    return (
      <>
        <PageHeader back={<BackLink to="/tour-packages">Tour packages</BackLink>} title="Edit tour package" />
        <Card><p className="text-sm text-red-600">{loadError}</p></Card>
      </>
    );

  const F = ({ name, label, required, hint, className, children }) => (
    <Field label={label} required={required} hint={hint} error={err(name)} className={className}>
      <div data-invalid={err(name) ? "true" : undefined}>{children}</div>
    </Field>
  );

  const cityOptions = cities.map((c) => ({ value: String(c.id), label: c.name }));
  const vehicleOptions = vehicles.map((v) => ({ value: String(v.id), label: v.title }));

  return (
    <form id="tour-form" onSubmit={submit} noValidate>
      <PageHeader
        back={<BackLink to="/tour-packages">Tour packages</BackLink>}
        title={id ? `Edit ${form.title || "tour package"}` : "Add tour package"}
        subtitle={form.from_city_name && form.to_city_name ? `${form.from_city_name} → ${form.to_city_name}` : undefined}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* ================= main column ================= */}
        <div className="min-w-0 space-y-6">
          <SectionCard n={1} title="Basic information">
            <div className="grid gap-4 sm:grid-cols-2">
              {F({ name: "title", label: "Title", required: true, className: "sm:col-span-2", children: (
                <Input value={form.title} onChange={(e) => onTitle(e.target.value)} placeholder="Delhi to Mathura Vrindavan Tour" />
              ) })}
              {F({ name: "slug", label: "Slug", required: true, className: "sm:col-span-2", hint: slugTouched ? "Edited manually" : "Generated from the title", children: (
                <div className="flex gap-2">
                  <Input value={form.slug} onChange={(e) => { setSlugTouched(true); set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-")); }} />
                  <Button type="button" variant="outline" onClick={() => { setSlugTouched(false); set("slug", slugify(form.title)); }}>Regenerate</Button>
                </div>
              ) })}
              {F({ name: "from_city_name", label: "From city", required: true, children: (
                <Input value={form.from_city_name} onChange={(e) => set("from_city_name", e.target.value)} placeholder="Delhi" />
              ) })}
              {F({ name: "to_city_name", label: "To city / destination", required: true, children: (
                <Input value={form.to_city_name} onChange={(e) => set("to_city_name", e.target.value)} placeholder="Mathura - Vrindavan" />
              ) })}
              {F({ name: "from_city_id", label: "Linked service city", hint: "Optional. Links pickup to a city in the Cities list", children: (
                <Select value={form.from_city_id} onChange={(e) => pickFromCity(e.target.value)} placeholder="Not linked" options={cityOptions} />
              ) })}
              {F({ name: "trip_type", label: "Trip type", required: true, children: (
                <Select value={form.trip_type} onChange={(e) => set("trip_type", e.target.value)} options={[{ value: "roundTrip", label: "Round trip" }, { value: "oneWay", label: "One way" }]} />
              ) })}
            </div>
          </SectionCard>

          <SectionCard n={2} title="Route & duration">
            <div className="grid gap-4 sm:grid-cols-[120px_120px_1fr]">
              {F({ name: "days", label: "Days", required: true, children: (
                <Input inputMode="numeric" value={form.days} onChange={(e) => onDays("days", e.target.value.replace(/\D/g, ""))} />
              ) })}
              {F({ name: "nights", label: "Nights", required: true, children: (
                <Input inputMode="numeric" value={form.nights} onChange={(e) => onDays("nights", e.target.value.replace(/\D/g, ""))} />
              ) })}
              {F({ name: "duration_label", label: "Duration label", hint: durationTouched ? "Edited manually" : "Updates with days and nights", children: (
                <div className="flex gap-2">
                  <Input value={form.duration_label} onChange={(e) => { setDurationTouched(true); set("duration_label", e.target.value); }} />
                  {durationTouched && (
                    <Button type="button" variant="outline" onClick={() => { setDurationTouched(false); set("duration_label", durationFor(form.days || 0, form.nights || 0)); }}>Reset</Button>
                  )}
                </div>
              ) })}
            </div>
          </SectionCard>

          <SectionCard n={3} title="Descriptions">
            <div className="space-y-4">
              <Field label="Short description" hint={`${form.short_description.length} characters. Shown on package cards`}>
                <Textarea rows={3} value={form.short_description} onChange={(e) => set("short_description", e.target.value)} />
              </Field>
              <Field label="Full description" hint="Plain text or HTML, as used on the website">
                <Textarea rows={10} value={form.description} onChange={(e) => set("description", e.target.value)} />
              </Field>
            </div>
          </SectionCard>

          <SectionCard
            n={4}
            title="Highlights"
            count={form.highlights.length}
            action={<Button type="button" size="sm" variant="outline" icon={Plus} onClick={() => addRow("highlights", { _k: newKey(), icon: "", title: "", subtitle: "" })}>Add highlight</Button>}
          >
            {form.highlights.length === 0 && <p className="text-sm text-slate-500">Short selling points, e.g. “Private cab · AC cab with driver”.</p>}
            <div className="space-y-3">
              {form.highlights.map((h, i) => (
                <div key={h._k} className="rounded-lg border border-stone-200 p-3">
                  <div className="grid gap-3 sm:grid-cols-[130px_1fr_1fr_auto] sm:items-start">
                    <Input value={h.icon} onChange={(e) => setRow("highlights", i, { icon: e.target.value })} placeholder="Icon (calendar)" aria-label="Icon" />
                    <div data-invalid={err(`highlights.${i}.title`) ? "true" : undefined}>
                      <Input value={h.title} onChange={(e) => setRow("highlights", i, { title: e.target.value })} placeholder="Title" aria-label="Title" />
                      <Err>{err(`highlights.${i}.title`)}</Err>
                    </div>
                    <Input value={h.subtitle} onChange={(e) => setRow("highlights", i, { subtitle: e.target.value })} placeholder="Subtitle" aria-label="Subtitle" />
                    <RowTools index={i} total={form.highlights.length} onMove={moveRow("highlights")} onRemove={() => removeRow("highlights", i)} />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            n={5}
            title="Itinerary"
            count={form.itinerary.length}
            action={
              <Button type="button" size="sm" variant="outline" icon={Plus}
                onClick={() => addRow("itinerary", { _k: newKey(), day: form.itinerary.length + 1, title: "", distance: "", duration: "", summary: "", image: null, items: [] })}>
                Add day
              </Button>
            }
          >
            {form.itinerary.length === 0 && <p className="text-sm text-slate-500">Add the day-by-day plan.</p>}
            <div className="space-y-4">
              {form.itinerary.map((d, i) => {
                const open = !collapsed[d._k];
                return (
                  <div key={d._k} className="rounded-lg border border-stone-200">
                    <div className="flex items-center gap-2 border-b border-stone-200 bg-stone-50 px-3 py-2">
                      <button type="button" onClick={() => toggle(d._k)} className="flex min-w-0 flex-1 items-center gap-2 text-left" aria-expanded={open}>
                        {open ? <ChevronDown className="size-4 shrink-0" /> : <ChevronRight className="size-4 shrink-0" />}
                        <span className="font-medium">Day {d.day || i + 1}</span>
                        <span className="truncate text-sm text-slate-500">{d.title}</span>
                        {(err(`itinerary.${i}.day`) || err(`itinerary.${i}.title`)) && <span className="text-xs text-red-600">has errors</span>}
                      </button>
                      <RowTools index={i} total={form.itinerary.length} onMove={moveRow("itinerary")} onRemove={() => removeRow("itinerary", i)} removeLabel="Remove day" />
                    </div>
                    {open && (
                      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_220px]">
                        <div className="space-y-3">
                          <div className="grid gap-3 sm:grid-cols-[90px_1fr]">
                            {F({ name: `itinerary.${i}.day`, label: "Day", required: true, children: (
                              <Input inputMode="numeric" value={d.day} onChange={(e) => setRow("itinerary", i, { day: e.target.value.replace(/\D/g, "") })} />
                            ) })}
                            {F({ name: `itinerary.${i}.title`, label: "Title", required: true, children: (
                              <Input value={d.title} onChange={(e) => setRow("itinerary", i, { title: e.target.value })} placeholder="Day 1 - Delhi to Mathura" />
                            ) })}
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <Field label="Distance"><Input value={d.distance} onChange={(e) => setRow("itinerary", i, { distance: e.target.value })} placeholder="230 Kms" /></Field>
                            <Field label="Travel time"><Input value={d.duration} onChange={(e) => setRow("itinerary", i, { duration: e.target.value })} placeholder="6-7 hrs" /></Field>
                          </div>
                          <Field label="Summary"><Textarea className="min-h-16" value={d.summary} onChange={(e) => setRow("itinerary", i, { summary: e.target.value })} /></Field>

                          <div className="rounded-md border border-stone-200 p-3">
                            <p className="mb-2 text-sm font-medium text-slate-700">Activities</p>
                            {d.items.length === 0 && <p className="mb-2 text-xs text-slate-500">No activities yet.</p>}
                            <ol className="space-y-2">
                              {d.items.map((it, j) => (
                                <li key={it._k} className="flex items-start gap-2">
                                  <span className="tnum mt-2.5 w-5 shrink-0 text-right text-sm text-slate-400">{j + 1}.</span>
                                  <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[1fr_1.4fr]">
                                    <div data-invalid={err(`itinerary.${i}.items.${j}.title`) ? "true" : undefined}>
                                      <Input value={it.title} placeholder="Title" aria-label="Activity title"
                                        onChange={(e) => setRow("itinerary", i, { items: d.items.map((x, k) => (k === j ? { ...x, title: e.target.value } : x)) })} />
                                      <Err>{err(`itinerary.${i}.items.${j}.title`)}</Err>
                                    </div>
                                    <Input value={it.description} placeholder="Description" aria-label="Activity description"
                                      onChange={(e) => setRow("itinerary", i, { items: d.items.map((x, k) => (k === j ? { ...x, description: e.target.value } : x)) })} />
                                  </div>
                                  <RowTools index={j} total={d.items.length}
                                    onMove={(idx, dir) => setRow("itinerary", i, { items: move(d.items, idx, dir) })}
                                    onRemove={() => setRow("itinerary", i, { items: d.items.filter((_, k) => k !== j) })} removeLabel="Remove activity" />
                                </li>
                              ))}
                            </ol>
                            <Button type="button" size="sm" variant="ghost" icon={Plus} className="mt-2"
                              onClick={() => setRow("itinerary", i, { items: [...d.items, { _k: newKey(), title: "", description: "" }] })}>
                              Add activity
                            </Button>
                          </div>
                        </div>
                        <SingleImage
                          label="Day image"
                          path={d.image}
                          file={rowFiles[d._k]}
                          onError={toast.error}
                          onPick={(f) => setFile(d._k, f)}
                          onRemove={() => { setFile(d._k, undefined); setRow("itinerary", i, { image: null }); }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard
            n={6}
            title="Places covered"
            count={form.places_covered.length}
            action={<Button type="button" size="sm" variant="outline" icon={Plus} onClick={() => addRow("places_covered", { _k: newKey(), name: "", icon: "", image: null })}>Add place</Button>}
          >
            {form.places_covered.length === 0 && <p className="text-sm text-slate-500">Temples, ghats and sights visited on this tour.</p>}
            <div className="grid gap-4 md:grid-cols-2">
              {form.places_covered.map((p, i) => (
                <div key={p._k} className="rounded-lg border border-stone-200 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Place #{i + 1}</span>
                    <RowTools index={i} total={form.places_covered.length} onMove={moveRow("places_covered")} onRemove={() => removeRow("places_covered", i)} />
                  </div>
                  <div className="grid grid-cols-[1fr_110px] gap-3">
                    <div className="space-y-3">
                      {F({ name: `places.${i}.name`, label: "Name", required: true, children: (
                        <Input value={p.name} onChange={(e) => setRow("places_covered", i, { name: e.target.value })} placeholder="Krishna Janmabhoomi" />
                      ) })}
                      <Field label="Icon"><Input value={p.icon} onChange={(e) => setRow("places_covered", i, { icon: e.target.value })} placeholder="temple" /></Field>
                    </div>
                    <SingleImage
                      label="Image"
                      aspect="aspect-square"
                      path={p.image}
                      file={rowFiles[p._k]}
                      onError={toast.error}
                      onPick={(f) => setFile(p._k, f)}
                      onRemove={() => { setFile(p._k, undefined); setRow("places_covered", i, { image: null }); }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard n={7} title="Inclusions" count={form.inclusions.length}>
            <StringList items={form.inclusions} onChange={(v) => set("inclusions", v)} placeholder="Private AC cab" addLabel="Add inclusion"
              errors={Object.fromEntries(form.inclusions.map((_, i) => [i, err(`inclusions.${i}`)]))} />
          </SectionCard>

          <SectionCard n={8} title="Exclusions" count={form.exclusions.length}>
            <StringList items={form.exclusions} onChange={(v) => set("exclusions", v)} placeholder="Meals" addLabel="Add exclusion"
              errors={Object.fromEntries(form.exclusions.map((_, i) => [i, err(`exclusions.${i}`)]))} />
          </SectionCard>

          <SectionCard n={9} title="Important notes" count={form.important_notes.length}>
            <StringList multiline items={form.important_notes} onChange={(v) => set("important_notes", v)} placeholder="Carry valid government ID proof." addLabel="Add note"
              errors={Object.fromEntries(form.important_notes.map((_, i) => [i, err(`important_notes.${i}`)]))} />
          </SectionCard>

          <SectionCard
            n={10}
            title="FAQs"
            count={form.faqs.length}
            action={<Button type="button" size="sm" variant="outline" icon={Plus} onClick={() => addRow("faqs", { _k: newKey(), question: "", answer: "" })}>Add FAQ</Button>}
          >
            {form.faqs.length === 0 && <p className="text-sm text-slate-500">No FAQs yet.</p>}
            <div className="space-y-3">
              {form.faqs.map((q, i) => (
                <div key={q._k} className="rounded-lg border border-stone-200 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">FAQ #{i + 1}</span>
                    <RowTools index={i} total={form.faqs.length} onMove={moveRow("faqs")} onRemove={() => removeRow("faqs", i)} />
                  </div>
                  <div className="space-y-3">
                    {F({ name: `faqs.${i}.question`, label: "Question", children: (
                      <Input value={q.question} onChange={(e) => setRow("faqs", i, { question: e.target.value })} placeholder="Is hotel included?" />
                    ) })}
                    {F({ name: `faqs.${i}.answer`, label: "Answer", children: (
                      <Textarea className="min-h-16" value={q.answer} onChange={(e) => setRow("faqs", i, { answer: e.target.value })} />
                    ) })}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            n={11}
            title="Vehicle options"
            count={form.vehicle_options.length}
            action={
              <Button type="button" size="sm" variant="outline" icon={Plus}
                onClick={() => addRow("vehicle_options", { _k: newKey(), vehicle: "", label: "", image: null, seats: "", suitcases: "", ac: true, price: "", sortOrder: form.vehicle_options.length + 1, isActive: true })}>
                Add vehicle
              </Button>
            }
          >
            {form.vehicle_options.length === 0 && <p className="text-sm text-slate-500">Add at least one vehicle so customers can book. The lowest active price shows as “starting from”.</p>}
            <div className="space-y-4">
              {form.vehicle_options.map((v, i) => {
                const open = !collapsed[v._k];
                const hasErr = Object.keys(errors).some((k) => k.startsWith(`vehicles.${i}.`));
                return (
                  <div key={v._k} className={cx("rounded-lg border", v.isActive ? "border-stone-200" : "border-dashed border-stone-300 opacity-80")}>
                    <div className="flex items-center gap-2 border-b border-stone-200 bg-stone-50 px-3 py-2">
                      <button type="button" onClick={() => toggle(v._k)} className="flex min-w-0 flex-1 items-center gap-2 text-left" aria-expanded={open}>
                        {open ? <ChevronDown className="size-4 shrink-0" /> : <ChevronRight className="size-4 shrink-0" />}
                        <span className="font-medium">Vehicle #{i + 1}</span>
                        <span className="truncate text-sm text-slate-500">{v.label}{v.price !== "" ? ` · ₹${Number(v.price).toLocaleString("en-IN")}` : ""}{!v.isActive ? " · inactive" : ""}</span>
                        {hasErr && <span className="text-xs text-red-600">has errors</span>}
                      </button>
                      <RowTools index={i} total={form.vehicle_options.length} onMove={moveRow("vehicle_options")} onRemove={() => removeRow("vehicle_options", i)} removeLabel="Remove vehicle" />
                    </div>
                    {open && (
                      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_220px]">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field label="Vehicle" hint="Fills label, seats and image when empty">
                            <Select value={v.vehicle} onChange={(e) => pickVehicle(i, e.target.value)} placeholder="Not linked" options={vehicleOptions} />
                          </Field>
                          {F({ name: `vehicles.${i}.label`, label: "Label", required: true, children: (
                            <Input value={v.label} onChange={(e) => setRow("vehicle_options", i, { label: e.target.value })} placeholder="Hatchback" />
                          ) })}
                          <Field label="Seats"><Input value={v.seats} onChange={(e) => setRow("vehicle_options", i, { seats: e.target.value })} placeholder="4+1 Seats" /></Field>
                          <Field label="Suitcases"><Input value={v.suitcases} onChange={(e) => setRow("vehicle_options", i, { suitcases: e.target.value })} placeholder="2 Suitcases" /></Field>
                          {F({ name: `vehicles.${i}.price`, label: "Package price (₹)", required: true, children: (
                            <Input inputMode="decimal" value={v.price} onChange={(e) => setRow("vehicle_options", i, { price: e.target.value })} placeholder="9999" />
                          ) })}
                          {F({ name: `vehicles.${i}.sortOrder`, label: "Sort order", children: (
                            <Input inputMode="numeric" value={v.sortOrder} onChange={(e) => setRow("vehicle_options", i, { sortOrder: e.target.value.replace(/[^\d-]/g, "") })} />
                          ) })}
                          <Toggle checked={v.ac} onChange={(val) => setRow("vehicle_options", i, { ac: val })} label="Air conditioned" />
                          <Toggle checked={v.isActive} onChange={(val) => setRow("vehicle_options", i, { isActive: val })} label="Active" />
                        </div>
                        <SingleImage
                          label="Image"
                          path={v.image}
                          file={rowFiles[v._k]}
                          onError={toast.error}
                          onPick={(f) => setFile(v._k, f)}
                          onRemove={() => { setFile(v._k, undefined); setRow("vehicle_options", i, { image: null }); }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard
            n={12}
            title="Hotel options"
            count={form.hotel_options.length}
            action={
              <Button type="button" size="sm" variant="outline" icon={Plus}
                onClick={() => addRow("hotel_options", { _k: newKey(), hotel: "", name: "", location: "", images: [], priceOverride: "", nights: form.nights > 0 ? form.nights : 1, sortOrder: form.hotel_options.length + 1, isActive: true })}>
                Add hotel
              </Button>
            }
          >
            {form.hotel_options.length === 0 && <p className="text-sm text-slate-500">Optional stays customers can add to the package.</p>}
            <div className="space-y-4">
              {form.hotel_options.map((h, i) => {
                const open = !collapsed[h._k];
                const newFiles = Array.isArray(rowFiles[h._k]) ? rowFiles[h._k] : [];
                const hasErr = Object.keys(errors).some((k) => k.startsWith(`hotels.${i}.`));
                return (
                  <div key={h._k} className={cx("rounded-lg border", h.isActive ? "border-stone-200" : "border-dashed border-stone-300 opacity-80")}>
                    <div className="flex items-center gap-2 border-b border-stone-200 bg-stone-50 px-3 py-2">
                      <button type="button" onClick={() => toggle(h._k)} className="flex min-w-0 flex-1 items-center gap-2 text-left" aria-expanded={open}>
                        {open ? <ChevronDown className="size-4 shrink-0" /> : <ChevronRight className="size-4 shrink-0" />}
                        <span className="font-medium">Hotel #{i + 1}</span>
                        <span className="truncate text-sm text-slate-500">{h.name}{h.location ? `, ${h.location}` : ""} · {h.images.length + newFiles.length} photos{!h.isActive ? " · inactive" : ""}</span>
                        {hasErr && <span className="text-xs text-red-600">has errors</span>}
                      </button>
                      <RowTools index={i} total={form.hotel_options.length} onMove={moveRow("hotel_options")} onRemove={() => removeRow("hotel_options", i)} removeLabel="Remove hotel" />
                    </div>
                    {open && (
                      <div className="space-y-4 p-4">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {F({ name: `hotels.${i}.hotel`, label: "Hotel ID", hint: "Optional reference to your hotel records", children: (
                            <Input inputMode="numeric" value={h.hotel} onChange={(e) => setRow("hotel_options", i, { hotel: e.target.value.replace(/\D/g, "") })} />
                          ) })}
                          {F({ name: `hotels.${i}.name`, label: "Name", required: true, children: (
                            <Input value={h.name} onChange={(e) => setRow("hotel_options", i, { name: e.target.value })} placeholder="Hotel Brijwasi Royal" />
                          ) })}
                          <Field label="Location"><Input value={h.location} onChange={(e) => setRow("hotel_options", i, { location: e.target.value })} placeholder="Mathura" /></Field>
                          {F({ name: `hotels.${i}.priceOverride`, label: "Price override (₹)", hint: "Empty = default hotel price", children: (
                            <Input inputMode="decimal" value={h.priceOverride} onChange={(e) => setRow("hotel_options", i, { priceOverride: e.target.value })} />
                          ) })}
                          {F({ name: `hotels.${i}.nights`, label: "Nights", required: true, children: (
                            <Input inputMode="numeric" value={h.nights} onChange={(e) => setRow("hotel_options", i, { nights: e.target.value.replace(/\D/g, "") })} />
                          ) })}
                          {F({ name: `hotels.${i}.sortOrder`, label: "Sort order", children: (
                            <Input inputMode="numeric" value={h.sortOrder} onChange={(e) => setRow("hotel_options", i, { sortOrder: e.target.value.replace(/[^\d-]/g, "") })} />
                          ) })}
                        </div>
                        <Toggle checked={h.isActive} onChange={(val) => setRow("hotel_options", i, { isActive: val })} label="Active" />
                        <div data-invalid={err(`hotels.${i}.images`) ? "true" : undefined}>
                          <MultiImage
                            label="Photos"
                            hint="4–5 photos work best. First photo is the main one; use ‹ › to reorder saved photos."
                            paths={h.images}
                            files={newFiles}
                            onError={toast.error}
                            onPaths={(paths) => setRow("hotel_options", i, { images: paths })}
                            onFiles={(files) => setFile(h._k, files)}
                          />
                          <Err>{err(`hotels.${i}.images`)}</Err>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard n={13} title="SEO">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="SEO title" hint={`${form.seo.title.length}/60`} className="sm:col-span-2">
                <Input value={form.seo.title} onChange={(e) => setSeo("title", e.target.value)} placeholder={form.title} />
              </Field>
              <Field label="Meta description" hint={`${form.seo.description.length}/160`} className="sm:col-span-2">
                <Textarea className="min-h-20" value={form.seo.description} onChange={(e) => setSeo("description", e.target.value)} />
              </Field>
              <Field label="Keywords" hint="Comma separated"><Input value={form.seo.keywords} onChange={(e) => setSeo("keywords", e.target.value)} /></Field>
              {F({ name: "seo.canonical", label: "Canonical URL", children: (
                <div className="flex gap-2">
                  <Input value={form.seo.canonical} onChange={(e) => setSeo("canonical", e.target.value)} placeholder={form.slug ? `/tour/${form.slug}` : "/tour/…"} />
                  {form.slug && <Button type="button" variant="outline" onClick={() => setSeo("canonical", `/tour/${form.slug}`)}>Use slug</Button>}
                </div>
              ) })}
            </div>
          </SectionCard>
        </div>

        {/* ================= sidebar ================= */}
        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <Card title="Cover image">
            <SingleImage
              label="Shown on listing cards and the page header"
              path={form.cover_image}
              file={coverFile}
              onError={toast.error}
              onPick={setCoverFile}
              onRemove={() => { setCoverFile(null); set("cover_image", null); }}
            />
          </Card>

          <Card title={`Gallery (${form.gallery.length + galleryFiles.length})`}>
            <MultiImage
              paths={form.gallery}
              files={galleryFiles}
              onError={toast.error}
              onPaths={(p) => set("gallery", p)}
              onFiles={setGalleryFiles}
              hint="New photos are added after saved ones."
            />
          </Card>

          <Card title="Settings">
            <div className="space-y-4">
              <Toggle checked={form.is_active} onChange={(v) => set("is_active", v)} label="Active (visible on website)" />
              <Toggle checked={form.is_featured} onChange={(v) => set("is_featured", v)} label="Featured" />
              <Toggle checked={form.hotel_optional} onChange={(v) => set("hotel_optional", v)} label="Hotel is optional" />
              {F({ name: "booking_charge_percent", label: "Booking charge (%)", hint: "Advance paid online to confirm", children: (
                <Input inputMode="decimal" value={form.booking_charge_percent} onChange={(e) => set("booking_charge_percent", e.target.value)} />
              ) })}
              <div className="grid grid-cols-2 gap-3">
                {F({ name: "rating", label: "Rating", children: (
                  <Input inputMode="decimal" value={form.rating} onChange={(e) => set("rating", e.target.value)} />
                ) })}
                {F({ name: "review_count", label: "Reviews", children: (
                  <Input inputMode="numeric" value={form.review_count} onChange={(e) => set("review_count", e.target.value.replace(/\D/g, ""))} />
                ) })}
              </div>
              {F({ name: "sort_order", label: "Sort order", hint: "Lower shows first", children: (
                <Input inputMode="numeric" value={form.sort_order} onChange={(e) => set("sort_order", e.target.value.replace(/[^\d-]/g, ""))} />
              ) })}
            </div>
          </Card>
        </aside>
      </div>

      <SaveBar formId="tour-form" saving={saving} label={id ? "Save tour package" : "Add tour package"} onCancel={() => navigate("/tour-packages")} />
    </form>
  );
}
