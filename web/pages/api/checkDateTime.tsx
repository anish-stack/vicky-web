import axios, { AxiosResponse } from 'axios'

const API_URL = process.env.API_URL
const MODEL_URL = `${API_URL}/api`

export type dateTime = {
    pickUpDateTime: string;
    dropDateTime: string;
};

export type dateTimeResponse = {
    status: boolean;
    message: string;
    pickUpDateTime: string;
    dropDateTime: string;
};

const checkTime = (query: dateTime): Promise<dateTime> => {
    return axios
    .post(`${MODEL_URL}/checktime`, query)
    .then((d: AxiosResponse<dateTimeResponse>) => d.data);
}
export { checkTime }