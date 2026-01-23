import {ID, Response} from '../../../../../../_metronic/helpers'
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
}
export type updateColumns = {
  tablename?: string
  tablecolumns?: Array<string>
}

export type UsersQueryResponse = Response<Array<User>>

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


// export type Model = {
//   id?: ID
//   name?: string
//   email?: string
//   password?: string
// }

// export type ModelQueryResponse = Response<Array<Model>>

// export const initialModel: Model = {
//   name: '',
//   email: '',
//   password: ''
// }