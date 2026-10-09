import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { APP_CONFIG } from './config';

/**
 * Centralized Axios client instance
 * Automatically attaches JWT token from localStorage to every request
 */
export const apiClient = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  headers: {
    Accept: 'application/json, text/plain, */*',
  },
});

// Request Interceptor: Attach JWT Bearer Token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(APP_CONFIG.TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Global 401 Session Expiry
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login')) {
        // Optional: clear token and redirect if session expired
        // localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Fetch-compatible wrapper for smooth migration to Axios
 * Returns an object with ok, status, statusText, headers, json(), blob(), etc.
 */
export async function fetchApi(endpoint: string, options: any = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  let data = options.body;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      // Keep as string if not JSON
    }
  }

  const config: AxiosRequestConfig = {
    url,
    method,
    data,
    headers: options.headers || {},
    responseType: options.responseType || 'json',
  };

  try {
    const res: AxiosResponse = await apiClient(config);
    return {
      ok: res.status >= 200 && res.status < 300,
      status: res.status,
      statusText: res.statusText,
      headers: {
        get: (headerName: string) => res.headers[headerName.toLowerCase()] || null,
      },
      data: res.data,
      json: async () => res.data,
      blob: async () => {
        if (res.data instanceof Blob) return res.data;
        return new Blob([res.data]);
      },
      text: async () => (typeof res.data === 'string' ? res.data : JSON.stringify(res.data)),
    };
  } catch (err: any) {
    const errorResponse = err.response;
    return {
      ok: false,
      status: errorResponse?.status || 500,
      statusText: errorResponse?.statusText || err.message,
      headers: {
        get: (headerName: string) => errorResponse?.headers?.[headerName.toLowerCase()] || null,
      },
      data: errorResponse?.data,
      json: async () => errorResponse?.data || { message: err.message },
      blob: async () => new Blob([JSON.stringify(errorResponse?.data || {})]),
      text: async () => JSON.stringify(errorResponse?.data || { message: err.message }),
    };
  }
}

export const API_BASE_URL = APP_CONFIG.API_BASE_URL;
