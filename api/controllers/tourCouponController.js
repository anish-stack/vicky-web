const { Op, fn, col } = require("sequelize");
const { TourCoupon, TourPackageBooking } = require("../models");
const { evaluateCoupon, normCode, asArray, todayIST } = require("../utils/tourCoupon");

const toNum = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};
const toBool = (v) => {
  if (v === undefined || v === null || v === "") return undefined;
  const s = String(v).toLowerCase();
  if (["1", "true", "yes"].includes(s)) return true;
  if (["0", "false", "no"].includes(s)) return false;
  return undefined;
};
const isISO = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v || ""));
const emptyToNull = (v) => (v === undefined || v === null || String(v).trim() === "" ? null : v);

const present = (row, used = 0) => {
  const c = row.toJSON ? row.toJSON() : row;
  return {
    ...c,
    discount_value: toNum(c.discount_value),
    max_discount: c.max_discount === null || c.max_discount === undefined ? null : toNum(c.max_discount),
    min_order_amount: toNum(c.min_order_amount),
    tour_package_ids: asArray(c.tour_package_ids).map(Number),
    used_count: used,
  };
};

// public view (summary page offers list)
const publicView = (row) => {
  const c = present(row);
  return {
    code: c.code,
    title: c.title,
    description: c.description,
    discount_type: c.discount_type,
    discount_value: c.discount_value,
    max_discount: c.max_discount,
    min_order_amount: c.min_order_amount,
    end_date: c.end_date,
  };
};

const usedCounts = async (codes) => {
  if (!codes.length) return {};
  const rows = await TourPackageBooking.findAll({
    attributes: ["coupon_code", [fn("COUNT", col("id")), "n"]],
    where: {
      coupon_code: { [Op.in]: codes },
      booking_status: { [Op.ne]: "cancelled" },
      payment_status: { [Op.in]: ["partial", "paid"] },
    },
    group: ["coupon_code"],
    raw: true,
  });
  return Object.fromEntries(rows.map((r) => [r.coupon_code, Number(r.n)]));
};

// body -> clean column values (throws Error with message on bad input)
const readBody = (b, isUpdate = false) => {
  const out = {};
  const has = (k) => b[k] !== undefined;

  if (!isUpdate || has("code")) {
    const code = normCode(b.code);
    if (!/^[A-Z0-9_-]{3,40}$/.test(code)) throw new Error("Code must be 3-40 characters: letters, numbers, - or _");
    out.code = code;
  }
  if (has("title")) out.title = emptyToNull(String(b.title || "").trim().slice(0, 150));
  if (has("description")) out.description = emptyToNull(String(b.description || "").trim().slice(0, 500));

  if (!isUpdate || has("discount_type")) {
    if (!["percent", "flat"].includes(b.discount_type)) throw new Error("Discount type must be percent or flat");
    out.discount_type = b.discount_type;
  }
  if (!isUpdate || has("discount_value")) {
    const v = toNum(b.discount_value, NaN);
    if (!Number.isFinite(v) || v <= 0) throw new Error("Discount value must be more than 0");
    out.discount_value = v;
  }
  const type = out.discount_type || b.discount_type;
  if (out.discount_value !== undefined && type === "percent" && out.discount_value > 100) throw new Error("Percent can't be more than 100");

  if (has("max_discount")) {
    const m = emptyToNull(b.max_discount);
    if (m !== null && (!Number.isFinite(Number(m)) || Number(m) < 0)) throw new Error("Max discount must be 0 or more");
    out.max_discount = m === null || Number(m) === 0 ? null : Number(m);
  }
  if (has("min_order_amount")) {
    const m = toNum(b.min_order_amount, NaN);
    if (!Number.isFinite(m) || m < 0) throw new Error("Minimum amount must be 0 or more");
    out.min_order_amount = m;
  }
  if (has("tour_package_ids")) {
    out.tour_package_ids = [...new Set(asArray(b.tour_package_ids).map(Number).filter((n) => Number.isInteger(n) && n > 0))];
  }
  for (const k of ["start_date", "end_date"]) {
    if (has(k)) {
      const v = emptyToNull(b[k]);
      if (v !== null && !isISO(v)) throw new Error(`${k === "start_date" ? "Start" : "End"} date is invalid`);
      out[k] = v;
    }
  }
  const s = out.start_date !== undefined ? out.start_date : b.start_date;
  const e = out.end_date !== undefined ? out.end_date : b.end_date;
  if (isISO(s) && isISO(e) && e < s) throw new Error("End date can't be before start date");

  if (has("usage_limit")) {
    const n = emptyToNull(b.usage_limit);
    out.usage_limit = n === null || Number(n) <= 0 ? null : Math.floor(Number(n));
  }
  if (has("per_mobile_limit")) {
    const n = toNum(b.per_mobile_limit, 1);
    out.per_mobile_limit = n < 0 ? 0 : Math.floor(n);
  }
  if (has("is_public")) out.is_public = toBool(b.is_public) ?? true;
  if (has("is_active")) out.is_active = toBool(b.is_active) ?? true;
  return out;
};

/* ------------------------- admin ------------------------- */

exports.list = async (req, res) => {
  try {
    const term = String(req.query.search || "").trim();
    const where = {};
    if (term) where[Op.or] = [{ code: { [Op.like]: `%${term}%` } }, { title: { [Op.like]: `%${term}%` } }];
    const active = toBool(req.query.is_active);
    if (active !== undefined) where.is_active = active;

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const perPage = Math.min(Math.max(parseInt(req.query.items_per_page ?? req.query.limit, 10) || 20, 1), 100);
    const { count, rows } = await TourCoupon.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      offset: (page - 1) * perPage,
      limit: perPage,
    });
    const used = await usedCounts(rows.map((r) => r.code));
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
    return res.json({ success: true, data: rows.map((r) => present(r, used[r.code] || 0)), pagination, payload: { pagination } });
  } catch (error) {
    console.error("Coupon list:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const row = await TourCoupon.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Coupon not found" });
    const used = await usedCounts([row.code]);
    return res.json({ success: true, data: present(row, used[row.code] || 0) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    let data;
    try {
      data = readBody(req.body || {});
    } catch (e) {
      return res.status(400).json({ success: false, message: e.message });
    }
    if (await TourCoupon.findOne({ where: { code: data.code }, attributes: ["id"] })) {
      return res.status(409).json({ success: false, message: "This coupon code already exists" });
    }
    const row = await TourCoupon.create(data);
    return res.status(201).json({ success: true, message: "Coupon created", data: present(row) });
  } catch (error) {
    console.error("Coupon create:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const row = await TourCoupon.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Coupon not found" });
    let data;
    try {
      data = readBody(req.body || {}, true);
    } catch (e) {
      return res.status(400).json({ success: false, message: e.message });
    }
    if (data.code && data.code !== row.code) {
      if (await TourCoupon.findOne({ where: { code: data.code, id: { [Op.ne]: row.id } }, attributes: ["id"] })) {
        return res.status(409).json({ success: false, message: "This coupon code already exists" });
      }
    }
    await row.update(data);
    return res.json({ success: true, message: "Coupon saved", data: present(row) });
  } catch (error) {
    console.error("Coupon update:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const row = await TourCoupon.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Coupon not found" });
    await row.destroy();
    return res.json({ success: true, message: "Coupon deleted (past bookings keep their discount)" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ------------------------- public ------------------------- */

// GET /api/tour-booking/coupons?tour_package_id=1  -> public coupons usable on this tour
exports.publicList = async (req, res) => {
  try {
    const tourId = Number(req.query.tour_package_id);
    const today = todayIST();
    const rows = await TourCoupon.findAll({
      where: {
        is_active: true,
        is_public: true,
        [Op.and]: [
          { [Op.or]: [{ start_date: null }, { start_date: { [Op.lte]: today } }] },
          { [Op.or]: [{ end_date: null }, { end_date: { [Op.gte]: today } }] },
        ],
      },
      order: [["created_at", "DESC"]],
      limit: 50,
    });
    const list = rows
      .filter((r) => {
        const t = asArray(r.tour_package_ids).map(Number);
        return !t.length || (tourId && t.includes(tourId));
      })
      .map(publicView);
    return res.json({ status: true, data: list });
  } catch (error) {
    console.error("Coupon publicList:", error);
    return res.status(500).json({ status: false, message: "Could not load coupons" });
  }
};

// POST /api/tour-booking/coupon/validate { code, tour_package_id, total_amount, mobile? }
exports.validate = async (req, res) => {
  try {
    const { code, tour_package_id, total_amount, mobile } = req.body || {};
    const r = await evaluateCoupon({ code, tourId: tour_package_id, total: total_amount, mobile });
    if (!r.ok) return res.status(400).json({ status: false, code: r.code, message: r.message });
    const total = toNum(total_amount);
    return res.json({
      status: true,
      message: `Coupon ${r.coupon.code} applied`,
      data: {
        code: r.coupon.code,
        title: r.coupon.title,
        discount_type: r.coupon.discount_type,
        discount_value: toNum(r.coupon.discount_value),
        discount_amount: r.discount,
        total_after_discount: total - r.discount,
      },
    });
  } catch (error) {
    console.error("Coupon validate:", error);
    return res.status(500).json({ status: false, message: "Could not check the coupon, please try again" });
  }
};
