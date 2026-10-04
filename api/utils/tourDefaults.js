// Default master for NEW tour packages (Admin > Tours > Default master).
// Stored in its own table `tour_package_defaults` (model TourDefault), one row
// per line. The built-in lists below are written there automatically the first
// time they are needed.

const { TourDefault, Setting, sequelize } = require("../models");

// older builds kept the lists as JSON in `settings`; moved into the table on first read
const LEGACY_SETTING_KEY = "tour_default_master";

const MAX_ROWS = 60;
const MAX_TEXT = 1000;

const BUILTIN_MASTER = {
    highlights: [
        { icon: "car", title: "Commercial AC Cab", subtitle: "Comfortable AC cab with driver" },
        { icon: "map-pin", title: "Delhi NCR Pickup & Drop", subtitle: "Free within 60 KM of India Gate" },
        { icon: "map", title: "Planned Sightseeing", subtitle: "Major attractions as per itinerary" },
        { icon: "route", title: "Comfortable Road Journey", subtitle: "Well-planned private tour by cab" },
    ],
    inclusions: [
        "Commercial AC Cab",
        "Fuel Charges Included",
        "Driver Allowance Included",
        "Toll Tax Included",
        "State Tax Included",
        "Free Pickup within 50 KM of India Gate (Delhi NCR)",
        "Free Drop within 50 KM of India Gate (Delhi NCR)",
        "Local Sightseeing as per Itinerary, subject to local taxi union rules",
        "Hotel Charges Included Only if Hotel is Selected During Booking",
        "Dedicated Cab for the Complete Tour",
    ],
    exclusions: [
        "Hotel Charges Unless Hotel is Selected During Booking",
        "Breakfast, Meals and Beverages",
        "Entry Fees for Any Place or Attraction",
        "Guide Charges",
        "Personal Expenses",
        "Parking Charges",
        "Airport / Railway Station Pickup Charges, if Applicable",
        "One Pickup Location and One Drop Location Included. Additional Pickup or Drop Locations Will Be Chargeable Extra.",
        "Any Travel Outside the Planned Tour Route or Destination Will Be Charged Extra Based on Additional Kilometres and Time, as per the Selected Vehicle Category.",
        "Standard Drop Time is 10:00 PM. Extra Time Charges Apply After 11:00 PM \u2014 Hatchback & Sedan \u20b9250/hour; Ertiga SUV / Prime SUV \u20b9300/hour. Any Part of an Hour After 11:00 PM Will Be Charged as a Full Hour.",
        "Tour Extension Charges: If the tour extends beyond the booked duration, each additional day will be charged separately based on the selected vehicle category and the applicable extra-day rate.",
    ],
    important_notes: [],
    faqs: [
        { question: "Is hotel included in this package?", answer: "Hotel charges are included only if a hotel is selected during booking." },
        { question: "Can I add extra sightseeing?", answer: "Yes. Additional sightseeing can be added. Extra kilometres and time will be charged as per the selected vehicle category." },
        { question: "Is pickup and drop available across Delhi NCR?", answer: "Yes. Free pickup and drop are available within 50 KM of India Gate (Delhi NCR)." },
        { question: "Are multiple pickup and drop locations included?", answer: "One pickup location and one drop location are included. Additional pickup or drop locations will be chargeable extra." },
        { question: "Are breakfast and meals included with the hotel?", answer: "No. Breakfast and meals are not included unless specifically mentioned." },
        { question: "Are there any late-night extra charges?", answer: "Yes. Standard drop time is 10:00 PM. After 11:00 PM, extra time charges are \u20b9250/hour for Hatchback & Sedan and \u20b9300/hour for Ertiga SUV / Prime SUV. Any part of an hour will be charged as a full hour." },
        { question: "What happens if the tour extends beyond the booked duration?", answer: "Each additional day will be charged separately based on the selected vehicle category and the applicable extra-day rate." },
        { question: "What is the payment condition?", answer: "Advance payment as per Booking Charge (%), 50% payment after pickup, and the remaining payment 2 hours before drop time." },
    ],
};

const text = (v) => String(v ?? "").trim().slice(0, MAX_TEXT);
const list = (v) => (Array.isArray(v) ? v.slice(0, MAX_ROWS) : []);

// Any input -> clean master object (empty rows dropped, only known fields kept)
const sanitizeMaster = (input = {}) => ({
    highlights: list(input.highlights)
        .map((h) => ({ icon: text(h?.icon), title: text(h?.title), subtitle: text(h?.subtitle) }))
        .filter((h) => h.title),
    inclusions: list(input.inclusions).map(text).filter(Boolean),
    exclusions: list(input.exclusions).map(text).filter(Boolean),
    important_notes: list(input.important_notes).map(text).filter(Boolean),
    faqs: list(input.faqs)
        .map((q) => ({ question: text(q?.question), answer: text(q?.answer) }))
        .filter((q) => q.question && q.answer),
});

const builtinMaster = () => JSON.parse(JSON.stringify(BUILTIN_MASTER));

// ---- table rows <-> master object ---------------------------------------

const TYPE_OF = {
    highlights: "highlight",
    inclusions: "inclusion",
    exclusions: "exclusion",
    important_notes: "important_note",
    faqs: "faq",
};

const toRows = (master) => {
    const rows = [];
    master.highlights.forEach((h, i) =>
        rows.push({ type: "highlight", icon: h.icon || null, title: h.title, content: h.subtitle || null, sort_order: i + 1 })
    );
    ["inclusions", "exclusions", "important_notes"].forEach((key) =>
        master[key].forEach((line, i) =>
            rows.push({ type: TYPE_OF[key], icon: null, title: line, content: null, sort_order: i + 1 })
        )
    );
    master.faqs.forEach((q, i) =>
        rows.push({ type: "faq", icon: null, title: q.question, content: q.answer, sort_order: i + 1 })
    );
    return rows;
};

const fromRows = (rows) => {
    const master = { highlights: [], inclusions: [], exclusions: [], important_notes: [], faqs: [] };
    rows.forEach((r) => {
        if (r.type === "highlight") master.highlights.push({ icon: r.icon || "", title: r.title, subtitle: r.content || "" });
        else if (r.type === "inclusion") master.inclusions.push(r.title);
        else if (r.type === "exclusion") master.exclusions.push(r.title);
        else if (r.type === "important_note") master.important_notes.push(r.title);
        else if (r.type === "faq") master.faqs.push({ question: r.title, answer: r.content || "" });
    });
    return master;
};

// CREATE TABLE IF NOT EXISTS, once per process (so it works even before the SQL file is run)
let tableReady = null;
const ensureTable = () => {
    if (!tableReady) {
        tableReady = TourDefault.sync().catch((error) => {
            tableReady = null;
            throw error;
        });
    }
    return tableReady;
};

// Replaces every row with the given lists and returns the clean copy.
const saveMaster = async (input) => {
    await ensureTable();
    const master = sanitizeMaster(input);
    await sequelize.transaction(async (t) => {
        await TourDefault.destroy({ where: {}, transaction: t });
        const rows = toRows(master);
        if (rows.length) await TourDefault.bulkCreate(rows, { transaction: t });
    });
    return master;
};

// lists saved by an older build in `settings` (null when there are none)
const readLegacy = async () => {
    const row = await Setting.findOne({ where: { key: LEGACY_SETTING_KEY } });
    if (!row || !row.value) return null;
    try {
        const parsed = JSON.parse(row.value);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? sanitizeMaster(parsed) : null;
    } catch {
        return null;
    }
};

// -> { master, updated_at }
// Empty table = first use: fill it from the old settings row if there is one,
// otherwise from the built-in lists.
const readMaster = async () => {
    await ensureTable();

    const rows = await TourDefault.findAll({
        order: [["sort_order", "ASC"], ["id", "ASC"]],
        raw: true,
    });

    if (rows.length) {
        const updated = rows.reduce((max, r) => (r.updated_at && (!max || r.updated_at > max) ? r.updated_at : max), null);
        return { master: fromRows(rows), updated_at: updated };
    }

    const master = await saveMaster((await readLegacy()) || builtinMaster());
    await Setting.destroy({ where: { key: LEGACY_SETTING_KEY } });
    return { master, updated_at: new Date() };
};

module.exports = {
    builtinMaster,
    sanitizeMaster,
    saveMaster,
    readMaster,
    toRows,
};
