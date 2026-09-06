// constants/mechanicOptions.js

const SERVICE_LIST = [
  { title: "General Service", image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=200" },
  { title: "Engine Repair", image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=200" },
  { title: "Gearbox Repair", image: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=200" },
  { title: "Brake Repair", image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=200" },
  { title: "AC Repair", image: "https://images.unsplash.com/photo-1631545806609-8c0e4c5f5f5a?w=200" },
  { title: "Electrical Work", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200" },
  { title: "Suspension Repair", image: "https://images.unsplash.com/photo-1632823469850-1b7b1e8b7af3?w=200" },
  { title: "Clutch Repair", image: "https://images.unsplash.com/photo-1596559230577-6e3a45f6c8ef?w=200" },
  { title: "Body Shop", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200" },
  { title: "Dent & Paint", image: "https://images.unsplash.com/photo-1600661653561-629509216228?w=200" },
  { title: "Tyre Change", image: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=200" },
  { title: "Wheel Alignment", image: "https://images.unsplash.com/photo-1600661653561-629509216228?w=200" },
  { title: "Battery Replacement", image: "https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?w=200" },
  { title: "Denting Painting", image: "https://images.unsplash.com/photo-1600661653561-629509216228?w=200" },
  { title: "Car Wash", image: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=200" },
  { title: "Custom", image: "https://images.unsplash.com/photo-1493238792000-8113da705763?w=200" }
];

const CAR_BRANDS = [
  { title: "Maruti Suzuki", image: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=200" },
  { title: "Hyundai", image: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=200" },
  { title: "Toyota", image: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=200" },
  { title: "Honda", image: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=200" },
  { title: "Mahindra", image: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=200" },
  { title: "Kia", image: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=200" },
  { title: "Tata", image: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=200" },
  { title: "Renault", image: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=200" },
  { title: "Nissan", image: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=200" },
  { title: "Volkswagen", image: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=200" },
  { title: "Skoda", image: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=200" },
  { title: "Ford", image: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=200" },
  { title: "MG", image: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=200" },
  { title: "Chevrolet", image: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=200" },
  { title: "BMW", image: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=200" },
  { title: "Mercedes-Benz", image: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=200" },
  { title: "Audi", image: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=200" },
  { title: "Jeep", image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=200" },
  { title: "Custom", image: "https://images.unsplash.com/photo-1493238792000-8113da705763?w=200" }
];

const VEHICLE_TYPES = [
  { title: "Hatchback", image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=200" },
  { title: "Sedan", image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=200" },
  { title: "SUV", image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=200" },
  { title: "MUV", image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=200" },
  { title: "Luxury Cars", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200" },
  { title: "Commercial", image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=200" },
  { title: "Electric Cars (EV)", image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=200" }
];

const FACILITIES = [
  { title: "Doorstep Service", image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=200" },
  { title: "Genuine Parts", image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=200" },
  { title: "GST Invoice", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200" },
  { title: "Card / UPI Payment", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200" },
  { title: "Pickup & Drop Available", image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=200" },
  { title: "24x7 Support", image: "https://images.unsplash.com/photo-1553775282-20af80779df7?w=200" },
  { title: "Emergency Service", image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200" }
];

// enum arrays for mongoose validation (titles only)
const SERVICE_TITLES = SERVICE_LIST.map(s => s.title);
const BRAND_TITLES = CAR_BRANDS.map(b => b.title);
const VEHICLE_TITLES = VEHICLE_TYPES.map(v => v.title);
const FACILITY_TITLES = FACILITIES.map(f => f.title);

module.exports = {
  SERVICE_LIST, CAR_BRANDS, VEHICLE_TYPES, FACILITIES,
  SERVICE_TITLES, BRAND_TITLES, VEHICLE_TITLES, FACILITY_TITLES
};