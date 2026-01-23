import axios, { AxiosResponse } from 'axios'

const API_URL = process.env.API_URL
const MODEL_URL = `${API_URL}/api`

export type City = {
    id: number;
    name: string;
    distance: string;
};

export type Airport = {
    id: number;
    name: string;
}

const getLocalRentalCities = (query: string): Promise<City> => {
    console.log("query", query)
    return axios
        .get(`${MODEL_URL}/cities/by-local-plan?${query}`)
        .then((d: AxiosResponse<City>) => d.data)
}

const getCities = (query: string): Promise<City> => {
    return axios
        .get(`${MODEL_URL}/cities?${query}`)
        .then((d: AxiosResponse<City>) => d.data)
}

const getAirports = (query: string): Promise<Airport> => {
    return axios
        .get(`${MODEL_URL}/airport`)
        .then((d: AxiosResponse<Airport>) => d.data)
}
export { getCities, getLocalRentalCities, getAirports }