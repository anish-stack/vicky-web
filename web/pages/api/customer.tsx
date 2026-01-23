import axios, { AxiosResponse } from 'axios'

const API_URL = process.env.API_URL
const MODEL_URL = `${API_URL}/api`

export type User = {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    createdBy?: string | null;
    updatedBy?: string | null;
    createdAt?: string;
    updatedAt?: string;
};

const createCustomer = async (query: User): Promise<User> => {
    const d = await axios
        .post(`${MODEL_URL}/users`, query);
    return d.data;
}

const loginCustomer = async (query: User): Promise<User> => {
    const d = await axios
        .post(`${MODEL_URL}/users/customer-login`, query);
    return d.data;
}

const verifyCustomerDriverByToken = async (token: any): Promise<User> => {
    if (!token) {
        return Promise.reject(new Error('No token found in localStorage'));
    }
    const d = await axios
        .post(
            `${MODEL_URL}/users/verifyTokenCustomerDriver`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
    return d.data;
};

const sendOTP = async (query: any): Promise<any> => {
    const d = await axios
        .post(`${MODEL_URL}/users/send-otp`, query);
    return d.data;
}

const sendOTPForLogin = async (query: any): Promise<any> => {
    const d = await axios
        .post(`${MODEL_URL}/users/send-otp-for-login`, query);
    return d.data;
}

const verifyOTP = async (query: any): Promise<any> => {
    const d = await axios
        .post(`${MODEL_URL}/users/verify-otp`, query);
    return d.data;
}

const createUpdateCustomer = async (query: any): Promise<any> => {
    const d = await axios
        .post(`${MODEL_URL}/users/create-customer`, query);
    return d.data;
}
 const getCustomerDetail = async () => {
    const token = localStorage.getItem('token');
     return axios.get(`${MODEL_URL}/customer/profile`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }).then(res => res.data);
};

 const updateCustomerProfile = async (data: any) => {
    const token = localStorage.getItem('token');
     return axios.put(`${MODEL_URL}/customer/profile`, data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }).then(res => res.data);
  };
export { getCustomerDetail, updateCustomerProfile, createCustomer, loginCustomer, verifyCustomerDriverByToken, sendOTP, verifyOTP, sendOTPForLogin, createUpdateCustomer }