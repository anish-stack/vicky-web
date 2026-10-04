const { Op } = require("sequelize");
const { TourCoupon, TourPackageBooking } = require("../models");

// unpaid orders hold a coupon use for 15 minutes (same as seat hold)
const HOLD_MS = 15 * 60 * 1000;

const normCode = (v) => String(v || "").trim().toUpperCase().replace(/\s+/g, "");
const toNum = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};
const asArray = (v) => {
  if (Array.isArray(v)) return v;
  if (typeof v === "string" && v) {
    try {
      const x = JSON.parse(v);
      return Array.isArray(x) ? x : [];
    } catch {
      return [];
    }
  }
  return [];
};
const todayIST = () => new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);

/** bookings that currently "use up" a coupon */
const usedWhere = (code, extra = {}) => ({
  coupon_code: code,
  booking_status: { [Op.ne]: "cancelled" },
  [Op.or]: [
    { payment_status: { [Op.in]: ["partial", "paid"] } },
    { payment_status: "pending", created_at: { [Op.gte]: new Date(Date.now() - HOLD_MS) } },
  ],
  ...extra,
});

const countUsed = (code, extra) => TourPackageBooking.count({ where: usedWhere(code, extra) });

/** discount in whole rupees for a given trip total */
const calcDiscount = (c, total) => {
  const t = Math.max(toNum(total), 0);
  let d = c.discount_type === "percent" ? (t * toNum(c.discount_value)) / 100 : toNum(c.discount_value);
  const cap = c.max_discount === null || c.max_discount === undefined ? 0 : toNum(c.max_discount);
  if (c.discount_type === "percent" && cap > 0) d = Math.min(d, cap);
  d = Math.floor(d);
  // customer must still pay something
  return Math.max(Math.min(d, t - 1), 0);
};

const fail = (message, code = "COUPON_INVALID") => ({ ok: false, code, message });

/**
 * Checks a coupon for a tour + trip total (+ optional mobile).
 * -> { ok:true, coupon, discount } | { ok:false, code, message }
 */
async function evaluateCoupon({ code, tourId, total, mobile }) {
  const c = normCode(code);
  if (!c) return fail("Enter a coupon code");

  const coupon = await TourCoupon.findOne({ where: { code: c } });
  if (!coupon || !coupon.is_active) return fail("Invalid coupon code");

  const today = todayIST();
  if (coupon.start_date && today < coupon.start_date) return fail("This coupon is not active yet");
  if (coupon.end_date && today > coupon.end_date) return fail("This coupon has expired");

  const tours = asArray(coupon.tour_package_ids).map(Number);
  if (tours.length && !tours.includes(Number(tourId))) return fail("This coupon is not valid for this tour");

  const amount = toNum(total);
  const min = toNum(coupon.min_order_amount);
  if (min > 0 && amount < min) return fail(`Minimum booking amount for this coupon is ₹${Math.round(min).toLocaleString("en-IN")}`);

  const limit = Number(coupon.usage_limit) || 0;
  if (limit > 0 && (await countUsed(coupon.code)) >= limit) return fail("This coupon has reached its usage limit", "COUPON_LIMIT");

  const perMobile = Number(coupon.per_mobile_limit) || 0;
  const m = String(mobile || "").replace(/\D/g, "").slice(-10);
  if (perMobile > 0 && m.length === 10 && (await countUsed(coupon.code, { mobile: m })) >= perMobile)
    return fail("You have already used this coupon", "COUPON_USED");

  const discount = calcDiscount(coupon, amount);
  if (discount < 1) return fail("This coupon gives no discount on this booking");

  return { ok: true, coupon, discount };
}

module.exports = { evaluateCoupon, calcDiscount, normCode, asArray, countUsed, todayIST };
