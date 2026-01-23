import {ID, Response} from '../../../../_metronic/helpers'
//import {PermissionQueryResponse,Permission} from '../../permission-management/core/_models'

export type one_way_trip_pricings={
  id?: ID
  vehicle_id?: number
  from?: number
  to?: number
  price_per_km?: number
}


export type Model = {
  id?: ID
  image?: string
  title?: string
  priceperkm?: number
  fuelcharges?: boolean
  drivercharges?: boolean
  nightcharges?: boolean
  parkingcharges?: boolean
  terms?: string
  minimum_price?: number
  minimum_price_range?: number
  extra_fare_km?: string
  additional_time_charge?:string
  driver_expences?: string
  one_way_trip_pricings: Array<one_way_trip_pricings>
  one_way_trip_pricings_deleted_ids?: Array<ID>
  passengers?: number
  large_size_bag?: number
  medium_size_bag?: number
  hand_bag?: number
  ac_cab?: boolean
  luggage?: boolean
  perdaystatetaxcharges?:number
}

export type ModelQueryResponse = Response<Array<Model>>

export const initialModel: Model = {
  image: '',
  title: '',
  priceperkm: 0,
  fuelcharges: false,
  drivercharges: false,
  nightcharges: false,
  parkingcharges: false,
  terms: '',
  minimum_price: 0,
  minimum_price_range: 0,
  extra_fare_km: '',
  additional_time_charge:'',
  driver_expences: '0',
  one_way_trip_pricings: [{}],
  one_way_trip_pricings_deleted_ids: [],
  passengers: 0,
  large_size_bag: 0,
  medium_size_bag: 0,
  hand_bag: 0,
  ac_cab: false,
  luggage: false,
  perdaystatetaxcharges:0
}

