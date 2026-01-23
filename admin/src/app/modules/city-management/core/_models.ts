import { ID, Response } from '../../../../_metronic/helpers'
//import {PermissionQueryResponse,Permission} from '../../permission-management/core/_models'

export type Pincodes = {
  id?: ID
  city_id?: number
  pincode?: number,
  area_name?: string,
}

export type Model = {
  id?: ID
  name?: string
  airport_id?: number,
  distance?: number,
  hotel?: boolean
  Pincodes?:Array<Pincodes>
  booking_limits?:Array<LimitsArray>

}

export type ModelQueryResponse = Response<Array<Model>>

export const initialModel: Model = {
  name: '',
  airport_id: 0,
  distance: 0,
  hotel: false,
  Pincodes:[]
}

export type LimitsArray = {
  id?: ID
  city_id?: number
  limit_date?: number,
  max_limit?: number,

  vehicle_id?: number
}
export type BookingLimitsModel = {
  id?: ID
  city_id?: number
  vehicle_id?: number
  booking_limits?:Array<LimitsArray>
}
export const initialBookingLimitsModel: BookingLimitsModel = {
  vehicle_id: 0,
  city_id: 0,
  booking_limits:[]
}