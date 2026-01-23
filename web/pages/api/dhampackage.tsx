import axios, { AxiosResponse } from 'axios';

const API_URL = process.env.API_URL;
const MODEL_URL = `${API_URL}/api`;

export type DhamPricing = {
    id: number;
    dham_pickup_city_id: number;
    vehicle_id: number;
    price: string;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: string;
    updatedAt: string;
};

export type DhamStop = {
    id: number;
    dham_pickup_city_id: number;
    name: string;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: string;
    updatedAt: string;
};

export type DhamPickupCity = {
    id: number;
    dham_package_id: number;
    name: string;
    days: number;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: string;
    updatedAt: string;
    dham_stops: DhamStop[];
    dham_pricings: DhamPricing[];
};

export type DhamPackage = {
    id: number;
    name: string;
    image: string;
    dham_category_id: number;
    distance: string;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: string;
    updatedAt: string;
    dham_package_routes: any[];
    dham_pickup_cities: DhamPickupCity[];
};

export type DhamCategory = {
    id: number;
    name: string;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: string;
    updatedAt: string;
};


const getDhamCategories = (query: string): Promise<DhamCategory> => {
    return axios
        .get(`${MODEL_URL}/dham_category?${query}`)
        .then((d: AxiosResponse<DhamCategory>) => d.data)
}

const getDhamCategoryById = (id: string): Promise<DhamCategory> => {
    return axios
        .get(`${MODEL_URL}/dham_category/${id}`)
        .then((d: AxiosResponse<DhamCategory>) => d.data)
}

const getDhamPackages = (query: string): Promise<DhamPackage> => {
    return axios
        .get(`${MODEL_URL}/dham_package?${query}`)
        .then((d: AxiosResponse<DhamPackage>) => d.data)
}

const getDhamPackageById = (id: string, query: string): Promise<DhamPackage> => {
    return axios
        .get(`${MODEL_URL}/dham_package/${id}?${query}`)
        .then((d: AxiosResponse<DhamPackage>) => d.data)
}
export { getDhamPackages, getDhamPackageById, getDhamCategories, getDhamCategoryById };
