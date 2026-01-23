import {ID, Response} from '../../../../_metronic/helpers'
//import {PermissionQueryResponse,Permission} from '../../permission-management/core/_models'

export type local_rental_pricings={
  id?: ID
  vehicle_id?: string
  city_id?: string
  price?: string
}

export type Model = {
  id?: ID
  hours?: string
  km?: string
  local_rental_pricings?: Array<local_rental_pricings>
}

export type ModelQueryResponse = Response<Array<Model>>

export const initialModel: Model = {
  hours: '',
  km: '',
  local_rental_pricings: [{}],
}

