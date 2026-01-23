import { ID, Response } from '../../../../_metronic/helpers'
//import {PermissionQueryResponse,Permission} from '../../permission-management/core/_models'

export type Model = {
  id?: ID
  name?: string
}

export type ModelQueryResponse = Response<Array<Model>>

export const initialModel: Model = {
  name: '',
}

