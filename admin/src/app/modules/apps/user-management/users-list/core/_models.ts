import {ID, Response} from '../../../../../../_metronic/helpers'
export type User = {
  id?: ID
  name?: string
  email?: string
  password?: string
  phone_number: string
}
export type updateColumns = {
  tablename?: string
  tablecolumns?: Array<string>
}

export type UsersQueryResponse = Response<Array<User>>

export const initialUser: User = {
  name: '',
  email: '',
  phone_number: ''
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