
require("dotenv").config();
const mysql = require("mysql2/promise");
const { connectDB, mongoose } = require("../config/db");
const M = require("../models");
const { toSlug } = require("../utils/slug");

const idMap = {
  city: new Map(), airport: new Map(), vehicle: new Map(), plan: new Map(),
  dhamCategory: new Map(), dhamPackage: new Map(), user: new Map(),
};

const num = (v) => (v === null || v === undefined || v === "" ? 0 : Number(String(v).replace(/[^\d.-]/g, "")) || 0);
const bool = (v) => v === 1 || v === true || v === "1";

async function migrate() {
  const db = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DB || "vickycabs",
    dateStrings: true,
  });
  await connectDB();

  const q = async (sql) => {
    try {
      const [rows] = await db.query(sql);
      return rows;
    } catch (e) {
      console.warn(`[skip] ${sql.slice(0, 40)}... -> ${e.message}`);
      return [];
    }
  };

  /* ---- airports ---- */
  for (const r of await q("SELECT * FROM airports")) {
    const doc = await M.Airport.findOneAndUpdate(
      { slug: toSlug(r.name) },
      { name: r.name, slug: toSlug(r.name) },
      { upsert: true, new: true }
    );
    idMap.airport.set(r.id, doc._id);
  }
  console.log(`airports: ${idMap.airport.size}`);

  /* ---- cities ---- */
  for (const r of await q("SELECT * FROM cities")) {
    const doc = await M.City.findOneAndUpdate(
      { slug: toSlug(r.name) },
      {
        name: r.name,
        slug: toSlug(r.name),
        airport: idMap.airport.get(r.airport_id) || null,
        distance: r.distance,
        hotel: bool(r.hotel),
      },
      { upsert: true, new: true }
    );
    idMap.city.set(r.id, doc._id);
  }
  console.log(`cities: ${idMap.city.size}`);

  /* ---- pincodes ---- */
  for (const r of await q("SELECT * FROM pincodes")) {
    const city = idMap.city.get(r.city_id);
    if (!city) continue;
    await M.Pincode.findOneAndUpdate(
      { city, pincode: String(r.pincode) },
      { city, pincode: String(r.pincode), areaName: r.area_name, isValid: bool(r.validate) },
      { upsert: true }
    );
  }

  /* ---- vehicles ---- */
  for (const r of await q("SELECT * FROM vehicles")) {
    const doc = await M.Vehicle.findOneAndUpdate(
      { slug: toSlug(r.title) },
      {
        title: r.title,
        slug: toSlug(r.title),
        image: r.image,
        priceperkm: num(r.priceperkm),
        fuelcharges: r.fuelcharges,
        drivercharges: r.drivercharges,
        parkingcharges: r.parkingcharges,
        nightcharges: r.nightcharges,
        minimum_price: num(r.minimum_price),
        minimum_price_range: num(r.minimum_price_range),
        extra_fare_km: num(r.extra_fare_km),
        additional_time_charge: num(r.additional_time_charge),
        driver_expences: num(r.driver_expences),
        perdaystatetaxcharges: num(r.perdaystatetaxcharges),
        ac_cab: bool(r.ac_cab),
        luggage: r.luggage,
        terms: r.terms,
        passengers: num(r.passengers) || 4,
        large_size_bag: num(r.large_size_bag),
        medium_size_bag: num(r.medium_size_bag),
        hand_bag: num(r.hand_bag),
      },
      { upsert: true, new: true }
    );
    idMap.vehicle.set(r.id, doc._id);
  }
  console.log(`vehicles: ${idMap.vehicle.size}`);

  /* ---- one way slabs ---- */
  await M.OneWayTripPricing.deleteMany({});
  for (const r of await q("SELECT * FROM one_way_trip_pricings")) {
    const vehicle = idMap.vehicle.get(r.vehicle_id);
    if (!vehicle) continue;
    await M.OneWayTripPricing.create({
      vehicle, from: num(r.from), to: num(r.to), price_per_km: num(r.price_per_km),
    });
  }

  /* ---- local rental plans + pricing ---- */
  for (const r of await q("SELECT * FROM localrentalplans")) {
    const doc = await M.LocalRentalPlan.findOneAndUpdate(
      { hours: num(r.hours), km: num(r.km) },
      { hours: num(r.hours), km: num(r.km), label: `${r.hours} Hrs / ${r.km} Km` },
      { upsert: true, new: true }
    );
    idMap.plan.set(r.id, doc._id);
  }
  await M.LocalRentalPricing.deleteMany({});
  for (const r of await q("SELECT * FROM local_rental_pricings")) {
    const plan = idMap.plan.get(r.local_rental_plan_id);
    const city = idMap.city.get(r.city_id);
    const vehicle = idMap.vehicle.get(r.vehicle_id);
    if (!plan || !city || !vehicle) continue;
    await M.LocalRentalPricing.create({ plan, city, vehicle, price: num(r.price) });
  }

  /* ---- airport pricing ---- */
  await M.AirportPricing.deleteMany({});
  for (const r of await q("SELECT * FROM airport_pricings")) {
    const airport = idMap.airport.get(r.airport_id);
    const city = idMap.city.get(r.city_id);
    const vehicle = idMap.vehicle.get(r.vehicle_id);
    if (!airport || !city || !vehicle) continue;
    await M.AirportPricing.create({ airport, city, vehicle, price: num(r.price) });
  }

  /* ---- discounts (flattened into embedded docs) ---- */
  const discounts = await q("SELECT * FROM discounts");
  const discountCities = await q("SELECT * FROM discount_cities");
  const discountTripTypes = await q("SELECT * FROM discount_trip_types");
  const discountVehicles = await q("SELECT * FROM discount_vehicles");

  for (const d of discounts) {
    const myCities = discountCities.filter((c) => c.discount_id === d.id);
    await M.Discount.findOneAndUpdate(
      { slug: d.slug },
      {
        title: d.title,
        slug: d.slug,
        overall_discount: num(d.overall_discount),
        apply_overall_discount: bool(d.apply_overall_discount),
        apply_citywise_discount: bool(d.apply_citywise_discount),
        cities: myCities.map((c) => ({
          city: idMap.city.get(c.city_id) || null,
          pickupCityName: c.pickup_city_name,
          pickupCityPlaceId: c.pickup_city_place_id,
          dropCityName: c.drop_city_name,
          dropCityPlaceId: c.drop_city_place_id,
          isBidirectional: bool(c.is_bidirectional),
          tripTypes: discountTripTypes.filter((t) => t.discount_city_id === c.id).map((t) => t.trip_type),
          vehicles: discountVehicles
            .filter((v) => v.discount_city_id === c.id && idMap.vehicle.get(v.vehicle_id))
            .map((v) => ({
              tripType: v.trip_type,
              vehicle: idMap.vehicle.get(v.vehicle_id),
              discount: num(v.discount),
            })),
        })),
      },
      { upsert: true }
    );
  }
  console.log(`discounts: ${discounts.length}`);

  /* ---- booking limits ---- */
  await M.BookingLimit.deleteMany({});
  for (const r of await q("SELECT * FROM booking_limits")) {
    const city = idMap.city.get(r.city_id);
    const vehicle = idMap.vehicle.get(r.vehicle_id);
    if (!city || !vehicle) continue;
    await M.BookingLimit.create({
      city, vehicle,
      limitDate: r.limit_date ? new Date(r.limit_date) : null,
      maxLimit: num(r.max_limit),
    });
  }

  /* ---- advance payment + settings ---- */
  const [adv] = await q("SELECT * FROM advance_payments LIMIT 1");
  if (adv) await M.AdvancePayment.findOneAndUpdate({}, { percentage: num(adv.percentage) }, { upsert: true });
  for (const s of await q("SELECT * FROM settings")) await M.Setting.put(s.key, s.value, "pricing");

  /* ---- char dham ---- */
  for (const r of await q("SELECT * FROM dham_categories")) {
    const doc = await M.DhamCategory.findOneAndUpdate(
      { slug: toSlug(r.name) },
      { name: r.name, slug: toSlug(r.name) },
      { upsert: true, new: true }
    );
    idMap.dhamCategory.set(r.id, doc._id);
  }

  const pickupCities = await q("SELECT * FROM dham_pickup_cities");
  const dhamPricings = await q("SELECT * FROM dham_pricings");
  const dhamStops = await q("SELECT * FROM dham_stops");
  const dhamRoutes = await q("SELECT * FROM dham_package_routes");

  for (const p of await q("SELECT * FROM dham_packages")) {
    const myPickups = pickupCities.filter((c) => c.dham_package_id === p.id);
    const doc = await M.DhamPackage.findOneAndUpdate(
      { slug: toSlug(p.name) },
      {
        name: p.name,
        slug: toSlug(p.name),
        image: p.image,
        category: idMap.dhamCategory.get(Number(p.dham_category_id)) || null,
        distance: p.distance,
        routes: dhamRoutes
          .filter((r) => r.dham_package_id === p.id)
          .map((r, i) => ({ place_name: r.place_name, place_id: r.place_id, sortOrder: i })),
        pickupCities: myPickups.map((c) => ({
          name: c.name,
          days: num(c.days),
          pricings: dhamPricings
            .filter((x) => x.dham_pickup_city_id === c.id && idMap.vehicle.get(x.vehicle_id))
            .map((x) => ({
              vehicle: idMap.vehicle.get(x.vehicle_id),
              price: num(x.price),
              discount: num(x.discount),
            })),
          stops: dhamStops
            .filter((s) => s.dham_pickup_city_id === c.id)
            .map((s) => ({ name: s.name, description: s.description })),
        })),
      },
      { upsert: true, new: true }
    );
    idMap.dhamPackage.set(p.id, doc._id);
  }
  console.log(`dham packages: ${idMap.dhamPackage.size}`);

  /* ---- users ---- */
  for (const r of await q("SELECT * FROM users")) {
    if (!r.phone_number) continue;
    const doc = await M.User.findOneAndUpdate(
      { phoneNumber: String(r.phone_number) },
      {
        name: r.name || "",
        email: r.email ? String(r.email).toLowerCase() : null,
        phoneNumber: String(r.phone_number),
        role: r.role === "superadmin" ? "superadmin" : r.role || "customer",
        image: r.image,
        address: r.address,
        city: r.city,
        pinCode: r.pin_code,
        gender: ["male", "female", "other"].includes(r.gender) ? r.gender : null,
        panCard: r.pan_card,
        aadharCard: r.adhar_card,
        isPhoneVerified: true,
      },
      { upsert: true, new: true }
    );
    idMap.user.set(r.id, doc._id);
  }
  console.log(`users: ${idMap.user.size}`);
  console.warn("[note] legacy bcrypt password hashes are NOT copied — password users must reset. OTP login is unaffected.");

  await db.end();
  await mongoose.connection.close();
  console.log("[migrate] done");
}

migrate().catch(async (err) => {
  console.error("[migrate] failed:", err);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
