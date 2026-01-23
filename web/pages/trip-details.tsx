import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Col, Row, Table } from "react-bootstrap";
import { getTripById } from "./api/trip";

const TripDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  console.log('id',id); // This will log the trip ID to the console

  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
    }
  }, []);

  const [dataById, setDataById] = useState(null) as any;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getTripById(id, token);
        if (response.status == true) {
          setDataById(response?.data);
        } else {
          //   setBookingTransaction(null);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [id]);
  console.log("DAta byId", dataById);

  function formatDate(inputDate: Date) {
    const date = new Date(inputDate);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    // Format day
    const day = date.getDate();

    // Format month
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[date.getMonth()];

    // Format year (last two digits)
    const year = date.getFullYear().toString().slice(-2);

    // Format time
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    // Combine all parts
    return `${day} ${month}, ${year} • ${hours}:${minutes} ${ampm}`;
  }

  const placesStr = dataById?.places;
  const placeJSON = dataById ? JSON.parse(dataById?.places) : [];
  const labelStart = placesStr ? JSON.parse(placesStr)?.[0]?.label ?? "" : "";
  const labelEnd = placesStr ? JSON.parse(placesStr)?.at(-1)?.label ?? "" : "";

  console.log("placeJSON", placeJSON)

  // const startTripOtp =
  //   dataById?.otps[0]?.otp_type == "start_trip"
  //     ? dataById?.otps[0]?.otp.split("")
  //     : "";
  // const endTripOtp =
  //   dataById?.otps[0]?.otp_type == "end_trip"
  //     ? dataById?.otps[0]?.otp.split("")
  //     : "";
  // console.log(startTripOtp);

  const tripPin =
    dataById?.trip_status == "reserved" ? 124456 : 67890;
  console.log("dataById",dataById)

  const handleDownload = async (id: any) => {
    try {
      console.log("Download");
      const response = await fetch(
        `${process.env.API_URL}/api/transaction/pdf/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/pdf",
          },
        }
      );
      console.log(response);
      if (!response.ok) {
        throw new Error("Failed to fetch the PDF");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "receipt.pdf";
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading the PDF:", error);
    }
  };
  const statusColorMap: Record<string, string> = {
    reserved: "text-warning",       // blue
    active: "text-primary",      // blue (or adjust)
    completed: "text-success",   // green
    cancel: "text-danger",    // red
  };

  return (
    <div className="">
      <div
        className="container booking_page pt-2 pb-4"
        style={{ marginTop: "85px" }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <button className="bg-light"
            style={{
              border: '0px',
              borderRadius: '100%',
              height: '40px',
              width: '40px',
          }}>
            <img
              src="../images/icons/left-arrow.png"
              width={"24px"}
              height={"24px"}
              onClick={() => router.push(`booking`)}
            />
          </button>
          <h2 className="my-3 text-center text-dark">Trip Details</h2>
          <img
            src="../images/icons/question-mark.svg"
            width={"24px"}
            height={"24px"}
          />
        </div>

        <div className="d-flex justify-content-center align-items-center py-2">
          <img
            src="../images/resource/map.png"
            width={"343px"}
            height={"160px"}
          />
        </div>

        <div className="card my-2 border-0">
          <div className="card-body rounded  ">
            <div className="d-flex justify-content-between">
              <div className="car-box border px-2 py-1 rounded">
                <img
                  src="../images/icons/booking-car.png"
                  width={"40px"}
                  height={"40px"}
                />
              </div>
              {dataById?.id &&(
                  <>
                  <div className="text-start mt-1">
                    <h6 className="mb-0">Booking Id : {`TS${String(dataById?.id).padStart(3, '0')}`}</h6>
                    <p className="mb-0" style={{ color: "#010005", fontSize: '13px' }}>
                      {formatDate(dataById?.departure_date)}
                      {/* {dataById?.return_date  ? '  - To -  ' +formatDate(dataById?.return_date): ''}  */}
                    </p>
                    {dataById?.return_date &&<p className="mb-0" style={{ color: "#010005", fontSize: '13px' ,lineHeight:'6px'}}>
                      {formatDate(dataById?.return_date)}
                    </p>}
                  </div>
                  <div className="text-end mt-1">
                    <h6 className="mb-0">
                      ₹{dataById?.Transactions[0]?.original_amount}
                    </h6>
                    {dataById?.trip_status &&(
                      <p
                      className={`${statusColorMap[dataById?.trip_status] || "text-dark"} mb-0`}
                      style={{ fontSize: "14px" }}
                    >
                      • {dataById?.trip_status.charAt(0).toUpperCase() + dataById?.trip_status.slice(1).toLowerCase()}
                    </p>)}
                    {/* <p className="text-warning mb-0"> • Booked</p> */}
                  </div>
                  </>
              )}
            
            </div>
          </div>
        </div>

        {/* driver details  */}

        {/* <div className="card my-4 p-4 border-0 rounded-4 d-none">
          <h6 className="driver-title" style={{ color: "#0100054D" }}>
            Driver Details
          </h6>
          <div className="mt-4">
            <div className="d-flex item-center  align-items-center justify-content-between">
              <div className="text-start  d-flex item-center  align-items-center justify-content-between gap-3">
                <img
                  src="../images/user/driver-profile.png"
                  width={"38px"}
                  height={"38px"}
                />
                <div>
                  <h4 className="mb-0 driver-name ">Dharmendra Thakor</h4>
                  <p
                    className="mb-0 d-flex item-center align-items-center gap-1"
                    style={{ color: "#010005" }}
                  >
                    <img
                      src="../images/icons/star.svg"
                      width={"12px"}
                      height={"12px"}
                    />{" "}
                    4.8 (127)
                  </p>
                </div>
              </div>
              <div className="text-start  d-flex item-center  align-items-center justify-content-between gap-3">
                <img
                  src="../images/icons/whatsapp-log.svg"
                  width={"38px"}
                  height={"38px"}
                />
                <img
                  src="../images/icons/chat.svg"
                  width={"38px"}
                  height={"38px"}
                />
              </div>
            </div>

            <div className="d-flex item-center  align-items-center justify-content-between mt-4">
              <p
                className="mb-0 d-flex item-center align-items-center gap-1  driver-name "
                style={{ color: "#01000599" }}
              >
                Trip Start Date{" "}
              </p>

              <div className="text-start  d-flex item-center  align-items-center justify-content-between gap-3">
                <h4
                  className="mb-0 driver-name font-medium "
                  style={{ color: "#010005" }}
                >
                  {formatDate(dataById?.departure_date)}
                </h4>
              </div>
            </div>

            <div className="end-trip-pin d-flex item-center  align-items-center justify-content-between mt-4">
              <p
                className="mb-0 ms-1 d-flex item-center align-items-center gap-1  fs-6"
                style={{ color: "#010005" }}
              >
                {dataById?.trip_status == "reserved"
                  ? "Start Trip PIN"
                  : "End Trip PIN"}
              </p>

              <div
                className="text-start  d-flex item-center  align-items-center justify-content-between "
                style={{ gap: "6px" }}
              >
                 {tripPin
                  ? tripPin?.map((n: any, index: any) => (
                      <h4
                        className="mb-0 driver-name "
                        style={{ color: "#010005" }}
                        key={index}
                      >
                        {n}
                      </h4>
                    ))
                  : ""} 
              </div>
            </div>
          </div>
        </div> */}

        <div className="card p-4 border-0 rounded-4 ">
          <div className="">
            <div className="d-flex item-center  align-items-center justify-content-between">
              <div className="text-start  ">
                <h4
                  className=" fs-6 font-medium  mb-2"
                  style={{ color: "#01000599" }}
                >
                  {dataById?.Vehicle.title}
                </h4>

                <h4
                  className="mb-0   fs-6 font-medium "
                  style={{ color: "#010005" }}
                >
                  {/* DL 1A B2345 */}
                </h4>
              </div>
              <div className="text-start  d-flex item-center  align-items-center justify-content-between gap-3">
                <img
                  src="../images/resource/cars.png"
                  width={"110px"}
                  height={"44px"}
                />
              </div>
            </div>

            {/* <div className="d-flex item-center relative bookingtype-hr  align-items-center justify-content-between mt-4">
              <div className="bookingtype ">
                <button className="badge active">One Way Trip</button>
              </div>
            </div> */}
            <Col xs={12} md={12} className="d-md-inline mt-2">
              {/* <div className="joint_line mx-md-4 mt-3 d-flex justify-content-between"> */}
              <div
                className="bookingtype"
                style={{
                  position: "relative",
                  zIndex: "9",
                  width: "auto",
                  textAlign: "center",
                  top: "25px",
                  marginTop: "-25px",
                }}
              >
                {dataById && dataById.trip_type && (
                <button className="badge active">
                  {dataById.trip_type === "oneWay" && (
                    <p className="mb-0 custom-vicky-value">One Way</p>
                  )}
                  {dataById.trip_type === "roundTrip" && (
                    <p className="mb-0 custom-vicky-value">
                      Round Trip
                    </p>
                  )}
                  {dataById.trip_type === "local" && (
                    <p className="mb-0 custom-vicky-value">
                      Local Rental
                    </p>
                  )}
                  {dataById.trip_type === "airport" && (
                    <p className="mb-0 custom-vicky-value">
                      Airport Transfer
                    </p>
                  )}
                  
                </button>
                
              )} 
                {dataById?.dham_category_name  && (
                  <button className="badge active">
                    <p className="mb-0 custom-vicky-value">
                      {dataById?.dham_category_name}
                    </p>
                  </button>)}
              </div>
              <hr className="mx-3" />

              {/* </div> */}
            </Col>
            {/* <div className=" d-flex item-center  align-items-center  mt-4 gap-3">
              <img
                src="../images/icons/location-s-e.png"
                width={"24px"}
                height={"100px"}
              />

              <div className="d-flex flex-column  justify-content-between  gap-4   ">
                <p
                  className=" fs-6 font-medium mb-0 "
                  style={{ color: "#01000599" }}
                >
                  {labelStart}
                  <br /> Delhi
                </p>

                <p
                  className="   fs-6 font-medium "
                  style={{ color: "#010005" }}
                >
                  {labelEnd}
                  <br /> Delhi
                </p>
              </div>
            </div> */}
            {placeJSON.map((obj: any, index: any) => (
              <div
                className="taxisafar-itinerary g-2 align-items-center d-flex"
                key={index}
              >
                <div className="timeline-column position-relative d-flex justify-content-start">
                  <div className="timeline-dotline">
                    <div className="dot"></div>

                    {/* Show dashed line for all except the last dot */}
                    {index !== placeJSON.length - 1 && (
                      <div className="vertical-dashed-line"></div>
                    )}
                  </div>
                </div>

                <div className="w-100 ms-3">
                  <div className="trip_places my-2 d-flex p-3 align-items-center">
                    {index === 0 && (
                      <img
                        src="./images/icons/pickup.png"
                        className="me-3"
                        height="24px"
                        width="24px"
                      />
                    )}
                    {!(index === 0 || index === placeJSON.length - 1) && (
                      <img
                        src="./images/icons/stops.png"
                        className="me-3"
                        height="24px"
                        width="24px"
                      />
                    )}
                    {index === placeJSON.length - 1 && (
                      <img
                        src="./images/icons/destination.png"
                        className="me-3"
                        height="24px"
                        width="24px"
                      />
                    )}
                    <h6 className="mb-0 heading">{obj?.label || obj?.name}</h6>
                  </div>
                </div>
              </div>
            ))}

            <div className=" d-flex flex-column gap-3 trip-distance-container mt-3">
              {dataById?.distance && 
                <div className=" d-flex justify-content-between trip-distance  pb-3 ">
                  <p
                    className=" driver-name mb-0 "
                    style={{ color: "#01000599" }}
                  >
                    Trip Distance
                  </p>

                  <p
                    className="  driver-name font-medium mb-0 "
                    style={{ color: "#010005" }}
                  >
                    {dataById?.distance}
                  </p>
                </div>
              }

              {/* <div className=" d-flex justify-content-between trip-distance    pb-3 ">
                <p
                  className=" driver-name  mb-0 "
                  style={{ color: "#01000599" }}
                >
                  Trip Duration
                </p>

                <p
                  className="  driver-name font-medium  mb-0 "
                  style={{ color: "#010005" }}
                >
                  1.25 hours
                </p>
              </div> */}
              {dataById?.extra_km &&
              <div className=" d-flex justify-content-between trip-distance   pb-3">
                <p
                  className=" driver-name  mb-0 "
                  style={{ color: "#01000599" }}
                >
                  Extra km Charges
                </p>

                <p
                  className="  driver-name font-medium mb-0  "
                  style={{ color: "#010005" }}
                >
                    ₹{dataById?.extra_km} / km
                </p>
              </div>
              }

              {dataById?.additional_time_charge  && 
              <div className=" d-flex justify-content-between trip-distance   pb-3">
                <p
                  className=" driver-name  mb-0 "
                  style={{ color: "#01000599" }}
                >
                  Extra Time Charges
                </p>

                <p
                  className="  driver-name font-medium mb-0  "
                  style={{ color: "#010005" }}
                >
                  ₹{dataById?.additional_time_charge} / Hour
          
                </p>
              </div>
              }
              <div className=" d-flex justify-content-between trip-distance   pb-3">
                <p
                  className=" driver-name  mb-0 "
                  style={{ color: "#01000599" }}
                >
                  Tolls & Inter State Charges
                </p>

                <p
                  className="  driver-name font-medium mb-0  "
                  style={{ color: "#010005" }}
                >
                  {dataById?.toll_tax ? "Included" : "Not Included" } 
                </p>
              </div>

              <div className=" d-flex justify-content-between   ">
                <p
                  className="driver-name  mb-0 "
                  style={{ color: "#01000599" }}
                >
                  Parking Charges
                </p>

                <p
                  className="  driver-name font-medium mb-0  "
                  style={{ color: "#010005" }}
                >
                  {dataById?.parking_charges ? "Included" : "Not Included"} 
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-4 border-0 mt-4 rounded-4 ">
          <div className="">
            <h6 className=" font-semibold  mb-3" style={{ color: "#01000599" }}>
              Bill Details
            </h6>

            <div className=" d-flex flex-column gap-3 ">
              <div className=" d-flex justify-content-between   ">
                <p
                  className=" driver-name mb-0 "
                  style={{ color: "#01000599" }}
                >
                  Trip Distance
                </p>

                <p
                  className="  driver-name font-medium mb-0 "
                  style={{ color: "#010005" }}
                >
                  {dataById?.distance}
                </p>
              </div>

              {/* <div className=" d-flex justify-content-between  ">
                <p
                  className=" driver-name  mb-0 "
                  style={{ color: "#01000599" }}
                >
                  Trip Duration
                </p>

                <p
                  className="  driver-name font-medium  mb-0 "
                  style={{ color: "#010005" }}
                >
                  1.25 hours
                </p>
              </div> */}
              <div className=" d-flex justify-content-between ">
                <p
                  className=" driver-name  mb-0 "
                  style={{ color: "#01000599" }}
                >
                  Extra km Charges
                </p>

                <p
                  className="  driver-name font-medium mb-0  "
                  style={{ color: "#010005" }}
                >
                  ₹{dataById?.extra_km} / km
                </p>
              </div>

              <div className="end-trip-pin d-flex item-center  align-items-center justify-content-between ">
                <p
                  className="mb-0  font-semibold  fs-6"
                  style={{ color: "#010005" }}
                >
                  Total Bill{" "}
                </p>

                <p
                  className=" fs-6 font-semibold mb-0  "
                  style={{ color: "#010005" }}
                >
                  ₹{dataById?.Transactions[0]?.original_amount}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="card p-4   rounded-4 payment-method-card  "
          style={{ borderTop: "2px dashed #ccc" }}
        >
          <div className="">
            <h6 className=" font-semibold  mb-3" style={{ color: "#01000599" }}>
              Payment Method
            </h6>

            <div className=" d-flex flex-column gap-3 ">
              <div className=" d-flex justify-content-between   ">
                <p
                  className=" driver-name mb-0 "
                  style={{ color: "#01000599" }}
                >
                  Payment ID
                </p>

                <p
                  className="  driver-name font-medium mb-0 "
                  style={{ color: "#010005" }}
                >
                  {dataById?.Transactions[0]?.payment_id}
                </p>
              </div>

              <div className=" d-flex justify-content-between  ">
                <p
                  className=" driver-name  mb-0 "
                  style={{ color: "#01000599" }}
                >
                  Mode of Payment
                </p>

                <p
                  className="  driver-name font-medium  mb-0 text-capitalize"
                  style={{ color: "#010005" }}
                >
                  {dataById?.Transactions[0]?.method}
                </p>
              </div>
              <div className=" d-flex justify-content-between  ">
                <p
                  className=" driver-name  mb-0 "
                  style={{ color: "#01000599" }}
                >
                 Advance Amount
                </p>

                <p
                  className="  driver-name font-medium  mb-0 text-capitalize"
                  style={{ color: "#010005" }}
                >
                  ₹ {dataById?.Transactions[0]?.paid_amount}
                </p>
              </div>


              <div className=" d-flex justify-content-between ">
                <p
                  className=" driver-name  mb-0 "
                  style={{ color: "#01000599" }}
                >
                  Status
                </p>

                <p
                  className="  driver-name font-medium mb-0  "
                  style={{ color: "#3ABA56" }}
                >
                  <img
                    src="../images/icons/green-check.svg"
                    className="me-1"
                    width={"12px"}
                    height={"12px"}
                  />
                  &nbsp;
                  {
                    dataById?.Transactions[0]?.paid_amount &&
                    dataById?.Transactions[0]?.original_amount && (
                      <>
                        {/* Advance Paid: ₹{dataById.Transactions[0].paid_amount} <br />
                        Original Amount: ₹{dataById.Transactions[0].original_amount} <br /> */}
                        {/* Advance Paid Percentage:{' '} */}
                        {(
                          (dataById.Transactions[0].paid_amount /
                            dataById.Transactions[0].original_amount) *
                          100
                        ).toFixed(0)}
                        % &nbsp;
                      </>
                    )
                  }
                  Advance Paid
                </p>
              </div>
            </div>
          </div>
        </div>

        {dataById?.trip_status === "completed" && (
          <div
            className="bg-light rounded-2 d-flex flex-row p-2 mt-4 align-items-center justify-content-center border-black"
            style={{ cursor: "pointer" }}
            onClick={(event) => {
              event.stopPropagation();
              console.log("Invoice Clicked");
              handleDownload(dataById?.Transactions[0]?.id);
            }}
          >
            <div>
              <img
                src="/images/icons/invoice.png" // <-- Fixed path
                width="20px"
                height="23px"
                alt="Invoice Icon"
              />
            </div>
            <div className="ms-2 text-black">Download Invoice</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripDetails;
