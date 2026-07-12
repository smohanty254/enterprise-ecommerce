/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

// Base API configuration
export const api = axios.create({
  baseURL:
    (window as any)._env_?.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:3000/api',
  withCredentials: true, // Crucial for sending/receiving HttpOnly cookies, especially for authentication purposes
  headers: {
    'Content-Type': 'application/json',
  },
});

// In-memory token storage (Protects against XSS attacks)
let accessToken: string | null = null;
let isRefreshing = false;
let failedQueue: any[] = [];

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

// Process the waiting queue when refresh succeeds or fails
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach access token if present
api.interceptors.request.use(
  (config) => {
    if (accessToken && config.headers) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Handle token expiration and refresh logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop if refresh endpoint itself returns 401
    if (
      (error.response?.status === 401 || error.response?.status === 400) &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      // If a refresh cycle is already running, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        axios
          .post(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true })
          .then((response) => {
            const { token } = response.data;
            setAccessToken(token);

            // Execute all queued requests with the fresh token
            processQueue(null, token);

            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          })
          .catch((refreshError) => {
            processQueue(refreshError, null);
            setAccessToken(null);
            window.dispatchEvent(new Event('auth-expired'));
            reject(refreshError);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }
    return Promise.reject(error);
  },
);
