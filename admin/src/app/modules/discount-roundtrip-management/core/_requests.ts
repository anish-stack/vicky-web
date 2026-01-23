import axios, {AxiosResponse} from 'axios'
import {ID, Response} from '../../../../_metronic/helpers'
import {Model, ModelQueryResponse} from './_models'

const API_URL = process.env.REACT_APP_THEME_API_URL
const MODEL_URL = `${API_URL}/discount`

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

export {getModels, deleteModel, deleteSelectedModels, getModelById, createModel, updateModel}