import axios, {AxiosResponse} from 'axios'
import {ID, Response} from '../../../../_metronic/helpers'
import {BookingLimitsModel, Model, ModelQueryResponse} from './_models'

const API_URL = process.env.REACT_APP_THEME_API_URL
const MODEL_URL = `${API_URL}/cities`


const getModels = (query: string): Promise<ModelQueryResponse> => {
  return axios
    .get(`${MODEL_URL}?${query}`)
    .then((d: AxiosResponse<ModelQueryResponse>) => d.data)
}

const getModelById = (id: ID): Promise<Model | undefined> => {
  return axios
    .get(`${MODEL_URL}/${id}`)
    .then((response: AxiosResponse<Response<Model>>) => response.data)
    .then((response: Response<Model>) => response.data)
}
const getBookingLimitsModelById = (id: ID): Promise<BookingLimitsModel | undefined> => {
  return axios
    .get(`${API_URL}/booking_limit/${id}`)
    .then((response: AxiosResponse<Response<Model>>) => response.data)
    .then((response: Response<Model>) => response.data)
}
const updateBookingLimitsModel = (model: Model, id:ID): Promise<ModelQueryResponse> => {
  return axios
    .put(`${API_URL}/booking_limit/${id}`, model)
    .then((response: AxiosResponse<ModelQueryResponse>) => response.data)
    .then((response: ModelQueryResponse) => response)
}
const createModel = (model: Model): Promise<ModelQueryResponse | undefined> => {
  return axios
    .post(MODEL_URL, model)
    .then((response: AxiosResponse<ModelQueryResponse>) => response.data)
    .then((response: ModelQueryResponse) => response)
}

const updateModel = (model: Model, id:ID): Promise<ModelQueryResponse> => {
  return axios
    .put(`${MODEL_URL}/${id}`, model)
    .then((response: AxiosResponse<ModelQueryResponse>) => response.data)
    .then((response: ModelQueryResponse) => response)
}


// const deleteModel = (modelId: ID): Promise<void> => {
//   return axios.delete(`${MODEL_URL}/${modelId}`).then(() => {})
// }

const deleteModel = (modelId: ID): Promise<ModelQueryResponse | undefined> => {
  return axios
  .delete(`${MODEL_URL}/${modelId}`)
  .then((response: AxiosResponse<ModelQueryResponse>) => response.data)
  .then((response: ModelQueryResponse) => response)
}

const deleteSelectedModels = (modelIds: Array<ID>): Promise<void> => {
  const requests = modelIds.map((id) => axios.delete(`${MODEL_URL}/${id}`))
  return axios.all(requests).then(() => {})
}


// Import models using an Excel file
const importPincodesReq = (file: File,city_id:ID): Promise<{ status: boolean; message: string; errorFile?: string }> => {
	const formData = new FormData()
	formData.append('file', file)
  
	return axios
	  .post(`${MODEL_URL}/import-pincodes/${city_id}`, formData, {
		headers: {
		  'Content-Type': 'multipart/form-data',
		},
	  })
	  .then((response: AxiosResponse<{ status: boolean; message: string; errorFile?: string }>) => response.data)
  }
export {getModels, deleteModel, deleteSelectedModels, getModelById, createModel, updateModel,importPincodesReq,getBookingLimitsModelById,updateBookingLimitsModel}