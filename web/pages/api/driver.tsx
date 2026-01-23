import axios, { AxiosResponse } from 'axios'

const API_URL = process.env.API_URL
const MODEL_URL = `${API_URL}/api`

export type User = {
    id?: number;
    name?: string;
    email?: string;
    phone_number?: string;
    image?: any;
    address?: string;
    city?: string;
    pin_code?: string;
    gender?: string;
    password?: string;
    createdBy?: string | null;
    updatedBy?: string | null;
    createdAt?: string;
    updatedAt?: string;
    token?: string;
    adhar_card?: string;
    pan_card?: string;
};

const createDriver = (query: User): Promise<User> => {
    return axios
        .post(`${MODEL_URL}/users`, query)
        .then((d: AxiosResponse<User>) => d.data);
}

const loginDriver = (query: User): Promise<User> => {
    return axios
        .post(`${MODEL_URL}/users/login`, query)
        .then((d: AxiosResponse<User>) => d.data);
}

// const updateDriverById = (id:string, values: User): Promise<User> => {
//     return axios
//         .put(`${MODEL_URL}/users/${id}`, values)
//         .then((d: AxiosResponse<User>) => d.data);
// }

const updateDriverById = (id: string, values: FormData): Promise<User> => {
    return axios
        .put(`${MODEL_URL}/users/${id}`, values, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        .then((d: AxiosResponse<User>) => d.data);
};


export { createDriver, loginDriver, updateDriverById }