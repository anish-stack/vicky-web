import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 20000,
});

/** Attach the access token kept in memory + sessionStorage. */
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) sessionStorage.setItem("ts_token", token);
    else sessionStorage.removeItem("ts_token");
  }
};

export const getAccessToken = () => {
  if (accessToken) return accessToken;
  if (typeof window !== "undefined") accessToken = sessionStorage.getItem("ts_token");
  return accessToken;
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** One silent refresh attempt on 401, then give up. */
let refreshing: Promise<string | null> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original?._retried) return Promise.reject(error);

    original._retried = true;
    refreshing ||= api
      .post("/auth/refresh")
      .then((r) => {
        const token = r.data?.data?.accessToken || null;
        setAccessToken(token);
        return token;
      })
      .catch(() => {
        setAccessToken(null);
        return null;
      })
      .finally(() => {
        refreshing = null;
      });

    const token = await refreshing;
    if (!token) return Promise.reject(error);

    original.headers.Authorization = `Bearer ${token}`;
    return api(original);
  }
);

/** Unwrap `{ status, message, data, meta }` and normalise errors to a string. */
export async function request<T = any>(
  method: "get" | "post" | "put" | "patch" | "delete",
  url: string,
  payload?: any,
  config?: any
): Promise<{ data: T; meta?: any; message: string }> {
  try {
    const res =
      method === "get" || method === "delete"
        ? await api[method](url, { ...config, params: payload })
        : await api[method](url, payload, config);
    return { data: res.data?.data, meta: res.data?.meta, message: res.data?.message };
  } catch (err: any) {
    const message =
      err?.response?.data?.message || err?.message || "Something went wrong. Please try again.";
    throw new Error(message);
  }
}

/**
 * Server-side fetch used by getStaticProps / getServerSideProps.
 * Never throws — pages render with whatever they got so a slow CMS call
 * can't take the whole page down.
 */
export async function fetchServer<T = any>(path: string, fallback: T = null as T): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, { headers: { Accept: "application/json" } });
    if (!res.ok) return fallback;
    const json = await res.json();
    return (json?.data ?? fallback) as T;
  } catch {
    return fallback;
  }
}
