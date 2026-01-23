import axios, { AxiosResponse } from 'axios'

const API_URL = process.env.API_URL
const MODEL_URL = `${API_URL}/api`


export type Model = {
    session_id?: string;
    distance: string;
    phoneNo: string;
    pickUpDate: string;
    dropDate: string;
    places: any;
    tripType: string;
    local_rental_plan_id: number,
    city_id: number,
    category: string,
    time: string
};

const createSession = (query: Model): Promise<Model> => {
    return axios
        .post(`${MODEL_URL}/session`, query)
        .then((d: AxiosResponse<Model>) => d.data);
}

const getSessionById = (session_id: Model): Promise<Model> => {
    return axios
        .get(`${MODEL_URL}/session/${session_id}`)
        .then((d: AxiosResponse<Model>) => d.data);
}

const updateBySessionId = (id: string, query: Model): Promise<Model> => {
    return axios
        .put(`${MODEL_URL}/session/${id}`, query)
        .then((d: AxiosResponse<Model>) => d.data);
}
export { createSession, getSessionById, updateBySessionId }