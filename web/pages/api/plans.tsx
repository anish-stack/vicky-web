import axios, { AxiosResponse } from 'axios'

const API_URL = process.env.API_URL
const MODEL_URL = `${API_URL}/api`

export type local_rental_pricings = {
    id?: number
    vehicle_id?: string
    city_id?: string
    price?: string
}

export type Plans = {
    id?: number
    hours?: string
    km?: string
    local_rental_pricings?: Array<local_rental_pricings>
};

export type AdvancePayment = {
    id?: number
    percentage?: number
};

const getPlans = (query: string): Promise<Plans> => {
    return axios
        .get(`${MODEL_URL}/localrentalplans`)
        .then((d: AxiosResponse<Plans>) => d.data)
}

const getAdvancePayment = (query: string): Promise<AdvancePayment> => {
    return axios
        .get(`${MODEL_URL}/advance_payment`)
        .then((d: AxiosResponse<AdvancePayment>) => d.data)
}

export { getPlans, getAdvancePayment }