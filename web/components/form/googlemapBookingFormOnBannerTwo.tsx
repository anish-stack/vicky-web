import React, { useCallback, useEffect, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/router";
// import PhoneInputTwo from 'react-phone-input-2';
// import 'react-phone-input-2/lib/style.css';
// import * as Yup from 'yup';
import {
  createSession,
  getSessionById,
  updateBySessionId,
} from "@/pages/api/sessions";
import { Col, Row, Toast, ToastContainer } from "react-bootstrap";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import {
  getAirports,
  getCities,
  getLocalRentalCities,
} from "@/pages/api/local";
import { CustomSelect } from "../reactSelect/CustomSelect";
import { getPlans } from "@/pages/api/plans";
import moment from "moment";
import {
  getDhamCategories,
  getDhamPackageById,
  getDhamPackages,
} from "@/pages/api/dhampackage";
import "placeholder-loading/dist/css/placeholder-loading.min.css";

import NProgress from "nprogress";
import "nprogress/nprogress.css";

interface GoogleBookingFormOnBannerTwoProps {
  // Title: string
  // subTitle: string
  buttonName: string;
  heading: string;
}

const GoogleBookingFormOnBannerTwo: React.FC<
  GoogleBookingFormOnBannerTwoProps
> = ({
  // Title,
  // subTitle,
  buttonName,
  heading,
}) => {
  const getPincodePlaceId = async (placeId: string): Promise<string | null> => {
    try {
      const response = await fetch(
        `${process.env.API_URL}/api/map/getpincode?place_id=${placeId}`
      );

      if (!response.ok) {
        console.error(`Error: ${response.status} - ${response.statusText}`);
        return null;
      }
      console.log("response", response);
      const data = await response.json();

      return data?.status && data?.data?.pincode ? data.data.pincode : null;
    } catch (error) {
      console.log("error", error);
      return null;
    }
  };

  const [carTab, setCarTab] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (router.pathname == "/chardham") {
      setTimeout(() => {
        setCarTab("chardham");
      }, 1000);
    } else if (router.pathname == "/") {
      setTimeout(() => {
        setCarTab("taxi");
      }, 1000);
    } else if (router.pathname == "/hotel") {
      setTimeout(() => {
        setCarTab("hotel");
      }, 1000);
    }
  }, [router.pathname]);

  function formatToLocalISO(date: any) {
    return moment(date).format("YYYY-MM-DDTHH:mm:ss");
  }

  // const [isFocused, setIsFocused] = useState(false);
  let sessionId = null;
  if (typeof window !== "undefined") {
    sessionId = sessionStorage.getItem("sessionId");
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

  const nowplusthree = new Date();
  nowplusthree.setMinutes(nowplusthree.getMinutes() + 3 * 60);

  const minutes = nowplusthree.getMinutes();
  const roundedMinutes = minutes > 30 ? 60 : 30;
  nowplusthree.setMinutes(roundedMinutes, 0, 0);

  const maxReturnDate = new Date(departureDate);
  maxReturnDate.setDate(maxReturnDate.getDate() + 30);

  const calculateDaysDifference = (departureDate: any, returnDate: any) => {
    if (!departureDate || !returnDate) {
      return 1;
    }
    console.log("departureDate", departureDate);
    console.log("returnDate", returnDate);
    // const timeDifference = returnDate?.getTime() - departureDate?.getTime();
    const departureDateObj = new Date(departureDate);
    const returnDateObj = new Date(returnDate);

    const timeDifference = returnDateObj.getTime() - departureDateObj.getTime();

    // If return date is same or earlier, return 1
    if (timeDifference <= 0) return 1;

    const days = timeDifference / (1000 * 60 * 60 * 24);

    // Round up any partial day to next full day
    return Math.ceil(days);
    // const daysDifference = timeDifference / (1000 * 3600 * 24)
    // console.log("daysDifference",daysDifference)

    // const decimalPart = daysDifference % 1;
    // console.log("decimalPart",decimalPart)

    // if (decimalPart >= 0.9) {
    //     return Math.ceil(daysDifference + 1);
    // } else if (decimalPart >= 0.1) {
    //     return Math.floor(daysDifference + 1);
    // } else {
    //     return Math.floor(daysDifference + 1);
    // }
  };

  const generateDateRange = (startDay: any, endDay: any) => {
    const dates = [];
    const today = departureDate;
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
  // console.log("calculateDaysDifference(departureDate, returnDate)",calculateDaysDifference(departureDate, returnDate))

  // const [origins, setOrigins] = useState('');
  // const [destinations, setDestinations] = useState('');

  const [distance, setDistance] = useState() as any;
  const [time, setTime] = useState() as any;

  const [startSearchValue, setStartSearchValue] = useState("");
  const [endSearchValue, setEndSearchValue] = useState("");
  const [startMapData, setStartMapData] = useState([]) as any;
  const [endMapData, setEndMapData] = useState([]) as any;

  const [stopMapSearchValue, setStopMapSearchValue] = useState("");

  const [allPlaces, setAllPlaces] = useState([]) as any;

  const [tripType, setTripType] = useState("oneWay");

  const [category, setCategory] = useState("outstation");

  const [destinationsField, setDestinationsField] = useState(true);

  const [phone, setPhone] = useState("");
  // const [disableCountryCode, setDisableCountryCode] = useState(true);

  // const [hotelSearchValue, setHotelSearchValue] = useState('');

  // const [hotelCities, setHotelCities] = useState([]) as any;

  const [checkInDate, setCheckInDate] = useState("") as any;
  const [checkOutDate, setCheckOutDate] = useState("") as any;

  const AdultOptions = [
    { label: "1", value: 1 },
    { label: "2", value: 2 },
    { label: "3", value: 3 },
    { label: "4", value: 4 },
    { label: "5", value: 5 },
  ];

  const ChildOptions = [
    { label: "0", value: 0 },
    { label: "1", value: 1 },
    { label: "2", value: 2 },
    { label: "3", value: 3 },
    { label: "4", value: 4 },
    { label: "5", value: 5 },
    { label: "6", value: 6 },
    { label: "7", value: 7 },
    { label: "8", value: 8 },
    { label: "9", value: 9 },
  ];

  const RoomOptions = [
    { label: "1", value: 1 },
    { label: "2", value: 2 },
    { label: "3", value: 3 },
    { label: "4", value: 4 },
    { label: "5", value: 5 },
  ];

  const AgeOptions = Array.from({ length: 18 }, (_, i) => ({
    label: `${i + 1} Years`,
    value: i + 1,
  }));

  const [adult, setAdult] = useState(1) as any;
  const [children, setChildren] = useState(0) as any;
  const [rooms, setRooms] = useState(1) as any;
  const [childrenAges, setChildrenAges] = useState<
    { value: number; label: string }[]
  >([]);

  const [errors, setErrors] = useState({
    start: false,
    end: false,
    phone: false,
    city: false,
    package: false,
    airport_city: false,
    airport: false,
    hotel_city: false,
    check_in: false,
    check_out: false,
  });

  // const handleFocus = () => {
  //     setDisableCountryCode(false);
  // };

  const [sessionData, setSessionData] = useState(null) as any;

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        if (sessionId) {
          const response = (await getSessionById(sessionId as any)) as any;
          // console.log("response", response)
          if (response.data) {
            setAllPlaces(response.data?.places);
            if (response?.data?.car_tab == "taxi") {
              setTripType(response.data?.tripType);
              setCategory(response.data?.category);
              setAdult(1);
              setChildren(0);
              setRooms(1);
            } else if (response?.data?.car_tab == "hotel") {
              setTripType("oneWay");
              setCategory("outstation");
              setAdult(response.data?.adult);
              setChildren(response.data?.children);
              setRooms(response.data?.rooms);
            } else if (response?.data?.car_tab == "chardham") {
              // console.log("response.data?.dham_category_id", response.data?.dham_category_id)
              // console.log("response.data?.dham_package_id", response.data?.dham_package_id)
              setDhamCategoryId(response.data?.dham_category_id);
              setDhamPackageCityId(response.data?.dham_pickup_city_id);
              setDhamPackageId(response.data?.dham_package_id);
              setDhamPackageCityDays(response.data?.dham_package_days);
            }
            setPhone(response.data?.phoneNo);
            setCityId(response.data?.city_id);
            setHotelCityId(response.data?.hotel_city_id);
            setLocalPackageId(response.data?.local_rental_plan_id);
            setDistance(response.data?.distance);
            setTime(response.data?.time);
            setAirportId(response.data?.airport_id);
            setAirportCityId(response.data?.airport_city_id);
            setFromTo(response.data?.airport_from_to);
            setSessionData(response.data);
            setCarTab(response.data?.car_tab);
            setCheckInDate(
              response.data?.check_in ? new Date(response.data.check_in) : null
            );
            setCheckOutDate(
              response.data?.check_out
                ? new Date(response.data.check_out)
                : null
            );
            if (
              response.data?.children_ages &&
              Array.isArray(response.data.children_ages) &&
              response.data.children_ages.length > 0
            ) {
              setChildrenAges(response.data.children_ages);
            } else {
              setChildrenAges((prev) => {
                const updatedAges = Array.from(
                  { length: children },
                  (_, i) => prev[i] || AgeOptions[0]
                );
                return updatedAges;
              });
            }
          } else {
            router.push("/");
            sessionStorage.removeItem("sessionId");
            setSessionData(null);
          }
        }
      } catch (error) {
        console.error("Error fetching session data:", error);
        router.push("/");
        sessionStorage.removeItem("sessionId");
        setSessionData(null);
      }
    };

    fetchSessionData();
  }, [sessionId]);

  useEffect(() => {
    setChildrenAges((prev) => {
      const updatedAges = Array.from(
        { length: children },
        (_, i) => prev[i] || AgeOptions[0]
      );
      return updatedAges;
    });
  }, [children]);

  const handleAgeChange = (
    index: number,
    selectedOption: { value: number; label: string } | null
  ) => {
    setChildrenAges((prev) => {
      const updatedAges = [...prev];
      updatedAges[index] = selectedOption
        ? { value: selectedOption.value, label: selectedOption.label }
        : AgeOptions[0];
      return updatedAges;
    });
  };

  let timer: NodeJS.Timeout;

  const handleSearchChange = useCallback((inputValue: string, type: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (type === "start") {
        setStartSearchValue(inputValue);
        setErrors((prev) => ({ ...prev, start: false }));
      } else if (type === "end") {
        setEndSearchValue(inputValue);
        setErrors((prev) => ({ ...prev, end: false }));
      } else if (type == "stop") {
        setStopMapSearchValue(inputValue);
      } else if (!isNaN(Number(type))) {
        // Type is numeric – dynamic stop index
        setStopMapSearchValue(inputValue); // You can adjust if you support multiple stops
      }
    }, 500);
  }, []);

  // const handleHotelCitySearchChange = useCallback((inputValue: string) => {
  //     clearTimeout(timer);
  //     timer = setTimeout(() => {
  //         setHotelSearchValue(inputValue);
  //         setErrors((prev) => ({ ...prev, hotel_city: false }));
  //     }, 500);
  // }, []);

  // const Origins = (places: any[]): string => {
  //     if (!places || places.length === 0) return '';

  //     const start = places[0];

  //     const origins = `place_id:${start?.value}`;

  //     return origins;
  // };

  // const Destinations = (places: any[]): string => {
  //     if (!places || places.length === 0) return '';

  //     const destinations = places.slice(1).filter(place => place?.value);

  //     const destinationsQuery = destinations
  //         .map(place => `place_id:${place.value}`)
  //         .join('|');

  //     return destinationsQuery;
  // };

  // useEffect(() => {
  //     setOrigins(Origins(allPlaces));
  //     setDestinations(Destinations(allPlaces));
  // }, [allPlaces]);

  const calculateDistance = async () => {
    try {
      let accumulatedDistance = 0;

      for (let i = 0; i < allPlaces.length - 1; i++) {
        const origins = `place_id:${allPlaces[i].value}`;
        const destinations = `place_id:${allPlaces[i + 1].value}`;

        const response = await fetch(
          `${process.env.API_URL}/api/map/distancematrix?origins=${origins}&destinations=${destinations}`
        );
        const data = await response.json();

        const pairDistance = data.rows[0].elements.reduce(
          (sum: number, element: any) => {
            return sum + (element?.distance?.value || 0);
          },
          0
        );

        accumulatedDistance += pairDistance;
      }

      const totalDistanceInKilometers = parseFloat(
        (accumulatedDistance / 1000).toFixed(2)
      );
      return totalDistanceInKilometers;
    } catch (error) {
      console.error("Error calculating distances:", error);
      return 0;
    }
  };

  const fetchStopData = async (query: any) => {
    try {
      if (query) {
        const response = await fetch(
          `${process.env.API_URL}/api/map/autocomplete?query=${query}`
        );
        const data = await response.json();
        if (data.predictions) {
          const apiData = data.predictions?.map((item: any) => ({
            label: item.description,
            value: item.place_id,
          }));
        } else {
        }
      }
    } catch (error) {
      console.error("Error fetching stop data:", error);
    }
  };

  useEffect(() => {
    fetchStopData(stopMapSearchValue);
  }, [stopMapSearchValue]);

  const fetchPlaces = async (query: any, setMapData: any) => {
    if (!query) {
      setMapData([]);
      return;
    }
    try {
      const response = await fetch(
        `${process.env.API_URL}/api/map/autocomplete?query=${query}`
      );
      const data = await response.json();

      if (data.predictions) {
        const apiData = data.predictions?.map((item: any) => ({
          label: item.description,
          value: item.place_id,
        }));
        setMapData(apiData);
      } else {
        setMapData([]);
      }
    } catch (error) {
      console.error("Error fetching places:", error);
      setMapData([]);
    }
  };

  useEffect(() => {
    fetchPlaces(startSearchValue, setStartMapData);
  }, [startSearchValue]);

  useEffect(() => {
    fetchPlaces(endSearchValue, setEndMapData);
  }, [endSearchValue]);

  const selectStyles = {
    input: (provided: any) => ({
      ...provided,
      color: "#010005",
      fontWeight: "400",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? "transparent"
        : provided.backgroundColor,
      color: state.isFocused ? provided.color : provided.color,
      cursor: "pointer",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      fontSize: "17px",
      color: "#01000599",
      textAlign: "start",
      fontWeight: "400",
    }),
    menu: (provided: any) => ({
      ...provided,
      textAlign: "start",
      fontSize: "16px",
      color: "#010005",
      fontWeight: "400",
    }),

    menuList: (provided: any) => ({
      ...provided,
      maxHeight: "140px",
      overflowY: "auto",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      textAlign: "start",
      color: "#010005",
      fontWeight: "400",
    }),

    dropdownIndicator: (provided: any) => ({
      ...provided,
      display: "none",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: "#0100050D",
      height: "44px",
      borderRadius: "12px",
      border: "0px",
      boxShadow: "0 !important",
      // '&:hover': {
      //     border: '1px solid #000'
      // },
      "@media (max-width: 992px)": {
        height: "44px",
      },
    }),
    clearIndicator: (provided: any, state: any) => ({
      ...provided,
      paddingRight: "40px",
      cursor: "pointer",
    }),
  };

  const ReactSelectStyleTwo = {
    input: (provided: any) => ({
      ...provided,
      color: "#010005",
      fontWeight: "400",
    }),
    option: (provided: any, state: any) => ({
      ...provided,

      cursor: "pointer",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      fontSize: "17px",
      color: "#01000599",
      textAlign: "start",
      fontWeight: "400",
    }),
    menu: (provided: any) => ({
      ...provided,
      textAlign: "start",
      fontSize: "16px",
      color: "#010005",
      // color: '#01000599',
      fontWeight: "400",
    }),

    menuList: (provided: any) => ({
      ...provided,
      maxHeight: "140px",
      overflowY: "auto",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      textAlign: "start",
      color: "#010005",
      fontWeight: "400",
    }),

    dropdownIndicator: (provided: any) => ({
      ...provided,
      display: "none",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: "#0100050D",
      height: "44px",
      borderRadius: "12px",
      border: "0px",
      boxShadow: "0 !important",
      // '&:hover': {
      //     border: '1px solid #010005',
      // },
      "@media (max-width: 992px)": {
        height: "44px",
      },
    }),
    clearIndicator: (provided: any, state: any) => ({
      ...provided,
      paddingRight: "40px",
      cursor: "pointer",
    }),
  };

  const ReactSelectStyleHotels = {
    input: (provided: any) => ({
      ...provided,
      color: "#010005",
      fontWeight: "400",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      cursor: "pointer",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      fontSize: "17px",
      color: "#01000599",
      textAlign: "start",
      fontWeight: "400",
    }),
    menu: (provided: any) => ({
      ...provided,
      textAlign: "start",
      fontSize: "16px",
      color: "#010005",
      fontWeight: "400",
    }),

    menuList: (provided: any) => ({
      ...provided,
      maxHeight: "140px",
      overflowY: "auto",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      textAlign: "start",
      color: "#010005",
      fontWeight: "400",
    }),

    dropdownIndicator: (provided: any) => ({
      ...provided,
      display: "none",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: "#f6f6f6",
      height: "44px",
      borderRadius: "12px",
      border: "0px",
      boxShadow: "0 !important",
      "@media (max-width: 992px)": {
        height: "44px",
      },
    }),
    clearIndicator: (provided: any, state: any) => ({
      ...provided,
      paddingRight: "40px",
      cursor: "pointer",
    }),
  };

  const handleDivClick = (type: any) => {
    setTripType(type);
    // console.log("type", type);
    setErrors((prev) => ({
      start: false,
      end: false,
      phone: false,
      city: false,
      package: false,
      airport_city: false,
      airport: false,
      hotel_city: false,
      check_in: false,
      check_out: false,
    }));
  };

  const handleSelectChange = (type: string | number, selectedOption: any) => {
    console.log("type", type, "selectedOption", selectedOption);
    if (!selectedOption) return;
    if (type == "start") {
      if (selectedOption) {
        setAllPlaces((prevPlaces: any) => [...prevPlaces, selectedOption]);
      }
    } else if (type == "end") {
      if (selectedOption) {
        setAllPlaces((prevPlaces: any) => [...prevPlaces, selectedOption]);
      }
      setDestinationsField(false);
    } else if (!isNaN(Number(type))) {
      // type is a number or string that can be converted to a number
      const numericType = Number(type);
      setAllPlaces((prevPlaces: any) => [
        ...prevPlaces,
        { ...selectedOption, type: numericType },
      ]);
    }
  };

  //----------- start edit

  // const [editingIndex, setEditingIndex] = useState<number | null>(null);
  // const [editingLabel, setEditingLabel] = useState<string>('');

  // const startEditing = (index: number, currentLabel: string) => {
  //     setEditingIndex(index);
  //     setEditingLabel(currentLabel);
  // };

  // const saveLabel = (index: number) => {
  //     if (editingLabel.trim() === '') return;

  //     const updatedPlaces = [...allPlaces];
  //     updatedPlaces[index].label = editingLabel;
  //     setAllPlaces(updatedPlaces);
  //     setEditingIndex(null);
  //     setEditingLabel('');
  // };
  //--------- end edit

  const handleDelete = (indexToDelete: number) => {
    setAllPlaces(
      allPlaces.filter((_: any, index: any) => index !== indexToDelete)
    );
  };

  // const changePage = () => {
  //     if (allPlaces?.length >= 2) {
  //         router.push('/vehicles');
  //     }
  // }

  const [toastShow, setToastShow] = useState(false);
  const [message, setMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const checkPrices = async (event: any) => {
    event.preventDefault();
    let validationErrors = {} as any;
    if (carTab == "taxi") {
      if (category == "outstation") {
        if (allPlaces?.length < 2) validationErrors.start = true;
        if (allPlaces?.length < 2) validationErrors.end = true;
      } else if (category == "localairport") {
        if (tripType == "local") {
          if (!cityId) validationErrors.city = true;
          if (!localPackageId) validationErrors.package = true;
          if (allPlaces?.length < 2) validationErrors.start = true;
        } else if (tripType == "airport") {
          if (!airportId) validationErrors.airport = true;
          if (!airportCityId) validationErrors.airport_city = true;
          if (allPlaces?.length < 3) validationErrors.start = true;
        }
      }
    } else if (carTab == "hotel") {
      if (!hotelCityId) validationErrors.hotel_city = true;
      if (!checkInDate) validationErrors.check_in = true;
      if (!checkOutDate) validationErrors.check_out = true;
    }

    if (!phone || phone.length <= 5 || phone.length >= 15) {
      validationErrors.phone = true;
    }

    setErrors(validationErrors);

    let Data: any;
    let PlaceId: string | undefined;

    if (carTab == "taxi") {
      if (tripType == "oneWay") {
        Data = {
          distance: (await calculateDistance()) as any,
          car_tab: carTab,
          phoneNo: phone,
          pickUpDate: formatToLocalISO(departureDate),
          dropDate: "",
          places: allPlaces,
          tripType: tripType,
          local_rental_plan_id: null,
          city_id: null,
          hotel_city_id: null,
          category: category,
          time: null,
          airport_id: null,
          airport_city_id: null,
          airport_from_to: null,
          check_in: null,
          check_out: null,
          adult: null,
          children: null,
          rooms: null,
          children_ages: null,
          dham_package_id: null,
          dham_pickup_city_id: null,
          dham_package_days: null,
          dham_category_id: null,
          discount_slug: "oneWay",
        };
        if (allPlaces.length > 0) {
          PlaceId = allPlaces[0].value;
          // console.log("Data oneWay", Data)
        }
      } else if (tripType == "roundTrip") {
        Data = {
          distance: (await calculateDistance()) as any,
          car_tab: carTab,
          phoneNo: phone,
          pickUpDate: formatToLocalISO(departureDate),
          dropDate: formatToLocalISO(returnDate),
          places: allPlaces,
          tripType: tripType,
          local_rental_plan_id: null,
          city_id: null,
          hotel_city_id: null,
          category: category,
          time: null,
          airport_id: null,
          airport_city_id: null,
          airport_from_to: null,
          check_in: null,
          check_out: null,
          adult: null,
          children: null,
          rooms: null,
          children_ages: null,
          dham_package_id: null,
          dham_pickup_city_id: null,
          dham_package_days: null,
          dham_category_id: null,
          discount_slug: "roundTrip",
        };
        if (allPlaces.length > 0) {
          PlaceId = allPlaces[0].value;
          //  console.log("Data roundTrip", Data)
        }
        // PlaceId = allPlaces[0].value;
      } else if (tripType == "local") {
        Data = {
          distance: distance,
          car_tab: carTab,
          phoneNo: phone,
          pickUpDate: formatToLocalISO(departureDate),
          dropDate: "",
          places: allPlaces,
          tripType: tripType,
          local_rental_plan_id: localPackageId ? localPackageId : null,
          city_id: cityId ? cityId : null,
          hotel_city_id: null,
          category: category,
          time: time ? time : null,
          airport_id: null,
          airport_city_id: null,
          airport_from_to: null,
          check_in: null,
          check_out: null,
          adult: null,
          children: null,
          rooms: null,
          children_ages: null,
          dham_package_id: null,
          dham_pickup_city_id: null,
          dham_package_days: null,
          dham_category_id: null,
          discount_slug: "local_airport",
        };
        let citiplaceId = null;
        if (allPlaces.length > 1 && allPlaces[1].value) {
          citiplaceId = allPlaces[1].value;
        }
        PlaceId = citiplaceId;
        console.log("Data local", Data);
      } else if (tripType == "airport") {
        Data = {
          distance: distance,
          car_tab: carTab,
          phoneNo: phone,
          pickUpDate: formatToLocalISO(departureDate),
          dropDate: "",
          places: allPlaces,
          tripType: tripType,
          local_rental_plan_id: null,
          city_id: null,
          hotel_city_id: null,
          category: category,
          time: null,
          airport_id: airportId,
          airport_city_id: airportCityId,
          airport_from_to: fromTo,
          check_in: null,
          check_out: null,
          adult: null,
          children: null,
          rooms: null,
          children_ages: null,
          dham_package_id: null,
          dham_pickup_city_id: null,
          dham_package_days: null,
          dham_category_id: null,
          discount_slug: "local_airport",
        };
        PlaceId = allPlaces[2].value;
      }
      console.log("Data", Data);
      if (!PlaceId) {
        console.error(
          "PlaceId not found for the given trip type and allPlaces array"
        );
        return; // or handle gracefully (e.g., show error to user)
      }

      console.log("PlaceId:", PlaceId);
      const pincode = await getPincodePlaceId(PlaceId);
      // console.log("getPincodePlaceId", pincode, Data.places[0].value)
      if (pincode) {
        // setToastShow(true);
        Data = { ...Data, pincode };
        console.log("Service Available in this area", pincode);
      } else {
        setToastShow(true);
        setMessage("Service Not Available in this area");
        console.log("Service Not Available in this area", pincode);

        return false;
      }

      // const API_KEY = "YOUR_GOOGLE_API_KEY"; // Replace with your API key
      // const firstPlaceId = places[0].value;

      // getPincodeFromPlaceID(firstPlaceId, API_KEY).then(pincode => {
      //     console.log("Pincode for first place:", pincode);
      // });
    } else if (carTab == "chardham") {
      Data = {
        distance: null,
        car_tab: carTab,
        phoneNo: phone,
        pickUpDate: formatToLocalISO(departureDate),
        dropDate: formatToLocalISO(returnDate),
        places: [],
        tripType: null,
        local_rental_plan_id: null,
        city_id: null,
        hotel_city_id: null,
        category: null,
        time: null,
        airport_id: null,
        airport_city_id: null,
        airport_from_to: null,
        check_in: null,
        check_out: null,
        adult: null,
        children: null,
        rooms: null,
        children_ages: null,
        dham_package_id: DhamPackageId,
        dham_pickup_city_id: DhamPackageCityId,
        dham_package_days: DhamPackageCityDays,
        dham_category_id: DhamCategoryId,
        discount_slug: null,
      };
    } else if (carTab == "hotel") {
      Data = {
        distance: null,
        car_tab: carTab,
        phoneNo: phone,
        pickUpDate: "",
        dropDate: "",
        places: [],
        tripType: null,
        local_rental_plan_id: null,
        city_id: null,
        hotel_city_id: hotelCityId ? hotelCityId : null,
        category: null,
        time: null,
        airport_id: null,
        airport_city_id: null,
        airport_from_to: null,
        check_in: formatToLocalISO(checkInDate),
        check_out: formatToLocalISO(checkOutDate),
        adult: adult,
        children: children,
        rooms: rooms,
        children_ages: childrenAges,
        dham_package_id: null,
        dham_pickup_city_id: null,
        dham_package_days: null,
        dham_category_id: null,
        discount_slug: null,
      };
    }

    if (carTab == "taxi" || carTab == "hotel" || carTab == "chardham") {
      if (Object.keys(validationErrors).length === 0) {
        setIsLoading(true);
        NProgress.start();
        if (sessionId) {
          await updateBySessionId(sessionId as any, Data)
            .then(async (response: any) => {
              if (response.status == true) {
                await router.push(`/vehicles`);
                setIsLoading(false);
                NProgress.done();
              } else if (response.status == false) {
                setToastShow(true);
                setMessage(response.message);
                setIsLoading(false);
                NProgress.done();
                sessionStorage.removeItem("sessionId");
              }
            })
            .catch((error) => {
              console.error("API Error:", error);
              sessionStorage.removeItem("sessionId");
              setIsLoading(false);
              NProgress.done();
            });
        } else {
          await createSession(Data)
            .then(async (response: any) => {
              if (response.status == true) {
                sessionStorage.setItem("sessionId", response.data.session_id);
                await router.push(`/vehicles`);
                setIsLoading(false);
                NProgress.done();
              } else if (response.status == false) {
                setToastShow(true);
                setMessage(response.message);
                sessionStorage.removeItem("sessionId");
                setIsLoading(false);
                NProgress.done();
              }
            })
            .catch((error) => {
              console.error("API Error:", error);
              sessionStorage.removeItem("sessionId");
              setIsLoading(false);
              NProgress.done();
            });
        }
      }
    }
  };

  useEffect(() => {
    if (tripType == sessionData?.tripType) {
      setAllPlaces(allPlaces);
    } else {
      setAllPlaces([]);
      setFromTo("from");
      setDestinationsField(true);
      setCityId(null);
      setLocalPackageId(null);
      setAirportCityId(null);
      setAirportId(null);
    }
  }, [sessionData, tripType]);

  const [localPackages, setLocalPackages] = useState() as any;
  const [localPackageId, setLocalPackageId] = useState("") as any;

  useEffect(() => {
    (async () => {
      await getPlans("").then((result: any) => {
        if (result) {
          setLocalPackages(result?.data);
        }
      });
    })();
  }, []);
  const [cities, setCities] = useState() as any;
  const [cityId, setCityId] = useState("") as any;

  useEffect(() => {
    if (localPackageId) {
      (async () => {
        await getLocalRentalCities(
          `local_rental_plan_id=${localPackageId}`
        ).then((result: any) => {
          if (result) {
            setCities(result?.data);
          }
        });
      })();
    }
  }, [localPackageId]);

  const handleCityChange = (value: any) => {
    console.log("value", value);
    console.log("cityID", value?.value);
    setCityId(value?.value);
    const places = [{ label: value?.label, value: `${value?.value}` }];
    setAllPlaces(places);
    setErrors((prev) => ({ ...prev, city: false }));
  };

  const handleLocalDistanceChange = (value: any) => {
    setLocalPackageId(value?.value);
    setCityId(null);
    setDistance(value?.distance);
    setTime(value?.hours);
    setErrors((prev) => ({ ...prev, package: false }));
  };

  const DataFromTo = [
    { label: "From Airport", value: "from" },
    { label: "To Airport", value: "to" },
  ];
  const [fromTo, setFromTo] = useState("from");

  const handleFromToChange = async (value: any) => {
    setAirportCityId("");
    if (fromTo == "from") {
      await setAllPlaces((prevPlaces: any) => {
        if (prevPlaces.length > 1) {
          return [prevPlaces[0], ...prevPlaces.slice(2)];
        }
        return prevPlaces;
      });
    } else if (fromTo == "to") {
      await setAllPlaces((prevPlaces: any) => prevPlaces.slice(1));
    }
    setFromTo(value?.value);
  };

  const [airports, setAirports] = useState() as any;
  const [airportId, setAirportId] = useState("") as any;

  useEffect(() => {
    (async () => {
      await getAirports("").then((result: any) => {
        if (result) {
          setAirports(result?.data);
        }
      });
    })();
  }, []);

  const handleAirportChange = (value: any) => {
    setAirportId(value?.value);
    const places = [{ label: value?.label, value: `${value?.value}` }];
    setAirportCityId("");
    setAllPlaces(places);
    setErrors((prev) => ({ ...prev, airport: false }));
  };

  const [airportCities, setAirportCities] = useState() as any;
  const [airportCityId, setAirportCityId] = useState("") as any;

  useEffect(() => {
    (async () => {
      if (airportId) {
        await getCities(`airport_id=${airportId}`).then((result: any) => {
          if (result) {
            setAirportCities(result?.data);
          }
        });
      }
    })();
  }, [airportId]);

  const handleAirportCityChange = (value: any) => {
    setAirportCityId(value?.value);
    setDistance(value?.distance);
    setErrors((prev) => ({ ...prev, airport_city: false }));
    const place = { label: value?.label, value: `${value?.value}` };

    if (fromTo == "from") {
      setAllPlaces((prevPlaces: any) => {
        if (prevPlaces.length >= 2) {
          return [prevPlaces[0], place];
        }
        return [...prevPlaces, place];
      });
    } else if (fromTo == "to") {
      setAllPlaces((prevPlaces: any) => {
        if (prevPlaces.length >= 2) {
          return [place, prevPlaces[0]];
        }
        return [place, ...prevPlaces];
      });
    }
  };

  const [hotelCities, setHotelCities] = useState() as any;
  const [hotelCityId, setHotelCityId] = useState("") as any;

  useEffect(() => {
    (async () => {
      await getCities(`hotel=1`).then((result: any) => {
        if (result) {
          setHotelCities(result?.data);
        }
      });
    })();
  }, []);

  const handleHotelCityChange = (value: any) => {
    setHotelCityId(value?.value);
    setErrors((prev) => ({ ...prev, hotel_city: false }));
  };

  const [DhamCategories, setDhamCategories] = useState() as any;
  const [DhamCategoryId, setDhamCategoryId] = useState() as any;

  useEffect(() => {
    (async () => {
      await getDhamCategories(``).then((result: any) => {
        if (result) {
          setDhamCategories(result?.data);
        }
      });
    })();
  }, []);

  const [DhamPackages, setDhamPackages] = useState() as any;
  const [DhamPackageId, setDhamPackageId] = useState() as any;

  const SelectDhamPackage = (id: string) => {
    setDhamPackageId(id);
  };

  const [DhamPackageCities, setDhamPackageCities] = useState() as any;
  const [DhamPackageCityId, setDhamPackageCityId] = useState() as any;
  const [DhamPackageCityDays, setDhamPackageCityDays] = useState() as any;

  const handleDhamPackageCityChange = (id: any, days: any) => {
    setDhamPackageCityId(id);
    setDhamPackageCityDays(days);
  };

  useEffect(() => {
    (async () => {
      if (DhamPackageId) {
        await getDhamPackageById(DhamPackageId, "").then((result: any) => {
          if (result?.data) {
            setDhamPackageCities(result?.data?.dham_pickup_cities);
          }
        });
      }
    })();
  }, [DhamPackageId]);

  useEffect(() => {
    if (
      sessionId &&
      carTab == "chardham" &&
      DhamCategories &&
      DhamCategoryId &&
      router.pathname == "/chardham" &&
      DhamCategoryId != "undefined"
    ) {
      setDhamCategoryId(DhamCategoryId);
    } else if (carTab == "chardham" && DhamCategories) {
      setDhamCategoryId(DhamCategories[0]?.id);
    }
  }, [carTab, sessionId, router.pathname]);

  // useEffect(() => {

  //     if (sessionData && carTab == 'chardham'  && router.pathname == '/chardham' &&  DhamCategoryId == sessionData?.dham_category_id && sessionData?.dham_package_id) {
  //         (async () => {
  //             await getDhamPackages(`dham_category_id=${DhamCategoryId}`).then((result: any) => {
  //                 if (result) {
  //                     setDhamPackages(result?.data);
  //                     setDhamPackageId(sessionData?.dham_package_id);
  //                 }
  //             });
  //         })();
  //     }
  //     else if (carTab == 'chardham' && router.pathname == '/chardham') {
  //         (async () => {
  //             await getDhamPackages(`dham_category_id=${DhamCategoryId}`).then((result: any) => {
  //                 if (result) {
  //                     setDhamPackages(result?.data);
  //                     if (result?.data[0]?.id) {
  //                         setDhamPackageId(result?.data[0]?.id);
  //                     }
  //                 }
  //             });
  //         })();
  //     }

  // }, [carTab, sessionData, DhamCategoryId, router]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (
        sessionData &&
        carTab === "chardham" &&
        router.pathname === "/chardham" &&
        DhamCategoryId === sessionData?.dham_category_id &&
        sessionData?.dham_package_id
      ) {
        (async () => {
          await getDhamPackages(`dham_category_id=${DhamCategoryId}`).then(
            (result: any) => {
              if (result) {
                setDhamPackages(result?.data);
                setDhamPackageId(sessionData?.dham_package_id);
              }
            }
          );
        })();
      } else if (carTab === "chardham" && router.pathname === "/chardham") {
        (async () => {
          await getDhamPackages(`dham_category_id=${DhamCategoryId}`).then(
            (result: any) => {
              if (result) {
                setDhamPackages(result?.data);
                if (result?.data[0]?.id) {
                  setDhamPackageId(result?.data[0]?.id);
                }
              }
            }
          );
        })();
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [sessionData, carTab, router.pathname, DhamCategoryId]);

  useEffect(() => {
    if (sessionId && DhamPackageCities && DhamPackageId) {
      if (
        sessionData?.dham_package_id == DhamPackageId &&
        sessionData?.dham_pickup_city_id &&
        sessionData?.dham_package_days
      ) {
        setDhamPackageCityId(sessionData?.dham_pickup_city_id);
        setDhamPackageCityDays(sessionData?.dham_package_days);
      } else {
        setDhamPackageCityId(DhamPackageCities[0]?.id);
        setDhamPackageCityDays(DhamPackageCities[0]?.days);
      }
    } else if (DhamPackageCities && DhamPackageId) {
      setDhamPackageCityId(DhamPackageCities[0]?.id);
      setDhamPackageCityDays(DhamPackageCities[0]?.days);
    }
  }, [DhamPackageId, DhamPackageCities, sessionId]);

  useEffect(() => {
    if (departureDate && DhamPackageCityDays && carTab == "chardham") {
      // setReturnDate(
      //   moment(departureDate)
      //     .add(DhamPackageCityDays - 1, "days")
      //     .format("YYYY-MM-DD HH:mm:ss")
      // );
      setReturnDate(
        moment(departureDate)
          .add(DhamPackageCityDays - 1, "days") // add N−1 days
          .set({ hour: 21, minute: 0, second: 0, millisecond: 0 }) // ✅ force 9:00 PM
          .format("YYYY-MM-DD HH:mm:ss")
      );
    }
  }, [DhamPackageCityDays, departureDate, carTab]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    NProgress.start();
    if (
      carTab == "chardham" &&
      router.pathname == "/chardham" &&
      DhamPackages &&
      DhamPackageId
    ) {
      setLoading(false);
      NProgress.done();
    } else if (
      carTab == "taxi" &&
      router.pathname == "/" &&
      tripType &&
      category
    ) {
      setLoading(false);
      NProgress.done();
    } else if (carTab == "hotel" && router.pathname == "/hotel") {
      setLoading(false);
      NProgress.done();
    }
  }, [DhamPackages, DhamPackageId, carTab, tripType, category, router]);

  //   const [menuPlacement, setMenuPlacement] = useState("auto");

  //   useEffect(() => {
  //     const handleResize = () => {
  //       if (window.innerWidth < 768) {
  //         setMenuPlacement("auto");
  //       } else {
  //         setMenuPlacement("auto");
  //       }
  //     };

  //     handleResize();
  //     window.addEventListener("resize", handleResize);
  //     return () => window.removeEventListener("resize", handleResize);
  //   }, []);

  const { taxisafar_category, taxisafar_triptype } = router.query;

  useEffect(() => {
    const handleRouteChange = () => {
      setTimeout(() => {
        if (taxisafar_triptype && taxisafar_category) {
          setCategory(taxisafar_category as any);
          setTripType(taxisafar_triptype as any);
        }
      }, 100);
    };

    router.events.on("hashChangeComplete", handleRouteChange);
    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("hashChangeComplete", handleRouteChange);
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [taxisafar_category, taxisafar_triptype]);

  // console.log("allPlaces", allPlaces)

  return (
    <>
      <ToastContainer className="toast-container-custom">
        <Toast
          onClose={() => setToastShow(false)}
          show={toastShow}
          delay={3000}
          autohide
          className="bg-danger text-white"
        >
          <Toast.Header>
            <strong className="me-auto">Message</strong>
            <small>Just now</small>
          </Toast.Header>
          <Toast.Body className="text-start">{message}</Toast.Body>
        </Toast>
      </ToastContainer>

      <div className="banner-one-form taxisafar-booking-form mb-3">
        <div className="booking-form-tab">
          <table className="w-100 mb-1 trip-options">
            <tbody>
              <tr>
                <td
                  style={{ width: "26%" }}
                  onClick={() => {
                    router.push("/");
                  }}
                  className={`${
                    carTab == "taxi" && router.pathname == "/"
                      ? "car-tab-active"
                      : ""
                  }`}
                >
                  <div className="radio-button car-tab custom-cursor-pointer text-center">
                    <div className="colored-taxi-svg mt-1"></div>
                    <p className="">Taxi</p>
                  </div>
                </td>
                <td style={{ width: "2.4%" }}></td>
                <td
                  style={{ width: "41%" }}
                  onClick={() => {
                    router.push("/chardham");
                  }}
                  className={`${
                    carTab == "chardham" && router.pathname == "/chardham"
                      ? "car-tab-active"
                      : ""
                  }`}
                >
                  <div className="radio-button car-tab custom-cursor-pointer text-center">
                    <div className="colored-dham-svg mt-1"></div>
                    <p className="">Char Dham Yatra</p>
                  </div>
                </td>
                <td style={{ width: "2.4%" }}></td>
                <td
                  style={{ width: "26%" }}
                  onClick={() => {
                    router.push("/hotel");
                  }}
                  className={`${
                    carTab == "hotel" && router.pathname == "/hotel"
                      ? "car-tab-active"
                      : ""
                  }`}
                >
                  {/* <div className="radio-button car-tab custom-cursor-pointer text-center">
                                        <img src="/images/icons/hotel.png" height={30} width={30} />
                                        <span className='ms-2'>Hotel</span>
                                    </div> */}

                  <div className="radio-button car-tab custom-cursor-pointer text-center">
                    <div className="colored-hotel-svg mt-1"></div>
                    <p className="">Hotel</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="form-title mb-0">{heading}</h3>
        <div className="form">
          <div className="trip-options">
            <div className="">
              {loading && (
                <div className="ph-item">
                  <div className="ph-col-12">
                    <div className="ph-row">
                      <div className="ph-col-12 big custom-loading-placeholder"></div>
                      <div className="ph-col-12 big custom-loading-placeholder"></div>
                      <div className="ph-col-12 big custom-loading-placeholder"></div>
                      <div className="ph-col-12 big custom-loading-placeholder"></div>
                      <div className="ph-col-12 big custom-loading-placeholder"></div>
                    </div>
                  </div>
                </div>
              )}

              {carTab == "taxi" &&
                router.pathname == "/" &&
                loading == false && (
                  <>
                    <table className="w-100 mb-1">
                      <tbody>
                        <tr>
                          <td style={{ width: "48%" }}>
                            <div
                              className={`${
                                category === "outstation"
                                  ? "form-category-selected"
                                  : ""
                              }`}
                              onClick={() => {
                                setCategory("outstation");
                                setTripType("oneWay");
                              }}
                            >
                              <div className="radio-button form-category custom-cursor-pointer text-center">
                                Outstation
                              </div>
                            </div>
                          </td>
                          <td style={{ width: "4%" }}></td>
                          <td style={{ width: "48%" }}>
                            <div
                              className={`${
                                category === "localairport"
                                  ? "form-category-selected"
                                  : ""
                              }`}
                              onClick={() => {
                                setCategory("localairport");
                                setTripType("local");
                              }}
                            >
                              <div className="radio-button form-category custom-cursor-pointer">
                                Local / Airport
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    {category == "outstation" && (
                      <>
                        <div className="outstation-radio d-flex align-items-center gap-4">
                          <div
                            className="d-flex align-items-center"
                            onClick={() => handleDivClick("roundTrip")}
                          >
                            <input
                              type="radio"
                              name="tripType"
                              value="roundTrip"
                              className="mb-1"
                              checked={tripType === "roundTrip"}
                              onChange={() => setTripType("roundTrip")}
                            />
                            <label className="ms-2 mb-1 custom-cursor-pointer">
                              Round Trip
                            </label>
                          </div>

                          <div
                            className="d-flex align-items-center"
                            onClick={() => handleDivClick("oneWay")}
                          >
                            <input
                              type="radio"
                              name="tripType"
                              value="oneWay"
                              checked={tripType === "oneWay"}
                              onChange={() => setTripType("oneWay")}
                              className="mb-1 custom-cursor-pointer"
                            />
                            <label className="ms-2 mb-1 custom-cursor-pointer">
                              One Way Trip
                            </label>
                          </div>
                        </div>
                      </>
                    )}

                    {category == "localairport" && (
                      <>
                        <div className="outstation-radio d-flex align-items-center gap-4">
                          <div
                            className="d-flex align-items-center"
                            onClick={() => handleDivClick("local")}
                          >
                            <input
                              type="radio"
                              name="tripType"
                              value="local"
                              className="mb-1 custom-cursor-pointer"
                              checked={tripType === "local"}
                              onChange={() => setTripType("local")}
                            />
                            <label className="ms-2 mb-1 custom-cursor-pointer">
                              Local Rental
                            </label>
                          </div>

                          <div
                            className="d-flex align-items-center"
                            onClick={() => handleDivClick("airport")}
                          >
                            <input
                              type="radio"
                              name="tripType"
                              value="airport"
                              checked={tripType === "airport"}
                              onChange={() => setTripType("airport")}
                              className="mb-1 custom-cursor-pointer"
                            />
                            <label className="ms-2 mb-1 custom-cursor-pointer">
                              Airport Transfer
                            </label>
                          </div>
                        </div>
                      </>
                    )}

                    {category == "outstation" && (
                      <div className="outstation">
                        {allPlaces?.length < 1 && (
                          <>
                            <div className="mt-2 position-relative outstation">
                              <Select
                                onChange={(selectedOption) =>
                                  handleSelectChange("start", selectedOption)
                                }
                                onInputChange={(value) =>
                                  handleSearchChange(value, "start")
                                }
                                options={startMapData}
                                placeholder="Pickup Address"
                                styles={selectStyles}
                                className="w-100"
                                filterOption={null}
                                menuPlacement="bottom"
                              />

                              <img
                                src="/images/icons/pickup.png"
                                className="field-icon"
                                height={"24px"}
                                width={"24px"}
                              />
                            </div>
                            {errors.start && (
                              <p className="text-danger text-start mb-0 error-message">
                                Pickup address is required.
                              </p>
                            )}
                          </>
                        )}

                        {allPlaces?.length >= 1 && (
                          <div className="mb-3">
                            <p
                              className="mb-0 ms-2 text-start path-text"
                              style={{
                                fontSize: "14.4px",
                                color: "#00000",
                                fontWeight: "500",
                              }}
                            >
                              Your Itinerary
                            </p>
                            <div className="start-align">
                              {allPlaces.map((data: any, index: number) => (
                                <span className="" key={index}>
                                  {index != 0 && (
                                    <i className="fa fa-arrow-right me-1 arrow-icon"></i>
                                  )}
                                  <span className="place-tag">
                                    {/* {editingIndex === index ? (
                                                                        <Select
                                                                            onChange={(selectedOption) => handleSelectChange(index, selectedOption)}
                                                                            onInputChange={(value) => handleSearchChange(value, index)}
                                                                            options={startMapData}
                                                                            placeholder="Search Address"
                                                                            styles={selectStyles}
                                                                            className="w-100"
                                                                            filterOption={null}
                                                                            menuPlacement="auto"
                                                                            autoFocus
                                                                            onBlur={() => setEditingIndex(null)}
                                                                        />
                                                                    ) : ( */}
                                    <span>{data?.label}</span>
                                    {/* )} */}
                                    <i
                                      className="fa-solid fa-xmark ms-1"
                                      onClick={() => handleDelete(index)}
                                    ></i>
                                  </span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {destinationsField && (
                          <>
                            <div className="mt-2 d-flex position-relative">
                              <Select
                                onChange={(selectedOption) =>
                                  handleSelectChange("end", selectedOption)
                                }
                                onInputChange={(value) =>
                                  handleSearchChange(value, "end")
                                }
                                options={endMapData}
                                placeholder="Destination Address"
                                styles={selectStyles}
                                className="w-100"
                                filterOption={null}
                                menuPlacement="bottom"
                              />
                              {/* <i
                                                            className="icon fa-regular fa-location-dot position-absolute"
                                                            style={{
                                                                right: '30px',
                                                                top: '50%',
                                                                transform: 'translateY(-50%)',
                                                                pointerEvents: 'none',
                                                                color: '#000',
                                                            }}
                                                        ></i> */}
                              <img
                                src="/images/icons/destination.png"
                                className="field-icon"
                                height={"24px"}
                                width={"24px"}
                              />
                            </div>
                            {errors.end && (
                              <p className="text-danger text-start mb-0 error-message">
                                Destination address is required.
                              </p>
                            )}
                          </>
                        )}

                        <button
                          className={`add-city-button mt-2 d-flex position-relative w-100 ${
                            destinationsField ? "disbled" : ""
                          }`}
                          disabled={destinationsField}
                          onClick={() => setDestinationsField(true)}
                        >
                          <i className="fa-regular fa-circle-plus me-2"></i> Add
                          More City
                          {/* <i
                                                    className="icon fa-sharp fa-regular fa-circle-stop position-absolute"
                                                    style={{
                                                        right: '30px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        pointerEvents: 'none',
                                                        color: '#000',
                                                    }}
                                                ></i> */}
                          <img
                            src="/images/icons/stops.png"
                            className="field-icon"
                            height={"24px"}
                            width={"24px"}
                          />
                        </button>
                      </div>
                    )}

                    {tripType == "local" && (
                      <>
                        <div className="mt-2 d-flex position-relative">
                          <CustomSelect
                            options={localPackages?.map((Obj: any) => {
                              return {
                                label: `${Obj?.hours} Hours, ${Obj?.km} Km`,
                                value: Obj?.id,
                                distance: `${Obj?.km}`,
                                hours: `${Obj?.hours}`,
                              };
                            })}
                            value={localPackageId}
                            className={""}
                            isMulti={undefined}
                            onChange={(value: any) => {
                              handleLocalDistanceChange(value);
                            }}
                            customStyles={ReactSelectStyleTwo}
                            placeholder="Select Package"
                          />
                          {/* <i
                                                    className="icon fa-regular fa-location-dot position-absolute"
                                                    style={{
                                                        right: '30px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        pointerEvents: 'none',
                                                        color: '#000',
                                                    }}
                                                ></i> */}

                          <img
                            src="/images/icons/routes.png"
                            className="field-icon"
                            height={"24px"}
                            width={"24px"}
                          />
                        </div>
                        {errors.package && (
                          <p className="text-danger text-start mb-0 error-message">
                            {"Please Select a package"}
                          </p>
                        )}

                        <div className="mt-2 d-flex position-relative">
                          <CustomSelect
                            options={cities?.map((Obj: any) => {
                              return { label: Obj?.name, value: Obj?.id };
                            })}
                            value={cityId}
                            className={""}
                            isMulti={undefined}
                            onChange={(value: any) => {
                              handleCityChange(value);
                            }}
                            customStyles={ReactSelectStyleTwo}
                            placeholder="Select City"
                          />
                          {/* <i
                                                    className="icon fa-regular fa-location-dot position-absolute"
                                                    style={{
                                                        right: '30px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        pointerEvents: 'none',
                                                        color: '#000',
                                                    }}
                                                ></i> */}

                          <img
                            src="/images/icons/building.png"
                            className="field-icon"
                            height={"24px"}
                            width={"24px"}
                          />
                        </div>
                        {errors.city && (
                          <p className="text-danger text-start mb-0 error-message">
                            {"Please Select a city"}
                          </p>
                        )}

                        <div className="mt-2 position-relative Pickup">
                          <Select
                            value={allPlaces[1]}
                            onChange={(selectedOption) => {
                              if (selectedOption) {
                                setAllPlaces((prevPlaces: any) => {
                                  const newPlaces = [];

                                  // Keep index 0 if it exists
                                  if (prevPlaces[0]) {
                                    newPlaces.push(prevPlaces[0]);
                                  }

                                  // Set the selected option at index 1
                                  newPlaces[1] = selectedOption;

                                  return newPlaces;
                                });
                              }

                              console.log("allPlaces[0]", allPlaces[0]);
                              console.log("allPlaces[1]", allPlaces[1]);
                            }}
                            onInputChange={(value) =>
                              handleSearchChange(value, "start")
                            }
                            options={startMapData}
                            placeholder="Pickup Address"
                            styles={selectStyles}
                            className="w-100"
                            filterOption={null}
                            menuPlacement="bottom"
                          />

                          <img
                            src="/images/icons/pickup.png"
                            className="field-icon"
                            height={"24px"}
                            width={"24px"}
                          />
                        </div>
                        {errors.start && (
                          <p className="text-danger text-start mb-0 error-message">
                            Pickup address is required.
                          </p>
                        )}
                      </>
                    )}

                    {tripType == "airport" && (
                      <>
                        <div className="mt-2 d-flex position-relative">
                          <CustomSelect
                            options={DataFromTo}
                            value={fromTo}
                            className={""}
                            isMulti={undefined}
                            onChange={(value: any) => {
                              handleFromToChange(value);
                            }}
                            customStyles={ReactSelectStyleTwo}
                            placeholder="From / To"
                          />
                          {/* <i
                                                    className="icon fa-regular fa-location-dot position-absolute"
                                                    style={{
                                                        right: '30px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        pointerEvents: 'none',
                                                        color: '#000',
                                                    }}
                                                ></i> */}
                          <img
                            src="/images/icons/routes.png"
                            className="field-icon"
                            height={"24px"}
                            width={"24px"}
                          />
                        </div>

                        <div className="mt-2 d-flex position-relative">
                          <CustomSelect
                            options={airports?.map((Obj: any) => {
                              return { label: Obj?.name, value: Obj?.id };
                            })}
                            value={airportId}
                            className={""}
                            isMulti={undefined}
                            onChange={(value: any) => {
                              handleAirportChange(value);
                            }}
                            customStyles={ReactSelectStyleTwo}
                            placeholder="Select Airport"
                          />
                          {/* <i
                                                    className="icon fa-regular fa-location-dot position-absolute"
                                                    style={{
                                                        right: '30px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        pointerEvents: 'none',
                                                        color: '#000',
                                                    }}
                                                ></i> */}
                          <img
                            src="/images/icons/plane.png"
                            className="field-icon"
                            height={"24px"}
                            width={"24px"}
                          />
                        </div>
                        {errors.airport && (
                          <p className="text-danger text-start mb-0 error-message">
                            {"Please Select a airport"}
                          </p>
                        )}

                        {airportCities && (
                          <>
                            <div className="mt-2 d-flex position-relative">
                              <CustomSelect
                                options={airportCities?.map((Obj: any) => {
                                  return {
                                    label: Obj?.name,
                                    value: Obj?.id,
                                    distance: Obj?.distance,
                                  };
                                })}
                                value={airportCityId}
                                className={""}
                                isMulti={undefined}
                                onChange={(value: any) => {
                                  handleAirportCityChange(value);
                                }}
                                customStyles={ReactSelectStyleTwo}
                                placeholder={`${
                                  fromTo == "from"
                                    ? "Select Destination City"
                                    : "Select Pickup City"
                                }`}
                              />
                              {/* <i
                                                            className="icon fa-regular fa-location-dot position-absolute"
                                                            style={{
                                                                right: '30px',
                                                                top: '50%',
                                                                transform: 'translateY(-50%)',
                                                                pointerEvents: 'none',
                                                                color: '#000',
                                                            }}
                                                        ></i> */}
                              <img
                                src="/images/icons/building.png"
                                className="field-icon"
                                height={"24px"}
                                width={"24px"}
                              />
                            </div>
                            {errors.airport_city && (
                              <p className="text-danger text-start mb-0 error-message">
                                {"Please Select a city"}
                              </p>
                            )}
                          </>
                        )}
                        <div className="mt-2 position-relative">
                          <Select
                            value={allPlaces[2]}
                            onChange={(selectedOption) => {
                              if (selectedOption) {
                                setAllPlaces((prevPlaces: any) => {
                                  const newPlaces = [];

                                  // Keep index 0 if it exists
                                  if (prevPlaces[0]) {
                                    newPlaces.push(prevPlaces[0]);
                                  }
                                  if (prevPlaces[1]) {
                                    newPlaces.push(prevPlaces[1]);
                                  }

                                  // Set the selected option at index 1
                                  newPlaces[2] = selectedOption;

                                  return newPlaces;
                                });
                              }

                              console.log("allPlaces[0]", allPlaces[0]);
                              console.log("allPlaces[1]", allPlaces[1]);
                            }}
                            onInputChange={(value) =>
                              handleSearchChange(value, "start")
                            }
                            options={startMapData}
                            placeholder={`${
                              fromTo == "from"
                                ? "Enter Drop Location"
                                : "Enter Pickup Location"
                            }`}
                            styles={selectStyles}
                            className="w-100"
                            filterOption={null}
                            menuPlacement="bottom"
                          />

                          <img
                            src="/images/icons/pickup.png"
                            className="field-icon"
                            height={"24px"}
                            width={"24px"}
                          />
                        </div>
                        {errors.start && (
                          <p className="text-danger text-start mb-0 error-message">
                            Pickup address is required.
                          </p>
                        )}
                      </>
                    )}

                    <Row
                      className={`g-1 mt-2 home-datepicker ${
                        tripType === "roundTrip" ? "outstation-round-trip" : ""
                      }`}
                    >
                      <Col
                        xs={tripType === "roundTrip" ? 6 : 12}
                        className="home-form-datetime"
                      >
                        <p
                          className="mb-0 text-start path-text mb-1"
                          style={{
                            fontSize: "16px",
                            color: "#010005",
                            fontWeight: "500",
                          }}
                        >
                          Pickup Date & Time
                        </p>
                        <div className="custom-input left-datepicker position-relative">
                          <DatePicker
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
                          />
                        </div>
                      </Col>
                      {tripType === "roundTrip" && (
                        <Col xs={6} className="home-form-datetime">
                          <p
                            className="mb-0 text-start path-text mb-1"
                            style={{
                              fontSize: "16px",
                              color: "#010005",
                              fontWeight: "500",
                            }}
                          >
                            Drop Date & Time
                          </p>
                          <div className="custom-input right-datepicker return-date position-relative">
                            <DatePicker
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
                        </Col>
                      )}
                    </Row>
                  </>
                )}

              {carTab == "chardham" &&
                router.pathname == "/chardham" &&
                loading == false &&
                DhamPackages &&
                DhamPackageId && (
                  <>
                    <Row className="g-1">
                      {DhamCategories?.map((obj: any, index: any) => (
                        <Col
                          className={`${
                            DhamCategoryId == obj?.id
                              ? "form-category-selected"
                              : ""
                          }`}
                          xs={4}
                          key={index}
                        >
                          <div
                            className="radio-button form-category custom-cursor-pointer text-center"
                            onClick={() => setDhamCategoryId(obj?.id)}
                          >
                            <span>{obj?.name}</span>
                          </div>
                        </Col>
                      ))}
                    </Row>

                    {DhamPackages?.length > 0 && (
                      <>
                        <div className="mt-2 outstation-radio mb-0 mt-1 ">
                          <p
                            className="mb-0 text-start path-text "
                            style={{
                              fontSize: "16px",
                              color: "#010005",
                              fontWeight: "500",
                            }}
                          >
                            Select Package
                          </p>
                          <Row className="gx-1 mt-1">
                            {DhamPackages?.map((obj: any, index: any) => (
                              <Col xs={6} key={index}>
                                <div
                                  className="d-flex align-items-center"
                                  onClick={() => SelectDhamPackage(obj?.id)}
                                >
                                  <input
                                    type="radio"
                                    value={DhamPackageId}
                                    className="mb-1"
                                    checked={DhamPackageId == obj?.id}
                                    onChange={() => SelectDhamPackage(obj?.id)}
                                  />
                                  <label className="ms-2 mb-1 custom-cursor-pointer taxisafar-radio">
                                    {" "}
                                    {obj?.name?.charAt(0).toUpperCase() +
                                      obj?.name?.slice(1)}
                                  </label>
                                </div>
                              </Col>
                            ))}
                          </Row>
                        </div>
                        <Row className="g-1 outstation-radio mt-1 mb-0">
                          <p
                            className="mb-0 text-start path-text"
                            style={{
                              fontSize: "16px",
                              color: "#010005",
                              fontWeight: "500",
                            }}
                          >
                            Select Pickup City
                          </p>
                          {DhamPackageCities?.map((obj: any, index: any) => (
                            <Col xs={6} key={index}>
                              <div
                                className="d-flex align-items-center"
                                onClick={() =>
                                  handleDhamPackageCityChange(
                                    obj?.id,
                                    obj?.days
                                  )
                                }
                              >
                                <input
                                  type="radio"
                                  value={DhamPackageCityId}
                                  className="mb-1"
                                  checked={DhamPackageCityId == obj?.id}
                                  onChange={() =>
                                    handleDhamPackageCityChange(
                                      obj?.id,
                                      obj?.days
                                    )
                                  }
                                />
                                <label className="ms-2 mb-1 custom-cursor-pointer taxisafar-radio">
                                  {" "}
                                  {obj?.name?.charAt(0).toUpperCase() +
                                    obj?.name?.slice(1)}
                                </label>
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </>
                    )}

                    <Row className="g-1 mt-2 outstation-round-trip home-datepicker">
                      <Col xs={6}>
                        <p
                          className="mb-0 text-start path-text mb-1"
                          style={{
                            fontSize: "16px",
                            color: "#010005",
                            fontWeight: "500",
                          }}
                        >
                          Pickup Date & Time
                        </p>
                        <div className="custom-input left-datepicker position-relative">
                          <DatePicker
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
                          />
                        </div>
                      </Col>

                      <Col xs={6} className="home-form-datetime">
                        <p
                          className="mb-0 text-start path-text mb-1"
                          style={{
                            fontSize: "16px",
                            color: "#010005",
                            fontWeight: "500",
                          }}
                        >
                          Drop Date & Time
                        </p>
                        <div className="custom-input right-datepicker return-date position-relative">
                          <DatePicker
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
                      </Col>
                    </Row>
                  </>
                )}

              {carTab == "hotel" &&
                router.pathname == "/hotel" &&
                loading == false && (
                  <>
                    <div className="mt-1 d-flex position-relative">
                      <CustomSelect
                        options={hotelCities?.map((Obj: any) => {
                          return { label: Obj?.name, value: Obj?.id };
                        })}
                        value={hotelCityId}
                        className={""}
                        isMulti={undefined}
                        onChange={(value: any) => {
                          handleHotelCityChange(value);
                        }}
                        customStyles={ReactSelectStyleTwo}
                        placeholder="Please search city here*"
                      />
                      <img
                        src="/images/icons/destination.png"
                        className="field-icon"
                        height={"24px"}
                        width={"24px"}
                      />
                    </div>
                    {errors.hotel_city && (
                      <p className="text-danger text-start mb-0 error-message">
                        {"Please Select a city"}
                      </p>
                    )}

                    <Row className="g-1 home-form-datetime">
                      <Col xs={6}>
                        <div className="mt-3 custom-input position-relative">
                          <p
                            className="mb-0 text-start path-text mb-1"
                            style={{
                              fontSize: "16px",
                              color: "#010005",
                              fontWeight: "450",
                            }}
                          >
                            Check-in Date & Time{" "}
                          </p>

                          <DatePicker
                            selected={checkInDate}
                            onChange={(date: any) => {
                              setErrors((prev) => ({
                                ...prev,
                                check_in: false,
                              }));
                              if (date) {
                                setCheckInDate(date);
                                const iDate = new Date(date);
                                const rDate = new Date(checkOutDate);
                                if (iDate > rDate) {
                                  if (
                                    (iDate.getHours() >= 23 &&
                                      iDate.getMinutes() > 0) ||
                                    iDate.getHours() > 23
                                  ) {
                                    const tomorrow = new Date(iDate);
                                    tomorrow.setDate(tomorrow.getDate() + 1);
                                    tomorrow.setHours(23, 0, 0, 0);
                                    setCheckOutDate(tomorrow);
                                  } else {
                                    const updatedDate = new Date(iDate);
                                    updatedDate.setHours(23, 0, 0, 0);
                                    setCheckOutDate(updatedDate);
                                  }
                                }
                              } else {
                                setCheckInDate(checkInDate);
                              }
                            }}
                            showTimeSelect
                            timeFormat="h:mm aa"
                            timeIntervals={30}
                            dateFormat="dd/MM/yyyy h:mm aa"
                            placeholderText="Check-in Time*"
                            minDate={new Date()}
                            isClearable={false}
                          />
                        </div>
                        {errors.check_in && (
                          <p className="text-danger text-start mb-0 error-message">
                            {"Please select Check-in"}
                          </p>
                        )}
                      </Col>

                      <Col xs={6}>
                        <div className="mt-3 custom-input position-relative">
                          <p
                            className="mb-0 text-start path-text mb-1"
                            style={{
                              fontSize: "16px",
                              color: "#010005",
                              fontWeight: "450",
                            }}
                          >
                            Check-out Date & Time{" "}
                          </p>

                          <DatePicker
                            selected={checkOutDate}
                            onChange={(date: any) => {
                              setCheckOutDate(date);
                              setErrors((prev) => ({
                                ...prev,
                                check_out: false,
                              }));
                            }}
                            showTimeSelect
                            timeFormat="h:mm aa"
                            timeIntervals={30}
                            dateFormat="dd/MM/yyyy h:mm aa"
                            placeholderText="Check-out Time*"
                            minDate={checkInDate}
                            isClearable={false}
                          />
                        </div>
                        {errors.check_out && (
                          <p className="text-danger text-start mb-0 error-message">
                            {"Please select Check-out"}
                          </p>
                        )}
                      </Col>

                      <Col xs={4}>
                        <p
                          className="mb-0 mt-3 text-start path-text ms-2 mb-1"
                          style={{
                            fontSize: "16px",
                            color: "#010005",
                            fontWeight: "450",
                          }}
                        >
                          Adult{" "}
                        </p>
                        <div className="d-flex position-relative">
                          <CustomSelect
                            options={AdultOptions}
                            value={adult}
                            className={""}
                            isMulti={undefined}
                            onChange={(value: any) => {
                              setAdult(value?.value);
                            }}
                            customStyles={ReactSelectStyleHotels}
                            placeholder={`Adults`}
                          />
                          {/* <i
                                                    className="icon fa-light fa-family-pants position-absolute"
                                                    style={{
                                                        right: '30px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        pointerEvents: 'none',
                                                        color: '#000',
                                                    }}
                                                ></i> */}
                          <img
                            src="/images/icons/adult.png"
                            className="field-icon"
                            height={"24px"}
                            width={"24px"}
                          />
                        </div>
                      </Col>
                      <Col xs={4}>
                        <p
                          className="mb-0 mt-3 text-start path-text ms-2 mb-1"
                          style={{
                            fontSize: "16px",
                            color: "#010005",
                            fontWeight: "450",
                          }}
                        >
                          Children{" "}
                        </p>
                        <div className="d-flex position-relative">
                          <CustomSelect
                            options={ChildOptions}
                            value={children}
                            className={""}
                            isMulti={undefined}
                            onChange={(value: any) => {
                              setChildren(value?.value);
                            }}
                            customStyles={ReactSelectStyleHotels}
                            placeholder={`Children`}
                          />
                          {/* <i
                                                    className="icon fa-light fa-family-pants position-absolute"
                                                    style={{
                                                        right: '30px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        pointerEvents: 'none',
                                                        color: '#000',
                                                    }}
                                                ></i> */}
                          <img
                            src="/images/icons/children.png"
                            className="field-icon"
                            height={"24px"}
                            width={"24px"}
                          />
                        </div>
                      </Col>
                      <Col xs={4}>
                        <p
                          className="mb-0 mt-3 text-start path-text ms-2 mb-1"
                          style={{
                            fontSize: "16px",
                            color: "#010005",
                            fontWeight: "450",
                          }}
                        >
                          Room{" "}
                        </p>
                        <div className="d-flex position-relative">
                          <CustomSelect
                            options={RoomOptions}
                            value={rooms}
                            className={""}
                            isMulti={undefined}
                            onChange={(value: any) => {
                              setRooms(value?.value);
                            }}
                            customStyles={ReactSelectStyleHotels}
                            placeholder={`Rooms`}
                          />
                          {/* <i
                                                    className="icon fa-regular fa-hotel position-absolute"
                                                    style={{
                                                        right: '30px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        pointerEvents: 'none',
                                                        color: '#000',
                                                    }}
                                                ></i> */}
                          <img
                            src="/images/icons/room.png"
                            className="field-icon"
                            height={"24px"}
                            width={"24px"}
                          />
                        </div>
                      </Col>
                    </Row>

                    <Row className="g-1 mt-3 home-form-datetime">
                      {children > 0 && (
                        <p
                          className="mb-0 text-start path-text mb-1"
                          style={{
                            fontSize: "16px",
                            color: "#010005",
                            fontWeight: "500",
                          }}
                        >
                          Age Of Children
                        </p>
                      )}

                      {children > 0 &&
                        Array.from({ length: children }).map((_, index) => (
                          <Col xs={4} key={index} className="mt-1">
                            <Select
                              options={AgeOptions}
                              value={childrenAges[index]}
                              onChange={(selectedOption) =>
                                handleAgeChange(index, selectedOption)
                              }
                              isMulti={false}
                              styles={ReactSelectStyleHotels}
                              placeholder="Select Age"
                              classNamePrefix="custom-select"
                            />
                          </Col>
                        ))}
                    </Row>
                  </>
                )}

              <div className="mt-2 custom-input position-relative">
                <PhoneInput
                  style={{}}
                  placeholder="Enter WhatsApp Number"
                  value={phone}
                  defaultCountry="IN"
                  onChange={(value: any) => {
                    setPhone(value);
                    setErrors((prev) => ({ ...prev, phone: false }));
                  }}
                />

                {/* <i
                                    className="icon fa-regular fa-phone-volume position-absolute"
                                    style={{
                                        right: '30px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        pointerEvents: 'none',
                                        color: '#000',
                                    }}
                                ></i> */}

                <img
                  src="/images/icons/whatsapp.png"
                  className="field-icon"
                  height={"24px"}
                  width={"24px"}
                />
              </div>
              {errors.phone && (
                <p className="text-danger text-start mb-0 error-message">
                  {"Please enter a valid phone number."}
                </p>
              )}
              <div className="col-lg-12 col-md-12 col-sm-12 mt-4">
                <button
                  type="submit"
                  className="taxisafar-theme-button check-prices w-100"
                  onClick={checkPrices}
                  disabled={isLoading}
                >
                  <span className="btn-title">
                    {isLoading ? "Please Wait..." : buttonName}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GoogleBookingFormOnBannerTwo;
