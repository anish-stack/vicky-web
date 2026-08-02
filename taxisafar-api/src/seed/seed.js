/* eslint-disable no-console */
require("dotenv").config();
const { connectDB, mongoose } = require("../config/db");
const M = require("../models");
const { toSlug } = require("../utils/slug");

const wipe = process.argv.includes("--fresh");

async function run() {
  await connectDB();

  if (wipe) {
    console.log("[seed] wiping collections...");
    await Promise.all(Object.values(M).map((Model) => Model.deleteMany({})));
  }

  /* ---------------- settings ---------------- */
  await Promise.all([
    M.Setting.put("toll_tax", 1.8, "pricing"),
    M.Setting.put("roundtrip_toll_tax", 1.5, "pricing"),
    M.Setting.put("site_name", "TaxiSafar", "general"),
    M.Setting.put("support_phone", "+91 78945 61230", "contact"),
    M.Setting.put("support_email", "support@taxisafar.com", "contact"),
    M.Setting.put("whatsapp_number", "917894561230", "contact"),
    M.Setting.put("social", {
      facebook: "https://facebook.com/taxisafar",
      instagram: "https://instagram.com/taxisafar",
      linkedin: "https://linkedin.com/company/taxisafar",
      youtube: "https://youtube.com/@taxisafar",
    }, "social"),
  ]);

  await M.AdvancePayment.findOneAndUpdate({}, { percentage: 20 }, { upsert: true });

  /* ---------------- cities & airports ---------------- */
  const cityNames = [
    "New Delhi", "Gurugram", "Noida", "Jaipur", "Agra", "Haridwar",
    "Rishikesh", "Dehradun", "Mathura", "Vrindavan", "Ahmedabad", "Rajkot",
    "Pune", "Mumbai", "Varanasi",
  ];
  const cities = await M.City.insertMany(
    cityNames.map((name) => ({ name, slug: toSlug(name), hotel: true, isActive: true }))
  );
  const cityBy = Object.fromEntries(cities.map((c) => [c.name, c]));

  const airports = await M.Airport.insertMany([
    { name: "Indira Gandhi International Airport", slug: "igi-airport-delhi", code: "DEL" },
    { name: "Jaipur International Airport", slug: "jaipur-airport", code: "JAI" },
  ]);

  await M.Pincode.insertMany([
    { city: cityBy["New Delhi"]._id, pincode: "110001", areaName: "Connaught Place" },
    { city: cityBy["New Delhi"]._id, pincode: "110019", areaName: "Kalkaji" },
    { city: cityBy["Gurugram"]._id, pincode: "122001", areaName: "Sector 14" },
    { city: cityBy["Noida"]._id, pincode: "201301", areaName: "Sector 15" },
  ]);

  /* ---------------- vehicles ---------------- */
  const vehicles = await M.Vehicle.insertMany([
    {
      title: "Maruti WagonR", slug: "maruti-wagonr",
      priceperkm: 11, minimum_price: 2500, minimum_price_range: 150,
      extra_fare_km: 10, additional_time_charge: 150, driver_expences: 400,
      perdaystatetaxcharges: 300, passengers: 4,
      large_size_bag: 2, medium_size_bag: 2, hand_bag: 4,
      luggage: "2 large size bags", sortOrder: 1,
    },
    {
      title: "Maruti Swift Dzire", slug: "maruti-swift-dzire",
      priceperkm: 12, minimum_price: 2800, minimum_price_range: 150,
      extra_fare_km: 10, additional_time_charge: 150, driver_expences: 400,
      perdaystatetaxcharges: 300, passengers: 4,
      large_size_bag: 2, medium_size_bag: 2, hand_bag: 4, sortOrder: 2,
    },
    {
      title: "Maruti Ertiga SUV", slug: "maruti-ertiga-suv",
      priceperkm: 15, minimum_price: 3500, minimum_price_range: 150,
      extra_fare_km: 13, additional_time_charge: 200, driver_expences: 500,
      perdaystatetaxcharges: 400, passengers: 6,
      large_size_bag: 3, medium_size_bag: 2, hand_bag: 4, sortOrder: 3,
    },
    {
      title: "Toyota Innova Crysta", slug: "toyota-innova-crysta",
      priceperkm: 19, minimum_price: 4500, minimum_price_range: 150,
      extra_fare_km: 17, additional_time_charge: 250, driver_expences: 600,
      perdaystatetaxcharges: 500, passengers: 6,
      large_size_bag: 4, medium_size_bag: 2, hand_bag: 4, sortOrder: 4,
    },
  ]);

  // one-way distance slabs
  await M.OneWayTripPricing.insertMany(
    vehicles.flatMap((v) => [
      { vehicle: v._id, from: 0, to: 250, price_per_km: v.priceperkm + 4 },
      { vehicle: v._id, from: 251, to: 500, price_per_km: v.priceperkm + 2 },
      { vehicle: v._id, from: 501, to: 1500, price_per_km: v.priceperkm + 1 },
    ])
  );

  /* ---------------- local rental & airport ---------------- */
  const plans = await M.LocalRentalPlan.insertMany([
    { hours: 4, km: 40, label: "4 Hrs / 40 Km" },
    { hours: 8, km: 80, label: "8 Hrs / 80 Km" },
    { hours: 12, km: 120, label: "12 Hrs / 120 Km" },
  ]);

  await M.LocalRentalPricing.insertMany(
    plans.flatMap((p) =>
      vehicles.map((v) => ({
        plan: p._id,
        city: cityBy["New Delhi"]._id,
        vehicle: v._id,
        price: Math.round(p.km * v.priceperkm + 300),
      }))
    )
  );

  await M.AirportPricing.insertMany(
    vehicles.map((v) => ({
      airport: airports[0]._id,
      city: cityBy["New Delhi"]._id,
      vehicle: v._id,
      price: Math.round(v.priceperkm * 45 + 250),
    }))
  );

  /* ---------------- discount ---------------- */
  await M.Discount.create({
    title: "Monsoon Offer",
    slug: "monsoon-offer",
    overall_discount: 10,
    apply_overall_discount: true,
    apply_citywise_discount: true,
    cities: [
      {
        city: cityBy["New Delhi"]._id,
        pickupCityName: "New Delhi",
        dropCityName: "Jaipur",
        isBidirectional: true,
        tripTypes: ["oneWay", "roundTrip"],
        vehicles: vehicles.map((v) => ({ tripType: "roundTrip", vehicle: v._id, discount: 15 })),
      },
    ],
  });

  /* ---------------- booking limits ---------------- */
  await M.BookingLimit.insertMany(
    vehicles.map((v) => ({ city: cityBy["New Delhi"]._id, vehicle: v._id, limitDate: null, maxLimit: 10 }))
  );

  /* ---------------- char dham ---------------- */
  const dhamCats = await M.DhamCategory.insertMany([
    { name: "1 Dham Yatra", slug: "1-dham-yatra", sortOrder: 1 },
    { name: "2 Dham Yatra", slug: "2-dham-yatra", sortOrder: 2 },
    { name: "3 Dham Yatra", slug: "3-dham-yatra", sortOrder: 3 },
  ]);

  await M.DhamPackage.create({
    name: "Kedarnath Dham Yatra",
    slug: "kedarnath-dham-yatra",
    category: dhamCats[0]._id,
    distance: "460 Km",
    image: "/uploads/dham/kedarnath.jpg",
    description: "A guided journey to Kedarnath with comfortable stays and experienced drivers.",
    routes: [
      { place_name: "Haridwar", place_id: "ChIJ_seed_haridwar", sortOrder: 0 },
      { place_name: "Guptkashi", place_id: "ChIJ_seed_guptkashi", sortOrder: 1 },
      { place_name: "Kedarnath", place_id: "ChIJ_seed_kedarnath", sortOrder: 2 },
    ],
    pickupCities: [
      {
        name: "Delhi",
        days: 5,
        pricings: vehicles.map((v) => ({ vehicle: v._id, price: v.priceperkm * 900, discount: 8 })),
        stops: [
          { day: 1, name: "Delhi - Haridwar", distance: "230 Kms", duration: "6-7hrs", description: "Depart Delhi, evening Ganga Aarti at Har Ki Pauri." },
          { day: 2, name: "Haridwar - Guptkashi", distance: "230 Kms", duration: "8-9hrs", description: "Scenic drive along the Alaknanda river." },
        ],
      },
      {
        name: "Haridwar",
        days: 4,
        pricings: vehicles.map((v) => ({ vehicle: v._id, price: v.priceperkm * 700, discount: 5 })),
        stops: [],
      },
    ],
  });

  /* ---------------- hotels ---------------- */
  const hotels = await M.Hotel.insertMany([
    {
      name: "Hotel Krishna Palace", slug: "hotel-krishna-palace",
      cityName: "Mathura", city: cityBy["Mathura"]._id,
      roomType: "Deluxe Room", starRating: 3, pricePerNight: 2000,
      maxAdults: 2, maxChildren: 1,
      amenities: ["Free Wi-Fi", "Breakfast", "Parking", "Room Service"],
      image: "/uploads/hotels/krishna-palace.jpg",
    },
    {
      name: "Hotel Brij Residency", slug: "hotel-brij-residency",
      cityName: "Vrindavan", city: cityBy["Vrindavan"]._id,
      roomType: "Deluxe Room", starRating: 3, pricePerNight: 1500,
      maxAdults: 2, maxChildren: 2,
      amenities: ["Free Wi-Fi", "Parking", "Restaurant"],
      image: "/uploads/hotels/brij-residency.jpg",
    },
    {
      name: "Hotel Govindam Inn", slug: "hotel-govindam-inn",
      cityName: "Vrindavan", city: cityBy["Vrindavan"]._id,
      roomType: "Deluxe Room", starRating: 4, pricePerNight: 2500,
      maxAdults: 2, maxChildren: 1,
      amenities: ["Free Wi-Fi", "Breakfast", "Parking", "Power Backup"],
      image: "/uploads/hotels/govindam-inn.jpg",
    },
  ]);

  /* ---------------- tour package (matches the reference design) -------- */
  await M.TourPackage.create({
    title: "New Delhi to Mathura Vrindavan UP",
    slug: "new-delhi-to-mathura-vrindavan",
    fromCityName: "New Delhi",
    toCityName: "Mathura Vrindavan",
    fromCity: cityBy["New Delhi"]._id,
    coverImage: "/uploads/packages/mathura-vrindavan-cover.jpg",
    gallery: ["/uploads/packages/prem-mandir.jpg", "/uploads/packages/banke-bihari.jpg"],
    days: 2,
    nights: 1,
    durationLabel: "2 Days / 1 Night Tour",
    tripType: "roundTrip",
    shortDescription:
      "A spiritual journey to Mathura and Vrindavan - the land of Lord Krishna. Comfortable ride, memorable moments.",
    description:
      "A short spiritual getaway to the land of Lord Krishna. Visit Mathura and Vrindavan's most famous temples and sacred places.",
    hotelOptional: true,
    highlights: [
      { icon: "hotel", title: "Hotel Option", subtitle: "Include / Not" },
      { icon: "car", title: "Commercial Vehicle", subtitle: "All Types" },
      { icon: "driver", title: "Verified Driver", subtitle: "Experienced" },
      { icon: "route", title: "Round Trip", subtitle: "Delhi to Delhi" },
      { icon: "calendar", title: "2 Days Tour", subtitle: "1 Night / 2 Days" },
    ],
    itinerary: [
      {
        day: 1,
        title: "Day 1 - Delhi to Mathura - Vrindavan",
        distance: "180 Kms",
        duration: "4-5hrs",
        image: "/uploads/packages/day1.jpg",
        items: [
          { title: "Pick up from New Delhi", description: "Morning pick up from your location" },
          { title: "Mathura Sightseeing", description: "Visit Shri Krishna Janmabhoomi, Dwarkadhish Temple, Vishram Ghat" },
          { title: "Vrindavan Sightseeing", description: "Visit Banke Bihari Temple, ISKCON Temple, Nidhivan" },
          { title: "Overnight Stay", description: "Stay at hotel in Mathura / Vrindavan" },
        ],
      },
      {
        day: 2,
        title: "Day 2 - Vrindavan to Delhi",
        distance: "180 Kms",
        duration: "4-5hrs",
        image: "/uploads/packages/day2.jpg",
        items: [
          { title: "Morning Darshan", description: "Visit Prem Mandir, ISKCON Temple" },
          { title: "Local Sightseeing", description: "Visit Seva Kunj, Radha Raman Temple, Kesi Ghat" },
          { title: "Shopping & Free Time", description: "Time for local shopping & personal activities" },
          { title: "Return to Delhi", description: "Evening return to New Delhi with beautiful memories" },
        ],
      },
    ],
    placesCovered: [
      { name: "Shri Krishna Janmabhoomi", icon: "temple" },
      { name: "Dwarkadhish Temple", icon: "temple" },
      { name: "Vishram Ghat", icon: "ghat" },
      { name: "Banke Bihari Temple", icon: "temple" },
      { name: "Prem Mandir", icon: "temple" },
      { name: "ISKCON Temple", icon: "temple" },
      { name: "Nidhivan", icon: "garden" },
      { name: "Seva Kunj", icon: "garden" },
      { name: "Kesi Ghat", icon: "ghat" },
      { name: "Radha Raman Temple", icon: "temple" },
      { name: "Gokul", icon: "temple" },
      { name: "Govardhan", icon: "hill" },
    ],
    inclusions: [
      "Commercial Vehicle",
      "Driver Allowance",
      "Toll Tax & Parking",
      "Fuel Charges",
      "All State Taxes",
    ],
    exclusions: [
      "Hotel (if not selected)",
      "Food & Beverages",
      "Personal Expenses",
      "Entry Tickets (if any)",
    ],
    importantNotes: [
      "Timing may change due to traffic & weather.",
      "Please carry valid ID proof.",
      "Advance booking is recommended.",
      "Tour can be customized as per your need.",
    ],
    faqs: [
      { question: "Is the Taxi Charge All Inclusive?", answer: "Yes. Fuel, driver allowance, toll, parking and all state taxes are included in the quoted cab charge." },
      { question: "Is Hotel Included in this Package?", answer: "Hotel is optional. You can pick one of the listed hotels or choose 'No Hotel Required' and pay only the cab charge." },
      { question: "Can I Customize the Tour Plan?", answer: "Yes, the itinerary can be adjusted. Share your preference at the time of booking and our team will confirm." },
      { question: "Which Vehicles are Available?", answer: "Hatchback, Sedan, SUV and Prime SUV. Each option shows seats, luggage capacity and the all-inclusive price." },
      { question: "How Can I Book This Tour?", answer: "Select your vehicle and hotel, fill in the traveller details, and pay the booking charge online to confirm." },
    ],
    vehicleOptions: [
      { vehicle: vehicles[0]._id, label: "Hatchback", seats: "4+1 Seats", suitcases: "2 Suitcases", ac: true, price: 10999, sortOrder: 1, image: "/uploads/vehicles/hatchback.png" },
      { vehicle: vehicles[1]._id, label: "Sedan", seats: "4+1 Seats", suitcases: "3 Suitcases", ac: true, price: 13499, sortOrder: 2, image: "/uploads/vehicles/sedan.png" },
      { vehicle: vehicles[2]._id, label: "SUV", seats: "6+1 Seats", suitcases: "4 Suitcases", ac: true, price: 16999, sortOrder: 3, image: "/uploads/vehicles/suv.png" },
      { vehicle: vehicles[3]._id, label: "Prime SUV", seats: "6+1 Seats", suitcases: "5 Suitcases", ac: true, price: 21999, sortOrder: 4, image: "/uploads/vehicles/prime-suv.png" },
    ],
    hotelOptions: [
      { hotel: hotels[0]._id, nights: 1, sortOrder: 1 },
      { hotel: hotels[1]._id, nights: 1, sortOrder: 2 },
      { hotel: hotels[2]._id, nights: 1, sortOrder: 3 },
    ],
    bookingChargePercent: 10,
    rating: 4.9,
    reviewCount: 250,
    isFeatured: true,
    seo: {
      metaTitle: "New Delhi to Mathura Vrindavan Tour Package | 2 Days 1 Night | TaxiSafar",
      metaDescription:
        "Book a 2 day Mathura Vrindavan tour from New Delhi. All-inclusive cab charge, optional hotel, verified drivers and a fixed itinerary covering Banke Bihari, Prem Mandir and ISKCON.",
      metaKeywords: ["mathura vrindavan tour package", "delhi to vrindavan taxi", "2 day krishna tour"],
    },
  });

  /* ---------------- destinations / services / testimonials -------------- */
  await M.Destination.insertMany([
    { title: "Pune To Hyderabad Taxi", slug: "pune-to-hyderabad-taxi", subtitle: "Round Trip | 3 Days", tab: "taxi", sortOrder: 1, image: "/uploads/destinations/hyderabad.jpg" },
    { title: "Pune To Kolhapur Taxi", slug: "pune-to-kolhapur-taxi", subtitle: "Round Trip | 3 Days", tab: "taxi", sortOrder: 2, image: "/uploads/destinations/kolhapur.jpg" },
    { title: "Pune To Nashik Taxi", slug: "pune-to-nashik-taxi", subtitle: "Round Trip | 3 Days", tab: "taxi", sortOrder: 3, image: "/uploads/destinations/nashik.jpg" },
    { title: "Kedarnath Dham Yatra", slug: "kedarnath-dham-yatra-dest", subtitle: "1 Dham Yatra | 2 Days", tab: "chardham", sortOrder: 1, image: "/uploads/destinations/kedarnath.jpg" },
    { title: "Gangotri Dham Yatra", slug: "gangotri-dham-yatra-dest", subtitle: "1 Dham Yatra | 2 Days", tab: "chardham", sortOrder: 2, image: "/uploads/destinations/gangotri.jpg" },
    { title: "New Delhi", slug: "new-delhi-hotels", subtitle: "2,919 properties", tab: "hotel", propertyCount: 2919, sortOrder: 1, image: "/uploads/destinations/delhi.jpg" },
    { title: "Varanasi", slug: "varanasi-hotels", subtitle: "554 properties", tab: "hotel", propertyCount: 554, sortOrder: 2, image: "/uploads/destinations/varanasi.jpg" },
    { title: "Mumbai", slug: "mumbai-hotels", subtitle: "1,652 properties", tab: "hotel", propertyCount: 1652, sortOrder: 3, image: "/uploads/destinations/mumbai.jpg" },
  ]);

  await M.Service.insertMany([
    { title: "Airport Transport", slug: "airport-transport", description: "Enjoy a smooth airport ride with our reliable cabs. Simply select your airport, pickup, and drop-off city!", sortOrder: 1, image: "/uploads/services/airport.jpg" },
    { title: "Online Booking", slug: "online-booking", description: "Book your cab online in seconds! Enjoy safe, comfortable, and reliable rides anytime, anywhere.", sortOrder: 2, image: "/uploads/services/online.jpg" },
    { title: "Local Rental", slug: "local-rental", description: "Travel effortlessly with our city transport service - fixed hour and kilometer packages for a smooth, reliable ride.", sortOrder: 3, image: "/uploads/services/local.jpg" },
  ]);

  await M.Testimonial.insertMany([
    { name: "Payal Goswami", designation: "CEO & Founder", rating: 5, message: "The ride was smooth, the driver was courteous, and the cab was clean. I felt safe throughout my journey. Highly recommended!", sortOrder: 1 },
    { name: "Rahul Verma", designation: "Frequent Traveller", rating: 5, message: "Booked a round trip to Jaipur. Transparent pricing with no hidden charges at the end. Will book again.", sortOrder: 2 },
  ]);

  await M.Faq.insertMany([
    { question: "How do I book a taxi?", answer: "Pick your trip type, enter pickup and drop, choose a date, and confirm your WhatsApp number. You will see live prices instantly.", group: "home", sortOrder: 1 },
    { question: "Are toll and state taxes included?", answer: "You can switch between 'Best Price' and 'Toll, State Tax Inclusive Price' on the results page to compare both.", group: "home", sortOrder: 2 },
  ]);

  /* ---------------- page content ---------------- */
  await M.Content.findOneAndUpdate(
    { page: "home" },
    {
      page: "home",
      title: "Home",
      seo: {
        metaTitle: "TaxiSafar - Outstation Cabs, Char Dham Yatra & Hotel Booking Across India",
        metaDescription:
          "Book reliable outstation taxis, Char Dham Yatra packages and hotels with TaxiSafar. Transparent pricing, verified drivers and 24/7 support.",
      },
      sections: [
        { key: "hero", sectionType: "hero", heading: "Reliable Cab Services For Your Journey", sortOrder: 1 },
        { key: "destinations", sectionType: "popularDestinations", heading: "Explore Popular Destination", subheading: "Enjoy hassle-free weekends with our affordable, top-rated outstation tour packages.", sortOrder: 2 },
        { key: "about", sectionType: "aboutUs", kicker: "Welcome to TaxiSafar", heading: "Reliable Cab Services For Your Journey", body: "With professional drivers and well-maintained vehicles, we guarantee timely pickups and smooth travel to your destination.", ctaLabel: "Book a Taxi", ctaHref: "/", sortOrder: 3 },
        {
          key: "features", sectionType: "featureAccordion", heading: "Best Outstation Taxi Services", sortOrder: 4,
          items: [
            { title: "Transport Services", body: "No Unexpected Shortages | Vast Fleet of Vehicles | Cabs Available Year-Round, for Every Route" },
            { title: "Single Journey Fare", body: "Pay only for the distance you travel on one-way trips." },
            { title: "Pet-Friendly Ride", body: "Travel with your pets on request at no extra charge." },
            { title: "Our Offerings", body: "Outstation, local rentals, airport transfers and Char Dham packages." },
            { title: "Guaranteed Luggage Room", body: "Every vehicle lists its exact luggage capacity before you book." },
          ],
        },
        { key: "services", sectionType: "services", kicker: "Latest Services", heading: "Explore Our Top-Rated Services", sortOrder: 5 },
        { key: "testimonials", sectionType: "testimonials", kicker: "Customer Reviews", heading: "Bringing Countless Smiles Through Our TaxiSafar", body: "Spreading joy, one ride at a time. Safe, reliable, and comfortable taxi services for every journey!", data: { satisfactionRate: 97, yearsOfExperience: 9 }, sortOrder: 6 },
        {
          key: "partners", sectionType: "partnerCards", kicker: "Partner & Grow With Us", heading: "Join Our Network & Unlock Opportunities", sortOrder: 7,
          items: [
            { title: "Become a Driver or Attach Your Taxi", description: "Own a taxi or want to drive? Join us by filling out a quick form.", href: "/driver-register" },
            { title: "Booking Management", description: "Partner with us! Access the admin panel to manage bookings in your city or specific areas.", href: "/partner-register" },
            { title: "List Your Hotel", description: "List your hotel and connect with travelers. Get started by filling out the form.", href: "/hotel-register" },
          ],
        },
        { key: "newsletter", sectionType: "newsletter", heading: "Stay Updated With The Latest News & Offers!", ctaLabel: "Subscribe", sortOrder: 8 },
      ],
    },
    { upsert: true, new: true }
  );

  await M.Content.findOneAndUpdate(
    { page: "packages" },
    {
      page: "packages",
      title: "Tour Packages",
      seo: {
        metaTitle: "Tour Packages | Spiritual & Weekend Trips by Cab | TaxiSafar",
        metaDescription:
          "Browse all-inclusive tour packages with fixed itineraries, optional hotels and verified drivers. Transparent pricing, easy online booking.",
      },
      sections: [
        { key: "hero", sectionType: "hero", heading: "Tour Packages", subheading: "Fixed itineraries, all-inclusive cab charges and optional hotels.", sortOrder: 1 },
      ],
    },
    { upsert: true, new: true }
  );

  /* ---------------- admin user ---------------- */
  await M.User.findOneAndUpdate(
    { email: "admin@taxisafar.com" },
    {},
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const admin = await M.User.findOne({ email: "admin@taxisafar.com" }).select("+password");
  admin.name = "TaxiSafar Admin";
  admin.phoneNumber = "9999999999";
  admin.role = "superadmin";
  admin.password = "Admin@12345";
  admin.isPhoneVerified = true;
  await admin.save();

  console.log("[seed] done");
  console.log("[seed] admin login -> admin@taxisafar.com / Admin@12345");
  await mongoose.connection.close();
}

run().catch(async (err) => {
  console.error("[seed] failed:", err);
  await mongoose.connection.close();
  process.exit(1);
});
