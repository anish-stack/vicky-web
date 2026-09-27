const { Op, fn, col, literal } = require("sequelize");
const {
  Transaction,
  Trip,
  User,
  Vehicle,
  cities,
  dhamPackages,
} = require("../models");

const money = (field) =>
  fn("COALESCE", fn("SUM", literal(`CAST(NULLIF(${field}, '') AS DECIMAL(14,2))`)), 0);

exports.stats = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const since14 = new Date(startOfToday);
    since14.setDate(since14.getDate() - 13);

    const [
      totalBookings,
      todayBookings,
      statusRows,
      revenueAll,
      revenueMonth,
      totalTrips,
      openLeads,
      customers,
      drivers,
      vehicles,
      cityCount,
      dhamCount,
      recent,
      dailyRows,
    ] = await Promise.all([
      Transaction.count(),
      Transaction.count({ where: { createdAt: { [Op.gte]: startOfToday } } }),
      Transaction.findAll({
        attributes: ["trip_status", [fn("COUNT", col("id")), "count"]],
        group: ["trip_status"],
        raw: true,
      }),
      Transaction.findOne({
        attributes: [
          [money("original_amount"), "fare"],
          [money("paid_amount"), "paid"],
        ],
        raw: true,
      }),
      Transaction.findOne({
        attributes: [
          [money("original_amount"), "fare"],
          [money("paid_amount"), "paid"],
        ],
        where: { createdAt: { [Op.gte]: startOfMonth } },
        raw: true,
      }),
      Trip.count(),
      Trip.count({
        where: {
          is_converted_post: false,
          id: { [Op.notIn]: literal("(SELECT DISTINCT trip_id FROM transactions)") },
        },
      }),
      User.count({ where: { role: "customer" } }),
      User.count({ where: { role: "driver" } }),
      Vehicle.count(),
      cities.count(),
      dhamPackages.count(),
      Transaction.findAll({
        attributes: [
          "id",
          "trip_id",
          "name",
          "contact",
          "vehicle_name",
          "trip_type",
          "car_tab",
          "departure_date",
          "original_amount",
          "paid_amount",
          "trip_status",
          "createdAt",
        ],
        order: [["createdAt", "DESC"]],
        limit: 8,
      }),
      Transaction.findAll({
        attributes: [
          [fn("DATE", col("createdAt")), "day"],
          [fn("COUNT", col("id")), "count"],
        ],
        where: { createdAt: { [Op.gte]: since14 } },
        group: [fn("DATE", col("createdAt"))],
        raw: true,
      }),
    ]);

    const byStatus = { reserved: 0, active: 0, completed: 0, cancel: 0 };
    statusRows.forEach((r) => {
      if (r.trip_status) byStatus[r.trip_status] = Number(r.count);
    });

    const dayMap = {};
    dailyRows.forEach((r) => {
      const key = typeof r.day === "string" ? r.day.slice(0, 10) : new Date(r.day).toISOString().slice(0, 10);
      dayMap[key] = Number(r.count);
    });
    const daily = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(since14);
      d.setDate(since14.getDate() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      daily.push({ day: key, count: dayMap[key] || 0 });
    }

    res.status(200).json({
      status: true,
      data: {
        bookings: { total: totalBookings, today: todayBookings, byStatus },
        revenue: {
          fare: Number(revenueAll?.fare || 0),
          paid: Number(revenueAll?.paid || 0),
          monthFare: Number(revenueMonth?.fare || 0),
          monthPaid: Number(revenueMonth?.paid || 0),
        },
        trips: { total: totalTrips, openLeads },
        counts: { customers, drivers, vehicles, cities: cityCount, dhamPackages: dhamCount },
        daily,
        recent,
      },
      message: "Dashboard stats fetched",
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ status: false, message: error.message });
  }
};
