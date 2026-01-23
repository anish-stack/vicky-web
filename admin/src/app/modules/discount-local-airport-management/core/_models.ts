import {ID, Response} from '../../../../_metronic/helpers'

export type Model = {
  id?: ID
  title?: string
  slug?: string
  discount_cities?: any
  overall_discount?: number
  apply_overall_discount?: boolean
  apply_citywise_discount?: boolean
}

export type ModelQueryResponse = Response<Array<Model>>

export const initialModel: Model = {
  title: '',
  slug: 'local_airport',
  discount_cities: [],
  overall_discount: 0,
  apply_overall_discount: false,
  apply_citywise_discount: false
}

