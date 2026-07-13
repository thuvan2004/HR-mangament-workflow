import axios from 'axios';

// Create central Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Access Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Silent Token Refresh on Expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Guard if 401 code represents expired JWT token and we haven't retried yet
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data.message === 'JWT_EXPIRED' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Post to refresh token endpoint
        const { data } = await axios.post(
  `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh-token`,
  { token: refreshToken }
);

          

        const newAccessToken = data.token;
        localStorage.setItem('token', newAccessToken);

        // Update authorization header and replay request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.warn('[Session Expiry] Refresh token validation failed. Forcing logout...');
        // Clear local credentials and force reload or dispatch event
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.dispatchEvent(new Event('auth-logout'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
