import { useRouter } from "next/router";
import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Toast, ToastContainer } from "react-bootstrap";
import Image from "next/image";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
// import { FaCalendarAlt } from 'react-icons/fa';
import axios from "axios";

type DocumentFormValues = {
  aadhaarNumber: string;
  aadhaarDocument: string | null;
  panDocument: string | null;
  drivingLicenseNumber: string;
  drivingLicenseExpiry: string;
  drivingLicenseDocument: string | null;
};

type PersonalInfoValues = {
  name: string;
  dob: string;
  mobile: string;
  email: string;
  city: string;
  referral_id: string;
  profilePhoto: string | File | null;
};
interface VehicleFormValues {
  vehicleRegNumber: string;
  vehicleRegDate: string;
  regValidityDate: string;
  rcFrontDocument: string | null;
  rcBackDocument: string | null;
  insuranceDocument: string | null;
  insuranceExpiryDate: string;
  oneYearPermitDocument: string | null;
  oneYearPermitExpiryDate: string;
}

export default function DriverRegister() {
  const API_URL = process.env.API_URL;
  const router = useRouter();
  const [toastShow, setToastShow] = useState(false);
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cities, setCities] = useState<Array<{ id: number; name: string }>>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [cityErrorMessage, setCityErrorMessage] = useState("");
  // step 2
  const [adharCardName, setAdharCardName] = useState("");
  const [panCardName, setPanCardName] = useState("");
  const [dLicenseCardName, setdLicenseCardName] = useState("");
  const [seconds, setSeconds] = useState(30);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [showAadharCard, setShowAadharCard] = useState(false);
  // step 3

  const [rcFrontName, setRcFrontName] = useState("");
  const [rcBackName, setRcBackName] = useState("");
  const [insuranceName, setInsuranceName] = useState("");
  const [oneYearPermitName, setOneYearPermitName] = useState("");
  const [vehicleErrorMessage, setVehicleErrorMessage] = useState("");

  useEffect(() => {
    const fetchCities = async () => {
      setIsLoadingCities(true);
      try {
        const response = await fetch("https://www.webapi.taxisafar.com/api/cities");
        const data = await response.json();
        setCities(data.data);
      } catch (error) {
        setCityErrorMessage("Failed to load cities");
      } finally {
        setIsLoadingCities(false);
      }
    };
    fetchCities();
  }, []);

  // Step 1 Form
  const formik = useFormik<PersonalInfoValues>({
    initialValues: {
      name: "",
      dob: "",
      mobile: "",
      email: "",
      city: "",
      referral_id: "",
      profilePhoto: null,
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required("Name is required")
        .matches(/^[a-zA-Z ]*$/, "Name should only contain letters"),
      dob: Yup.string()
        .required("Date of Birth is required")
        .matches(/^\d{2}-\d{2}-\d{4}$/, "Date must be in dd-mm-yyyy format"),
      mobile: Yup.string()
        .required("Mobile number is required")
        .matches(/^[0-9]{10}$/, "Mobile number must be 10 digits"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      city: Yup.string().required("City is required"),
      referral_id: Yup.string(),
      profilePhoto: Yup.mixed()
        .required("Profile photo is required")
        .test("fileType", "Unsupported file type", (value) => {
          if (!value) return false;
          if (typeof value === "string") return value.startsWith("data:image");
          return ["image/jpeg", "image/png"].includes((value as File).type);
        }),
    }),
    onSubmit: async (values) => {
      // console.log('Personal Info submission data:', values);
      setCurrentStep(2);
      try {
        setErrorMessage("");
        const formData = new FormData();

        formData.append("name", values.name);
        formData.append("dob", values.dob);
        formData.append("mobile", `+91${values.mobile}`);
        formData.append("email", values.email);
        formData.append("city", values.city);
        formData.append("referral_id", values.referral_id || "");

        if (
          typeof values.profilePhoto === "string" &&
          values.profilePhoto.startsWith("data:image")
        ) {
          const res = await fetch(values.profilePhoto);
          const blob = await res.blob();
          const file = new File([blob], "profile.png", { type: "image/png" });
          formData.append("profilePhoto", file);
        } else if (values.profilePhoto instanceof File) {
          formData.append("profilePhoto", values.profilePhoto);
        } else {
          setErrorMessage("Invalid profile photo");
          return;
        }

        const response = await fetch(`${API_URL}/api/user`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          setCurrentStep(2);
        } else {
          setErrorMessage(data.message || "Registration failed");
        }
      } catch (error) {
        setErrorMessage("An error occurred during registration");
        console.error("Registration error:", error);
      }
    },
  });

  // Camera functions
  const handleCameraClick = () => {
    setCameraActive(true);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Camera error: ", err);
          setMessage("Could not access camera");
          setToastShow(true);
        });
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL("image/png");
        setImagePreview(imageDataUrl);
        formik.setFieldValue("profilePhoto", imageDataUrl);
        closeCamera();
      }
    }
  };

  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setCameraActive(false);
  };

  // Updated validation schema for Step 2
  const documentFormik = useFormik<DocumentFormValues>({
    initialValues: {
      aadhaarNumber: "",
      aadhaarDocument: null,
      panDocument: null,
      drivingLicenseNumber: "",
      drivingLicenseExpiry: "",
      drivingLicenseDocument: null,
    },

    validationSchema: Yup.object({
      aadhaarNumber: Yup.string()
        .required("Aadhaar number is required")
        .matches(/^\d{12}$/, "Aadhaar must be 12 digits"),
      aadhaarDocument: Yup.mixed()
        .required("Aadhaar document is required")
        .test("fileType", "Unsupported file type", (value) => {
          if (!value) return false;
          if (typeof value === "string") return value.startsWith("data:image");
          return ["image/jpeg", "image/png"].includes((value as File).type);
        }),
      panDocument: Yup.mixed()
        .required("PAN document is required")
        .test("fileType", "Unsupported file type", (value) => {
          if (!value) return false;
          if (typeof value === "string") return value.startsWith("data:image");
          return ["image/jpeg", "image/png"].includes((value as File).type);
        }),
      drivingLicenseNumber: Yup.string().required("License number is required"),
      drivingLicenseExpiry: Yup.string()
        .required("Expiry date is required")
        .matches(/^\d{2}-\d{2}-\d{4}$/, "Date must be in dd-mm-yyyy format"),
      drivingLicenseDocument: Yup.mixed()
        .required("Driving license document is required")
        .test("fileType", "Unsupported file type", (value) => {
          if (!value) return false;
          if (typeof value === "string") return value.startsWith("data:image");
          return ["image/jpeg", "image/png"].includes((value as File).type);
        }),
    }),

    onSubmit: async (values) => {
      setCurrentStep(3);
      try {
        console.log("Document submission data:", values);

        const formData = new FormData();

        // Append text values
        formData.append("aadhaarNumber", values.aadhaarNumber);
        formData.append("drivingLicenseNumber", values.drivingLicenseNumber);
        formData.append("drivingLicenseExpiry", values.drivingLicenseExpiry);

        // Append file values (check if they exist)
        if (values.aadhaarDocument) {
          formData.append("aadhaarDocument", values.aadhaarDocument);
        }
        if (values.panDocument) {
          formData.append("panDocument", values.panDocument);
        }
        if (values.drivingLicenseDocument) {
          formData.append(
            "drivingLicenseDocument",
            values.drivingLicenseDocument
          );
        }

        const response = await fetch(`${API_URL}/api/`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          setCurrentStep(4); // Move to success screen
        } else {
          setMessage(data.message || "Vehicle registration failed");
          setToastShow(true);
        }

        setCurrentStep(3);
      } catch (error) {
        setMessage("Failed to submit documents. Please try again.");
        setToastShow(true);
      }
    },
  });

  const handleDocumentUpload = (
    fieldName: keyof DocumentFormValues,
    file: File | null
  ) => {
    console.log("File selected:", file);
    if (!file) {
      documentFormik.setFieldValue(fieldName, null);
      documentFormik.setFieldTouched(fieldName, true);
      return;
    }

    // Validate file type and size
    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setMessage("Please upload a JPEG or PNG image");
      setToastShow(true);
      documentFormik.setFieldValue(fieldName, null);
      documentFormik.setFieldTouched(fieldName, true);
      return;
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      setMessage("File size too large (max 5MB allowed)");
      setToastShow(true);
      documentFormik.setFieldValue(fieldName, null);
      documentFormik.setFieldTouched(fieldName, true);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        documentFormik.setFieldValue(fieldName, reader.result as string);
        documentFormik.setFieldTouched(fieldName, true);
      }
    };
    reader.onerror = () => {
      setMessage("Error reading file. Please try again.");
      setToastShow(true);
      documentFormik.setFieldValue(fieldName, null);
      documentFormik.setFieldTouched(fieldName, true);
    };
    reader.readAsDataURL(file);
  };

  //  Verification aadhar card

  useEffect(() => {
    if (!showAadharCard) return;

    if (seconds > 0) {
      const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setDisabled(false); // Enable the resend button when countdown reaches 0
    }
  }, [seconds, showAadharCard]);

  const handleOtpChange = (index: number, value: string) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setOtpError("");

      // Auto focus to next input
      if (value && index < 3) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        if (nextInput) nextInput.focus();
      }

      // Auto submit when all fields are filled
      if (newOtp.every((val) => val !== "") && newOtp.join("").length === 4) {
        handleVerifyOTP();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOTP = async () => {
    // const otpValue = otp.join('');
    // if (otpValue.length !== 4) {
    //     setOtpError('Please enter a valid OTP');
    //     return;
    // }
    // try {
    //     const response = await verifyDriverOTP({
    //         phone_number: phoneNumber,
    //         otp: otpValue,
    //         role: 'driver'
    //     }) as any;
    //     if (response.status === true) {
    //         const token = response?.data?.token;
    //         if (token) {
    //             localStorage.setItem('token', token);
    //             setToastSuccessShow(true);
    //             setSuccessMessage('Login successful! Redirecting...');
    //             setTimeout(() => {
    //                 router.push('/driver-dashboard');
    //             }, 2000);
    //         }
    //     } else {
    //         setOtpError(response?.message || 'Invalid OTP. Please try again.');
    //     }
    // } catch (error) {
    //     setOtpError('Something went wrong. Please try again.');
    // }
  };

  const handleResendOTP = async () => {
    console.log("Resending OTP...");
    setSeconds(30);
    setDisabled(true);

    // try {
    //     const response = await resendDriverOTP({
    //         phone_number: phoneNumber,
    //         role: 'driver'
    //     }) as any;

    //     if (response.status === true) {
    //         setToastSuccessShow(true);
    //         setSuccessMessage(response.message);
    // setSeconds(30);
    //         setDisabled(true);
    //         setOtp(['', '', '', '']);
    //         setOtpError('');
    //     } else {
    //         setToastShow(true);
    //         setMessage(response?.message || 'Failed to resend OTP');
    //     }
    // } catch (error) {
    //     setToastShow(true);
    //     setMessage('Failed to resend OTP');
    // }
  };

  // step 3 code

  // Vehicle document upload handler
  const handleVehicleDocumentUpload = (
    fieldName: keyof VehicleFormValues,
    file: File | null
  ) => {
    console.log("Vehicle file selected:", file);
    if (!file) {
      vehicleFormik.setFieldValue(fieldName, null);
      vehicleFormik.setFieldTouched(fieldName, true);
      return;
    }

    // Validate file type and size
    const validTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setMessage("Please upload a JPEG, PNG, or PDF file");
      setToastShow(true);
      vehicleFormik.setFieldValue(fieldName, null);
      vehicleFormik.setFieldTouched(fieldName, true);
      return;
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      setMessage("File size too large (max 5MB allowed)");
      setToastShow(true);
      vehicleFormik.setFieldValue(fieldName, null);
      vehicleFormik.setFieldTouched(fieldName, true);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        vehicleFormik.setFieldValue(fieldName, reader.result as string);
        vehicleFormik.setFieldTouched(fieldName, true);

        // Update the displayed file name based on which field was updated
        switch (fieldName) {
          case "rcFrontDocument":
            setRcFrontName(file.name);
            break;
          case "rcBackDocument":
            setRcBackName(file.name);
            break;
          case "insuranceDocument":
            setInsuranceName(file.name);
            break;
          case "oneYearPermitDocument":
            setOneYearPermitName(file.name);
            break;
        }
      }
    };
    reader.onerror = () => {
      setMessage("Error reading file. Please try again.");
      setToastShow(true);
      vehicleFormik.setFieldValue(fieldName, null);
      vehicleFormik.setFieldTouched(fieldName, true);
    };
    reader.readAsDataURL(file);
  };

  // Vehicle Formik configuration
  const vehicleFormik = useFormik<VehicleFormValues>({
    initialValues: {
      vehicleRegNumber: "",
      vehicleRegDate: "",
      regValidityDate: "",
      rcFrontDocument: null,
      rcBackDocument: null,
      insuranceDocument: null,
      insuranceExpiryDate: "",
      oneYearPermitDocument: null,
      oneYearPermitExpiryDate: "",
    },

    validationSchema: Yup.object({
      vehicleRegNumber: Yup.string()
        .required("Vehicle registration number is required")
        .matches(/^[A-Za-z0-9]+$/, "Invalid registration number format"),
      vehicleRegDate: Yup.string()
        .required("Registration date is required")
        .matches(/^\d{2}-\d{2}-\d{4}$/, "Date must be in dd-mm-yyyy format"),
      regValidityDate: Yup.string()
        .required("Registration validity date is required")
        .matches(/^\d{2}-\d{2}-\d{4}$/, "Date must be in dd-mm-yyyy format")
        .test(
          "is-future",
          "Registration must be valid (future date)",
          function (value) {
            if (!value) return false;
            const [day, month, year] = value.split("-");
            const expiryDate = new Date(`${year}-${month}-${day}`);
            return expiryDate > new Date();
          }
        ),
      rcFrontDocument: Yup.mixed()
        .required("RC front document is required")
        .test("fileType", "Unsupported file type", (value) => {
          if (!value) return false;
          if (typeof value === "string") return value.startsWith("data:");
          return ["image/jpeg", "image/png", "application/pdf"].includes(
            (value as File).type
          );
        }),
      rcBackDocument: Yup.mixed()
        .required("RC back document is required")
        .test("fileType", "Unsupported file type", (value) => {
          if (!value) return false;
          if (typeof value === "string") return value.startsWith("data:");
          return ["image/jpeg", "image/png", "application/pdf"].includes(
            (value as File).type
          );
        }),
      insuranceDocument: Yup.mixed()
        .required("Insurance document is required")
        .test("fileType", "Unsupported file type", (value) => {
          if (!value) return false;
          if (typeof value === "string") return value.startsWith("data:");
          return ["image/jpeg", "image/png", "application/pdf"].includes(
            (value as File).type
          );
        }),
      insuranceExpiryDate: Yup.string()
        .required("Insurance expiry date is required")
        .matches(/^\d{2}-\d{2}-\d{4}$/, "Date must be in dd-mm-yyyy format")
        .test(
          "is-future",
          "Insurance must be valid (future date)",
          function (value) {
            if (!value) return false;
            const [day, month, year] = value.split("-");
            const expiryDate = new Date(`${year}-${month}-${day}`);
            return expiryDate > new Date();
          }
        ),
      oneYearPermitDocument: Yup.mixed()
        .required("1 Year Permit document is required")
        .test("fileType", "Unsupported file type", (value) => {
          if (!value) return false;
          if (typeof value === "string") return value.startsWith("data:");
          return ["image/jpeg", "image/png", "application/pdf"].includes(
            (value as File).type
          );
        }),
      oneYearPermitExpiryDate: Yup.string()
        .required("1 Year Permit expiry date is required")
        .matches(/^\d{2}-\d{2}-\d{4}$/, "Date must be in dd-mm-yyyy format")
        .test(
          "is-future",
          "1 Year Permit must be valid (future date)",
          function (value) {
            if (!value) return false;
            const [day, month, year] = value.split("-");
            const expiryDate = new Date(`${year}-${month}-${day}`);
            return expiryDate > new Date();
          }
        ),
    }),

    onSubmit: async (values) => {
      console.log("Vehicle submission data:", values);
      try {
        // Create FormData for file uploads
        const formData = new FormData();

        // Append all form values
        formData.append("vehicleRegNumber", values.vehicleRegNumber);
        formData.append("vehicleRegDate", values.vehicleRegDate);
        formData.append("regValidityDate", values.regValidityDate);
        formData.append("insuranceExpiryDate", values.insuranceExpiryDate);
        formData.append(
          "oneYearPermitExpiryDate",
          values.oneYearPermitExpiryDate
        );

        // Handle file uploads
        const appendFile = (fieldName: string, fileData: string | null) => {
          if (typeof fileData === "string" && fileData.startsWith("data:")) {
            const byteString = atob(fileData.split(",")[1]);
            const mimeString = fileData
              .split(",")[0]
              .split(":")[1]
              .split(";")[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeString });
            const file = new File(
              [blob],
              `${fieldName}.${mimeString.split("/")[1]}`,
              { type: mimeString }
            );
            formData.append(fieldName, file);
          }
        };

        appendFile("rcFrontDocument", values.rcFrontDocument);
        appendFile("rcBackDocument", values.rcBackDocument);
        appendFile("insuranceDocument", values.insuranceDocument);
        appendFile("oneYearPermitDocument", values.oneYearPermitDocument);

        // Submit to API
        console.log("Submitting vehicle data:", formData);
        const response = await fetch(`${API_URL}/api/`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          setCurrentStep(4); // Move to success screen
        } else {
          setMessage(data.message || "Vehicle registration failed");
          setToastShow(true);
        }
      } catch (error) {
        setMessage("An error occurred during vehicle registration");
        setToastShow(true);
        console.error("Vehicle registration error:", error);
      }
    },
  });

  return (
    <>
      <Head>
        <title>Driver Registration</title>
      </Head>

      <section className="delivery-register-form-section">
        <div className="delivery-register-logo-container">
          <Image
            src="/images/logo/d-logo.png"
            alt="logo"
            width={120}
            height={20}
          />
          <div
            className="register-back-arrow"
            onClick={() =>
              currentStep > 1
                ? setCurrentStep(currentStep - 1)
                : router.push("/")
            }
          >
            <Image
              src="/images/icons/back-arrow.svg"
              alt="logo"
              width={38}
              height={38}
            />
          </div>
        </div>

        <div className="delivery-register-step">
          {[1, 2, 3].map((item, index) => (
            <div
              key={index}
              className={`delivery-register-step-line ${
                index < currentStep ? "active" : ""
              }`}
            >
              {" "}
            </div>
          ))}
        </div>

        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <>
            <div className="delivery-register-info">
              <h1 className="delivery-register-title">Create Your Account</h1>
              <p className="delivery-register-description">
                Explore your ride by joining with TaxiSafar
              </p>
            </div>

            <form
              className="form"
              onSubmit={formik.handleSubmit}
              autoComplete="off"
            >
              <div className="trip-options">
                <div>
                  <div className="driver-photo-upload">
                    {imagePreview ? (
                      <div className="driver-photo-preview">
                        <Image
                          width={93}
                          height={93}
                          src={imagePreview}
                          alt="Driver preview"
                        />
                        <button
                          type="button"
                          className="retake-photo-btn"
                          onClick={handleCameraClick}
                        >
                          <Image
                            width={70}
                            height={70}
                            src="/images/icons/camera-icon.svg"
                            alt="Driver preview"
                          />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="camera-btn"
                        onClick={handleCameraClick}
                      >
                        <Image
                          src="/images/icons/camera.svg"
                          alt="Camera"
                          width={93}
                          height={93}
                        />
                      </button>
                    )}
                  </div>
                  {formik.touched.profilePhoto &&
                    formik.errors.profilePhoto && (
                      <p className="text-danger text-start mb-0 error-message">
                        {formik.errors.profilePhoto}
                      </p>
                    )}

                  <div className="mb-3">
                    <label htmlFor="name" className="delivery-form-level">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="delivery-form-control"
                      id="name"
                      name="name"
                      placeholder="Enter your full name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.name && formik.errors.name && (
                      <p className="text-danger text-start mb-0 error-message">
                        {formik.errors.name}
                      </p>
                    )}
                  </div>

                  <div className="mb-3 position-relative">
                    <label htmlFor="dob" className="delivery-form-level">
                      Date of Birth
                    </label>
                    <div className="input-group datepicker-container">
                      <DatePicker
                        selected={
                          formik.values.dob
                            ? new Date(
                                formik.values.dob.split("-").reverse().join("-")
                              )
                            : null
                        }
                        onChange={(date) => {
                          const formattedDate = date
                            ? format(date, "dd-MM-yyyy")
                            : "";
                          formik.setFieldValue("dob", formattedDate);
                        }}
                        dateFormat="dd-MM-yyyy"
                        placeholderText="dd-mm-yyyy"
                        className="delivery-form-control"
                        id="dob"
                        name="dob"
                        showYearDropdown
                        dropdownMode="select"
                        showPopperArrow={false}
                        popperPlacement="bottom-start"
                        minDate={new Date(1900, 0, 1)}
                        maxDate={new Date()}
                        peekNextMonth
                        showMonthDropdown
                        scrollableYearDropdown
                        yearDropdownItemNumber={100}
                      />
                      <div className="calendar-icon-container">
                        {/* <FaCalendarAlt className="calendar-icon" /> */}
                      </div>
                    </div>
                    {formik.touched.dob && formik.errors.dob && (
                      <p className="text-danger text-start mb-0 error-message">
                        {formik.errors.dob}
                      </p>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="mobile" className="delivery-form-level">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      className="delivery-form-control"
                      id="mobile"
                      name="mobile"
                      placeholder="Enter your number"
                      value={formik.values.mobile}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.mobile && formik.errors.mobile && (
                      <p className="text-danger text-start mb-0 error-message">
                        {formik.errors.mobile}
                      </p>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="delivery-form-level">
                      Email
                    </label>
                    <input
                      type="email"
                      className="delivery-form-control"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.email && formik.errors.email && (
                      <p className="text-danger text-start mb-0 error-message">
                        {formik.errors.email}
                      </p>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="city" className="delivery-form-level">
                      City
                    </label>
                    <select
                      className="delivery-form-control"
                      id="city"
                      name="city"
                      value={formik.values.city}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={isLoadingCities}
                    >
                      <option value="">Select your city</option>
                      {cities?.map((city) => (
                        <option key={city.id} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                    <p className="error-messages">{cityErrorMessage}</p>
                    {formik.touched.city && formik.errors.city && (
                      <p className="text-danger text-start mb-0 error-message">
                        {formik.errors.city}
                      </p>
                    )}
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="referral_id"
                      className="delivery-form-level"
                    >
                      Referral ID
                    </label>
                    <input
                      type="text"
                      className="delivery-form-control"
                      id="referral_id"
                      name="referral_id"
                      placeholder="Enter referral id"
                      value={formik.values.referral_id}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>

                  <div className="col-lg-12 col-md-12 col-sm-12 mt-3">
                    <button
                      type="submit"
                      className="taxisafar-theme-button driver-register-btn w-100"
                      disabled={formik.isSubmitting}
                    >
                      <span className="btn-title">
                        {formik.isSubmitting ? "Please Wait.." : "Next"}
                      </span>
                    </button>
                    <p className="error-messages">{errorMessage}</p>
                  </div>
                </div>
              </div>
            </form>

            <p className="driver-register-login-new-user">
              <span className="">Already have an account?</span>
              <Link href="/driver-login" className="ms-1">
                <span style={{ color: "#010005", fontSize: "18px" }}>
                  Sign in
                </span>
              </Link>
            </p>

            {/* Camera Modal */}
            {cameraActive && (
              <div className="camera-modal">
                <div className="camera-modal-content">
                  <div className="camera-header">
                    <h5>Take Your Photo</h5>
                    <button
                      type="button"
                      className="close-camera-btn"
                      onClick={closeCamera}
                    >
                      &times;
                    </button>
                  </div>
                  <div className="camera-preview">
                    <video ref={videoRef} autoPlay playsInline />
                  </div>
                  <button
                    type="button"
                    className="capture-btn"
                    onClick={capturePhoto}
                  >
                    Capture
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Step 2: Document Verification */}
        {currentStep === 2 && (
          <>
            {!showAadharCard ? (
              <>
                <div className="delivery-register-info">
                  <h1 className="delivery-register-title">Document Verify</h1>
                  <p className="delivery-register-description">
                    Upload your document to verify your profile.
                  </p>
                </div>

                <form
                  className="form"
                  onSubmit={documentFormik.handleSubmit}
                  autoComplete="off"
                >
                  {/* Aadhaar Card Section */}
                  <div className="document-section mb-4">
                    <h3 className="delivery-form-level">Aadhaar Card</h3>
                    <div className="document-upload-container">
                      <div className="document-preview">
                        {documentFormik?.values?.aadhaarDocument ? (
                          <div className="document-preview-container">
                            <div className="document-preview-image-container">
                              <img
                                src="/images/icons/file.svg"
                                alt="Aadhaar preview"
                                className="document-preview-image"
                              />
                              <span className="file-name">
                                {adharCardName
                                  ? adharCardName
                                  : "aadhaar_document.jpg"}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="change-document-btn"
                              onClick={() => {
                                documentFormik.setFieldValue(
                                  "aadhaarDocument",
                                  null
                                );
                                documentFormik.setFieldValue(
                                  "aadhaarNumber",
                                  ""
                                );
                              }}
                            >
                              <img
                                src="/images/icons/cancel.svg"
                                alt="Remove"
                                className="document-preview-image"
                              />
                            </button>
                          </div>
                        ) : (
                          <label className="document-upload-btn">
                            <input
                              type="file"
                              accept="image/*"
                              className="d-none"
                              onChange={(e) => {
                                handleDocumentUpload(
                                  "aadhaarDocument",
                                  e.target.files?.[0] || null
                                ),
                                  setAdharCardName(
                                    e.target.files?.[0]?.name || " "
                                  );
                              }}
                            />
                            <Image
                              width={24}
                              height={24}
                              src="/images/icons/upload-icon.svg"
                              alt="upload-icon"
                            />
                            <span className="upload-file-span">
                              {" "}
                              Upload Document
                            </span>
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      <label
                        htmlFor="aadhaarNumber"
                        className="delivery-form-level"
                      >
                        Aadhar Card No
                      </label>
                      <input
                        type="text"
                        className="delivery-form-control"
                        id="aadhaarNumber"
                        name="aadhaarNumber"
                        placeholder="Enter aadhar card no"
                        value={documentFormik.values.aadhaarNumber}
                        onChange={documentFormik.handleChange}
                        onBlur={documentFormik.handleBlur}
                      />
                      <button
                        onClick={() => setShowAadharCard(true)}
                        className="aadhar-card-verify-btn"
                      >
                        Verify
                      </button>
                      {documentFormik.touched.aadhaarNumber &&
                        documentFormik.errors.aadhaarNumber && (
                          <p className="text-danger text-start mb-0 error-message">
                            {documentFormik.errors.aadhaarNumber}
                          </p>
                        )}
                    </div>
                  </div>

                  {/* PAN Card Section - Updated to match Aadhaar design */}
                  <div className="document-section mb-4">
                    <h3 className="delivery-form-level">PAN Card</h3>
                    <div className="document-upload-container">
                      <div className="document-preview">
                        {documentFormik?.values?.panDocument ? (
                          <div className="document-preview-container">
                            <div className="document-preview-image-container">
                              <img
                                src="/images/icons/file.svg"
                                alt="PAN preview"
                                className="document-preview-image"
                              />
                              <span className="file-name">
                                {panCardName ? panCardName : "pan_document.jpg"}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="change-document-btn"
                              onClick={() => {
                                documentFormik.setFieldValue(
                                  "panDocument",
                                  null
                                );
                              }}
                            >
                              <img
                                src="/images/icons/cancel.svg"
                                alt="Remove"
                                className="document-preview-image"
                              />
                            </button>
                          </div>
                        ) : (
                          <label className="document-upload-btn">
                            <input
                              type="file"
                              accept="image/*"
                              className="d-none"
                              onChange={(e) => {
                                handleDocumentUpload(
                                  "panDocument",
                                  e.target.files?.[0] || null
                                ),
                                  setPanCardName(
                                    e.target.files?.[0]?.name || " "
                                  );
                              }}
                            />
                            <Image
                              width={24}
                              height={24}
                              src="/images/icons/upload-icon.svg"
                              alt="upload-icon"
                            />
                            <span className="upload-file-span">
                              {" "}
                              Upload Document
                            </span>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Driving License Section - Updated to match Aadhaar design */}
                  <div className="document-section mb-4">
                    <h3 className="delivery-form-level">Driving License</h3>
                    <div className="document-upload-container">
                      <div className="document-preview">
                        {documentFormik?.values?.drivingLicenseDocument ? (
                          <div className="document-preview-container">
                            <div className="document-preview-image-container">
                              <img
                                src="/images/icons/file.svg"
                                alt="License preview"
                                className="document-preview-image"
                              />
                              <span className="file-name">
                                {dLicenseCardName
                                  ? dLicenseCardName
                                  : "license_document.jpg"}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="change-document-btn"
                              onClick={() => {
                                documentFormik.setFieldValue(
                                  "drivingLicenseDocument",
                                  null
                                );
                                documentFormik.setFieldValue(
                                  "drivingLicenseNumber",
                                  ""
                                );
                                documentFormik.setFieldValue(
                                  "drivingLicenseExpiry",
                                  ""
                                );
                              }}
                            >
                              <img
                                src="/images/icons/cancel.svg"
                                alt="Remove"
                                className="document-preview-image"
                              />
                            </button>
                          </div>
                        ) : (
                          <label className="document-upload-btn">
                            <input
                              type="file"
                              accept="image/*"
                              className="d-none"
                              onChange={(e) => {
                                handleDocumentUpload(
                                  "drivingLicenseDocument",
                                  e.target.files?.[0] || null
                                ),
                                  setdLicenseCardName(
                                    e.target.files?.[0]?.name || " "
                                  );
                              }}
                            />
                            <Image
                              width={24}
                              height={24}
                              src="/images/icons/upload-icon.svg"
                              alt="upload-icon"
                            />
                            <span className="upload-file-span">
                              {" "}
                              Upload Document
                            </span>
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      <label
                        htmlFor="drivingLicenseNumber"
                        className="delivery-form-level"
                      >
                        Driving License Number
                      </label>
                      <input
                        type="text"
                        className="delivery-form-control"
                        id="drivingLicenseNumber"
                        name="drivingLicenseNumber"
                        placeholder="Enter your driving license number"
                        value={documentFormik.values.drivingLicenseNumber}
                        onChange={documentFormik.handleChange}
                        onBlur={documentFormik.handleBlur}
                      />
                      {documentFormik.touched.drivingLicenseNumber &&
                        documentFormik.errors.drivingLicenseNumber && (
                          <p className="text-danger text-start mb-0 error-message">
                            {documentFormik.errors.drivingLicenseNumber}
                          </p>
                        )}
                    </div>

                    <div className="mt-3 position-relative">
                      <label
                        htmlFor="drivingLicenseExpiry"
                        className="delivery-form-level"
                      >
                        Driving License Expiry Date
                      </label>
                      <div className="input-group datepicker-container">
                        <DatePicker
                          selected={
                            documentFormik.values.drivingLicenseExpiry
                              ? new Date(
                                  documentFormik.values.drivingLicenseExpiry
                                    .split("-")
                                    .reverse()
                                    .join("-")
                                )
                              : null
                          }
                          onChange={(date) => {
                            const formattedDate = date
                              ? format(date, "dd-MM-yyyy")
                              : "";
                            documentFormik.setFieldValue(
                              "drivingLicenseExpiry",
                              formattedDate
                            );
                          }}
                          dateFormat="dd-MM-yyyy"
                          placeholderText="dd-mm-yyyy"
                          className="delivery-form-control"
                          id="drivingLicenseExpiry"
                          name="drivingLicenseExpiry"
                          showYearDropdown
                          dropdownMode="select"
                          showPopperArrow={false}
                          popperPlacement="bottom-start"
                          peekNextMonth
                          showMonthDropdown
                          scrollableYearDropdown
                          yearDropdownItemNumber={100}
                        />
                        <div className="calendar-icon-container">
                          {/* <FaCalendarAlt className="calendar-icon" /> */}
                        </div>
                      </div>
                      {documentFormik.touched.drivingLicenseExpiry &&
                        documentFormik.errors.drivingLicenseExpiry && (
                          <p className="text-danger text-start mb-0 error-message">
                            {documentFormik.errors.drivingLicenseExpiry}
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="col-lg-12 col-md-12 col-sm-12 mt-3">
                    <button
                      type="submit"
                      className="taxisafar-theme-button driver-register-btn w-100"
                      disabled={documentFormik.isSubmitting}
                    >
                      <span className="btn-title">
                        {documentFormik.isSubmitting ? "Verifying..." : "Next"}
                      </span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="otp-verification-section">
                  <h2 className="otp-title">Verify Aadhaar Card</h2>
                  <p className="otp-description">
                    OTP has been sent to registered mobile number{" "}
                    <span> {documentFormik.values.aadhaarNumber}</span>
                  </p>

                  <div className="otp-verification-container">
                    <div className="otp-input-container">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-input-${index}`}
                          type="text"
                          className="otp-input"
                          placeholder="0"
                          value={digit}
                          onChange={(e) =>
                            handleOtpChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          maxLength={1}
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>
                    {otpError && (
                      <p className="text-danger otp-error-message">
                        {otpError}
                      </p>
                    )}
                  </div>

                  <button
                    className="taxisafar-theme-button verify-btn w-100 mt-3"
                    onClick={handleVerifyOTP}
                    disabled={otp.join("").length !== 4}
                  >
                    Verify
                  </button>

                  <div className="resend-otp mt-3">
                    <p className="resend-text text-center">
                      {" "}
                      <button
                        type="button"
                        className="resend-button"
                        onClick={handleResendOTP}
                        disabled={disabled}
                      >
                        {disabled ? (
                          <span
                            style={{ color: "#01000599", fontWeight: "400" }}
                          >
                            {" "}
                            Resend again in{" "}
                            <span
                              style={{ color: "#010005", fontWeight: "600" }}
                            >
                              00:{seconds}
                            </span>{" "}
                          </span>
                        ) : (
                          "Resend OTP"
                        )}
                      </button>
                    </p>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Step 3: Vehicle Registration */}

        {currentStep === 3 && (
          <>
            <div className="delivery-register-info">
              <h1 className="delivery-register-title">Vehicle Registration</h1>
              <p className="delivery-register-description">
                Upload your vehicle documents for verification
              </p>
            </div>

            <form
              className="form"
              onSubmit={vehicleFormik.handleSubmit}
              autoComplete="off"
            >
              {/* Vehicle Registration Section */}
              <div className="document-section mb-4">
                {/* Vehicle Registration Number */}
                <div className="mb-3">
                  <label
                    htmlFor="vehicleRegNumber"
                    className="delivery-form-level"
                  >
                    Vehicle Registration *
                  </label>
                  <input
                    type="text"
                    className="delivery-form-control"
                    id="vehicleRegNumber"
                    name="vehicleRegNumber"
                    placeholder="DL01AB1234"
                    value={vehicleFormik.values.vehicleRegNumber}
                    onChange={vehicleFormik.handleChange}
                    onBlur={vehicleFormik.handleBlur}
                  />
                  {vehicleFormik.touched.vehicleRegNumber &&
                    vehicleFormik.errors.vehicleRegNumber && (
                      <p className="text-danger text-start mb-0 error-message">
                        {vehicleFormik.errors.vehicleRegNumber}
                      </p>
                    )}
                </div>

                {/* Date of Registration */}
                <div className="mb-3 position-relative">
                  <label
                    htmlFor="vehicleRegDate"
                    className="delivery-form-level"
                  >
                    Date of Registration *
                  </label>
                  <div className="input-group datepicker-container">
                    <DatePicker
                      selected={
                        vehicleFormik.values.vehicleRegDate
                          ? new Date(
                              vehicleFormik.values.vehicleRegDate
                                .split("-")
                                .reverse()
                                .join("-")
                            )
                          : null
                      }
                      onChange={(date) => {
                        const formattedDate = date
                          ? format(date, "dd-MM-yyyy")
                          : "";
                        vehicleFormik.setFieldValue(
                          "vehicleRegDate",
                          formattedDate
                        );
                      }}
                      dateFormat="dd-MM-yyyy"
                      placeholderText="dd-mm-yyyy"
                      className="delivery-form-control"
                      id="vehicleRegDate"
                      name="vehicleRegDate"
                      showYearDropdown
                      dropdownMode="select"
                      maxDate={new Date()}
                    />
                    <div className="calendar-icon-container">
                      {/* <FaCalendarAlt className="calendar-icon" /> */}
                    </div>
                  </div>
                  {vehicleFormik.touched.vehicleRegDate &&
                    vehicleFormik.errors.vehicleRegDate && (
                      <p className="text-danger text-start mb-0 error-message">
                        {vehicleFormik.errors.vehicleRegDate}
                      </p>
                    )}
                </div>

                {/* Registration Validity Date */}
                <div className="mb-3 position-relative">
                  <label
                    htmlFor="regValidityDate"
                    className="delivery-form-level"
                  >
                    Registration Validity Date *
                  </label>
                  <div className="input-group datepicker-container">
                    <DatePicker
                      selected={
                        vehicleFormik.values.regValidityDate
                          ? new Date(
                              vehicleFormik.values.regValidityDate
                                .split("-")
                                .reverse()
                                .join("-")
                            )
                          : null
                      }
                      onChange={(date) => {
                        const formattedDate = date
                          ? format(date, "dd-MM-yyyy")
                          : "";
                        vehicleFormik.setFieldValue(
                          "regValidityDate",
                          formattedDate
                        );
                      }}
                      dateFormat="dd-MM-yyyy"
                      placeholderText="dd-mm-yyyy"
                      className="delivery-form-control"
                      id="regValidityDate"
                      name="regValidityDate"
                      showYearDropdown
                      dropdownMode="select"
                      minDate={new Date()}
                    />
                    <div className="calendar-icon-container">
                      {/* <FaCalendarAlt className="calendar-icon" /> */}
                    </div>
                  </div>
                  {vehicleFormik.touched.regValidityDate &&
                    vehicleFormik.errors.regValidityDate && (
                      <p className="text-danger text-start mb-0 error-message">
                        {vehicleFormik.errors.regValidityDate}
                      </p>
                    )}
                </div>
              </div>

              {/* RC Book Documents */}
              <div className="document-section mb-4">
                <h3 className="delivery-form-level">RC Book Documents</h3>

                {/* RC Front */}
                <div className="mb-3">
                  <label className="delivery-form-level">
                    Front Side of RC Book *
                  </label>
                  <div className="document-upload-container">
                    {vehicleFormik.values.rcFrontDocument ? (
                      <div className="document-preview-container">
                        <div className="document-preview-image-container">
                          <img
                            src="/images/icons/file.svg"
                            alt="RC Front preview"
                            className="document-preview-image"
                          />
                          <span className="file-name">
                            {rcFrontName || "rc_front.jpg"}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="change-document-btn"
                          onClick={() => {
                            vehicleFormik.setFieldValue(
                              "rcFrontDocument",
                              null
                            );
                            setRcFrontName("");
                          }}
                        >
                          <img
                            src="/images/icons/cancel.svg"
                            alt="Remove"
                            className="document-preview-image"
                          />
                        </button>
                      </div>
                    ) : (
                      <label className="document-upload-btn">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="d-none"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleVehicleDocumentUpload(
                                "rcFrontDocument",
                                file
                              );
                              setRcFrontName(file.name);
                            }
                          }}
                        />
                        <Image
                          width={24}
                          height={24}
                          src="/images/icons/upload-icon.svg"
                          alt="upload-icon"
                        />
                        <span className="upload-file-span">
                          {" "}
                          Upload Front Side
                        </span>
                      </label>
                    )}
                  </div>
                  {vehicleFormik.touched.rcFrontDocument &&
                    vehicleFormik.errors.rcFrontDocument && (
                      <p className="text-danger text-start mb-0 error-message">
                        {vehicleFormik.errors.rcFrontDocument}
                      </p>
                    )}
                </div>

                {/* RC Back */}
                <div className="mb-3">
                  <label className="delivery-form-level">
                    Back Side of RC Book *
                  </label>
                  <div className="document-upload-container">
                    {vehicleFormik.values.rcBackDocument ? (
                      <div className="document-preview-container">
                        <div className="document-preview-image-container">
                          <img
                            src="/images/icons/file.svg"
                            alt="RC Back preview"
                            className="document-preview-image"
                          />
                          <span className="file-name">
                            {rcBackName || "rc_back.jpg"}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="change-document-btn"
                          onClick={() => {
                            vehicleFormik.setFieldValue("rcBackDocument", null);
                            setRcBackName("");
                          }}
                        >
                          <img
                            src="/images/icons/cancel.svg"
                            alt="Remove"
                            className="document-preview-image"
                          />
                        </button>
                      </div>
                    ) : (
                      <label className="document-upload-btn">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="d-none"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleVehicleDocumentUpload(
                                "rcBackDocument",
                                file
                              );
                              setRcBackName(file.name);
                            }
                          }}
                        />
                        <Image
                          width={24}
                          height={24}
                          src="/images/icons/upload-icon.svg"
                          alt="upload-icon"
                        />
                        <span className="upload-file-span">
                          {" "}
                          Upload Back Side
                        </span>
                      </label>
                    )}
                  </div>
                  {vehicleFormik.touched.rcBackDocument &&
                    vehicleFormik.errors.rcBackDocument && (
                      <p className="text-danger text-start mb-0 error-message">
                        {vehicleFormik.errors.rcBackDocument}
                      </p>
                    )}
                </div>
              </div>

              {/* Insurance Section */}
              <div className="document-section mb-4">
                <h3 className="delivery-form-level">Insurance Details</h3>

                {/* Insurance Document */}
                <div className="mb-3">
                  <label className="delivery-form-level">
                    Insurance Document *
                  </label>
                  <div className="document-upload-container">
                    {vehicleFormik.values.insuranceDocument ? (
                      <div className="document-preview-container">
                        <div className="document-preview-image-container">
                          <img
                            src="/images/icons/file.svg"
                            alt="Insurance preview"
                            className="document-preview-image"
                          />
                          <span className="file-name">
                            {insuranceName || "insurance.jpg"}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="change-document-btn"
                          onClick={() => {
                            vehicleFormik.setFieldValue(
                              "insuranceDocument",
                              null
                            );
                            setInsuranceName("");
                          }}
                        >
                          <img
                            src="/images/icons/cancel.svg"
                            alt="Remove"
                            className="document-preview-image"
                          />
                        </button>
                      </div>
                    ) : (
                      <label className="document-upload-btn">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="d-none"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleVehicleDocumentUpload(
                                "insuranceDocument",
                                file
                              );
                              setInsuranceName(file.name);
                            }
                          }}
                        />
                        <Image
                          width={24}
                          height={24}
                          src="/images/icons/upload-icon.svg"
                          alt="upload-icon"
                        />
                        <span className="upload-file-span">
                          {" "}
                          Upload Insurance
                        </span>
                      </label>
                    )}
                  </div>
                  {vehicleFormik.touched.insuranceDocument &&
                    vehicleFormik.errors.insuranceDocument && (
                      <p className="text-danger text-start mb-0 error-message">
                        {vehicleFormik.errors.insuranceDocument}
                      </p>
                    )}
                </div>

                {/* Insurance Expiry Date */}
                <div className="mb-3 position-relative">
                  <label
                    htmlFor="insuranceExpiryDate"
                    className="delivery-form-level"
                  >
                    Insurance Expiry Date *
                  </label>
                  <div className="input-group datepicker-container">
                    <DatePicker
                      selected={
                        vehicleFormik.values.insuranceExpiryDate
                          ? new Date(
                              vehicleFormik.values.insuranceExpiryDate
                                .split("-")
                                .reverse()
                                .join("-")
                            )
                          : null
                      }
                      onChange={(date) => {
                        const formattedDate = date
                          ? format(date, "dd-MM-yyyy")
                          : "";
                        vehicleFormik.setFieldValue(
                          "insuranceExpiryDate",
                          formattedDate
                        );
                      }}
                      dateFormat="dd-MM-yyyy"
                      placeholderText="dd-mm-yyyy"
                      className="delivery-form-control"
                      id="insuranceExpiryDate"
                      name="insuranceExpiryDate"
                      showYearDropdown
                      dropdownMode="select"
                      minDate={new Date()}
                    />
                    <div className="calendar-icon-container">
                      {/* <FaCalendarAlt className="calendar-icon" /> */}
                    </div>
                  </div>
                  {vehicleFormik.touched.insuranceExpiryDate &&
                    vehicleFormik.errors.insuranceExpiryDate && (
                      <p className="text-danger text-start mb-0 error-message">
                        {vehicleFormik.errors.insuranceExpiryDate}
                      </p>
                    )}
                </div>
              </div>

              {/* 1 Year Permit Section */}
              <div className="document-section mb-4">
                <h3 className="delivery-form-level">1 Year Permit</h3>

                {/* Permit Document */}
                <div className="mb-3">
                  <label className="delivery-form-level">
                    Permit Document *
                  </label>
                  <div className="document-upload-container">
                    {vehicleFormik.values.oneYearPermitDocument ? (
                      <div className="document-preview-container">
                        <div className="document-preview-image-container">
                          <img
                            src="/images/icons/file.svg"
                            alt="Permit preview"
                            className="document-preview-image"
                          />
                          <span className="file-name">
                            {oneYearPermitName || "permit.jpg"}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="change-document-btn"
                          onClick={() => {
                            vehicleFormik.setFieldValue(
                              "oneYearPermitDocument",
                              null
                            );
                            setOneYearPermitName("");
                          }}
                        >
                          <img
                            src="/images/icons/cancel.svg"
                            alt="Remove"
                            className="document-preview-image"
                          />
                        </button>
                      </div>
                    ) : (
                      <label className="document-upload-btn">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="d-none"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleVehicleDocumentUpload(
                                "oneYearPermitDocument",
                                file
                              );
                              setOneYearPermitName(file.name);
                            }
                          }}
                        />
                        <Image
                          width={24}
                          height={24}
                          src="/images/icons/upload-icon.svg"
                          alt="upload-icon"
                        />
                        <span className="upload-file-span"> Upload Permit</span>
                      </label>
                    )}
                  </div>
                  {vehicleFormik.touched.oneYearPermitDocument &&
                    vehicleFormik.errors.oneYearPermitDocument && (
                      <p className="text-danger text-start mb-0 error-message">
                        {vehicleFormik.errors.oneYearPermitDocument}
                      </p>
                    )}
                </div>

                {/* Permit Expiry Date */}
                <div className="mb-3 position-relative">
                  <label
                    htmlFor="oneYearPermitExpiryDate"
                    className="delivery-form-level"
                  >
                    Permit Expiry Date *
                  </label>
                  <div className="input-group datepicker-container">
                    <DatePicker
                      selected={
                        vehicleFormik.values.oneYearPermitExpiryDate
                          ? new Date(
                              vehicleFormik.values.oneYearPermitExpiryDate
                                .split("-")
                                .reverse()
                                .join("-")
                            )
                          : null
                      }
                      onChange={(date) => {
                        const formattedDate = date
                          ? format(date, "dd-MM-yyyy")
                          : "";
                        vehicleFormik.setFieldValue(
                          "oneYearPermitExpiryDate",
                          formattedDate
                        );
                      }}
                      dateFormat="dd-MM-yyyy"
                      placeholderText="dd-mm-yyyy"
                      className="delivery-form-control"
                      id="oneYearPermitExpiryDate"
                      name="oneYearPermitExpiryDate"
                      showYearDropdown
                      dropdownMode="select"
                      minDate={new Date()}
                    />
                    <div className="calendar-icon-container">
                      {/* <FaCalendarAlt className="calendar-icon" /> */}
                    </div>
                  </div>
                  {vehicleFormik.touched.oneYearPermitExpiryDate &&
                    vehicleFormik.errors.oneYearPermitExpiryDate && (
                      <p className="text-danger text-start mb-0 error-message">
                        {vehicleFormik.errors.oneYearPermitExpiryDate}
                      </p>
                    )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="col-lg-12 col-md-12 col-sm-12 mt-3">
                <button
                  type="submit"
                  className="taxisafar-theme-button driver-register-btn w-100"
                  disabled={
                    !vehicleFormik.isValid || vehicleFormik.isSubmitting
                  }
                >
                  <span className="btn-title">
                    {vehicleFormik.isSubmitting
                      ? "Submitting..."
                      : "Complete Registration"}
                  </span>
                </button>
                {vehicleErrorMessage && (
                  <p className="text-danger text-center mt-2">
                    {vehicleErrorMessage}
                  </p>
                )}
              </div>
            </form>
          </>
        )}
        <ToastContainer position="top-end" className="p-3">
          <Toast
            onClose={() => setToastShow(false)}
            show={toastShow}
            delay={3000}
            autohide
            bg="danger"
          >
            <Toast.Body className="text-white">{message}</Toast.Body>
          </Toast>
        </ToastContainer>
      </section>
    </>
  );
}
