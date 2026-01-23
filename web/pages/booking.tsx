import { useCustomerContext } from "@/context/userContext";
import useAuth from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { getAllTransactions, getTransactionById } from "./api/transaction";
import { getAllTrips } from "./api/trip";
import { useRouter } from "next/router";
import { Col, Modal, Row } from "react-bootstrap";
import moment from "moment";
import Head from "next/head";

export default function Booking() {
  const { isAuthenticated, checkAuth } = useAuth();
  const [authenticate, setAuthenticate] = useState(false);
  const hasRendered = useRef(false);
  const Router = useRouter();

  const [token, setToken] = useState<string | null>(null);

  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (!isChecked) {
      const timer = setTimeout(() => {
        setIsChecked(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isChecked]);

  useEffect(() => {
      if (isChecked && isAuthenticated === false) {
          setIsChecked(false);
          router.push('/login');
      }
  }, [isChecked, isAuthenticated]);

  const { customerDetail } = useCustomerContext();
  const [transactionId, setTransactionId] = useState("");
  const [tripStatus, setTripStatus] = useState("reserved");

  const [dataById, setDataById] = useState(null) as any;

  useEffect(() => {
    const fetchData = async () => {
      if (transactionId) {
        try {
          const response = await getTransactionById(transactionId, token);
          if (response.status == true) {
            setDataById(response?.data);
          } else {
            setBookingTransaction(null);
          }
        } catch (error) {}
      }
    };

    fetchData();
  }, [transactionId]);

  const router = useRouter();

  const [bookingTransaction, setBookingTransaction] = useState([]) as any;

  useEffect(() => {
    const fetchTransactions = async () => {
      if (customerDetail && isChecked) {
        try {
          const response = await getAllTrips(
            customerDetail.id,
            tripStatus,
            token
          );
          if (response.status == true) {
            setBookingTransaction(response?.data);
          } else {
            setBookingTransaction([]);
          }
        } catch (error) {
          console.error("Error fetching transactions:", error);
        }
      }
    };

    fetchTransactions();
  }, [customerDetail, isChecked, isAuthenticated, Router, tripStatus]);

  const [transactionShow, setTransactionShow] = useState(false);

  const handleTransactionsClose = () => setTransactionShow(false);
  const handleTransactionsOpen = () => setTransactionShow(true);

  const openTransactionModal = (id: any) => {
    setTransactionId(id);
    handleTransactionsOpen();
  };

  const placesArray = dataById ? JSON.parse(dataById.places) : [];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
    }
  }, []);

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

  console.log("Booking", transactionId, dataById, bookingTransaction);

  // Example usage:
  //   console.log(formatDate('2025-04-25T21:00:00')); // Output: "25 Apr, 25 • 9:00 pm"
  //   console.log(formatDate('2024-11-15T08:17:00')); // Output: "15 Nov, 24 • 8:17 am"
  const statusColorMap: Record<string, string> = {
    reserved: "text-warning",       // blue
    active: "text-primary",      // blue (or adjust)
    completed: "text-success",   // green
    cancel: "text-danger",    // red
  };
  
  return (
    <>
      <Head>
        <title>{"Customer Booking"}</title>
      </Head>
      <Modal
        show={transactionShow}
        onHide={handleTransactionsClose}
        centered
        fullscreen
      >
        <Modal.Header closeButton>
          <Modal.Title>Booking Info</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {dataById && (
            <>
              {dataById?.car_tab == "chardham" ? (
                <div className="custom-cms-card">
                  <div className="heading">
                    <h3 className="m-0">{`Booking Info`}</h3>
                  </div>

                  <div className="content">
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
                      {dataById.dham_pickup_city_name &&
                        dataById.dham_package_name && (
                          <div className="col mt-2">
                            <p className="custom-vicky-label">Places</p>
                            <div className="">
                              <div className="start-align">
                                <span className="">
                                  <span className="place-tag mt-2">
                                    {dataById.dham_pickup_city_name}
                                  </span>
                                  <i className="fa fa-arrow-right mx-1"></i>
                                  <span className="place-tag mt-2">
                                    {dataById.dham_package_name}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                      {dataById.name && (
                        <div className="col mt-2">
                          <p className="custom-vicky-label">Name</p>
                          <p className="mb-0 custom-vicky-value">
                            {dataById.name}
                          </p>
                        </div>
                      )}

                      {dataById.pickup_address && (
                        <div className="col mt-2">
                          <p className="custom-vicky-label">Pickup Address</p>
                          <p className="mb-0 custom-vicky-value">
                            {dataById.pickup_address}
                          </p>
                        </div>
                      )}

                      {dataById?.dham_category_name && (
                        <div className="col mt-2">
                          <p className="custom-vicky-label">Dham Category</p>
                          <p className="mb-0 custom-vicky-value">
                            {dataById?.dham_category_name}
                          </p>
                        </div>
                      )}

                      {dataById?.dham_package_name && (
                        <div className="col mt-2">
                          <p className="custom-vicky-label">
                            Dham Package Name
                          </p>
                          <p className="mb-0 custom-vicky-value">
                            {dataById?.dham_package_name}
                          </p>
                        </div>
                      )}

                      {dataById?.dham_pickup_city_name && (
                        <div className="col mt-2">
                          <p className="custom-vicky-label">Dham Pickup City</p>
                          <p className="mb-0 custom-vicky-value">
                            {dataById?.dham_pickup_city_name}
                          </p>
                        </div>
                      )}

                      {dataById?.dham_package_days && (
                        <div className="col mt-2">
                          <p className="custom-vicky-label">Total Days</p>
                          <p className="mb-0 custom-vicky-value">
                            {dataById?.dham_package_days}
                          </p>
                        </div>
                      )}

                      {dataById.vehicle_name && (
                        <div className="col mt-2">
                          <p className="custom-vicky-label">Vehicle Name</p>
                          <p className="mb-0 custom-vicky-value">
                            {dataById.vehicle_name}
                          </p>
                        </div>
                      )}

                      {dataById.original_amount && (
                        <div className="col mt-2">
                          <p className="custom-vicky-label">Original Amount</p>
                          <p className="mb-0 custom-vicky-value">
                            <i className="fa-solid fa-indian-rupee-sign me-2"></i>
                            {dataById.original_amount}
                          </p>
                        </div>
                      )}

                      {dataById.paid_amount && (
                        <div className="col mt-2">
                          <p className="custom-vicky-label">Paid Amount</p>
                          <p className="mb-0 custom-vicky-value">
                            <i className="fa-solid fa-indian-rupee-sign me-2 text-dark"></i>
                            {dataById.paid_amount}
                          </p>
                        </div>
                      )}

                      {dataById.paid_amount && dataById.original_amount && (
                        <div className="col mt-2">
                          <p className="custom-vicky-label">Original Amount</p>
                          <p className="mb-0 custom-vicky-value">
                            <i className="fa-solid fa-indian-rupee-sign me-2 text-dark"></i>
                            {Number(dataById.original_amount) -
                              Number(dataById.paid_amount)}
                          </p>
                        </div>
                      )}

                      {dataById.distance && (
                        <div className="col mt-2">
                          <p className="custom-vicky-label">Distance</p>
                          <p className="mb-0 custom-vicky-value">
                            {dataById.distance}
                          </p>
                        </div>
                      )}

                      {dataById.departure_date && (
                        <div className="col mt-2">
                          <p className="custom-vicky-label">PickUp Date</p>
                          <p className="mb-0 custom-vicky-value">
                            {moment(dataById.departure_date).format(
                              "DD-MM-YYYY hh:mm A"
                            )}
                          </p>
                        </div>
                      )}

                      {dataById.return_date && (
                        <div className="col mt-2">
                          <p className="custom-vicky-label">Return Date</p>
                          <p className="mb-0 custom-vicky-value">
                            {moment(dataById.return_date).format(
                              "DD-MM-YYYY hh:mm A"
                            )}
                          </p>
                        </div>
                      )}

                      {dataById.trip_type && (
                        <div className="col mt-2">
                          <p className="custom-vicky-label">Trip Type</p>
                          {dataById.trip_type == "oneWay" && (
                            <p className="mb-0 custom-vicky-value">One Way</p>
                          )}
                          {dataById.trip_type == "roundTrip" && (
                            <p className="mb-0 custom-vicky-value">
                              Round Trip
                            </p>
                          )}
                          {dataById.trip_type == "local" && (
                            <p className="mb-0 custom-vicky-value">
                              Local Rental
                            </p>
                          )}
                          {dataById.trip_type == "airport" && (
                            <p className="mb-0 custom-vicky-value">
                              Airport Transfer
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="custom-cms-card">
                  <div className="heading">
                    <h3 className="m-0">{`Booking Info`}</h3>
                  </div>

                  <div className="content">
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
                      {placesArray && (
                        <div className="col mt-2">
                          <p className="custom-vicky-label">Places</p>
                          <div className="">
                            <div className="start-align">
                              {placesArray.map((data: any, index: number) => (
                                <span className="" key={index}>
                                  {index != 0 && (
                                    <i className="fa fa-arrow-right mx-1"></i>
                                  )}
                                  <span className="place-tag mt-2" key={index}>
                                    {data?.label}
                                  </span>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {dataById.name && (
                        <div className="col mt-2">
                          <p className="custom-vicky-label">Name</p>
                          <p className="mb-0 custom-vicky-value">
                            {dataById.name}
                          </p>
                        </div>
                      )}

                      {dataById.pickup_address && (
                        <div className="col mt-2">
                          <p className="custom-vicky-label">Pickup Address</p>
                          <p className="mb-0 custom-vicky-value">
                            {dataById.pickup_address}
                          </p>
                        </div>
                      )}

                      {dataById.vehicle_name && (
                        <div className="col mt-2">
                          <p className="custom-vicky-label">Vehicle Name</p>
                          <p className="mb-0 custom-vicky-value">
                            {dataById.vehicle_name}
                          </p>
                        </div>
                      )}

                      {dataById.extra_km && (
                        <div className="col mt-2">
                          <p className="custom-vicky-label">Extra fare/Km</p>
                          <p className="mb-0 custom-vicky-value">
                            {dataById.extra_km}
                          </p>
                        </div>
                      )}

                      <div className="col mt-2">
                        <p className="custom-vicky-label">Toll & State Tax</p>
                        <p className="mb-0 custom-vicky-value">
                          {dataById.toll_tax ? "Included" : "Not Included"}
                        </p>
                      </div>

                      <div className="col mt-2">
                        <p className="custom-vicky-label">Parking Charges</p>
                        <p className="mb-0 custom-vicky-value">
                          {dataById.parking_charges
                            ? "Included"
                            : "Not Included"}
                        </p>
                      </div>

                      <div className="col mt-2">
                        <p className="custom-vicky-label">Driver Charges</p>
                        <p className="mb-0 custom-vicky-value">
                          {dataById.driver_charges
                            ? "Included"
                            : "Not Included"}
                        </p>
                      </div>

                      <div className="col mt-2">
                        <p className="custom-vicky-label">Night Charges</p>
                        <p className="mb-0 custom-vicky-value">
                          {dataById.night_charges ? "Included" : "Not Included"}
                        </p>
                      </div>

                      <div className="col mt-2">
                        <p className="custom-vicky-label">Fuel Charges</p>
                        <p className="mb-0 custom-vicky-value">
                          {dataById.fuel_charges ? "Included" : "Not Included"}
                        </p>
                      </div>

                      {dataById.original_amount && (
                        <div className="col mt-2">
                          <p className="custom-vicky-label">Original Amount</p>
                          <p className="mb-0 custom-vicky-value">
                            <i className="fa-solid fa-indian-rupee-sign me-2"></i>
                            {dataById.original_amount}
                          </p>
                        </div>
                      )}

                      {dataById.paid_amount && (
                        <div className="col mt-2">
                          <p className="custom-vicky-label">Paid Amount</p>
                          <p className="mb-0 custom-vicky-value">
                            <i className="fa-solid fa-indian-rupee-sign me-2 text-dark"></i>
                            {dataById.paid_amount}
                          </p>
                        </div>
                      )}

                      {dataById.paid_amount && dataById.original_amount && (
                        <div className="col mt-2">
                          <p className="custom-vicky-label">Original Amount</p>
                          <p className="mb-0 custom-vicky-value">
                            <i className="fa-solid fa-indian-rupee-sign me-2 text-dark"></i>
                            {Number(dataById.original_amount) -
                              Number(dataById.paid_amount)}
                          </p>
                        </div>
                      )}

                      {dataById.distance && (
                        <div className="col mt-2">
                          <p className="custom-vicky-label">Distance</p>
                          <p className="mb-0 custom-vicky-value">
                            {dataById.distance}
                          </p>
                        </div>
                      )}

                      {dataById.departure_date && (
                        <div className="col mt-2">
                          <p className="custom-vicky-label">PickUp Date</p>
                          <p className="mb-0 custom-vicky-value">
                            {moment(dataById.departure_date).format(
                              "DD-MM-YYYY hh:mm A"
                            )}
                          </p>
                        </div>
                      )}

                      {dataById.return_date && (
                        <div className="col mt-2">
                          <p className="custom-vicky-label">Return Date</p>
                          <p className="mb-0 custom-vicky-value">
                            {moment(dataById.return_date).format(
                              "DD-MM-YYYY hh:mm A"
                            )}
                          </p>
                        </div>
                      )}

                      {dataById.trip_type && (
                        <div className="col mt-2">
                          <p className="custom-vicky-label">Trip Type</p>
                          {dataById.trip_type == "oneWay" && (
                            <p className="mb-0 custom-vicky-value">One Way</p>
                          )}
                          {dataById.trip_type == "roundTrip" && (
                            <p className="mb-0 custom-vicky-value">
                              Round Trip
                            </p>
                          )}
                          {dataById.trip_type == "local" && (
                            <p className="mb-0 custom-vicky-value">
                              Local Rental
                            </p>
                          )}
                          {dataById.trip_type == "airport" && (
                            <p className="mb-0 custom-vicky-value">
                              Airport Transfer
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="custom-cms-card">
                <div className="heading">
                  <h3 className="m-0">{`Payment Info`}</h3>
                </div>

                <div className="content">
                  <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
                    {dataById.payment_id && (
                      <div className="col mt-2">
                        <p className="custom-vicky-label">Payment ID</p>
                        <p className="mb-0 custom-vicky-value">
                          {dataById.payment_id}
                        </p>
                      </div>
                    )}
                    {dataById.order_id && (
                      <div className="col mt-2">
                        <p className="custom-vicky-label">Order ID</p>
                        <p className="mb-0 custom-vicky-value">
                          {dataById.order_id}
                        </p>
                      </div>
                    )}
                    {dataById.status && (
                      <div className="col mt-2">
                        <p className="custom-vicky-label">Status</p>
                        {dataById.status == "captured" && (
                          <p className="mb-0 custom-vicky-value">success</p>
                        )}
                        {dataById.status == "failed" && (
                          <p className="mb-0 custom-vicky-value">failed</p>
                        )}
                      </div>
                    )}
                    {dataById.method && (
                      <div className="col mt-2">
                        <p className="custom-vicky-label">Method</p>
                        <p className="mb-0 custom-vicky-value">
                          {dataById.method}
                        </p>
                      </div>
                    )}

                    {dataById.paid_amount && (
                      <div className="col mt-2">
                        <p className="custom-vicky-label">Amount</p>
                        <p className="mb-0 custom-vicky-value">
                          <i className="fa-solid fa-indian-rupee-sign me-2"></i>
                          {dataById.paid_amount}
                        </p>
                      </div>
                    )}

                    {dataById.bank && (
                      <div className="col mt-2">
                        <p className="custom-vicky-label">Bank</p>
                        <p className="mb-0 custom-vicky-value">
                          {dataById.bank}
                        </p>
                      </div>
                    )}

                    {dataById.wallet && (
                      <div className="col mt-2">
                        <p className="custom-vicky-label">Wallet</p>
                        <p className="mb-0 custom-vicky-value">
                          {dataById.wallet}
                        </p>
                      </div>
                    )}

                    {dataById.contact && (
                      <div className="col mt-2">
                        <p className="custom-vicky-label">Contact</p>
                        <p className="mb-0 custom-vicky-value">
                          {dataById.contact}
                        </p>
                      </div>
                    )}

                    {dataById.error_description && (
                      <div className="col mt-2">
                        <p className="custom-vicky-label">Error Description</p>
                        <p className="mb-0 custom-vicky-value">
                          {dataById.error_description}
                        </p>
                      </div>
                    )}

                    {dataById.error_reason && (
                      <div className="col mt-2">
                        <p className="custom-vicky-label">Error Reason</p>
                        <p className="mb-0 custom-vicky-value">
                          {dataById.error_reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
      <div
        className="container booking_page py-2 "
        style={{ marginTop: "67px" }}
      >
        <h2 className="my-3 text-center text-dark">My Trips</h2>
        <div className="mytrip d-flex">
          <button
            className={`badge mx-2 ${tripStatus == "reserved" ? "active" : ""}`}
            onClick={() => setTripStatus("reserved")}
          >
            Reserved
          </button>
          <button
            className={`badge  me-2  ${tripStatus == "active" ? "active" : ""}`}
            onClick={() => setTripStatus("active")}
          >
            Active
          </button>
          
          <button
            className={`badge me-2 ${
              tripStatus == "completed" ? "active" : ""
            }`}
            onClick={() => setTripStatus("completed")}
          >
            Completed
          </button>
          <button
            className={`badge ${tripStatus == "cancel" ? "active" : ""}`}
            onClick={() => setTripStatus("cancel")}
          >
            Cancel
          </button>
        </div>
        {/* <h2 onClick={()=> handleDownload()}>sfsdfsdf</h2> */}
        {bookingTransaction.length > 0 ? bookingTransaction?.map((item: any, index: any) => (
          <div
            className="card my-2 "
            style={{ cursor: "pointer" }}
            onClick={() => router.push(`trip-details/?id=${item?.id}`)}
            key={index}
          >
            <div className="card-body rounded cursor-pointer ">
              <div className="d-flex justify-content-between">
                <div className="car-box border px-1 py-1 rounded">
                  <img
                    src="../images/icons/booking-car.png"
                    width={"36px"}
                    height={"36px"}
                  />
                </div>
                <div className="text-start mt-1">
                  <h6 className="mb-0">Booking Id : {`TS${String(item?.id).padStart(3, '0')}`}</h6>
                  <p className="mb-0" style={{ color: "#010005" ,fontSize:'13px'}}>
                    {formatDate(item.departure_date)}
                  </p>
                  {item?.return_date && <p className="mb-0" style={{ color: "#010005", fontSize: '13px', lineHeight: '6px' }}>
                    {formatDate(item?.return_date)}
                  </p>}
                </div>
                <div className="text-end mt-1">
                  <h6 className="mb-0 text-dark">
                    ₹{item?.Transactions[0]?.paid_amount}
                  </h6>
                  <p
                    className={`${statusColorMap[tripStatus] || "text-dark"} mb-0`}
                    style={{ fontSize: "14px" }}
                  >
                    • {tripStatus.charAt(0).toUpperCase() + tripStatus.slice(1).toLowerCase()}
                  </p>

                </div>
              </div>
              {item?.car_tab == "chardham" ? (
                <>
                {/* test */}
                  <div className=" trip_places mt-3">
                    <Row>
                      <Col xs={12} md={12} className=" d-md-flex">
                        <div className="trip_places  d-flex w-100">
                          <img
                            src="./images/icons/pickup.png"
                            className="me-2"
                            height={"24px"}
                            width={"24px"}
                          />
                          <p> {item.dham_pickup_city_name}</p>
                        </div>
                      </Col>
                      <Col xs={12} md={12} className="d-md-inline">
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
                          <button className="badge active">
                            {item?.dham_category_name}
                          </button>
                        </div>
                        <hr className="mx-3" />

                        {/* </div> */}
                      </Col>

                      <Col xs={12} md={12} className="d-md-flex">
                        <div className="trip_places   d-flex w-100">
                          <img
                            src="./images/icons/destination.png"
                            className="me-2"
                            height={"24px"}
                            width={"24px"}
                          />
                          <p>    {item.dham_package_name}</p>
                        </div>
                      </Col>
                    </Row>
                  </div>

                 
                  {item.pickup_address && (
                    <div className="col mt-2">
                      <p className="custom-vicky-label">1-- Pickup Address</p>
                      <p className="mb-0 custom-vicky-value">
                        {item.pickup_address}
                      </p>
                    </div>
                  )}

                 

                  {/* {item?.dham_package_name && (
                    <div className="col mt-2">
                      <p className="custom-vicky-label">
                       3-- Dham Package Name
                      </p>
                      <p className="mb-0 custom-vicky-value">
                        {item?.dham_package_name}
                      </p>
                    </div>
                  )}

                  {item?.dham_pickup_city_name && (
                    <div className="col mt-2">
                      <p className="custom-vicky-label">4-- Dham Pickup City</p>
                      <p className="mb-0 custom-vicky-value">
                        {item?.dham_pickup_city_name}
                      </p>
                    </div>
                  )}

                  {item?.dham_package_days && (
                    <div className="col mt-2">
                      <p className="custom-vicky-label">5-- Total Days</p>
                      <p className="mb-0 custom-vicky-value">
                        {item?.dham_package_days}
                      </p>
                    </div>
                  )} */}

                  {/* {item.vehicle_name && (
                    <div className="col mt-2">
                      <p className="custom-vicky-label">6-- Vehicle Name</p>
                      <p className="mb-0 custom-vicky-value">
                        {item.vehicle_name}
                      </p>
                    </div>
                  )}

                  {item.original_amount && (
                    <div className="col mt-2">
                      <p className="custom-vicky-label">7-- Original Amount</p>
                      <p className="mb-0 custom-vicky-value">
                        <i className="fa-solid fa-indian-rupee-sign me-2"></i>
                        {item.original_amount}
                      </p>
                    </div>
                  )}

                  {item.paid_amount && (
                    <div className="col mt-2">
                      <p className="custom-vicky-label">8-- Paid Amount</p>
                      <p className="mb-0 custom-vicky-value">
                        <i className="fa-solid fa-indian-rupee-sign me-2 text-dark"></i>
                        {item.paid_amount}
                      </p>
                    </div>
                  )}

                  {item.paid_amount && item.original_amount && (
                    <div className="col mt-2">
                      <p className="custom-vicky-label">9--Original Amount</p>
                      <p className="mb-0 custom-vicky-value">
                        <i className="fa-solid fa-indian-rupee-sign me-2 text-dark"></i>
                        {Number(item.original_amount) -
                          Number(item.paid_amount)}
                      </p>
                    </div>
                  )} */}

                  {/* {item.distance && (
                    <div className="col mt-2">
                      <p className="custom-vicky-label">Distance</p>
                      <p className="mb-0 custom-vicky-value">
                        {item.distance}
                      </p>
                    </div>
                  )} */}

                  {/* {item.departure_date && (
                    <div className="col mt-2">
                      <p className="custom-vicky-label">PickUp Date</p>
                      <p className="mb-0 custom-vicky-value">
                        {moment(item.departure_date).format(
                          "DD-MM-YYYY hh:mm A"
                        )}
                      </p>
                    </div>
                  )} */}

                  {/* {item.return_date && (
                    <div className="col mt-2">
                      <p className="custom-vicky-label">Return Date</p>
                      <p className="mb-0 custom-vicky-value">
                        {moment(item.return_date).format(
                          "DD-MM-YYYY hh:mm A"
                        )}
                      </p>
                    </div>
                  )} */}

                 
                </>
              ): (
              <div className=" trip_places mt-3">
                <Row>
                  <Col xs={12} md={12} className=" d-md-flex">
                    <div className="trip_places  d-flex w-100">
                      <img
                        src="./images/icons/pickup.png"
                        className="me-2"
                        height={"24px"}
                        width={"24px"}
                      />
                      <p>{JSON.parse(item.places)[0].label}</p>
                    </div>
                  </Col>
                  <Col xs={12} md={12} className="d-md-inline">
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
                      <button className="badge active">
                        {item.trip_type === "oneWay" && (
                          <>One Way</>
                        )}
                        {item.trip_type === "roundTrip" && (
                          <>
                            Round Trip
                          </>
                        )}
                        {item.trip_type === "local" && (
                          <>
                            Local Rental
                          </>
                        )}
                        {item.trip_type === "airport" && (
                          <>
                            Airport Transfer
                          </>
                        )}

                      </button>
                    </div>
                    <hr className="mx-3" />

                    {/* </div> */}
                  </Col>

                  <Col xs={12} md={12} className="d-md-flex">
                    <div className="trip_places   d-flex w-100">
                      <img
                        src="./images/icons/destination.png"
                        className="me-2"
                        height={"24px"}
                        width={"24px"}
                      />
                      <p>{JSON.parse(item.places).at(-1).label}</p>
                    </div>
                  </Col>
                </Row>
              </div>
              )}
            </div>
          </div>
        )):
          <div
            className="card my-2 min-h-25 "
          >
            <div className="card-body rounded py-5 text-center">
            No Trip Found
            </div>
          </div>

        }
      </div>
    </>
  );
}
