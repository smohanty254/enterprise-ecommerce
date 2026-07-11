import axios from 'axios';

// Base API configuration
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api',
  withCredentials: true, // Crucial for sending/receiving HttpOnly cookies, especially for authentication purposes
  headers: {
    'Content-Type': 'application/json',
  },
});

// In-memory token storage (Protects against XSS attacks)
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

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
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        // NestJS endpoint handling refresh cookie and returning a new access toke
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const { token } = response.data;
        setAccessToken(token);

        // Retry original request with new access token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        // Dispatch custom event to redirect to login or clear cache if needed
        window.dispatchEvent(new Event('auth-expired'));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);
