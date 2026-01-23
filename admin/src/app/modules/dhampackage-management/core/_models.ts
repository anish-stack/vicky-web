import { ID, Response } from '../../../../_metronic/helpers'
//import {PermissionQueryResponse,Permission} from '../../permission-management/core/_models'

export type Model = {
  id?: ID
  name?: string,
  image?: any,
  dham_category_id?: string,
  distance?: string
  dham_pickup_cities?: any,
  dham_category_name?: string
}

export type ModelQueryResponse = Response<Array<Model>>

export const initialModel: Model = {
  name: '',
  image: '',
  dham_category_id: '',
  distance: '',
  dham_pickup_cities: [],
  dham_category_name: ''
}

