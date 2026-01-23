import "swiper/swiper-bundle.css";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getVehicles } from "./api/vehicles";
import { getSessionById } from "./api/sessions";
import PricingCardThree from "@/components/cardComponents/PricingCardThree";
import Head from "next/head";
import { getAdvancePayment } from "./api/plans";

// import GoogleMapComponent from "@/components/GoogleMap";
import { Col, Container, Row } from "react-bootstrap";
import moment from "moment";
import {
  getDhamCategoryById,
  getDhamPackageById,
  getDhamPackages,
} from "./api/dhampackage";
import HomeJoinNetwork from "@/components/taxisafar/homeJoinNetwork";
import { getDiscount } from "./api/discount";
// import HomeOutstationService from "@/components/taxisafar/homeOutstationService";
import FAQs from "@/components/taxisafar/FAQs";

export default function Vehicles({}: InferGetServerSidePropsType<
  typeof getServerSideProps
>) {
  const outstationServices = {
    oneWay: [
      {
        id: 1,
        number: "01",
        question: "Does Taxi Safar provide one-way drop services?",
        answer:
          "Yes, Taxi Safar offers one-way drop taxi services to several major cities in North India, including Delhi, Dehradun, Chandigarh, Lucknow, Jaipur, and others.",
      },
      {
        id: 2,
        number: "02",
        question:
          "What types of vehicles are available for one-way drop service?",
        answer:
          "We provide vehicles such as Swift, Dzire, Ertiga, Innova Crysta, and SUVs as per your requirements.",
      },
      {
        id: 3,
        number: "03",
        question:
          "Can I make an advance or current pickup booking for a one-way drop?",
        answer:
          "Yes, you can make both advance and current pickup bookings for one-way drop service through the Taxi Safar website.",
      },
      {
        id: 4,
        number: "04",
        question: "Will I receive driver and vehicle details after booking?",
        answer:
          'Yes, once your booking is confirmed, you can log in to your profile on the website homepage and view all driver and vehicle details under the "My Trips" section.',
      },
      {
        id: 5,
        number: "05",
        question: "Can I select pickup and drop timing while booking?",
        answer:
          "Yes, you can choose your preferred pickup and drop date and time at the time of booking based on your convenience.",
      },
      {
        id: 6,
        number: "06",
        question: "Are taxes and other charges included in the fare?",
        answer:
          "Yes, there are two options for booking a taxi on the Taxi Safar website:\n\nBest Price: Toll tax and parking charges are not included in this option.\n\nInclusive Price: Toll tax, state tax, driver charges, and fuel charges are included in this option.\n\nParking charges are extra in both options. You can choose any option as per your convenience to book the taxi.",
      },
    ],
    roundTrip: [
      {
        id: 1,
        number: "01",
        question: "Does Taxi Safar offer round trip taxi services?",
        answer:
          "Yes, Taxi Safar provides round trip taxi services to all major cities and tourist destinations across North India, with flexible pickup and return options for your convenience.",
      },
      {
        id: 2,
        number: "02",
        question: "What types of vehicles are available for round trips?",
        answer:
          "You can choose from a wide range of vehicles including Swift, Dzire, Ertiga, Innova Crysta, SUVs, and Tempo Travellers, depending on your travel needs and group size.",
      },
      {
        id: 3,
        number: "03",
        question: "Can I select both departure and return dates while booking?",
        answer:
          "Yes, while booking a round trip, you can choose your preferred departure and return dates and times as per your schedule and convenience.",
      },
      {
        id: 4,
        number: "04",
        question:
          "Will the same vehicle and driver be provided for both onward and return journeys?",
        answer:
          "In most cases, the same vehicle and driver will be assigned for both legs of the journey. However, in certain situations, alternative arrangements may be made, and you will be informed in advance.",
      },
      {
        id: 5,
        number: "05",
        question:
          "Are toll tax, state tax, and driver charges included in the round trip fare?",
        answer:
          "Yes, the Taxi Safar website offers two pricing options:\n\nBest Price Option – Toll tax, state tax, and parking charges are not included.\n\nInclusive Price Option – Toll tax, state tax, driver charges, and fuel charges are included.\n\nIn both options, parking charges are additional. You can choose your preferred option accordingly.",
      },
      {
        id: 6,
        number: "06",
        question:
          "How can I view my round trip booking details after confirmation?",
        answer:
          'Once your booking is confirmed, you can log in to your profile on the Taxi Safar website. Under the "My Trips" section, you will find complete details of your round trip booking.',
      },
    ],
    airport: [
      {
        id: 1,
        number: "01",
        question: "Does Taxi Safar provide airport pickup and drop services?",
        answer:
          "Yes, Taxi Safar provides pickup and drop services to and from all major airports in key cities. This service is timely, safe, and convenient.",
      },
      {
        id: 2,
        number: "02",
        question: "What vehicle options are available?",
        answer:
          "You can choose from a range of vehicles including Swift, Dzire, Ertiga, SUV, Innova Crysta, and Tempo Traveller as per your travel needs.",
      },
      {
        id: 3,
        number: "03",
        question: "Can I schedule the pickup/drop time according to my flight?",
        answer:
          "Yes, you can set your pickup/drop time based on your flight arrival or departure. Our team ensures that the vehicle reaches you on time.",
      },
      {
        id: 4,
        number: "04",
        question: "Will I receive the driver’s details in advance?",
        answer:
          "Yes, once your booking is confirmed, all driver and vehicle details will be available under the “My Trips” section in your profile on the Taxi Safar website.",
      },
      {
        id: 5,
        number: "05",
        question:
          "Are toll taxes and parking charges included in the airport service?",
        answer:
          "No, toll tax, parking charges, and state taxes are not included in the airport pickup and drop service fare. If applicable, these charges must be paid separately to the driver by the customer.",
      },
      {
        id: 6,
        number: "06",
        question: "Where can I see my booking details after confirmation?",
        answer:
          "Once your airport taxi booking is confirmed, you can view all booking details under the “My Trips” section in your profile on the Taxi Safar website.",
      },
    ],
    local: [
      {
        id: 1,
        number: "01",
        question: "Does Taxi Safar provide local taxi service?",
        answer:
          "Yes, Taxi Safar provides professional taxi service for local city travel. We offer two main local rental packages:\n\n(a) 8 Hours / 80 Kilometres Package:\nThis package is suitable for medium-range city travels like office visits, meetings, or shopping trips.\n\n(b) 12 Hours / 120 Kilometres Package:\nThis package is ideal for full-day local travel like full-day tours, wedding functions, or any event.\n\nNote:\n– Extra charges will be applied if the travel exceeds the fixed time or distance of the package.\n– Charges like parking and toll tax (if applicable) will be extra.",
      },
      {
        id: 2,
        number: "02",
        question:
          "Can I schedule the date and time of my local rental trip in advance?",
        answer:
          "Yes, you can schedule your trip date and time as per your convenience on the Taxi Safar website.",
      },
      {
        id: 3,
        number: "03",
        question:
          "Can I start my journey from only one location or choose multiple pickup/drop points?",
        answer:
          "Yes, you can choose one or more pickup and drop locations as per your convenience. However, extra charges may apply for additional time or distance.",
      },
      {
        id: 4,
        number: "04",
        question:
          "Is airport pickup or drop possible under the local rental package?",
        answer:
          "Yes, you can use the local rental package for airport pickup or drop, provided it fits within the selected package limits.",
      },
      {
        id: 5,
        number: "05",
        question:
          "Where can I see the details of my booking after confirmation?",
        answer:
          "After booking confirmation, you can log into your profile on the Taxi Safar website and view all your local rental trip details under the “My Trips” section.",
      },
    ],
    hotel: [
      {
        id: 1,
        number: "01",
        question: "Can I book a hotel from the Taxi Safar website?",
        answer:
          "Yes, you can easily book a hotel for your trip through the Taxi Safar website.",
      },
      {
        id: 2,
        number: "02",
        question: "What is included in the hotel booking?",
        answer:
          "Hotel booking includes room charges and applicable taxes. In some cases, breakfast or other amenities may also be included, which will be clearly mentioned on the booking page.",
      },
      {
        id: 3,
        number: "03",
        question: "Can I cancel a hotel booking?",
        answer:
          "Yes, cancellation facility is available. The cancellation policy may vary depending on the hotel and the time of booking.",
      },
      {
        id: 4,
        number: "04",
        question:
          "Will the hotel booking details be visible on the website after confirmation?",
        answer:
          "Yes, once the hotel booking is confirmed, the details will be visible in the Profile option after logging into the website.",
      },
      {
        id: 5,
        number: "05",
        question: "Is advance payment required while booking a hotel?",
        answer:
          "Yes, advance payment is mandatory to confirm the hotel booking.",
      },
      {
        id: 6,
        number: "06",
        question:
          "What should I do if I face any issues during the booking process?",
        answer:
          "If you face any kind of issue during the booking process, you can visit the Help Section on the website to get assistance. Our team is always ready to help you.",
      },
    ],
    onedham: [
      {
        id: 1,
        number: "01",
        question: "Does Taxi Safar provide Ek Dham Yatra service?",
        answer:
          "Yes, Taxi Safar provides Ek Dham Yatra service to major pilgrimage destinations in Uttarakhand such as Kedarnath, Badrinath, Gangotri, or Yamunotri.",
      },
      {
        id: 2,
        number: "02",
        question: "How can I book Ek Dham Yatra?",
        answer:
          "You can book the Ek Dham Yatra according to your convenience using the option provided on the Taxi Safar website.",
      },
      {
        id: 3,
        number: "03",
        question: "What services are included in the Ek Dham Yatra package?",
        answer:
          "The package fare shown on the Taxi Safar website includes vehicle, driver charges, toll tax, state tax, fuel charges, etc. Parking charges are additional, and must be paid separately when needed.",
      },
      {
        id: 4,
        number: "04",
        question:
          "Are both one-way and round-trip options available for Ek Dham Yatra?",
        answer:
          "No, one-way drop service is not available for Ek Dham, Do Dham, or Char Dham Yatra. If you only need a one-time travel service, you must go to the Outstation Booking section on the Taxi Safar website and book the service using the One Way Drop or Round Trip option.",
      },
      {
        id: 5,
        number: "05",
        question:
          "Where can I view my travel details after booking confirmation?",
        answer:
          'Once your booking is confirmed, you can log in to your profile on the Taxi Safar website and view all your booking details under the "My Trips" section.',
      },
    ],
    twodham: [
      {
        id: 1,
        number: "01",
        question: "Does Taxi Safar offer Do Dham Yatra packages?",
        answer:
          "Yes, Taxi Safar offers planned Do Dham Yatra packages which include any two of the four major pilgrimage sites – Kedarnath, Badrinath, Gangotri, or Yamunotri, depending on your travel plan. Additional Do Dham Yatra packages are available on the Taxi Safar website, which you can explore and book as per your convenience.",
      },
      {
        id: 2,
        number: "02",
        question: "Can I choose any two Dhams according to my preference?",
        answer:
          "Yes, you can choose and book any two Dham Yatra from the available packages on the Taxi Safar website based on your preference.",
      },
      {
        id: 3,
        number: "03",
        question: "How many days does a Do Dham Yatra usually take?",
        answer:
          "Generally, a Do Dham Yatra takes around 6 to 7 days, but the duration depends on the selected Dhams and your pickup city.",
      },
      {
        id: 4,
        number: "04",
        question: "Is one-way drop service available for Do Dham Yatra?",
        answer:
          "No, one-way drop service is not available for Ek Dham, Do Dham, or Char Dham Yatra. If you only need one-way travel service, you must go to the Outstation Booking section on the Taxi Safar website and book using the One Way Drop or Round Trip option.",
      },
      {
        id: 5,
        number: "05",
        question:
          "Does the Do Dham Yatra package include hotel and food services?",
        answer:
          "No, currently Taxi Safar only provides taxi services. Hotel and food arrangements must be made by the travelers themselves. We are working on adding hotel options to the package soon.",
      },
      {
        id: 6,
        number: "06",
        question: "Where can I see my booking details after confirmation?",
        answer:
          'Once your booking is confirmed, you can view all your travel details in the "My Trips" section of the Taxi Safar website.',
      },
    ],
    chardham: [
      {
        id: 1,
        number: "01",
        question: "Does Taxi Safar provide Char Dham Yatra service?",
        answer:
          "Yes, Taxi Safar offers safe and reliable taxi services for the Char Dham Yatra (Yamunotri, Gangotri, Kedarnath, and Badrinath).",
      },
      {
        id: 2,
        number: "02",
        question:
          "What types of vehicles are available for the Char Dham Yatra?",
        answer:
          "We offer a range of vehicles including Swift, Dzire, Ertiga, Innova Crysta, SUVs, and Tempo Travellers.",
      },
      {
        id: 3,
        number: "03",
        question: "Can I pre-schedule the travel date and time?",
        answer:
          "Yes, you can choose your preferred date and time at the time of booking, as per your convenience.",
      },
      {
        id: 4,
        number: "04",
        question: "Is one-way drop service available for the Char Dham Yatra?",
        answer:
          "No, one-way drop service is not available for Ek Dham, Do Dham, or Char Dham Yatra. If you only want a one-way trip, you must go to the Outstation Booking section on the Taxi Safar website and book the service using the One Way Drop or Round Trip options.",
      },
      {
        id: 5,
        number: "05",
        question: "What is included in the fare for the Char Dham Yatra?",
        answer:
          "There are two pricing options available on the Taxi Safar website:\nBest Price Option: Toll tax, parking charges, and state taxes are not included.\nInclusive Price Option: Toll tax, state tax, driver charges, and fuel charges are included.\nIn both options, parking charges are additional.",
      },
      {
        id: 6,
        number: "06",
        question:
          "Is a local guide or helper service available for the Char Dham Yatra?",
        answer:
          "Yes, you can book a local guide or helper service at an additional cost.",
      },
      {
        id: 7,
        number: "07",
        question: "Where can I view my Char Dham Yatra booking details?",
        answer:
          'Once your booking is confirmed, you can go to the "My Trips" section in your profile on the Taxi Safar website to view all your trip details.',
      },
    ],
  };

  const itineraryRef = useRef<HTMLDivElement | null>(null);

  const scrollToItinerary = () => {
    if (itineraryRef.current) {
      const yOffset = -100; // Adjust this value for the top gap
      const y =
        itineraryRef.current.getBoundingClientRect().top +
        window.scrollY +
        yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const router = useRouter();
  const [SessionData, setSessionData] = useState() as any;

  let sessionId = null;
  if (typeof window !== "undefined") {
    sessionId = sessionStorage.getItem("sessionId");
  }

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        if (sessionId) {
          const response = (await getSessionById(sessionId as any)) as any;
          if (response.data) {
            setSessionData(response.data);
          } else {
            router.push("/");
            sessionStorage.removeItem("sessionId");
          }
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching session data:", error);
        router.push("/");
        sessionStorage.removeItem("sessionId");
      }
    };

    fetchSessionData();
  }, [sessionId]);

  const [advancePaymentPercentage, setAdvancePaymentPercentage] = useState(
    null
  ) as any;
  const [TollTax, setTollTax] = useState(0) as any;
  const [roundtripTollTax, setRoundtripTollTax] = useState(0) as any;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = (await getAdvancePayment("")) as any;

        if (response.status) {
          setAdvancePaymentPercentage(response?.data?.percentage);
          setTollTax(parseFloat(response?.data?.toll_tax));
          setRoundtripTollTax(parseFloat(response?.data?.roundtrip_toll_tax));
        }
      } catch (error) {
        console.error("Error fetching session data:", error);
      }
    };

    fetchData();
  }, []);
  // console.log("setAdvancePaymentPercentage",typeof TollTax,roundtripTollTax)

  const getLocalityPlaceId = async (
    placeId: string
  ): Promise<string | null> => {
    try {
      const response = await fetch(
        `${process.env.API_URL}/api/map/locality?place_id=${placeId}`
      );

      if (!response.ok) {
        console.error(`Error: ${response.status} - ${response.statusText}`);
        return null;
      }

      const data = await response.json();

      return data?.status && data?.data?.locality_place_id
        ? data.data.locality_place_id
        : null;
    } catch (error) {
      return null;
    }
  };

  const [Data, setData] = useState([]) as any;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // console.log("SessionData", SessionData)
        if (SessionData && SessionData?.category == "outstation") {
          if (SessionData?.tripType == "oneWay") {
            const places = SessionData?.places || [];
            const firstPlace = places[0]?.value;
            const lastPlace = places[places.length - 1]?.value;

            const pickUpLocalityPlaceId = await getLocalityPlaceId(firstPlace);
            const dropUpLocalityPlaceId = await getLocalityPlaceId(lastPlace);

            const query =
              pickUpLocalityPlaceId &&
              dropUpLocalityPlaceId &&
              places?.length == 2
                ? `discount_trip_type=oneWay&discount_pickup_placeId=${pickUpLocalityPlaceId}&discount_drop_placeId=${dropUpLocalityPlaceId}`
                : "";
            const response = (await getVehicles(query)) as any;
            if (response.data) {
              setData(response.data);
            }
          } else if (SessionData?.tripType == "roundTrip") {
            const places = SessionData?.places || [];
            const firstPlace = places[0]?.value;

            const pickUpLocalityPlaceId = await getLocalityPlaceId(firstPlace);

            const query = pickUpLocalityPlaceId
              ? `discount_trip_type=roundTrip&discount_pickup_placeId=${pickUpLocalityPlaceId}`
              : "";
            const response = (await getVehicles(query)) as any;
            if (response.data) {
              setData(response.data);
            }
          } else {
            const response = (await getVehicles("")) as any;
            if (response.data) {
              setData(response.data);
            }
          }
        } else if (
          SessionData &&
          SessionData?.category == "localairport" &&
          SessionData?.tripType == "local" &&
          SessionData?.city_id
        ) {
          const response = (await getVehicles(
            `city_id=${SessionData?.city_id}&local_rental_plan_id=${SessionData?.local_rental_plan_id}&discount_trip_type=local&discount_city_id=${SessionData?.city_id}`
          )) as any;
          if (response.data) {
            setData(response.data);
            // console.log("SessionData localairport local", response.data)
          }
        } else if (
          SessionData &&
          SessionData?.category == "localairport" &&
          SessionData?.tripType == "airport" &&
          SessionData?.airport_city_id
        ) {
          const response = (await getVehicles(
            `city_id=${SessionData?.airport_city_id}&airport_id=${SessionData?.airport_id}&discount_trip_type=airport&discount_city_id=${SessionData?.airport_city_id}`
          )) as any;
          if (response.data) {
            setData(response.data);
          }
        } else if (
          SessionData &&
          SessionData?.car_tab == "chardham" &&
          SessionData?.dham_pickup_city_id
        ) {
          const response = (await getVehicles(
            `dham_pickup_city_id=${SessionData?.dham_pickup_city_id}`
          )) as any;
          if (response.data) {
            setData(response.data);
          }
        }
      } catch (error) {
        console.error("Error fetching session data:", error);
      }
    };

    fetchData();
  }, [SessionData]);

  const navigateToPage = () => {
    if (SessionData?.car_tab == "taxi") {
      router.push({
        pathname: "/",
      });
    } else if (SessionData?.car_tab == "chardham") {
      router.push({
        pathname: "/chardham",
      });
    } else if (SessionData?.car_tab == "hotel") {
      router.push({
        pathname: "/hotel",
      });
    }
  };

  // const distance = SessionData?.distance;
  const distance = Math.ceil(Number(SessionData?.distance));

  const datePickerRef = useRef<any>(null);
  const datePickerReturnRef = useRef<any>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const focusDatePicker = () => {
    if (wrapperRef.current) {
      wrapperRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      if (datePickerRef.current) {
        datePickerRef.current.setOpen(true);
      }
    }
  };

  const allPlaces = SessionData?.places;
  const tripType = SessionData?.tripType;

  if (
    tripType === "roundTrip" &&
    Array.isArray(allPlaces) &&
    allPlaces.length > 0
  ) {
    if (allPlaces[allPlaces.length - 1] !== allPlaces[0]) {
      allPlaces.push(allPlaces[0]);
    }
  }

  const [departureDate, setDepartureDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 3 * 60);

    const minutes = now.getMinutes();
    const roundedMinutes = minutes > 30 ? 60 : 30;
    now.setMinutes(roundedMinutes, 0, 0);

    return now;
  });

  const [returnDate, setReturnDate] = useState(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    if (now.getHours() < 23) {
      tomorrow.setDate(now.getDate());
    } else {
      tomorrow.setDate(now.getDate() + 1);
    }
    tomorrow.setHours(23, 0, 0, 0);
    return tomorrow;
  }) as any;

  const Origins = (places: any[]): string => {
    if (!places || places.length === 0) return "";

    const start = places[0];

    const origins = `place_id:${start?.value}`;

    return origins;
  };

  // const Destinations = (places: any[]): string => {
  //   if (!places || places.length === 0) return "";

  //   const destinations = places.slice(1).filter((place) => place?.value);

  //   const destinationsQuery = destinations
  //     .map((place) => `place_id:${place.value}`)
  //     .join("|");

  //   return destinationsQuery;
  // };

  // const calculateDaysDifference = (departureDate: any, returnDate: any) => {
  //     if (!departureDate || !returnDate) {
  //         return 1;
  //     }
  //     const timeDifference = returnDate - departureDate;
  //     const daysDifference = timeDifference / (1000 * 3600 * 24)

  //     const decimalPart = daysDifference % 1;

  //     if (decimalPart >= 0.9) {
  //         return Math.ceil(daysDifference + 1);
  //     } else if (decimalPart >= 0.1) {
  //         return Math.floor(daysDifference + 1);
  //     } else {
  //         return Math.floor(daysDifference + 1);
  //     }
  // };
  const calculateDaysDifference = (departureDate: any, returnDate: any) => {
    if (!departureDate || !returnDate) {
      return 1;
    }
    console.log("departureDate", departureDate);
    console.log("returnDate", returnDate);
    // const timeDifference = returnDate.getTime() - departureDate.getTime();
    const departureDateObj = new Date(departureDate);
    const returnDateObj = new Date(returnDate);

    const timeDifference = returnDateObj.getTime() - departureDateObj.getTime();
    // If return date is same or earlier, return 1
    if (timeDifference <= 0) return 1;

    const days = timeDifference / (1000 * 60 * 60 * 24);

    // Round up any partial day to next full day
    return Math.ceil(days);
  };

  const generateDateRange = (startDay: any, endDay: any) => {
    const dates = [];
    const today = departureDate ? new Date(departureDate) : new Date();
    for (let i = startDay; i <= endDay; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dateRange = generateDateRange(
    0,
    calculateDaysDifference(departureDate, returnDate) - 1
  );

  const [computedPrices, setComputedPrices] = useState<any[]>([]);
  const [taxIncluded, setTaxIncluded] = useState(false);

  function calculateDiscountedPrice(price: any, discountPercentage: any) {
    if (!price || price <= 0) return 0;
    if (!discountPercentage || discountPercentage < 0) return price;

    let originalPrice = Math.floor(price);
    let discount = (discountPercentage * originalPrice) / 100;
    // return (originalPrice - discount);
    return Math.floor(originalPrice - discount);
  }

  const [overAllDiscount, setOverAllDiscount] = useState(0);
  const [cityWiseDiscount, setCityWiseDiscount] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (SessionData?.discount_slug) {
        try {
          const query = `slug=${SessionData?.discount_slug}`;
          const response = (await getDiscount(query)) as any;

          if (
            response?.data?.apply_overall_discount &&
            response?.data?.overall_discount
          ) {
            setOverAllDiscount(response?.data?.overall_discount);
          }

          if (response?.data?.apply_citywise_discount) {
            setCityWiseDiscount(response?.data?.apply_citywise_discount);
          }
        } catch (error) {
          console.error("Error fetching vehicles:", error);
        }
      }
    };

    fetchData();
  }, [SessionData]);

  useEffect(() => {
    if (!Data) return;
    const calculatePrices = () => {
      const calculatedData = Data.map((item: any) => {
        // console.log("calculatedData", item.title, item.one_way_trip_pricings)
        // console.log("setAdvancePaymentPercentage", TollTax, roundtripTollTax, item.perdaystatetaxcharges)
        let discount = 0;
        let price = "" as any;
        let discountPrice = "" as any;
        let includedKm = `${distance} Km`;
        // const taxPerKm = taxIncluded ? 1.80 : 0;
        const taxPerKm = taxIncluded ? TollTax : 0;
        const tripType = SessionData?.tripType;
        const Category = SessionData?.category;
        const CarTab = SessionData?.car_tab;
        if (Category == "outstation" && CarTab == "taxi") {
          if (tripType == "oneWay" && distance) {
            const taxOneWay = Math.floor(taxPerKm * distance);
            if (item?.minimum_price_range >= distance) {
              price = item?.minimum_price + taxOneWay;
            } else if (item?.one_way_trip_pricings) {
              const range = item?.one_way_trip_pricings.find(
                (i: any) => distance >= i.from && distance <= i.to
              );
              if (range) {
                const price_per_km = range ? parseFloat(range.price_per_km) : 0;
                price = Math.floor(distance * price_per_km) + taxOneWay;
              } else {
                const lastRange =
                  item?.one_way_trip_pricings[
                    item?.one_way_trip_pricings?.length - 1
                  ];
                const price_per_km =
                  distance > lastRange?.to
                    ? parseFloat(lastRange.price_per_km)
                    : 0;
                price = Math.floor(distance * price_per_km) + taxOneWay;
              }
            }

            if (
              item?.discount_vehicles &&
              item?.discount_vehicles[0]?.discount_cities &&
              cityWiseDiscount
            ) {
              discount = Math.max(
                item?.discount_vehicles?.[0]?.discount || 0,
                overAllDiscount || 0
              );
              discountPrice = calculateDiscountedPrice(price, discount);
            } else {
              discount = overAllDiscount;
              discountPrice = calculateDiscountedPrice(price, discount);
            }
          } else if (tripType == "roundTrip" && distance) {
            const days = calculateDaysDifference(departureDate, returnDate);
            if (days > 0 && item?.priceperkm) {
              const KmAsPerDays = days * 250;
              const roundTripKm = distance * 2;
              let km = roundTripKm > KmAsPerDays ? roundTripKm : KmAsPerDays;
              const taxRoundTrip = Math.floor(taxPerKm * km);
              const statetaxRoundTrip = taxIncluded
                ? days * item.perdaystatetaxcharges
                : 0;

              includedKm = `${km} Km`;
              const fixed_price_per_km = item.priceperkm
                ? parseFloat(item.priceperkm)
                : 0;
              const fixed_driver_expenses = item?.driver_expences
                ? parseFloat(item?.driver_expences)
                : 0;
              price =
                Math.floor(km * fixed_price_per_km) +
                fixed_driver_expenses +
                taxRoundTrip +
                statetaxRoundTrip;
              if (
                Array.isArray(item?.discount_vehicles) &&
                item.discount_vehicles.length > 0 &&
                cityWiseDiscount
              ) {
                discount = Math.max(
                  item?.discount_vehicles?.[0]?.discount || 0,
                  overAllDiscount || 0
                );
                discountPrice = calculateDiscountedPrice(price, discount);
              } else {
                discount = overAllDiscount;
                discountPrice = calculateDiscountedPrice(price, discount);
              }
            }
          }
        } else if (Category == "localairport" && CarTab == "taxi") {
          if (tripType == "local" && distance) {
            const tax = Math.floor(taxPerKm * distance);
            if (item?.local_rental_pricings[0]) {
              price = Math.floor(item?.local_rental_pricings[0]?.price);
            }

            if (SessionData?.time) {
              includedKm = `${SessionData?.time} hours, ${distance} Km`;
            }
          } else if (tripType == "airport" && distance) {
            const tax = Math.floor(taxPerKm * distance);
            if (item?.airport_pricings[0]) {
              price = Math.floor(item?.airport_pricings[0]?.price);
            }
            includedKm = `${distance} Km`;
          }

          if (
            item?.discount_vehicles &&
            item?.discount_vehicles[0]?.discount_cities &&
            cityWiseDiscount
          ) {
            discount = Math.max(
              item?.discount_vehicles?.[0]?.discount || 0,
              overAllDiscount || 0
            );
            discountPrice = calculateDiscountedPrice(price, discount);
          } else {
            discount = overAllDiscount;
            discountPrice = calculateDiscountedPrice(price, discount);
          }
        } else if (CarTab == "chardham") {
          if (item?.dham_pricings[0]) {
            price = Math.floor(item?.dham_pricings[0]?.price);
            discount = item?.dham_pricings[0]?.discount;
            discountPrice = calculateDiscountedPrice(price, discount);
          }
        }
        // console.log("advancePrice", Math.round(price))
        return {
          ...item,
          computedPrice: Math.round(price),
          computedKm: includedKm,
          discount: discount,
          discountPrice: Math.round(discountPrice),
          // advancePrice: advancePaymentPercentage ? (price * advancePaymentPercentage) / 100 : price
          // advancePrice: advancePaymentPercentage
          //     ? (discountPrice && discount > 0
          //         ? (discountPrice * advancePaymentPercentage) / 100
          //         : (price * advancePaymentPercentage) / 100)
          //     : price
          advancePrice: advancePaymentPercentage
            ? Math.round(
                discountPrice && discount > 0
                  ? (discountPrice * advancePaymentPercentage) / 100
                  : (price * advancePaymentPercentage) / 100
              )
            : Math.round(price),
        };
      });

      return calculatedData.sort(
        (a: any, b: any) => a.computedPrice - b.computedPrice
      );
    };
    setComputedPrices(calculatePrices());
  }, [Data, distance, returnDate, taxIncluded, advancePaymentPercentage]);

  const nowplusthree = new Date();
  nowplusthree.setMinutes(nowplusthree.getMinutes() + 3 * 60);

  const minutes = nowplusthree.getMinutes();
  const roundedMinutes = minutes > 30 ? 60 : 30;
  nowplusthree.setMinutes(roundedMinutes, 0, 0);

  const maxReturnDate = new Date(departureDate);
  maxReturnDate.setDate(maxReturnDate.getDate() + 30);

  useEffect(() => {
    if (SessionData?.pickUpDate) {
      setDepartureDate(new Date(SessionData.pickUpDate));
    }
    if (SessionData?.dropDate) {
      setReturnDate(new Date(SessionData.dropDate));
    }
  }, [SessionData]);

  const generateGoogleMapsLink = (locations: any) => {
    if (locations?.length < 2) {
      console.error("At least two locations are required.");
      return "";
    }

    const origin = locations[0].value;
    const destination = locations[locations.length - 1].value;
    const waypointsArray = locations
      .slice(1, -1)
      .map((loc: any) => `place_id:${loc.value}`);

    let googleMapsLink = `https://www.google.com/maps/embed/v1/directions?origin=place_id:${origin}&destination=place_id:${destination}&key=${process.env.GOOGLE_MAP_API_KEY}`;

    if (waypointsArray.length > 0) {
      const waypoints = waypointsArray.join("|");
      googleMapsLink = `https://www.google.com/maps/embed/v1/directions?origin=place_id:${origin}&destination=place_id:${destination}&waypoints=${waypoints}&key=${process.env.GOOGLE_MAP_API_KEY}`;
    }

    return googleMapsLink;
  };

  const [embedMapLink, setEmbdedMapLink] = useState(null) as any;

  useEffect(() => {
    if (tripType == "oneWay" || tripType == "roundTrip") {
      // console.log("allPlaces", allPlaces)
      if (allPlaces?.length > 1) {
        setEmbdedMapLink(generateGoogleMapsLink(allPlaces));
      }
    } else {
      setEmbdedMapLink(null);
    }
  }, [allPlaces, tripType]);

  function formatDate(departureDate: any) {
    const date = moment(departureDate);

    const day = date.format("DD");
    const month = date.format("MMM");
    const year = date.format("YYYY");
    const time = date.format("hh:mm A");

    return { day, month, year, time };
  }

  const formatedDepartureDate = formatDate(departureDate);
  const formatedReturnDate = formatDate(returnDate);

  const [DhamPackage, setDhamPackage] = useState() as any;
  const [DhamPackageRoutes, setDhamPackageRoutes] = useState() as any;

  useEffect(() => {
    (async () => {
      if (SessionData?.dham_package_id && SessionData?.dham_pickup_city_id) {
        await getDhamPackageById(
          SessionData?.dham_package_id,
          `dham_pickup_city_id=${SessionData?.dham_pickup_city_id}`
        ).then((result: any) => {
          if (result) {
            setDhamPackage(result?.data);
            if (result?.data?.dham_pickup_cities?.[0]?.dham_stops) {
              let dhamStops = [...result.data.dham_pickup_cities[0].dham_stops];

              const dhamFirst = {
                dham_pickup_city_id: 0,
                name: result?.data?.dham_pickup_cities?.[0]?.name,
              };

              const dhamLast = { ...dhamFirst };

              dhamStops.unshift(dhamFirst);
              dhamStops.push(dhamLast);

              setDhamPackageRoutes(dhamStops);
            }
          }
        });
      }
    })();
  }, [SessionData]);
  // console.log("DhamPackage", DhamPackage)

  useEffect(() => {
    if (
      departureDate &&
      SessionData?.car_tab == "chardham" &&
      SessionData?.dham_package_days
    ) {
      // setReturnDate(
      //   moment(departureDate)
      //     .add(SessionData?.dham_package_days - 1, "days")
      //     .format("YYYY-MM-DD HH:mm:ss")
      // );
      setReturnDate(
        moment(departureDate)
          .add(SessionData?.dham_package_days - 1, "days") // add N−1 days
          .set({ hour: 21, minute: 0, second: 0, millisecond: 0 }) // ✅ force 9:00 PM
          .format("YYYY-MM-DD HH:mm:ss")
      );
    }
  }, [SessionData, departureDate]);

  const [DhamCategory, setDhamCategory] = useState() as any;

  useEffect(() => {
    (async () => {
      if (SessionData?.dham_category_id) {
        await getDhamCategoryById(SessionData?.dham_category_id).then(
          (result: any) => {
            if (result) {
              setDhamCategory(result?.data);
            }
          }
        );
      }
    })();
  }, [SessionData]);

  const networkItems = [
    {
      imgSrc: "/images/our-network/driver.jpg",
      title: "Become a Driver or Attach Your Taxi",
      description:
        "Official Taxi Safar Discussion Group Bookings.<br/>Taxi Attachment & All Updates<br/>(Only For Taxi Owners & Drivers)",
      link: "/welcome_to_taxisafar_notice",
      serviceType: "Taxi Attach",
    },
    {
      imgSrc: "/images/our-network/booking.jpg",
      title: "Booking Management",
      description:
        "Partner with us! Access the admin panel to manage bookings in your city or specific areas.",
      serviceType: "Booking Panel",
    },
    {
      imgSrc: "/images/our-network/hotel.jpg",
      title: "List Your Hotel",
      description:
        "List your hotel and connect with travelers. Get started by filling out the form.",
      serviceType: "Hotel List",
    },
  ];
  // console.log("SessionData", SessionData?.pincode)
  return (
    <>
      <Head>
        <title>{"Vehicles"}</title>
      </Head>
      <div
        className={"min-h-screen"}
        style={{ marginTop: "80px", minHeight: "100vh" }}
      >
        {SessionData?.car_tab == "taxi" && (
          <>
            <div className="container pt-0 vicky-cab-vehicle pt-4">
              {/* <p className="text-danger text-center mb-4 fw-bold">{`*Note: The Razorpay payment mode is currently undergoing testing. Please do not use it for live transactions at this time. *`}</p> */}

              <div className="d-flex justify-content-between ">
                <div
                  className="custom-cursor-pointer taxisafar-back-button"
                  onClick={() => navigateToPage()}
                >
                  <i className="fa-sharp-duotone fa-regular fa-arrow-left"></i>{" "}
                  Go Back
                </div>
                <div
                  className="input-group "
                  style={{ maxWidth: "180px", maxHeight: "40px" }}
                >
                  <input
                    type="text"
                    name="coupen"
                    className="form-control h-100 p-3"
                    placeholder="Coupon Code"
                    aria-label="Coupon Code"
                    // aria-describedby="button-apply"
                  />
                  <button
                    className="btn btn-danger h-100"
                    type="button"
                    id="button-apply"
                  >
                    Apply
                  </button>
                </div>
              </div>
              <div className="my-3 taxisafar-date-section">
                <div className="row">
                  {/* <div className="col-md-6 mt-2">
                                        <div className="vicky-cabs-dates">
                                            <div className="heading">
                                                <h6 className="text-center py-1">
                                                    Selected Routes
                                                </h6>
                                            </div>
                                            <div className="px-2 pb-2">
                                                {tripType == 'oneWay' || tripType == 'roundTrip' ?
                                                    embedMapLink && (
                                                        <iframe
                                                            width="100%"
                                                            height="300"
                                                            style={{ border: "0" }}
                                                            loading="lazy"
                                                            allowFullScreen
                                                            referrerPolicy="no-referrer-when-downgrade"
                                                            className="map-routes"
                                                            src={embedMapLink}>
                                                        </iframe>
                                                    ) :
                                                    allPlaces?.length >= 1 && (
                                                        <div className=''>
                                                            <div className='start-align'>
                                                                {allPlaces.map((data: any, index: number) => (
                                                                    <span className='' key={index}>
                                                                        {index != 0 && (
                                                                            <i className="fa fa-arrow-right me-1"></i>
                                                                        )}
                                                                        <span className="place-tag" key={index}>
                                                                            {data?.label}
                                                                        </span>
                                                                    </span>

                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                            </div>
                                        </div>

                                    </div> */}
                  <div className="col-md-12 mt-2">
                    <div className="vicky-cabs-dates vicky-cabs-date-time">
                      {tripType == "roundTrip" ? (
                        <Row className="g-0 d-flex">
                          <Col xs={4} md={4} className="d-flex flex-column">
                            <label className="vicky-cab-form-label">
                              Pickup Date & Time
                            </label>
                            <div
                              className="custom-input left-datepicker position-relative"
                              ref={wrapperRef}
                            >
                              <DatePicker
                                ref={datePickerRef}
                                selected={departureDate}
                                onChange={(date: any) => {
                                  if (date) {
                                    setDepartureDate(date);
                                    const iDate = new Date(date);
                                    const dDate = new Date(departureDate);
                                    const rDate = new Date(returnDate);
                                    if (iDate < nowplusthree) {
                                      setDepartureDate(departureDate);
                                    }

                                    if (iDate > rDate) {
                                      if (
                                        (iDate.getHours() >= 23 &&
                                          iDate.getMinutes() > 0) ||
                                        iDate.getHours() > 23
                                      ) {
                                        const tomorrow = new Date(iDate);
                                        tomorrow.setDate(
                                          tomorrow.getDate() + 1
                                        );
                                        tomorrow.setHours(23, 0, 0, 0);
                                        setReturnDate(tomorrow);
                                      } else {
                                        const updatedDate = new Date(iDate);
                                        updatedDate.setHours(23, 0, 0, 0);
                                        setReturnDate(updatedDate);
                                      }
                                    }
                                  } else {
                                    setDepartureDate(departureDate);
                                  }
                                }}
                                onFocus={(e: any) => (e.target.readOnly = true)}
                                showTimeSelect
                                timeFormat="h:mm aa"
                                timeIntervals={30}
                                dateFormat="dd/MM/yyyy h:mm aa"
                                placeholderText="Pickup Date & Time *"
                                minDate={new Date()}
                                filterTime={(time) => {
                                  const timeToCompare = new Date(time);

                                  return timeToCompare >= nowplusthree;
                                }}
                                isClearable={false}
                                className="d-none"
                              />
                            </div>

                            {formatedDepartureDate && (
                              <div
                                className="custom-formated-date custom-cursor-pointer mt-2"
                                onClick={() =>
                                  datePickerRef.current?.setOpen(true)
                                }
                              >
                                <div className="day-box">
                                  <p className="day">
                                    {formatedDepartureDate?.day}
                                  </p>
                                </div>
                                <div className="end-month-year">
                                  <p className="month-year">{`${formatedDepartureDate?.month}, ${formatedDepartureDate?.year}`}</p>
                                  <p className="time">{`${formatedDepartureDate?.time}`}</p>
                                </div>
                              </div>
                            )}
                          </Col>

                          <Col
                            xs={4}
                            md={4}
                            className="d-flex flex-column align-items-center justify-content-center"
                          >
                            <div className="taxisafar-trip-days">
                              <p className="mb-0">
                                Round Trip -{" "}
                                {calculateDaysDifference(
                                  departureDate,
                                  returnDate
                                )}{" "}
                                Days
                              </p>
                            </div>

                            <div className="taxisafar-trip-days-mobile">
                              <p className="mb-0">
                                Round Trip <br />{" "}
                                {calculateDaysDifference(
                                  departureDate,
                                  returnDate
                                )}{" "}
                                Days
                              </p>
                            </div>
                          </Col>

                          <Col
                            xs={4}
                            md={4}
                            className="d-flex flex-column align-items-end"
                          >
                            <label className="vicky-cab-form-label">
                              Drop Date & Time
                            </label>
                            <div className="custom-input right-datepicker return-date position-relative">
                              <DatePicker
                                ref={datePickerReturnRef}
                                selected={returnDate}
                                onFocus={(e: any) => (e.target.readOnly = true)}
                                onChange={(date: any) => {
                                  if (date) {
                                    const updatedDate = new Date(date);
                                    const dDate = new Date(departureDate);
                                    updatedDate.setHours(23, 0, 0, 0);
                                    if (updatedDate < dDate) {
                                      updatedDate.setDate(
                                        updatedDate.getDate() + 1
                                      );
                                    }
                                    setReturnDate(updatedDate);
                                  } else {
                                    setReturnDate(returnDate);
                                  }
                                }}
                                timeFormat="h:mm aa"
                                dateFormat="dd/MM/yyyy h:mm aa"
                                placeholderText="Drop Date & Time *"
                                minDate={departureDate}
                                maxDate={maxReturnDate}
                                timeIntervals={1440}
                                highlightDates={dateRange}
                                isClearable={false}
                              />
                            </div>
                            {formatedReturnDate && (
                              <div
                                className="custom-formated-date custom-cursor-pointer mt-2"
                                onClick={() =>
                                  datePickerReturnRef.current?.setOpen(true)
                                }
                              >
                                <div className="day-box">
                                  <p className="day">
                                    {formatedReturnDate?.day}
                                  </p>
                                </div>
                                <div className="end-month-year">
                                  <p className="month-year">{`${formatedReturnDate?.month}, ${formatedReturnDate?.year}`}</p>
                                  <p className="time">{`${formatedReturnDate?.time}`}</p>
                                </div>
                              </div>
                            )}
                          </Col>
                        </Row>
                      ) : (
                        <Row className="g-0 d-flex  align-items-center ">
                          <Col xs={4} md={4} className="d-flex flex-column">
                            <label className="vicky-cab-form-label">
                              Pickup Date & Time
                            </label>
                            <div
                              className="custom-input left-datepicker position-relative"
                              ref={wrapperRef}
                            >
                              <DatePicker
                                ref={datePickerRef}
                                selected={departureDate}
                                onChange={(date: any) => {
                                  if (date) {
                                    setDepartureDate(date);
                                    const iDate = new Date(date);
                                    const dDate = new Date(departureDate);
                                    const rDate = new Date(returnDate);
                                    if (iDate < nowplusthree) {
                                      setDepartureDate(departureDate);
                                    }

                                    if (iDate > rDate) {
                                      if (
                                        (iDate.getHours() >= 23 &&
                                          iDate.getMinutes() > 0) ||
                                        iDate.getHours() > 23
                                      ) {
                                        const tomorrow = new Date(iDate);
                                        tomorrow.setDate(
                                          tomorrow.getDate() + 1
                                        );
                                        tomorrow.setHours(23, 0, 0, 0);
                                        setReturnDate(tomorrow);
                                      } else {
                                        const updatedDate = new Date(iDate);
                                        updatedDate.setHours(23, 0, 0, 0);
                                        setReturnDate(updatedDate);
                                      }
                                    }
                                  } else {
                                    setDepartureDate(departureDate);
                                  }
                                }}
                                onFocus={(e: any) => (e.target.readOnly = true)}
                                showTimeSelect
                                timeFormat="h:mm aa"
                                timeIntervals={30}
                                dateFormat="dd/MM/yyyy h:mm aa"
                                placeholderText="Pickup Date & Time *"
                                minDate={new Date()}
                                filterTime={(time) => {
                                  const timeToCompare = new Date(time);

                                  return timeToCompare >= nowplusthree;
                                }}
                                isClearable={false}
                              />
                            </div>

                            {formatedDepartureDate && (
                              <div
                                className="custom-formated-date custom-cursor-pointer mt-2"
                                onClick={() =>
                                  datePickerRef.current?.setOpen(true)
                                }
                              >
                                <div className="day-box">
                                  <p className="day">
                                    {formatedDepartureDate?.day}
                                  </p>
                                </div>
                                <div className="end-month-year">
                                  <p className="month-year">{`${formatedDepartureDate?.month} - ${formatedDepartureDate?.year}`}</p>
                                  <p className="time">{`${formatedDepartureDate?.time}`}</p>
                                </div>
                              </div>
                            )}
                          </Col>
                          <Col
                            xs={4}
                            md={4}
                            className="d-flex flex-column align-items-center justify-content-center"
                          >
                            <div className="taxisafar-trip-days">
                              {tripType == "airport" && (
                                <p className="mb-0">Airport Transfer</p>
                              )}

                              {tripType == "local" && (
                                <p className="mb-0">Local Rental</p>
                              )}

                              {tripType == "oneWay" && (
                                <p className="mb-0">One Way</p>
                              )}
                            </div>

                            <div className="taxisafar-trip-days-mobile">
                              {tripType == "airport" && (
                                <p className="mb-0">Airport Transfer</p>
                              )}

                              {tripType == "local" && (
                                <p className="mb-0">Local Rental</p>
                              )}

                              {tripType == "oneWay" && (
                                <p className="mb-0">One Way</p>
                              )}
                            </div>
                          </Col>

                          <Col xs={4} md={4}></Col>
                          {tripType == "oneWay" ||
                            (SessionData?.places.length > 0 && (
                              <>
                                <Col xs={5} md={4} className="d-none d-md-flex">
                                  <div className="trip_places mt-4 d-flex w-100">
                                    <img
                                      src="./images/icons/pickup.png"
                                      className="me-3"
                                      height={"24px"}
                                      width={"24px"}
                                    />
                                    {SessionData.places[0] && (
                                      <p>{SessionData.places[0].label}</p>
                                    )}
                                  </div>
                                </Col>
                                <Col
                                  xs={2}
                                  md={4}
                                  className="d-none d-md-inline"
                                >
                                  {/* Leave empty or add fallback content if needed */}
                                  <div className="joint_line mx-md-4 mt-3 d-flex justify-content-between">
                                    <div></div>
                                  </div>
                                </Col>

                                <Col xs={5} md={4} className="d-none d-md-flex">
                                  <div className="trip_places mt-4  d-flex w-100">
                                    <img
                                      src="./images/icons/destination.png"
                                      className="me-3"
                                      height={"24px"}
                                      width={"24px"}
                                    />
                                    {SessionData.places[1] && (
                                      <p>{SessionData.places[1].label}</p>
                                    )}
                                  </div>
                                </Col>
                              </>
                            ))}
                        </Row>
                      )}
                    </div>
                  </div>
                  {
                    <div className="mx-auto mt-2 text-center d-bock d-md-none ">
                      <button
                        className=" btn dark-line bg-none border-black w-100"
                        onClick={() => {
                          itineraryRef.current?.scrollIntoView({
                            behavior: "smooth",
                          });
                        }}
                      >
                        View Multiple Points
                        <img
                          src="/images/icons/down.png"
                          width="28"
                          height="28"
                          alt="Dropdown"
                        ></img>
                      </button>
                    </div>
                  }
                </div>
              </div>

              {(tripType == "roundTrip" || tripType == "oneWay") && (
                <>
                  <div className="mb-4">
                    <Row className="g-lg-5 g-2">
                      <Col xs={6}>
                        <div
                          className={`price-tax-btn ${
                            taxIncluded ? "" : "active"
                          }`}
                          onClick={() => setTaxIncluded(false)}
                        >
                          <h6>Best Price</h6>
                        </div>
                      </Col>

                      <Col xs={6}>
                        <div
                          className={`price-tax-btn ${
                            taxIncluded ? "active" : ""
                          }`}
                          onClick={() => setTaxIncluded(true)}
                        >
                          <h6>Toll & State Tax Inclusive Price</h6>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </>
              )}
            </div>

            <div className="vicky-cabs mb-5">
              <section className="pricing-section-four py-0">
                <div className="py-0">
                  <div className="outer-box" data-aos="fade-left">
                    <div className="pricing-carousel owl-carousel owl-theme default-dots container tripType-taxi-pricing-card">
                      <div className="row">
                        {computedPrices.map((item, index) => (
                          <div
                            className="col-lg-4 col-md-6 pricing-block-four"
                            key={index}
                          >
                            <PricingCardThree
                              vehicle_id={item?.id}
                              img={`${process.env.API_URL}/vehicle/${item?.image}`}
                              car={item?.title}
                              price={item.advancePrice}
                              originalPrice={item.computedPrice}
                              includedKm={item.computedKm}
                              pricePerKm={item.extra_fare_km}
                              additional_time_charge={
                                item.additional_time_charge
                              }
                              fuelcharges={item.fuelcharges}
                              drivercharges={item.drivercharges}
                              nightcharges={item.nightcharges}
                              parkingcharges={item.parkingcharges}
                              link={"#"}
                              terms={item?.terms}
                              departureDate={departureDate}
                              returnDate={returnDate}
                              tripType={tripType}
                              taxIncluded={taxIncluded}
                              buttonName={"Book a Taxi"}
                              focusDatePicker={focusDatePicker}
                              places={allPlaces}
                              phoneNo={SessionData?.phoneNo}
                              category={SessionData?.category}
                              city_id={SessionData?.city_id}
                              local_rental_plan_id={
                                SessionData?.local_rental_plan_id
                              }
                              airport_id={SessionData?.airport_id}
                              airport_city_id={SessionData?.airport_city_id}
                              airport_from_to={SessionData?.airport_from_to}
                              discount={item.discount}
                              discountPrice={item.discountPrice}
                              passengers={item?.passengers}
                              ac_cab={item?.ac_cab}
                              luggage={item?.luggage}
                              pincode={SessionData?.pincode}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            {(tripType == "oneWay" || tripType == "roundTrip") &&
              SessionData?.places && (
                <div ref={itineraryRef}>
                  <Container>
                    {SessionData?.places?.[0]?.label && (
                      <div className="mb-5">
                        {/* <div className="itinerary-title text-center">
                                                <h3 className="mb-0">
                                                    Your Itinerary
                                                </h3>
                                            </div> */}

                        <h4 className="taxisafar-title my-4">
                          Your Tour Itinerary & Route
                        </h4>

                        {SessionData?.places?.map((obj: any, index: any) => (
                          <div
                            className="taxisafar-itinerary g-2 align-items-center d-flex"
                            key={index}
                          >
                            <div className="timeline-column position-relative d-flex justify-content-start">
                              <div className="timeline-dotline">
                                <div className="dot"></div>

                                {/* Show dashed line for all except the last dot */}
                                {index !== SessionData.places.length - 1 && (
                                  <div className="vertical-dashed-line"></div>
                                )}
                              </div>
                            </div>

                            <div className="w-100 ms-3">
                              <div className="trip_places my-2 d-flex p-4 align-items-center">
                                {index === 0 && (
                                  <img
                                    src="./images/icons/pickup.png"
                                    className="me-3"
                                    height="24px"
                                    width="24px"
                                  />
                                )}
                                {!(
                                  index === 0 ||
                                  index === SessionData?.places.length - 1
                                ) && (
                                  <img
                                    src="./images/icons/stops.png"
                                    className="me-3"
                                    height="24px"
                                    width="24px"
                                  />
                                )}
                                {index === SessionData?.places.length - 1 && (
                                  <img
                                    src="./images/icons/destination.png"
                                    className="me-3"
                                    height="24px"
                                    width="24px"
                                  />
                                )}
                                <h5 className="mb-0 heading">{obj?.label}</h5>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Container>
                </div>
              )}
            {(tripType == "oneWay" || tripType == "roundTrip") &&
              embedMapLink && (
                <Container>
                  <div className="pb-2 taxisafar-map">
                    <iframe
                      width="100%"
                      height="445"
                      style={{ border: "0" }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      className="map-routes"
                      src={embedMapLink}
                    ></iframe>
                  </div>
                </Container>
              )}
          </>
        )}

        {SessionData?.car_tab == "hotel" && (
          <>
            <div className="container pt-4 vicky-cab-vehicle mb-5">
              <div
                className="custom-cursor-pointer taxisafar-back-button"
                onClick={() => navigateToPage()}
              >
                <i className="fa-sharp-duotone fa-regular fa-arrow-left"></i> Go
                Back
              </div>
              <p className="text-danger text-center mb-0 fw-bold">{`We will provide hotels soon.`}</p>
            </div>
          </>
        )}

        {SessionData?.car_tab == "chardham" && (
          <>
            <div className="container pt-4 vicky-cab-vehicle mb-5">
              <div
                className="custom-cursor-pointer taxisafar-back-button"
                onClick={() => navigateToPage()}
              >
                <i className="fa-sharp-duotone fa-regular fa-arrow-left"></i> Go
                Back
              </div>
              <div className="taxisafar-date-section">
                <div className="row ">
                  {/* <div className="col-md-6">
                                        <div className="vicky-cabs-dham-info mt-4">
                                            {DhamPackage?.name && DhamPackage.dham_pickup_cities?.length > 0 && DhamPackage.dham_pickup_cities[0]?.name && (
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <p className="mb-0 dham-title ms-2">
                                                        {DhamPackage.dham_pickup_cities[0].name} - {DhamPackage.name}
                                                    </p>

                                                    <div className="dham-itinerary-button me-2" onClick={scrollToItinerary}>
                                                        <i className="fa-regular fa-location-dot"></i>
                                                    </div>
                                                </div>

                                            )}
                                        </div>
                                    </div> */}
                  <div className="col-md-12">
                    <div className="vicky-cabs-dates vicky-cabs-date-time mt-4">
                      <Row className="g-0 d-flex">
                        <Col xs={4} md={4} className="d-flex flex-column">
                          <label className="vicky-cab-form-label">
                            Pickup Date & Time
                          </label>
                          <div
                            className="custom-input left-datepicker position-relative"
                            ref={wrapperRef}
                          >
                            <DatePicker
                              ref={datePickerRef}
                              selected={departureDate}
                              onChange={(date: any) => {
                                if (date) {
                                  setDepartureDate(date);
                                  const iDate = new Date(date);
                                  const dDate = new Date(departureDate);
                                  const rDate = new Date(returnDate);
                                  if (iDate < nowplusthree) {
                                    setDepartureDate(departureDate);
                                  }

                                  if (iDate > rDate) {
                                    if (
                                      (iDate.getHours() >= 23 &&
                                        iDate.getMinutes() > 0) ||
                                      iDate.getHours() > 23
                                    ) {
                                      const tomorrow = new Date(iDate);
                                      tomorrow.setDate(tomorrow.getDate() + 1);
                                      tomorrow.setHours(23, 0, 0, 0);
                                      setReturnDate(tomorrow);
                                    } else {
                                      const updatedDate = new Date(iDate);
                                      updatedDate.setHours(23, 0, 0, 0);
                                      setReturnDate(updatedDate);
                                    }
                                  }
                                } else {
                                  setDepartureDate(departureDate);
                                }
                              }}
                              onFocus={(e: any) => (e.target.readOnly = true)}
                              showTimeSelect
                              timeFormat="h:mm aa"
                              timeIntervals={30}
                              dateFormat="dd/MM/yyyy h:mm aa"
                              placeholderText="Pickup Date & Time *"
                              minDate={new Date()}
                              filterTime={(time) => {
                                const timeToCompare = new Date(time);

                                return timeToCompare >= nowplusthree;
                              }}
                              isClearable={false}
                              className="d-none"
                            />
                          </div>

                          {formatedDepartureDate && (
                            <div
                              className="custom-formated-date custom-cursor-pointer mt-2"
                              onClick={() =>
                                datePickerRef.current?.setOpen(true)
                              }
                            >
                              <div className="day-box">
                                <p className="day">
                                  {formatedDepartureDate?.day}
                                </p>
                              </div>
                              <div className="end-month-year">
                                <p className="month-year">{`${formatedDepartureDate?.month} - ${formatedDepartureDate?.year}`}</p>
                                <p className="time">{`${formatedDepartureDate?.time}`}</p>
                              </div>
                            </div>
                          )}
                        </Col>

                        {/* <Col xs={4} md={4}>
                                                <div className="trip-days">
                                                    <div className="trip-info round-trip-info">
                                                        <p className="text-white text-center mb-0">Minimum</p>
                                                        <p className="text-white text-center mb-0">{SessionData?.dham_package_days} Days Tour</p>
                                                    </div>
                                                </div>
                                            </Col> */}

                        <Col
                          xs={4}
                          md={4}
                          className="d-flex flex-column align-items-center justify-content-center"
                        >
                          <div className="taxisafar-trip-days">
                            <p className="mb-0">
                              Minimum - {SessionData?.dham_package_days} Days
                              Tour
                            </p>
                          </div>

                          <div className="taxisafar-trip-days-mobile">
                            <p className="mb-0">
                              Minimum <br /> {SessionData?.dham_package_days}{" "}
                              Days Tour
                            </p>
                          </div>
                        </Col>

                        <Col
                          xs={4}
                          md={4}
                          className="d-flex flex-column align-items-end"
                        >
                          <label className="vicky-cab-form-label">
                            Drop Date & Time
                          </label>
                          <div className="custom-input right-datepicker return-date position-relative">
                            <DatePicker
                              ref={datePickerReturnRef}
                              selected={returnDate}
                              onFocus={(e: any) => (e.target.readOnly = true)}
                              onChange={(date: any) => {
                                if (date) {
                                  const updatedDate = new Date(date);
                                  const dDate = new Date(departureDate);
                                  updatedDate.setHours(23, 0, 0, 0);
                                  if (updatedDate < dDate) {
                                    updatedDate.setDate(
                                      updatedDate.getDate() + 1
                                    );
                                  }
                                  setReturnDate(updatedDate);
                                } else {
                                  setReturnDate(returnDate);
                                }
                              }}
                              timeFormat="h:mm aa"
                              dateFormat="dd/MM/yyyy h:mm aa"
                              placeholderText="Drop Date & Time *"
                              minDate={departureDate}
                              maxDate={maxReturnDate}
                              timeIntervals={1440}
                              highlightDates={dateRange}
                              isClearable={false}
                              disabled
                            />
                          </div>
                          {formatedReturnDate && (
                            <div
                              className="custom-formated-date mt-2"
                              onClick={() =>
                                datePickerReturnRef.current?.setOpen(true)
                              }
                            >
                              <div className="day-box">
                                <p className="day">{formatedReturnDate?.day}</p>
                              </div>
                              <div className="end-month-year">
                                <p className="month-year">{`${formatedReturnDate?.month} - ${formatedReturnDate?.year}`}</p>
                                <p className="time">{`${formatedReturnDate?.time}`}</p>
                              </div>
                            </div>
                          )}
                        </Col>
                      </Row>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="vicky-cabs mt-4 mb-3"
                style={{ minHeight: "450px" }}
              >
                <section className="pricing-section-four py-0">
                  <div className="py-0">
                    <div className="outer-box" data-aos="fade-left">
                      <div className="pricing-carousel owl-carousel owl-theme default-dots container chardham-Pricing-card">
                        <div className="row">
                          {computedPrices.map((item, index) => (
                            <div
                              className="col-lg-4 col-md-6 pricing-block-four"
                              key={index}
                            >
                              <PricingCardThree
                                vehicle_id={item?.id}
                                img={`${process.env.API_URL}/vehicle/${item?.image}`}
                                car={item?.title}
                                price={item.advancePrice}
                                originalPrice={item.computedPrice}
                                includedKm={item.computedKm}
                                pricePerKm={item.extra_fare_km}
                                additional_time_charge={
                                  item.additional_time_charge
                                }
                                fuelcharges={item.fuelcharges}
                                drivercharges={item.drivercharges}
                                nightcharges={item.nightcharges}
                                parkingcharges={item.parkingcharges}
                                link={"#"}
                                terms={item?.terms}
                                departureDate={departureDate}
                                returnDate={returnDate}
                                tripType={tripType}
                                taxIncluded={taxIncluded}
                                buttonName={"Book a Taxi"}
                                focusDatePicker={focusDatePicker}
                                places={allPlaces}
                                phoneNo={SessionData?.phoneNo}
                                category={SessionData?.category}
                                city_id={SessionData?.city_id}
                                local_rental_plan_id={
                                  SessionData?.local_rental_plan_id
                                }
                                airport_id={SessionData?.airport_id}
                                airport_city_id={SessionData?.airport_city_id}
                                airport_from_to={SessionData?.airport_from_to}
                                car_tab={SessionData?.car_tab}
                                dhamPackageRoutes={DhamPackageRoutes}
                                dhamPackage={
                                  DhamPackage?.name ? DhamPackage?.name : ""
                                }
                                dhamPackageCity={
                                  DhamPackage?.dham_pickup_cities?.[0]?.name
                                    ? DhamPackage?.dham_pickup_cities?.[0]?.name
                                    : ""
                                }
                                dham_package_id={SessionData?.dham_package_id}
                                dham_pickup_city_id={
                                  SessionData?.dham_pickup_city_id
                                }
                                dham_package_days={
                                  SessionData?.dham_package_days
                                }
                                dham_category_name={DhamCategory?.name}
                                dham_category_id={SessionData?.dham_category_id}
                                passengers={item?.passengers}
                                large_size_bag={item?.large_size_bag}
                                medium_size_bag={item?.medium_size_bag}
                                hand_bag={item?.hand_bag}
                                discount={item.discount}
                                discountPrice={item.discountPrice}
                                ac_cab={item?.ac_cab}
                                luggage={item?.luggage}
                                pincode={SessionData?.pincode}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* <Row className="mb-5">
                                <Col md={4} ref={itineraryRef}>
                                    <div className="chardham-itinerary">
                                        <div className="heading">
                                            <p className="mb-0">Your Selected Itinerary</p>
                                        </div>
                                        <div className="d-flex justify-content-center">
                                            <div className="content mb-2 w-0">
                                                {DhamPackageRoutes?.map((obj: any, index: any) => (
                                                    <p
                                                        className={`mt-1 mb-0 dham-routes ${index === 0 || index === DhamPackageRoutes.length - 1 ? 'fw-semibold' : ''}`}
                                                        key={index}
                                                    >
                                                        <i className="me-3 fa-regular fa-location-dot"></i> {obj?.name}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row> */}
              {DhamPackage && (
                <div ref={itineraryRef}>
                  {DhamPackage?.dham_pickup_cities?.[0]?.dham_stops?.length >
                    0 && (
                    <div>
                      {/* <div className="itinerary-title text-center">
                                                <h3 className="mb-0">
                                                    Your Itinerary
                                                </h3>
                                            </div> */}

                      <h4 className="taxisafar-title my-4">Your Itinerary</h4>

                      {DhamPackage?.dham_pickup_cities?.[0]?.dham_stops?.map(
                        (obj: any, index: any) => (
                          <Row className="taxisafar-itinerary g-2" key={index}>
                            <Col
                              lg={1}
                              className="taxisafar-itinerary d-flex flex-column align-items-center"
                            >
                              <div className="icon d-flex flex-column justify-content-center align-items-center">
                                <h6 className="mb-0 text-center day-text">
                                  DAY
                                </h6>
                                <p className="mb-0 text-center">
                                  {String(index + 1).padStart(2, "0")}
                                </p>
                              </div>
                              {index !==
                                DhamPackage?.dham_pickup_cities?.[0]?.dham_stops
                                  .length -
                                  1 && <div className="itinerary-line"></div>}
                            </Col>
                            <Col lg={11}>
                              <div className="dham-itinerary">
                                <div className="d-flex align-items-center">
                                  <img
                                    src="/images/icons/location-pin.png"
                                    width={30}
                                    height={30}
                                    className="me-2"
                                  />
                                  <h5 className="mb-0 heading">{obj?.name}</h5>
                                </div>
                                {obj?.description && (
                                  <p className="mb-0 mt-3">
                                    {obj?.description}
                                  </p>
                                )}
                              </div>
                            </Col>
                          </Row>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}

              <div></div>
            </div>
          </>
        )}
      </div>

      {/* <FAQs
                title="Frequently Asked Questions"
                outstationServices={outstationServices}
            /> */}
      {SessionData?.car_tab === "taxi" && tripType === "roundTrip" && (
        <FAQs
          title="Round Trip FAQs"
          outstationServices={outstationServices.roundTrip}
        />
      )}

      {SessionData?.car_tab === "taxi" && tripType === "airport" && (
        <FAQs
          title="Airport Transfer FAQs"
          outstationServices={outstationServices.airport}
        />
      )}

      {SessionData?.car_tab === "taxi" && tripType === "local" && (
        <FAQs
          title="Local Ride FAQs"
          outstationServices={outstationServices.local}
        />
      )}

      {SessionData?.car_tab === "taxi" && tripType === "oneWay" && (
        <FAQs
          title="One Way Trip FAQs"
          outstationServices={outstationServices.oneWay}
        />
      )}

      {SessionData?.car_tab === "hotel" && (
        <FAQs
          title="Hotel booking FAQs"
          outstationServices={outstationServices.hotel}
        />
      )}

      {SessionData?.car_tab === "chardham" &&
        DhamPackage?.dham_category_id === 1 && (
          <FAQs
            title="1 Dham Yatra FAQs"
            outstationServices={outstationServices.onedham}
          />
        )}

      {SessionData?.car_tab === "chardham" &&
        DhamPackage?.dham_category_id === 2 && (
          <FAQs
            title="2 Dham Yatra FAQs"
            outstationServices={outstationServices.twodham}
          />
        )}

      {SessionData?.car_tab === "chardham" &&
        DhamPackage?.dham_category_id === 3 && (
          <FAQs
            title="4 Dham Yatra FAQs"
            outstationServices={outstationServices.chardham}
          />
        )}

      {SessionData?.car_tab && (
        <HomeJoinNetwork
          title="Partner & Grow With Us"
          subtitle="Join Our Network & Unlock Opportunities"
          networkItems={networkItems}
        />
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps<{
  Data: any;
  SessionData: any;
}> = async (context) => {
  const sessionId = context.query.sessionId as any;
  const sessionData = (await getSessionById(sessionId)) as any;
  const vehicles = (await getVehicles("")) as any;

  return {
    props: {
      Data: vehicles.data,
      SessionData: sessionData.data ? sessionData.data : null,
    },
  };
};
