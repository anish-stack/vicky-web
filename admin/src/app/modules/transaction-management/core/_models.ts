import { ID, Response } from '../../../../_metronic/helpers'
//import {PermissionQueryResponse,Permission} from '../../permission-management/core/_models'

export type Model = {
  id?: ID
  index_no?:number
  payment_id?: string;
  invoice_id?: string;
  user_id?: string;
  original_amount?: string;
  paid_amount?: string;
  currency?: string;
  status?: string;
  order_id?: string;
  method?: string;
  card?: any;
  upi?: any;
  bank?: string;
  wallet?: string;
  email?: string;
  contact?: string;
  error_description?: string;
  error_reason?: string;
  acquirer_data?: any;
  all_details?: any;
  places?: any;
  departure_date?: any;
  return_date?: string;
  distance?: string;
  trip_type?: string;
  trip_status?:string;
  vehicle_id?: string;
  name?: string;
  pickup_address?: string;
  vehicle_name?: string;
  extra_km?: string;
  toll_tax?: boolean;
  parking_charges?: boolean;
  driver_charges?: boolean;
  night_charges?: boolean;
  fuel_charges?: boolean;
  car_tab?: string;
  dham_package_name?: string;
  dham_pickup_city_name?: string;
  dham_package_days?: string;
  dham_category_name?: string;
  extra_time?:number
  additional_kilometers?:number
  additional_time?:number
  
  trip_id?:number
}

export type ModelQueryResponse = Response<Array<Model>>

export const initialModel: Model = {
  payment_id: '',
  invoice_id: '',
  user_id: '',
  original_amount: '',
  paid_amount: '',
  currency: '',
  status: '',
  order_id: '',
  method: '',
  card: null,
  upi: null,
  bank: '',
  wallet: '',
  email: '',
  contact: '',
  error_description: '',
  error_reason: '',
  acquirer_data: null,
  all_details: null,
  places: '',
  departure_date: '',
  return_date: '',
  distance: '',
  trip_type: '',
  vehicle_id: '',
  name: '',
  pickup_address: '',
  vehicle_name: '',
  extra_km: '',
  toll_tax: false,
  parking_charges: false,
  driver_charges: false,
  night_charges: false,
  fuel_charges: false,
  car_tab: '',
  dham_package_name: '',
  dham_pickup_city_name: '',
  dham_package_days: '',
  dham_category_name: ''
}

