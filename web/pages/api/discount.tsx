import axios, { AxiosResponse } from 'axios'

const API_URL = process.env.API_URL
const MODEL_URL = `${API_URL}/api`

export type Discount = {
    id: number;
    image: string;
    title: string;
    slug: string;
    overall_discount: number;
    apply_overall_discount: boolean;
    apply_citywise_discount: boolean;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: string;
    updatedAt: string;
};

const getDiscount = (query: string): Promise<Discount> => {
    return axios
        .get(`${MODEL_URL}/discount?${query}`)
        .then((d: AxiosResponse<Discount>) => d.data)
}
export { getDiscount }