import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
let refreshing = false;
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const orig = err.config;
    if (err.response?.status === 401 && !orig._retry && !refreshing) {
      orig._retry = true;
      refreshing = true;
      try {
        const res = await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });
        const newToken = res.data.data?.accessToken;
        if (newToken) {
          localStorage.setItem('token', newToken);
          orig.headers.Authorization = `Bearer ${newToken}`;
          refreshing = false;
          return api(orig);
        }
      } catch (_) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login';
      }
      refreshing = false;
    }
    return Promise.reject(err);
  }
);

export default api;
