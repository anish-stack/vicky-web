const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const { TourHotel, TourPackage } = require("../models");

const UPLOAD_ROOT = path.join(__dirname, "..");

const parseJSON = (v, fallback = []) => {
    if (v === undefined || v === null || v === "") return fallback;
    if (typeof v === "object") return v;
    try {
        return JSON.parse(v);
    } catch {
        return fallback;
    }
};
const asArray = (v) => {
    const x = parseJSON(v, []);
    return Array.isArray(x) ? x : [];
};
const parseBool = (v, d = false) => {
    if (v === undefined || v === null || v === "") return d;
    if (typeof v === "boolean") return v;
    return ["true", "1", "yes", "on"].includes(String(v).toLowerCase());
};
const toBool = (v) => {
    if (v === undefined || v === null || v === "") return undefined;
    const s = String(v).toLowerCase();
    if (["1", "true", "yes"].includes(s)) return true;
    if (["0", "false", "no"].includes(s)) return false;
    return undefined;
};

const getBaseUrl = (req) => {
    if (process.env.BASE_URL) return process.env.BASE_URL.replace(/\/+$/, "");
    const proto = String(req.get("x-forwarded-proto") || req.protocol || "https").split(",")[0].trim();
    return `${proto}://${req.get("host")}`.replace(/\/+$/, "");
};

const toRelative = (u) => {
    if (!u || typeof u !== "string") return null;
    const m = u.match(/^(?:https?:)?\/\/[^/]+(\/uploads\/.*)$/i);
    return m ? m[1] : u;
};
const toAbsolute = (u, base) =>
    !u || /^(https?:)?\/\//i.test(u) || u.startsWith("data:") ? u : `${base}${u.startsWith("/") ? "" : "/"}${u}`;

const present = (row, req) => {
    const base = getBaseUrl(req);
    const h = row.toJSON ? row.toJSON() : row;
    return {
        ...h,
        images: asArray(h.images).map((i) => toAbsolute(i, base)),
        price_per_night: h.price_per_night === null || h.price_per_night === undefined ? null : Number(h.price_per_night),
    };
};

// files that other hotels / tour packages still use must not be deleted from disk
const referencedFiles = async (exceptHotelId = null) => {
    const used = new Set();
    const grab = (blob) => (JSON.stringify(blob).match(/\/uploads\/tour-packages\/[^"\\\s]+/g) || []).forEach((f) => used.add(f));

    const tours = await TourPackage.findAll({ attributes: ["hotel_options", "cover_image", "gallery", "itinerary", "places_covered", "vehicle_options"], raw: true });
    tours.forEach(grab);

    const hotels = await TourHotel.findAll({ attributes: ["id", "images"], raw: true });
    hotels.forEach((h) => {
        if (exceptHotelId !== null && String(h.id) === String(exceptHotelId)) return;
        grab(h.images);
    });
    return used;
};

const removeFile = (url, used) => {
    const rel = toRelative(url);
    if (!rel || !rel.startsWith("/uploads/tour-packages/") || (used && used.has(rel))) return;
    try {
        const full = path.join(UPLOAD_ROOT, rel.replace(/^\//, ""));
        if (fs.existsSync(full)) fs.unlinkSync(full);
    } catch (e) {
        console.error("Unable to remove hotel image:", e.message);
    }
};

const cleanupUploads = (files = []) =>
    files.forEach((f) => {
        try {
            if (f?.path && fs.existsSync(f.path)) fs.unlinkSync(f.path);
        } catch {
            /* ignore */
        }
    });

const buildData = (req, existing = null) => {
    const body = req.body || {};
    const files = (req.files || []).filter((f) => f.fieldname === "images");

    const kept = asArray(body.images !== undefined ? body.images : existing?.images).map(toRelative).filter(Boolean);
    const images = [...kept, ...files.map((f) => `/uploads/tour-packages/${f.filename}`)];

    const price =
        body.price_per_night === undefined
            ? existing?.price_per_night ?? null
            : body.price_per_night === "" || body.price_per_night === null
              ? null
              : Number(body.price_per_night);

    return {
        name: String(body.name ?? existing?.name ?? "").trim(),
        location: String(body.location ?? existing?.location ?? "").trim() || null,
        images,
        price_per_night: Number.isFinite(price) ? price : null,
        is_default: body.is_default !== undefined ? parseBool(body.is_default) : !!existing?.is_default,
        is_active: body.is_active !== undefined ? parseBool(body.is_active, true) : existing ? !!existing.is_active : true,
        sort_order: body.sort_order !== undefined && body.sort_order !== "" ? Number(body.sort_order) || 0 : existing?.sort_order || 0,
    };
};

exports.list = async (req, res) => {
    try {
        const term = String(req.query.search || "").trim();
        const where = {};
        if (term) where[Op.or] = [{ name: { [Op.like]: `%${term}%` } }, { location: { [Op.like]: `%${term}%` } }];
        const active = toBool(req.query.is_active);
        const dflt = toBool(req.query.is_default);
        if (active !== undefined) where.is_active = active;
        if (dflt !== undefined) where.is_default = dflt;

        const order = [["sort_order", "ASC"], ["name", "ASC"]];

        if (toBool(req.query.all) === true) {
            const rows = await TourHotel.findAll({ where, order });
            return res.json({ success: true, data: rows.map((r) => present(r, req)) });
        }

        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const perPage = Math.min(Math.max(parseInt(req.query.items_per_page ?? req.query.limit, 10) || 20, 1), 100);
        const { count, rows } = await TourHotel.findAndCountAll({ where, order, offset: (page - 1) * perPage, limit: perPage });
        const lastPage = Math.max(Math.ceil(count / perPage), 1);
        const pagination = {
            page,
            items_per_page: perPage,
            total: count,
            last_page: lastPage,
            from: count ? (page - 1) * perPage + 1 : 0,
            to: Math.min(page * perPage, count),
            has_prev: page > 1,
            has_next: page < lastPage,
        };
        return res.json({ success: true, data: rows.map((r) => present(r, req)), pagination, payload: { pagination } });
    } catch (error) {
        console.error("Hotel list:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getOne = async (req, res) => {
    try {
        const row = await TourHotel.findByPk(req.params.id);
        if (!row) return res.status(404).json({ success: false, message: "Hotel not found" });
        return res.json({ success: true, data: present(row, req) });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const data = buildData(req);
        if (!data.name) {
            cleanupUploads(req.files);
            return res.status(400).json({ success: false, message: "Hotel name is required" });
        }
        if (data.price_per_night !== null && data.price_per_night < 0) {
            cleanupUploads(req.files);
            return res.status(400).json({ success: false, message: "Price must be 0 or more" });
        }
        const row = await TourHotel.create(data);
        return res.status(201).json({ success: true, message: "Hotel added", data: present(row, req) });
    } catch (error) {
        cleanupUploads(req.files);
        console.error("Hotel create:", error);
        return res.status(500).json({ success: false, message: error.message || "Unable to add hotel" });
    }
};

exports.update = async (req, res) => {
    try {
        const row = await TourHotel.findByPk(req.params.id);
        if (!row) {
            cleanupUploads(req.files);
            return res.status(404).json({ success: false, message: "Hotel not found" });
        }
        const old = row.toJSON();
        const data = buildData(req, old);
        if (!data.name) {
            cleanupUploads(req.files);
            return res.status(400).json({ success: false, message: "Hotel name is required" });
        }
        await row.update(data);

        // photos removed in this save
        const removed = asArray(old.images).filter((i) => !data.images.includes(i));
        if (removed.length) {
            const used = await referencedFiles();
            removed.forEach((i) => removeFile(i, used));
        }
        return res.json({ success: true, message: "Hotel saved", data: present(row, req) });
    } catch (error) {
        cleanupUploads(req.files);
        console.error("Hotel update:", error);
        return res.status(500).json({ success: false, message: error.message || "Unable to save hotel" });
    }
};

exports.remove = async (req, res) => {
    try {
        const row = await TourHotel.findByPk(req.params.id);
        if (!row) return res.status(404).json({ success: false, message: "Hotel not found" });
        const images = asArray(row.images);
        await row.destroy();
        const used = await referencedFiles();
        images.forEach((i) => removeFile(i, used));
        return res.json({ success: true, message: "Hotel deleted. Tours that already used it keep their saved copy." });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
