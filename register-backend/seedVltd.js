const mongoose = require('mongoose');
const VltdProduct = require('./models/VltdProduct');
const VltdPickupLocation = require('./models/VltdPickupLocation');

// MongoDB connection string (apne environment ke mutabiq adjust karein)
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/taxisafar";
    console.log(MONGO_URI)
const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // 1. Clear existing VLTD data
    await VltdProduct.deleteMany({});
    console.log("Old VLTD data cleared.");

    // 2. Seed Vltd Product (Updated as per schema structure)
    const productData = await VltdProduct.create({
      title: "Vehicle Location Tracking Device (VLTD)",
      subTitle: "Track Your Vehicle. Anytime, Anywhere.",
      description: "Advanced GPS tracking device that keeps your vehicle secure with real-time location, history & smart alerts.",
      devicePrice: 1399,
      
      // Hero Banner Main Image
      heroBannerImage: "https://partners.taxisafar.com/uploads/vltd/hero-device.png",

      // Hero Banner Bottom Preview Strip Icons
      heroBadges: [
        { icon: "location-outline", title: "Real-time Tracking" },
        { icon: "map-outline", title: "Live Location Updates" },
        { icon: "time-outline", title: "Trip History & Playback" },
        { icon: "notifications-outline", title: "Smart Alerts & Notifications" },
        { icon: "shield-outline", title: "Anti-theft Protection" }
      ],

      // Key Features Section with Icons
      keyFeatures: [
        { icon: "locate-outline", title: "Real-time Location Tracking", description: "Monitor your vehicle live on map." },
        { icon: "map-sharp", title: "Live Location on Map", description: "Accurate street-level positioning." },
        { icon: "timer-outline", title: "Trip History & Playback", description: "Review past routes and stops." },
        { icon: "notifications-sharp", title: "Smart Alerts & Notifications", description: "Instant warnings for overspeeding or ignition." },
        { icon: "grid-outline", title: "Geo-fence Support", description: "Set virtual boundaries for safety." },
        { icon: "speedometer-outline", title: "Speed Monitoring & Reports", description: "Analyze driver behavior and speed logs." },
        { icon: "power-outline", title: "Ignition ON/OFF Alerts", description: "Know instantly when engine starts." },
        { icon: "battery-charging-outline", title: "Battery Backup Support", description: "Works even if main power is cut." },
        { icon: "cellular-outline", title: "Works on GSM Network", description: "Seamless pan-India connectivity." },
        { icon: "shield-checkmark-outline", title: "Anti-theft Protection", description: "Enhanced security against unauthorized access." }
      ],

      // Why Choose Us Section with Icons
      whyChooseUs: [
        { icon: "shield-checkmark", title: "Complete Vehicle Security", description: "Keep your vehicle safe from theft & misuse." },
        { icon: "people-outline", title: "Trusted by Thousands", description: "Used by individuals & businesses across India." },
        { icon: "ribbon-outline", title: "Reliable & Accurate Tracking", description: "Advanced technology for precise location." }
      ],

      // What's in the Box Section (Only Image and Name, No Icons)
      boxItems: [
        { image: "https://partners.taxisafar.com/uploads/vltd/box-device.png", name: "VLTD Device" },
        { image: "https://partners.taxisafar.com/uploads/vltd/box-harness.png", name: "Wiring Harness" },
        { image: "https://partners.taxisafar.com/uploads/vltd/box-relay.png", name: "Relay" },
        { image: "https://partners.taxisafar.com/uploads/vltd/box-manual.png", name: "User Guide" },
        { image: "https://partners.taxisafar.com/uploads/vltd/box-warranty.png", name: "Warranty Card" }
      ],

      rechargePlans: [
        { durationYears: 1, title: "1 Year Recharge", price: 3500 },
        { durationYears: 2, title: "2 Years Recharge", price: 6500 }
      ]
    });

    console.log("Vltd Product seeded successfully:", productData._id);

    // 3. Seed Pickup Locations (State-wise)
    const pickupLocations = [
      {
        state: "Delhi",
        city: "North Delhi",
        hubName: "TaxiSafar Hub Kashmere Gate",
        fullAddress: "Shop No. 12, Transport Hub, Kashmere Gate, Delhi - 110006",
        contactPerson: "Rajesh Kumar",
        contactPhone: "9876543210"
      },
      {
        state: "Delhi",
        city: "East Delhi",
        hubName: "TaxiSafar Hub Laxmi Nagar",
        fullAddress: "Plot 45, Vikas Marg, Laxmi Nagar, Delhi - 110092",
        contactPerson: "Amit Sharma",
        contactPhone: "9876543211"
      },
      {
        state: "Uttar Pradesh",
        city: "Noida",
        hubName: "TaxiSafar Hub Noida Sector 16",
        fullAddress: "B-22, Near Metro Station, Sector 16, Noida, UP - 201301",
        contactPerson: "Vikas Singh",
        contactPhone: "9876543212"
      },
      {
        state: "Uttar Pradesh",
        city: "Ghaziabad",
        hubName: "TaxiSafar Hub Mohan Nagar",
        fullAddress: "NH-58, Mohan Nagar, Ghaziabad, UP - 201007",
        contactPerson: "Deepak Verma",
        contactPhone: "9876543213"
      },
      {
        state: "Haryana",
        city: "Gurugram",
        hubName: "TaxiSafar Hub Udyog Vihar",
        fullAddress: "Phase 4, Udyog Vihar, Gurugram, Haryana - 122015",
        contactPerson: "Sandeep Yadav",
        contactPhone: "9876543214"
      }
    ];

    await VltdPickupLocation.insertMany(pickupLocations);
    console.log("Pickup Locations seeded successfully.");

    console.log("All seeding completed!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedDatabase();