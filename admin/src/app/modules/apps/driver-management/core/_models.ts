import { ID, Response } from '../../../../../_metronic/helpers'
// export type User = {
//   id?: ID
//   name?: string
//   email?:string
//   password?: string
//   is_active?:number
//   phone_number?: string
// }

export type User = {
  id?: ID
  name?: string
  email?: string
  password?: string
  phone_number?: string
  image?: any
  address?: string
  city?: string
  pin_code?: string
  gender?: string
  is_active?: number
}

export type UsersQueryResponse = Response<Array<User>>

// export const initialUser: User = {
//   name:'',
//   email:'',
//   password: '',
//   is_active: 0,
//   phone_number: ''
// }

export const initialUser: User = {
  name: '',
  email: '',
  phone_number: '',
  image: '',
  address: '',
  city: '',
  pin_code: '',
  gender: ''
}
