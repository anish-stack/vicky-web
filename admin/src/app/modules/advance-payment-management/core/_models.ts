import {ID, Response} from '../../../../_metronic/helpers'

export type Model = {
  id?: ID
  percentage?: number
  toll_tax?:string
  roundtrip_toll_tax?:string
}

export type ModelQueryResponse = Response<Array<Model>>

export const initialModel: Model = {
  percentage: 0,
  toll_tax:'',
  roundtrip_toll_tax:'',
}

