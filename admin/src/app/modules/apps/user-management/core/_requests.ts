import axios, {AxiosResponse} from 'axios'
import {ID, Response} from '../../../../../_metronic/helpers'
import {User, UsersQueryResponse} from './_models'

const API_URL = process.env.REACT_APP_THEME_API_URL
const USER_URL = `${API_URL}/users`
const GET_USERS_URL = `${API_URL}/users`

const getUsers = (query: string): Promise<UsersQueryResponse> => {
  return axios
    .get(`${GET_USERS_URL}?${query}`)
    .then((d: AxiosResponse<UsersQueryResponse>) => d.data)
}

const getUserById = (id: ID): Promise<User | undefined> => {
  return axios
    .get(`${USER_URL}/${id}`)
    .then((response: AxiosResponse<Response<User>>) => response.data)
    .then((response: Response<User>) => response.data)
}

const createUser = (user: FormData): Promise<UsersQueryResponse | undefined> => {
  return axios
    .post(USER_URL, user)
    .then((response: AxiosResponse<UsersQueryResponse>) => response.data)
    .then((response: UsersQueryResponse) => response)
}

const updateUser = (user: FormData,id:ID): Promise<UsersQueryResponse | undefined> => {
  return axios
    .put(`${USER_URL}/${id}`, user,{headers:{"Content-Type":"multipart/form-data"}})
    .then((response: AxiosResponse<UsersQueryResponse>) => response.data)
    .then((response: UsersQueryResponse) => response)
}

const ChangeUserPWD = (user: FormData,id:ID): Promise<UsersQueryResponse | undefined> => {
  return axios
    .post(`${USER_URL}/change_password/${id}`, user,{headers:{"Content-Type":"multipart/form-data"}})
    .then((response: AxiosResponse<UsersQueryResponse>) => response.data)
    .then((response: UsersQueryResponse) => response)
}

const deleteUser = (userId: ID): Promise<void> => {
  return axios.delete(`${USER_URL}/${userId}`).then(() => {})
}

const deleteSelectedUsers = (userIds: Array<ID>): Promise<void> => {
  const requests = userIds.map((id) => axios.delete(`${USER_URL}/${id}`))
  return axios.all(requests).then(() => {})
}

export {getUsers, deleteUser, deleteSelectedUsers, getUserById, createUser, updateUser, ChangeUserPWD}
