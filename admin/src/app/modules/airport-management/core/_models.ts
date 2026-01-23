import {ID, Response} from '../../../../_metronic/helpers'
//import {PermissionQueryResponse,Permission} from '../../permission-management/core/_models'

export type airport_pricings={
  id?: ID
  vehicle_id?: string
  city_id?: string
  price?: string
}
export type Model = {
  id?: ID
  name?: string
  airport_pricings?: Array<airport_pricings>
}

export type ModelQueryResponse = Response<Array<Model>>

export const initialModel: Model = {
  name: '',
  airport_pricings: []
}

