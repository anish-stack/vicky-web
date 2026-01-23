import axios, { AxiosResponse } from "axios";

const API_URL = process.env.API_URL;
const MODEL_URL = `${API_URL}/api`;

// const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

// console.log("token", token);

export type Modal = {
  id: number;
  payment_id: string;
  user_id: string;
  original_amount: string;
  paid_amount: string;
  currency: string;
  status: string;
  order_id: string;
  method: string;
  card: any;
  upi: any;
  bank: string;
  wallet: string;
  email: string;
  contact: string;
  error_description: string;
  error_reason: string;
  acquirer_data: any;
  all_details: any;
  places: any;
  departure_date: any;
  return_date: string;
  distance: string;
  trip_type: string;
  payment_type: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

const createTransaction = (query: Modal, token: any): Promise<Modal> => {
  return axios
    .post(`${MODEL_URL}/transaction`, query, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((d: AxiosResponse<Modal>) => d.data);
};

const getAllTransactions = (
  userId: any,
  tripStatus: any,
  token: any
): Promise<any> => {
  return axios
    .get(`${MODEL_URL}/transaction?userId=${userId}&tripStatus=${tripStatus}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((d: AxiosResponse<any>) => d.data);
};

const getTransactionById = (Id: any, token: any): Promise<any> => {
  return axios
    .get(`${MODEL_URL}/transaction/${Id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((d: AxiosResponse<any>) => d.data);
};
export { createTransaction, getAllTransactions, getTransactionById };
