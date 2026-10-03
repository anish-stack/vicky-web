import axios from "axios";

export const API_ORIGIN = (import.meta.env.VITE_API_URL || "https://webapi.taxisafar.com").replace(/\/+$/, "");
export const TOKEN_KEY = "ts_admin_token";

/** The one and only axios instance. Every request in the app goes through it. */
const api = axios.create({ baseURL: `${API_ORIGIN}/api`, timeout: 30000 });

const isUpload = (config) => typeof FormData !== "undefined" && config?.data instanceof FormData;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // image uploads on slow connections need far more than the 30s default
  if (isUpload(config) && (!config.timeout || config.timeout < 180000)) config.timeout = 180000;
  return config;
});

// Unwrap `res.data`; turn `{status:false}` and HTTP errors into a rejected Error with the API message.
api.interceptors.response.use(
  (res) => {
    const body = res.data;
    if (body && typeof body === "object" && body.status === false) {
      const err = new Error(body.message || "Request failed");
      err.body = body;
      return Promise.reject(err);
    }
    return body;
  },
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      (error.code === "ECONNABORTED" ? "Server took too long to respond" : null) ||
      (error.request && !error.response
        ? isUpload(error.config)
          ? "Upload failed: the server dropped the connection. The image is probably too large or the connection is slow. Try a smaller image and save again."
          : "Cannot reach the API server"
        : error.message);
    if (status === 401 || (status === 403 && /token|admin/i.test(message || ""))) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event("auth:logout"));
    }
    const err = new Error(message);
    err.status = status;
    err.body = error.response?.data;
    return Promise.reject(err);
  }
);

export const fileUrl = (folder, name) => (name ? `${API_ORIGIN}/${folder}/${name}` : "");

export default api;
