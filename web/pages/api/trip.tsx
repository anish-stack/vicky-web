import axios, { AxiosResponse } from "axios";

const API_URL = process.env.API_URL;
const MODEL_URL = `${API_URL}/api`;

// const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

// console.log("token", token);

export type Modal = {
  id: number;
  user_id?: number;
  vehicle_id?: number;
  pickup_address?: string;
  extra_km?: string;
  additional_time_charge?:string
  toll_tax?: Boolean;
  parking_charges?: Boolean;
  driver_charges?: Boolean;
  night_charges?: Boolean;
  fuel_charges?: Boolean;
  places: any;
  departure_date: any;
  return_date: string;
  distance: string;
  trip_type: string;
  trip_status: string;
  category?: string;
  city_id?: number;
  local_rental_plan_id?: number;
  airport_id?: number;
  airport_city_id?: number;
  airport_from_to?: number;
  car_tab?: string;
  dham_package_name?: string;
  dham_pickup_city_name?: string;
  dham_package_id?: number;
  dham_pickup_city_id?: number;
  dham_package_days?: number;
  dham_category_name?: string;
  dham_category_id?: number;
  pincode?:string
  createdAt?: string;
  updatedAt?: string;
};

// const createTrip = (query: Modal, token: any): Promise<Modal> => {
//   return axios
//     .post(`${MODEL_URL}/trip`, query)
//     .then((d: AxiosResponse<Modal>) => d.data);
// };
const createTrip = (query: Modal, token: string): Promise<Modal> => {
  return axios
    .post(`${MODEL_URL}/trip`, query, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res: AxiosResponse<Modal>) => res.data);
};

const getTripById = (Id: any, token: any): Promise<any> => {
  return axios
    .get(`${MODEL_URL}/trip/${Id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((d: AxiosResponse<any>) => d.data);
};

const getAllTrips = (
  userId: any,
  tripStatus: any,
  token: any
): Promise<any> => {
  return axios
    .get(`${MODEL_URL}/trip?userId=${userId}&tripStatus=${tripStatus}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((d: AxiosResponse<any>) => d.data);
};

export type BookingModal = {
  vehicle_id?: number;
  places: any;
  departure_date: any;
  trip_type: string;

  category?: string;
  city_id?: number;
};
const checkBookingLimit = (query: BookingModal): Promise<BookingModal> => {
  return axios
    .post(`${MODEL_URL}/booking_limit/check_booking_available`, query)
    .then((d: AxiosResponse<BookingModal>) => d.data);
};

export { createTrip, getTripById, getAllTrips, checkBookingLimit };
