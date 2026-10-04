/**
 * Admin-side copy of the original defaults for new tour packages.
 * The live lists are saved in the database (Tours > Default master); this copy is
 * only used when that request fails, so a new tour never opens with empty lists.
 */
export const TOUR_DEFAULTS = {
  "highlights": [
    {
      "icon": "car",
      "title": "Commercial AC Cab",
      "subtitle": "Comfortable AC cab with driver"
    },
    {
      "icon": "map-pin",
      "title": "Delhi NCR Pickup & Drop",
      "subtitle": "Free within 60 KM of India Gate"
    },
    {
      "icon": "map",
      "title": "Planned Sightseeing",
      "subtitle": "Major attractions as per itinerary"
    },
    {
      "icon": "route",
      "title": "Comfortable Road Journey",
      "subtitle": "Well-planned private tour by cab"
    }
  ],
  "inclusions": [
    "Commercial AC Cab",
    "Fuel Charges Included",
    "Driver Allowance Included",
    "Toll Tax Included",
    "State Tax Included",
    "Free Pickup within 50 KM of India Gate (Delhi NCR)",
    "Free Drop within 50 KM of India Gate (Delhi NCR)",
    "Local Sightseeing as per Itinerary, subject to local taxi union rules",
    "Hotel Charges Included Only if Hotel is Selected During Booking",
    "Dedicated Cab for the Complete Tour"
  ],
  "exclusions": [
    "Hotel Charges Unless Hotel is Selected During Booking",
    "Breakfast, Meals and Beverages",
    "Entry Fees for Any Place or Attraction",
    "Guide Charges",
    "Personal Expenses",
    "Parking Charges",
    "Airport / Railway Station Pickup Charges, if Applicable",
    "One Pickup Location and One Drop Location Included. Additional Pickup or Drop Locations Will Be Chargeable Extra.",
    "Any Travel Outside the Planned Tour Route or Destination Will Be Charged Extra Based on Additional Kilometres and Time, as per the Selected Vehicle Category.",
    "Standard Drop Time is 10:00 PM. Extra Time Charges Apply After 11:00 PM — Hatchback & Sedan ₹250/hour; Ertiga SUV / Prime SUV ₹300/hour. Any Part of an Hour After 11:00 PM Will Be Charged as a Full Hour.",
    "Tour Extension Charges: If the tour extends beyond the booked duration, each additional day will be charged separately based on the selected vehicle category and the applicable extra-day rate."
  ],
  "important_notes": [],
  "faqs": [
    {
      "question": "Is hotel included in this package?",
      "answer": "Hotel charges are included only if a hotel is selected during booking."
    },
    {
      "question": "Can I add extra sightseeing?",
      "answer": "Yes. Additional sightseeing can be added. Extra kilometres and time will be charged as per the selected vehicle category."
    },
    {
      "question": "Is pickup and drop available across Delhi NCR?",
      "answer": "Yes. Free pickup and drop are available within 50 KM of India Gate (Delhi NCR)."
    },
    {
      "question": "Are multiple pickup and drop locations included?",
      "answer": "One pickup location and one drop location are included. Additional pickup or drop locations will be chargeable extra."
    },
    {
      "question": "Are breakfast and meals included with the hotel?",
      "answer": "No. Breakfast and meals are not included unless specifically mentioned."
    },
    {
      "question": "Are there any late-night extra charges?",
      "answer": "Yes. Standard drop time is 10:00 PM. After 11:00 PM, extra time charges are ₹250/hour for Hatchback & Sedan and ₹300/hour for Ertiga SUV / Prime SUV. Any part of an hour will be charged as a full hour."
    },
    {
      "question": "What happens if the tour extends beyond the booked duration?",
      "answer": "Each additional day will be charged separately based on the selected vehicle category and the applicable extra-day rate."
    },
    {
      "question": "What is the payment condition?",
      "answer": "Advance payment as per Booking Charge (%), 50% payment after pickup, and the remaining payment 2 hours before drop time."
    }
  ]
};
