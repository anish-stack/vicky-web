import axios, { AxiosResponse } from 'axios'

const API_URL = process.env.API_URL
const MODEL_URL = `${API_URL}/api`

export type OneWayTripPricing = {
    id: number;
    vehicle_id: number;
    from: number;
    to: number;
    price_per_km: string;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: string;
    updatedAt: string;
};

export type Vehicle = {
    id: number;
    image: string;
    title: string;
    priceperkm: string;
    fuelcharges: boolean;
    drivercharges: boolean;
    nightcharges: boolean;
    parkingcharges: boolean;
    terms: string;
    minimum_price: number;
    minimum_price_range: number;
    extra_fare_km: string;
    driver_expences: string;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: string;
    updatedAt: string;
    one_way_trip_pricings: OneWayTripPricing[];
};

const getVehicles = (query: string): Promise<Vehicle> => {
    return axios
        .get(`${MODEL_URL}/vehicles?${query}`)
        .then((d: AxiosResponse<Vehicle>) => d.data)
}
export { getVehicles }