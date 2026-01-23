import {ID, Response} from '../../../../../_metronic/helpers'
export type User = {
  id?: ID
  name?: string
  email?:string
  password?: string
  is_active?:number
  phone_number?: string
}

export type UsersQueryResponse = Response<Array<User>>

export const initialUser: User = {
  name:'',
  email:'',
  password: '',
  is_active: 0,
  phone_number: ''
}
