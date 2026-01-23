import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
// import Link from "next/link";
import { useRouter } from "next/router";

import { Modal, Row, Col } from "react-bootstrap";
import parse from "html-react-parser";
import { checkTime, dateTime } from "@/pages/api/checkDateTime";
// import { formatISO } from "date-fns";
import { Toast, ToastContainer } from "react-bootstrap";
// import ReactDOM from "react-dom";
import moment from "moment";
// import { Model } from "@/pages/api/sessions";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  // createCustomer,
  createUpdateCustomer,
  sendOTP,
  verifyOTP,
} from "@/pages/api/customer";
import { createTransaction } from "@/pages/api/transaction";
import { createTrip, checkBookingLimit } from "@/pages/api/trip";
// import Razorpay from "razorpay";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
// import Select from "react-select";

import NProgress from "nprogress";
import "nprogress/nprogress.css";

interface PricingCardThreeProps {
  img: string;
  car: string;
  price: string;
  includedKm: string;
  pricePerKm: string;
  additional_time_charge: string;
  fuelcharges: boolean;
  drivercharges: boolean;
  nightcharges: string;
  link: string;
  buttonName: string;
  terms: string;
  departureDate?: any;
  returnDate?: any;
  tripType?: string;
  taxIncluded?: any;
  focusDatePicker?: () => void;
  parkingcharges?: boolean;
  places?: any;
  vehicle_id?: string;
  phoneNo?: string;
  category?: string;
  city_id?: string;
  local_rental_plan_id?: string;
  airport_id?: string;
  airport_city_id?: string;
  airport_from_to?: string;
  originalPrice?: string;
  car_tab?: string;
  dhamPackageRoutes?: any;
  dhamPackage?: string;
  dhamPackageCity?: string;
  dham_package_id?: number;
  dham_pickup_city_id?: number;
  dham_package_days?: number;
  dham_category_name?: string;
  dham_category_id?: number;
  passengers?: number;
  large_size_bag?: number;
  medium_size_bag?: number;
  hand_bag?: number;
  discount?: any;
  discountPrice?: string;
  ac_cab?: any;
  luggage?: any;
  pincode?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PricingCardThree: React.FC<PricingCardThreeProps> = ({
  img,
  car,
  price,
  includedKm,
  pricePerKm,
  additional_time_charge,
  fuelcharges,
  drivercharges,
  nightcharges,
  link,
  buttonName,
  terms,
  departureDate,
  returnDate,
  tripType,
  taxIncluded,
  focusDatePicker,
  parkingcharges,
  places,
  vehicle_id,
  phoneNo,
  category,
  city_id,
  local_rental_plan_id,
  airport_id,
  airport_city_id,
  airport_from_to,
  originalPrice,
  car_tab,
  dhamPackageRoutes,
  dhamPackage,
  dhamPackageCity,
  dham_package_id,
  dham_pickup_city_id,
  dham_package_days,
  dham_category_name,
  dham_category_id,
  passengers,
  large_size_bag,
  medium_size_bag,
  hand_bag,
  discount,
  discountPrice,
  ac_cab,
  luggage,
  pincode,
}) => {
  function blockNavigation(event: any) {
    event.preventDefault();
    event.returnValue = "";
  }
  const router = useRouter();
  const fetchPaymentAndAddTransaction = async (paymentId: any, userId: any) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/get-payment-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ payment_id: paymentId }),
      });
      const data = await response.json();

      const pickUpDateTime = formatToLocalISO(departureDate);
      const dropDateTime =
        tripType == "roundTrip" || car_tab == "chardham"
          ? formatToLocalISO(returnDate)
          : null;
      // const address = formik.values.address as any;

      if (data && userId) {
        const trip = {
          user_id: userId,
          vehicle_id: `${vehicle_id}`,
          pickup_address: "",
          extra_km: pricePerKm,
          additional_time_charge: additional_time_charge,
          toll_tax: taxIncluded,
          parking_charges: parkingcharges,
          driver_charges: drivercharges,
          night_charges: nightcharges,
          fuel_charges: fuelcharges,
          places: car_tab == "chardham" ? dhamPackageRoutes : places,
          departure_date: pickUpDateTime,
          return_date: dropDateTime,
          distance: car_tab == "chardham" ? null : includedKm,
          trip_type: tripType ? tripType : null,
          category: category,
          city_id: city_id ? city_id : null,
          local_rental_plan_id: local_rental_plan_id
            ? local_rental_plan_id
            : null,
          airport_id: airport_id ? airport_id : null,
          airport_city_id: airport_city_id ? airport_city_id : null,
          airport_from_to: airport_from_to ? airport_from_to : null,
          car_tab: car_tab ? car_tab : null,
          dham_package_name: dhamPackage ? dhamPackage : null,
          dham_pickup_city_name: dhamPackageCity ? dhamPackageCity : null,
          dham_package_id: dham_package_id ? dham_package_id : null,
          dham_pickup_city_id: dham_pickup_city_id ? dham_pickup_city_id : null,
          dham_package_days: dham_package_days ? dham_package_days : null,
          dham_category_name: dham_category_name ? dham_category_name : null,
          dham_category_id: dham_category_id ? dham_category_id : null,
          pincode: pincode ? pincode : null,
          original_amount: discountPrice,
          paid_amount: price,
          currency: data?.currency,
        };

        const tripData = (await createTrip(trip as any, token as any)) as any;

        const transactionDetails = {
          payment_id: data?.id,
          trip_id: String(tripData.tripId),
          vehicle_id: `${vehicle_id}`,
          name: formik.values.name,
          pickup_address: "",
          vehicle_name: car,
          extra_km: pricePerKm,
          additional_time_charge: additional_time_charge,
          toll_tax: taxIncluded,
          parking_charges: parkingcharges,
          driver_charges: drivercharges,
          night_charges: nightcharges,
          fuel_charges: fuelcharges,
          user_id: userId,
          original_amount: discountPrice,
          paid_amount: price,
          currency: data?.currency,
          status: data?.status,
          order_id: data?.order_id,
          method: data?.method,
          card: data?.card,
          upi: data?.upi,
          bank: data?.bank,
          wallet: data?.wallet,
          email: data?.email,
          contact: data?.contact,
          error_description: data?.error_description,
          error_reason: data?.error_reason,
          acquirer_data: data?.acquirer_data,
          all_details: data,
          places: car_tab == "chardham" ? dhamPackageRoutes : places,
          departure_date: pickUpDateTime,
          return_date: dropDateTime,
          distance: car_tab == "chardham" ? null : includedKm,
          trip_type: tripType ? tripType : null,
          category: category,
          city_id: city_id ? city_id : null,
          local_rental_plan_id: local_rental_plan_id
            ? local_rental_plan_id
            : null,
          airport_id: airport_id ? airport_id : null,
          airport_city_id: airport_city_id ? airport_city_id : null,
          airport_from_to: airport_from_to ? airport_from_to : null,
          car_tab: car_tab ? car_tab : null,
          dham_package_name: dhamPackage ? dhamPackage : null,
          dham_pickup_city_name: dhamPackageCity ? dhamPackageCity : null,
          dham_package_id: dham_package_id ? dham_package_id : null,
          dham_pickup_city_id: dham_pickup_city_id ? dham_pickup_city_id : null,
          dham_package_days: dham_package_days ? dham_package_days : null,
          dham_category_name: dham_category_name ? dham_category_name : null,
          dham_category_id: dham_category_id ? dham_category_id : null,
        };

        (await createTransaction(
          transactionDetails as any,
          token as any
        )) as any;
        console.log("Token", token);
        setBookShow(false);
        formik.resetForm({
          values: {
            name: "",
            phone_number: phoneNo ? phoneNo : "",
            // address: '',
            OTP: "",
            terms: false,
            role: "customer",
          },
        });

        setSeconds(60);
        setDisabled(true);
        setStep(0);
        window.removeEventListener("beforeunload", blockNavigation);
        window.history.pushState(null, "", window.location.href);
        window.onpopstate = null;
      }
      router.push({
        pathname: "/booking",
      });
      // SetPaymentDetails(data);
      // console.log('Payment Details:', data);
    } catch (error) {
      console.error("Error fetching payment details:", error);
    }
  };

  const handlePayment = async (userId: any, userNumber: any, userName: any) => {
    if (userId && userNumber) {
      try {
        if (typeof window !== "undefined" && window.Razorpay) {
          const token = localStorage.getItem("token");
          const response = await fetch("/api/create-order", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              amount: parseFloat(price) * 100,
              userId: userId,
              userName,
            }),
          });
          // console.log("handlePayment", token)
          const data = await response.json();

          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: data.amount,
            currency: data.currency,
            order_id: data.id,
            name: "TaxiSafar",
            description: "Payment",
            config: {
              display: {
                hide: [{ method: "paylater" }, { method: "emi" }],
                preferences: { show_default_blocks: true },
              },
            },
            readonly: {
              contact: true,
            },
            handler: async function (response: any) {
              fetchPaymentAndAddTransaction(
                response.razorpay_payment_id,
                userId
              );
            },
            modal: {
              ondismiss: function () {
                console.warn("Payment modal dismissed by the user.");
                window.removeEventListener("beforeunload", blockNavigation);
                window.history.pushState(null, "", window.location.href);
                window.onpopstate = null;
              },
            },
            prefill: {
              contact: userNumber,
              email: "",
            },
            notes: {
              address: "Razorpay Corporate Office",
            },
            theme: {
              color: "#3399cc",
            },
          };

          window.addEventListener("beforeunload", blockNavigation);
          window.history.pushState(null, "", window.location.href);
          window.onpopstate = function () {
            alert("Payment is in progress. You cannot navigate back.");
            window.history.pushState(null, "", window.location.href);
          };

          const rzp = new window.Razorpay(options);

          rzp.on("payment.error", async function (response: any) {
            const paymentId = response.error.metadata.payment_id;
            fetchPaymentAndAddTransaction(paymentId, userId);
          });

          rzp.open();
        } else {
          console.error("Razorpay is not loaded");
        }
      } catch (error) {
        console.error("Error initializing Razorpay:", error);
      }
    }
  };
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
      // console.log("storedToken", token)
    }
  }, []);

  // function toUTCDate(date: any) {
  //   return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  // }

  function formatToLocalISO(date: any) {
    return moment(date).format("YYYY-MM-DDTHH:mm:ss");
  }

  // const [startMapData, setStartMapData] = useState([]) as any;

  const [toastShow, setToastShow] = useState(false);
  const [message, setMessage] = useState("");

  const [toastSuccessShow, setToastSuccessShow] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [termShow, setTermShow] = useState(false);

  const handleTermsClose = () => setTermShow(false);
  const handleTermsShow = () => setTermShow(true);

  const [conformationShow, setConformationShow] = useState(false);

  const handleConformationsClose = () => setConformationShow(false);
  const handleConformationsShow = () => {
    const pickUpDateTime = formatToLocalISO(departureDate);
    const dropDateTime = formatToLocalISO(returnDate);

    const Data: dateTime = {
      pickUpDateTime: pickUpDateTime,
      dropDateTime: tripType == "roundTrip" ? dropDateTime : "",
    };

    checkTime(Data)
      .then((response: any) => {
        if (response.status == true) {
          setConformationShow(true);
        } else if (response.status == false) {
          setToastShow(true);
          setMessage(response.message);
        }
      })
      .catch((error) => {
        console.error("API Error:", error);
      });
  };

  const [bookShow, setBookShow] = useState(false);

  const handleBooksClose = () => {
    setBookShow(false);

    formik.resetForm({
      values: {
        name: "",
        phone_number: phoneNo ? phoneNo : "",
        // address: '',
        OTP: "",
        terms: false,
        role: "customer",
      },
    });

    setSeconds(60);
    setDisabled(true);
    setStep(0);
    setOtpSuccessMessage(""); // Clear OTP success message when closing
  };
  const handleBooksShow = () => setBookShow(true);

  const bookForm = () => {
    handleConformationsClose();
    handleBooksShow();
  };

  const formatDate = (dateString: any) => {
    if (!dateString) return "";

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(dateString));
  };

  const modifyDate = () => {
    if (focusDatePicker) {
      focusDatePicker();
    }
    handleConformationsClose();
  };

  const [step, setStep] = useState(0);
  const [submitButtonName, setSubmitButtonName] = useState(
    `Pay ₹${price} & Book`
  );
  const [OtpButton, setOtpButton] = useState(`Send OTP`);
  const [customerData, setCustomerData] = useState() as any;
  const [otpInputRef, setOtpInputRef] = useState<HTMLInputElement | null>(null);
  const [otpError, setOtpError] = useState("");
  const [otpSuccessMessage, setOtpSuccessMessage] = useState(""); // New state for OTP success message

  useEffect(() => {
    if (step == 0) {
      setOtpButton("Send OTP");
    } else if (step == 1 && otpInputRef) {
      otpInputRef.focus();
    }
  }, [step]);

  const getValidationSchema = (step: any) => {
    switch (step) {
      case 0:
        return Yup.object({
          phone_number: Yup.string()
            .required("WhatsApp Number is required")
            .min(5, "Please enter a valid phone number.")
            .max(15, "Please enter a valid phone number."),
        });

      case 1:
        return Yup.object({
          phone_number: Yup.string()
            .required("WhatsApp Number is required")
            .min(5, "Please enter a valid phone number.")
            .max(15, "Please enter a valid phone number."),
          OTP: Yup.string()
            .required("OTP is required")
            .length(4, "OTP must be 4 digits"),
        });

      case 2:
        return Yup.object({
          name: Yup.string().required("Name is required"),
          // address: Yup.object().required('Pickup Address is required'),
          terms: Yup.bool()
            .oneOf([true], "You must accept the terms and conditions")
            .required("You must accept the terms"),
        });

      default:
        return Yup.object();
    }
  };

  const validationSchema = getValidationSchema(step);

  const formik = useFormik({
    initialValues: {
      name: "",
      phone_number: phoneNo ? phoneNo : "",
      // address: '',
      terms: false,
      OTP: "",
      role: "customer",
    },
    validationSchema: bookShow ? validationSchema : {},
    onSubmit: async (values) => {
      if (step == 0) {
        try {
          NProgress.start();
          const response = (await sendOTP(values as any)) as any;
          if (response.status == true) {
            try {
              setStep(1);
              setOtpSuccessMessage(response?.message); // Set success message in form
              // setToastSuccessShow(true);
              // setSuccessMessage(`${response?.message}`);
              setSeconds(60);
              setDisabled(true);
              NProgress.done();
              setTimeout(function () {
                setOtpSuccessMessage("");
              }, 5000);
            } catch (error) {
              setToastShow(true);
              setMessage(`Something Went Wrong!!`);
              NProgress.done();
            }
          } else if (response.status == false) {
            setToastShow(true);
            NProgress.done();
            setMessage(`${response?.message}`);
            NProgress.done();
          } else {
            setToastShow(true);
            setMessage(`Something Went Wrong!!`);
            NProgress.done();
          }
        } catch (error) {
          setToastShow(true);
          setMessage(`Something Went Wrong!!`);
          NProgress.done();
        }
      } else if (step == 1) {
        try {
          NProgress.start();
          const response = (await verifyOTP(values as any)) as any;
          if (response.status == true) {
            try {
              setOtpError("");
              setStep(2);
              if (response?.data) {
                setCustomerData(response?.data);
                console.log("response?.data", response?.data);
                formik.setFieldValue(
                  "name",
                  response?.data?.name ? response?.data?.name : ""
                );
              }
              // console.log("esponse?.data?.token", response?.data?.token)
              localStorage.setItem("token", response?.data?.token);
              // setToastSuccessShow(true);
              // setSuccessMessage(`${response?.message}`);
              setOtpSuccessMessage(""); // Clear OTP success message when moving to next step
              NProgress.done();
            } catch (error) {
              setToastShow(true);
              setMessage(`Something Went Wrong!!`);
              NProgress.done();
            }
          } else if (response.status == false) {
            setOtpError(response?.message || "Invalid OTP. Please try again."); // Set the error message
            // setToastShow(true);
            // setMessage(`${response?.message}`);
            NProgress.done();
          } else {
            setToastShow(true);
            setMessage(`Something Went Wrong!!`);
            NProgress.done();
          }
        } catch (error) {
          setToastShow(true);
          setMessage(`Something Went Wrong!!`);
          NProgress.done();
        }
      } else if (step == 2) {
        NProgress.start();
        const response = (await createUpdateCustomer(values as any)) as any;
        if (response.status == true) {
          try {
            if (response.data && pincode) {
              const tripAvailable = {
                vehicle_id: `${vehicle_id}`,
                departure_date: formatToLocalISO(departureDate),
                pincode: pincode,
              };
              const tripAvailableData = (await checkBookingLimit(
                tripAvailable as any
              )) as any;
              console.log("tripAvailableData", tripAvailableData);

              if (tripAvailableData.status == true) {
                await handlePayment(
                  response?.data?.id?.toString(),
                  response?.data?.phone_number,
                  response?.data?.name
                );
              } else {
                setToastShow(true);
                setMessage(tripAvailableData?.message);
              }
              NProgress.done();
            } else {
              await handlePayment(
                response?.data?.id?.toString(),
                response?.data?.phone_number,
                response?.data?.name
              );
              NProgress.done();
            }
          } catch (error) {
            console.log("error", error);
            NProgress.done();
          }
        }
      }
    },
  });
  const [inputChange, setInputChange] = useState("");

  let timer: NodeJS.Timeout;

  // const handleSearchChange = useCallback((inputValue: string, type: any) => {
  //   clearTimeout(timer);
  //   timer = setTimeout(() => {
  //     if (type === "start") {
  //       setInputChange(inputValue);
  //     }
  //   }, 500);
  // }, []);

  // const fetchPlaces = async (query: any, setMapData: any) => {
  //   if (!query) {
  //     setMapData([]);
  //     return;
  //   }
  //   try {
  //     const response = await fetch(
  //       `${process.env.API_URL}/api/map/autocomplete?query=${query}`
  //     );
  //     const data = await response.json();

  //     if (data.predictions) {
  //       const apiData = data.predictions?.map((item: any) => ({
  //         label: item.description,
  //         value: item.place_id,
  //       }));
  //       setMapData(apiData);
  //     } else {
  //       setMapData([]);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching places:", error);
  //     setMapData([]);
  //   }
  // };

  // useEffect(() => {
  //   fetchPlaces(inputChange, setStartMapData);
  // }, [inputChange]);

  // const selectStyles = {
  //   input: (provided: any) => ({
  //     ...provided,
  //     color: "#000",
  //     fontWeight: "400",
  //   }),
  //   option: (provided: any, state: any) => ({
  //     ...provided,
  //     backgroundColor: state.isFocused
  //       ? "transparent"
  //       : provided.backgroundColor,
  //     color: state.isFocused ? provided.color : provided.color,
  //     cursor: "pointer",
  //   }),
  //   placeholder: (provided: any) => ({
  //     ...provided,
  //     fontSize: "18px",
  //     color: "#000",
  //     textAlign: "start",
  //   }),
  //   menu: (provided: any) => ({
  //     ...provided,
  //     textAlign: "start",
  //     fontSize: "16px",
  //     color: "#000",
  //     fontWeight: "400",
  //   }),

  //   menuList: (provided: any) => ({
  //     ...provided,
  //     maxHeight: "140px",
  //     overflowY: "auto",
  //   }),
  //   singleValue: (provided: any) => ({
  //     ...provided,
  //     textAlign: "start",
  //     color: "#000",
  //     fontWeight: "400",
  //   }),

  //   dropdownIndicator: (provided: any) => ({
  //     ...provided,
  //     display: "none",
  //   }),
  //   indicatorSeparator: () => ({
  //     display: "none",
  //   }),
  //   control: (base: any, state: any) => ({
  //     ...base,
  //     backgroundColor: "#f6f6f6",
  //     height: "60px",
  //     borderRadius: "20px",
  //     border: 0,
  //     boxShadow: "0 !important",
  //     "&:hover": {
  //       border: 0,
  //     },
  //     "@media (max-width: 992px)": {
  //       height: "50px",
  //     },
  //   }),
  //   clearIndicator: (provided: any, state: any) => ({
  //     ...provided,
  //     paddingRight: "40px",
  //     cursor: "pointer",
  //   }),
  // };

  const [seconds, setSeconds] = useState(60);
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    if (seconds > 0) {
      const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setDisabled(false);
    }
  }, [seconds]);

  const resendOTP = async () => {
    if (formik.values.phone_number) {
      try {
        setOtpError("");
        const response = (await sendOTP({
          phone_number: formik.values.phone_number,
        } as any)) as any;
        if (response.status == true) {
          try {
            setOtpSuccessMessage(response?.message); // Set success message in form
            // setToastSuccessShow(true);
            // setSuccessMessage(`${response?.message}`);
            setSeconds(60);
            setDisabled(true);
            setTimeout(function () {
              setOtpSuccessMessage("");
            }, 5000);
          } catch (error) {
            setToastShow(true);
            setMessage(`Something Went Wrong!!`);
          }
        } else if (response.status == false) {
          setToastShow(true);
          setMessage(`${response?.message}`);
        } else {
          setToastShow(true);
          setMessage(`Something Went Wrong!!`);
        }
      } catch (error) {
        setToastShow(true);
        setMessage(`Something Went Wrong!!`);
      }
    }
  };

  // Auto-submit OTP when 4 digits are entered
  useEffect(() => {
    if (formik.values.OTP.length === 4 && step === 1) {
      formik.submitForm();
    }
  }, [formik.values.OTP]);

  return (
    <>
      <div className="component-container">
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
            <Toast.Body>{message}</Toast.Body>
          </Toast>
        </ToastContainer>

        <ToastContainer className="toast-container-custom">
          <Toast
            onClose={() => setToastSuccessShow(false)}
            show={toastSuccessShow}
            delay={3000}
            autohide
            className="bg-success text-white"
          >
            <Toast.Header>
              <strong className="me-auto">Message</strong>
              <small>Just now</small>
            </Toast.Header>
            <Toast.Body>{successMessage}</Toast.Body>
          </Toast>
        </ToastContainer>
      </div>

      <Modal show={termShow} onHide={handleTermsClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Other Terms</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="other-terms">{parse(terms)}</div>
        </Modal.Body>
      </Modal>

      <Modal show={conformationShow} onHide={handleConformationsClose} centered>
        <Modal.Header closeButton>
          <p className="mb-0 text-dark fw-normal fs-5">
            Please confirm trip date and time
          </p>
        </Modal.Header>
        <Modal.Body>
          {departureDate && (
            <h2 className="fw-normal text-center">
              {formatDate(departureDate)}
            </h2>
          )}
          {tripType == "roundTrip" && returnDate && (
            <>
              <h2 className="text-center">
                <i className="fw-normal fa-regular fa-arrow-down"></i>
              </h2>
              <h2 className="fw-normal text-center">
                {formatDate(returnDate)}
              </h2>
            </>
          )}
          <div className="mt-3">
            <center>
              <button
                className="taxisafar-theme-button me-4"
                onClick={modifyDate}
              >
                Modify
              </button>
              <button className="taxisafar-theme-button" onClick={bookForm}>
                Book
              </button>
            </center>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={bookShow}
        onHide={handleBooksClose}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <p className="mb-0 text-dark fw-normal fs-5">Fill Contact Details</p>
        </Modal.Header>
        <Modal.Body className="vicky-cab-homebanner contact-book-form mt-0">
          <form onSubmit={formik.handleSubmit} className="form trip-options">
            {step == 2 && (
              <div className="mt-2 custom-input position-relative">
                <input
                  type="text"
                  name="name"
                  placeholder="Enter Your Name *"
                  className={`custom-text-input`}
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  // disabled={step == 0 || }
                />
                <i
                  className="icon fa-regular fa-user position-absolute"
                  style={{
                    right: "30px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: "#666",
                  }}
                ></i>
              </div>
            )}

            {formik.errors.name && (
              <p className="text-danger mb-0 error-message">
                {formik.errors.name}
              </p>
            )}

            <Row className="g-2">
              <Col xs={step == 0 ? 9 : 12}>
                <div className="mt-2 custom-input position-relative">
                  <PhoneInput
                    placeholder="Enter WhatsApp Number *"
                    value={formik.values.phone_number}
                    defaultCountry="IN"
                    onChange={(value) => {
                      formik.setFieldValue("phone_number", value);
                    }}
                    onBlur={formik.handleBlur}
                    className={`${step == 0 ? "" : "custom-phone-input"}`}
                    disabled={step == 1 || step == 2}
                  />
                  <i
                    className="icon fa-regular fa-phone-volume position-absolute"
                    style={{
                      right: "30px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      color: "#666",
                    }}
                  ></i>
                </div>
                {formik.errors.phone_number && (
                  <p className="text-danger mb-0 error-message">
                    {formik.errors.phone_number}
                  </p>
                )}
              </Col>

              {step == 0 && (
                <Col xs={3}>
                  <button
                    className="mt-2 otp-button vicky-cab-button w-100"
                    disabled={formik.isSubmitting}
                  >
                    {formik.isSubmitting ? "Wait.." : OtpButton}
                  </button>
                </Col>
              )}
            </Row>

            {step == 1 && (
              <>
                <Row className="g-1">
                  <Col xs={step == 1 ? 8 : 9}>
                    <div className="me-2 mt-2 custom-input position-relative">
                      <input
                        type="text"
                        name="OTP"
                        placeholder="Enter OTP *"
                        className="custom-text-input"
                        value={formik.values.OTP}
                        onChange={(e) => {
                          formik.handleChange(e);
                          setOtpError(""); // Clear error when user starts typing
                        }}
                        maxLength={4}
                        onBlur={formik.handleBlur}
                        ref={(el) => setOtpInputRef(el)}
                      />
                    </div>
                    {otpError && (
                      <p className="text-danger mb-0 error-message">
                        {otpError}
                      </p>
                    )}
                  </Col>

                  {/*<Col xs={3}>
                                         <button className="mt-2 otp-button vicky-cab-button w-100" disabled={formik.isSubmitting}>
                                        {formik.isSubmitting ? 'Wait..' : OtpButton}
                                    </button> 
                                    </Col>*/}
                  {step == 1 && (
                    <Col xs={4}>
                      <button
                        type="button"
                        className="mt-2 otp-button vicky-cab-button w-100"
                        disabled={disabled}
                        onClick={() => {
                          if (!disabled) {
                            resendOTP();
                          }
                        }}
                      >
                        {disabled ? `Resend OTP in ${seconds}s` : "Resend OTP"}
                      </button>
                    </Col>
                  )}

                  {formik.errors.OTP && (
                    <p className="text-danger mb-0 error-message">
                      {formik.errors.OTP}
                    </p>
                  )}
                </Row>
                {/* Show OTP success message */}
                {otpSuccessMessage && (
                  <p className="text-primary  success-message mt-2 mb-0">
                    {otpSuccessMessage}
                  </p>
                )}
              </>
            )}

            {step == 2 && (
              <div className="mt-2">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="terms"
                    name="terms"
                    checked={formik.values.terms}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <label
                    className="form-check-label terms-label"
                    htmlFor="terms"
                  >
                    I agree with Terms of Use & Cancellation Policy of this
                    service.
                  </label>
                </div>
                {formik.errors.terms && (
                  <p className="text-danger mb-0 error-message">
                    {formik.errors.terms}
                  </p>
                )}
              </div>
            )}

            <center>
              <button
                type="submit"
                className="vicky-cab-button w-100 mt-3"
                disabled={formik.isSubmitting || step == 0 || step == 1}
              >
                {step == 2 && formik.isSubmitting
                  ? "Please Wait..."
                  : submitButtonName}
              </button>
            </center>
            {step == 2 && (
              <>
                <p className="text-secondary mb-0 mt-3">
                  Please pay balance payment directly to driver during the trip.
                </p>
                <p className="text-secondary mb-0 mt-1 text-start">
                  Your booking details, along with driver and vehicle
                  information, will be available under &apos; My Trips&apos; in
                  the Profile section on the home page.
                </p>
              </>
            )}
          </form>
        </Modal.Body>
      </Modal>
      <div className="inner-box">
        <div className="image-box position-relative">
          <img src={img} alt="Car" loading="lazy" />
          {discountPrice && discount > 0 && (
            <div className="discount-sticker">
              <div className="cab-discount-top"></div>
              <div className="cab-discount">
                <h5 className="mb-0">{discount}%</h5>
                <p className="mb-0">Off</p>
              </div>
            </div>
          )}
        </div>

        <div className="content">
          <div className="car-detail d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4 className="car-name">{car}</h4>
              <p className="mb-0 sub-title text-black">
                Any Other Similar AC Taxi
              </p>
              {!(car_tab == "chardham") &&
                (ac_cab ||
                  (passengers !== undefined && passengers !== null) ||
                  luggage) && (
                  <p className="mb-0 sub-title loading-capacity ">
                    {/* {(passengers !== undefined && passengers !== null) &&

                                        (`${passengers} Passengers` + <Image
                                            src="/images/icons/passengers.png"
                                            width={24}
                                            height={24}
                                            alt="Picture of the author"
                                            className='me-2'
                                        />

                                        )} */}
                    {passengers !== undefined && passengers !== null && (
                      <span className="passengers">
                        <Image
                          src="/images/icons/passengers.png"
                          width={25}
                          height={25}
                          alt="Picture of the passengers"
                          className=""
                        />
                        <span
                          className="ms-1 position-relative"
                          style={{ top: "3px" }}
                        >
                          {`${passengers} `}
                        </span>
                      </span>
                    )}

                    {luggage && (
                      <span className="ms-2 passengers">
                        {`  + `}

                        <Image
                          src="/images/icons/luggage.png"
                          width={23}
                          height={23}
                          alt="Picture of the luggage"
                          className="ms-2"
                        />
                        {/* {`Luggage`} */}
                      </span>
                    )}
                    {/* {ac_cab && (
                                            <span>
                                                {` +`}
                                                <Image
                                                    src="/images/icons/ac-cab.png"
                                                    width={23}
                                                    height={23}
                                                    alt="Picture of the ac"
                                                    className="ms-2"
                                                />
                                            {` AC`} 

                                        </span>
                                )} */}

                    {/* {luggage && ` + Luggage`}
                                    {ac_cab && ` + AC Cab`} */}
                  </p>
                )}
            </div>
            <div>
              {discountPrice && discount > 0 ? (
                <>
                  <h4 className="cab-original-price mb-0">{`₹${originalPrice}`}</h4>
                  <h6 className="cab-price mb-0">{`₹${discountPrice}`}</h6>
                </>
              ) : (
                <h6 className="cab-price mb-0">{`₹${originalPrice}`}</h6>
              )}
            </div>
            {/* <p className='mb-0'>{discount}</p> */}
          </div>

          {car_tab == "chardham" ? (
            <>
              <div className="my-3">
                {passengers && (
                  <div className="vehicle-capacity d-flex mt-2">
                    <img
                      src="/images/icons/passengers.png"
                      height={24}
                      width={24}
                    />
                    <p className="mb-0 d-flex align-items-center">
                      {passengers} Passengers
                    </p>
                  </div>
                )}
                {large_size_bag && (
                  <div className="vehicle-capacity d-flex mt-2">
                    <img
                      src="/images/icons/large-bag.png"
                      height={24}
                      width={24}
                    />
                    <p className="mb-0 d-flex align-items-center">
                      {large_size_bag} Large Size Bags 1
                    </p>
                  </div>
                )}
                {medium_size_bag && (
                  <div className="vehicle-capacity d-flex mt-2">
                    <img
                      src="/images/icons/medium-bag.png"
                      height={24}
                      width={24}
                    />
                    <p className="mb-0 d-flex align-items-center">
                      {medium_size_bag} Medium Size Bags
                    </p>
                  </div>
                )}
                {hand_bag && (
                  <div className="vehicle-capacity d-flex mt-2">
                    <img
                      src="/images/icons/hand-bag.png"
                      height={24}
                      width={24}
                    />
                    <p className="mb-0 d-flex align-items-center">
                      {hand_bag} Hand Bags
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <ul className="feature-list">
              <li className="colored">
                Included Km<span className="price">{includedKm}</span>
              </li>
              <li>
                Extra fare/Km <span className="price">{`₹ ${pricePerKm}`}</span>
              </li>
              <li className="colored">
                Toll & State Tax{" "}
                <span className="price">{`${
                  taxIncluded ? "Included" : "Not Included"
                }`}</span>
              </li>
              <li>
                Parking Charges{" "}
                <span className="price">
                  {parkingcharges ? "Included" : "Not Included"}
                </span>
              </li>
              <li className="colored">
                Driver Charges{" "}
                <span className="price">
                  {drivercharges ? "Included" : "Not Included"}
                </span>
              </li>
              <li>
                Night Charges{" "}
                <span className="price">
                  {nightcharges ? "Included" : "Not Included"}
                </span>
              </li>
              <li className="colored">
                Fuel Charges{" "}
                <span className="price">
                  {fuelcharges ? "Included" : "Not Included"}
                </span>
              </li>
            </ul>
          )}

          <center>
            <div className="btn-box ">
              <div
                className="taxisafar-theme-button w-100"
                onClick={handleConformationsShow}
              >
                <span className="btn-title">{buttonName}</span>
              </div>
            </div>
          </center>
          <div className="text-center mt-2  mb-4">
            <span className="mx-auto terms" onClick={handleTermsShow}>
              Other Terms
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default PricingCardThree;
